import type { MockScenario } from './data'
import { createProjectHandlers } from './handlers/project.handlers'
import { createMockWorkspace } from './handlers/shared'
import { createTagHandlers } from './handlers/tag.handlers'
import { createTaskHandlers as createTaskDomainHandlers } from './handlers/task.handlers'

export function createTaskHandlers(scenario: MockScenario = 'default') {
  const workspace = createMockWorkspace(scenario)
  return [
    ...createTaskDomainHandlers(workspace, scenario),
    ...createProjectHandlers(workspace, scenario),
    ...createTagHandlers(workspace, scenario),
  ]
}

export const handlers = createTaskHandlers()
