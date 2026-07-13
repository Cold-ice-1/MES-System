<script setup>
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import FloatingLabel from './FloatingLabel.vue'
import { FactorySceneManager } from './core/FactorySceneManager'
import { useTheme } from '../../composables/useTheme'

const props = defineProps({
  devices: { type: Array, default: () => [] },
  productionLines: { type: Array, default: () => [] },
  agvRoutes: { type: Array, default: () => [] },
  environmentSensors: { type: Array, default: () => [] },
  selectedId: { type: String, default: '' },
  activeMode: { type: String, default: 'overview' },
})

const emit = defineEmits(['select'])

const host = ref(null)
const labels = shallowRef([])
const hoveredId = ref('')
const { theme } = useTheme()
let manager

function buildScene() {
  manager?.dispose()
  manager = new FactorySceneManager(host.value, {
    theme: theme.value,
    onSelect: (id) => emit('select', id),
    onHover: (id) => {
      hoveredId.value = id
    },
    onLabels: (items) => {
      labels.value = items
    },
  })
  manager.init()
  manager.setActiveMode(props.activeMode)
  manager.setSelected(props.selectedId)
  manager.build({
    devices: props.devices,
    productionLines: props.productionLines,
    agvRoutes: props.agvRoutes,
    environmentSensors: props.environmentSensors,
  })
}

onMounted(() => {
  buildScene()
})

watch(() => props.selectedId, (id) => {
  manager?.setSelected(id)
})

watch(() => props.activeMode, (mode) => {
  manager?.setActiveMode(mode)
})

watch(theme, (value) => {
  manager?.setTheme(value)
})

watch(() => props.devices, (devices) => {
  manager?.updateDevices(devices)
})

onBeforeUnmount(() => {
  manager?.dispose()
  manager = null
})
</script>

<template>
  <div ref="host" class="factory-scene">
    <div class="label-layer">
      <FloatingLabel
        v-for="item in labels"
        :key="item.id"
        :device="item.device"
        :position="{ x: item.x, y: item.y, visible: true }"
        :active="item.active || item.id === hoveredId"
        @select="emit('select', $event)"
      />
    </div>
    <div class="scene-caption">
      <span>OrbitControls</span>
      <strong>{{ activeMode.toUpperCase() }}</strong>
    </div>
  </div>
</template>

<style scoped>
.factory-scene {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 42%, rgba(14, 165, 233, 0.06), transparent 38%),
    linear-gradient(180deg, var(--scene-bg-top), var(--scene-bg-bottom));
}

.factory-scene::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background:
    linear-gradient(90deg, var(--scene-overlay-line) 1px, transparent 1px),
    linear-gradient(var(--scene-overlay-line) 1px, transparent 1px);
  background-size: 120px 120px;
  mask-image: radial-gradient(circle at 50% 50%, transparent 0, transparent 44%, black 82%);
}

.factory-scene :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}

.label-layer {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
}

.scene-caption {
  position: absolute;
  left: 18px;
  bottom: 16px;
  z-index: 4;
  display: flex;
  gap: 10px;
  align-items: center;
  height: 28px;
  padding: 0 10px;
  border: 1px solid var(--panel-border);
  background: var(--panel-bg);
  color: var(--accent-blue);
  font-size: 11px;
  pointer-events: none;
}

.scene-caption strong {
  color: var(--text-primary);
}
</style>
