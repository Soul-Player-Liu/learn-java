import {
  createTask as sdkCreateTask,
  deleteTask as sdkDeleteTask,
  listTasks as sdkListTasks,
  updateTask as sdkUpdateTask,
} from './generated'
import './runtime/sdkClient'
import type { CreateLearningTaskRequest, LearningTask, UpdateLearningTaskRequest } from '@/types/task'
import type { LearningTaskDto } from './generated'

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

export async function listTasks() {
  const result = await sdkListTasks({ throwOnError: true })
  return result.data.map(normalizeTask)
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

export async function deleteTask(id: number) {
  await sdkDeleteTask({
    path: { id },
    throwOnError: true,
  })
}
