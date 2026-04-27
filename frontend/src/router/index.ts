import { createRouter, createWebHistory } from 'vue-router'

import TaskBoard from '@/views/TaskBoard.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'tasks',
      component: TaskBoard,
    },
  ],
})

export default router
