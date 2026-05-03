# Monorepo 工程标准

本文是给后续大型业务项目复用的 Monorepo 标准。`learn-java` 是一个可运行范本，但标准不是要求所有项目照搬本仓库文件名和技术栈，而是要求大型项目把边界、契约、共享代码、测试和 CI 做成可验证系统。

## 核心目标

一个合格的后端、Web、移动端 Monorepo 应满足：

- 契约统一：后端接口、Web、移动端不各自猜字段。
- 边界清晰：后端、Web、移动端、共享包各自职责稳定。
- 复用克制：共享类型、API wrapper、纯函数和轻量 use cases，不强行共享 UI。
- 独立运行：每个应用都能独立启动、构建、测试。
- 离线可用：前端和移动端能在后端不可用时用 mock 场景预览关键页面。
- 可机械验证：契约、schema、测试、E2E、mock build、Storybook build 能进入 CI。

## 推荐结构

```text
.
├── backend/                 # 后端服务，业务规则、数据库、HTTP API、OpenAPI
├── frontend/                # Web 客户端
├── mobile/                  # 移动端客户端
├── packages/                # 跨端共享代码
│   ├── task-api/            # 生成 SDK、API wrapper、mock API、跨端 use cases
│   ├── task-domain/         # DTO 派生类型、状态文案、归一化、轻量校验
│   └── mock-data/           # 可复用 mock 场景数据
├── scripts/                 # 跨模块脚本
├── docs/                    # 文档地图、架构记录、标准模板、生成证据
├── docker-compose.yml       # 本地基础设施
└── ci.sh                    # 本地模拟 CI 的总入口
```

真实项目可以替换技术栈，例如 React Native、Flutter、pnpm workspace、Nx 或 Turborepo。替换工具不应改变核心边界。

## 共享边界

适合共享：

- OpenAPI 生成 DTO 和 SDK。
- API wrapper，例如 `listTasks()`、`changeTaskStatus()`。
- API envelope 解包、分页归一化、空字段兜底。
- 状态枚举、状态文案、状态颜色语义。
- 纯函数转换，例如标签字符串拆分、日期展示模型。
- 轻量业务编排，例如加载 Dashboard、刷新详情、状态变更后同步列表和统计。
- mock 场景数据和统计计算。

不适合共享：

- Web 表格、弹窗、组件库封装。
- 移动端页面结构、平台生命周期和平台 API。
- Web Router、uni-app `pages.json` 或其他端侧路由。
- `ElMessage`、`uni.showToast` 等平台反馈。
- Web E2E selector 和移动端 E2E selector。
- 为了复用而产生的“大一统 UI 组件”。

判断规则：依赖组件库、DOM、路由、平台生命周期的代码留在端侧；只依赖业务数据和 API 抽象的代码可以进入共享包。

## 后端标准

后端是业务真相来源，负责：

- 领域规则和状态流转。
- 数据库事务和一致性。
- 表结构迁移。
- REST API 和 OpenAPI schema。
- 错误码、校验、trace 信息。

推荐要求：

- HTTP Request、应用 Command、DTO 分开建模。
- 数据库结构由迁移工具管理，例如 Flyway。
- OpenAPI 由后端 Controller、Request、DTO 生成。
- 关键 SQL、Mapper、Controller 由真实数据库集成测试覆盖。
- 架构边界由 ArchUnit 或等价工具检查。

后端不要为了前端页面临时拼接字段而绕过业务模型。需要字段时，应通过清晰 DTO 和接口演进表达。

## Web 标准

Web 客户端负责桌面端或管理端体验：

- Web Router。
- Web 状态管理。
- Web 组件库。
- 页面布局和交互。
- MSW、Storybook、Web E2E。

推荐要求：

- 页面仍然走 Router、Store、API wrapper，不因为 mock 或 Storybook 改业务路径。
- API 调用通过共享 wrapper，不在页面中散用生成 SDK。
- 复杂控件使用稳定 `data-testid`，避免 E2E 绑定组件库内部 DOM。
- 页面只做交互和展示，不重复写跨端业务编排。

## 移动端标准

移动端是独立客户端，不是 Web 的小屏皮肤。

移动端负责：

- 移动端页面和导航。
- 移动端生命周期。
- 平台 API。
- H5 / 小程序 / App 构建。
- 移动端独立测试。

推荐要求：

- 复用共享 API、领域类型、状态文案和 use cases。
- 保留自己的页面结构和平台反馈。
- H5 mock mode 应能不启动后端直接预览。
- H5 E2E 应测试真实移动端应用，不用 Web mobile viewport 冒充移动端。
- 小程序或 App 构建 smoke 应在平台配置、密钥和发布策略明确后再纳入 CI。

## 契约标准

跨端项目必须把契约自动化：

1. 后端暴露 OpenAPI。
2. 前端脚本从 OpenAPI 生成 SDK。
3. 生成代码放入共享包。
4. 手写 wrapper 隔离生成代码变化。
5. CI 重新生成 SDK 并检查 diff。

接口变更应让 SDK drift check 失败，而不是等页面运行时报错。

## 质量门禁

Monorepo 的 CI 应按失败来源拆分：

- `backend_unit`
- `backend_integration`
- `frontend_check`
- `mobile_check`
- `sdk_check`
- `schema_check`
- `e2e`

每个 job 应上传必要 artifact：

- JUnit XML。
- Coverage XML / HTML。
- Playwright report。
- Playwright trace / test-results。
- Storybook 静态产物。
- 后端启动日志。
- schema 或 SDK 漂移检查结果。

本地可以提供 `ci.sh` 模拟关键门禁，但本地脚本不能替代真实 CI。

## 文档标准

大型项目建议采用短入口和结构化 `docs/`：

- `README.md`：项目定位、启动、常用验证和文档入口。
- `AGENTS.md`：智能体和新人导航，作为目录而不是百科全书。
- `docs/INDEX.md`：文档地图。
- `docs/ARCHITECTURE.md`：架构边界和当前决策。
- `docs/standards/`：可迁移标准模板。
- `docs/schema/`：生成的 schema 快照等机器证据。

这不是要求每个项目必须维护完全相同的文件，而是要求文档能回答：当前系统怎么工作、标准是什么、如何验证标准没有漂移。

## 评审清单

新增功能或重构时检查：

- 后端接口是否有清晰 DTO 和 OpenAPI schema。
- SDK 是否重新生成并通过 drift check。
- 端侧是否只依赖 API wrapper。
- 重复逻辑是否应该进入共享包。
- Web 和移动端是否保留各自 UI 和平台边界。
- mock 场景是否覆盖默认、空数据、错误、大数据或慢接口。
- 关键流程是否有 E2E 或更低层测试保护。
- 移动端是否有独立检查，而不是只靠 Web 小屏测试。
- CI 是否能定位失败来源。
- 文档是否指向最新命令、脚本和证据。

## 建设顺序

新项目建议按下面顺序落地：

1. 建好 `backend/`、`frontend/`、`mobile/`、`packages/` 基础边界。
2. 后端提供最小可运行 API 和 OpenAPI。
3. 生成 SDK，建立 API wrapper。
4. 抽出共享领域类型、状态文案、归一化。
5. Web 跑通真实后端路径。
6. 移动端跑通真实后端路径。
7. 建立共享 mock 数据。
8. Web 建 MSW mock mode 和 Storybook。
9. 移动端建 mock API 和 H5 mock mode。
10. 建立后端单元测试、架构测试和真实数据库集成测试。
11. 建立 Web 单测、mock build、Storybook build。
12. 建立移动端单测、H5 build、mock H5 build。
13. 建立 Web E2E 和移动端 H5 E2E。
14. 加 SDK drift check 和 schema drift check。
15. 拆分 CI job 并上传 artifact。
16. 补齐 README、文档地图、架构记录和必要标准。

先让每层稳定跑通，再逐步提高覆盖率和门槛。
