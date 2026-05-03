import { expect, test } from '@playwright/test'

import { apiCreateProject, apiCreateTask, uniqueName } from './helpers'

test('task board shows empty state when the backend returns no tasks', async ({ page }) => {
  const project = await apiCreateProject(page, {
    name: uniqueName('E2E empty project'),
    description: 'Empty state coverage',
  })

  await page.goto(`/tasks?projectId=${project.id}`)
  await expect(page.getByText('No Data')).toBeVisible()
})

test('task board shows a validation warning when required task fields are missing', async ({ page }) => {
  const project = await apiCreateProject(page, {
    name: uniqueName('E2E validation project'),
    description: 'Validation coverage',
  })

  await page.goto(`/tasks?projectId=${project.id}`)
  await page.getByRole('button', { name: '新增' }).click()
  await page.getByRole('button', { name: '保存' }).click()
  await expect(page.getByText('请输入任务标题')).toBeVisible()
})

test('task board paginates a large task set', async ({ page }) => {
  const project = await apiCreateProject(page, {
    name: uniqueName('E2E pagination project'),
    description: 'Pagination coverage',
  })

  for (let index = 1; index <= 21; index += 1) {
    await apiCreateTask(page, {
      projectId: project.id,
      title: `E2E pagination task ${index}`,
      description: `Pagination task ${index}`,
      tagNames: ['pagination'],
    })
  }

  await page.goto(`/tasks?projectId=${project.id}`)
  await expect(page.locator('.el-table__body-wrapper tbody tr')).toHaveCount(20)

  await page.locator('.el-pagination .btn-next').click()
  await expect(page.locator('.el-table__body-wrapper tbody tr')).toHaveCount(1)
  await expect(page.getByText('E2E pagination task 1')).toBeVisible()
})
