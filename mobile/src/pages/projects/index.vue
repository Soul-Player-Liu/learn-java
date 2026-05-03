<script setup lang="ts">
import { onShow } from "@dcloudio/uni-app";
import { storeToRefs } from "pinia";

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
</script>

<template>
  <view class="page">
    <view class="page-title">
      <text class="page-title__text">项目</text>
      <text class="muted">{{ projects.length }} 个</text>
    </view>

    <view class="stack">
      <view
        v-for="project in projects"
        :key="project.id"
        class="card stack"
        data-testid="mobile-project-card"
      >
        <view class="row">
          <text class="title">{{ project.name }}</text>
          <text class="badge"
            >{{ project.doneTaskCount }}/{{ project.taskCount }}</text
          >
        </view>
        <text class="body">{{ project.description || "暂无说明" }}</text>
      </view>
    </view>
  </view>
</template>
