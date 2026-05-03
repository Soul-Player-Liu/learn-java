import { HttpResponse, http } from 'msw'

import type {
  ChangeTaskStatusRequest,
  CreateLearningTaskRequest,
  CreateTaskCommentRequest,
  LearningTaskDto,
  UpdateLearningTaskRequest,
} from '@learn-java/task-api/generated'
import { calculateStatistics, type MockScenario } from '../data'
import {
  currentTimestamp,
  ensureTags,
  error,
  maybeDelay,
  ok,
  pageOf,
  pageParams,
  recalculateProjectStats,
  resolveProject,
  serverError,
  type MockWorkspace,
  type TaskRequestParams,
} from './shared'

function matchesKeyword(task: LearningTaskDto, keyword: string) {
  return task.title?.includes(keyword) || task.description?.includes(keyword)
}

export function createTaskHandlers(workspace: MockWorkspace, scenario: MockScenario) {
  return [
    http.get('/api/tasks', async ({ request }) => {
      await maybeDelay(scenario)
      if (scenario === 'serverError') {
        return serverError('/api/tasks')
      }

      const url = new URL(request.url)
      const status = url.searchParams.get('status')
      const projectId = Number(url.searchParams.get('projectId')) || undefined
      const keyword = url.searchParams.get('keyword')?.trim()
      const overdueOnly = url.searchParams.get('overdueOnly') === 'true'
      const tag = url.searchParams.get('tag')?.trim()
      const today = '2026-05-01'

      let result = workspace.tasks
      if (status) {
        result = result.filter((task) => task.status === status)
      }
      if (projectId) {
        result = result.filter((task) => task.projectId === projectId)
      }
      if (keyword) {
        result = result.filter((task) => matchesKeyword(task, keyword))
      }
      if (overdueOnly) {
        result = result.filter((task) => task.status !== 'DONE' && task.dueDate && task.dueDate < today)
      }
      if (tag) {
        result = result.filter((task) => task.tagNames?.includes(tag))
      }
      const pagination = pageParams(url)

      return HttpResponse.json(ok(pageOf(result, pagination.page, pagination.size)))
    }),
    http.get('/api/tasks/statistics', async () => {
      await maybeDelay(scenario)
      if (scenario === 'serverError') {
        return serverError('/api/tasks/statistics')
      }
      return HttpResponse.json(ok(calculateStatistics(workspace.tasks)))
    }),
    http.get<TaskRequestParams>('/api/tasks/:id', async ({ params }) => {
      await maybeDelay(scenario)
      if (scenario === 'serverError') {
        return serverError(`/api/tasks/${params.id}`)
      }
      const task = workspace.tasks.find((item) => item.id === Number(params.id))
      if (!task) {
        return HttpResponse.json(
          error('RESOURCE_NOT_FOUND', `Task not found: ${params.id}`, `/api/tasks/${params.id}`),
          { status: 404 },
        )
      }
      return HttpResponse.json(ok(task))
    }),
    http.post('/api/tasks', async ({ request }) => {
      await maybeDelay(scenario)
      if (scenario === 'serverError') {
        return serverError('/api/tasks')
      }
      const body = (await request.json()) as CreateLearningTaskRequest
      const timestamp = currentTimestamp()
      const project = resolveProject(workspace.projects, body.projectId)
      const tagNames = body.tagNames ?? []
      ensureTags(workspace.tags, tagNames)
      const task: LearningTaskDto = {
        id: workspace.nextId++,
        projectId: body.projectId,
        projectName: project?.name,
        title: body.title,
        description: body.description,
        status: 'TODO',
        dueDate: body.dueDate,
        tagNames,
        createdAt: timestamp,
        updatedAt: timestamp,
      }
      workspace.tasks = [task, ...workspace.tasks]
      workspace.activities = [
        {
          id: workspace.nextActivityId++,
          taskId: task.id,
          type: 'TASK_CREATED',
          message: 'Task created',
          createdAt: timestamp,
        },
        ...workspace.activities,
      ]
      recalculateProjectStats(workspace.projects, workspace.tasks)
      return HttpResponse.json(ok(task), { status: 201 })
    }),
    http.put<TaskRequestParams>('/api/tasks/:id', async ({ params, request }) => {
      await maybeDelay(scenario)
      if (scenario === 'serverError') {
        return serverError(`/api/tasks/${params.id}`)
      }
      const body = (await request.json()) as UpdateLearningTaskRequest
      const task = workspace.tasks.find((item) => item.id === Number(params.id))
      if (!task) {
        return HttpResponse.json(
          error('RESOURCE_NOT_FOUND', `Task not found: ${params.id}`, `/api/tasks/${params.id}`),
          { status: 404 },
        )
      }
      const project = resolveProject(workspace.projects, body.projectId)
      const tagNames = body.tagNames ?? []
      ensureTags(workspace.tags, tagNames)
      Object.assign(task, {
        projectId: body.projectId,
        projectName: project?.name,
        title: body.title,
        description: body.description,
        status: body.status,
        dueDate: body.dueDate,
        tagNames,
        updatedAt: currentTimestamp(),
      })
      recalculateProjectStats(workspace.projects, workspace.tasks)
      return HttpResponse.json(ok(task))
    }),
    http.patch<TaskRequestParams>('/api/tasks/:id/status', async ({ params, request }) => {
      await maybeDelay(scenario)
      if (scenario === 'serverError') {
        return serverError(`/api/tasks/${params.id}/status`)
      }
      const body = (await request.json()) as ChangeTaskStatusRequest
      const task = workspace.tasks.find((item) => item.id === Number(params.id))
      if (!task) {
        return HttpResponse.json(
          error('RESOURCE_NOT_FOUND', `Task not found: ${params.id}`, `/api/tasks/${params.id}`),
          { status: 404 },
        )
      }
      task.status = body.status
      task.updatedAt = currentTimestamp()
      workspace.activities = [
        {
          id: workspace.nextActivityId++,
          taskId: task.id,
          type: 'STATUS_CHANGED',
          message: `Status changed to ${body.status}`,
          createdAt: task.updatedAt,
        },
        ...workspace.activities,
      ]
      recalculateProjectStats(workspace.projects, workspace.tasks)
      return HttpResponse.json(ok(task))
    }),
    http.get('/api/tasks/:id/comments', async ({ params, request }) => {
      await maybeDelay(scenario)
      if (scenario === 'serverError') {
        return serverError(`/api/tasks/${params.id}/comments`)
      }
      const pagination = pageParams(new URL(request.url))
      return HttpResponse.json(
        ok(
          pageOf(
            workspace.comments.filter((comment) => comment.taskId === Number(params.id)),
            pagination.page,
            pagination.size,
          ),
        ),
      )
    }),
    http.post<TaskRequestParams>('/api/tasks/:id/comments', async ({ params, request }) => {
      await maybeDelay(scenario)
      if (scenario === 'serverError') {
        return serverError(`/api/tasks/${params.id}/comments`)
      }
      const task = workspace.tasks.find((item) => item.id === Number(params.id))
      if (!task) {
        return HttpResponse.json(
          error('RESOURCE_NOT_FOUND', `Task not found: ${params.id}`, `/api/tasks/${params.id}`),
          { status: 404 },
        )
      }
      const body = (await request.json()) as CreateTaskCommentRequest
      const timestamp = currentTimestamp()
      const comment = {
        id: workspace.nextCommentId++,
        taskId: task.id,
        content: body.content,
        author: body.author || 'anonymous',
        createdAt: timestamp,
      }
      workspace.comments = [comment, ...workspace.comments]
      workspace.activities = [
        {
          id: workspace.nextActivityId++,
          taskId: task.id,
          type: 'COMMENT_ADDED',
          message: 'Comment added',
          createdAt: timestamp,
        },
        ...workspace.activities,
      ]
      return HttpResponse.json(ok(comment), { status: 201 })
    }),
    http.get('/api/tasks/:id/activities', async ({ params, request }) => {
      await maybeDelay(scenario)
      if (scenario === 'serverError') {
        return serverError(`/api/tasks/${params.id}/activities`)
      }
      const pagination = pageParams(new URL(request.url))
      return HttpResponse.json(
        ok(
          pageOf(
            workspace.activities.filter((activity) => activity.taskId === Number(params.id)),
            pagination.page,
            pagination.size,
          ),
        ),
      )
    }),
    http.delete<TaskRequestParams>('/api/tasks/:id', async ({ params }) => {
      await maybeDelay(scenario)
      if (scenario === 'serverError') {
        return serverError(`/api/tasks/${params.id}`)
      }
      workspace.tasks = workspace.tasks.filter((item) => item.id !== Number(params.id))
      workspace.comments = workspace.comments.filter((item) => item.taskId !== Number(params.id))
      workspace.activities = workspace.activities.filter((item) => item.taskId !== Number(params.id))
      recalculateProjectStats(workspace.projects, workspace.tasks)
      return HttpResponse.json(ok(null))
    }),
  ]
}
