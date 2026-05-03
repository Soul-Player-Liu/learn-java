import { defineStore } from "pinia";
import { createTaskUseCases, defaultTaskPage } from "@learn-java/task-api";

import { taskApi } from "@/api/tasks";
import type {
  LearningProject,
  LearningTask,
  TaskActivity,
  TaskComment,
  ListTaskParams,
  TaskStatistics,
  TaskTag,
} from "@learn-java/task-domain";

const taskUseCases = createTaskUseCases(taskApi);

export const useMobileTaskStore = defineStore("mobile-tasks", {
  state: () => ({
    tasks: [] as LearningTask[],
    selectedTask: null as LearningTask | null,
    selectedProject: null as LearningProject | null,
    projects: [] as LearningProject[],
    tags: [] as TaskTag[],
    comments: [] as TaskComment[],
    activities: [] as TaskActivity[],
    statistics: null as TaskStatistics | null,
    taskPage: { ...defaultTaskPage },
    filters: {
      keyword: "",
      status: undefined,
      projectId: undefined,
      overdueOnly: false,
      tag: undefined,
    } as ListTaskParams,
    loading: false,
  }),
  actions: {
    async loadDashboard() {
      this.loading = true;
      try {
        await taskUseCases.loadDashboard(this);
      } finally {
        this.loading = false;
      }
    },
    async loadTasks(params: ListTaskParams = {}) {
      this.loading = true;
      try {
        this.filters = { page: 1, size: 20, ...params };
        await taskUseCases.loadTasks(this, this.filters);
      } finally {
        this.loading = false;
      }
    },
    async loadTask(id: number) {
      await taskUseCases.loadTaskDetail(this, id);
    },
    async loadProjects() {
      this.projects = await taskApi.listProjects();
    },
    async loadTags() {
      this.tags = await taskApi.listTags();
    },
    async changeTaskStatus(id: number, status: LearningTask["status"]) {
      await taskUseCases.changeTaskStatus(this, id, status);
    },
  },
});
