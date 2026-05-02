import type { Meta, StoryObj } from '@storybook/vue3-vite'

import { createTaskHandlers } from '@/mocks/handlers'
import DashboardView from './DashboardView.vue'

const meta = {
  title: 'Views/DashboardView',
  component: DashboardView,
} satisfies Meta<typeof DashboardView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  parameters: {
    msw: {
      handlers: createTaskHandlers('default'),
    },
  },
}

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: createTaskHandlers('empty'),
    },
  },
}

export const Overdue: Story = {
  parameters: {
    msw: {
      handlers: createTaskHandlers('overdue'),
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

export const Slow: Story = {
  parameters: {
    msw: {
      handlers: createTaskHandlers('slow'),
    },
  },
}
