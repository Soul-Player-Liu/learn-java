<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { Delete, Edit, Plus, Refresh, Search, View } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

import { useTaskStore } from '@/stores/taskStore'
import type { LearningTask, TaskStatus } from '@/types/task'

const taskStore = useTaskStore()
const router = useRouter()
const { tasks, loading } = storeToRefs(taskStore)
const dialogVisible = ref(false)
const editingTask = ref<LearningTask | null>(null)

const form = reactive({
  title: '',
  description: '',
  status: 'TODO' as TaskStatus,
  dueDate: '',
})

const filters = reactive({
  keyword: '',
  status: undefined as TaskStatus | undefined,
  overdueOnly: false,
})

const statusOptions: Array<{ label: string; value: TaskStatus; type: 'info' | 'warning' | 'success' }> = [
  { label: '待开始', value: 'TODO', type: 'info' },
  { label: '进行中', value: 'DOING', type: 'warning' },
  { label: '已完成', value: 'DONE', type: 'success' },
]

const title = computed(() => (editingTask.value ? '编辑学习任务' : '新增学习任务'))

function statusLabel(status: TaskStatus) {
  return statusOptions.find((item) => item.value === status)?.label ?? status
}

function statusType(status: TaskStatus) {
  return statusOptions.find((item) => item.value === status)?.type ?? 'info'
}

function resetForm() {
  editingTask.value = null
  form.title = ''
  form.description = ''
  form.status = 'TODO'
  form.dueDate = ''
}

async function loadTasks() {
  try {
    await taskStore.loadTasks({
      keyword: filters.keyword.trim() || undefined,
      status: filters.status,
      overdueOnly: filters.overdueOnly,
    })
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '加载失败')
  }
}

async function resetFilters() {
  filters.keyword = ''
  filters.status = undefined
  filters.overdueOnly = false
  await loadTasks()
}

function openCreateDialog() {
  resetForm()
  dialogVisible.value = true
}

function openEditDialog(task: LearningTask) {
  editingTask.value = task
  form.title = task.title
  form.description = task.description ?? ''
  form.status = task.status
  form.dueDate = task.dueDate ?? ''
  dialogVisible.value = true
}

async function submitForm() {
  if (!form.title.trim()) {
    ElMessage.warning('请输入任务标题')
    return
  }

  const payload = {
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    status: form.status,
    dueDate: form.dueDate || undefined,
  }

  try {
    if (editingTask.value) {
      await taskStore.updateTask(editingTask.value.id, payload)
      ElMessage.success('任务已更新')
    } else {
      await taskStore.createTask(payload)
      ElMessage.success('任务已创建')
    }
    dialogVisible.value = false
    resetForm()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '保存失败')
  }
}

async function removeTask(task: LearningTask) {
  await ElMessageBox.confirm(`删除「${task.title}」？`, '确认删除', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
  })

  try {
    await taskStore.deleteTask(task.id)
    ElMessage.success('任务已删除')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '删除失败')
  }
}

async function changeStatus(task: LearningTask, status: TaskStatus) {
  try {
    await taskStore.changeTaskStatus(task.id, { status })
    ElMessage.success('状态已更新')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '更新失败')
  }
}

async function handleStatusCommand(command: { task: LearningTask; status: TaskStatus }) {
  await changeStatus(command.task, command.status)
}

onMounted(loadTasks)
</script>

<template>
  <main class="page">
    <section class="toolbar">
      <div>
        <h1>学习任务</h1>
        <p>用列表查询、动态 SQL、编辑弹窗和详情跳转串起完整 CRUD。</p>
      </div>
      <div class="toolbar-actions">
        <el-button :icon="Refresh" @click="loadTasks">刷新</el-button>
        <el-button type="primary" :icon="Plus" @click="openCreateDialog">新增</el-button>
      </div>
    </section>

    <section class="filter-bar">
      <el-input
        v-model="filters.keyword"
        :prefix-icon="Search"
        clearable
        placeholder="搜索标题或说明"
        @keyup.enter="loadTasks"
      />
      <el-select v-model="filters.status" clearable placeholder="状态">
        <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-checkbox v-model="filters.overdueOnly">只看逾期</el-checkbox>
      <el-button type="primary" @click="loadTasks">查询</el-button>
      <el-button @click="resetFilters">重置</el-button>
    </section>

    <section class="content">
      <el-table v-loading="loading" :data="tasks" row-key="id" height="calc(100vh - 210px)">
        <el-table-column prop="title" label="任务" min-width="180" />
        <el-table-column prop="description" label="说明" min-width="240" show-overflow-tooltip />
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-dropdown trigger="click" @command="handleStatusCommand">
              <el-tag class="status-tag" :type="statusType(row.status)">{{ statusLabel(row.status) }}</el-tag>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-for="item in statusOptions"
                    :key="item.value"
                    :command="{ task: row, status: item.value }"
                  >
                    {{ item.label }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
        <el-table-column prop="dueDate" label="截止日期" width="130" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button :icon="View" circle title="详情" @click="router.push(`/tasks/${row.id}`)" />
            <el-button :icon="Edit" circle title="编辑" @click="openEditDialog(row)" />
            <el-button :icon="Delete" circle title="删除" type="danger" @click="removeTask(row)" />
          </template>
        </el-table-column>
      </el-table>
    </section>

    <el-dialog v-model="dialogVisible" :title="title" width="520px" @closed="resetForm">
      <el-form label-position="top">
        <el-form-item label="标题" required>
          <el-input v-model="form.title" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="form.description" type="textarea" maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item label="状态">
          <el-segmented
            v-model="form.status"
            :options="statusOptions.map((item) => ({ label: item.label, value: item.value }))"
          />
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker v-model="form.dueDate" value-format="YYYY-MM-DD" type="date" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </main>
</template>
