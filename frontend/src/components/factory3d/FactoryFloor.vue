<script setup>
import { markRaw, onBeforeUnmount, toRaw, watch } from 'vue'
import * as THREE from 'three'
import { createBox, createCylinder, createGlowRing, createPlane, disposeGroup } from './scenePrimitives'

const props = defineProps({
  scene: { type: Object, default: null },
  activeMode: { type: String, default: 'overview' },
})

let group

function createZone(name, x, z, width, depth, color) {
  const zone = createPlane(width, depth, color, [x, 0.016, z], { rotateX: -Math.PI / 2, opacity: 0.13 })
  zone.name = name
  return zone
}

function createFloor(scene) {
  group = markRaw(new THREE.Group())
  group.name = 'SmartFactoryFloor'

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(19, 11),
    new THREE.MeshStandardMaterial({ color: '#09172a', roughness: 0.94, metalness: 0.08 })
  )
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  group.add(floor)

  const grid = new THREE.GridHelper(19, 38, '#0ea5e9', '#18324d')
  grid.position.y = 0.022
  group.add(grid)

  group.add(createZone('加工区', -5.5, -3.0, 6.1, 2.6, '#0ea5e9'))
  group.add(createZone('注塑区', 3.2, -3.0, 6.6, 2.6, '#8b5cf6'))
  group.add(createZone('物流通道', 0, 0.35, 16.8, 1.2, '#facc15'))
  group.add(createZone('装配区', -1.5, 2.35, 7.0, 2.5, '#22c55e'))
  group.add(createZone('包装区', 4.8, 2.35, 4.6, 2.5, '#38bdf8'))
  group.add(createZone('仓储区', 7.2, 3.6, 2.4, 2.0, '#14b8a6'))
  group.add(createZone('安防区', -7.8, 2.8, 2.2, 3.4, '#ef4444'))
  group.add(createZone('动环区', 7.5, -2.2, 2.4, 3.6, '#f97316'))

  const safetyMaterial = new THREE.MeshBasicMaterial({ color: '#ffd166', transparent: true, opacity: 0.9 })
  ;[
    [0, 0.03, -0.35, 16.8, 0.055],
    [0, 0.03, 1.05, 16.8, 0.055],
    [-8.1, 0.035, 0.35, 0.055, 1.35],
    [8.1, 0.035, 0.35, 0.055, 1.35],
  ].forEach(([x, y, z, w, d]) => {
    const line = new THREE.Mesh(new THREE.BoxGeometry(w, 0.025, d), safetyMaterial)
    line.position.set(x, y, z)
    group.add(line)
  })

  group.add(createBox(19, 1.4, 0.16, '#12243a', [0, 0.7, -5.45], { edgeColor: '#2563eb' }))
  group.add(createBox(0.16, 1.4, 11, '#12243a', [-9.45, 0.7, 0], { edgeColor: '#2563eb' }))
  group.add(createBox(0.16, 1.4, 11, '#12243a', [9.45, 0.7, 0], { edgeColor: '#2563eb' }))

  for (let row = 0; row < 2; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      const rack = createBox(0.34, 1.05, 1.16, '#1e3a5f', [6.4 + col * 0.64, 0.55, 2.75 + row * 0.82], { edgeColor: '#38bdf8' })
      rack.userData.storageRack = true
      group.add(rack)
    }
  }

  ;[
    [7.7, -0.75],
    [8.25, -0.75],
    [7.7, -1.55],
    [8.25, -1.55],
  ].forEach(([x, z]) => {
    group.add(createBox(0.42, 1.05, 0.34, '#243b53', [x, 0.53, z], { edgeColor: '#60a5fa' }))
  })

  const gate = createBox(1.25, 1.55, 0.14, '#3b1220', [-8.55, 0.78, 1.85], { edgeColor: '#ff4d5e' })
  gate.userData.securityGate = true
  group.add(gate)

  const danger = createPlane(2.4, 1.45, '#ff4d5e', [-7.75, 0.055, 1.82], { rotateX: -Math.PI / 2, opacity: 0.18 })
  danger.userData.dangerZone = true
  group.add(danger)

  ;[[-8.0, 3.7], [7.6, -3.6], [5.6, -3.8], [-6.4, -4.1]].forEach(([x, z]) => {
    const pole = createCylinder(0.04, 0.04, 1.2, '#64748b', [x, 0.6, z])
    const lamp = createCylinder(0.13, 0.13, 0.16, '#ff4d5e', [x, 1.28, z], { emissive: '#ff4d5e', emissiveIntensity: 0.55 })
    lamp.userData.warningLight = true
    group.add(pole, lamp)
  })

  const plantPulse = createGlowRing(8.8, '#0ea5e9', 0.12)
  plantPulse.position.y = 0.04
  plantPulse.userData.plantPulse = true
  group.add(plantPulse)

  scene.add(group)
}

watch(() => props.scene, (scene) => {
  if (scene && !group) createFloor(scene)
}, { immediate: true })

onBeforeUnmount(() => disposeGroup(toRaw(props.scene), group))
</script>

<template></template>
