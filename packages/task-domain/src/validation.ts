export function parseTagInput(input: string) {
  return input
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function requireTaskTitle(title: string) {
  if (!title.trim()) {
    throw new Error("请输入任务标题");
  }
}
