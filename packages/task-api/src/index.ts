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
} from "@learn-java/task-domain";
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
} from "./generated";
import { createClient, type Client } from "./generated/client";

export type * from "./generated";

type UniRequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type UniRequestRuntime = {
  request(options: {
    url: string;
    method: UniRequestMethod;
    data?: string;
    header?: Record<string, string>;
    success(response: {
      statusCode: number;
      data?: unknown;
      header?: Record<string, string>;
    }): void;
    fail(error: { errMsg?: string }): void;
  }): void;
};

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

export function createFetchTaskApi(baseUrl = ""): TaskApi {
  const client = createClient({
    baseUrl: baseUrl as "http://localhost:8080",
  });
  return createTaskApi(client);
}

export function createUniTaskApi(baseUrl = ""): TaskApi {
  const client = createClient({
    baseUrl: baseUrl as "http://localhost:8080",
    fetch: createUniFetch() as typeof fetch,
  });
  return createTaskApi(client);
}

export function createTaskApi(client: Client): TaskApi {
  return {
    async listTasks(params: ListTaskParams = {}) {
      const result = await sdkListTasks({
        client,
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
      });
      return unwrapPage(result.data, "任务列表", normalizeTask);
    },

    async getTask(id: number) {
      const result = await sdkGetTask({
        client,
        path: { id },
        throwOnError: true,
      });
      return normalizeTask(unwrap(result.data, "任务详情"));
    },

    async getTaskStatistics() {
      const result = await sdkGetTaskStatistics({
        client,
        throwOnError: true,
      });
      return normalizeStatistics(unwrap(result.data, "任务统计"));
    },

    async listProjects() {
      const result = await sdkListProjects({
        client,
        throwOnError: true,
      });
      return unwrapPageItems(result.data, "项目列表", normalizeProject);
    },

    async getProject(id: number) {
      const result = await sdkGetProject({
        client,
        path: { id },
        throwOnError: true,
      });
      return normalizeProject(unwrap(result.data, "项目详情"));
    },

    async createProject(payload: CreateLearningProjectRequest) {
      const result = await sdkCreateProject({
        client,
        body: payload,
        throwOnError: true,
      });
      return normalizeProject(unwrap(result.data, "项目创建"));
    },

    async listTags() {
      const result = await sdkListTags({
        client,
        throwOnError: true,
      });
      return unwrapPageItems(result.data, "标签列表", normalizeTag);
    },

    async createTask(payload: CreateLearningTaskRequest) {
      const result = await sdkCreateTask({
        client,
        body: payload,
        throwOnError: true,
      });
      return normalizeTask(unwrap(result.data, "任务创建"));
    },

    async updateTask(id: number, payload: UpdateLearningTaskRequest) {
      const result = await sdkUpdateTask({
        client,
        path: { id },
        body: payload,
        throwOnError: true,
      });
      return normalizeTask(unwrap(result.data, "任务更新"));
    },

    async changeTaskStatus(id: number, payload: ChangeTaskStatusRequest) {
      const result = await sdkChangeTaskStatus({
        client,
        path: { id },
        body: payload,
        throwOnError: true,
      });
      return normalizeTask(unwrap(result.data, "状态更新"));
    },

    async listComments(id: number) {
      const result = await sdkListComments({
        client,
        path: { id },
        throwOnError: true,
      });
      return unwrapPageItems(result.data, "评论列表", normalizeComment);
    },

    async addComment(id: number, payload: CreateTaskCommentRequest) {
      const result = await sdkAddComment({
        client,
        path: { id },
        body: payload,
        throwOnError: true,
      });
      return normalizeComment(unwrap(result.data, "评论创建"));
    },

    async listActivities(id: number) {
      const result = await sdkListActivities({
        client,
        path: { id },
        throwOnError: true,
      });
      return unwrapPageItems(result.data, "活动列表", normalizeActivity);
    },

    async deleteTask(id: number) {
      await sdkDeleteTask({
        client,
        path: { id },
        throwOnError: true,
      });
    },
  };
}

function createUniFetch() {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = input instanceof Request ? input : new Request(input, init);
    const uniApi = (
      globalThis as typeof globalThis & { uni?: UniRequestRuntime }
    ).uni;

    if (!uniApi) {
      throw new Error("当前运行环境不支持 uni.request");
    }

    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const method = request.method.toUpperCase() as UniRequestMethod;
    const body =
      method === "GET" || method === "DELETE"
        ? undefined
        : await request.text();

    return new Promise<Response>((resolve, reject) => {
      uniApi.request({
        url: request.url,
        method,
        data: body,
        header: headers,
        success: (response) => {
          const responseBody =
            typeof response.data === "string"
              ? response.data
              : JSON.stringify(response.data ?? {});

          resolve(
            new Response(responseBody, {
              status: response.statusCode,
              headers: response.header,
            }),
          );
        },
        fail: (error) => {
          reject(new Error(error.errMsg || "移动端请求失败"));
        },
      });
    });
  };
}
