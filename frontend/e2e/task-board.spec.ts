import { expect, test } from '@playwright/test'

import { createProject, createTask, uniqueName } from './helpers'

test('task board supports create, edit, filter, and delete flows', async ({ page }) => {
  const project = await createProject(page, {
    name: uniqueName('E2E project board'),
    description: 'Task board coverage',
  })
  const original = await createTask(page, {
    projectName: project.name,
    title: uniqueName('E2E task board'),
    description: 'Board task',
    tags: ['board', 'regression'],
  })
  const updatedTitle = uniqueName('E2E task board updated')

  const row = page.getByRole('row').filter({ hasText: original.title })
  await row.locator('button[title="编辑"]').click()
  await expect(page.getByRole('dialog', { name: '编辑学习任务' })).toBeVisible()
  await page.getByLabel('标题').fill(updatedTitle)
  await page.getByLabel('说明').fill('Updated board task')
  await page.getByTestId('task-form-tags').fill('board, updated')
  await page.getByRole('button', { name: '保存' }).click({ force: true })

  const updatedRow = page.getByRole('row').filter({ hasText: updatedTitle })
  await expect(updatedRow).toBeVisible()
  await expect(updatedRow).toContainText('Updated board task')
  await expect(updatedRow).toContainText('updated')

  await page.getByPlaceholder('搜索标题或说明').fill(updatedTitle)
  await page.getByTestId('task-filter-tag').click()
  await page.getByRole('option', { name: 'updated' }).click()
  await page.getByRole('button', { name: '查询' }).click()
  await expect(page.getByRole('row').filter({ hasText: updatedTitle })).toBeVisible()

  await page.getByRole('button', { name: '重置' }).click()
  await expect(page.getByRole('row').filter({ hasText: updatedTitle })).toBeVisible()

  await updatedRow.locator('button[title="删除"]').click()
  await page.getByLabel('确认删除').getByRole('button', { name: '删除' }).click()
  await expect(updatedRow).toBeHidden()
})

