<script setup>
import BaseFactoryScene from '../../../components/factory3d/FactoryScene.vue'

defineProps({
  devices: { type: Array, default: () => [] },
  productionLines: { type: Array, default: () => [] },
  agvRoutes: { type: Array, default: () => [] },
  environmentSensors: { type: Array, default: () => [] },
  selectedId: { type: String, default: '' },
  activeMode: { type: String, default: 'overview' },
})

const emit = defineEmits(['select'])
</script>

<template>
  <BaseFactoryScene
    :devices="devices"
    :production-lines="productionLines"
    :agv-routes="agvRoutes"
    :environment-sensors="environmentSensors"
    :selected-id="selectedId"
    :active-mode="activeMode"
    @select="emit('select', $event)"
  />
</template>
