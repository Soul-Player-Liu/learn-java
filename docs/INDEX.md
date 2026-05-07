# 文档地图

本仓库的文档目标不是把所有知识写成长篇手册，而是形成一套可执行、可验证、可迁移的工程记录系统。文档应回答三个问题：

- 当前项目怎么运行和验证。
- 这个仓库作为大型 Monorepo 范本，沉淀了哪些工程标准。
- 这些标准分别由哪些代码、脚本、CI job 或测试用例证明。

## 阅读顺序

新接手工程师或智能体建议按这个顺序阅读：

1. 根目录 [README.md](../README.md)：项目定位、启动和验证入口。
2. 根目录 [AGENTS.md](../AGENTS.md)：智能体和新接手工程师的工作路线。
3. [ARCHITECTURE.md](ARCHITECTURE.md)：后端、Web、移动端、共享包的边界。
4. 按任务阅读下面的 [任务到文档映射](#任务到文档映射)。

## 文档分层

| 层级 | 文件 | 职责 | 不负责 |
| --- | --- | --- | --- |
| 入口 | [README.md](../README.md) | 说明仓库是什么、如何最快启动、从哪里进入文档地图。 | 长篇规范、完整测试说明、历史决策。 |
| 导航 | [AGENTS.md](../AGENTS.md) | 给智能体和新接手工程师的任务路由、边界提醒和验证策略。 | 复制全部命令、讲解全部标准细节。 |
| 总索引 | [docs/INDEX.md](INDEX.md) | 维护文档分层、任务到文档映射、验证入口和扩展位置。 | 承载某个专项的完整规范。 |
| 架构记录 | [docs/ARCHITECTURE.md](ARCHITECTURE.md) | 记录本仓库当前架构事实、模块职责、依赖方向、契约流和 mock 流。 | 可迁移方法论、完整测试命令。 |
| 标准模板 | [docs/standards/*.md](standards/) | 面向后续大项目复用的规范和评审清单。 | 本仓库运行手册、不可验证的口号。 |
| 生成证据 | [docs/schema/current.sql](schema/current.sql) | 由脚本生成，可被 CI 检查漂移的数据库结构快照。 | 手工维护业务解释。 |

## 任务到文档映射

做改动前先按任务类型读对应文档；做完后同步更新同一行的联动文档。

| 改动类型 | 必读文档 | 联动更新和证据 |
| --- | --- | --- |
| 仓库定位、启动方式、目录入口 | [README.md](../README.md)、[standards/documentation.md#readme-标准](standards/documentation.md#readme-标准) | [AGENTS.md](../AGENTS.md)、本文件的阅读顺序和验证入口。 |
| 模块边界、共享包、跨端复用 | [ARCHITECTURE.md](ARCHITECTURE.md)、[standards/monorepo.md](standards/monorepo.md) | 相关 `packages/` 说明、架构图、任务路由。 |
| 后端分层、依赖方向、端口适配 | [ARCHITECTURE.md#后端边界](ARCHITECTURE.md#后端边界)、[standards/testing.md#架构测试](standards/testing.md#架构测试) | ArchUnit 规则和后端测试命令。 |
| OpenAPI、生成 SDK、端侧 API wrapper | [ARCHITECTURE.md#契约流](ARCHITECTURE.md#契约流)、[standards/monorepo.md#契约标准](standards/monorepo.md#契约标准)、[standards/testing.md#契约和-schema](standards/testing.md#契约和-schema) | `packages/task-api/src/generated/`、`frontend npm run sdk:check`、CI `sdk_check`。 |
| Flyway migration、数据库结构、schema drift | [standards/testing.md#契约和-schema](standards/testing.md#契约和-schema) | [schema/current.sql](schema/current.sql)、`scripts/generate-schema.sh`、`scripts/check-schema.sh`、CI `schema_check`。 |
| 后端测试、覆盖率、CI job | [standards/testing.md](standards/testing.md) | `backend/pom.xml`、`ci.sh`、`.gitlab-ci.yml`、测试报告 artifact。 |
| 后端外部依赖替换 | [standards/backend-mock.md](standards/backend-mock.md)、[standards/testing.md#后端测试](standards/testing.md#后端测试) | 测试支持配置、应用端口、集成测试断言。 |
| Web mock、MSW、Storybook、离线预览 | [standards/mock.md#web-mock](standards/mock.md#web-mock)、[standards/mock.md#storybook](standards/mock.md#storybook) | Web handlers、stories、`build:mock`、`build:storybook`、相关 E2E。 |
| 移动端 mock、H5 构建、H5 E2E | [standards/mock.md#移动端-mock](standards/mock.md#移动端-mock)、[standards/testing.md#移动端测试](standards/testing.md#移动端测试) | `packages/mock-data`、移动端 mock API、`test:e2e:h5`、CI `mobile_check`。 |
| 文档新增、拆分、重命名、锚点链接 | [standards/documentation.md](standards/documentation.md)、[standards/documentation.md#链接和锚点](standards/documentation.md#链接和锚点) | 本文件、[AGENTS.md](../AGENTS.md)、所有受影响的反向链接。 |

## 文档原则

文档应遵循这些原则：

- 短入口：README 只保留定位、启动、验证和文档地图。
- 单一职责：架构、测试、mock、Monorepo 标准分开写，避免一处文档包办全部内容。
- 可验证：标准中出现的关键要求应能找到对应脚本、测试、CI job 或生成产物。
- 有边界：标准文档是模板和方法论，不把示例项目的临时选择包装成所有项目的硬性规定。
- 少重复：命令只在入口和对应标准中保留必要版本，长解释放到 `docs/`。
- 随代码演进：改了脚本、端口、CI、mock、测试、目录边界，应同步更新相关文档。

## 验证入口

按改动范围选择验证。更完整的分层解释见 [standards/testing.md](standards/testing.md)。

| 范围 | 命令 |
| --- | --- |
| 后端单元测试和架构测试 | `cd backend && ../scripts/with-java-17.sh ./mvnw test` |
| 后端集成测试和覆盖率 | `cd backend && ../scripts/with-java-17.sh ./mvnw verify -Pintegration-test,coverage` |
| Web 静态检查、单测和构建 | `cd frontend && npm run check` |
| Web mock build | `cd frontend && npm run build:mock` |
| Storybook build | `cd frontend && npm run build:storybook` |
| Web E2E | `cd frontend && npm run test:e2e` |
| 移动端检查 | `cd mobile && npm run check` |
| 移动端 H5 E2E | `cd mobile && npm run test:e2e:h5` |
| SDK drift check | `cd frontend && npm run sdk:check` |
| Schema drift check | `./scripts/check-schema.sh` |
| 本地模拟 CI | `./ci.sh` |

## Harness Engineering 的落地方式

本文档体系借鉴 harness engineering 的核心思路：把仓库当作一个能驱动开发、评测和回归的记录系统，而不是静态说明书。

落到本仓库时，含义是：

- 需求和规范要能转化为脚本、测试、mock 场景或 CI job。
- 文档不只描述“应该怎样”，还要指向“当前怎样验证”。
- E2E、SDK drift check、schema drift check、mock build、Storybook build 都是 harness 的一部分。
- 智能体或新工程师应通过文档地图找到入口，再通过测试和脚本确认修改是否正确。

## 后续扩展

如果这个范本继续扩大，可以在 `docs/` 下增加：

- `docs/decisions/`：ADR，记录不可逆或高成本工程决策。
- `docs/runbooks/`：本地开发、CI 失败、数据库漂移等操作手册。
- `docs/business/`：真实业务流程、状态机、关键表和术语。
- `docs/harness/`：更系统的评测用例、agent task、回归清单和质量基准。

这些目录按需引入，不要求所有项目一开始就齐全。
