<script setup>
defineProps({
  metrics: { type: Array, default: () => [] },
})
</script>

<template>
  <section class="panel kpi-panel">
    <header>
      <span>Production KPI</span>
      <h2>生产指标</h2>
    </header>
    <div class="metric-list">
      <div v-for="item in metrics" :key="item.label">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}<em>{{ item.unit }}</em></strong>
      </div>
    </div>
  </section>
</template>

<style scoped>
.panel {
  padding: clamp(12px, 1vw, 16px);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  background: var(--panel-bg);
}

header span,
.metric-list span {
  color: var(--text-secondary);
  font-size: 12px;
}

h2 {
  margin: 2px 0 12px;
  color: var(--text-primary);
  font-size: clamp(16px, 1vw, 18px);
}

.metric-list {
  display: grid;
  gap: 8px;
}

.metric-list div {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  padding: 9px 0;
  border-bottom: 1px solid var(--panel-border);
}

.metric-list div:last-child {
  border-bottom: 0;
}

strong {
  color: var(--text-primary);
  font-size: clamp(16px, 1.2vw, 22px);
}

em {
  margin-left: 3px;
  color: var(--text-muted);
  font-size: 12px;
  font-style: normal;
}
</style>
