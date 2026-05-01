<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Plus, Refresh, View } from '@element-plus/icons-vue'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'

import { useTaskStore } from '@/stores/taskStore'

const taskStore = useTaskStore()
const { projects } = storeToRefs(taskStore)
const dialogVisible = ref(false)

const form = reactive({
  name: '',
  description: '',
})

function resetForm() {
  form.name = ''
  form.description = ''
}

async function loadProjects() {
  try {
    await taskStore.loadProjects()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '加载失败')
  }
}

async function submitForm() {
  if (!form.name.trim()) {
    ElMessage.warning('请输入项目名称')
    return
  }

  try {
    await taskStore.createProject({
      name: form.name.trim(),
      description: form.description.trim() || undefined,
    })
    dialogVisible.value = false
    resetForm()
    ElMessage.success('项目已创建')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '保存失败')
  }
}

onMounted(loadProjects)
</script>

<template>
  <main class="page">
    <section class="toolbar">
      <div>
        <h1>学习项目</h1>
        <p>项目作为任务的上层归属，用于观察跨表统计和项目级筛选。</p>
      </div>
      <div class="toolbar-actions">
        <el-button :icon="Refresh" @click="loadProjects">刷新</el-button>
        <el-button type="primary" :icon="Plus" @click="dialogVisible = true">新增项目</el-button>
      </div>
    </section>

    <section class="content">
      <el-table :data="projects" row-key="id">
        <el-table-column prop="name" label="项目" min-width="180" />
        <el-table-column prop="description" label="说明" min-width="260" show-overflow-tooltip />
        <el-table-column prop="taskCount" label="任务数" width="100" />
        <el-table-column prop="doneTaskCount" label="已完成" width="100" />
        <el-table-column label="任务" width="110">
          <template #default="{ row }">
            <el-button :icon="View" link type="primary" @click="$router.push(`/tasks?projectId=${row.id}`)">
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <el-dialog v-model="dialogVisible" title="新增学习项目" width="520px" @closed="resetForm">
      <el-form label-position="top">
        <el-form-item label="项目名称" required>
          <el-input v-model="form.name" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="form.description" type="textarea" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </main>
</template>
