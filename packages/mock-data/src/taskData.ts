import type {
  LearningProject,
  LearningTask,
  TaskActivity,
  TaskComment,
  TaskStatistics,
  TaskTag,
} from "@learn-java/task-domain";

export const mockProjects: LearningProject[] = [
  {
    id: 1,
    name: "Java 基础补全",
    description: "围绕 Spring Boot、MyBatis 和测试体系补齐后端基本功。",
    taskCount: 3,
    doneTaskCount: 1,
    createdAt: "2026-04-26T09:00:00",
    updatedAt: "2026-04-28T18:00:00",
  },
  {
    id: 2,
    name: "前端工程化",
    description: "学习 Vue、状态管理、Mock 和端到端测试。",
    taskCount: 2,
    doneTaskCount: 0,
    createdAt: "2026-04-27T09:00:00",
    updatedAt: "2026-04-29T18:00:00",
  },
];

export const mockTags: TaskTag[] = [
  { id: 1, name: "后端", color: "#2563eb" },
  { id: 2, name: "前端", color: "#16a34a" },
  { id: 3, name: "测试", color: "#d97706" },
];

export const mockTasks: LearningTask[] = [
  {
    id: 1,
    projectId: 1,
    projectName: "Java 基础补全",
    title: "梳理任务 CRUD 的完整链路",
    description: "从 Controller 到 Service、Mapper、Flyway 表结构串起来。",
    status: "DOING",
    dueDate: "2026-05-05",
    tagNames: ["后端", "测试"],
    commentCount: 1,
    latestActivityAt: "2026-05-02T10:00:00",
    createdAt: "2026-04-27T09:00:00",
    updatedAt: "2026-05-02T10:00:00",
  },
  {
    id: 2,
    projectId: 2,
    projectName: "前端工程化",
    title: "补齐 uni-app 移动端最小链路",
    description: "复用共享 domain/api，移动端页面单独实现。",
    status: "TODO",
    dueDate: "2026-05-08",
    tagNames: ["前端"],
    commentCount: 0,
    createdAt: "2026-05-01T09:00:00",
    updatedAt: "2026-05-01T09:00:00",
  },
];

export const mockComments: TaskComment[] = [
  {
    id: 1,
    taskId: 1,
    content: "先保证 Web 端行为不变，再接移动端。",
    author: "Codex",
    createdAt: "2026-05-02T11:00:00",
  },
];

export const mockActivities: TaskActivity[] = [
  {
    id: 1,
    taskId: 1,
    type: "STATUS_CHANGED",
    message: "任务状态更新为进行中",
    createdAt: "2026-05-02T10:00:00",
  },
];

export const mockStatistics: TaskStatistics = {
  total: 2,
  todo: 1,
  doing: 1,
  done: 0,
  overdue: 0,
  dueSoon: 1,
};
