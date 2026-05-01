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
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('loads tasks and clears the loading flag when the request succeeds', async () => {
    api.listTasks.mockResolvedValue([{ id: 1, title: 'Learn Pinia', status: 'TODO' }])

    const store = useTaskStore()
    await store.loadTasks({ keyword: 'Pinia' })

    expect(store.loading).toBe(false)
    expect(store.filters).toEqual({ keyword: 'Pinia' })
    expect(store.tasks).toEqual([{ id: 1, title: 'Learn Pinia', status: 'TODO' }])
  })

  it('refreshes list and statistics after creating a task', async () => {
    api.createTask.mockResolvedValue({ id: 1, title: 'Created', status: 'TODO' })
    api.listTasks.mockResolvedValue([{ id: 1, title: 'Created', status: 'TODO' }])
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
})
