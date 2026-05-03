import { expect, test } from '@playwright/test'

import {
  apiChangeTaskStatus,
  apiCreateProject,
  apiCreateTask,
  apiGetTaskStatistics,
  isoDate,
  uniqueName,
} from './helpers'

test('dashboard statistics reflect newly created task status and due date buckets', async ({ page }) => {
  const before = await apiGetTaskStatistics(page)
  const project = await apiCreateProject(page, {
    name: uniqueName('E2E dashboard statistics'),
    description: 'Dashboard metric coverage',
  })

  await apiCreateTask(page, {
    projectId: project.id,
    title: uniqueName('E2E overdue dashboard task'),
    description: 'Overdue dashboard task',
    dueDate: isoDate(-1),
    tagNames: ['dashboard'],
  })
  const doingTask = await apiCreateTask(page, {
    projectId: project.id,
    title: uniqueName('E2E doing dashboard task'),
    description: 'Doing dashboard task',
    dueDate: isoDate(3),
    tagNames: ['dashboard'],
  })
  const doneTask = await apiCreateTask(page, {
    projectId: project.id,
    title: uniqueName('E2E done dashboard task'),
    description: 'Done dashboard task',
    dueDate: isoDate(5),
    tagNames: ['dashboard'],
  })

  await apiChangeTaskStatus(page, doingTask.id, 'DOING')
  await apiChangeTaskStatus(page, doneTask.id, 'DONE')

  await page.goto('/')

  await expect(page.locator('.metric-card').filter({ hasText: '总任务' })).toContainText(
    String(before.total + 3),
  )
  await expect(page.locator('.metric-card').filter({ hasText: '进行中' })).toContainText(
    String(before.doing + 1),
  )
  await expect(page.locator('.metric-card').filter({ hasText: '已完成' })).toContainText(
    String(before.done + 1),
  )
  await expect(page.locator('.metric-card').filter({ hasText: '已逾期' })).toContainText(
    String(before.overdue + 1),
  )
  await expect(page.getByText(`7 天内到期 ${before.dueSoon + 1}`)).toBeVisible()
  await expect(page.getByRole('row').filter({ hasText: project.name })).toContainText('3')
})
