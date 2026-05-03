import { expect, type Page } from '@playwright/test'

const frontendOrigin = `http://127.0.0.1:${process.env.E2E_FRONTEND_PORT ?? '15173'}`

export function uniqueName(prefix: string) {
  return `${prefix} ${Date.now()} ${Math.random().toString(16).slice(2, 8)}`
}

async function postJson(page: Page, url: string, data: unknown) {
  const response = await page.request.post(new URL(url, frontendOrigin).href, { data })
  expect(response.ok()).toBeTruthy()
  return response.json()
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

export async function apiCreateProject(
  page: Page,
  options: { name?: string; description?: string } = {},
) {
  const name = options.name ?? uniqueName('E2E project')
  const description = options.description ?? 'Created by Playwright'
  const response = await postJson(page, '/api/projects', { name, description })
  return response.data as { id: number; name: string; description?: string }
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

export async function apiCreateTask(
  page: Page,
  options: {
    projectId?: number
    title?: string
    description?: string
    dueDate?: string
    tagNames?: string[]
  } = {},
) {
  const title = options.title ?? uniqueName('E2E task')
  const description = options.description ?? 'Created by Playwright'
  const tagNames = options.tagNames ?? []
  const response = await postJson(page, '/api/tasks', {
    projectId: options.projectId,
    title,
    description,
    dueDate: options.dueDate,
    tagNames,
  })
  return response.data as { id: number; title: string }
}

export async function openTaskDetail(page: Page, title: string) {
  await page.goto('/tasks')
  const row = page.getByRole('row').filter({ hasText: title })
  await expect(row).toBeVisible()
  await row.locator('button[title="详情"]').click()
  await expect(page.getByRole('heading', { name: title })).toBeVisible()
  return row
}
