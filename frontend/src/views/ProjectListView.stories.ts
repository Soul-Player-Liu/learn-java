import type { Meta, StoryObj } from '@storybook/vue3-vite'

import { createTaskHandlers } from '@/mocks/handlers'
import ProjectListView from './ProjectListView.vue'

const meta = {
  title: 'Views/ProjectListView',
  component: ProjectListView,
} satisfies Meta<typeof ProjectListView>

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

export const ServerError: Story = {
  parameters: {
    msw: {
      handlers: createTaskHandlers('serverError'),
    },
  },
}
