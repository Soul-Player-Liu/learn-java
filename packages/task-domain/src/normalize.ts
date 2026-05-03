import type {
  ApiEnvelope,
  LearningProject,
  LearningTask,
  PageEnvelope,
  PageResult,
  TaskActivity,
  TaskComment,
  TaskStatistics,
  TaskTag,
} from "./types";

export function unwrap<T>(response: ApiEnvelope<T>, label: string): T {
  if (response.code && response.code !== "OK") {
    throw new Error(response.message || `${label}失败`);
  }
  if (response.data === undefined || response.data === null) {
    throw new Error(`${label}数据不完整`);
  }
  return response.data;
}

export function unwrapPage<Input, Output>(
  response: ApiEnvelope<PageEnvelope<Input>>,
  label: string,
  normalizeItem: (item: Input) => Output,
): PageResult<Output> {
  const page = unwrap(response, label);
  const items = (page.items ?? []).map(normalizeItem);

  return {
    items,
    total: page.total ?? items.length,
    page: page.page ?? 1,
    size: page.size ?? items.length,
    totalPages: page.totalPages ?? (items.length > 0 ? 1 : 0),
  };
}

export function unwrapPageItems<Input, Output>(
  response: ApiEnvelope<PageEnvelope<Input>>,
  label: string,
  normalizeItem: (item: Input) => Output,
): Output[] {
  return unwrapPage(response, label, normalizeItem).items;
}

export function normalizeTask(task: Partial<LearningTask>): LearningTask {
  if (!task.id || !task.title || !task.status) {
    throw new Error("服务端返回的任务数据不完整");
  }
  return {
    ...task,
    id: task.id,
    title: task.title,
    status: task.status,
    tagNames: task.tagNames ?? [],
  } as LearningTask;
}

export function normalizeProject(
  project: Partial<LearningProject>,
): LearningProject {
  if (!project.id || !project.name) {
    throw new Error("服务端返回的项目数据不完整");
  }
  return {
    ...project,
    id: project.id,
    name: project.name,
    taskCount: project.taskCount ?? 0,
    doneTaskCount: project.doneTaskCount ?? 0,
  } as LearningProject;
}

export function normalizeComment(comment: Partial<TaskComment>): TaskComment {
  if (!comment.id || !comment.taskId || !comment.content) {
    throw new Error("服务端返回的评论数据不完整");
  }
  return {
    ...comment,
    id: comment.id,
    taskId: comment.taskId,
    content: comment.content,
  } as TaskComment;
}

export function normalizeActivity(
  activity: Partial<TaskActivity>,
): TaskActivity {
  if (!activity.id || !activity.taskId || !activity.type || !activity.message) {
    throw new Error("服务端返回的活动数据不完整");
  }
  return {
    ...activity,
    id: activity.id,
    taskId: activity.taskId,
    type: activity.type,
    message: activity.message,
  } as TaskActivity;
}

export function normalizeTag(tag: Partial<TaskTag>): TaskTag {
  if (!tag.id || !tag.name) {
    throw new Error("服务端返回的标签数据不完整");
  }
  return {
    ...tag,
    id: tag.id,
    name: tag.name,
  } as TaskTag;
}

export function normalizeStatistics(
  statistics: Partial<TaskStatistics>,
): TaskStatistics {
  return {
    total: statistics.total ?? 0,
    todo: statistics.todo ?? 0,
    doing: statistics.doing ?? 0,
    done: statistics.done ?? 0,
    overdue: statistics.overdue ?? 0,
    dueSoon: statistics.dueSoon ?? 0,
  };
}
