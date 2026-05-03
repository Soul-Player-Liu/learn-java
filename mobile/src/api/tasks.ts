import { createUniTaskApi } from "@learn-java/task-api";

export const taskApi = createUniTaskApi(
  import.meta.env.VITE_API_BASE_URL ?? "",
);
