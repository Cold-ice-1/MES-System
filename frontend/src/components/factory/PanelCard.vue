<template>
  <section class="panel-card">
    <slot></slot>
  </section>
</template>

<style scoped>
.panel-card {
  min-width: 0;
  min-height: 0;
  padding: clamp(14px, 1.1vw, 20px);
  border: 1px solid var(--panel-border);
  border-radius: 10px;
  background: var(--panel-bg);
  box-shadow: var(--shadow-soft);
  overflow: visible;
}
</style>
