import { defineStore } from 'pinia'

import {
  addComment,
  changeTaskStatus,
  createProject,
  createTask,
  deleteTask,
  getProject,
  getTask,
  getTaskStatistics,
  listActivities,
  listComments,
  listProjects,
  listTags,
  listTasks,
  updateTask,
} from '@/api/tasks'
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
    taskPage: {
      total: 0,
      page: 1,
      size: 20,
      totalPages: 0,
    },
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
        const pageResult = await listTasks(this.filters)
        this.tasks = pageResult.items
        this.taskPage = {
          total: pageResult.total,
          page: pageResult.page,
          size: pageResult.size,
          totalPages: pageResult.totalPages,
        }
      } finally {
        this.loading = false
      }
    },
    async loadTask(id: number) {
      this.detailLoading = true
      try {
        const [task, comments, activities] = await Promise.all([
          getTask(id),
          listComments(id),
          listActivities(id),
        ])
        this.selectedTask = task
        this.comments = comments
        this.activities = activities
      } finally {
        this.detailLoading = false
      }
    },
    async loadStatistics() {
      this.statistics = await getTaskStatistics()
    },
    async loadProjects() {
      this.projects = await listProjects()
    },
    async loadProject(id: number) {
      this.projectLoading = true
      try {
        this.selectedProject = await getProject(id)
        await this.loadTasks({ ...this.filters, projectId: id })
      } finally {
        this.projectLoading = false
      }
    },
    async createProject(payload: CreateLearningProjectRequest) {
      const project = await createProject(payload)
      await this.loadProjects()
      return project
    },
    async loadTags() {
      this.tags = await listTags()
    },
    async createTask(payload: CreateLearningTaskRequest) {
      await createTask(payload)
      await this.loadTasks()
      await this.loadStatistics()
      await Promise.all([this.loadProjects(), this.loadTags()])
    },
    async updateTask(id: number, payload: UpdateLearningTaskRequest) {
      await updateTask(id, payload)
      await this.loadTasks()
      await this.loadStatistics()
      await Promise.all([this.loadProjects(), this.loadTags()])
      if (this.selectedTask?.id === id) {
        await this.loadTask(id)
      }
    },
    async changeTaskStatus(id: number, payload: ChangeTaskStatusRequest) {
      await changeTaskStatus(id, payload)
      await this.loadTasks()
      await this.loadStatistics()
      await this.loadProjects()
      if (this.selectedTask?.id === id) {
        await this.loadTask(id)
      }
    },
    async addComment(id: number, payload: CreateTaskCommentRequest) {
      await addComment(id, payload)
      if (this.selectedTask?.id === id) {
        const [comments, activities] = await Promise.all([listComments(id), listActivities(id)])
        this.comments = comments
        this.activities = activities
      }
    },
    async deleteTask(id: number) {
      await deleteTask(id)
      await this.loadTasks()
      await this.loadStatistics()
      await this.loadProjects()
      if (this.selectedTask?.id === id) {
        this.selectedTask = null
        this.comments = []
        this.activities = []
      }
    },
  },
})
