import type {
  LearningProjectDto,
  LearningTaskDto,
  TaskActivityDto,
  TaskCommentDto,
  TaskStatisticsDto,
  TaskTagDto,
} from '@/api/generated'

export type MockScenario = 'default' | 'empty' | 'overdue' | 'many'

const now = '2026-05-01T09:00:00'

export function createMockProjects(scenario: MockScenario = 'default'): LearningProjectDto[] {
  if (scenario === 'empty') {
    return []
  }
  return [
    {
      id: 1,
      name: 'Java 后端学习',
      description: '围绕 Spring、MyBatis 和测试体系推进',
      taskCount: 2,
      doneTaskCount: 0,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 2,
      name: '前端工程化',
      description: '覆盖 mock、Storybook 和 E2E',
      taskCount: 1,
      doneTaskCount: 1,
      createdAt: now,
      updatedAt: now,
    },
  ]
}

export function createMockTags(scenario: MockScenario = 'default'): TaskTagDto[] {
  if (scenario === 'empty') {
    return []
  }
  return [
    { id: 1, name: 'backend', color: '#2563eb' },
    { id: 2, name: 'frontend', color: '#16a34a' },
    { id: 3, name: 'testing', color: '#d97706' },
  ]
}

export function createMockTasks(scenario: MockScenario = 'default'): LearningTaskDto[] {
  if (scenario === 'empty') {
    return []
  }

  const tasks: LearningTaskDto[] = [
    {
      id: 1,
      projectId: 1,
      projectName: 'Java 后端学习',
      title: '阅读 Java 测试分层',
      description: '理解 JUnit、集成测试和 E2E 的边界',
      status: 'TODO',
      dueDate: '2026-05-03',
      tagNames: ['backend', 'testing'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 2,
      projectId: 2,
      projectName: '前端工程化',
      title: '梳理前端 mock 方案',
      description: '用 MSW 支持离线浏览完整应用',
      status: 'DOING',
      dueDate: '2026-05-06',
      tagNames: ['frontend'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 3,
      projectId: 2,
      projectName: '前端工程化',
      title: '完成 Playwright 回归',
      description: '覆盖新增、详情、状态变更和删除流程',
      status: 'DONE',
      dueDate: '2026-04-30',
      tagNames: ['testing'],
      createdAt: now,
      updatedAt: now,
    },
  ]

  if (scenario === 'overdue') {
    return [
      ...tasks,
      {
        id: 4,
        projectId: 1,
        projectName: 'Java 后端学习',
        title: '补充接口异常态',
        description: '这个任务用于展示逾期状态',
        status: 'TODO',
        dueDate: '2026-04-20',
        tagNames: ['backend'],
        createdAt: now,
        updatedAt: now,
      },
    ]
  }

  if (scenario === 'many') {
    return Array.from({ length: 24 }, (_, index) => ({
      id: index + 1,
      projectId: index % 2 === 0 ? 1 : 2,
      projectName: index % 2 === 0 ? 'Java 后端学习' : '前端工程化',
      title: `批量学习任务 ${index + 1}`,
      description: `用于观察表格滚动和筛选表现的模拟数据 ${index + 1}`,
      status: (['TODO', 'DOING', 'DONE'] as const)[index % 3],
      dueDate: `2026-05-${String((index % 20) + 1).padStart(2, '0')}`,
      tagNames: index % 2 === 0 ? ['backend'] : ['frontend'],
      createdAt: now,
      updatedAt: now,
    }))
  }

  return tasks
}

export function createMockComments(scenario: MockScenario = 'default'): TaskCommentDto[] {
  if (scenario === 'empty') {
    return []
  }
  return [
    {
      id: 1,
      taskId: 1,
      content: '先把测试 fixture 和 Spring 上下文边界讲清楚。',
      author: 'mentor',
      createdAt: now,
    },
  ]
}

export function createMockActivities(scenario: MockScenario = 'default'): TaskActivityDto[] {
  if (scenario === 'empty') {
    return []
  }
  return [
    {
      id: 1,
      taskId: 1,
      type: 'TASK_CREATED',
      message: 'Task created',
      createdAt: now,
    },
    {
      id: 2,
      taskId: 1,
      type: 'COMMENT_ADDED',
      message: 'Comment added',
      createdAt: now,
    },
  ]
}

export function calculateStatistics(tasks: LearningTaskDto[]): TaskStatisticsDto {
  const today = '2026-05-01'
  return {
    total: tasks.length,
    todo: tasks.filter((task) => task.status === 'TODO').length,
    doing: tasks.filter((task) => task.status === 'DOING').length,
    done: tasks.filter((task) => task.status === 'DONE').length,
    overdue: tasks.filter((task) => task.status !== 'DONE' && task.dueDate && task.dueDate < today).length,
    dueSoon: tasks.filter(
      (task) =>
        task.status !== 'DONE' && task.dueDate && task.dueDate >= today && task.dueDate <= '2026-05-08',
    ).length,
  }
}
