import { HttpResponse, http } from 'msw'

import type {
  ChangeTaskStatusRequest,
  CreateLearningTaskRequest,
  LearningTaskDto,
  UpdateLearningTaskRequest,
} from '@/api/generated'
import { calculateStatistics, createMockTasks, type MockScenario } from './data'

type TaskRequestParams = {
  id: string
}

function currentTimestamp() {
  return new Date().toISOString().slice(0, 19)
}

function matchesKeyword(task: LearningTaskDto, keyword: string) {
  return task.title?.includes(keyword) || task.description?.includes(keyword)
}

export function createTaskHandlers(scenario: MockScenario = 'default') {
  let nextId = 100
  let tasks = createMockTasks(scenario)

  return [
    http.get('/api/tasks', ({ request }) => {
      const url = new URL(request.url)
      const status = url.searchParams.get('status')
      const keyword = url.searchParams.get('keyword')?.trim()
      const overdueOnly = url.searchParams.get('overdueOnly') === 'true'
      const today = '2026-05-01'

      let result = tasks
      if (status) {
        result = result.filter((task) => task.status === status)
      }
      if (keyword) {
        result = result.filter((task) => matchesKeyword(task, keyword))
      }
      if (overdueOnly) {
        result = result.filter((task) => task.status !== 'DONE' && task.dueDate && task.dueDate < today)
      }

      return HttpResponse.json(result)
    }),
    http.get('/api/tasks/statistics', () => HttpResponse.json(calculateStatistics(tasks))),
    http.get<TaskRequestParams>('/api/tasks/:id', ({ params }) => {
      const task = tasks.find((item) => item.id === Number(params.id))
      if (!task) {
        return HttpResponse.json({ message: `Task ${params.id} not found` }, { status: 404 })
      }
      return HttpResponse.json(task)
    }),
    http.post('/api/tasks', async ({ request }) => {
      const body = (await request.json()) as CreateLearningTaskRequest
      const timestamp = currentTimestamp()
      const task: LearningTaskDto = {
        id: nextId++,
        title: body.title,
        description: body.description,
        status: 'TODO',
        dueDate: body.dueDate,
        createdAt: timestamp,
        updatedAt: timestamp,
      }
      tasks = [task, ...tasks]
      return HttpResponse.json(task, { status: 201 })
    }),
    http.put<TaskRequestParams>('/api/tasks/:id', async ({ params, request }) => {
      const body = (await request.json()) as UpdateLearningTaskRequest
      const task = tasks.find((item) => item.id === Number(params.id))
      if (!task) {
        return HttpResponse.json({ message: `Task ${params.id} not found` }, { status: 404 })
      }
      Object.assign(task, {
        title: body.title,
        description: body.description,
        status: body.status,
        dueDate: body.dueDate,
        updatedAt: currentTimestamp(),
      })
      return HttpResponse.json(task)
    }),
    http.patch<TaskRequestParams>('/api/tasks/:id/status', async ({ params, request }) => {
      const body = (await request.json()) as ChangeTaskStatusRequest
      const task = tasks.find((item) => item.id === Number(params.id))
      if (!task) {
        return HttpResponse.json({ message: `Task ${params.id} not found` }, { status: 404 })
      }
      task.status = body.status
      task.updatedAt = currentTimestamp()
      return HttpResponse.json(task)
    }),
    http.delete<TaskRequestParams>('/api/tasks/:id', ({ params }) => {
      tasks = tasks.filter((item) => item.id !== Number(params.id))
      return new HttpResponse(null, { status: 204 })
    }),
  ]
}

export const handlers = createTaskHandlers()
