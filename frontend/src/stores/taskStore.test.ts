import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const api = vi.hoisted(() => ({
  addComment: vi.fn(),
  changeTaskStatus: vi.fn(),
  createProject: vi.fn(),
  createTask: vi.fn(),
  deleteTask: vi.fn(),
  getProject: vi.fn(),
  getTask: vi.fn(),
  getTaskStatistics: vi.fn(),
  listActivities: vi.fn(),
  listComments: vi.fn(),
  listProjects: vi.fn(),
  listTags: vi.fn(),
  listTasks: vi.fn(),
  updateTask: vi.fn(),
}))

vi.mock('@/api/tasks', () => api)

import { useTaskStore } from './taskStore'

describe('task store', () => {
  function page<T>(items: T[], total = items.length) {
    return { items, total, page: 1, size: 20, totalPages: total > 0 ? Math.ceil(total / 20) : 0 }
  }

  const now = '2026-05-01T09:00:00'

  function task(id: number, title: string, status: 'TODO' | 'DOING' | 'DONE') {
    return { id, title, status, tagNames: [], createdAt: now, updatedAt: now }
  }

  function project(id: number, name: string) {
    return {
      id,
      name,
      taskCount: 0,
      doneTaskCount: 0,
      createdAt: now,
      updatedAt: now,
    }
  }

  function comment(id: number, taskId: number, content: string) {
    return { id, taskId, content, author: 'mentor', createdAt: now }
  }

  function activity(id: number, taskId: number, type: string, message: string) {
    return { id, taskId, type, message, createdAt: now }
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('loads tasks and clears the loading flag when the request succeeds', async () => {
    api.listTasks.mockResolvedValue(page([task(1, 'Learn Pinia', 'TODO')], 23))

    const store = useTaskStore()
    await store.loadTasks({ keyword: 'Pinia' })

    expect(store.loading).toBe(false)
    expect(store.filters).toEqual({ keyword: 'Pinia' })
    expect(store.tasks).toEqual([task(1, 'Learn Pinia', 'TODO')])
    expect(store.taskPage).toEqual({ total: 23, page: 1, size: 20, totalPages: 2 })
  })

  it('refreshes list and statistics after creating a task', async () => {
    api.createTask.mockResolvedValue(task(1, 'Created', 'TODO'))
    api.listTasks.mockResolvedValue(page([task(1, 'Created', 'TODO')]))
    api.listProjects.mockResolvedValue([])
    api.listTags.mockResolvedValue([])
    api.getTaskStatistics.mockResolvedValue({
      total: 1,
      todo: 1,
      doing: 0,
      done: 0,
      overdue: 0,
      dueSoon: 0,
    })

    const store = useTaskStore()
    await store.createTask({ title: 'Created' })

    expect(api.createTask).toHaveBeenCalledWith({ title: 'Created' })
    expect(store.tasks).toHaveLength(1)
    expect(store.statistics?.total).toBe(1)
  })

  it('loads task detail with comments and activities', async () => {
    api.getTask.mockResolvedValue(task(1, 'Detail', 'TODO'))
    api.listComments.mockResolvedValue([comment(2, 1, 'Ready')])
    api.listActivities.mockResolvedValue([
      activity(3, 1, 'TASK_CREATED', 'Task created'),
    ])

    const store = useTaskStore()
    await store.loadTask(1)

    expect(store.selectedTask?.title).toBe('Detail')
    expect(store.comments).toHaveLength(1)
    expect(store.activities).toHaveLength(1)
  })

  it('loads a project and scopes task filters to that project', async () => {
    api.getProject.mockResolvedValue(project(2, 'Frontend'))
    api.listTasks.mockResolvedValue(page([task(3, 'Project task', 'TODO')]))

    const store = useTaskStore()
    store.filters = { keyword: 'Project' }
    await store.loadProject(2)

    expect(store.projectLoading).toBe(false)
    expect(store.selectedProject?.id).toBe(2)
    expect(api.listTasks).toHaveBeenCalledWith({ keyword: 'Project', projectId: 2 })
    expect(store.tasks).toEqual([{ id: 3, title: 'Project task', status: 'TODO' }])
  })

  it('refreshes projects after creating a project and returns the created record', async () => {
    const createdProject = project(4, 'Mock platform')
    api.createProject.mockResolvedValue(createdProject)
    api.listProjects.mockResolvedValue([createdProject])

    const store = useTaskStore()
    await expect(store.createProject({ name: 'Mock platform' })).resolves.toEqual(createdProject)

    expect(api.createProject).toHaveBeenCalledWith({ name: 'Mock platform' })
    expect(api.listProjects).toHaveBeenCalled()
    expect(store.projects).toEqual([createdProject])
  })

  it('updates selected task detail after task mutations', async () => {
    api.listTasks.mockResolvedValue(page([]))
    api.listProjects.mockResolvedValue([])
    api.listTags.mockResolvedValue([])
    api.getTaskStatistics.mockResolvedValue({
      total: 0,
      todo: 0,
      doing: 0,
      done: 0,
      overdue: 0,
      dueSoon: 0,
    })
    api.getTask.mockResolvedValue(task(1, 'Updated', 'DOING'))
    api.listComments.mockResolvedValue([])
    api.listActivities.mockResolvedValue([])

    const store = useTaskStore()
    store.selectedTask = task(1, 'Old', 'TODO')

    await store.updateTask(1, { title: 'Updated', status: 'DOING' })
    await store.changeTaskStatus(1, { status: 'DOING' })

    expect(api.updateTask).toHaveBeenCalledWith(1, { title: 'Updated', status: 'DOING' })
    expect(api.changeTaskStatus).toHaveBeenCalledWith(1, { status: 'DOING' })
    expect(api.getTask).toHaveBeenCalledTimes(2)
    expect(store.selectedTask?.title).toBe('Updated')
  })

  it('refreshes comments and activities when adding a comment to the selected task', async () => {
    api.listComments.mockResolvedValue([comment(2, 1, 'Follow up')])
    api.listActivities.mockResolvedValue([
      activity(3, 1, 'COMMENT_ADDED', 'Comment added'),
    ])

    const store = useTaskStore()
    store.selectedTask = task(1, 'Selected', 'TODO')
    await store.addComment(1, { content: 'Follow up' })

    expect(api.addComment).toHaveBeenCalledWith(1, { content: 'Follow up' })
    expect(store.comments).toHaveLength(1)
    expect(store.activities).toHaveLength(1)
  })

  it('clears selected detail after deleting the selected task', async () => {
    api.listTasks.mockResolvedValue(page([]))
    api.listProjects.mockResolvedValue([])
    api.getTaskStatistics.mockResolvedValue({
      total: 0,
      todo: 0,
      doing: 0,
      done: 0,
      overdue: 0,
      dueSoon: 0,
    })

    const store = useTaskStore()
    store.selectedTask = task(1, 'Selected', 'TODO')
    store.comments = [comment(2, 1, 'Old')]
    store.activities = [activity(3, 1, 'TASK_CREATED', 'Old')]

    await store.deleteTask(1)

    expect(api.deleteTask).toHaveBeenCalledWith(1)
    expect(store.selectedTask).toBeNull()
    expect(store.comments).toEqual([])
    expect(store.activities).toEqual([])
  })
})
