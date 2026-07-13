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
  makeSelectable(group, props.device, 'cnc')

  group.add(createBox(1.35, 0.28, 1.0, '#0f2a43', [0, 0.14, 0], { edgeColor: '#38bdf8' }))
  group.add(createBox(1.15, 0.9, 0.86, '#1f3d5a', [-0.08, 0.72, 0], { edgeColor: '#7dd3fc' }))
  group.add(createBox(0.56, 0.58, 0.08, '#dbeafe', [-0.34, 0.78, 0.46], { edgeColor: '#e0f2fe' }))
  group.add(createBox(0.3, 0.52, 0.1, '#0b1220', [0.42, 0.78, 0.48], { edgeColor: color }))
  group.add(createBox(0.22, 0.18, 0.06, '#08111f', [0.42, 0.95, 0.54], { emissive: '#00d4ff', emissiveIntensity: 0.35 }))
  for (let index = 0; index < 5; index += 1) {
    group.add(createBox(0.04, 0.28, 0.035, '#07111f', [0.58, 0.6 + index * 0.055, -0.47], { edges: false }))
  }
  group.add(createBox(0.5, 0.08, 0.09, '#0ea5e9', [-0.34, 1.12, 0.48], { emissive: '#0ea5e9', emissiveIntensity: 0.2, edgeColor: '#7dd3fc' }))
  group.add(createCylinder(0.11, 0.11, 0.48, '#cbd5e1', [-0.05, 0.98, 0.18], { rotateX: Math.PI / 2 }))
  group.add(createBox(0.38, 0.18, 0.3, '#64748b', [-0.05, 0.7, 0.14], { edgeColor: '#cbd5e1' }))

  statusLight = createStatusLight(color, [-0.48, 1.28, 0.32], 0.12)
  halo = createGlowRing(0.9, color, props.device.status === 'fault' ? 0.48 : 0.26)
  halo.position.y = 0.04
  group.add(statusLight, halo)

  scene.add(group)
  emit('object-ready', { id: props.device.id, group, kind: 'cnc' })
}

function sync() {
  if (!group) return
  const color = statusMeta[props.device.status]?.color || '#8b9bb4'
  group.userData.device = props.device
  statusLight?.material.color.set(color)
  statusLight?.material.emissive.set(color)
  halo?.material.color.set(color)
  halo.material.opacity = props.device.status === 'fault' ? 0.56 : 0.26
  setGroupEmphasis(group, props.selected, props.device.status === 'fault')
}

watch(() => props.scene, (scene) => {
  if (scene && !group) build(scene)
}, { immediate: true })

watch(() => [props.device.status, props.selected], sync)

onBeforeUnmount(() => disposeGroup(toRaw(props.scene), group))
</script>

<template></template>
