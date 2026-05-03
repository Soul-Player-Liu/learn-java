import type {
  ChangeTaskStatusRequest,
  CreateLearningProjectRequest,
  CreateLearningTaskRequest,
  CreateTaskCommentRequest,
  LearningProjectDto,
  LearningTaskDto,
  TaskActivityDto,
  TaskCommentDto,
  TaskListItemDto,
  TaskStatisticsDto,
  TaskTagDto,
  UpdateLearningTaskRequest,
} from "@learn-java/task-api/generated";

export type TaskStatus = NonNullable<LearningTaskDto["status"]>;

export type LearningTask = LearningTaskDto | TaskListItemDto;

export type TaskListItem = TaskListItemDto;

export type LearningProject = LearningProjectDto;

export type TaskComment = TaskCommentDto;

export type TaskActivity = TaskActivityDto;

export type TaskTag = TaskTagDto;

export type TaskStatistics = TaskStatisticsDto;

export type {
  ChangeTaskStatusRequest,
  CreateLearningProjectRequest,
  CreateLearningTaskRequest,
  CreateTaskCommentRequest,
  UpdateLearningTaskRequest,
};

export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface ListTaskParams {
  status?: TaskStatus;
  projectId?: number;
  keyword?: string;
  overdueOnly?: boolean;
  tag?: string;
  page?: number;
  size?: number;
}

export type ApiCode =
  | "OK"
  | "VALIDATION_FAILED"
  | "RESOURCE_NOT_FOUND"
  | "MALFORMED_REQUEST"
  | "BAD_REQUEST"
  | "INTERNAL_ERROR";

export interface ApiEnvelope<T> {
  code?: ApiCode;
  message?: string;
  data?: T;
}

export interface PageEnvelope<T> {
  items?: T[];
  total?: number;
  page?: number;
  size?: number;
  totalPages?: number;
}
