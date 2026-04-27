import { defineStore } from 'pinia'

import { createTask, deleteTask, listTasks, updateTask } from '@/api/tasks'
import type { CreateLearningTaskRequest, LearningTask, UpdateLearningTaskRequest } from '@/types/task'

export const useTaskStore = defineStore('tasks', {
  state: () => ({
    tasks: [] as LearningTask[],
    loading: false,
  }),
  actions: {
    async loadTasks() {
      this.loading = true
      try {
        this.tasks = await listTasks()
      } finally {
        this.loading = false
      }
    },
    async createTask(payload: CreateLearningTaskRequest) {
      await createTask(payload)
      await this.loadTasks()
    },
    async updateTask(id: number, payload: UpdateLearningTaskRequest) {
      await updateTask(id, payload)
      await this.loadTasks()
    },
    async deleteTask(id: number) {
      await deleteTask(id)
      await this.loadTasks()
    },
  },
})
