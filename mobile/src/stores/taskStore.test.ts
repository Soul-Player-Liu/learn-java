import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";

import { useMobileTaskStore } from "./taskStore";

describe("mobile task store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("loads dashboard data through the shared task use cases", async () => {
    const store = useMobileTaskStore();

    await store.loadDashboard();

    expect(store.loading).toBe(false);
    expect(store.statistics?.total).toBeGreaterThan(0);
    expect(store.tasks).toHaveLength(5);
    expect(store.projects).toHaveLength(2);
    expect(store.taskPage).toMatchObject({
      page: 1,
      size: 5,
      total: 24,
    });
  });

  it("loads and filters the task list", async () => {
    const store = useMobileTaskStore();

    await store.loadTasks({ keyword: "批量学习任务 5", status: "DOING" });

    expect(store.loading).toBe(false);
    expect(store.filters).toMatchObject({
      keyword: "批量学习任务 5",
      status: "DOING",
    });
    expect(store.tasks).toHaveLength(1);
    expect(store.tasks[0]?.title).toContain("批量学习任务 5");
    expect(store.tasks[0]?.status).toBe("DOING");
  });

  it("keeps detail and list data synchronized after a status change", async () => {
    const store = useMobileTaskStore();

    await store.loadTask(1);
    await store.changeTaskStatus(1, "DONE");

    expect(store.selectedTask?.status).toBe("DONE");
    expect(store.activities[0]?.type).toBe("STATUS_CHANGED");
    expect(store.tasks.some((task) => task.id === 1 && task.status === "DONE")).toBe(
      true,
    );
    expect(store.statistics?.done).toBeGreaterThan(0);
  });
});
