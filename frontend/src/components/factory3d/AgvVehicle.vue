<script setup>
import { markRaw, onBeforeUnmount, toRaw, watch } from 'vue'
import * as THREE from 'three'
import { createBox, createCylinder, createGlowRing, createStatusLight, disposeGroup, makeSelectable, setGroupEmphasis } from './scenePrimitives'
import { statusMeta } from '../../data/factoryMock'

const props = defineProps({
  scene: { type: Object, default: null },
  device: { type: Object, required: true },
  route: { type: Object, default: null },
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
  makeSelectable(group, props.device, 'agv')
  group.userData.routePoints = props.route?.points || [props.device.position]
  group.userData.routeOffset = props.device.id.endsWith('02') ? 0.42 : 0

  group.add(createBox(0.9, 0.24, 0.56, color, [0, 0.2, 0], { edgeColor: '#e0f2fe' }))
  group.add(createBox(0.56, 0.18, 0.34, '#dbeafe', [0.02, 0.42, 0], { edgeColor: '#ffffff' }))
  group.add(createBox(0.46, 0.2, 0.4, '#f8fafc', [-0.08, 0.66, 0], { edgeColor: '#facc15' }))
  group.add(createBox(0.28, 0.08, 0.2, '#07111f', [0.3, 0.56, 0], { emissive: '#00d4ff', emissiveIntensity: 0.42 }))
  ;[-0.32, 0.32].forEach((x) => {
    ;[-0.24, 0.24].forEach((z) => {
      group.add(createCylinder(0.09, 0.09, 0.08, '#0f172a', [x, 0.08, z], { rotateX: Math.PI / 2, segments: 16 }))
    })
  })
  statusLight = createStatusLight(color, [-0.34, 0.58, 0.22], 0.08)
  halo = createGlowRing(0.72, color, 0.22)
  halo.position.y = 0.04
  group.add(statusLight, halo)

  scene.add(group)
  emit('object-ready', { id: props.device.id, group, kind: 'agv' })
}

function sync() {
  if (!group) return
  const color = statusMeta[props.device.status]?.color || '#8b9bb4'
  group.userData.device = props.device
  group.userData.routePoints = props.route?.points || [props.device.position]
  statusLight?.material.color.set(color)
  statusLight?.material.emissive.set(color)
  halo?.material.color.set(color)
  setGroupEmphasis(group, props.selected, props.device.status === 'fault')
}

watch(() => props.scene, (scene) => {
  if (scene && !group) build(scene)
}, { immediate: true })

watch(() => [props.device.status, props.selected, props.route], sync, { deep: true })

onBeforeUnmount(() => disposeGroup(toRaw(props.scene), group))
</script>

<template></template>
