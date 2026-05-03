import type { TaskStatus } from "./types";

export const taskStatusOptions: Array<{
  label: string;
  value: TaskStatus;
  type: "info" | "warning" | "success";
}> = [
  { label: "待开始", value: "TODO", type: "info" },
  { label: "进行中", value: "DOING", type: "warning" },
  { label: "已完成", value: "DONE", type: "success" },
];

export function taskStatusLabel(status: TaskStatus) {
  return (
    taskStatusOptions.find((item) => item.value === status)?.label ?? status
  );
}

export function taskStatusType(status: TaskStatus) {
  return (
    taskStatusOptions.find((item) => item.value === status)?.type ?? "info"
  );
}
