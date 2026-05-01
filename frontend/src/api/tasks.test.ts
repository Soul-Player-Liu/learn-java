import { beforeEach, describe, expect, it, vi } from 'vitest'

const sdk = vi.hoisted(() => ({
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

vi.mock('./generated', () => sdk)
vi.mock('./runtime/sdkClient', () => ({}))

import { addComment, getTaskStatistics, listProjects, listTasks } from './tasks'

describe('task api wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('normalizes task list data returned by the generated SDK', async () => {
    sdk.listTasks.mockResolvedValue({
      data: [{ id: 1, title: 'Learn testing', status: 'TODO', description: null }],
    })

    await expect(
      listTasks({ keyword: 'testing', projectId: 2, tag: 'backend', overdueOnly: false }),
    ).resolves.toEqual([{ id: 1, title: 'Learn testing', status: 'TODO', description: null, tagNames: [] }])
    expect(sdk.listTasks).toHaveBeenCalledWith({
      query: {
        status: undefined,
        projectId: 2,
        keyword: 'testing',
        overdueOnly: undefined,
        tag: 'backend',
      },
      throwOnError: true,
    })
  })

  it('normalizes projects and task comments', async () => {
    sdk.listProjects.mockResolvedValue({
      data: [{ id: 1, name: 'Backend', taskCount: 2 }],
    })
    sdk.addComment.mockResolvedValue({
      data: { id: 9, taskId: 1, content: 'done' },
    })

    await expect(listProjects()).resolves.toEqual([
      { id: 1, name: 'Backend', taskCount: 2, doneTaskCount: 0 },
    ])
    await expect(addComment(1, { content: 'done' })).resolves.toEqual({
      id: 9,
      taskId: 1,
      content: 'done',
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
