<script setup>
import { markRaw, onBeforeUnmount, toRaw, watch } from 'vue'
import * as THREE from 'three'
import { createBox, createCylinder, createGlowRing, createStatusLight, disposeGroup, makeSelectable, setGroupEmphasis } from './scenePrimitives'
import { statusMeta } from '../../data/factoryMock'

const props = defineProps({
  scene: { type: Object, default: null },
  device: { type: Object, required: true },
  selected: { type: Boolean, default: false },
  activeMode: { type: String, default: 'overview' },
})

const emit = defineEmits(['object-ready'])
let group
let head
let statusLight

function build(scene) {
  const color = statusMeta[props.device.status]?.color || '#8b9bb4'
  group = markRaw(new THREE.Group())
  group.position.set(...props.device.position)
  makeSelectable(group, props.device, 'camera')

  group.add(createCylinder(0.05, 0.05, 1.18, '#64748b', [0, 0.62, 0], { segments: 16 }))
  group.add(createBox(0.46, 0.12, 0.12, '#8aa4bf', [0.18, 1.18, 0], { edges: false }))
  head = markRaw(new THREE.Group())
  head.position.set(0.48, 1.18, 0)
  head.add(createBox(0.42, 0.24, 0.26, '#dbeafe', [0, 0, 0], { edgeColor: '#38bdf8' }))
  head.add(createCylinder(0.11, 0.11, 0.1, '#07111f', [0.26, 0, 0], { rotateZ: Math.PI / 2, emissive: '#0ea5e9', emissiveIntensity: 0.28 }))
  group.add(head)
  statusLight = createStatusLight(color, [-0.05, 1.28, 0.12], 0.07)
  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(0.75, 2.1, 28, 1, true),
    new THREE.MeshBasicMaterial({ color: '#38bdf8', transparent: true, opacity: 0.12, side: THREE.DoubleSide })
  )
  cone.position.set(1.15, 0.7, 0)
  cone.rotation.z = -Math.PI / 2
  cone.userData.scanCone = true
  group.add(statusLight, cone)

  scene.add(group)
  emit('object-ready', { id: props.device.id, group, kind: 'camera', joints: { head } })
}

function sync() {
  if (!group) return
  const color = statusMeta[props.device.status]?.color || '#8b9bb4'
  group.userData.device = props.device
  group.userData.joints = { head }
  statusLight?.material.color.set(color)
  statusLight?.material.emissive.set(color)
  setGroupEmphasis(group, props.selected || props.activeMode === 'security', props.device.status === 'fault')
}

watch(() => props.scene, (scene) => {
  if (scene && !group) build(scene)
}, { immediate: true })

watch(() => [props.device.status, props.selected, props.activeMode], sync)

onBeforeUnmount(() => disposeGroup(toRaw(props.scene), group))
</script>

<template></template>
