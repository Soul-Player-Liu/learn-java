import { HttpResponse, http } from 'msw'

import type { MockScenario } from '../data'
import { maybeDelay, ok, pageOf, pageParams, serverError, type MockWorkspace } from './shared'

export function createTagHandlers(workspace: MockWorkspace, scenario: MockScenario) {
  return [
    http.get('/api/tags', async ({ request }) => {
      await maybeDelay(scenario)
      if (scenario === 'serverError') {
        return serverError('/api/tags')
      }
      const pagination = pageParams(new URL(request.url))
      return HttpResponse.json(ok(pageOf(workspace.tags, pagination.page, pagination.size)))
    }),
  ]
}
