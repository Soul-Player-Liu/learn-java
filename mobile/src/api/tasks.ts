import { createMockTaskApi, createUniTaskApi } from "@learn-java/task-api";

const useMock = import.meta.env.VITE_USE_MOCK === "true";

export const taskApi = useMock
  ? createMockTaskApi(import.meta.env.VITE_MOCK_SCENARIO)
  : createUniTaskApi(import.meta.env.VITE_API_BASE_URL ?? "");
