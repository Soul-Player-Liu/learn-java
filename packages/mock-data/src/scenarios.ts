import {
  mockActivities,
  mockComments,
  mockProjects,
  mockStatistics,
  mockTags,
  mockTasks,
} from "./taskData";

export const mockScenarios = {
  default: {
    tasks: mockTasks,
    projects: mockProjects,
    tags: mockTags,
    comments: mockComments,
    activities: mockActivities,
    statistics: mockStatistics,
  },
  empty: {
    tasks: [],
    projects: [],
    tags: [],
    comments: [],
    activities: [],
    statistics: {
      total: 0,
      todo: 0,
      doing: 0,
      done: 0,
      overdue: 0,
      dueSoon: 0,
    },
  },
};

export type MockScenarioName = keyof typeof mockScenarios;
