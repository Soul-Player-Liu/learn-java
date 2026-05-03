<script setup lang="ts">
import { reactive } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { storeToRefs } from "pinia";
import { taskStatusLabel, taskStatusOptions } from "@learn-java/task-domain";
import type { TaskStatus } from "@learn-java/task-domain";

import { useMobileTaskStore } from "@/stores/taskStore";

const taskStore = useMobileTaskStore();
const { tasks, loading } = storeToRefs(taskStore);
const filters = reactive({
  keyword: "",
  status: undefined as TaskStatus | undefined,
});

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

onShow(loadTasks);
</script>

<template>
  <view class="page">
    <view class="page-title">
      <text class="page-title__text">任务</text>
      <text class="muted">{{ loading ? "加载中" : `${tasks.length} 条` }}</text>
    </view>

    <view class="section card stack">
      <input
        v-model="filters.keyword"
        class="body"
        data-testid="mobile-task-search"
        placeholder="搜索标题或说明"
        @confirm="loadTasks"
      />
      <view class="button-row">
        <button
          data-testid="mobile-filter-all"
          size="mini"
          @click="
            filters.status = undefined;
            loadTasks();
          "
        >
          全部
        </button>
        <button
          v-for="item in taskStatusOptions"
          :key="item.value"
          :data-testid="`mobile-filter-${item.value}`"
          size="mini"
          @click="
            filters.status = item.value;
            loadTasks();
          "
        >
          {{ item.label }}
        </button>
      </view>
    </view>

    <view class="stack">
      <view
        v-for="task in tasks"
        :key="task.id"
        class="card"
        data-testid="mobile-task-card"
        @click="openTask(task.id)"
      >
        <view class="row">
          <text class="body">{{ task.title }}</text>
          <text class="badge">{{ taskStatusLabel(task.status) }}</text>
        </view>
        <text class="muted">{{ task.projectName || "未归属项目" }}</text>
        <text class="muted">{{ task.dueDate || "未设置截止日期" }}</text>
      </view>
    </view>
  </view>
</template>
