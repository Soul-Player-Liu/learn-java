import type {
  CreateLearningTaskRequest as GeneratedCreateLearningTaskRequest,
  LearningTaskDto,
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
