import { createFetchTaskApi } from '@learn-java/task-api'

const taskApi = createFetchTaskApi(import.meta.env.VITE_API_BASE_URL ?? '')

export const listTasks = taskApi.listTasks
export const getTask = taskApi.getTask
export const getTaskStatistics = taskApi.getTaskStatistics
export const listProjects = taskApi.listProjects
export const getProject = taskApi.getProject
export const createProject = taskApi.createProject
export const listTags = taskApi.listTags
export const createTask = taskApi.createTask
export const updateTask = taskApi.updateTask
export const changeTaskStatus = taskApi.changeTaskStatus
export const listComments = taskApi.listComments
export const addComment = taskApi.addComment
export const listActivities = taskApi.listActivities
export const deleteTask = taskApi.deleteTask
