import { createTaskApi } from "@learn-java/task-api";

import { uniRequest } from "./uniRequest";

export const taskApi = createTaskApi(uniRequest);
