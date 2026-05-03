import { defineStore } from 'pinia'
import { createTaskUseCases, defaultTaskPage } from '@learn-java/task-api'

import * as taskApi from '@/api/tasks'
import type {
  ChangeTaskStatusRequest,
  CreateLearningProjectRequest,
  CreateLearningTaskRequest,
  CreateTaskCommentRequest,
  LearningProject,
  LearningTask,
  ListTaskParams,
  TaskActivity,
  TaskComment,
  TaskStatistics,
  TaskTag,
  UpdateLearningTaskRequest,
} from '@/types/task'

const taskUseCases = createTaskUseCases(taskApi)

export const useTaskStore = defineStore('tasks', {
  state: () => ({
    tasks: [] as LearningTask[],
    selectedTask: null as LearningTask | null,
    projects: [] as LearningProject[],
    selectedProject: null as LearningProject | null,
    tags: [] as TaskTag[],
    comments: [] as TaskComment[],
    activities: [] as TaskActivity[],
    statistics: null as TaskStatistics | null,
    taskPage: { ...defaultTaskPage },
    filters: {
      keyword: '',
      status: undefined,
      projectId: undefined,
      overdueOnly: false,
      tag: undefined,
    } as ListTaskParams,
    loading: false,
    detailLoading: false,
    projectLoading: false,
  }),
  actions: {
    async loadTasks(filters?: ListTaskParams) {
      this.loading = true
      try {
        this.filters = { ...(filters ?? this.filters) }
        await taskUseCases.loadTasks(this, this.filters)
      } finally {
        this.loading = false
      }
    },
    async loadTask(id: number) {
      this.detailLoading = true
      try {
        await taskUseCases.loadTaskDetail(this, id)
      } finally {
        this.detailLoading = false
      }
    },
    async loadStatistics() {
      this.statistics = await taskApi.getTaskStatistics()
    },
    async loadProjects() {
      this.projects = await taskApi.listProjects()
    },
    async loadProject(id: number) {
      this.projectLoading = true
      try {
        await taskUseCases.loadProject(this, id)
      } finally {
        this.projectLoading = false
      }
    },
    async createProject(payload: CreateLearningProjectRequest) {
      return taskUseCases.createProject(this, payload)
    },
    async loadTags() {
      this.tags = await taskApi.listTags()
    },
    async createTask(payload: CreateLearningTaskRequest) {
      await taskUseCases.createTask(this, payload, this.filters)
    },
    async updateTask(id: number, payload: UpdateLearningTaskRequest) {
      await taskUseCases.updateTask(this, id, payload)
    },
    async changeTaskStatus(id: number, payload: ChangeTaskStatusRequest) {
      await taskUseCases.changeTaskStatus(this, id, payload.status)
    },
    async addComment(id: number, payload: CreateTaskCommentRequest) {
      await taskUseCases.addComment(this, id, payload)
    },
    async deleteTask(id: number) {
      await taskUseCases.deleteTask(this, id)
    },
  },
})
