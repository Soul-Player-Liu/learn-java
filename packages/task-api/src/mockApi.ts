import {
  calculateStatistics,
  createMockActivities,
  createMockComments,
  createMockProjects,
  createMockTags,
  createMockTasks,
  resolveMockScenario,
} from "@learn-java/mock-data";
import type { MockScenario } from "@learn-java/mock-data";
import type {
  CreateLearningProjectRequest,
  CreateLearningTaskRequest,
  CreateTaskCommentRequest,
  LearningProject,
  LearningTask,
  ListTaskParams,
  TaskActivity,
  TaskComment,
  TaskTag,
} from "@learn-java/task-domain";

import type { TaskApi } from "./index";

type MockWorkspace = {
  nextId: number;
  nextProjectId: number;
  nextCommentId: number;
  nextActivityId: number;
  tasks: LearningTask[];
  projects: LearningProject[];
  tags: TaskTag[];
  comments: TaskComment[];
  activities: TaskActivity[];
};

export function createMockTaskApi(
  scenarioName: MockScenario | string = "default",
): TaskApi {
  const scenario = resolveMockScenario(scenarioName);
  const workspace: MockWorkspace = {
    nextId: 100,
    nextProjectId: 100,
    nextCommentId: 100,
    nextActivityId: 100,
    tasks: createMockTasks(scenario),
    projects: createMockProjects(scenario),
    tags: createMockTags(scenario),
    comments: createMockComments(scenario),
    activities: createMockActivities(scenario),
  };
  recalculateProjectStats(workspace);

  return {
    async listTasks(params: ListTaskParams = {}) {
      await maybeDelay(scenario);
      let result = workspace.tasks;
      if (params.status) {
        result = result.filter((task) => task.status === params.status);
      }
      if (params.projectId) {
        result = result.filter((task) => task.projectId === params.projectId);
      }
      if (params.keyword) {
        result = result.filter((task) => matchesKeyword(task, params.keyword!));
      }
      if (params.overdueOnly) {
        result = result.filter(isOverdue);
      }
      if (params.tag) {
        result = result.filter((task) => task.tagNames?.includes(params.tag!));
      }
      return pageOf(
        result.map(cloneTask),
        params.page ?? 1,
        params.size ?? 20,
      );
    },

    async getTask(id: number) {
      await maybeDelay(scenario);
      return cloneTask(findTask(workspace, id));
    },

    async getTaskStatistics() {
      await maybeDelay(scenario);
      return calculateStatistics(workspace.tasks);
    },

    async listProjects() {
      await maybeDelay(scenario);
      recalculateProjectStats(workspace);
      return workspace.projects.map(cloneProject);
    },

    async getProject(id: number) {
      await maybeDelay(scenario);
      recalculateProjectStats(workspace);
      const project = workspace.projects.find((item) => item.id === id);
      if (!project) {
        throw new Error(`项目不存在: ${id}`);
      }
      return cloneProject(project);
    },

    async createProject(payload: CreateLearningProjectRequest) {
      await maybeDelay(scenario);
      const timestamp = currentTimestamp();
      const project: LearningProject = {
        id: workspace.nextProjectId++,
        name: payload.name,
        description: payload.description,
        taskCount: 0,
        doneTaskCount: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      workspace.projects = [project, ...workspace.projects];
      return cloneProject(project);
    },

    async listTags() {
      await maybeDelay(scenario);
      return workspace.tags.map(cloneTag);
    },

    async createTask(payload: CreateLearningTaskRequest) {
      await maybeDelay(scenario);
      const timestamp = currentTimestamp();
      const project = resolveProject(workspace, payload.projectId);
      const tagNames = payload.tagNames ?? [];
      ensureTags(workspace, tagNames);
      const task: LearningTask = {
        id: workspace.nextId++,
        projectId: payload.projectId,
        projectName: project?.name,
        title: payload.title,
        description: payload.description,
        status: "TODO",
        dueDate: payload.dueDate,
        tagNames,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      workspace.tasks = [task, ...workspace.tasks];
      workspace.activities = [
        {
          id: workspace.nextActivityId++,
          taskId: task.id,
          type: "TASK_CREATED",
          message: "Task created",
          createdAt: timestamp,
        },
        ...workspace.activities,
      ];
      recalculateProjectStats(workspace);
      return cloneTask(task);
    },

    async updateTask(id, payload) {
      await maybeDelay(scenario);
      const task = findTask(workspace, id);
      const project = resolveProject(workspace, payload.projectId);
      const tagNames = payload.tagNames ?? [];
      ensureTags(workspace, tagNames);
      Object.assign(task, {
        projectId: payload.projectId,
        projectName: project?.name,
        title: payload.title,
        description: payload.description,
        status: payload.status,
        dueDate: payload.dueDate,
        tagNames,
        updatedAt: currentTimestamp(),
      });
      recalculateProjectStats(workspace);
      return cloneTask(task);
    },

    async changeTaskStatus(id, payload) {
      await maybeDelay(scenario);
      const task = findTask(workspace, id);
      task.status = payload.status;
      task.updatedAt = currentTimestamp();
      workspace.activities = [
        {
          id: workspace.nextActivityId++,
          taskId: id,
          type: "STATUS_CHANGED",
          message: `Status changed to ${payload.status}`,
          createdAt: task.updatedAt,
        },
        ...workspace.activities,
      ];
      recalculateProjectStats(workspace);
      return cloneTask(task);
    },

    async listComments(id: number) {
      await maybeDelay(scenario);
      return workspace.comments
        .filter((comment) => comment.taskId === id)
        .map(cloneComment);
    },

    async addComment(id: number, payload: CreateTaskCommentRequest) {
      await maybeDelay(scenario);
      findTask(workspace, id);
      const timestamp = currentTimestamp();
      const comment: TaskComment = {
        id: workspace.nextCommentId++,
        taskId: id,
        content: payload.content,
        author: payload.author || "anonymous",
        createdAt: timestamp,
      };
      workspace.comments = [comment, ...workspace.comments];
      workspace.activities = [
        {
          id: workspace.nextActivityId++,
          taskId: id,
          type: "COMMENT_ADDED",
          message: "Comment added",
          createdAt: timestamp,
        },
        ...workspace.activities,
      ];
      return cloneComment(comment);
    },

    async listActivities(id: number) {
      await maybeDelay(scenario);
      return workspace.activities
        .filter((activity) => activity.taskId === id)
        .map(cloneActivity);
    },

    async deleteTask(id: number) {
      await maybeDelay(scenario);
      workspace.tasks = workspace.tasks.filter((task) => task.id !== id);
      workspace.comments = workspace.comments.filter(
        (comment) => comment.taskId !== id,
      );
      workspace.activities = workspace.activities.filter(
        (activity) => activity.taskId !== id,
      );
      recalculateProjectStats(workspace);
    },
  };
}

function currentTimestamp() {
  return new Date().toISOString().slice(0, 19);
}

function matchesKeyword(task: LearningTask, keyword: string) {
  return task.title?.includes(keyword) || task.description?.includes(keyword);
}

function isOverdue(task: LearningTask) {
  return task.status !== "DONE" && Boolean(task.dueDate && task.dueDate < "2026-05-01");
}

function pageOf<T>(items: T[], page: number, size: number) {
  const safePage = Math.max(page, 1);
  const safeSize = Math.min(Math.max(size, 1), 100);
  const start = Math.min((safePage - 1) * safeSize, items.length);
  const end = Math.min(start + safeSize, items.length);
  return {
    items: items.slice(start, end),
    total: items.length,
    page: safePage,
    size: safeSize,
    totalPages: items.length === 0 ? 0 : Math.ceil(items.length / safeSize),
  };
}

function findTask(workspace: MockWorkspace, id: number) {
  const task = workspace.tasks.find((item) => item.id === id);
  if (!task) {
    throw new Error(`任务不存在: ${id}`);
  }
  return task;
}

function resolveProject(workspace: MockWorkspace, projectId?: number) {
  return projectId
    ? workspace.projects.find((project) => project.id === projectId)
    : undefined;
}

function ensureTags(workspace: MockWorkspace, tagNames: string[]) {
  tagNames.forEach((name) => {
    if (!workspace.tags.some((tag) => tag.name === name)) {
      workspace.tags.push({
        id: Math.max(0, ...workspace.tags.map((tag) => tag.id ?? 0)) + 1,
        name,
        color: "#2563eb",
      });
    }
  });
}

function recalculateProjectStats(workspace: MockWorkspace) {
  workspace.projects.forEach((project) => {
    const projectTasks = workspace.tasks.filter(
      (task) => task.projectId === project.id,
    );
    project.taskCount = projectTasks.length;
    project.doneTaskCount = projectTasks.filter(
      (task) => task.status === "DONE",
    ).length;
  });
}

async function maybeDelay(scenario: MockScenario) {
  if (scenario === "slow") {
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}

function cloneTask(task: LearningTask): LearningTask {
  return {
    ...task,
    tagNames: [...(task.tagNames ?? [])],
  };
}

function cloneProject(project: LearningProject): LearningProject {
  return { ...project };
}

function cloneTag(tag: TaskTag): TaskTag {
  return { ...tag };
}

function cloneComment(comment: TaskComment): TaskComment {
  return { ...comment };
}

function cloneActivity(activity: TaskActivity): TaskActivity {
  return { ...activity };
}
