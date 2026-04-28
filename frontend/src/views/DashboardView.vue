<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { Check, Clock, List, Warning } from '@element-plus/icons-vue'

import { useTaskStore } from '@/stores/taskStore'

const taskStore = useTaskStore()
const { statistics, tasks, loading } = storeToRefs(taskStore)

const recentTasks = computed(() => tasks.value.slice(0, 5))

async function loadDashboard() {
  await Promise.all([taskStore.loadStatistics(), taskStore.loadTasks()])
}

onMounted(loadDashboard)
</script>

<template>
  <main class="page">
    <section class="toolbar">
      <div>
        <h1>学习概览</h1>
        <p>从统计、列表、详情和接口调用几个角度观察同一组数据。</p>
      </div>
      <div class="toolbar-actions">
        <el-button type="primary" @click="$router.push('/tasks')">进入任务</el-button>
      </div>
    </section>

    <section class="metric-grid">
      <div class="metric-card">
        <el-icon><List /></el-icon>
        <span>总任务</span>
        <strong>{{ statistics?.total ?? 0 }}</strong>
      </div>
      <div class="metric-card">
        <el-icon><Clock /></el-icon>
        <span>进行中</span>
        <strong>{{ statistics?.doing ?? 0 }}</strong>
      </div>
      <div class="metric-card warning">
        <el-icon><Warning /></el-icon>
        <span>已逾期</span>
        <strong>{{ statistics?.overdue ?? 0 }}</strong>
      </div>
      <div class="metric-card success">
        <el-icon><Check /></el-icon>
        <span>已完成</span>
        <strong>{{ statistics?.done ?? 0 }}</strong>
      </div>
    </section>

    <section class="content">
      <div class="section-title">
        <h2>最近任务</h2>
        <el-tag type="info">7 天内到期 {{ statistics?.dueSoon ?? 0 }}</el-tag>
      </div>
      <el-table v-loading="loading" :data="recentTasks" row-key="id">
        <el-table-column prop="title" label="任务" min-width="180" />
        <el-table-column prop="status" label="状态" width="110" />
        <el-table-column prop="dueDate" label="截止日期" width="130" />
        <el-table-column label="详情" width="100">
          <template #default="{ row }">
            <el-button link type="primary" @click="$router.push(`/tasks/${row.id}`)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </main>
</template>
