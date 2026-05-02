import type { MockScenario } from './data'

export const mockScenarios = ['default', 'empty', 'overdue', 'many', 'serverError', 'slow'] as const

export function resolveMockScenario(value?: string): MockScenario {
  return mockScenarios.includes(value as MockScenario) ? (value as MockScenario) : 'default'
}
