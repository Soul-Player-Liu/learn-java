import { expect, test } from '@playwright/test'

test('creates a project task, comments on it, filters by tag, and deletes it', async ({ page }) => {
  const projectName = `E2E project ${Date.now()}`
  const title = `E2E task ${Date.now()}`
  const description = 'Created by Playwright'
  const tag = `e2e-${Date.now()}`

  await page.goto('/projects')
  await page.getByRole('button', { name: '新增项目' }).click()
  await page.getByLabel('项目名称').fill(projectName)
  await page.getByLabel('说明').fill('Created by Playwright')
  await page.getByRole('button', { name: '保存' }).click()
  await expect(page.getByRole('row').filter({ hasText: projectName })).toBeVisible()

  await page.goto('/tasks')
  await page.getByRole('button', { name: '新增' }).click()
  await page.locator('.el-dialog .el-form-item').filter({ hasText: '项目' }).locator('.el-select').click()
  await page.getByRole('option', { name: projectName }).click()
  await page.getByLabel('标题').fill(title)
  await page.getByLabel('说明').fill(description)
  await page.locator('.el-dialog').getByPlaceholder('多个标签用逗号分隔').fill(tag)
  await page.getByRole('button', { name: '保存' }).click({ force: true })

  const row = page.getByRole('row').filter({ hasText: title })
  await expect(row).toBeVisible()
  await expect(row).toContainText(description)
  await expect(row).toContainText(projectName)
  await expect(row).toContainText(tag)

  await row.locator('button[title="详情"]').click()
  await expect(page.getByRole('heading', { name: title })).toBeVisible()
  await page.getByLabel('评论内容').fill('E2E comment')
  await page.getByLabel('作者').fill('playwright')
  await page.getByRole('button', { name: '添加评论' }).click()
  await expect(page.getByText('E2E comment')).toBeVisible()
  await expect(page.getByText('COMMENT_ADDED')).toBeVisible()
  await page.getByText('进行中').click()
  await expect(page.locator('.el-tag').filter({ hasText: '进行中' })).toBeVisible()

  await page.getByRole('button', { name: '返回' }).click()
  await page.getByPlaceholder('搜索标题或说明').fill(title)
  await page.locator('.filter-bar .el-select').nth(2).click()
  await page.getByRole('option', { name: tag }).click()
  await page.getByRole('button', { name: '查询' }).click()
  const filteredRow = page.getByRole('row').filter({ hasText: title })
  await expect(filteredRow).toBeVisible()

  await filteredRow.locator('button[title="删除"]').click()
  await page.getByLabel('确认删除').getByRole('button', { name: '删除' }).click()
  await expect(filteredRow).toBeHidden()
})
