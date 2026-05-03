<script setup lang="ts">
import { computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { storeToRefs } from "pinia";
import { taskStatusLabel } from "@learn-java/task-domain";
import type { LearningTask } from "@learn-java/task-domain";

import { useMobileTaskStore } from "@/stores/taskStore";

const taskStore = useMobileTaskStore();
const { statistics, tasks, projects, loading } = storeToRefs(taskStore);
const recentTasks = computed(() => tasks.value.slice(0, 5));

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
    <view class="page-hero">
      <text class="page-hero__eyebrow">{{ loading ? "同步中" : "今日学习" }}</text>
      <text class="page-hero__title" data-testid="mobile-dashboard-title"
        >学习概览</text
      >
      <text class="page-hero__meta"
        >{{ statistics?.doing ?? 0 }} 个任务进行中，{{
          statistics?.dueSoon ?? 0
        }}
        个 7 天内到期</text
      >
    </view>

    <view class="section summary-grid">
      <view class="metric-card">
        <text class="metric-card__label">总任务</text>
        <text class="metric-card__value">{{ statistics?.total ?? 0 }}</text>
      </view>
      <view class="metric-card">
        <text class="metric-card__label">进行中</text>
        <text class="metric-card__value">{{ statistics?.doing ?? 0 }}</text>
      </view>
      <view class="metric-card">
        <text class="metric-card__label">已逾期</text>
        <text class="metric-card__value">{{ statistics?.overdue ?? 0 }}</text>
      </view>
      <view class="metric-card">
        <text class="metric-card__label">7 天内到期</text>
        <text class="metric-card__value">{{ statistics?.dueSoon ?? 0 }}</text>
      </view>
    </view>

    <view class="section">
      <view class="section-title">
        <text class="section-title__text">最近任务</text>
        <text class="section-title__meta">最近 5 条</text>
      </view>
      <view
        v-for="task in recentTasks"
        :key="task.id"
        class="app-card app-card--interactive"
        data-testid="mobile-recent-task"
        @click="openTask(task.id)"
      >
        <view class="card-content stack">
          <view class="row">
            <text class="title">{{ task.title }}</text>
            <wd-tag round :type="statusType(task.status)">{{
              taskStatusLabel(task.status)
            }}</wd-tag>
          </view>
          <text class="muted">{{ task.projectName || "未归属项目" }}</text>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">
        <text class="section-title__text">项目进度</text>
        <text class="section-title__meta">{{ projects.length }} 个</text>
      </view>
      <view v-for="project in projects" :key="project.id" class="app-card">
        <view class="card-content progress-block">
          <view class="row">
            <text class="body">{{ project.name }}</text>
            <text class="muted"
              >{{ project.doneTaskCount }}/{{ project.taskCount }}</text
            >
          </view>
          <wd-progress
            :percentage="
              project.taskCount
                ? Math.round((project.doneTaskCount / project.taskCount) * 100)
                : 0
            "
            hide-text
            color="#16a34a"
          />
        </view>
      </view>
    </view>
  </view>
</template>
