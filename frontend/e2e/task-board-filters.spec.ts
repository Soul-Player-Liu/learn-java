import { expect, test } from '@playwright/test'

import { apiChangeTaskStatus, apiCreateProject, apiCreateTask, isoDate, uniqueName } from './helpers'

test('task board filters by status, project, and overdue flag', async ({ page }) => {
  const targetProject = await apiCreateProject(page, {
    name: uniqueName('E2E filter target project'),
    description: 'Filter target project',
  })
  const otherProject = await apiCreateProject(page, {
    name: uniqueName('E2E filter other project'),
    description: 'Filter other project',
  })
  const overdueTask = await apiCreateTask(page, {
    projectId: targetProject.id,
    title: uniqueName('E2E overdue filtered task'),
    description: 'Overdue filtered task',
    dueDate: isoDate(-2),
    tagNames: ['filtering'],
  })
  const doneTask = await apiCreateTask(page, {
    projectId: targetProject.id,
    title: uniqueName('E2E done filtered task'),
    description: 'Done filtered task',
    dueDate: isoDate(-2),
    tagNames: ['filtering'],
  })
  const otherTask = await apiCreateTask(page, {
    projectId: otherProject.id,
    title: uniqueName('E2E other project task'),
    description: 'Other project task',
    dueDate: isoDate(-2),
    tagNames: ['filtering'],
  })

  await apiChangeTaskStatus(page, doneTask.id, 'DONE')
  await apiChangeTaskStatus(page, otherTask.id, 'DOING')

  await page.goto('/tasks')
  await page.getByTestId('task-filter-project').click()
  await page.getByRole('option', { name: targetProject.name }).click()
  await page.getByTestId('task-filter-status').click()
  await page.getByRole('option', { name: '待开始' }).click()
  await page.getByTestId('task-filter-overdue').click()
  await page.getByRole('button', { name: '查询' }).click()

  const row = page.getByRole('row').filter({ hasText: overdueTask.title })
  await expect(row).toBeVisible()
  await expect(row).toContainText(targetProject.name)
  await expect(row).toContainText(isoDate(-2))
  await expect(page.getByRole('row').filter({ hasText: doneTask.title })).toBeHidden()
  await expect(page.getByRole('row').filter({ hasText: otherTask.title })).toBeHidden()
})

test('task board updates status from the list row dropdown @smoke', async ({ page }) => {
  const task = await apiCreateTask(page, {
    title: uniqueName('E2E row status task'),
    description: 'Row status coverage',
    tagNames: ['row-status'],
  })

  await page.goto('/tasks')
  const row = page.getByRole('row').filter({ hasText: task.title })
  await expect(row).toContainText('待开始')
  await row.getByTestId('task-status-menu').click()
  await page.getByRole('menuitem', { name: '已完成' }).click()
  await expect(row).toContainText('已完成')

  await page.reload()
  await expect(page.getByRole('row').filter({ hasText: task.title })).toContainText('已完成')
})
