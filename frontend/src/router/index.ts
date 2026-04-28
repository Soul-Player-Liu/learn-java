import { createRouter, createWebHistory } from 'vue-router'

import DashboardView from '@/views/DashboardView.vue'
import TaskDetailView from '@/views/TaskDetailView.vue'
import TaskBoard from '@/views/TaskBoard.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: TaskBoard,
    },
    {
      path: '/tasks/:id',
      name: 'task-detail',
      component: TaskDetailView,
      props: (route) => ({ id: Number(route.params.id) }),
    },
  ],
})

export default router
