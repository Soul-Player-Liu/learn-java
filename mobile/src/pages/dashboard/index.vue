<script setup lang="ts">
import { computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { storeToRefs } from "pinia";

import { useMobileTaskStore } from "@/stores/taskStore";

const taskStore = useMobileTaskStore();
const { statistics, tasks, projects, loading } = storeToRefs(taskStore);
const recentTasks = computed(() => tasks.value.slice(0, 5));

function openTask(id: number) {
  uni.navigateTo({ url: `/pages/task-detail/index?id=${id}` });
}

onShow(async () => {
  try {
    await taskStore.loadDashboard();
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : "加载失败",
      icon: "none",
    });
  }
});
</script>

<template>
  <view class="page">
    <view class="page-title">
      <text class="page-title__text">学习概览</text>
      <text class="muted">{{ loading ? "加载中" : "已同步" }}</text>
    </view>

    <view class="section card">
      <view class="row">
        <text class="muted">总任务</text>
        <text class="title">{{ statistics?.total ?? 0 }}</text>
      </view>
      <view class="row">
        <text class="muted">进行中</text>
        <text>{{ statistics?.doing ?? 0 }}</text>
      </view>
      <view class="row">
        <text class="muted">已逾期</text>
        <text>{{ statistics?.overdue ?? 0 }}</text>
      </view>
      <view class="row">
        <text class="muted">7 天内到期</text>
        <text>{{ statistics?.dueSoon ?? 0 }}</text>
      </view>
    </view>

    <view class="section stack">
      <text class="title">最近任务</text>
      <view
        v-for="task in recentTasks"
        :key="task.id"
        class="card"
        @click="openTask(task.id)"
      >
        <view class="row">
          <text class="body">{{ task.title }}</text>
          <text class="badge">{{ task.status }}</text>
        </view>
        <text class="muted">{{ task.projectName || "未归属项目" }}</text>
      </view>
    </view>

    <view class="section stack">
      <text class="title">项目进度</text>
      <view v-for="project in projects" :key="project.id" class="card">
        <view class="row">
          <text class="body">{{ project.name }}</text>
          <text class="muted"
            >{{ project.doneTaskCount }}/{{ project.taskCount }}</text
          >
        </view>
      </view>
    </view>
  </view>
</template>
