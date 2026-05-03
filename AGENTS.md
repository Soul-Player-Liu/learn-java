# Agent 工作指南

本仓库是后端、Web、移动端 Monorepo 工程规范范本。处理任务时，先把它当作大型项目的缩小版，而不是简单 demo。

## 首读路线

1. `README.md`：确认项目定位、启动和常用验证。
2. `docs/INDEX.md`：确认文档体系和标准文档位置。
3. `docs/ARCHITECTURE.md`：确认模块边界。
4. `docs/standards/`：按任务读取 Monorepo、测试或 mock 标准。

## 修改原则

- 保持后端、Web、移动端边界清晰。
- 端侧代码不要直接散用生成 SDK，应通过 `packages/task-api` wrapper。
- 跨端共享逻辑优先放在 `packages/task-domain`、`packages/task-api` 或 `packages/mock-data`。
- 不把 Web UI 强行复用到移动端，也不把移动端平台 API 放进共享包。
- 改脚本、CI、mock、测试、端口或目录结构时，同步更新 `docs/` 中对应文档。
- 标准文档写成可迁移规范，不要把本示例的临时选择写成所有项目的硬性要求。

## 常用验证

后端：

```bash
cd backend
../scripts/with-java-17.sh ./mvnw test
../scripts/with-java-17.sh ./mvnw verify -Pintegration-test,coverage
```

Web：

```bash
cd frontend
npm run check
npm run build:mock
npm run build:storybook
npm run test:e2e
```

移动端：

```bash
cd mobile
npm run check
npm run test:e2e:h5
```

仓库级：

```bash
./scripts/check-schema.sh
./ci.sh
```

根据改动范围选择验证，不需要每次都跑全部命令；但涉及共享包、契约、CI 或测试基础设施时，应扩大验证范围。
