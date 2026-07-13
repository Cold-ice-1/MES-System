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
  makeSelectable(group, props.device, 'conveyor')

  group.add(createBox(2.3, 0.12, 0.68, '#111c2e', [0, 0.45, 0], { edgeColor: '#38bdf8' }))
  group.add(createBox(2.44, 0.16, 0.08, '#5b7188', [0, 0.58, -0.44], { edges: false }))
  group.add(createBox(2.44, 0.16, 0.08, '#5b7188', [0, 0.58, 0.44], { edges: false }))
  for (let index = -2; index <= 2; index += 1) {
    group.add(createCylinder(0.055, 0.055, 0.76, '#8aa4bf', [index * 0.48, 0.53, 0], { rotateZ: Math.PI / 2, segments: 18 }))
  }
  group.add(createBox(0.12, 0.44, 0.1, '#64748b', [-0.9, 0.22, -0.38], { edges: false }))
  group.add(createBox(0.12, 0.44, 0.1, '#64748b', [0.9, 0.22, 0.38], { edges: false }))

  for (let index = 0; index < 5; index += 1) {
    const item = createBox(0.28, 0.22, 0.28, index % 2 ? '#fef3c7' : '#dbeafe', [-1 + index * 0.5, 0.66, 0], { edgeColor: '#ffffff' })
    item.userData.packageOnBelt = true
    item.userData.flowOffset = index / 5
    group.add(item)
  }

  statusLight = createStatusLight(color, [1.08, 0.82, 0.34], 0.1)
  halo = createGlowRing(1.2, color, 0.22)
  halo.position.y = 0.04
  group.add(statusLight, halo)
  scene.add(group)
  emit('object-ready', { id: props.device.id, group, kind: 'conveyor' })
}

function sync() {
  if (!group) return
  const color = statusMeta[props.device.status]?.color || '#8b9bb4'
  group.userData.device = props.device
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
