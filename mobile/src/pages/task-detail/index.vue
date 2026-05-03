<script setup lang="ts">
import { computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { storeToRefs } from "pinia";
import { taskStatusLabel, taskStatusOptions } from "@learn-java/task-domain";
import type { TaskStatus } from "@learn-java/task-domain";

import { useMobileTaskStore } from "@/stores/taskStore";

const taskStore = useMobileTaskStore();
const { selectedTask } = storeToRefs(taskStore);
const taskId = computed(() => selectedTask.value?.id);

async function loadTask(id: number) {
  try {
    await taskStore.loadTask(id);
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : "加载失败",
      icon: "none",
    });
  }
}

async function changeStatus(status: TaskStatus) {
  if (!taskId.value) {
    return;
  }
  try {
    await taskStore.changeTaskStatus(taskId.value, status);
    uni.showToast({ title: "状态已更新", icon: "success" });
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : "更新失败",
      icon: "none",
    });
  }
}

onLoad((query) => {
  const id = Number(query?.id);
  if (id) {
    void loadTask(id);
  }
});
</script>

<template>
  <view class="page">
    <view v-if="selectedTask" class="stack">
      <view class="card stack">
        <view class="row">
          <text class="title">{{ selectedTask.title }}</text>
          <text class="badge">{{ taskStatusLabel(selectedTask.status) }}</text>
        </view>
        <text class="muted">{{
          selectedTask.projectName || "未归属项目"
        }}</text>
        <text class="body">{{ selectedTask.description || "暂无说明" }}</text>
        <text class="muted"
          >截止日期：{{ selectedTask.dueDate || "未设置" }}</text
        >
      </view>

      <view class="card stack">
        <text class="title">更新状态</text>
        <view class="button-row">
          <button
            v-for="item in taskStatusOptions"
            :key="item.value"
            size="mini"
            @click="changeStatus(item.value)"
          >
            {{ item.label }}
          </button>
        </view>
      </view>
    </view>

    <view v-else class="card">
      <text class="muted">任务加载中</text>
    </view>
  </view>
</template>
