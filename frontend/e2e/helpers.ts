import { expect, type Page } from '@playwright/test'

export function uniqueName(prefix: string) {
  return `${prefix} ${Date.now()} ${Math.random().toString(16).slice(2, 8)}`
}

export async function createProject(page: Page, options: { name?: string; description?: string } = {}) {
  const name = options.name ?? uniqueName('E2E project')
  const description = options.description ?? 'Created by Playwright'

  await page.goto('/projects')
  await page.getByRole('button', { name: '新增项目' }).click()
  await expect(page.getByRole('dialog', { name: '新增学习项目' })).toBeVisible()
  await page.getByLabel('项目名称').fill(name)
  await page.getByLabel('说明').fill(description)
  await page.getByRole('button', { name: '保存' }).click()
  await expect(page.getByRole('row').filter({ hasText: name })).toBeVisible()

  return { name, description }
}

export async function createTask(
  page: Page,
  options: {
    projectName?: string
    title?: string
    description?: string
    tags?: string[]
  } = {},
) {
  const title = options.title ?? uniqueName('E2E task')
  const description = options.description ?? 'Created by Playwright'
  const tagNames = options.tags ?? [`tag-${Date.now()}`]

  await page.goto('/tasks')
  await page.getByRole('button', { name: '新增' }).click()
  await expect(page.getByRole('dialog', { name: '新增学习任务' })).toBeVisible()

  if (options.projectName) {
    await page.getByTestId('task-form-project').click()
    await page.getByRole('option', { name: options.projectName }).click()
  }

  await page.getByLabel('标题').fill(title)
  await page.getByLabel('说明').fill(description)
  await page.getByTestId('task-form-tags').fill(tagNames.join(', '))
  await page.getByRole('button', { name: '保存' }).click({ force: true })

  const row = page.getByRole('row').filter({ hasText: title })
  await expect(row).toBeVisible()
  await expect(row).toContainText(description)
  await expect(row).toContainText(tagNames[0])
  if (options.projectName) {
    await expect(row).toContainText(options.projectName)
  }

  return { title, description, tags: tagNames }
}

export async function openTaskDetail(page: Page, title: string) {
  await page.goto('/tasks')
  const row = page.getByRole('row').filter({ hasText: title })
  await expect(row).toBeVisible()
  await row.locator('button[title="详情"]').click()
  await expect(page.getByRole('heading', { name: title })).toBeVisible()
  return row
}

