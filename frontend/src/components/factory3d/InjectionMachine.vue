<script setup>
import { markRaw, onBeforeUnmount, toRaw, watch } from 'vue'
import * as THREE from 'three'
import { createBox, createCylinder, createGlowRing, createStatusLight, disposeGroup, makeSelectable, setGroupEmphasis } from './scenePrimitives'
import { statusMeta } from '../../data/factoryMock'

const props = defineProps({
  scene: { type: Object, default: null },
  device: { type: Object, required: true },
  selected: { type: Boolean, default: false },
})

const emit = defineEmits(['object-ready'])
let group
let statusLight
let halo

function build(scene) {
  const color = statusMeta[props.device.status]?.color || '#8b9bb4'
  group = markRaw(new THREE.Group())
  group.position.set(...props.device.position)
  makeSelectable(group, props.device, 'injection')

  group.add(createBox(1.55, 0.34, 0.92, '#17324f', [-0.22, 0.17, 0], { edgeColor: '#38bdf8' }))
  group.add(createBox(0.82, 0.62, 0.88, '#d7e4ef', [-0.58, 0.58, 0], { edgeColor: '#e0f2fe' }))
  group.add(createBox(0.98, 0.48, 0.84, '#334155', [0.38, 0.52, 0], { edgeColor: '#60a5fa' }))
  group.add(createCylinder(0.17, 0.17, 1.18, '#94a3b8', [-0.1, 0.82, 0], { rotateZ: Math.PI / 2 }))
  group.add(createCylinder(0.22, 0.22, 0.38, '#64748b', [0.62, 0.82, 0], { rotateZ: Math.PI / 2 }))
  group.add(createCylinder(0.26, 0.1, 0.42, '#cbd5e1', [0.12, 1.18, -0.28], { segments: 4 }))
  group.add(createCylinder(0.035, 0.035, 1.28, '#7dd3fc', [-0.1, 1.05, -0.48], { rotateZ: Math.PI / 2, emissive: '#0ea5e9', emissiveIntensity: 0.18 }))
  group.add(createBox(0.48, 0.36, 0.14, '#172033', [0.94, 0.64, -0.42], { edgeColor: color }))
  group.add(createBox(0.28, 0.42, 0.08, '#07111f', [-0.95, 0.78, 0.5], { edgeColor: color, emissive: '#0ea5e9', emissiveIntensity: 0.22 }))
  group.add(createBox(0.32, 0.16, 0.22, '#fbbf24', [0.88, 0.23, 0.42], { edgeColor: '#fde68a' }))

  statusLight = createStatusLight(color, [-0.76, 1.13, 0.34], 0.12)
  halo = createGlowRing(1.05, color, props.device.status === 'fault' ? 0.58 : 0.24)
  halo.position.y = 0.04
  group.add(statusLight, halo)
  scene.add(group)
  emit('object-ready', { id: props.device.id, group, kind: 'injection' })
}

function sync() {
  if (!group) return
  const color = statusMeta[props.device.status]?.color || '#8b9bb4'
  group.userData.device = props.device
  statusLight?.material.color.set(color)
  statusLight?.material.emissive.set(color)
  halo?.material.color.set(color)
  halo.material.opacity = props.device.status === 'fault' ? 0.58 : 0.24
  setGroupEmphasis(group, props.selected, props.device.status === 'fault')
}

watch(() => props.scene, (scene) => {
  if (scene && !group) build(scene)
}, { immediate: true })

watch(() => [props.device.status, props.selected], sync)

onBeforeUnmount(() => disposeGroup(toRaw(props.scene), group))
</script>

<template></template>
