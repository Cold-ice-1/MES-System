<script setup>
import { computed } from 'vue'
import { statusMeta } from '../../data/factoryMock'

const props = defineProps({
  device: { type: Object, required: true },
  position: { type: Object, default: null },
  active: { type: Boolean, default: false },
})

const emit = defineEmits(['select'])

const labelStyle = computed(() => ({
  transform: `translate3d(${props.position?.x || 0}px, ${props.position?.y || 0}px, 0) translate(-50%, -100%)`,
  opacity: props.position?.visible ? 1 : 0,
  borderColor: props.active ? statusMeta[props.device.status]?.color : 'var(--panel-border)',
}))
</script>

<template>
  <button class="floating-label" :class="{ active }" :style="labelStyle" @click.stop="emit('select', device.id)">
    <span class="status-dot" :style="{ background: statusMeta[device.status]?.color }"></span>
    <strong>{{ device.name }}</strong>
    <em>{{ device.zone }}</em>
  </button>
</template>

<style scoped>
.floating-label {
  position: absolute;
  left: 0;
  top: 0;
  max-width: 190px;
  padding: 7px 10px;
  border: 1px solid var(--panel-border);
  border-radius: 6px;
  background: var(--panel-bg);
  color: var(--text-primary);
  cursor: pointer;
  display: grid;
  grid-template-columns: 8px minmax(0, 1fr);
  column-gap: 7px;
  row-gap: 2px;
  align-items: center;
  pointer-events: auto;
  box-shadow: var(--shadow-soft);
  will-change: transform;
}

.floating-label.active {
  box-shadow: 0 0 16px rgba(38, 245, 166, 0.28);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  grid-row: span 2;
  box-shadow: 0 0 12px currentColor;
}

strong,
em {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

strong {
  font-size: 12px;
  font-weight: 600;
}

em {
  color: var(--accent-blue);
  font-size: 10px;
  font-style: normal;
}
</style>
