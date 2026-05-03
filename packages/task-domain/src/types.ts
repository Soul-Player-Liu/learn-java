export type TaskStatus = "TODO" | "DOING" | "DONE";

export interface LearningTask {
  id: number;
  projectId?: number;
  projectName?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string;
  tagNames: string[];
  commentCount?: number;
  latestActivityAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskListItem = LearningTask;

export interface LearningProject {
  id: number;
  name: string;
  description?: string;
  taskCount: number;
  doneTaskCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment {
  id: number;
  taskId: number;
  content: string;
  author: string;
  createdAt: string;
}

export interface TaskActivity {
  id: number;
  taskId: number;
  type: string;
  message: string;
  createdAt: string;
}

export interface TaskTag {
  id: number;
  name: string;
  color: string;
}

export interface TaskStatistics {
  total: number;
  todo: number;
  doing: number;
  done: number;
  overdue: number;
  dueSoon: number;
}

export interface CreateLearningTaskRequest {
  projectId?: number;
  title: string;
  description?: string;
  dueDate?: string;
  tagNames?: string[];
}

export interface UpdateLearningTaskRequest extends CreateLearningTaskRequest {
  status: TaskStatus;
}

export interface ChangeTaskStatusRequest {
  status: TaskStatus;
}

export interface CreateLearningProjectRequest {
  name: string;
  description?: string;
}

export interface CreateTaskCommentRequest {
  content: string;
  author?: string;
}

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
