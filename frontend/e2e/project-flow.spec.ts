import { expect, test } from '@playwright/test'

import { createProject, createTask, uniqueName } from './helpers'

test('project list opens the filtered task board and preserves the project scope', async ({ page }) => {
  const project = await createProject(page, {
    name: uniqueName('E2E project scope'),
    description: 'Project scope coverage',
  })
  const task = await createTask(page, {
    projectName: project.name,
    title: uniqueName('E2E scoped task'),
    description: 'Scoped task',
    tags: ['scope'],
  })

  await page.goto('/projects')
  const projectRow = page.getByRole('row').filter({ hasText: project.name })
  await expect(projectRow).toBeVisible()
  await projectRow.getByRole('button', { name: '查看' }).click()
  await expect(page).toHaveURL(/\/tasks\?projectId=/)

  const row = page.getByRole('row').filter({ hasText: task.title })
  await expect(row).toBeVisible()
  await expect(row).toContainText(project.name)
  await expect(row).toContainText('scope')
})
