<script setup lang="ts">
import { computed, reactive } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { storeToRefs } from "pinia";
import { taskStatusLabel, taskStatusOptions } from "@learn-java/task-domain";
import type { LearningTask, TaskStatus } from "@learn-java/task-domain";

import { useMobileTaskStore } from "@/stores/taskStore";

const taskStore = useMobileTaskStore();
const { tasks, loading } = storeToRefs(taskStore);
const filters = reactive({
  keyword: "",
  status: undefined as TaskStatus | undefined,
});
const statusValue = computed({
  get: () => filters.status ?? "ALL",
  set: (value: string | number) => {
    filters.status = value === "ALL" ? undefined : (value as TaskStatus);
  },
});
const statusOptions = computed(() => [
  { value: "ALL", label: "全部" },
  ...taskStatusOptions.map((item) => ({
    value: item.value,
    label: item.label,
  })),
]);

async function loadTasks() {
  try {
    await taskStore.loadTasks({
      keyword: filters.keyword.trim() || undefined,
      status: filters.status,
    });
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : "加载失败",
      icon: "none",
    });
  }
}

function openTask(id: number) {
  uni.navigateTo({ url: `/pages/task-detail/index?id=${id}` });
}

function statusType(status: LearningTask["status"]) {
  if (status === "DONE") {
    return "success";
  }
  if (status === "DOING") {
    return "primary";
  }
  return "warning";
}

function selectStatus(value: TaskStatus | "ALL") {
  statusValue.value = value;
  void loadTasks();
}

onShow(loadTasks);
</script>

<template>
  <view class="page">
    <view class="page-hero">
      <text class="page-hero__eyebrow">{{ loading ? "刷新中" : "任务中心" }}</text>
      <text class="page-hero__title">任务</text>
      <text class="page-hero__meta"
        >{{ tasks.length }} 条任务，按标题和状态快速定位</text
      >
    </view>

    <view class="search-panel">
      <view class="search-input-shell" data-testid="mobile-task-search">
        <text class="search-input-shell__icon">⌕</text>
        <input
          v-model="filters.keyword"
          class="search-input-shell__input"
          placeholder="搜索标题或说明"
          @confirm="loadTasks"
        />
      </view>
      <wd-segmented
        v-model:value="statusValue"
        class="status-filter"
        size="large"
        :options="statusOptions"
        @change="selectStatus($event.value as TaskStatus | 'ALL')"
      >
        <template #label="{ option }">
          {{ typeof option === "string" ? option : option.label }}
        </template>
      </wd-segmented>
      <view class="tag-row">
        <wd-button
          data-testid="mobile-filter-all"
          size="small"
          type="info"
          plain
          @click="selectStatus('ALL')"
        >
          全部
        </wd-button>
        <wd-button
          v-for="item in taskStatusOptions"
          :key="item.value"
          :data-testid="`mobile-filter-${item.value}`"
          size="small"
          type="info"
          plain
          @click="selectStatus(item.value)"
        >
          {{ item.label }}
        </wd-button>
      </view>
    </view>

    <view class="section">
      <view
        v-for="task in tasks"
        :key="task.id"
        class="app-card app-card--interactive"
        data-testid="mobile-task-card"
        @click="openTask(task.id)"
      >
        <view class="card-content stack">
          <view class="row">
            <text class="title">{{ task.title }}</text>
            <wd-tag round :type="statusType(task.status)">{{
              taskStatusLabel(task.status)
            }}</wd-tag>
          </view>
          <text class="body">{{ task.projectName || "未归属项目" }}</text>
          <text class="muted">截止日期：{{ task.dueDate || "未设置" }}</text>
        </view>
      </view>
    </view>
  </view>
</template>
