import { beforeEach, describe, expect, it, vi } from 'vitest'

const sdk = vi.hoisted(() => ({
  changeTaskStatus: vi.fn(),
  createTask: vi.fn(),
  deleteTask: vi.fn(),
  getTask: vi.fn(),
  getTaskStatistics: vi.fn(),
  listTasks: vi.fn(),
  updateTask: vi.fn(),
}))

vi.mock('./generated', () => sdk)
vi.mock('./runtime/sdkClient', () => ({}))

import { getTaskStatistics, listTasks } from './tasks'

describe('task api wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('normalizes task list data returned by the generated SDK', async () => {
    sdk.listTasks.mockResolvedValue({
      data: [{ id: 1, title: 'Learn testing', status: 'TODO', description: null }],
    })

    await expect(listTasks({ keyword: 'testing', overdueOnly: false })).resolves.toEqual([
      { id: 1, title: 'Learn testing', status: 'TODO', description: null },
    ])
    expect(sdk.listTasks).toHaveBeenCalledWith({
      query: {
        status: undefined,
        keyword: 'testing',
        overdueOnly: undefined,
      },
      throwOnError: true,
    })
  })

  it('fills missing statistic fields with zero', async () => {
    sdk.getTaskStatistics.mockResolvedValue({
      data: { total: 2, todo: 1 },
    })

    await expect(getTaskStatistics()).resolves.toEqual({
      total: 2,
      todo: 1,
      doing: 0,
      done: 0,
      overdue: 0,
      dueSoon: 0,
    })
  })
})
