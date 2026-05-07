# learn-java

`learn-java` 是一个用来沉淀大型业务项目工程规范的全栈 Monorepo 范本。它的业务功能刻意保持克制，但后端、Web、移动端、共享包、契约生成、mock、测试、CI 和文档体系都按真实项目的可扩展方向建设。

当前示例主题是“学习任务管理器”：

- 后端：Spring Boot 3.5.14 + Java 17 + Maven + MyBatis + Flyway + MySQL。
- Web：Vue 3 + Vite + TypeScript + Element Plus + Vue Router + Pinia。
- 移动端：uni-app + Vue 3 + TypeScript + Pinia + Wot Design Uni，uni-ui 作为补充组件库。
- 共享包：OpenAPI SDK、API wrapper、领域类型、跨端 use cases、mock 数据。
- 质量门禁：单元测试、真实 MySQL 集成测试、架构测试、SDK drift check、Storybook build、Web E2E、移动端 H5 E2E。

## 文档入口

本仓库采用“短入口 + 文档地图 + 标准层 + 可执行证据”的文档结构。日常只需要从两个入口开始：

- [docs/INDEX.md](docs/INDEX.md)：文档总地图，按阅读顺序、主题和改动类型索引所有文档。
- [AGENTS.md](AGENTS.md)：给智能体和新接手工程师的工作导航，说明任务路由、边界和联动更新规则。

架构、测试、mock、Monorepo 和文档标准都由 [docs/INDEX.md](docs/INDEX.md) 继续指向。`docs/standards/` 下的文档是给后续大项目复用的规范模板，不是说每个项目都必须机械维护同名文件。

## 仓库结构

```text
.
├── backend/              # Java 后端，业务规则、数据库、HTTP API、OpenAPI
├── frontend/             # Vue Web 客户端
├── mobile/               # uni-app 移动端客户端
├── packages/             # 跨端共享 API、领域类型、use cases、mock 数据
├── scripts/              # 跨模块脚本
├── docs/                 # 文档地图、架构说明、标准模板和生成产物
├── docker-compose.yml    # 本地 MySQL
└── ci.sh                 # 本地模拟 CI 的总入口
```

## 快速启动

启动 MySQL：

```bash
docker compose up -d mysql
```

启动后端：

```bash
cd backend
../scripts/with-java-17.sh ./mvnw spring-boot:run
```

启动 Web：

```bash
cd frontend
npm install
npm run dev
```

启动移动端 H5：

```bash
cd mobile
npm install
npm run dev:h5
```

不启动后端时，可以分别使用 Web 和移动端 mock mode：

```bash
cd frontend
npm run dev:mock

cd ../mobile
npm run dev:h5:mock
```

根目录也提供幂等启动/停止脚本。脚本只管理应用进程，不管理 MySQL：

```bash
./start-dev.sh
./stop-dev.sh
```

## 常用验证

仓库级验证入口：

```bash
./scripts/check-schema.sh
./ci.sh
```

后端、Web、移动端和专项验证命令见 [docs/INDEX.md#验证入口](docs/INDEX.md#验证入口) 与 [docs/standards/testing.md](docs/standards/testing.md)。

## 契约生成

先启动后端，再生成前端 SDK：

```bash
cd frontend
npm run generate:sdk
```

生成目录是 `packages/task-api/src/generated/`。端侧业务代码应依赖 `packages/task-api` 的手写 wrapper，而不是把生成 SDK 调用散落在页面里。
