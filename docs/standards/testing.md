# 测试体系标准

本文是给大型业务项目复用的测试体系标准。`learn-java` 是可运行示例：后端有单元测试、架构测试、真实 MySQL 集成测试和覆盖率门槛；Web 有 lint、format、typecheck、Vitest、Storybook、Playwright；移动端有 typecheck、Vitest、H5 build、mock H5 build 和 H5 E2E。

测试体系的目标不是堆数量，而是把关键行为变成可重复执行的 harness，让团队和智能体都能用同一套证据判断修改是否正确。

## 分层模型

| 层级 | 目标 | 典型工具 | 运行频率 |
| --- | --- | --- | --- |
| 静态检查 | 类型、格式、语法、基础规范 | ESLint、Prettier、vue-tsc、Maven compile | 每次提交 |
| 单元测试 | 领域规则和轻量编排 | JUnit、AssertJ、Vitest | 本地高频、CI 必跑 |
| 架构测试 | 包依赖和模块边界 | ArchUnit 或等价工具 | CI 必跑 |
| 集成测试 | 数据库、迁移、Mapper、Controller | Failsafe、SpringBootTest、真实 MySQL | CI 必跑、本地按需 |
| 契约测试 | OpenAPI 与 SDK 一致 | SDK drift check | CI 必跑 |
| 端到端测试 | 关键用户路径真实可用 | Playwright | CI 必跑、数量克制 |

不要把所有问题都交给 E2E。E2E 昂贵且容易受 UI 细节影响，应覆盖关键主链路；业务分支尽量下沉到单元、集成和契约测试。

## 后端测试

命名分流：

- `*Test.java`：单元测试和架构测试，由 Surefire 执行。
- `*IT.java`：集成测试，由 Failsafe 执行。

推荐命令：

```bash
cd backend
../scripts/with-java-17.sh ./mvnw test
../scripts/with-java-17.sh ./mvnw verify -Pintegration-test,coverage
```

单元测试优先覆盖：

- 状态流转、金额计算、日期判断、校验规则。
- 应用服务对仓储、活动记录、异常分支的编排。
- DTO 归一化、枚举映射、参数清洗等纯函数。

集成测试优先覆盖：

- Flyway 从空库迁移到最新版本。
- MyBatis XML 加载和动态 SQL。
- Repository 多表读写。
- Controller HTTP 状态码、参数校验和错误响应。
- 真实 MySQL 字段类型、字符集、唯一约束和外键约束。

测试数据规则：

- 每个测试进程或测试类使用独立 schema/database。
- 测试运行前通过 migration 初始化结构。
- 每个测试用例创建自己需要的数据。
- 不依赖执行顺序。
- 不使用生产数据快照作为常规测试数据。
- 测试结束后自动清理。

## 架构测试

架构测试把“包之间应该如何依赖”变成可执行门禁。

本仓库后端当前约束：

- `domain` 不依赖 `application`、`infrastructure`、`interfaces`。
- `application` 不依赖 `infrastructure`、`interfaces`。
- `interfaces` 不依赖 `infrastructure`。
- `infrastructure` 不依赖 `interfaces`。

真实项目可以继续扩展：

- 禁止 Controller 直接访问 Repository。
- 禁止 domain 使用 Spring 注解。
- 限制特定包只能被指定入口调用。
- 禁止跨业务域绕过 application service。

规则应少而关键。失败时优先修正依赖方向，而不是随意放宽测试。

## Web 测试

Web 静态检查：

```bash
cd frontend
npm run lint
npm run format:check
npm run typecheck
```

Web 单元测试优先覆盖：

- API wrapper 的返回值归一化和异常处理。
- Pinia store 的加载、刷新、创建、更新、删除。
- 复杂表单和筛选逻辑。
- 日期、金额、权限、展示文案映射等纯函数。

Storybook 至少作为 build gate：

```bash
cd frontend
npm run build:storybook
```

Web E2E 应覆盖真实用户路径：

- 创建核心业务对象。
- 编辑或状态流转。
- 查询、筛选、分页。
- 详情页查看。
- 删除或撤销。
- 关键异常路径。

定位规则：

- 优先使用 `getByRole`、`getByLabel`、`getByPlaceholder`、可见文本。
- 复杂组件使用稳定 `data-testid`。
- 避免绑定组件库内部 class。
- 避免用没有业务语义的 `nth()` 定位。

## 移动端测试

移动端是独立客户端，不能只靠 Web 的 mobile viewport 兜底。

推荐命令：

```bash
cd mobile
npm run typecheck
npm run test:unit
npm run build:h5
npm run build:h5:mock
npm run test:e2e:h5
```

本仓库中：

- `npm run check` 覆盖类型检查、store 单测、真实 H5 构建和 mock H5 构建。
- `npm run test:e2e:h5` 启动 uni-app H5 mock mode，在 Chromium 和 WebKit 的移动设备视口下覆盖概览、任务筛选、详情状态变更和项目页。

真实项目如果要覆盖小程序或 App，应先明确平台 appid、发行配置、密钥管理和 CI 运行环境，再加入平台构建 smoke。

## 契约和 Schema

契约测试：

```bash
cd frontend
npm run sdk:check
```

如果失败，通常表示后端 OpenAPI 已变化但生成 SDK 没有提交，或手写类型和后端契约不一致。

Schema 漂移检查：

```bash
./scripts/check-schema.sh
```

它用于确认 migration 生成的 `docs/schema/current.sql` 与仓库记录一致。

## 覆盖率策略

覆盖率门槛应分层设置：

- 全局门槛低一些，用于防止整体倒退。
- 核心领域、业务服务、关键 store、API wrapper 门槛高一些。
- DTO、配置类、启动类、生成代码和简单 request/response 可以排除。
- 初期先生成报告，稳定后逐步提高门槛。
- 门槛服务于业务风险，不服务于数字好看。

参考起步值：

| 区域 | 初始建议 |
| --- | --- |
| 全局后端 | 50% 到 60% |
| 核心领域/规则 | 75% 到 85% |
| 应用服务 | 65% 到 80% |
| Mapper/Controller | 以集成测试覆盖主路径和异常路径为主 |
| 前端 API wrapper/store | 80% 以上 |
| 页面组件 | 优先覆盖复杂交互，不强行全量纳入 |

## CI 标准

推荐 job：

- `backend_unit`：后端单元测试和架构测试。
- `backend_integration`：真实数据库集成测试和后端覆盖率。
- `frontend_check`：lint、format、typecheck、Vitest、build、coverage、Storybook build。
- `mobile_check`：移动端 typecheck、store 单测、H5 build、mock H5 build、H5 E2E。
- `sdk_check`：OpenAPI SDK drift check。
- `schema_check`：数据库 schema drift check。
- `e2e`：真实前后端 Web E2E。

CI 必须上传机器可读报告和排查产物，例如 JUnit、coverage XML、Playwright report、trace、后端启动日志。

## 必须补测试的改动

以下改动必须补测试或扩展现有测试：

- 新增业务规则。
- 修改状态机或流程分支。
- 修改金额、日期、权限、幂等、重试逻辑。
- 修改 SQL、Mapper XML、migration。
- 修改 API 请求/响应字段。
- 修复线上 bug。
- 修改 store、API wrapper 或关键用户路径。
- 调整 CI、构建、SDK 生成、测试基础设施。

以下改动通常可以只跑现有测试：

- 文案小改。
- 样式微调。
- 无业务含义重命名。
- 明确无行为变化的格式化。

## 评审清单

提交前检查：

- 新增逻辑是否有对应测试层级。
- 单元测试是否没有依赖真实数据库。
- 集成测试是否使用隔离数据库。
- E2E 是否覆盖关键路径但不过度绑定 UI 细节。
- Playwright selector 是否稳定。
- OpenAPI/SDK 是否同步。
- schema 快照是否同步。
- 覆盖率门槛是否合理。
- CI 是否上传报告和失败排查产物。

## 落地顺序

1. 建立静态检查和单元测试。
2. 加真实数据库集成测试和 migration 验证。
3. 加架构测试。
4. 加前端 API wrapper/store 测试。
5. 加 OpenAPI SDK 生成和漂移检查。
6. 加 1 条最关键 E2E 主流程。
7. 加覆盖率报告，先不设过高门槛。
8. 加 mock build 和 Storybook build。
9. 加移动端独立检查和 H5 E2E。
10. 拆分 CI job 并上传 artifact。

测试体系应随着业务复杂度增长，但每一层都应尽早跑通。
