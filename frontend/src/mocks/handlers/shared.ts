import { HttpResponse, delay } from 'msw'

import type {
  LearningProjectDto,
  LearningTaskDto,
  TaskActivityDto,
  TaskCommentDto,
  TaskTagDto,
} from '@/api/generated'
import {
  createMockActivities,
  createMockComments,
  createMockProjects,
  createMockTags,
  createMockTasks,
  type MockScenario,
} from '../data'

export type TaskRequestParams = {
  id: string
}

export type MockWorkspace = {
  nextId: number
  nextProjectId: number
  nextCommentId: number
  nextActivityId: number
  tasks: LearningTaskDto[]
  projects: LearningProjectDto[]
  tags: TaskTagDto[]
  comments: TaskCommentDto[]
  activities: TaskActivityDto[]
}

export function createMockWorkspace(scenario: MockScenario): MockWorkspace {
  const workspace = {
    nextId: 100,
    nextProjectId: 100,
    nextCommentId: 100,
    nextActivityId: 100,
    tasks: createMockTasks(scenario),
    projects: createMockProjects(scenario),
    tags: createMockTags(scenario),
    comments: createMockComments(scenario),
    activities: createMockActivities(scenario),
  }
  recalculateProjectStats(workspace.projects, workspace.tasks)
  return workspace
}

export function currentTimestamp() {
  return new Date().toISOString().slice(0, 19)
}

export function ok<T>(data: T) {
  return {
    code: 'OK',
    message: 'success',
    data,
    timestamp: currentTimestamp(),
    details: [],
  }
}

export function error(code: string, message: string, path: string) {
  return {
    code,
    message,
    path,
    timestamp: currentTimestamp(),
    details: [],
  }
}

export function serverError(path: string) {
  return HttpResponse.json(error('INTERNAL_ERROR', 'Mock server error', path), { status: 500 })
}

export async function maybeDelay(scenario: MockScenario) {
  if (scenario === 'slow') {
    await delay(800)
  }
}

export function pageOf<T>(items: T[], page: number, size: number) {
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

export function pageParams(url: URL) {
  return {
    page: Math.max(Number(url.searchParams.get('page')) || 1, 1),
    size: Math.min(Math.max(Number(url.searchParams.get('size')) || 20, 1), 100),
  }
}

export function recalculateProjectStats(projects: LearningProjectDto[], tasks: LearningTaskDto[]) {
  projects.forEach((project) => {
    const projectTasks = tasks.filter((task) => task.projectId === project.id)
    project.taskCount = projectTasks.length
    project.doneTaskCount = projectTasks.filter((task) => task.status === 'DONE').length
  })
}

export function resolveProject(projects: LearningProjectDto[], projectId?: number) {
  return projectId ? projects.find((project) => project.id === projectId) : undefined
}

export function ensureTags(tags: TaskTagDto[], tagNames: string[]) {
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
