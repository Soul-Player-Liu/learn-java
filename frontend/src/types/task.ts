import type {
  ChangeTaskStatusRequest as GeneratedChangeTaskStatusRequest,
  CreateLearningTaskRequest as GeneratedCreateLearningTaskRequest,
  LearningTaskDto,
  TaskStatisticsDto,
  UpdateLearningTaskRequest as GeneratedUpdateLearningTaskRequest,
} from '@/api/generated'

export type TaskStatus = 'TODO' | 'DOING' | 'DONE'

export interface LearningTask extends Omit<LearningTaskDto, 'id' | 'title' | 'status'> {
  id: number
  title: string
  status: TaskStatus
}

export type CreateLearningTaskRequest = GeneratedCreateLearningTaskRequest

export type UpdateLearningTaskRequest = GeneratedUpdateLearningTaskRequest

export type ChangeTaskStatusRequest = GeneratedChangeTaskStatusRequest

export type TaskStatistics = Required<TaskStatisticsDto>

export interface ListTaskParams {
  status?: TaskStatus
  keyword?: string
  overdueOnly?: boolean
}
