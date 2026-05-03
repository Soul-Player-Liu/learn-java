# 后端、Web 前端、移动端 Monorepo 工程规范

本文是一份面向真实业务项目的 Monorepo 建设规范。当前 `learn-java` 项目是一个可运行范本：后端使用 Spring Boot + Maven + MyBatis + Flyway，Web 前端使用 Vue + Vite + TypeScript + Pinia，移动端使用 uni-app + Vue + TypeScript + Pinia，并通过 `packages/` 共享 API、领域类型、业务编排和 mock 数据。

真实项目不需要逐字复制本仓库的技术栈，但建议复用这里的边界划分、契约生成、共享包策略、mock 策略、测试分层和 CI 门禁。

## 目标

一个合格的全栈 Monorepo 应当解决这些问题：

- 统一业务契约：后端接口、Web、移动端不各自猜字段。
- 减少重复逻辑：跨端共享类型、API wrapper、状态文案、数据归一化、轻量业务编排。
- 保持端侧差异：Web 页面、移动端页面、平台生命周期、组件库和交互方式不强行共用。
- 可独立开发：后端、Web、移动端都能独立启动、构建、测试。
- 可离线预览：前端和移动端能在后端不可用时用 mock 场景跑通关键页面。
- 可持续验证：CI 能区分后端、Web、移动端、契约、E2E 失败来源。

## 推荐目录结构

```text
.
├── backend/                 # 后端服务，负责真实业务规则、数据库、HTTP API
├── frontend/                # Web 前端应用
├── mobile/                  # 移动端应用，例如 uni-app / React Native / Flutter shell
├── packages/                # 跨端共享代码，不放具体页面
│   ├── task-api/            # 生成 SDK、API wrapper、mock API、跨端 use cases
│   ├── task-domain/         # DTO 派生类型、状态文案、归一化、轻量校验
│   └── mock-data/           # 可复用 mock 场景数据
├── scripts/                 # 跨模块脚本
├── docker-compose.yml       # 本地基础设施
├── ci.sh                    # 本地模拟 CI 的总入口
├── README.md
├── TESTING_STANDARD.md
├── FRONTEND_MOCK_STANDARD.md
└── MONOREPO_STANDARD.md
```

目录职责必须清晰：

- `backend/` 只对外承诺 HTTP API 和 OpenAPI 契约，不直接服务前端内部类型。
- `frontend/` 只放 Web 应用代码、Web 路由、Web 组件、Web 端测试。
- `mobile/` 只放移动端页面、移动端生命周期、平台 API、移动端测试。
- `packages/` 只放跨端稳定能力，不放 Web/移动端专属 UI。

## 边界原则

### 应该共享

- OpenAPI 生成的 DTO 和 SDK。
- API wrapper，例如 `listTasks()`、`changeTaskStatus()`。
- API envelope 解包、分页归一化、空字段兜底。
- 状态枚举、状态文案、状态颜色语义。
- 表单输入的纯函数转换，例如标签字符串拆分。
- 轻量业务编排，例如加载 Dashboard、加载详情、状态变更后刷新列表和详情。
- mock 场景数据和统计计算。

### 不应该共享

- Web 表格、弹窗、Element Plus 组件。
- 移动端 `view/text/button` 页面结构。
- Web Router 和 uni-app `pages.json`。
- `ElMessage`、`uni.showToast` 这类平台反馈。
- Web E2E selector 和移动端 E2E selector。
- 任何为了复用而把 UI 抽成难以维护的“大一统组件”。

判断标准：如果一段代码依赖具体组件库、DOM、路由、平台生命周期，就留在端侧；如果只依赖业务数据和 API 抽象，可以进入 `packages/`。

## 后端规范

后端是业务真相来源，负责：

- 领域规则和状态流转。
- 数据库事务和一致性。
- 表结构迁移。
- REST API 和 OpenAPI schema。
- 错误码、校验、trace 信息。

推荐做法：

- 使用分层结构：`interfaces/rest`、`application`、`domain`、`infrastructure`。
- HTTP Request、应用 Command、DTO 分开建模。
- 数据库结构由迁移工具管理，例如 Flyway。
- OpenAPI 由后端 Controller、Request、DTO 注解生成。
- 后端测试至少包含单元测试和真实数据库集成测试。

后端不要为前端临时拼字段而绕过业务模型。需要字段时，应通过清晰的 DTO 和接口演进表达。

## Web 前端规范

Web 前端负责桌面端或管理端体验：

- Web Router。
- Web 状态管理。
- Web 组件库。
- Web 页面布局和交互。
- Storybook / Web mock / Web E2E。

推荐做法：

- 页面仍然走 Router、Store、API wrapper，不因为 mock 或 Storybook 改业务路径。
- 复杂控件使用 `data-testid`，避免 E2E 绑定组件库内部 DOM。
- API 调用通过 `packages/*` 的 wrapper，不直接散落调用生成 SDK。
- 页面只做交互和展示，不重复写跨端业务编排。

## 移动端规范

移动端是独立客户端，不是 Web 的小屏皮肤。

移动端负责：

- 移动端页面和导航。
- 移动端生命周期，例如 `onShow`、`onLoad`。
- 平台 API，例如 `uni.navigateTo`、`uni.request`、`uni.showToast`。
- 移动端 H5 / 小程序 / App 构建。
- 移动端独立测试。

推荐做法：

- 移动端复用共享 API、领域类型、状态文案和 use cases。
- 移动端页面保留自己的结构，不强行复用 Web 组件。
- H5 mock mode 应能不启动后端直接预览。
- H5 E2E 应测试真实 `mobile/` 应用，而不是只测试 Web 的 mobile viewport。
- 如果要覆盖微信小程序或 App，再增加对应平台构建 smoke；不要在配置不完整时盲目加入 CI。

## 共享包规范

共享包是 Monorepo 的核心，但也最容易失控。

### `packages/task-domain`

适合放：

- 从生成 DTO 派生的业务类型。
- 状态枚举和状态文案。
- 数据归一化函数。
- 轻量输入校验和纯函数。

不适合放：

- HTTP 请求。
- Store。
- UI。
- 平台 API。

### `packages/task-api`

适合放：

- OpenAPI 生成 SDK。
- 平台无关 API interface。
- Web fetch client。
- 移动端 request client。
- mock API。
- 跨端 use cases。

API wrapper 的职责是隔离生成代码变化。端侧不应直接依赖一堆生成函数，否则 SDK 重生成时影响面会扩大。

### `packages/mock-data`

适合放：

- `default`、`empty`、`many`、`serverError`、`slow` 等场景。
- 可重复的 mock 数据工厂。
- mock 统计计算。

不适合放：

- MSW handler。
- 页面专属数据。
- 真实生产数据快照。

## API 契约规范

跨端项目必须把契约自动化。

推荐流程：

1. 后端暴露 OpenAPI。
2. 前端脚本从后端 OpenAPI 生成 SDK。
3. 生成代码放入共享包，例如 `packages/task-api/src/generated/`。
4. 手写 wrapper 只依赖生成 SDK，不在页面中直接散用生成函数。
5. CI 重新生成 SDK，并检查生成目录是否有 diff。

接口变更必须让 SDK drift check 失败，而不是等页面运行时报错。

## Mock 规范

Mock 的目标是支持离线开发、产品评审和异常态验证，不是重写后端。

推荐分层：

- 共享数据：`packages/mock-data`。
- Web HTTP mock：MSW handlers。
- 移动端 mock：共享 mock API。
- Storybook：复用 Web MSW handlers。
- H5 E2E：复用移动端 mock API。

Mock 必须满足：

- 数据稳定，不依赖当天日期造成随机失败。
- 场景明确，例如默认、空数据、慢接口、错误、大数据。
- 使用生成 DTO 类型或共享业务类型，降低契约漂移。
- mock mode 能构建，不能只在开发机临时启动。

## 测试规范

测试分层应覆盖后端、Web、移动端、契约和 E2E。

### 后端

- 单元测试：领域规则、应用服务。
- 集成测试：真实数据库、Flyway、MyBatis、Controller。
- 架构测试：包依赖边界。

### Web

- `lint`
- `format:check`
- `typecheck`
- Vitest 单元测试。
- Coverage。
- Mock build。
- Storybook build。
- Playwright E2E。

### 移动端

- `typecheck`
- Store / use-case 单测。
- H5 build。
- H5 mock build。
- H5 E2E。
- 后续按需增加小程序 / App 构建 smoke。

### E2E

E2E 应尽量替代人工点击关键主链路，但不能变成所有业务分支的唯一验证。

推荐覆盖：

- 首页 / 概览是否能加载。
- 列表查询、筛选、分页。
- 创建、编辑、删除。
- 详情页。
- 状态流转。
- 关键异常态和空数据态。

E2E 应使用稳定定位：

- 优先用户可见文本和 role。
- 复杂组件和跨端自定义元素使用 `data-testid`。
- 不绑定第三方组件库内部 class。

## CI 规范

CI 应按失败来源拆 job：

- `backend_unit`
- `backend_integration`
- `frontend_check`
- `mobile_check`
- `sdk_check`
- `e2e`

每个 job 应上传必要 artifact：

- JUnit XML。
- Coverage XML / HTML。
- Playwright report。
- Playwright trace / test-results。
- Storybook 静态产物。
- 后端启动日志。

本地应有 `ci.sh` 串起关键门禁，用于提交前模拟 CI。但本地脚本不能替代真实 CI。

## 本地开发规范

本地开发要做到可重复、可停止、可诊断。

推荐：

- 后端、Web、移动端有明确启动命令。
- 根目录提供幂等启动 / 停止脚本。
- PID、日志放到 `.dev/` 等忽略目录。
- 默认端口写入文档。
- E2E 使用隔离端口，不复用开发中的服务。
- E2E 使用临时数据库或临时 schema，结束后自动清理。

## 依赖和锁文件规范

多端 Monorepo 必须认真管理锁文件。

推荐：

- 每个 Node 应用有自己的 `package-lock.json`，除非已经引入成熟 workspace 管理。
- 后端使用 Maven Wrapper 或固定构建镜像。
- CI 使用 `npm ci`，不使用 `npm install`。
- 依赖升级单独提交，不和业务改动混在一起。
- 安全修复不能盲目 `audit fix --force`，要评估框架兼容性。

如果项目规模继续扩大，可以引入 npm workspaces、pnpm workspace、Turborepo 或 Nx。但工具不是第一步，边界和门禁才是第一步。

## 文档规范

Monorepo 至少应维护这些文档：

- `README.md`：项目概览、启动、常用命令。
- `MONOREPO_STANDARD.md`：仓库级工程规范。
- `TESTING_STANDARD.md`：测试体系规范。
- `FRONTEND_MOCK_STANDARD.md`：mock 体系规范。
- 业务文档：核心业务流程、状态机、关键表。
- 模块 README：复杂模块的局部说明。

文档必须跟代码同步。改了脚本、CI、mock、测试、端口、目录结构，就要更新对应文档。

## 评审清单

新增功能或重构时检查：

- 后端接口是否有清晰 DTO 和 OpenAPI schema。
- SDK 是否重新生成并通过 drift check。
- 端侧是否只依赖 API wrapper，不直接散用生成 SDK。
- 跨端重复逻辑是否适合进入 `packages/`。
- Web 和移动端是否保留各自 UI 和平台边界。
- mock 场景是否覆盖默认、空数据、错误、大数据或慢接口。
- 关键流程是否有 E2E。
- 移动端是否有独立 H5 检查，而不是只靠 Web mobile viewport。
- CI 是否能定位失败来源。
- 文档是否同步。

## 常见反模式

- 后端、Web、移动端各自定义一套 DTO。
- 页面直接调用生成 SDK，缺少 wrapper。
- Web 和移动端复制同一套业务刷新逻辑。
- 为了复用 UI，把 Web 组件强行塞给移动端。
- mock handler 写成一个巨大文件，最后变成小后端。
- mock 数据依赖当前日期，导致每天结果不同。
- E2E 依赖组件库内部 class。
- CI 只有一个大 job，失败后难以定位。
- 移动端只跑 H5 build，不跑真实移动端页面 E2E。
- 文档写完后不随代码更新。

## 建设顺序

新项目建议按这个顺序落地：

1. 建好 `backend/`、`frontend/`、`mobile/`、`packages/` 基础目录。
2. 后端先提供最小可运行 API 和 OpenAPI。
3. 生成 SDK，建立 `packages/task-api` wrapper。
4. 抽出 `packages/task-domain` 类型、状态文案、归一化。
5. Web 跑通真实后端路径。
6. 移动端跑通真实后端路径。
7. 建立 `packages/mock-data`。
8. Web 建 MSW mock mode 和 Storybook。
9. 移动端建 mock API 和 H5 mock mode。
10. 加后端单元测试和真实数据库集成测试。
11. 加 Web 单测、mock build、Storybook build。
12. 加移动端 store 单测、H5 build、mock H5 build。
13. 加 Web E2E 和移动端 H5 E2E。
14. 加 SDK drift check。
15. 拆分 GitLab CI job 并上传 artifact。
16. 写齐 README、测试规范、mock 规范、Monorepo 规范。

先把每一层跑通，再逐步提高覆盖率和门槛。不要一开始堆满工具，也不要长期停留在“能启动就行”。
