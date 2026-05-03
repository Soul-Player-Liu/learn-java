import { expect, test } from '@playwright/test'

test('dashboard renders the main overview and routes to tasks and projects', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: '学习概览' })).toBeVisible()
  await expect(page.getByText('总任务')).toBeVisible()
  await expect(page.getByText('进行中')).toBeVisible()
  await expect(page.getByText('最近任务')).toBeVisible()
  await expect(page.getByText('项目进度')).toBeVisible()

  await page.getByRole('button', { name: '进入任务' }).click()
  await expect(page).toHaveURL(/\/tasks/)
  await expect(page.getByRole('heading', { name: '学习任务' })).toBeVisible()
  await page.getByRole('button', { name: '新增' }).waitFor()

  await page.goBack()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { name: '学习概览' })).toBeVisible()
  await page.getByRole('button', { name: '进入项目' }).click()
  await expect(page).toHaveURL(/\/projects/)
  await expect(page.getByRole('heading', { name: '学习项目' })).toBeVisible()
  await expect(page.getByRole('button', { name: '新增项目' })).toBeVisible()
})
