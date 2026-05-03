# 架构说明

`learn-java` 是一个全栈 Monorepo 范本。业务主题很小，但工程边界按后续大型项目建设：后端负责业务真相，Web 和移动端是并列客户端，`packages/` 承载跨端稳定能力，测试和 CI 把关键契约变成可执行门禁。

## 模块边界

```text
backend  -> OpenAPI / HTTP API -> packages/task-api -> frontend
                                      |
                                      └──────────────> mobile

packages/task-domain  -> 领域类型、状态文案、归一化、轻量校验
packages/mock-data    -> 跨端 mock 场景数据和统计计算
```

模块职责：

- `backend/`：业务规则、状态流转、数据库事务、Flyway migration、MyBatis SQL、REST API、OpenAPI。
- `frontend/`：Web 路由、Element Plus 页面、Pinia store、MSW、Storybook、Web E2E。
- `mobile/`：uni-app 页面、Wot Design Uni 组件、uni-ui 补充组件、移动端生命周期、平台 API、H5 构建、H5 mock、移动端 E2E。
- `packages/task-api/`：生成 SDK、平台无关 API interface、Web fetch client、uni request client、共享 mock API、跨端 use cases。
- `packages/task-domain/`：从接口 DTO 派生的业务类型、状态文案、状态语义、归一化和纯函数校验。
- `packages/mock-data/`：稳定 mock 场景、数据工厂、统计计算。

## 后端边界

后端使用简化 DDD / 六边形结构：

- `interfaces/rest`：HTTP Controller、Request、Response。
- `application`：应用用例和 Command。
- `domain`：领域模型、仓储接口、业务规则。
- `infrastructure`：MyBatis、数据库适配、持久化实现。

架构规则由 ArchUnit 执行，普通 `mvnw test` 会检查关键依赖方向：

- `domain` 不依赖 `application`、`infrastructure`、`interfaces`。
- `application` 不依赖 `infrastructure`、`interfaces`。
- `interfaces` 不依赖 `infrastructure`。
- `infrastructure` 不依赖 `interfaces`。

## 前端和移动端边界

Web 和移动端共享业务能力，但不共享 UI：

- 共享：API wrapper、DTO 派生类型、状态文案、数据归一化、任务加载/刷新 use cases、mock 场景数据。
- 不共享：Element Plus 组件、uni-app 页面结构、路由配置、平台反馈、E2E selector。

判断规则：依赖组件库、DOM、路由、平台生命周期的代码留在端侧；只依赖业务数据和 API 抽象的代码可以进入 `packages/`。

移动端 UI 选型以 Wot Design Uni 为主，负责按钮、标签、进度、分段控件和主要移动端组件；uni-ui 作为官方补充组件库，用于后续需要官方跨端组件能力的场景。共享包不依赖任何移动端 UI 组件库。

## 契约流

契约以 OpenAPI 为中心：

1. 后端 Controller、Request、DTO 生成 OpenAPI。
2. `frontend` 通过 `npm run generate:sdk` 生成 SDK 到 `packages/task-api/src/generated/`。
3. 手写 wrapper 封装生成 SDK 和平台差异。
4. Web 和移动端只依赖 wrapper 和共享 use cases。
5. CI 通过 `sdk_check` 检查生成代码是否漂移。

## Mock 流

Mock 分成共享数据和端侧适配：

- `packages/mock-data` 提供稳定场景和数据工厂。
- Web 使用 MSW handlers 把共享数据翻译成 HTTP 响应。
- Storybook 复用 Web MSW handlers。
- 移动端使用 `packages/task-api/src/mockApi.ts` 直接消费共享场景。
- H5 E2E 启动移动端 mock mode，测试真实 `mobile/` 应用。

这样既能支持离线评审，也不会把 mock 扩成另一个后端。

## 质量门禁

当前仓库把关键工程约束落成这些可执行检查：

- 后端单元测试和 ArchUnit：`backend` 的 `mvnw test`。
- 后端集成测试和覆盖率：`mvnw verify -Pintegration-test,coverage`。
- Web 静态检查、单测、构建：`frontend npm run check`。
- Web mock 和 Storybook 构建：`npm run build:mock`、`npm run build:storybook`。
- Web E2E：`npm run test:e2e`。
- 移动端检查：`mobile npm run check`。
- 移动端 H5 E2E：`npm run test:e2e:h5`。
- SDK 漂移：`frontend npm run sdk:check`。
- schema 漂移：`scripts/check-schema.sh`。

这些检查共同构成本仓库的工程 harness。修改代码或规范后，应优先让对应 harness 通过，而不是只靠人工阅读判断。
