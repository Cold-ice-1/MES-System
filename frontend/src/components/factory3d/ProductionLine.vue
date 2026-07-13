<script setup>
import { markRaw, onBeforeUnmount, toRaw, watch } from 'vue'
import * as THREE from 'three'
import { createBox, createCylinder, createMaterial, disposeGroup } from './scenePrimitives'
import { statusMeta } from '../../data/factoryMock'

const props = defineProps({
  scene: { type: Object, default: null },
  line: { type: Object, required: true },
  activeMode: { type: String, default: 'overview' },
})

const emit = defineEmits(['object-ready'])
let group

function createSegment(from, to, index) {
  const start = new THREE.Vector3(...from)
  const end = new THREE.Vector3(...to)
  const mid = start.clone().lerp(end, 0.5)
  const length = start.distanceTo(end)
  const angle = Math.atan2(end.x - start.x, end.z - start.z)

  const segment = markRaw(new THREE.Group())
  segment.position.copy(mid)
  segment.rotation.y = angle
  segment.add(createBox(0.62, 0.12, length, '#15253c', [0, 0.36, 0], { edgeColor: '#38bdf8' }))
  segment.add(createBox(0.08, 0.16, length + 0.12, '#4b647d', [-0.42, 0.52, 0], { edges: false }))
  segment.add(createBox(0.08, 0.16, length + 0.12, '#4b647d', [0.42, 0.52, 0], { edges: false }))
  for (let i = -1; i <= 1; i += 1) {
    const roller = createCylinder(0.08, 0.08, 0.76, '#8aa4bf', [0, 0.44, i * length * 0.28], { rotateZ: Math.PI / 2, segments: 18 })
    segment.add(roller)
  }
  segment.userData.segmentIndex = index
  return segment
}

function createLine(scene) {
  group = markRaw(new THREE.Group())
  group.name = props.line.name
  group.userData = {
    id: props.line.id,
    kind: 'productionLine',
    routePoints: props.line.points,
    status: props.line.status,
  }

  for (let index = 0; index < props.line.points.length - 1; index += 1) {
    group.add(createSegment(props.line.points[index], props.line.points[index + 1], index))
  }

  const flowColor = statusMeta[props.line.status]?.color || '#38bdf8'
  for (let index = 0; index < 6; index += 1) {
    const product = createBox(0.34, 0.24, 0.26, index % 2 ? '#dbeafe' : '#fef3c7', [0, 0.78, 0], { edgeColor: '#ffffff' })
    product.userData.flowProduct = true
    product.userData.flowOffset = index / 6
    group.add(product)
  }

  const curvePoints = props.line.points.map((point) => new THREE.Vector3(...point))
  const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints)
  const flowLine = new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({ color: flowColor, transparent: true, opacity: 0.78 })
  )
  flowLine.position.y = 0.25
  flowLine.userData.dataFlow = true
  group.add(flowLine)

  scene.add(group)
  emit('object-ready', { id: props.line.id, group, kind: 'productionLine' })
}

watch(() => props.scene, (scene) => {
  if (scene && !group) createLine(scene)
}, { immediate: true })

watch(() => props.line.status, () => {
  if (!group) return
  group.traverse((child) => {
    if (child.userData.dataFlow && child.material) {
      child.material.color.set(statusMeta[props.line.status]?.color || '#38bdf8')
    }
  })
})

onBeforeUnmount(() => disposeGroup(toRaw(props.scene), group))
</script>

<template></template>
