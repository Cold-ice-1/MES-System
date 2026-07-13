<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  unit: { type: String, default: '' },
  tone: { type: String, default: 'cyan' },
})
</script>

<template>
  <div class="kpi-card" :class="tone">
    <span>{{ label }}</span>
    <strong>{{ value }}<em>{{ unit }}</em></strong>
  </div>
</template>

<style scoped>
.kpi-card {
  position: relative;
  min-height: 62px;
  padding: 10px 12px;
  border: 1px solid rgba(64, 214, 255, 0.25);
  background: linear-gradient(135deg, rgba(8, 29, 56, 0.74), rgba(5, 14, 30, 0.5));
  box-shadow: inset 0 0 22px rgba(0, 194, 255, 0.08);
  overflow: hidden;
}

.kpi-card::after {
  content: '';
  position: absolute;
  left: -50%;
  top: 0;
  width: 36%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transform: skewX(-20deg);
  animation: scan 4s infinite;
}

.kpi-card span {
  color: #8fc8e8;
  font-size: 12px;
}

.kpi-card strong {
  display: block;
  margin-top: 4px;
  color: #eefdff;
  font-size: 24px;
  font-family: Arial, sans-serif;
}

.kpi-card em {
  margin-left: 3px;
  color: #7dd3fc;
  font-size: 12px;
  font-style: normal;
}

.green strong {
  color: #26f5a6;
}

.orange strong {
  color: #ffb020;
}

.red strong {
  color: #ff4d5e;
}

@keyframes scan {
  0% { left: -50%; }
  38%, 100% { left: 120%; }
}
</style>
