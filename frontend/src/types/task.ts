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

export type TaskStatus = 'TODO' | 'DOING' | 'DONE'

export interface LearningTask extends Omit<LearningTaskDto, 'id' | 'title' | 'status'> {
  id: number
  title: string
  status: TaskStatus
  tagNames: string[]
}

export interface LearningProject extends Omit<
  LearningProjectDto,
  'id' | 'name' | 'taskCount' | 'doneTaskCount'
> {
  id: number
  name: string
  taskCount: number
  doneTaskCount: number
}

export interface TaskComment extends Omit<TaskCommentDto, 'id' | 'taskId' | 'content'> {
  id: number
  taskId: number
  content: string
}

export interface TaskActivity extends Omit<TaskActivityDto, 'id' | 'taskId' | 'type' | 'message'> {
  id: number
  taskId: number
  type: string
  message: string
}

export interface TaskTag extends Omit<TaskTagDto, 'id' | 'name'> {
  id: number
  name: string
}

export type CreateLearningTaskRequest = GeneratedCreateLearningTaskRequest

export type UpdateLearningTaskRequest = GeneratedUpdateLearningTaskRequest

export type ChangeTaskStatusRequest = GeneratedChangeTaskStatusRequest

export type CreateLearningProjectRequest = GeneratedCreateLearningProjectRequest

export type CreateTaskCommentRequest = GeneratedCreateTaskCommentRequest

export type TaskStatistics = Required<TaskStatisticsDto>

export interface ListTaskParams {
  status?: TaskStatus
  projectId?: number
  keyword?: string
  overdueOnly?: boolean
  tag?: string
}
