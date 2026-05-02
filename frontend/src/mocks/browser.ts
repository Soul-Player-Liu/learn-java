import { setupWorker } from 'msw/browser'

import { createTaskHandlers } from './handlers'
import { resolveMockScenario } from './scenarios'

const scenario = resolveMockScenario(import.meta.env.VITE_MOCK_SCENARIO)

export const worker = setupWorker(...createTaskHandlers(scenario))
