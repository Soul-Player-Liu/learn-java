import type { Preview } from '@storybook/vue3-vite'
import ElementPlus from 'element-plus'
import { createPinia } from 'pinia'
import { setup } from '@storybook/vue3-vite'
import { initialize, mswLoader } from 'msw-storybook-addon'
import { createMemoryHistory, createRouter } from 'vue-router'
import 'element-plus/dist/index.css'
import '../src/styles/base.css'

import DashboardView from '../src/views/DashboardView.vue'
import TaskBoard from '../src/views/TaskBoard.vue'
import TaskDetailView from '../src/views/TaskDetailView.vue'

initialize({
  onUnhandledRequest: 'bypass',
})

setup((app) => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: DashboardView },
      { path: '/tasks', component: TaskBoard },
      { path: '/tasks/:id', component: TaskDetailView, props: (route) => ({ id: Number(route.params.id) }) },
    ],
  })

  app.use(createPinia())
  app.use(router)
  app.use(ElementPlus)
})

const preview: Preview = {
  loaders: [mswLoader],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
