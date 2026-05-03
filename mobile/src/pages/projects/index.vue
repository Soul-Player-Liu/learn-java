<script setup lang="ts">
import { onShow } from "@dcloudio/uni-app";
import { storeToRefs } from "pinia";
import type { LearningProject } from "@learn-java/task-domain";

import { useMobileTaskStore } from "@/stores/taskStore";

const taskStore = useMobileTaskStore();
const { projects } = storeToRefs(taskStore);

onShow(async () => {
  try {
    await taskStore.loadProjects();
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : "加载失败",
      icon: "none",
    });
  }
});

function projectPercent(project: LearningProject) {
  return project.taskCount
    ? Math.round((project.doneTaskCount / project.taskCount) * 100)
    : 0;
}
</script>

<template>
  <view class="page">
    <view class="page-hero">
      <text class="page-hero__eyebrow">学习计划</text>
      <text class="page-hero__title">项目</text>
      <text class="page-hero__meta"
        >{{ projects.length }} 个学习项目，持续跟踪完成进度</text
      >
    </view>

    <view class="section">
      <view
        v-for="project in projects"
        :key="project.id"
        class="app-card"
        data-testid="mobile-project-card"
      >
        <view class="card-content stack">
          <view class="row">
            <text class="title">{{ project.name }}</text>
            <wd-tag round type="primary"
              >{{ project.doneTaskCount }}/{{ project.taskCount }}</wd-tag
            >
          </view>
          <text class="body">{{ project.description || "暂无说明" }}</text>
          <view class="progress-block">
            <view class="row">
              <text class="muted">完成进度</text>
              <text class="muted">{{ projectPercent(project) }}%</text>
            </view>
            <wd-progress
              :percentage="projectPercent(project)"
              hide-text
              color="#2563eb"
            />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
