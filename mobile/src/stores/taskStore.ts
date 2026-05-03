import { defineStore } from "pinia";

import { taskApi } from "@/api/tasks";
import type {
  LearningProject,
  LearningTask,
  ListTaskParams,
  TaskStatistics,
  TaskTag,
} from "@learn-java/task-domain";

export const useMobileTaskStore = defineStore("mobile-tasks", {
  state: () => ({
    tasks: [] as LearningTask[],
    selectedTask: null as LearningTask | null,
    projects: [] as LearningProject[],
    tags: [] as TaskTag[],
    statistics: null as TaskStatistics | null,
    taskPage: {
      total: 0,
      page: 1,
      size: 20,
      totalPages: 0,
    },
    loading: false,
  }),
  actions: {
    async loadDashboard() {
      this.loading = true;
      try {
        const [statistics, tasks, projects] = await Promise.all([
          taskApi.getTaskStatistics(),
          taskApi.listTasks({ page: 1, size: 5 }),
          taskApi.listProjects(),
        ]);
        this.statistics = statistics;
        this.tasks = tasks.items;
        this.taskPage = {
          total: tasks.total,
          page: tasks.page,
          size: tasks.size,
          totalPages: tasks.totalPages,
        };
        this.projects = projects;
      } finally {
        this.loading = false;
      }
    },
    async loadTasks(params: ListTaskParams = {}) {
      this.loading = true;
      try {
        const page = await taskApi.listTasks({ page: 1, size: 20, ...params });
        this.tasks = page.items;
        this.taskPage = {
          total: page.total,
          page: page.page,
          size: page.size,
          totalPages: page.totalPages,
        };
      } finally {
        this.loading = false;
      }
    },
    async loadTask(id: number) {
      this.selectedTask = await taskApi.getTask(id);
    },
    async loadProjects() {
      this.projects = await taskApi.listProjects();
    },
    async loadTags() {
      this.tags = await taskApi.listTags();
    },
    async changeTaskStatus(id: number, status: LearningTask["status"]) {
      await taskApi.changeTaskStatus(id, { status });
      await this.loadTask(id);
      await this.loadTasks();
    },
  },
});
