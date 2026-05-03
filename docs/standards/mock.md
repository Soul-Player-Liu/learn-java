# Mock 与离线预览标准

本文是给大型业务项目复用的 mock 标准。`learn-java` 中 Web 使用 MSW 和 Storybook，移动端使用共享 mock API 和 H5 mock mode，两端复用 `packages/mock-data` 的场景数据。

Mock 的目标不是重写后端，而是在后端不可用、接口未完成、数据难构造时，仍然能稳定评审页面、验证交互和跑关键离线测试。

## 核心目标

一个合格的 mock 体系应满足：

- 真实链路：页面仍然走 Router、Store、API wrapper 和生成 SDK。
- 可离线预览：产品、设计、前端、移动端都能不启动后端查看主要页面。
- 可场景复现：默认、空数据、大数据、错误、慢请求等状态稳定可打开。
- 可维护拆分：mock 按业务域拆分，不把所有接口堆进一个文件。
- 契约约束：mock 数据尽量复用生成 DTO 或共享业务类型。
- 可构建验证：mock mode、Storybook、移动端 H5 mock build 进入 CI。

## 分层模型

| 层级 | 目标 | 本仓库示例 |
| --- | --- | --- |
| 类型契约 | 复用 OpenAPI 生成 DTO 和共享类型 | `packages/task-api/src/generated`、`packages/task-domain` |
| 共享数据 | 产出稳定场景数据 | `packages/mock-data/src/scenarios.ts` |
| Web HTTP mock | 在 HTTP 边界模拟后端 | `frontend/src/mocks/handlers/*.handlers.ts` |
| Storybook | 展示页面和组件状态 | `frontend/src/views/*.stories.ts` |
| 移动端 mock | 不依赖 Service Worker，直接消费共享 mock API | `packages/task-api/src/mockApi.ts` |
| E2E mock | 启动真实移动端 H5 mock mode | `mobile/playwright.h5.config.ts` |

## 场景标准

基础场景：

- `default`：默认正常数据，用于日常离线预览。
- `empty`：空数据，用于检查空态文案和布局。
- `many`：大量数据，用于检查分页、滚动、长列表和性能。
- `serverError`：服务端错误，用于检查错误提示。
- `slow`：慢请求，用于检查 loading 态。
- `overdue` 或业务特殊场景：用于检查筛选、提醒和异常业务状态。

真实项目可继续扩展：

- `unauthorized`：未登录或登录过期。
- `forbidden`：无权限。
- `validationError`：表单提交校验失败。
- `readonly`：只读账号或审批结束态。
- `partialData`：可选字段为空或后端渐进返回。

场景应稳定、命名明确、可复现。不要依赖当天日期或随机数造成每天结果不同。

## Web Mock

Web dev mock 使用 MSW browser worker。它只在浏览器 Service Worker 层拦截 `/api/*`，不改变页面业务路径。

推荐目录：

```text
frontend/src/mocks/
  browser.ts
  data.ts
  scenarios.ts
  handlers.ts
  handlers/
    shared.ts
    task.handlers.ts
    project.handlers.ts
    auth.handlers.ts
```

规则：

- `browser.ts` 只启动 MSW worker。
- `handlers.ts` 只聚合 handler。
- `handlers/*.handlers.ts` 按业务域拆分。
- `handlers/shared.ts` 放通用响应格式、分页、延迟、错误响应、共享 mock 状态。
- `data.ts` 可以作为兼容入口，但多端项目的数据工厂应优先放在共享包。
- `scenarios.ts` 统一解析 `VITE_MOCK_SCENARIO`。

本仓库命令：

```bash
cd frontend
npm run dev:mock
npm run dev:mock:empty
npm run dev:mock:many
npm run dev:mock:error
npm run dev:mock:slow
```

## Storybook

Storybook 的目标是稳定展示页面和组件状态，不替代 E2E。

页面建议至少编排：

- `Default`
- `Empty`
- `LargeData` 或 `ManyRows`
- `ServerError`
- `Slow`
- `PermissionDenied`

组件建议至少编排：

- `Default`
- `Disabled`
- `Readonly`
- `ValidationError`
- `LongText`

Storybook 应复用 MSW handlers，不在组件里写专门 mock 分支。

## 移动端 Mock

移动端不应强依赖 MSW。H5 可以用浏览器技术，但小程序和 App 平台并没有相同 Service Worker 边界。

推荐做法：

- 在共享 API 包中定义平台无关 `TaskApi` interface。
- 真实移动端 client 使用 `uni.request`。
- mock client 使用共享场景数据实现同一 interface。
- `VITE_USE_MOCK=true` 时切换到 mock client。
- 移动端 H5 E2E 启动 mock mode，测试真实 `mobile/` 应用。

本仓库命令：

```bash
cd mobile
npm run dev:h5:mock
npm run build:h5:mock
npm run test:e2e:h5
```

## MSW 边界

适合放进 mock：

- 列表、详情、创建、更新、删除的基础响应。
- 分页、筛选、排序的基础表现。
- 空数据、大数据、错误、慢请求、权限不足。
- 表单提交成功和失败。
- 页面展示所需的轻量状态变化。

不适合放进 mock：

- 复杂状态机。
- 金额计算、风控规则、审批规则。
- 多服务联动和强一致性规则。
- 真实数据库约束。
- 和后端实现强绑定的复杂业务分支。

如果 handler 需要大量条件分支和跨业务域更新，通常说明它应该降级为返回指定场景数据，而不是继续扩成小后端。

## 数据管理

推荐规则：

- mock 数据必须可重复。
- 每个 story 或测试应创建独立数据状态。
- 数据工厂优先使用生成 DTO 或共享业务类型。
- 长文本、空字段、边界日期、大数字、特殊状态通过命名场景表达。
- 不使用生产数据快照作为常规 mock。
- 脱敏真实样本必须经过审查，并只作为少量 fixture。

## 产品和设计协作

离线预览工作流：

1. 工程提供稳定路由、Storybook、mock 场景和启动命令。
2. 产品或设计协作者可以修改页面文案、表格列、表单布局和 mock 数据。
3. 新页面至少补 `Default` 和 `Empty` 场景。
4. 新接口先按 OpenAPI 或约定 DTO 写 mock。
5. 后端完成后通过 SDK drift check 对齐。
6. CI 跑 mock build、Storybook build 和必要 E2E，确保离线预览不会悄悄坏掉。

这条路径适合产品原型、业务评审和前端先行开发，不能替代真实后端联调。

## CI 标准

建议加入：

```bash
cd frontend
npm run build:mock
npm run build:storybook

cd ../mobile
npm run build:h5:mock
npm run test:e2e:h5
```

后续可扩展：

- Storybook interaction test。
- 视觉回归。
- mock fixture schema 校验。
- 主要页面必须存在基础 story 的静态检查。

## 评审清单

提交前检查：

- 页面是否仍走真实 Router、Store、API wrapper。
- Web dev mock 和 Storybook 是否复用同一套 handlers。
- 移动端是否复用共享 mock API。
- mock 数据是否在共享包中复用，而不是端侧复制。
- 场景是否覆盖默认、空、错误、慢、大数据。
- mock 是否没有承载复杂后端规则。
- mock mode、Storybook、移动端 H5 mock 是否能构建或测试通过。
