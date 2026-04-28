import { defineStore } from 'pinia'

import {
  changeTaskStatus,
  createTask,
  deleteTask,
  getTask,
  getTaskStatistics,
  listTasks,
  updateTask,
} from '@/api/tasks'
import type {
  ChangeTaskStatusRequest,
  CreateLearningTaskRequest,
  LearningTask,
  ListTaskParams,
  TaskStatistics,
  UpdateLearningTaskRequest,
} from '@/types/task'

export const useTaskStore = defineStore('tasks', {
  state: () => ({
    tasks: [] as LearningTask[],
    selectedTask: null as LearningTask | null,
    statistics: null as TaskStatistics | null,
    filters: {
      keyword: '',
      status: undefined,
      overdueOnly: false,
    } as ListTaskParams,
    loading: false,
    detailLoading: false,
  }),
  actions: {
    async loadTasks(filters?: ListTaskParams) {
      this.loading = true
      try {
        this.filters = { ...(filters ?? this.filters) }
        this.tasks = await listTasks(this.filters)
      } finally {
        this.loading = false
      }
    },
    async loadTask(id: number) {
      this.detailLoading = true
      try {
        this.selectedTask = await getTask(id)
      } finally {
        this.detailLoading = false
      }
    },
    async loadStatistics() {
      this.statistics = await getTaskStatistics()
    },
    async createTask(payload: CreateLearningTaskRequest) {
      await createTask(payload)
      await this.loadTasks()
      await this.loadStatistics()
    },
    async updateTask(id: number, payload: UpdateLearningTaskRequest) {
      await updateTask(id, payload)
      await this.loadTasks()
      await this.loadStatistics()
      if (this.selectedTask?.id === id) {
        await this.loadTask(id)
      }
    },
    async changeTaskStatus(id: number, payload: ChangeTaskStatusRequest) {
      await changeTaskStatus(id, payload)
      await this.loadTasks()
      await this.loadStatistics()
      if (this.selectedTask?.id === id) {
        await this.loadTask(id)
      }
    },
    async deleteTask(id: number) {
      await deleteTask(id)
      await this.loadTasks()
      await this.loadStatistics()
      if (this.selectedTask?.id === id) {
        this.selectedTask = null
      }
    },
  },
})
