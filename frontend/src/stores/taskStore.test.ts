import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const api = vi.hoisted(() => ({
  changeTaskStatus: vi.fn(),
  createTask: vi.fn(),
  deleteTask: vi.fn(),
  getTask: vi.fn(),
  getTaskStatistics: vi.fn(),
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
})
