# 测试体系建设规范

本文是一份面向真实工程项目的测试体系规范。当前 `learn-java` 项目是这套规范的可运行示例：后端使用 Spring Boot、Maven、MyBatis、Flyway、MySQL，前端使用 Vue、Vite、TypeScript、Pinia、Vitest、Playwright，CI 使用 GitLab。

真实项目不需要逐字复制本项目代码，但建议复制这里的分层思想、门禁顺序、测试数据隔离方式和覆盖率策略。

## 目标

测试体系的目标不是追求测试数量，而是让团队敢于持续改代码。

一个合格的工程化测试体系应当满足：

- 快速反馈：普通开发可以在本地快速跑单元测试。
- 真实验证：数据库、SQL、迁移脚本、HTTP API、前后端联调用真实环境验证。
- 稳定隔离：测试之间不互相污染数据，不依赖执行顺序。
- 可定位失败：CI job 分层清楚，失败时能直接看出是后端、前端、契约还是 E2E 问题。
- 可追踪质量：JUnit、coverage、Playwright report 等报告要作为 CI artifact 保存。
- 可渐进提高：覆盖率门槛要从核心模块开始，不做全项目一刀切。

## 分层模型

推荐把测试分成五层。

| 层级 | 目标 | 典型工具 | 运行频率 |
| --- | --- | --- | --- |
| 静态检查 | 类型、格式、语法、基础代码规范 | ESLint、Prettier、vue-tsc、Maven compile | 每次提交 |
| 单元测试 | 验证纯业务规则和轻量编排逻辑 | JUnit、AssertJ、Vitest | 本地高频、CI 必跑 |
| 集成测试 | 验证数据库、Mapper、Flyway、Spring 上下文、HTTP API | Failsafe、MyBatis Test、SpringBootTest、真实 MySQL | CI 必跑、本地按需 |
| 契约测试 | 验证后端 OpenAPI 与前端 SDK 一致 | OpenAPI 生成器、SDK drift check | CI 必跑 |
| 端到端测试 | 验证关键用户路径真实可用 | Playwright | CI 必跑，数量克制 |

不要把所有问题都交给 E2E。E2E 昂贵且更容易受 UI 细节影响，应只覆盖最关键的 1 到 5 条业务主链路。

## 后端测试规范

### 命名与分流

后端测试按文件名分流：

- `*Test.java`：单元测试，由 Maven Surefire 执行。
- `*IT.java`：集成测试，由 Maven Failsafe 执行。

本项目示例：

- `LearningTaskTest`：领域对象规则测试。
- `LearningTaskApplicationServiceTest`：应用服务测试，用内存 fake 隔离数据库。
- `LearningTaskMapperIT`：真实 MySQL + MyBatis XML 集成测试。
- `LearningTaskControllerIT`：SpringBootTest + HTTP API + 真实 MySQL 集成测试。

推荐命令：

```bash
cd backend
../scripts/with-java-17.sh ./mvnw test
../scripts/with-java-17.sh ./mvnw verify -Pintegration-test,coverage
```

### 架构测试

架构测试用于把“包之间应该如何依赖”变成可执行门禁。它不验证某个业务结果，而是验证代码结构没有越界。

本项目使用 ArchUnit 编写架构测试，测试文件放在 `backend/src/test/java/com/example/learning/architecture`。这类测试属于 `*Test.java`，由 Maven Surefire 在普通单元测试阶段执行，因此每次本地 `./mvnw test` 和 CI 后端单元测试都会检查。

当前后端按简化 DDD / 六边形架构约束依赖方向：

- `domain` 不依赖 `application`、`infrastructure`、`interfaces`。
- `application` 不依赖 `infrastructure`、`interfaces`，只能通过 port 调用外部能力。
- `interfaces` 不依赖 `infrastructure`，Controller 只调用 application service。
- `infrastructure` 不依赖 `interfaces`，避免不同适配器之间互相引用。

推荐原则：

- 架构规则应少而关键，优先约束分层边界、模块边界和禁止依赖。
- 规则失败时，优先调整依赖方向，而不是随意放宽规则。
- 如果确实需要例外，应在测试里用明确命名的规则或注释说明原因，不要把例外隐藏在业务代码里。
- 真实大项目可以继续扩展规则，例如禁止 Controller 直接访问 Repository、禁止 domain 使用 Spring 注解、限制特定包只能被指定入口调用。

### 单元测试应该覆盖什么

优先给这些代码写单元测试：

- 领域规则：状态流转、金额计算、日期判断、校验规则。
- 应用服务：一个用例是否正确调用仓储、创建活动记录、刷新统计、抛出业务异常。
- 纯函数和转换逻辑：DTO 归一化、枚举映射、参数清洗。

单元测试不应依赖：

- Spring 容器。
- 网络。
- 真实数据库。
- 文件系统共享状态。

### 集成测试应该覆盖什么

集成测试用于验证单元测试无法保证的真实边界：

- Flyway 能否从空库迁移到最新版本。
- MyBatis XML 是否能被正确加载。
- 动态 SQL 的过滤、排序、分页、关联查询是否正确。
- Repository 是否能正确写入和读取多表数据。
- Controller 的 HTTP 状态码、参数校验、错误响应是否正确。
- 真实 MySQL 的字段类型、字符集、唯一约束、外键约束是否符合预期。

本项目保留“真实 MySQL + 临时 schema/database”的方式。真实大项目可以继续使用该方式，也可以升级为 Testcontainers。无论哪种方式，都必须保证测试数据库隔离和自动清理。

### 测试数据管理

推荐规则：

- 每个测试进程或测试类使用独立 schema/database。
- 测试运行前通过 Flyway 初始化结构。
- 每个测试用例只创建自己需要的数据。
- 不依赖上一条测试留下的数据。
- 不使用生产数据快照作为常规测试数据。
- 测试结束后自动删除临时 schema/database。

本项目的 `MysqlTestSchema` 是类似 pytest fixture 的做法：创建随机 schema，通过 `DynamicPropertySource` 注入数据源，测试结束后清理。

## 前端测试规范

### 静态检查

前端静态检查至少包括：

```bash
cd frontend
npm run lint
npm run format:check
npm run typecheck
```

TypeScript 项目里，`typecheck` 是测试体系的一部分。很多接口漂移、空值、字段缺失问题应优先由类型系统发现。

### 单元测试

前端单元测试优先覆盖：

- API wrapper：生成 SDK 返回值是否被正确归一化，缺字段时是否失败。
- Store：加载、刷新、创建、更新、删除后的状态是否正确。
- 复杂组件逻辑：表单校验、筛选条件、状态切换。
- 纯工具函数：日期、金额、权限、展示文案映射。

本项目示例：

- `src/api/tasks.test.ts` 测 API wrapper。
- `src/stores/taskStore.test.ts` 测 Pinia store。

### E2E 测试

E2E 应覆盖真实用户路径，而不是组件内部实现。

推荐覆盖：

- 创建核心业务对象。
- 编辑或状态流转。
- 查询或筛选。
- 详情页查看。
- 删除或撤销。
- 关键异常路径，如表单校验失败、权限不足、重复提交。

E2E locator 规则：

- 优先使用 `getByRole`、`getByLabel`、`getByPlaceholder`、可见文本。
- 对复杂组件库控件使用稳定的 `data-testid`。
- 避免依赖 `.el-dialog`、`.el-select`、`.ant-table` 这类组件库内部 CSS 结构。
- 不用 `nth(2)` 定位业务含义明确的控件，除非没有更稳定选择。

本项目示例中，任务表单和标签筛选使用 `data-testid`，避免 Playwright 直接绑定 Element Plus 内部 DOM。

### Storybook

Storybook 至少应作为 build gate：

```bash
cd frontend
npm run build:storybook
```

这能验证 stories、mock 数据、组件依赖和构建配置没有明显损坏。

真实项目后续可以增加：

- Storybook interaction test：在 story 的 `play` 函数里模拟点击和输入。
- 视觉回归：对关键组件状态截图，比对 UI 是否意外变化。

这两类测试价值高，但维护成本也高，建议在基础单元测试、集成测试、E2E 稳定后再引入。

### Frontend Mock

前端 mock 体系用于让产品经理、设计师和前端开发在不依赖后端的情况下稳定查看页面状态。它应当和 Storybook 配合使用，但不替代真实后端联调和 E2E。

本项目的详细规范见 `FRONTEND_MOCK_STANDARD.md`。核心原则：

- mock 放在 HTTP 边界，页面仍然走 Router、Store、API wrapper 和生成 SDK。
- dev mock 和 Storybook 复用同一套 MSW handlers。
- handlers 按业务域拆分，避免单文件演变成难维护的小后端。
- mock 数据使用生成 DTO 类型，降低接口契约漂移风险。
- CI 至少验证 `build:mock` 和 `build:storybook`。

## 契约测试

前后端分离项目必须防止接口契约漂移。

推荐做法：

- 后端暴露 OpenAPI。
- 前端从 OpenAPI 生成 SDK。
- CI 重新生成 SDK，并检查生成目录是否出现 diff。
- 手写 API wrapper 不直接散落在页面里，统一封装生成 SDK 的返回值和异常。

本项目示例：

```bash
cd frontend
npm run sdk:check
```

如果 `sdk:check` 失败，通常表示后端接口变了但前端生成代码没有提交，或者手写类型和后端契约已经不一致。

## 覆盖率策略

覆盖率门槛应分层设置，不建议全项目一刀切。

推荐策略：

- 全局门槛低一些，用于防止测试体系整体倒退。
- 核心业务包门槛高一些，例如领域模型、业务服务、关键 store、API wrapper。
- DTO、配置类、启动类、生成代码、简单 request/response 对象可以排除。
- 初期先生成报告，稳定后再逐步提高门槛。
- 门槛应服务于业务风险，不服务于数字好看。

本项目当前策略：

- 后端使用 JaCoCo，按全局、`domain/model`、`application`、`infrastructure/interfaces` 分层。
- 前端使用 Vitest V8 coverage，只对当前已有单元测试形态的 API wrapper 和 store 设门槛。
- CI 上传 JaCoCo XML、Cobertura XML、HTML 报告。

真实项目可以参考这个起步值：

| 区域 | 初始建议 |
| --- | --- |
| 全局后端 | 50% 到 60% |
| 核心领域/规则 | 75% 到 85% |
| 应用服务 | 65% 到 80% |
| Mapper/Controller | 以集成测试覆盖主路径和异常路径为主 |
| 前端 API wrapper/store | 80% 以上 |
| 页面组件 | 先覆盖复杂交互，不强行全量纳入 |

## CI 门禁规范

GitLab CI 推荐拆成这些 job：

- `backend_unit`：后端单元测试，上传 Surefire JUnit。
- `backend_integration`：真实数据库集成测试，上传 Failsafe JUnit 和 JaCoCo。
- `frontend_check`：lint、format、typecheck、Vitest、build、coverage、Storybook build。
- `sdk_check`：启动后端，重新生成前端 SDK，检查生成代码是否漂移。
- `e2e`：启动真实前后端和测试数据库，跑 Playwright，上传 report 和 trace。

拆分 job 的好处：

- 可以并行。
- 失败定位清楚。
- 报告能在 GitLab 页面展示。
- 慢测试不会阻塞快速反馈。

本地仍应保留一个总入口脚本，例如本项目的：

```bash
DEV_JAVA_HOME=/path/to/java17 ./ci.sh
```

本地总入口用于模拟 CI，不替代 GitLab CI。

## Java 与运行环境

不要在脚本里写死某台机器的 JDK 路径。

推荐做法：

- CI 使用固定 Java 17 镜像。
- 本地通过 `JAVA_HOME` 或 `DEV_JAVA_HOME` 指向 Java 17。
- 脚本只检查 Java 主版本，不猜测本机安装路径。

本项目示例：

```bash
../scripts/with-java-17.sh ./mvnw test
```

这类脚本的职责是“校验环境并执行命令”，不是替团队安装 JDK。

## 什么时候必须补测试

以下改动必须补测试：

- 新增业务规则。
- 修改状态机或流程分支。
- 修改金额、日期、权限、幂等、重试逻辑。
- 修改 SQL、Mapper XML、表结构迁移。
- 修改 API 请求/响应字段。
- 修复线上 bug。
- 修改前端 store、API wrapper 或关键用户路径。
- 调整 CI、构建、SDK 生成、测试基础设施。

以下改动可以只跑现有测试，不一定新增测试：

- 文案小改。
- 样式微调。
- 无业务含义的重命名。
- 明确无行为变化的格式化。

## 测试评审清单

提交代码前，至少检查：

- 新增逻辑是否有对应测试层级。
- 单元测试是否没有依赖真实数据库。
- 集成测试是否使用隔离数据库。
- E2E 是否只覆盖关键路径，没有过度测试 UI 细节。
- Playwright selector 是否稳定。
- OpenAPI/SDK 是否同步。
- 覆盖率门槛是否合理，不靠排除真实业务代码来过关。
- CI 是否上传报告和失败排查产物。
- 本地 `ci.sh` 或等价命令是否能通过。

## 推荐落地顺序

新项目可以按下面顺序搭建：

1. 先建立单元测试和静态检查。
2. 加真实数据库集成测试和迁移脚本验证。
3. 加前端 API wrapper/store 测试。
4. 加 OpenAPI SDK 生成和漂移检查。
5. 加 1 条最关键 E2E 主流程。
6. 加覆盖率报告，先不设严苛门槛。
7. 把门槛按核心模块逐步提高。
8. 加 GitLab CI artifact、JUnit、coverage、Playwright report。
9. 业务复杂后再考虑 Storybook interaction test 和视觉回归。

测试体系应该随着业务复杂度增长，而不是一次性堆满工具。先保证每一层都能稳定跑通，再逐步提高要求。
