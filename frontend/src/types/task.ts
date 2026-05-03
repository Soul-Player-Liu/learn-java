import type {
  ChangeTaskStatusRequest as GeneratedChangeTaskStatusRequest,
  CreateLearningProjectRequest as GeneratedCreateLearningProjectRequest,
  CreateLearningTaskRequest as GeneratedCreateLearningTaskRequest,
  CreateTaskCommentRequest as GeneratedCreateTaskCommentRequest,
  LearningProjectDto,
  LearningTaskDto,
  TaskActivityDto,
  TaskCommentDto,
  TaskStatisticsDto,
  TaskTagDto,
  UpdateLearningTaskRequest as GeneratedUpdateLearningTaskRequest,
} from '@/api/generated'

export type TaskStatus = NonNullable<LearningTaskDto['status']>

export type LearningTask = LearningTaskDto

export type LearningProject = LearningProjectDto

export type TaskComment = TaskCommentDto

export type TaskActivity = TaskActivityDto

export type TaskTag = TaskTagDto

export type CreateLearningTaskRequest = GeneratedCreateLearningTaskRequest

export type UpdateLearningTaskRequest = GeneratedUpdateLearningTaskRequest

export type ChangeTaskStatusRequest = GeneratedChangeTaskStatusRequest

export type CreateLearningProjectRequest = GeneratedCreateLearningProjectRequest

export type CreateTaskCommentRequest = GeneratedCreateTaskCommentRequest

export type TaskStatistics = TaskStatisticsDto

export interface PageResult<T> {
  items: T[]
  total: number
  page: number
  size: number
  totalPages: number
}

export interface ListTaskParams {
  status?: TaskStatus
  projectId?: number
  keyword?: string
  overdueOnly?: boolean
  tag?: string
  page?: number
  size?: number
}
