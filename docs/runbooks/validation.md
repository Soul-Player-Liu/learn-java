# 验证运行手册

本文记录本仓库当前可执行的验证入口。测试分层、质量门禁和覆盖率策略见 [../standards/testing.md](../standards/testing.md)；本文只回答“改完后具体跑什么”。

## 选择原则

- 只改文档：至少跑 `git diff --check` 和 `node scripts/check-doc-links.mjs`。
- 改单端页面或样式：跑对应端的静态检查、单测和构建。
- 改共享包、API wrapper、mock 数据或契约：同时验证 Web、移动端和 SDK drift。
- 改后端业务、SQL、migration 或架构边界：跑后端测试、集成测试和 schema drift。
- 改 CI、脚本、测试基础设施或生成产物：扩大到仓库级验证，优先跑 `./ci.sh`。

## 后端

后端单元测试和架构测试：

```bash
cd backend
../scripts/with-java-17.sh ./mvnw test
```

后端集成测试和覆盖率：

```bash
cd backend
../scripts/with-java-17.sh ./mvnw verify -Pintegration-test,coverage
```

## Web

Web 静态检查、单测和构建：

```bash
cd frontend
npm run check
```

Web mock build 和 Storybook build：

```bash
cd frontend
npm run build:mock
npm run build:storybook
```

Web E2E：

```bash
cd frontend
npm run test:e2e
```

SDK drift check：

```bash
cd frontend
npm run sdk:check
```

## 移动端

移动端类型检查、单测、H5 build 和 H5 mock build：

```bash
cd mobile
npm run check
```

移动端 H5 E2E：

```bash
cd mobile
npm run test:e2e:h5
```

## 生成产物

Schema drift check：

```bash
./scripts/check-schema.sh
```

本地模拟 CI：

```bash
./ci.sh
```

## 文档

Markdown whitespace 检查：

```bash
git diff --check
```

Markdown 链接和锚点检查：

```bash
node scripts/check-doc-links.mjs
```

新增、重命名或删除文档后，应人工检查：

- [../INDEX.md](../INDEX.md) 是否仍然能作为总索引。
- [../../AGENTS.md](../../AGENTS.md) 是否仍然指向正确任务路由。
- [../standards/documentation.md#链接和锚点](../standards/documentation.md#链接和锚点) 中的链接规则是否满足。
