<template>
  <div class="app-shell">
    <aside class="sidebar">
      <RouterLink class="brand" to="/">learn-java</RouterLink>
      <nav class="nav">
        <RouterLink to="/">概览</RouterLink>
        <RouterLink to="/tasks">任务</RouterLink>
      </nav>
    </aside>
    <RouterView />
  </div>
</template>
