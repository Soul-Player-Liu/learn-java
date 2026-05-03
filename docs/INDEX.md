# 文档地图

本仓库的文档目标不是把所有知识写成长篇手册，而是形成一套可执行、可验证、可迁移的工程记录系统。文档应回答三个问题：

- 当前项目怎么运行和验证。
- 这个仓库作为大型 Monorepo 范本，沉淀了哪些工程标准。
- 这些标准分别由哪些代码、脚本、CI job 或测试用例证明。

## 阅读顺序

新接手工程师或智能体建议按这个顺序阅读：

1. 根目录 [README.md](../README.md)：项目定位、启动、常用验证。
2. [ARCHITECTURE.md](ARCHITECTURE.md)：后端、Web、移动端、共享包的边界。
3. [standards/monorepo.md](standards/monorepo.md)：Monorepo 建设标准。
4. [standards/testing.md](standards/testing.md)：测试和质量门禁标准。
5. [standards/mock.md](standards/mock.md)：mock、离线预览和场景数据标准。
6. [standards/documentation.md](standards/documentation.md)：文档体系标准。
7. [schema/current.sql](schema/current.sql)：由迁移脚本生成的当前数据库结构快照。

## 文档分层

| 层级 | 文件 | 职责 |
| --- | --- | --- |
| 入口 | `README.md` | 说明仓库定位、目录、启动和常用验证，不承载长篇规范。 |
| 导航 | `AGENTS.md` | 给智能体和新接手工程师的工作路线、边界和验证命令。 |
| 架构记录 | `docs/ARCHITECTURE.md` | 记录本仓库当前架构决策、模块职责和可执行证据。 |
| 标准模板 | `docs/standards/*.md` | 面向后续大项目复用的规范，不等同于本项目必须维护的全部文档清单。 |
| 生成证据 | `docs/schema/current.sql` | 由脚本生成，可被 CI 检查漂移。 |

## 文档原则

文档应遵循这些原则：

- 短入口：README 只保留定位、启动、验证和文档地图。
- 单一职责：架构、测试、mock、Monorepo 标准分开写，避免一处文档包办全部内容。
- 可验证：标准中出现的关键要求应能找到对应脚本、测试、CI job 或生成产物。
- 有边界：标准文档是模板和方法论，不把示例项目的临时选择包装成所有项目的硬性规定。
- 少重复：命令只在入口和对应标准中保留必要版本，长解释放到 `docs/`。
- 随代码演进：改了脚本、端口、CI、mock、测试、目录边界，应同步更新相关文档。

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
