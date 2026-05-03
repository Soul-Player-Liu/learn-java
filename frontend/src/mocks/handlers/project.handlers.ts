import { HttpResponse, http } from 'msw'

import type { CreateLearningProjectRequest, LearningProjectDto } from '@learn-java/task-api/generated'
import type { MockScenario } from '../data'
import {
  currentTimestamp,
  error,
  maybeDelay,
  ok,
  pageOf,
  pageParams,
  recalculateProjectStats,
  serverError,
  type MockWorkspace,
  type TaskRequestParams,
} from './shared'

export function createProjectHandlers(workspace: MockWorkspace, scenario: MockScenario) {
  return [
    http.get('/api/projects', async ({ request }) => {
      await maybeDelay(scenario)
      if (scenario === 'serverError') {
        return serverError('/api/projects')
      }
      recalculateProjectStats(workspace.projects, workspace.tasks)
      const pagination = pageParams(new URL(request.url))
      return HttpResponse.json(ok(pageOf(workspace.projects, pagination.page, pagination.size)))
    }),
    http.post('/api/projects', async ({ request }) => {
      await maybeDelay(scenario)
      if (scenario === 'serverError') {
        return serverError('/api/projects')
      }
      const body = (await request.json()) as CreateLearningProjectRequest
      const timestamp = currentTimestamp()
      const project: LearningProjectDto = {
        id: workspace.nextProjectId++,
        name: body.name,
        description: body.description,
        taskCount: 0,
        doneTaskCount: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
      }
      workspace.projects = [project, ...workspace.projects]
      return HttpResponse.json(ok(project), { status: 201 })
    }),
    http.get<TaskRequestParams>('/api/projects/:id', async ({ params }) => {
      await maybeDelay(scenario)
      if (scenario === 'serverError') {
        return serverError(`/api/projects/${params.id}`)
      }
      recalculateProjectStats(workspace.projects, workspace.tasks)
      const project = workspace.projects.find((item) => item.id === Number(params.id))
      if (!project) {
        return HttpResponse.json(
          error('RESOURCE_NOT_FOUND', `Project not found: ${params.id}`, `/api/projects/${params.id}`),
          { status: 404 },
        )
      }
      return HttpResponse.json(ok(project))
    }),
  ]
}
