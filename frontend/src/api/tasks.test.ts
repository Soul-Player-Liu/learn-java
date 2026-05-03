import { createTaskApi } from '@learn-java/task-api'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const client = vi.hoisted(() => ({
  delete: vi.fn(),
  get: vi.fn(),
  patch: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
}))

const taskApi = createTaskApi(client as never)
const {
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
} = taskApi

describe('shared task api wrapper', () => {
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
    client.get.mockResolvedValue({
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
    expect(client.get).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/api/tasks',
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
      }),
    )
  })

  it('normalizes projects and task comments', async () => {
    client.get.mockResolvedValueOnce({ data: ok(page([{ id: 1, name: 'Backend', taskCount: 2 }])) })
    client.post.mockResolvedValueOnce({ data: ok({ id: 9, taskId: 1, content: 'done' }) })

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
    client.get.mockResolvedValue({ data: ok({ total: 2, todo: 1 }) })

    await expect(getTaskStatistics()).resolves.toEqual({
      total: 2,
      todo: 1,
      doing: 0,
      done: 0,
      overdue: 0,
      dueSoon: 0,
    })
  })

  it('wraps task detail and mutation generated SDK calls', async () => {
    const task = { id: 1, title: 'Task', status: 'TODO', tagNames: ['backend'] }
    client.get.mockResolvedValueOnce({ data: ok(task) })
    client.post.mockResolvedValueOnce({ data: ok(task) })
    client.put.mockResolvedValueOnce({ data: ok({ ...task, title: 'Updated' }) })
    client.patch.mockResolvedValueOnce({ data: ok({ ...task, status: 'DOING' }) })
    client.delete.mockResolvedValueOnce({ data: ok(null) })

    await expect(getTask(1)).resolves.toEqual(task)
    await expect(createTask({ title: 'Task' })).resolves.toEqual(task)
    await expect(updateTask(1, { title: 'Updated', status: 'TODO' })).resolves.toMatchObject({
      title: 'Updated',
    })
    await expect(changeTaskStatus(1, { status: 'DOING' })).resolves.toMatchObject({ status: 'DOING' })
    await expect(deleteTask(1)).resolves.toBeUndefined()

    expect(client.get).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ path: { id: 1 }, throwOnError: true, url: '/api/tasks/{id}' }),
    )
    expect(client.post).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        body: { title: 'Task' },
        throwOnError: true,
        url: '/api/tasks',
      }),
    )
    expect(client.put).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        body: { title: 'Updated', status: 'TODO' },
        path: { id: 1 },
        throwOnError: true,
        url: '/api/tasks/{id}',
      }),
    )
    expect(client.patch).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        body: { status: 'DOING' },
        path: { id: 1 },
        throwOnError: true,
        url: '/api/tasks/{id}/status',
      }),
    )
    expect(client.delete).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ path: { id: 1 }, throwOnError: true, url: '/api/tasks/{id}' }),
    )
  })

  it('wraps project tag comment and activity list calls', async () => {
    client.get
      .mockResolvedValueOnce({ data: ok({ id: 1, name: 'Backend' }) })
      .mockResolvedValueOnce({ data: ok(page([{ id: 3, name: 'sql' }])) })
      .mockResolvedValueOnce({ data: ok(page([{ id: 4, taskId: 1, content: 'Ready' }])) })
      .mockResolvedValueOnce({
        data: ok(page([{ id: 5, taskId: 1, type: 'TASK_CREATED', message: 'Created' }])),
      })
    client.post.mockResolvedValueOnce({ data: ok({ id: 2, name: 'Frontend', doneTaskCount: 1 }) })

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
    client.get
      .mockResolvedValueOnce({ data: ok({ id: 1, status: 'TODO' }) })
      .mockResolvedValueOnce({ data: ok({ id: 1 }) })
      .mockResolvedValueOnce({ data: ok(page([{ id: 1 }])) })
      .mockResolvedValueOnce({ data: ok(page([{ id: 1, taskId: 1 }])) })
      .mockResolvedValueOnce({ data: ok(page([{ id: 1, taskId: 1, type: 'TASK_CREATED' }])) })

    await expect(getTask(1)).rejects.toThrow('任务数据不完整')
    await expect(getProject(1)).rejects.toThrow('项目数据不完整')
    await expect(listTags()).rejects.toThrow('标签数据不完整')
    await expect(listComments(1)).rejects.toThrow('评论数据不完整')
    await expect(listActivities(1)).rejects.toThrow('活动数据不完整')
  })

  it('rejects non-OK and missing response envelopes before normalization', async () => {
    client.get.mockResolvedValueOnce({ data: { code: 'VALIDATION_FAILED', message: 'Bad query' } })
    await expect(listTasks()).rejects.toThrow('Bad query')

    client.get.mockResolvedValueOnce({ data: { code: 'OK' } })
    await expect(listTasks()).rejects.toThrow('任务列表数据不完整')
  })
})
