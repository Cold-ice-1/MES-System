<script setup>
import { markRaw, onBeforeUnmount, toRaw, watch } from 'vue'
import * as THREE from 'three'
import { createBox, createCylinder, createGlowRing, createStatusLight, disposeGroup, makeSelectable, setGroupEmphasis } from './scenePrimitives'
import { statusMeta } from '../../data/factoryMock'

const props = defineProps({
  scene: { type: Object, default: null },
  device: { type: Object, required: true },
  sensor: { type: Object, default: null },
  selected: { type: Boolean, default: false },
  activeMode: { type: String, default: 'overview' },
})

const emit = defineEmits(['object-ready'])
let group
let statusLight

function build(scene) {
  const color = statusMeta[props.device.status]?.color || '#8b9bb4'
  group = markRaw(new THREE.Group())
  group.position.set(...props.device.position)
  makeSelectable(group, props.device, props.device.type === 'cabinet' ? 'cabinet' : 'sensor')

  if (props.device.type === 'cabinet') {
    group.add(createBox(0.52, 1.15, 0.42, '#21364f', [0, 0.58, 0], { edgeColor: '#60a5fa' }))
    group.add(createBox(0.34, 0.18, 0.04, '#07111f', [0, 0.92, 0.23], { emissive: '#00d4ff', emissiveIntensity: 0.32 }))
    group.add(createBox(0.28, 0.36, 0.04, '#0f172a', [0, 0.48, 0.23], { edgeColor: color }))
  } else {
    group.add(createCylinder(0.16, 0.2, 0.68, '#dbeafe', [0, 0.42, 0], { segments: 24 }))
    group.add(createBox(0.42, 0.18, 0.12, '#0f172a', [0, 0.78, 0], { edgeColor: '#38bdf8' }))
  }

  statusLight = createStatusLight(color, [0.16, 1.05, 0.16], 0.08)
  const ringA = createGlowRing(0.62, color, 0.22)
  ringA.position.y = 0.04
  ringA.userData.sensorRipple = true
  const ringB = createGlowRing(0.92, color, 0.1)
  ringB.position.y = 0.045
  ringB.userData.sensorRipple = true
  ringB.userData.rippleDelay = 0.48
  group.add(statusLight, ringA, ringB)
  scene.add(group)
  emit('object-ready', { id: props.device.id, group, kind: props.device.type })
}

function sync() {
  if (!group) return
  const color = statusMeta[props.device.status]?.color || '#8b9bb4'
  group.userData.device = props.device
  group.userData.sensor = props.sensor
  statusLight?.material.color.set(color)
  statusLight?.material.emissive.set(color)
  setGroupEmphasis(group, props.selected || props.activeMode === 'environment', props.device.status === 'fault')
}

watch(() => props.scene, (scene) => {
  if (scene && !group) build(scene)
}, { immediate: true })

watch(() => [props.device.status, props.selected, props.activeMode, props.sensor], sync, { deep: true })

onBeforeUnmount(() => disposeGroup(toRaw(props.scene), group))
</script>

<template></template>
