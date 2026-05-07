# Agent 工作指南

本仓库是后端、Web、移动端 Monorepo 工程规范范本。处理任务时，先把它当作大型项目的缩小版，而不是简单 demo。

## 首读路线

1. [README.md](README.md)：确认项目定位和最短启动路径。
2. [docs/INDEX.md](docs/INDEX.md)：确认文档地图、任务路由和验证入口。
3. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)：确认后端、Web、移动端和共享包边界。
4. 按任务进入 [docs/INDEX.md#任务到文档映射](docs/INDEX.md#任务到文档映射) 指向的专项文档。

## 修改原则

- 保持后端、Web、移动端边界清晰。
- 端侧代码不要直接散用生成 SDK，应通过 `packages/task-api` wrapper。
- 跨端共享逻辑优先放在 `packages/task-domain`、`packages/task-api` 或 `packages/mock-data`。
- 不把 Web UI 强行复用到移动端，也不把移动端平台 API 放进共享包。
- 改脚本、CI、mock、测试、端口或目录结构时，同步更新 `docs/` 中对应文档。
- 标准文档写成可迁移规范，不要把本示例的临时选择写成所有项目的硬性要求。

## 任务路由

| 任务类型 | 必读文档 | 联动更新 |
| --- | --- | --- |
| 模块边界、共享包、跨端复用 | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)、[docs/standards/monorepo.md](docs/standards/monorepo.md) | README 或架构图涉及的入口说明 |
| 后端测试、集成测试、覆盖率、CI | [docs/standards/testing.md](docs/standards/testing.md) | `ci.sh`、`.gitlab-ci.yml`、相关测试说明 |
| 后端外部系统替换 | [docs/standards/backend-mock.md](docs/standards/backend-mock.md) | [docs/standards/testing.md#后端测试](docs/standards/testing.md#后端测试) |
| Web/移动端 mock、Storybook、离线预览 | [docs/standards/mock.md](docs/standards/mock.md) | [docs/standards/testing.md#web-测试](docs/standards/testing.md#web-测试)、[docs/standards/testing.md#移动端测试](docs/standards/testing.md#移动端测试) |
| OpenAPI SDK、schema drift、生成产物 | [docs/ARCHITECTURE.md#契约流](docs/ARCHITECTURE.md#契约流)、[docs/standards/testing.md#契约和-schema](docs/standards/testing.md#契约和-schema) | [docs/schema/current.sql](docs/schema/current.sql)、生成 SDK、CI drift check |
| 文档结构、重命名、索引关系 | [docs/standards/documentation.md](docs/standards/documentation.md)、[docs/INDEX.md](docs/INDEX.md) | 所有受影响的入口链接和反向引用 |

更完整的路由表见 [docs/INDEX.md#任务到文档映射](docs/INDEX.md#任务到文档映射)。

## 验证策略

根据改动范围选择验证，不需要每次都跑全部命令。涉及共享包、契约、CI、测试基础设施、mock 或 schema 时，应扩大验证范围。

常用入口：

```bash
./scripts/check-schema.sh
./ci.sh
```

分层命令见 [docs/INDEX.md#验证入口](docs/INDEX.md#验证入口) 和 [docs/standards/testing.md](docs/standards/testing.md)。
