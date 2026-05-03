import { expect, test } from '@playwright/test'

import { createProject, createTask, openTaskDetail, uniqueName } from './helpers'

test('task detail keeps comments and status changes in sync', async ({ page }) => {
  const project = await createProject(page, {
    name: uniqueName('E2E project detail'),
    description: 'Task detail coverage',
  })
  const task = await createTask(page, {
    projectName: project.name,
    title: uniqueName('E2E task detail'),
    description: 'Detail task',
    tags: ['detail'],
  })

  await openTaskDetail(page, task.title)
  await expect(page.getByText(project.name)).toBeVisible()
  await expect(page.locator('.detail-panel .tag-list')).toContainText('detail')

  await page.getByLabel('评论内容').fill('E2E comment')
  await page.getByLabel('作者').fill('playwright')
  await page.getByRole('button', { name: '添加评论' }).click()
  await expect(page.getByText('E2E comment')).toBeVisible()
  await expect(page.getByText('COMMENT_ADDED')).toBeVisible()

  await page.locator('.action-panel .el-segmented').getByText('进行中').click()
  await expect(page.locator('.detail-panel .section-title .el-tag')).toContainText('进行中')

  await page.getByRole('button', { name: '返回' }).click()
  await expect(page).toHaveURL(/\/tasks/)
  await expect(page.getByRole('row').filter({ hasText: task.title })).toBeVisible()
})
