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
let shoulder
let wrist
let statusLight
let halo

function build(scene) {
  const color = statusMeta[props.device.status]?.color || '#8b9bb4'
  group = markRaw(new THREE.Group())
  group.position.set(...props.device.position)
  makeSelectable(group, props.device, 'robot')

  group.add(createCylinder(0.38, 0.45, 0.28, '#334155', [0, 0.14, 0], { segments: 32 }))
  shoulder = markRaw(new THREE.Group())
  shoulder.position.set(0, 0.35, 0)
  shoulder.add(createCylinder(0.2, 0.2, 0.38, '#94a3b8', [0, 0.18, 0], { segments: 24 }))
  const armA = createBox(0.24, 0.22, 1.18, '#dbeafe', [0, 0.58, 0.45], { edgeColor: '#e0f2fe' })
  armA.rotation.x = -0.42
  shoulder.add(armA)
  wrist = markRaw(new THREE.Group())
  wrist.position.set(0, 1.0, 0.95)
  const armB = createBox(0.2, 0.18, 0.84, '#8aa4bf', [0, 0.14, 0.32], { edgeColor: '#cbd5e1' })
  armB.rotation.x = 0.5
  wrist.add(armB)
  wrist.add(createBox(0.42, 0.06, 0.08, '#f8fafc', [0, 0.26, 0.76], { edges: false }))
  shoulder.add(wrist)
  group.add(shoulder)

  statusLight = createStatusLight(color, [0.32, 1.62, 1.22], 0.13)
  halo = createGlowRing(0.88, color, 0.24)
  halo.position.y = 0.04
  group.add(statusLight, halo)
  scene.add(group)
  emit('object-ready', { id: props.device.id, group, kind: 'robot', joints: { shoulder, wrist } })
}

function sync() {
  if (!group) return
  const color = statusMeta[props.device.status]?.color || '#8b9bb4'
  group.userData.device = props.device
  group.userData.joints = { shoulder, wrist }
  statusLight?.material.color.set(color)
  statusLight?.material.emissive.set(color)
  halo?.material.color.set(color)
  setGroupEmphasis(group, props.selected, props.device.status === 'fault')
}

watch(() => props.scene, (scene) => {
  if (scene && !group) build(scene)
}, { immediate: true })

watch(() => [props.device.status, props.selected], sync)

onBeforeUnmount(() => disposeGroup(toRaw(props.scene), group))
</script>

<template></template>
