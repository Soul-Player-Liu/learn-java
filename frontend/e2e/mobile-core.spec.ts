import { expect, test } from '@playwright/test'

import { apiCreateProject, apiCreateTask, uniqueName } from './helpers'

test('mobile viewport can navigate task list and complete a detail update @mobile', async ({ page }) => {
  const project = await apiCreateProject(page, {
    name: uniqueName('E2E mobile project'),
    description: 'Mobile viewport coverage',
  })
  const task = await apiCreateTask(page, {
    projectId: project.id,
    title: uniqueName('E2E mobile task'),
    description: 'Mobile task',
    tagNames: ['mobile'],
  })

  await page.goto('/')
  await page.getByRole('button', { name: '进入任务' }).click()
  await expect(page).toHaveURL(/\/tasks/)

  const row = page.getByRole('row').filter({ hasText: task.title })
  await expect(row).toBeVisible()
  await row.getByRole('button', { name: task.title }).click()
  await expect(page).toHaveURL(new RegExp(`/tasks/${task.id}`))
  await expect(page.getByRole('heading', { name: task.title })).toBeVisible()

  await page.getByLabel('评论内容').fill('Mobile E2E comment')
  await page.getByRole('button', { name: '添加评论' }).click()
  await expect(page.getByText('Mobile E2E comment')).toBeVisible()

  await page.locator('.action-panel .el-segmented').getByText('已完成').click()
  await expect(page.locator('.detail-panel .section-title .el-tag')).toContainText('已完成')
})
