<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { storeToRefs } from 'pinia'
import { Back, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

import { useTaskStore } from '@/stores/taskStore'
import type { TaskStatus } from '@/types/task'

const props = defineProps<{
  id: number
}>()

const taskStore = useTaskStore()
const { selectedTask, detailLoading, comments, activities } = storeToRefs(taskStore)
const commentForm = reactive({
  content: '',
  author: '',
})

const statusOptions: Array<{ label: string; value: TaskStatus }> = [
  { label: '待开始', value: 'TODO' },
  { label: '进行中', value: 'DOING' },
  { label: '已完成', value: 'DONE' },
]

const statusText = computed(
  () => statusOptions.find((item) => item.value === selectedTask.value?.status)?.label ?? '-',
)

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

async function submitComment() {
  if (!commentForm.content.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }

  try {
    await taskStore.addComment(props.id, {
      content: commentForm.content.trim(),
      author: commentForm.author.trim() || undefined,
    })
    commentForm.content = ''
    commentForm.author = ''
    ElMessage.success('评论已添加')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '评论失败')
  }
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
          <el-descriptions-item label="所属项目">{{ selectedTask.projectName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="标签">
            <div class="tag-list">
              <el-tag v-for="tag in selectedTask.tagNames" :key="tag" size="small" effect="plain">
                {{ tag }}
              </el-tag>
              <span v-if="!selectedTask.tagNames.length">-</span>
            </div>
          </el-descriptions-item>
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

      <div v-if="selectedTask" class="content comment-panel">
        <div class="section-title">
          <h2>评论</h2>
          <el-tag type="info">{{ comments.length }}</el-tag>
        </div>
        <el-form label-position="top" class="comment-form">
          <el-form-item label="评论内容">
            <el-input v-model="commentForm.content" type="textarea" maxlength="500" show-word-limit />
          </el-form-item>
          <el-form-item label="作者">
            <el-input v-model="commentForm.author" placeholder="anonymous" maxlength="50" />
          </el-form-item>
          <el-button type="primary" @click="submitComment">添加评论</el-button>
        </el-form>
        <el-timeline class="timeline">
          <el-timeline-item v-for="comment in comments" :key="comment.id" :timestamp="comment.createdAt">
            <strong>{{ comment.author || 'anonymous' }}</strong>
            <p>{{ comment.content }}</p>
          </el-timeline-item>
        </el-timeline>
      </div>

      <div v-if="selectedTask" class="content activity-panel">
        <div class="section-title">
          <h2>活动日志</h2>
        </div>
        <el-timeline class="timeline">
          <el-timeline-item v-for="activity in activities" :key="activity.id" :timestamp="activity.createdAt">
            <el-tag size="small">{{ activity.type }}</el-tag>
            <p>{{ activity.message }}</p>
          </el-timeline-item>
        </el-timeline>
      </div>

      <el-empty v-if="!detailLoading && !selectedTask" description="没有找到任务" />
    </section>
  </main>
</template>
