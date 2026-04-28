<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { Back, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

import { useTaskStore } from '@/stores/taskStore'
import type { TaskStatus } from '@/types/task'

const props = defineProps<{
  id: number
}>()

const taskStore = useTaskStore()
const { selectedTask, detailLoading } = storeToRefs(taskStore)

const statusOptions: Array<{ label: string; value: TaskStatus }> = [
  { label: '待开始', value: 'TODO' },
  { label: '进行中', value: 'DOING' },
  { label: '已完成', value: 'DONE' },
]

const statusText = computed(() => statusOptions.find((item) => item.value === selectedTask.value?.status)?.label ?? '-')

async function loadTask() {
  try {
    await taskStore.loadTask(props.id)
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '加载失败')
  }
}

async function changeStatus(status: TaskStatus) {
  try {
    await taskStore.changeTaskStatus(props.id, { status })
    ElMessage.success('状态已更新')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '更新失败')
  }
}

async function handleSegmentChange(value: string | number) {
  await changeStatus(value as TaskStatus)
}

onMounted(loadTask)
</script>

<template>
  <main class="page">
    <section class="toolbar">
      <div>
        <h1>任务详情</h1>
        <p>这里对应后端的 GET 单条记录和 PATCH 状态接口。</p>
      </div>
      <div class="toolbar-actions">
        <el-button :icon="Back" @click="$router.push('/tasks')">返回</el-button>
        <el-button :icon="Refresh" @click="loadTask">刷新</el-button>
      </div>
    </section>

    <section v-loading="detailLoading" class="detail-layout">
      <div v-if="selectedTask" class="content detail-panel">
        <div class="section-title">
          <h2>{{ selectedTask.title }}</h2>
          <el-tag>{{ statusText }}</el-tag>
        </div>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="任务 ID">{{ selectedTask.id }}</el-descriptions-item>
          <el-descriptions-item label="说明">{{ selectedTask.description || '-' }}</el-descriptions-item>
          <el-descriptions-item label="截止日期">{{ selectedTask.dueDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ selectedTask.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ selectedTask.updatedAt }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <div v-if="selectedTask" class="content action-panel">
        <div class="section-title">
          <h2>状态流转</h2>
        </div>
        <el-segmented
          :model-value="selectedTask.status"
          :options="statusOptions"
          @update:model-value="handleSegmentChange"
        />
      </div>

      <el-empty v-if="!detailLoading && !selectedTask" description="没有找到任务" />
    </section>
  </main>
</template>
