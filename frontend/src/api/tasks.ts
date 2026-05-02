import {
  addComment as sdkAddComment,
  changeTaskStatus as sdkChangeTaskStatus,
  createProject as sdkCreateProject,
  createTask as sdkCreateTask,
  deleteTask as sdkDeleteTask,
  getProject as sdkGetProject,
  getTask as sdkGetTask,
  getTaskStatistics as sdkGetTaskStatistics,
  listActivities as sdkListActivities,
  listComments as sdkListComments,
  listProjects as sdkListProjects,
  listTags as sdkListTags,
  listTasks as sdkListTasks,
  updateTask as sdkUpdateTask,
} from './generated'
import './runtime/sdkClient'
import type {
  ChangeTaskStatusRequest,
  CreateLearningProjectRequest,
  CreateLearningTaskRequest,
  CreateTaskCommentRequest,
  LearningProject,
  LearningTask,
  ListTaskParams,
  PageResult,
  TaskActivity,
  TaskComment,
  TaskStatistics,
  TaskTag,
  UpdateLearningTaskRequest,
} from '@/types/task'
import type {
  LearningProjectDto,
  LearningTaskDto,
  TaskActivityDto,
  TaskCommentDto,
  TaskListItemDto,
  TaskStatisticsDto,
  TaskTagDto,
} from './generated'

type ApiEnvelope<T> = {
  code?: string
  message?: string
  data?: T
}

type PageEnvelope<T> = {
  items?: T[]
  total?: number
  page?: number
  size?: number
  totalPages?: number
}

function unwrap<T>(response: ApiEnvelope<T>, label: string): T {
  if (response.code && response.code !== 'OK') {
    throw new Error(response.message || `${label}失败`)
  }
  if (response.data === undefined || response.data === null) {
    throw new Error(`${label}数据不完整`)
  }
  return response.data
}

function unwrapPage<Input, Output>(
  response: ApiEnvelope<PageEnvelope<Input>>,
  label: string,
  normalizeItem: (item: Input) => Output,
): PageResult<Output> {
  const page = unwrap(response, label)
  const items = (page.items ?? []).map(normalizeItem)

  return {
    items,
    total: page.total ?? items.length,
    page: page.page ?? 1,
    size: page.size ?? items.length,
    totalPages: page.totalPages ?? (items.length > 0 ? 1 : 0),
  }
}

function unwrapPageItems<Input, Output>(
  response: ApiEnvelope<PageEnvelope<Input>>,
  label: string,
  normalizeItem: (item: Input) => Output,
): Output[] {
  return unwrapPage(response, label, normalizeItem).items
}

function normalizeTask(task: LearningTaskDto | TaskListItemDto): LearningTask {
  if (!task.id || !task.title || !task.status) {
    throw new Error('服务端返回的任务数据不完整')
  }
  return {
    ...task,
    id: task.id,
    title: task.title,
    status: task.status,
    tagNames: task.tagNames ?? [],
  }
}

function normalizeProject(project: LearningProjectDto): LearningProject {
  if (!project.id || !project.name) {
    throw new Error('服务端返回的项目数据不完整')
  }
  return {
    ...project,
    id: project.id,
    name: project.name,
    taskCount: project.taskCount ?? 0,
    doneTaskCount: project.doneTaskCount ?? 0,
  }
}

function normalizeComment(comment: TaskCommentDto): TaskComment {
  if (!comment.id || !comment.taskId || !comment.content) {
    throw new Error('服务端返回的评论数据不完整')
  }
  return {
    ...comment,
    id: comment.id,
    taskId: comment.taskId,
    content: comment.content,
  }
}

function normalizeActivity(activity: TaskActivityDto): TaskActivity {
  if (!activity.id || !activity.taskId || !activity.type || !activity.message) {
    throw new Error('服务端返回的活动数据不完整')
  }
  return {
    ...activity,
    id: activity.id,
    taskId: activity.taskId,
    type: activity.type,
    message: activity.message,
  }
}

function normalizeTag(tag: TaskTagDto): TaskTag {
  if (!tag.id || !tag.name) {
    throw new Error('服务端返回的标签数据不完整')
  }
  return {
    ...tag,
    id: tag.id,
    name: tag.name,
  }
}

function normalizeStatistics(statistics: TaskStatisticsDto): TaskStatistics {
  return {
    total: statistics.total ?? 0,
    todo: statistics.todo ?? 0,
    doing: statistics.doing ?? 0,
    done: statistics.done ?? 0,
    overdue: statistics.overdue ?? 0,
    dueSoon: statistics.dueSoon ?? 0,
  }
}

export async function listTasks(params: ListTaskParams = {}) {
  const result = await sdkListTasks({
    query: {
      status: params.status,
      projectId: params.projectId,
      keyword: params.keyword || undefined,
      overdueOnly: params.overdueOnly || undefined,
      tag: params.tag || undefined,
      page: params.page,
      size: params.size,
    },
    throwOnError: true,
  })
  return unwrapPage(result.data, '任务列表', normalizeTask)
}

export async function getTask(id: number) {
  const result = await sdkGetTask({
    path: { id },
    throwOnError: true,
  })
  return normalizeTask(unwrap(result.data, '任务详情'))
}

export async function getTaskStatistics() {
  const result = await sdkGetTaskStatistics({ throwOnError: true })
  return normalizeStatistics(unwrap(result.data, '任务统计'))
}

export async function listProjects() {
  const result = await sdkListProjects({ throwOnError: true })
  return unwrapPageItems(result.data, '项目列表', normalizeProject)
}

export async function getProject(id: number) {
  const result = await sdkGetProject({
    path: { id },
    throwOnError: true,
  })
  return normalizeProject(unwrap(result.data, '项目详情'))
}

export async function createProject(payload: CreateLearningProjectRequest) {
  const result = await sdkCreateProject({
    body: payload,
    throwOnError: true,
  })
  return normalizeProject(unwrap(result.data, '项目创建'))
}

export async function listTags() {
  const result = await sdkListTags({ throwOnError: true })
  return unwrapPageItems(result.data, '标签列表', normalizeTag)
}

export async function createTask(payload: CreateLearningTaskRequest) {
  const result = await sdkCreateTask({
    body: payload,
    throwOnError: true,
  })
  return normalizeTask(unwrap(result.data, '任务创建'))
}

export async function updateTask(id: number, payload: UpdateLearningTaskRequest) {
  const result = await sdkUpdateTask({
    path: { id },
    body: payload,
    throwOnError: true,
  })
  return normalizeTask(unwrap(result.data, '任务更新'))
}

export async function changeTaskStatus(id: number, payload: ChangeTaskStatusRequest) {
  const result = await sdkChangeTaskStatus({
    path: { id },
    body: payload,
    throwOnError: true,
  })
  return normalizeTask(unwrap(result.data, '状态更新'))
}

export async function listComments(id: number) {
  const result = await sdkListComments({
    path: { id },
    throwOnError: true,
  })
  return unwrapPageItems(result.data, '评论列表', normalizeComment)
}

export async function addComment(id: number, payload: CreateTaskCommentRequest) {
  const result = await sdkAddComment({
    path: { id },
    body: payload,
    throwOnError: true,
  })
  return normalizeComment(unwrap(result.data, '评论创建'))
}

export async function listActivities(id: number) {
  const result = await sdkListActivities({
    path: { id },
    throwOnError: true,
  })
  return unwrapPageItems(result.data, '活动列表', normalizeActivity)
}

export async function deleteTask(id: number) {
  await sdkDeleteTask({
    path: { id },
    throwOnError: true,
  })
}
