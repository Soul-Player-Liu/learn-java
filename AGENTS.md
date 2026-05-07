# Agent 工作指南

本仓库是后端、Web、移动端 Monorepo 工程规范范本。处理任务时，先把它当作大型项目的缩小版，而不是简单 demo。

## 首读路线

1. [README.md](README.md)：确认项目定位和最短启动路径。
2. [docs/INDEX.md](docs/INDEX.md)：确认文档地图和任务路由。
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

完整任务路由只维护在 [docs/INDEX.md#任务到文档映射](docs/INDEX.md#任务到文档映射)。不要在本文件复制第二份表，避免两处漂移。

高风险提醒：

- 改共享包、生成 SDK 或 API wrapper 时，同时考虑 Web 和移动端。
- 改测试、CI、mock、端口、脚本或文档结构时，同步更新 [docs/INDEX.md](docs/INDEX.md) 指向的相关文档。
- 标准文档写成可迁移规范；本仓库当前命令和排障步骤放到 [docs/runbooks/](docs/runbooks/)。

## 验证策略

根据改动范围选择验证，不需要每次都跑全部命令。涉及共享包、契约、CI、测试基础设施、mock 或 schema 时，应扩大验证范围。

常用入口：

```bash
./scripts/check-schema.sh
./ci.sh
```

分层命令见 [docs/runbooks/validation.md](docs/runbooks/validation.md)，测试标准见 [docs/standards/testing.md](docs/standards/testing.md)。
