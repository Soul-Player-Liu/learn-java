import { expect, test } from "@playwright/test";

test("mobile H5 covers dashboard, task filtering, detail status update, and projects", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByTestId("mobile-dashboard-title")).toBeVisible();
  await expect(page.getByText("总任务")).toBeVisible();
  await expect(page.getByText("最近任务")).toBeVisible();

  await page.getByText("任务", { exact: true }).click();
  await expect(page).toHaveURL(/\/pages\/tasks\/index/);
  await expect(page.getByText("批量学习任务 1", { exact: true })).toBeVisible();

  await page.getByTestId("mobile-task-search").locator("input").fill("批量学习任务 5");
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("mobile-task-card")).toHaveCount(1);
  await expect(page.getByText("批量学习任务 5", { exact: true })).toBeVisible();
  await expect(page.getByText("批量学习任务 1", { exact: true })).toHaveCount(0);

  const statusFilter = page.getByTestId("mobile-status-filter");
  await statusFilter.getByText("全部", { exact: true }).click();
  await statusFilter.getByText("进行中", { exact: true }).click();
  await expect(page.getByText("批量学习任务 5", { exact: true })).toBeVisible();

  await page.getByText("批量学习任务 5", { exact: true }).click();
  await expect(page).toHaveURL(/\/pages\/task-detail\/index\?id=5/);
  await expect(page.getByText("更新状态")).toBeVisible();

  await page.getByTestId("mobile-status-DONE").click();
  await expect(page.getByText("状态已更新")).toBeVisible();
  await expect(page.getByTestId("mobile-task-status")).toContainText("已完成");

  await page.goBack();
  await expect(page).toHaveURL(/\/pages\/tasks\/index/);
  await statusFilter.getByText("已完成", { exact: true }).click();
  await expect(page.getByText("批量学习任务 5", { exact: true })).toBeVisible();

  await page.getByText("项目", { exact: true }).click();
  await expect(page).toHaveURL(/\/pages\/projects\/index/);
  await expect(page.getByTestId("mobile-project-card")).toHaveCount(2);
  await expect(page.getByText("Java 后端学习")).toBeVisible();
  await expect(page.getByText("前端工程化")).toBeVisible();
});
