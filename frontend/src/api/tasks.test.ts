import { beforeEach, describe, expect, it, vi } from 'vitest'

const webRequest = vi.hoisted(() => vi.fn())

vi.mock('./adapters/webRequest', () => ({ webRequest }))

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
    webRequest.mockResolvedValue(
      ok(page([{ id: 1, title: 'Learn testing', status: 'TODO', description: null }])),
    )

    await expect(
      listTasks({ keyword: 'testing', projectId: 2, tag: 'backend', overdueOnly: false }),
    ).resolves.toEqual({
      items: [{ id: 1, title: 'Learn testing', status: 'TODO', description: null, tagNames: [] }],
      total: 1,
      page: 1,
      size: 20,
      totalPages: 1,
    })
    expect(webRequest).toHaveBeenCalledWith({
      path: '/api/tasks',
      query: {
        status: undefined,
        projectId: 2,
        keyword: 'testing',
        overdueOnly: undefined,
        tag: 'backend',
        page: undefined,
        size: undefined,
      },
    })
  })

  it('normalizes projects and task comments', async () => {
    webRequest
      .mockResolvedValueOnce(ok(page([{ id: 1, name: 'Backend', taskCount: 2 }])))
      .mockResolvedValueOnce(ok({ id: 9, taskId: 1, content: 'done' }))

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
    webRequest.mockResolvedValue(ok({ total: 2, todo: 1 }))

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
    webRequest
      .mockResolvedValueOnce(ok(task))
      .mockResolvedValueOnce(ok(task))
      .mockResolvedValueOnce(ok({ ...task, title: 'Updated' }))
      .mockResolvedValueOnce(ok({ ...task, status: 'DOING' }))
      .mockResolvedValueOnce(ok(null))

    await expect(getTask(1)).resolves.toEqual(task)
    await expect(createTask({ title: 'Task' })).resolves.toEqual(task)
    await expect(updateTask(1, { title: 'Updated', status: 'TODO' })).resolves.toMatchObject({
      title: 'Updated',
    })
    await expect(changeTaskStatus(1, { status: 'DOING' })).resolves.toMatchObject({ status: 'DOING' })
    await expect(deleteTask(1)).resolves.toBeUndefined()

    expect(webRequest).toHaveBeenNthCalledWith(1, { path: '/api/tasks/1' })
    expect(webRequest).toHaveBeenNthCalledWith(2, {
      method: 'POST',
      path: '/api/tasks',
      body: { title: 'Task' },
    })
    expect(webRequest).toHaveBeenNthCalledWith(3, {
      method: 'PUT',
      path: '/api/tasks/1',
      body: { title: 'Updated', status: 'TODO' },
    })
    expect(webRequest).toHaveBeenNthCalledWith(4, {
      method: 'PATCH',
      path: '/api/tasks/1/status',
      body: { status: 'DOING' },
    })
    expect(webRequest).toHaveBeenNthCalledWith(5, { method: 'DELETE', path: '/api/tasks/1' })
  })

  it('wraps project tag comment and activity list calls', async () => {
    webRequest
      .mockResolvedValueOnce(ok({ id: 1, name: 'Backend' }))
      .mockResolvedValueOnce(ok({ id: 2, name: 'Frontend', doneTaskCount: 1 }))
      .mockResolvedValueOnce(ok(page([{ id: 3, name: 'sql' }])))
      .mockResolvedValueOnce(ok(page([{ id: 4, taskId: 1, content: 'Ready' }])))
      .mockResolvedValueOnce(ok(page([{ id: 5, taskId: 1, type: 'TASK_CREATED', message: 'Created' }])))

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
    webRequest
      .mockResolvedValueOnce(ok({ id: 1, status: 'TODO' }))
      .mockResolvedValueOnce(ok({ id: 1 }))
      .mockResolvedValueOnce(ok(page([{ id: 1 }])))
      .mockResolvedValueOnce(ok(page([{ id: 1, taskId: 1 }])))
      .mockResolvedValueOnce(ok(page([{ id: 1, taskId: 1, type: 'TASK_CREATED' }])))

    await expect(getTask(1)).rejects.toThrow('任务数据不完整')
    await expect(getProject(1)).rejects.toThrow('项目数据不完整')
    await expect(listTags()).rejects.toThrow('标签数据不完整')
    await expect(listComments(1)).rejects.toThrow('评论数据不完整')
    await expect(listActivities(1)).rejects.toThrow('活动数据不完整')
  })

  it('rejects non-OK and missing response envelopes before normalization', async () => {
    webRequest.mockResolvedValueOnce({ code: 'VALIDATION_FAILED', message: 'Bad query' })
    await expect(listTasks()).rejects.toThrow('Bad query')

    webRequest.mockResolvedValueOnce({ code: 'OK' })
    await expect(listTasks()).rejects.toThrow('任务列表数据不完整')
  })
})
