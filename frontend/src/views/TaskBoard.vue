<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { Delete, Edit, Plus, Refresh, Search, View } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'

import { useTaskStore } from '@/stores/taskStore'
import type { LearningTask, TaskStatus } from '@/types/task'

const taskStore = useTaskStore()
const router = useRouter()
const route = useRoute()
const { tasks, loading, projects, tags, taskPage } = storeToRefs(taskStore)
const dialogVisible = ref(false)
const editingTask = ref<LearningTask | null>(null)

const form = reactive({
  projectId: undefined as number | undefined,
  title: '',
  description: '',
  status: 'TODO' as TaskStatus,
  dueDate: '',
  tagInput: '',
})

const filters = reactive({
  keyword: '',
  status: undefined as TaskStatus | undefined,
  projectId: undefined as number | undefined,
  overdueOnly: false,
  tag: undefined as string | undefined,
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
  form.projectId = filters.projectId
  form.tagInput = filters.tag ?? ''
}

async function loadTasks(page = taskPage.value.page, size = taskPage.value.size) {
  try {
    await taskStore.loadTasks({
      keyword: filters.keyword.trim() || undefined,
      status: filters.status,
      projectId: filters.projectId,
      overdueOnly: filters.overdueOnly,
      tag: filters.tag,
      page,
      size,
    })
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '加载失败')
  }
}

async function searchTasks() {
  await loadTasks(1, taskPage.value.size)
}

async function resetFilters() {
  filters.keyword = ''
  filters.status = undefined
  filters.projectId = undefined
  filters.overdueOnly = false
  filters.tag = undefined
  await loadTasks(1, taskPage.value.size)
}

async function handlePageChange(page: number) {
  await loadTasks(page, taskPage.value.size)
}

async function handleSizeChange(size: number) {
  await loadTasks(1, size)
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
  form.projectId = task.projectId
  form.tagInput = task.tagNames.join(', ')
  dialogVisible.value = true
}

async function submitForm() {
  if (!form.title.trim()) {
    ElMessage.warning('请输入任务标题')
    return
  }

  const commonPayload = {
    projectId: form.projectId,
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    dueDate: form.dueDate || undefined,
    tagNames: form.tagInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
  }

  try {
    if (editingTask.value) {
      await taskStore.updateTask(editingTask.value.id, {
        ...commonPayload,
        status: form.status,
      })
      ElMessage.success('任务已更新')
    } else {
      await taskStore.createTask(commonPayload)
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

onMounted(async () => {
  const routeProjectId = Number(route.query.projectId)
  if (routeProjectId) {
    filters.projectId = routeProjectId
  }
  await Promise.all([taskStore.loadProjects(), taskStore.loadTags(), loadTasks()])
})
</script>

<template>
  <main class="page">
    <section class="toolbar">
      <div>
        <h1>学习任务</h1>
        <p>用列表查询、动态 SQL、编辑弹窗和详情跳转串起完整 CRUD。</p>
      </div>
      <div class="toolbar-actions">
        <el-button :icon="Refresh" @click="loadTasks()">刷新</el-button>
        <el-button type="primary" :icon="Plus" @click="openCreateDialog">新增</el-button>
      </div>
    </section>

    <section class="filter-bar">
      <el-input
        v-model="filters.keyword"
        :prefix-icon="Search"
        clearable
        placeholder="搜索标题或说明"
        @keyup.enter="searchTasks"
      />
      <el-select v-model="filters.status" clearable placeholder="状态" data-testid="task-filter-status">
        <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-select v-model="filters.projectId" clearable placeholder="项目" data-testid="task-filter-project">
        <el-option v-for="project in projects" :key="project.id" :label="project.name" :value="project.id" />
      </el-select>
      <el-select v-model="filters.tag" clearable filterable placeholder="标签" data-testid="task-filter-tag">
        <el-option v-for="tag in tags" :key="tag.id" :label="tag.name" :value="tag.name" />
      </el-select>
      <el-checkbox v-model="filters.overdueOnly" data-testid="task-filter-overdue">只看逾期</el-checkbox>
      <el-button type="primary" @click="searchTasks">查询</el-button>
      <el-button @click="resetFilters">重置</el-button>
    </section>

    <section class="content">
      <el-table v-loading="loading" :data="tasks" row-key="id" height="calc(100vh - 270px)">
        <el-table-column prop="title" label="任务" min-width="180">
          <template #default="{ row }">
            <el-button link type="primary" @click="router.push(`/tasks/${row.id}`)">
              {{ row.title }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="projectName" label="项目" min-width="150">
          <template #default="{ row }">
            {{ row.projectName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="说明" min-width="240" show-overflow-tooltip />
        <el-table-column label="标签" min-width="180">
          <template #default="{ row }">
            <div class="tag-list">
              <el-tag v-for="tag in row.tagNames" :key="tag" size="small" effect="plain">{{ tag }}</el-tag>
              <span v-if="!row.tagNames.length">-</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-dropdown trigger="click" @command="handleStatusCommand">
              <el-tag class="status-tag" :type="statusType(row.status)" data-testid="task-status-menu">
                {{ statusLabel(row.status) }}
              </el-tag>
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
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button :icon="View" circle title="详情" @click="router.push(`/tasks/${row.id}`)" />
            <el-button :icon="Edit" circle title="编辑" @click="openEditDialog(row)" />
            <el-button :icon="Delete" circle title="删除" type="danger" @click="removeTask(row)" />
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-bar" data-testid="task-pagination">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :current-page="taskPage.page"
          :page-size="taskPage.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="taskPage.total"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </section>

    <el-dialog v-model="dialogVisible" :title="title" width="520px" @closed="resetForm">
      <el-form label-position="top">
        <el-form-item label="项目">
          <el-select
            v-model="form.projectId"
            clearable
            filterable
            placeholder="未归属项目"
            data-testid="task-form-project"
          >
            <el-option
              v-for="project in projects"
              :key="project.id"
              :label="project.name"
              :value="project.id"
            />
          </el-select>
        </el-form-item>
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
          <el-date-picker
            v-model="form.dueDate"
            value-format="YYYY-MM-DD"
            type="date"
            data-testid="task-form-due-date"
          />
        </el-form-item>
        <el-form-item label="标签">
          <el-input
            v-model="form.tagInput"
            placeholder="多个标签用逗号分隔"
            maxlength="120"
            data-testid="task-form-tags"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </main>
</template>
