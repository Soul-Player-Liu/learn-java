import {
  changeTaskStatus as sdkChangeTaskStatus,
  createTask as sdkCreateTask,
  deleteTask as sdkDeleteTask,
  getTask as sdkGetTask,
  getTaskStatistics as sdkGetTaskStatistics,
  listTasks as sdkListTasks,
  updateTask as sdkUpdateTask,
} from './generated'
import './runtime/sdkClient'
import type {
  ChangeTaskStatusRequest,
  CreateLearningTaskRequest,
  LearningTask,
  ListTaskParams,
  TaskStatistics,
  UpdateLearningTaskRequest,
} from '@/types/task'
import type { LearningTaskDto, TaskStatisticsDto } from './generated'

function normalizeTask(task: LearningTaskDto): LearningTask {
  if (!task.id || !task.title || !task.status) {
    throw new Error('服务端返回的任务数据不完整')
  }
  return {
    ...task,
    id: task.id,
    title: task.title,
    status: task.status,
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
      keyword: params.keyword || undefined,
      overdueOnly: params.overdueOnly || undefined,
    },
    throwOnError: true,
  })
  return result.data.map(normalizeTask)
}

export async function getTask(id: number) {
  const result = await sdkGetTask({
    path: { id },
    throwOnError: true,
  })
  return normalizeTask(result.data)
}

export async function getTaskStatistics() {
  const result = await sdkGetTaskStatistics({ throwOnError: true })
  return normalizeStatistics(result.data)
}

export async function createTask(payload: CreateLearningTaskRequest) {
  const result = await sdkCreateTask({
    body: payload,
    throwOnError: true,
  })
  return normalizeTask(result.data)
}

export async function updateTask(id: number, payload: UpdateLearningTaskRequest) {
  const result = await sdkUpdateTask({
    path: { id },
    body: payload,
    throwOnError: true,
  })
  return normalizeTask(result.data)
}

export async function changeTaskStatus(id: number, payload: ChangeTaskStatusRequest) {
  const result = await sdkChangeTaskStatus({
    path: { id },
    body: payload,
    throwOnError: true,
  })
  return normalizeTask(result.data)
}

export async function deleteTask(id: number) {
  await sdkDeleteTask({
    path: { id },
    throwOnError: true,
  })
}
