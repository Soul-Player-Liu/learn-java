import type { LearningTaskDto, TaskStatisticsDto } from '@/api/generated'

export type MockScenario = 'default' | 'empty' | 'overdue' | 'many'

const now = '2026-05-01T09:00:00'

export function createMockTasks(scenario: MockScenario = 'default'): LearningTaskDto[] {
  if (scenario === 'empty') {
    return []
  }

  const tasks: LearningTaskDto[] = [
    {
      id: 1,
      title: '阅读 Java 测试分层',
      description: '理解 JUnit、集成测试和 E2E 的边界',
      status: 'TODO',
      dueDate: '2026-05-03',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 2,
      title: '梳理前端 mock 方案',
      description: '用 MSW 支持离线浏览完整应用',
      status: 'DOING',
      dueDate: '2026-05-06',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 3,
      title: '完成 Playwright 回归',
      description: '覆盖新增、详情、状态变更和删除流程',
      status: 'DONE',
      dueDate: '2026-04-30',
      createdAt: now,
      updatedAt: now,
    },
  ]

  if (scenario === 'overdue') {
    return [
      ...tasks,
      {
        id: 4,
        title: '补充接口异常态',
        description: '这个任务用于展示逾期状态',
        status: 'TODO',
        dueDate: '2026-04-20',
        createdAt: now,
        updatedAt: now,
      },
    ]
  }

  if (scenario === 'many') {
    return Array.from({ length: 24 }, (_, index) => ({
      id: index + 1,
      title: `批量学习任务 ${index + 1}`,
      description: `用于观察表格滚动和筛选表现的模拟数据 ${index + 1}`,
      status: (['TODO', 'DOING', 'DONE'] as const)[index % 3],
      dueDate: `2026-05-${String((index % 20) + 1).padStart(2, '0')}`,
      createdAt: now,
      updatedAt: now,
    }))
  }

  return tasks
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
