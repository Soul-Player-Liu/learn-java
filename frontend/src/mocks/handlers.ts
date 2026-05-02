import { HttpResponse, http } from 'msw'

import type {
  ChangeTaskStatusRequest,
  CreateLearningProjectRequest,
  CreateLearningTaskRequest,
  CreateTaskCommentRequest,
  LearningProjectDto,
  LearningTaskDto,
  TaskCommentDto,
  TaskTagDto,
  UpdateLearningTaskRequest,
} from '@/api/generated'
import {
  calculateStatistics,
  createMockActivities,
  createMockComments,
  createMockProjects,
  createMockTags,
  createMockTasks,
  type MockScenario,
} from './data'

type TaskRequestParams = {
  id: string
}

function currentTimestamp() {
  return new Date().toISOString().slice(0, 19)
}

function ok<T>(data: T) {
  return {
    code: 'OK',
    message: 'success',
    data,
    timestamp: currentTimestamp(),
    details: [],
  }
}

function error(code: string, message: string, path: string) {
  return {
    code,
    message,
    path,
    timestamp: currentTimestamp(),
    details: [],
  }
}

function pageOf<T>(items: T[], page: number, size: number) {
  const start = Math.min((page - 1) * size, items.length)
  const end = Math.min(start + size, items.length)
  return {
    items: items.slice(start, end),
    total: items.length,
    page,
    size,
    totalPages: items.length === 0 ? 0 : Math.ceil(items.length / size),
  }
}

function pageParams(url: URL) {
  return {
    page: Math.max(Number(url.searchParams.get('page')) || 1, 1),
    size: Math.min(Math.max(Number(url.searchParams.get('size')) || 20, 1), 100),
  }
}

function matchesKeyword(task: LearningTaskDto, keyword: string) {
  return task.title?.includes(keyword) || task.description?.includes(keyword)
}

function recalculateProjectStats(projects: LearningProjectDto[], tasks: LearningTaskDto[]) {
  projects.forEach((project) => {
    const projectTasks = tasks.filter((task) => task.projectId === project.id)
    project.taskCount = projectTasks.length
    project.doneTaskCount = projectTasks.filter((task) => task.status === 'DONE').length
  })
}

function resolveProject(projects: LearningProjectDto[], projectId?: number) {
  return projectId ? projects.find((project) => project.id === projectId) : undefined
}

function ensureTags(tags: TaskTagDto[], tagNames: string[]) {
  tagNames.forEach((name) => {
    if (!tags.some((tag) => tag.name === name)) {
      tags.push({
        id: Math.max(0, ...tags.map((tag) => tag.id ?? 0)) + 1,
        name,
        color: '#2563eb',
      })
    }
  })
}

export function createTaskHandlers(scenario: MockScenario = 'default') {
  let nextId = 100
  let nextProjectId = 100
  let nextCommentId = 100
  let nextActivityId = 100
  let tasks = createMockTasks(scenario)
  let projects = createMockProjects(scenario)
  const tags = createMockTags(scenario)
  let comments = createMockComments(scenario)
  let activities = createMockActivities(scenario)
  recalculateProjectStats(projects, tasks)

  return [
    http.get('/api/tasks', ({ request }) => {
      const url = new URL(request.url)
      const status = url.searchParams.get('status')
      const projectId = Number(url.searchParams.get('projectId')) || undefined
      const keyword = url.searchParams.get('keyword')?.trim()
      const overdueOnly = url.searchParams.get('overdueOnly') === 'true'
      const tag = url.searchParams.get('tag')?.trim()
      const today = '2026-05-01'

      let result = tasks
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
    http.get('/api/tasks/statistics', () => HttpResponse.json(ok(calculateStatistics(tasks)))),
    http.get<TaskRequestParams>('/api/tasks/:id', ({ params }) => {
      const task = tasks.find((item) => item.id === Number(params.id))
      if (!task) {
        return HttpResponse.json(
          error('RESOURCE_NOT_FOUND', `Task not found: ${params.id}`, `/api/tasks/${params.id}`),
          { status: 404 },
        )
      }
      return HttpResponse.json(ok(task))
    }),
    http.post('/api/tasks', async ({ request }) => {
      const body = (await request.json()) as CreateLearningTaskRequest
      const timestamp = currentTimestamp()
      const project = resolveProject(projects, body.projectId)
      const tagNames = body.tagNames ?? []
      ensureTags(tags, tagNames)
      const task: LearningTaskDto = {
        id: nextId++,
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
      tasks = [task, ...tasks]
      activities = [
        {
          id: nextActivityId++,
          taskId: task.id,
          type: 'TASK_CREATED',
          message: 'Task created',
          createdAt: timestamp,
        },
        ...activities,
      ]
      recalculateProjectStats(projects, tasks)
      return HttpResponse.json(ok(task), { status: 201 })
    }),
    http.put<TaskRequestParams>('/api/tasks/:id', async ({ params, request }) => {
      const body = (await request.json()) as UpdateLearningTaskRequest
      const task = tasks.find((item) => item.id === Number(params.id))
      if (!task) {
        return HttpResponse.json(
          error('RESOURCE_NOT_FOUND', `Task not found: ${params.id}`, `/api/tasks/${params.id}`),
          { status: 404 },
        )
      }
      const project = resolveProject(projects, body.projectId)
      const tagNames = body.tagNames ?? []
      ensureTags(tags, tagNames)
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
      recalculateProjectStats(projects, tasks)
      return HttpResponse.json(ok(task))
    }),
    http.patch<TaskRequestParams>('/api/tasks/:id/status', async ({ params, request }) => {
      const body = (await request.json()) as ChangeTaskStatusRequest
      const task = tasks.find((item) => item.id === Number(params.id))
      if (!task) {
        return HttpResponse.json(
          error('RESOURCE_NOT_FOUND', `Task not found: ${params.id}`, `/api/tasks/${params.id}`),
          { status: 404 },
        )
      }
      task.status = body.status
      task.updatedAt = currentTimestamp()
      activities = [
        {
          id: nextActivityId++,
          taskId: task.id,
          type: 'STATUS_CHANGED',
          message: `Status changed to ${body.status}`,
          createdAt: task.updatedAt,
        },
        ...activities,
      ]
      recalculateProjectStats(projects, tasks)
      return HttpResponse.json(ok(task))
    }),
    http.get('/api/tasks/:id/comments', ({ params, request }) => {
      const pagination = pageParams(new URL(request.url))
      return HttpResponse.json(
        ok(
          pageOf(
            comments.filter((comment) => comment.taskId === Number(params.id)),
            pagination.page,
            pagination.size,
          ),
        ),
      )
    }),
    http.post<TaskRequestParams>('/api/tasks/:id/comments', async ({ params, request }) => {
      const task = tasks.find((item) => item.id === Number(params.id))
      if (!task) {
        return HttpResponse.json(
          error('RESOURCE_NOT_FOUND', `Task not found: ${params.id}`, `/api/tasks/${params.id}`),
          { status: 404 },
        )
      }
      const body = (await request.json()) as CreateTaskCommentRequest
      const timestamp = currentTimestamp()
      const comment: TaskCommentDto = {
        id: nextCommentId++,
        taskId: task.id,
        content: body.content,
        author: body.author || 'anonymous',
        createdAt: timestamp,
      }
      comments = [comment, ...comments]
      activities = [
        {
          id: nextActivityId++,
          taskId: task.id,
          type: 'COMMENT_ADDED',
          message: 'Comment added',
          createdAt: timestamp,
        },
        ...activities,
      ]
      return HttpResponse.json(ok(comment), { status: 201 })
    }),
    http.get('/api/tasks/:id/activities', ({ params, request }) => {
      const pagination = pageParams(new URL(request.url))
      return HttpResponse.json(
        ok(
          pageOf(
            activities.filter((activity) => activity.taskId === Number(params.id)),
            pagination.page,
            pagination.size,
          ),
        ),
      )
    }),
    http.get('/api/projects', ({ request }) => {
      recalculateProjectStats(projects, tasks)
      const pagination = pageParams(new URL(request.url))
      return HttpResponse.json(ok(pageOf(projects, pagination.page, pagination.size)))
    }),
    http.post('/api/projects', async ({ request }) => {
      const body = (await request.json()) as CreateLearningProjectRequest
      const timestamp = currentTimestamp()
      const project: LearningProjectDto = {
        id: nextProjectId++,
        name: body.name,
        description: body.description,
        taskCount: 0,
        doneTaskCount: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
      }
      projects = [project, ...projects]
      return HttpResponse.json(ok(project), { status: 201 })
    }),
    http.get('/api/projects/:id', ({ params }) => {
      recalculateProjectStats(projects, tasks)
      const project = projects.find((item) => item.id === Number(params.id))
      if (!project) {
        return HttpResponse.json(
          error('RESOURCE_NOT_FOUND', `Project not found: ${params.id}`, `/api/projects/${params.id}`),
          { status: 404 },
        )
      }
      return HttpResponse.json(ok(project))
    }),
    http.get('/api/tags', ({ request }) => {
      const pagination = pageParams(new URL(request.url))
      return HttpResponse.json(ok(pageOf(tags, pagination.page, pagination.size)))
    }),
    http.delete<TaskRequestParams>('/api/tasks/:id', ({ params }) => {
      tasks = tasks.filter((item) => item.id !== Number(params.id))
      comments = comments.filter((item) => item.taskId !== Number(params.id))
      activities = activities.filter((item) => item.taskId !== Number(params.id))
      recalculateProjectStats(projects, tasks)
      return HttpResponse.json(ok(null))
    }),
  ]
}

export const handlers = createTaskHandlers()
