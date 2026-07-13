<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  metrics: { type: Array, default: () => [] },
  dense: { type: Boolean, default: false },
})
</script>

<template>
  <section class="kpi-panel" :class="{ dense }">
    <div class="panel-heading">
      <div>
        <span>{{ subtitle }}</span>
        <h3>{{ title }}</h3>
      </div>
    </div>
    <div class="metric-list">
      <div v-for="item in metrics" :key="item.label" class="metric-item">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}<em>{{ item.unit }}</em></strong>
        <b v-if="item.trend">{{ item.trend }}</b>
      </div>
    </div>
  </section>
</template>

<style scoped>
.kpi-panel {
  position: relative;
  padding: 14px;
  border: 1px solid rgba(56, 189, 248, 0.28);
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(10, 28, 52, 0.78), rgba(5, 15, 31, 0.84));
  box-shadow: inset 0 0 28px rgba(14, 165, 233, 0.08), 0 0 24px rgba(14, 165, 233, 0.08);
}

.kpi-panel::before,
.kpi-panel::after {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  border-color: #38bdf8;
  border-style: solid;
}

.kpi-panel::before {
  left: -1px;
  top: -1px;
  border-width: 1px 0 0 1px;
}

.kpi-panel::after {
  right: -1px;
  bottom: -1px;
  border-width: 0 1px 1px 0;
}

.panel-heading span {
  color: #38bdf8;
  font-size: 10px;
}

h3 {
  margin: 3px 0 12px;
  color: #e8f7ff;
  font-size: 16px;
}

.metric-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.dense .metric-list {
  grid-template-columns: 1fr;
}

.metric-item {
  min-height: 72px;
  padding: 10px;
  border: 1px solid rgba(125, 211, 252, 0.14);
  border-radius: 6px;
  background: rgba(8, 25, 47, 0.66);
}

.metric-item span,
.metric-item b {
  color: #8fb6d9;
  font-size: 12px;
}

.metric-item strong {
  display: block;
  margin-top: 5px;
  color: #f8fdff;
  font-size: 24px;
}

.metric-item em {
  margin-left: 4px;
  color: #7dd3fc;
  font-size: 12px;
  font-style: normal;
}

.metric-item b {
  display: block;
  margin-top: 2px;
  color: #26f5a6;
  font-weight: 500;
}
</style>
