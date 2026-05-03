import {
  normalizeActivity,
  normalizeComment,
  normalizeProject,
  normalizeStatistics,
  normalizeTag,
  normalizeTask,
  unwrap,
  unwrapPage,
  unwrapPageItems,
} from "@learn-java/task-domain";
import type {
  ApiEnvelope,
  ChangeTaskStatusRequest,
  CreateLearningProjectRequest,
  CreateLearningTaskRequest,
  CreateTaskCommentRequest,
  LearningProject,
  LearningTask,
  ListTaskParams,
  PageEnvelope,
  PageResult,
  TaskActivity,
  TaskComment,
  TaskStatistics,
  TaskTag,
  UpdateLearningTaskRequest,
} from "@learn-java/task-domain";

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
}

export interface TaskApiRequest {
  <T>(options: RequestOptions): Promise<T>;
}

export interface TaskApi {
  listTasks(params?: ListTaskParams): Promise<PageResult<LearningTask>>;
  getTask(id: number): Promise<LearningTask>;
  getTaskStatistics(): Promise<TaskStatistics>;
  listProjects(): Promise<LearningProject[]>;
  getProject(id: number): Promise<LearningProject>;
  createProject(
    payload: CreateLearningProjectRequest,
  ): Promise<LearningProject>;
  listTags(): Promise<TaskTag[]>;
  createTask(payload: CreateLearningTaskRequest): Promise<LearningTask>;
  updateTask(
    id: number,
    payload: UpdateLearningTaskRequest,
  ): Promise<LearningTask>;
  changeTaskStatus(
    id: number,
    payload: ChangeTaskStatusRequest,
  ): Promise<LearningTask>;
  listComments(id: number): Promise<TaskComment[]>;
  addComment(
    id: number,
    payload: CreateTaskCommentRequest,
  ): Promise<TaskComment>;
  listActivities(id: number): Promise<TaskActivity[]>;
  deleteTask(id: number): Promise<void>;
}

export function createTaskApi(request: TaskApiRequest): TaskApi {
  return {
    async listTasks(params: ListTaskParams = {}) {
      const response = await request<
        ApiEnvelope<PageEnvelope<Partial<LearningTask>>>
      >({
        path: "/api/tasks",
        query: {
          status: params.status,
          projectId: params.projectId,
          keyword: params.keyword || undefined,
          overdueOnly: params.overdueOnly || undefined,
          tag: params.tag || undefined,
          page: params.page,
          size: params.size,
        },
      });
      return unwrapPage(response, "任务列表", normalizeTask);
    },

    async getTask(id: number) {
      const response = await request<ApiEnvelope<Partial<LearningTask>>>({
        path: `/api/tasks/${id}`,
      });
      return normalizeTask(unwrap(response, "任务详情"));
    },

    async getTaskStatistics() {
      const response = await request<ApiEnvelope<Partial<TaskStatistics>>>({
        path: "/api/tasks/statistics",
      });
      return normalizeStatistics(unwrap(response, "任务统计"));
    },

    async listProjects() {
      const response = await request<
        ApiEnvelope<PageEnvelope<Partial<LearningProject>>>
      >({
        path: "/api/projects",
      });
      return unwrapPageItems(response, "项目列表", normalizeProject);
    },

    async getProject(id: number) {
      const response = await request<ApiEnvelope<Partial<LearningProject>>>({
        path: `/api/projects/${id}`,
      });
      return normalizeProject(unwrap(response, "项目详情"));
    },

    async createProject(payload: CreateLearningProjectRequest) {
      const response = await request<ApiEnvelope<Partial<LearningProject>>>({
        method: "POST",
        path: "/api/projects",
        body: payload,
      });
      return normalizeProject(unwrap(response, "项目创建"));
    },

    async listTags() {
      const response = await request<
        ApiEnvelope<PageEnvelope<Partial<TaskTag>>>
      >({
        path: "/api/tags",
      });
      return unwrapPageItems(response, "标签列表", normalizeTag);
    },

    async createTask(payload: CreateLearningTaskRequest) {
      const response = await request<ApiEnvelope<Partial<LearningTask>>>({
        method: "POST",
        path: "/api/tasks",
        body: payload,
      });
      return normalizeTask(unwrap(response, "任务创建"));
    },

    async updateTask(id: number, payload: UpdateLearningTaskRequest) {
      const response = await request<ApiEnvelope<Partial<LearningTask>>>({
        method: "PUT",
        path: `/api/tasks/${id}`,
        body: payload,
      });
      return normalizeTask(unwrap(response, "任务更新"));
    },

    async changeTaskStatus(id: number, payload: ChangeTaskStatusRequest) {
      const response = await request<ApiEnvelope<Partial<LearningTask>>>({
        method: "PATCH",
        path: `/api/tasks/${id}/status`,
        body: payload,
      });
      return normalizeTask(unwrap(response, "状态更新"));
    },

    async listComments(id: number) {
      const response = await request<
        ApiEnvelope<PageEnvelope<Partial<TaskComment>>>
      >({
        path: `/api/tasks/${id}/comments`,
      });
      return unwrapPageItems(response, "评论列表", normalizeComment);
    },

    async addComment(id: number, payload: CreateTaskCommentRequest) {
      const response = await request<ApiEnvelope<Partial<TaskComment>>>({
        method: "POST",
        path: `/api/tasks/${id}/comments`,
        body: payload,
      });
      return normalizeComment(unwrap(response, "评论创建"));
    },

    async listActivities(id: number) {
      const response = await request<
        ApiEnvelope<PageEnvelope<Partial<TaskActivity>>>
      >({
        path: `/api/tasks/${id}/activities`,
      });
      return unwrapPageItems(response, "活动列表", normalizeActivity);
    },

    async deleteTask(id: number) {
      await request({
        method: "DELETE",
        path: `/api/tasks/${id}`,
      });
    },
  };
}
