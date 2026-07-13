<script setup>
const modules = [
  { path: '/dashboard', label: '综合看板' },
  { path: '/factory-3d', label: '数字孪生大屏' },
  { path: '/equipment', label: '设备管理' },
  { path: '/production', label: '生产报工' },
]
</script>

<template>
  <nav class="module-menu" aria-label="模块导航">
    <router-link v-for="item in modules" :key="item.path" :to="item.path">
      {{ item.label }}
    </router-link>
  </nav>
</template>

<style scoped>
.module-menu {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  min-width: 0;
}

a {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border: 1px solid rgba(135, 176, 210, 0.18);
  border-radius: 999px;
  color: #a9c3d8;
  font-size: clamp(11px, 0.68vw, 13px);
  text-decoration: none;
  background: rgba(7, 18, 32, 0.62);
}

a.router-link-active {
  border-color: rgba(56, 189, 248, 0.48);
  color: #e8f7ff;
  background: rgba(14, 165, 233, 0.18);
}

@media (max-width: 1180px) {
  a {
    padding: 0 9px;
  }
}
</style>
