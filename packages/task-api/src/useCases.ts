import type {
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
  TaskStatus,
  TaskTag,
  UpdateLearningTaskRequest,
} from "@learn-java/task-domain";

import type { TaskApi } from "./index";

export interface TaskCollectionState {
  tasks: LearningTask[];
  taskPage: TaskPageMeta;
  projects: LearningProject[];
  tags: TaskTag[];
  statistics: TaskStatistics | null;
}

export interface TaskDetailState {
  selectedTask: LearningTask | null;
  comments: TaskComment[];
  activities: TaskActivity[];
}

export interface TaskWorkspaceState
  extends TaskCollectionState,
    TaskDetailState {
  selectedProject: LearningProject | null;
  filters: ListTaskParams;
}

export type TaskPageMeta = Omit<PageResult<LearningTask>, "items">;

export const defaultTaskPage: TaskPageMeta = {
  total: 0,
  page: 1,
  size: 20,
  totalPages: 0,
};

export function assignTaskPage(
  state: TaskCollectionState,
  page: PageResult<LearningTask>,
) {
  state.tasks = page.items;
  state.taskPage = {
    total: page.total,
    page: page.page,
    size: page.size,
    totalPages: page.totalPages,
  };
}

export function createTaskUseCases(api: TaskApi) {
  return {
    async loadTasks(
      state: TaskCollectionState,
      params: ListTaskParams = {},
    ) {
      const page = await api.listTasks(params);
      assignTaskPage(state, page);
      return page;
    },

    async loadDashboard(state: TaskCollectionState) {
      const [statistics, tasks, projects] = await Promise.all([
        api.getTaskStatistics(),
        api.listTasks({ page: 1, size: 5 }),
        api.listProjects(),
      ]);
      state.statistics = statistics;
      assignTaskPage(state, tasks);
      state.projects = projects;
      return { statistics, tasks, projects };
    },

    async loadTaskDetail(state: TaskDetailState, id: number) {
      const [task, comments, activities] = await Promise.all([
        api.getTask(id),
        api.listComments(id),
        api.listActivities(id),
      ]);
      state.selectedTask = task;
      state.comments = comments;
      state.activities = activities;
      return { task, comments, activities };
    },

    async loadProject(state: TaskWorkspaceState, id: number) {
      state.selectedProject = await api.getProject(id);
      await this.loadTasks(state, { ...state.filters, projectId: id });
      return state.selectedProject;
    },

    async createProject(
      state: TaskCollectionState,
      payload: CreateLearningProjectRequest,
    ) {
      const project = await api.createProject(payload);
      state.projects = await api.listProjects();
      return project;
    },

    async createTask(
      state: TaskCollectionState,
      payload: CreateLearningTaskRequest,
      params: ListTaskParams = {},
    ) {
      const task = await api.createTask(payload);
      await this.refreshTaskCollections(state, params, true);
      return task;
    },

    async updateTask(
      state: TaskWorkspaceState,
      id: number,
      payload: UpdateLearningTaskRequest,
    ) {
      const task = await api.updateTask(id, payload);
      await this.refreshTaskCollections(state, state.filters, true);
      if (state.selectedTask?.id === id) {
        await this.loadTaskDetail(state, id);
      }
      return task;
    },

    async changeTaskStatus(
      state: TaskWorkspaceState,
      id: number,
      status: TaskStatus,
    ) {
      const task = await api.changeTaskStatus(id, { status });
      await this.refreshTaskCollections(state, state.filters, false);
      if (state.selectedTask?.id === id) {
        await this.loadTaskDetail(state, id);
      }
      return task;
    },

    async addComment(
      state: TaskDetailState,
      id: number,
      payload: CreateTaskCommentRequest,
    ) {
      const comment = await api.addComment(id, payload);
      if (state.selectedTask?.id === id) {
        const [comments, activities] = await Promise.all([
          api.listComments(id),
          api.listActivities(id),
        ]);
        state.comments = comments;
        state.activities = activities;
      }
      return comment;
    },

    async deleteTask(state: TaskWorkspaceState, id: number) {
      await api.deleteTask(id);
      await this.refreshTaskCollections(state, state.filters, false);
      if (state.selectedTask?.id === id) {
        state.selectedTask = null;
        state.comments = [];
        state.activities = [];
      }
    },

    async refreshTaskCollections(
      state: TaskCollectionState,
      params: ListTaskParams = {},
      includeTags = false,
    ) {
      const [tasks, statistics, projects, tags] = await Promise.all([
        api.listTasks(params),
        api.getTaskStatistics(),
        api.listProjects(),
        includeTags ? api.listTags() : Promise.resolve(state.tags),
      ]);
      assignTaskPage(state, tasks);
      state.statistics = statistics;
      state.projects = projects;
      state.tags = tags;
      return { tasks, statistics, projects, tags };
    },
  };
}
