import type { Meta, StoryObj } from '@storybook/vue3-vite'

import { createTaskHandlers } from '@/mocks/handlers'
import TaskDetailView from './TaskDetailView.vue'

const meta = {
  title: 'Views/TaskDetailView',
  component: TaskDetailView,
  args: {
    id: 1,
  },
} satisfies Meta<typeof TaskDetailView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  parameters: {
    msw: {
      handlers: createTaskHandlers('default'),
    },
  },
}

export const NotFound: Story = {
  args: {
    id: 404,
  },
  parameters: {
    msw: {
      handlers: createTaskHandlers('default'),
    },
  },
}

export const ServerError: Story = {
  parameters: {
    msw: {
      handlers: createTaskHandlers('serverError'),
    },
  },
}
