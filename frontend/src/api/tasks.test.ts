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
} from './tasks'

describe('task api wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function ok<T>(data: T) {
    return { code: 'OK', data }
  }

  function page<T>(items: T[]) {
    return { items, total: items.length, page: 1, size: 20, totalPages: items.length > 0 ? 1 : 0 }
  }

  it('normalizes task list data returned by the generated SDK', async () => {
    sdk.listTasks.mockResolvedValue({
      data: ok(page([{ id: 1, title: 'Learn testing', status: 'TODO', description: null }])),
    })

    await expect(
      listTasks({ keyword: 'testing', projectId: 2, tag: 'backend', overdueOnly: false }),
    ).resolves.toEqual({
      items: [{ id: 1, title: 'Learn testing', status: 'TODO', description: null, tagNames: [] }],
      total: 1,
      page: 1,
      size: 20,
      totalPages: 1,
    })
    expect(sdk.listTasks).toHaveBeenCalledWith({
      query: {
        status: undefined,
        projectId: 2,
        keyword: 'testing',
        overdueOnly: undefined,
        tag: 'backend',
        page: undefined,
        size: undefined,
      },
      throwOnError: true,
    })
  })

  it('normalizes projects and task comments', async () => {
    sdk.listProjects.mockResolvedValue({
      data: ok(page([{ id: 1, name: 'Backend', taskCount: 2 }])),
    })
    sdk.addComment.mockResolvedValue({
      data: ok({ id: 9, taskId: 1, content: 'done' }),
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
      data: ok({ total: 2, todo: 1 }),
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

  it('wraps task detail and mutation SDK calls', async () => {
    const task = { id: 1, title: 'Task', status: 'TODO', tagNames: ['backend'] }
    sdk.getTask.mockResolvedValue({ data: ok(task) })
    sdk.createTask.mockResolvedValue({ data: ok(task) })
    sdk.updateTask.mockResolvedValue({ data: ok({ ...task, title: 'Updated' }) })
    sdk.changeTaskStatus.mockResolvedValue({ data: ok({ ...task, status: 'DOING' }) })
    sdk.deleteTask.mockResolvedValue({ data: ok(null) })

    await expect(getTask(1)).resolves.toEqual(task)
    await expect(createTask({ title: 'Task' })).resolves.toEqual(task)
    await expect(updateTask(1, { title: 'Updated', status: 'TODO' })).resolves.toMatchObject({
      title: 'Updated',
    })
    await expect(changeTaskStatus(1, { status: 'DOING' })).resolves.toMatchObject({ status: 'DOING' })
    await expect(deleteTask(1)).resolves.toBeUndefined()

    expect(sdk.getTask).toHaveBeenCalledWith({ path: { id: 1 }, throwOnError: true })
    expect(sdk.createTask).toHaveBeenCalledWith({ body: { title: 'Task' }, throwOnError: true })
    expect(sdk.updateTask).toHaveBeenCalledWith({
      path: { id: 1 },
      body: { title: 'Updated', status: 'TODO' },
      throwOnError: true,
    })
    expect(sdk.changeTaskStatus).toHaveBeenCalledWith({
      path: { id: 1 },
      body: { status: 'DOING' },
      throwOnError: true,
    })
    expect(sdk.deleteTask).toHaveBeenCalledWith({ path: { id: 1 }, throwOnError: true })
  })

  it('wraps project tag comment and activity list calls', async () => {
    sdk.getProject.mockResolvedValue({ data: ok({ id: 1, name: 'Backend' }) })
    sdk.createProject.mockResolvedValue({ data: ok({ id: 2, name: 'Frontend', doneTaskCount: 1 }) })
    sdk.listTags.mockResolvedValue({ data: ok(page([{ id: 3, name: 'sql' }])) })
    sdk.listComments.mockResolvedValue({ data: ok(page([{ id: 4, taskId: 1, content: 'Ready' }])) })
    sdk.listActivities.mockResolvedValue({
      data: ok(page([{ id: 5, taskId: 1, type: 'TASK_CREATED', message: 'Created' }])),
    })

    await expect(getProject(1)).resolves.toEqual({ id: 1, name: 'Backend', taskCount: 0, doneTaskCount: 0 })
    await expect(createProject({ name: 'Frontend' })).resolves.toEqual({
      id: 2,
      name: 'Frontend',
      taskCount: 0,
      doneTaskCount: 1,
    })
    await expect(listTags()).resolves.toEqual([{ id: 3, name: 'sql' }])
    await expect(listComments(1)).resolves.toEqual([{ id: 4, taskId: 1, content: 'Ready' }])
    await expect(listActivities(1)).resolves.toEqual([
      { id: 5, taskId: 1, type: 'TASK_CREATED', message: 'Created' },
    ])
  })

  it('rejects incomplete server payloads before exposing them to the UI', async () => {
    sdk.getTask.mockResolvedValue({ data: ok({ id: 1, status: 'TODO' }) })
    sdk.getProject.mockResolvedValue({ data: ok({ id: 1 }) })
    sdk.listTags.mockResolvedValue({ data: ok(page([{ id: 1 }])) })
    sdk.listComments.mockResolvedValue({ data: ok(page([{ id: 1, taskId: 1 }])) })
    sdk.listActivities.mockResolvedValue({ data: ok(page([{ id: 1, taskId: 1, type: 'TASK_CREATED' }])) })

    await expect(getTask(1)).rejects.toThrow('任务数据不完整')
    await expect(getProject(1)).rejects.toThrow('项目数据不完整')
    await expect(listTags()).rejects.toThrow('标签数据不完整')
    await expect(listComments(1)).rejects.toThrow('评论数据不完整')
    await expect(listActivities(1)).rejects.toThrow('活动数据不完整')
  })
})
