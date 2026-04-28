import { expect, test } from '@playwright/test'

test('creates a task, changes its status, and deletes it', async ({ page }) => {
  const title = `E2E task ${Date.now()}`
  const description = 'Created by Playwright'

  await page.goto('/tasks')
  await page.getByRole('button', { name: '新增' }).click()
  await page.getByLabel('标题').fill(title)
  await page.getByLabel('说明').fill(description)
  await page.getByRole('button', { name: '保存' }).click()

  const row = page.getByRole('row').filter({ hasText: title })
  await expect(row).toBeVisible()
  await expect(row).toContainText(description)

  await row.locator('button[title="详情"]').click()
  await expect(page.getByRole('heading', { name: title })).toBeVisible()
  await page.getByText('进行中').click()
  await expect(page.locator('.el-tag').filter({ hasText: '进行中' })).toBeVisible()

  await page.getByRole('button', { name: '返回' }).click()
  await page.getByPlaceholder('搜索标题或说明').fill(title)
  await page.getByRole('button', { name: '查询' }).click()
  const filteredRow = page.getByRole('row').filter({ hasText: title })
  await expect(filteredRow).toBeVisible()

  await filteredRow.locator('button[title="删除"]').click()
  await page.getByLabel('确认删除').getByRole('button', { name: '删除' }).click()
  await expect(filteredRow).toBeHidden()
})
