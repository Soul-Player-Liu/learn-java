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

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('loads tasks and clears the loading flag when the request succeeds', async () => {
    api.listTasks.mockResolvedValue(page([{ id: 1, title: 'Learn Pinia', status: 'TODO' }], 23))

    const store = useTaskStore()
    await store.loadTasks({ keyword: 'Pinia' })

    expect(store.loading).toBe(false)
    expect(store.filters).toEqual({ keyword: 'Pinia' })
    expect(store.tasks).toEqual([{ id: 1, title: 'Learn Pinia', status: 'TODO' }])
    expect(store.taskPage).toEqual({ total: 23, page: 1, size: 20, totalPages: 2 })
  })

  it('refreshes list and statistics after creating a task', async () => {
    api.createTask.mockResolvedValue({ id: 1, title: 'Created', status: 'TODO' })
    api.listTasks.mockResolvedValue(page([{ id: 1, title: 'Created', status: 'TODO' }]))
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
    api.getTask.mockResolvedValue({ id: 1, title: 'Detail', status: 'TODO' })
    api.listComments.mockResolvedValue([{ id: 2, taskId: 1, content: 'Ready' }])
    api.listActivities.mockResolvedValue([
      { id: 3, taskId: 1, type: 'TASK_CREATED', message: 'Task created' },
    ])

    const store = useTaskStore()
    await store.loadTask(1)

    expect(store.selectedTask?.title).toBe('Detail')
    expect(store.comments).toHaveLength(1)
    expect(store.activities).toHaveLength(1)
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
    api.getTask.mockResolvedValue({ id: 1, title: 'Updated', status: 'DOING' })
    api.listComments.mockResolvedValue([])
    api.listActivities.mockResolvedValue([])

    const store = useTaskStore()
    store.selectedTask = { id: 1, title: 'Old', status: 'TODO', tagNames: [] }

    await store.updateTask(1, { title: 'Updated', status: 'DOING' })
    await store.changeTaskStatus(1, { status: 'DOING' })

    expect(api.updateTask).toHaveBeenCalledWith(1, { title: 'Updated', status: 'DOING' })
    expect(api.changeTaskStatus).toHaveBeenCalledWith(1, { status: 'DOING' })
    expect(api.getTask).toHaveBeenCalledTimes(2)
    expect(store.selectedTask?.title).toBe('Updated')
  })

  it('refreshes comments and activities when adding a comment to the selected task', async () => {
    api.listComments.mockResolvedValue([{ id: 2, taskId: 1, content: 'Follow up' }])
    api.listActivities.mockResolvedValue([
      { id: 3, taskId: 1, type: 'COMMENT_ADDED', message: 'Comment added' },
    ])

    const store = useTaskStore()
    store.selectedTask = { id: 1, title: 'Selected', status: 'TODO', tagNames: [] }
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
    store.selectedTask = { id: 1, title: 'Selected', status: 'TODO', tagNames: [] }
    store.comments = [{ id: 2, taskId: 1, content: 'Old' }]
    store.activities = [{ id: 3, taskId: 1, type: 'TASK_CREATED', message: 'Old' }]

    await store.deleteTask(1)

    expect(api.deleteTask).toHaveBeenCalledWith(1)
    expect(store.selectedTask).toBeNull()
    expect(store.comments).toEqual([])
    expect(store.activities).toEqual([])
  })
})
