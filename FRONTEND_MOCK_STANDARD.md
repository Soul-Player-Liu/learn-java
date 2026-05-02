# 前端 Mock 体系建设规范

本文是一份面向真实工程项目的前端 mock 规范。当前 `learn-java` 项目是这套规范的可运行示例：前端使用 Vue、Vite、TypeScript、Pinia、Storybook、MSW，并从后端 OpenAPI 生成 SDK。

真实项目不需要逐字复制本项目代码，但建议复制这里的边界思想、目录拆分、场景编排和 CI 门禁。

## 目标

前端 mock 体系的目标不是重新实现后端，而是让团队在后端不可用、接口未完成或数据难构造时，仍然能稳定查看页面状态、评审交互方案、验证前端编排逻辑。

一个合格的工程化 mock 体系应当满足：

- 真实链路：页面仍然走 Router、Store、API wrapper、生成 SDK，只在 HTTP 边界由 MSW 接管。
- 可离线预览：产品经理、设计师和前端开发可以不启动后端就看到主要页面。
- 可场景复现：正常、空数据、大数据、错误、慢请求、权限不足等状态能稳定打开。
- 可维护拆分：mock 按业务域拆分，不把所有接口堆进一个巨大的 handlers 文件。
- 契约约束：mock 数据尽量使用生成 SDK 的 DTO 类型，避免和后端接口结构漂移。
- 可构建验证：mock mode 和 Storybook 必须能在 CI 中构建，不能只在开发机临时可用。

## 分层模型

推荐把前端 mock 分成五层。

| 层级 | 目标 | 本项目示例 |
| --- | --- | --- |
| 类型契约 | 复用后端 OpenAPI 生成的 DTO 类型 | `src/api/generated` |
| 数据工厂 | 产出稳定的场景数据 | `src/mocks/data.ts` |
| 场景选择 | 统一管理可用场景和 dev mock 场景解析 | `src/mocks/scenarios.ts` |
| 接口处理器 | 按业务域模拟 HTTP API | `src/mocks/handlers/*.handlers.ts` |
| 消费入口 | dev mock 和 Storybook 复用同一套 handlers | `src/mocks/browser.ts`、`*.stories.ts` |

## 推荐目录结构

真实大项目建议采用类似结构：

```text
src/mocks/
  browser.ts
  data.ts
  scenarios.ts
  handlers.ts
  handlers/
    shared.ts
    task.handlers.ts
    project.handlers.ts
    auth.handlers.ts
    user.handlers.ts
```

规则：

- `browser.ts` 只负责启动 MSW browser worker。
- `handlers.ts` 只做聚合，不写具体业务接口。
- `handlers/*.handlers.ts` 按业务域拆分接口。
- `handlers/shared.ts` 放通用响应格式、分页、延迟、错误响应、共享 mock 状态。
- `data.ts` 只放场景数据工厂，不处理 HTTP request。
- `scenarios.ts` 集中列出可用场景，避免 story 和 dev mock 写散落字符串。

## Dev Mock 规范

dev mock 使用 MSW browser worker 模式。它不改变页面代码，仍然运行完整 Vue 应用，只是在浏览器 Service Worker 层拦截 `/api/*` 请求。

本项目命令：

```bash
cd frontend
npm run dev:mock
npm run dev:mock:empty
npm run dev:mock:many
npm run dev:mock:error
npm run dev:mock:slow
```

也可以直接指定场景：

```bash
VITE_USE_MOCK=true VITE_MOCK_SCENARIO=many npm run dev
```

场景规则：

- `default`：默认正常数据，用于日常离线预览。
- `empty`：空数据，用于检查空态文案和布局。
- `overdue`：业务特殊状态，用于检查筛选和状态提示。
- `many`：大量数据，用于检查分页、滚动、表格宽度、长列表性能。
- `serverError`：服务端错误，用于检查错误提示。
- `slow`：慢请求，用于检查 loading 态。

真实项目可以继续扩展：

- `unauthorized`：未登录或登录过期。
- `forbidden`：无权限。
- `validationError`：表单提交校验失败。
- `readonly`：只读账号或审批结束态。
- `partialData`：字段缺失或可选字段为空。

## Storybook 规范

Storybook 的目标是稳定展示页面和组件状态，不是替代 E2E。

主要页面建议至少编排：

- `Default`：正常数据。
- `Empty`：空数据。
- `LargeData` 或 `ManyRows`：大数据。
- `ServerError`：接口失败。
- `Slow`：慢请求或 loading。
- `PermissionDenied`：如果页面受权限控制。

业务组件建议至少编排：

- `Default`：正常态。
- `Disabled`：禁用态。
- `Readonly`：只读态。
- `ValidationError`：校验失败。
- `LongText`：长文本、长字段、边界内容。

Storybook 应复用 MSW handlers：

```ts
export const ManyRows = {
  parameters: {
    msw: {
      handlers: createTaskHandlers('many'),
    },
  },
}
```

不要为了 Storybook 在组件里写专门的 mock 分支。组件应该像真实运行一样调用 Store 和 API，由 Storybook 在 HTTP 边界提供不同响应。

## MSW 边界

MSW 只模拟接口形状和前端状态，不应完整复刻后端业务系统。

适合放进 MSW：

- 列表、详情、创建、更新、删除的基础响应。
- 分页、筛选、排序的基本表现。
- 空数据、大数据、错误、慢请求、权限不足。
- 表单提交成功和失败。
- 页面展示所需的轻量状态变化。

不适合放进 MSW：

- 复杂状态机。
- 金额计算、风控规则、审批规则。
- 多服务联动和数据一致性规则。
- 真实数据库约束。
- 和后端实现强绑定的复杂业务分支。

如果一个 handler 开始需要大量条件分支、跨多个业务域更新状态，通常说明它应该被降级为“返回指定场景数据”，而不是继续扩成小后端。

## 数据管理

推荐规则：

- mock 数据必须可重复，避免依赖当前日期导致 story 每天变化。
- 每个 story 应创建独立 handlers 和独立数据状态，避免 story 之间互相污染。
- 数据工厂应优先使用生成 SDK 的 DTO 类型。
- 长文本、空字段、边界日期、大数字、特殊状态应通过命名场景表达。
- 不使用生产数据快照作为常规 mock 数据。
- 脱敏后的真实样本可以作为少量 fixture，但必须经过审查。

本项目中，`createTaskHandlers(scenario)` 每次都会创建新的 mock workspace，Storybook 每个场景拿到独立状态。

## 产品经理协作

如果希望产品经理直接产出或调整前端代码，并在没有后端时查看页面，建议建立这条工作流：

1. 前端提供稳定的页面路由、Storybook、mock 场景和启动命令。
2. 产品经理或设计协作者只修改页面组件、文案、表格列、表单布局和 mock 数据。
3. 新页面至少补一个 `Default` story 和一个 `Empty` story。
4. 新接口先按 OpenAPI 或约定 DTO 写 mock handler，后端完成后再通过 SDK drift check 对齐。
5. CI 必须跑 `build:mock` 和 `build:storybook`，保证离线预览不会悄悄坏掉。

这条路径适合产品原型、业务评审、前端先行开发，但不能替代真实后端联调和 E2E。

## CI 门禁

前端 mock 体系至少应加入这些 CI 检查：

```bash
cd frontend
npm run check
npm run build:mock
npm run build:storybook
npm run sdk:check
```

含义：

- `check`：保证类型、格式、单元测试和普通构建通过。
- `build:mock`：保证 mock mode 可以构建。
- `build:storybook`：保证 Storybook、stories 和 MSW handlers 可以构建。
- `sdk:check`：保证后端 OpenAPI 和前端 generated SDK 没有漂移。

真实项目后续可以增加：

- Storybook interaction test。
- 视觉回归。
- mock fixture schema 校验。
- 每个主要页面必须存在基础 story 的静态检查。

## 本项目实现要点

- dev mock 入口：`frontend/src/main.ts`。
- MSW browser worker：`frontend/src/mocks/browser.ts`。
- 场景解析：`frontend/src/mocks/scenarios.ts`。
- mock 数据：`frontend/src/mocks/data.ts`。
- handlers 聚合：`frontend/src/mocks/handlers.ts`。
- 分域 handlers：`frontend/src/mocks/handlers/*.handlers.ts`。
- Storybook 全局配置：`frontend/.storybook/preview.ts`。
- 页面 stories：`frontend/src/views/*.stories.ts`。

这套结构可以作为大项目起步蓝本。扩展时优先新增业务域 handler 和场景，不要把复杂业务规则堆进单个文件。

