<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  unit: { type: String, default: '' },
  tone: { type: String, default: 'default' },
})
</script>

<template>
  <div class="metric-card" :class="tone">
    <span>{{ label }}</span>
    <strong>{{ value }}<em>{{ unit }}</em></strong>
  </div>
</template>

<style scoped>
.metric-card {
  min-width: 0;
  padding: 14px;
  border: 1px solid var(--panel-border);
  border-radius: 10px;
  background: var(--panel-bg-soft);
}

span {
  color: var(--text-secondary);
  font-size: 12px;
}

strong {
  display: block;
  margin-top: 6px;
  color: var(--text-primary);
  font-size: clamp(20px, 1.8vw, 32px);
  font-variant-numeric: tabular-nums;
}

em {
  margin-left: 4px;
  color: var(--text-muted);
  font-size: 12px;
  font-style: normal;
}

.green strong {
  color: var(--success);
}

.red strong {
  color: var(--danger);
}

.orange strong {
  color: var(--warning);
}
</style>
