<script setup>
import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { statusMeta } from '../../stores/mesFactory'

const props = defineProps({
  equipment: { type: Array, default: () => [] },
  selectedId: { type: Number, default: null },
})

const emit = defineEmits(['select'])

const host = ref(null)
const labelPositions = reactive({})
const hoveredId = ref(null)
const objects = new Map()
let scene
let camera
let renderer
let controls
let raycaster
let pointer
let animationFrame
let resizeObserver

function makeMaterial(color, emissive = false) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.55,
    metalness: 0.16,
    emissive: emissive ? color : '#000000',
    emissiveIntensity: emissive ? 0.35 : 0,
  })
}

function box(width, height, depth, color, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), makeMaterial(color))
  mesh.position.set(x, y, z)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

function cylinder(radius, height, color, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 20), makeMaterial(color))
  mesh.rotation.z = Math.PI / 2
  mesh.position.set(x, y, z)
  mesh.castShadow = true
  return mesh
}

function createFloor() {
  const group = new THREE.Group()
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 9),
    new THREE.MeshStandardMaterial({ color: '#172033', roughness: 0.92, metalness: 0.08 })
  )
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  group.add(floor)

  const grid = new THREE.GridHelper(14, 28, '#5eead4', '#334155')
  grid.position.y = 0.018
  group.add(grid)

  const zones = [
    [-4.0, -2.6, 4.4, 2.0, '#38bdf8'],
    [2.7, -2.6, 5.2, 2.0, '#a78bfa'],
    [0, 0.8, 12.2, 1.2, '#facc15'],
    [2.0, 2.8, 8.8, 2.3, '#22c55e'],
  ]
  zones.forEach(([x, z, width, depth, color]) => {
    const zone = new THREE.Mesh(
      new THREE.PlaneGeometry(width, depth),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.16, side: THREE.DoubleSide })
    )
    zone.rotation.x = -Math.PI / 2
    zone.position.set(x, 0.012, z)
    group.add(zone)
  })

  group.add(box(14, 1.2, 0.16, '#243145', 0, 0.6, -4.55))
  group.add(box(0.16, 1.2, 9, '#243145', -7.05, 0.6, 0))
  scene.add(group)
}

function createMachine(item) {
  const group = new THREE.Group()
  group.position.set(...item.position)
  group.userData = { equipmentId: item.id, equipment: item, selectable: true }
  const statusColor = statusMeta[item.status]?.color || '#94a3b8'
  const statusMaterial = makeMaterial(statusColor, item.status === 'Fault')

  if (item.type === 'injection') {
    group.add(box(1.25, 0.55, 0.72, '#cbd5e1', -0.28, 0.28, 0))
    group.add(box(0.9, 0.42, 0.7, '#334155', 0.55, 0.32, 0))
    group.add(cylinder(0.16, 0.9, '#64748b', 0.12, 0.52, 0))
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.28, 0.08), statusMaterial)
    panel.position.set(-0.75, 0.7, 0.38)
    group.add(panel)
  } else if (item.type === 'robot') {
    group.add(cylinder(0.32, 0.34, '#475569', 0, 0.17, 0))
    const arm = box(0.25, 0.28, 1.25, '#cbd5e1', 0.08, 1.25, 0.48)
    arm.rotation.x = -0.38
    group.add(box(0.32, 0.95, 0.32, '#64748b', 0, 0.78, 0), arm, box(0.2, 0.22, 0.72, '#94a3b8', 0.08, 1.48, 1.1))
    const badge = new THREE.Mesh(new THREE.SphereGeometry(0.18, 20, 12), statusMaterial)
    badge.position.set(0, 1.8, 1.45)
    group.add(badge)
  } else {
    group.add(box(1.08, 0.74, 0.82, '#475569', 0, 0.37, 0))
    group.add(box(0.76, 0.38, 0.56, '#cbd5e1', -0.08, 0.92, 0))
    group.add(box(0.36, 0.28, 0.08, '#0f172a', 0.44, 0.95, 0.45))
    const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.16, 18), statusMaterial)
    beacon.position.set(-0.38, 1.24, 0.28)
    group.add(beacon)
  }

  addHalo(group, statusColor)
  scene.add(group)
  objects.set(item.id, group)
}

function createAgv(item) {
  const group = new THREE.Group()
  group.position.set(...item.position)
  group.userData = { equipmentId: item.id, equipment: item, selectable: true, kind: 'agv', baseX: item.position[0] }
  group.add(box(0.92, 0.26, 0.55, statusMeta[item.status]?.color || '#94a3b8', 0, 0.2, 0))
  group.add(box(0.58, 0.18, 0.36, '#e2e8f0', 0, 0.43, 0))
  addHalo(group, statusMeta[item.status]?.color || '#94a3b8')
  scene.add(group)
  objects.set(item.id, group)
}

function createConveyor(item) {
  const group = new THREE.Group()
  group.position.set(...item.position)
  group.userData = { equipmentId: item.id, equipment: item, selectable: true, kind: 'conveyor' }
  group.add(box(2.6, 0.12, 0.62, '#1e293b', 0, 0.42, 0))
  group.add(box(2.7, 0.16, 0.08, '#64748b', 0, 0.55, -0.42))
  group.add(box(2.7, 0.16, 0.08, '#64748b', 0, 0.55, 0.42))
  for (let i = -1; i <= 1; i += 1) {
    const pkg = box(0.32, 0.22, 0.28, '#f8fafc', i * 0.72, 0.62, 0)
    pkg.userData.packageOffset = i
    group.add(pkg)
  }
  addHalo(group, statusMeta[item.status]?.color || '#94a3b8')
  scene.add(group)
  objects.set(item.id, group)
}

function addHalo(group, color) {
  const halo = new THREE.Mesh(
    new THREE.RingGeometry(0.76, 0.92, 36),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.28, side: THREE.DoubleSide })
  )
  halo.rotation.x = -Math.PI / 2
  halo.position.y = 0.035
  halo.userData.isHalo = true
  group.add(halo)
}

function rebuildEquipment() {
  objects.forEach((object) => scene.remove(object))
  objects.clear()
  props.equipment.forEach((item) => {
    if (item.type === 'agv') createAgv(item)
    else if (item.type === 'conveyor') createConveyor(item)
    else createMachine(item)
  })
}

function resize() {
  if (!host.value || !camera || !renderer) return
  const { width, height } = host.value.getBoundingClientRect()
  camera.aspect = width / Math.max(height, 1)
  camera.updateProjectionMatrix()
  renderer.setSize(width, height, false)
}

function updateLabels() {
  if (!camera || !host.value) return
  const { width, height } = host.value.getBoundingClientRect()
  props.equipment.forEach((item) => {
    const object = objects.get(item.id)
    if (!object) return
    const vector = new THREE.Vector3()
    object.getWorldPosition(vector)
    vector.y += item.type === 'robot' ? 2.15 : 1.45
    vector.project(camera)
    labelPositions[item.id] = {
      x: (vector.x * 0.5 + 0.5) * width,
      y: (-vector.y * 0.5 + 0.5) * height,
      visible: vector.z > -1 && vector.z < 1,
    }
  })
}

function animate(time = 0) {
  animationFrame = requestAnimationFrame(animate)
  objects.forEach((object) => {
    if (object.userData.kind === 'agv' && object.userData.equipment?.status === 'Running') {
      object.position.x = object.userData.baseX + Math.sin(time * 0.0012) * 1.25
    }
    if (object.userData.kind === 'conveyor' && object.userData.equipment?.status === 'Running') {
      object.children.forEach((child) => {
        if (child.userData.packageOffset !== undefined) {
          child.position.x = ((child.userData.packageOffset + time * 0.0008 + 1.4) % 2.8) - 1.4
        }
      })
    }
    const active = object.userData.equipmentId === props.selectedId || object.userData.equipmentId === hoveredId.value
    object.scale.setScalar(active ? 1.08 : 1)
  })
  controls?.update()
  updateLabels()
  renderer?.render(scene, camera)
}

function pick(event, click = false) {
  const bounds = host.value.getBoundingClientRect()
  pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
  pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1
  raycaster.setFromCamera(pointer, camera)
  const hits = raycaster.intersectObjects([...objects.values()], true)
  let target = null
  for (const hit of hits) {
    let object = hit.object
    while (object) {
      if (object.userData?.selectable) {
        target = object
        break
      }
      object = object.parent
    }
    if (target) break
  }
  hoveredId.value = target?.userData.equipmentId || null
  if (click && target) emit('select', target.userData.equipmentId)
}

onMounted(() => {
  scene = new THREE.Scene()
  scene.background = new THREE.Color('#07111f')
  scene.fog = new THREE.Fog('#07111f', 10, 28)
  camera = new THREE.PerspectiveCamera(48, 1, 0.1, 80)
  camera.position.set(7.5, 6.2, 8.5)
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  host.value.appendChild(renderer.domElement)
  controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 0.4, 0)
  controls.enableDamping = true
  controls.minDistance = 5
  controls.maxDistance = 18
  scene.add(new THREE.AmbientLight('#e0f2fe', 0.72))
  const light = new THREE.DirectionalLight('#ffffff', 2.2)
  light.position.set(3, 8, 5)
  light.castShadow = true
  scene.add(light)
  raycaster = new THREE.Raycaster()
  pointer = new THREE.Vector2()
  createFloor()
  rebuildEquipment()
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(host.value)
  resize()
  animate()
})

watch(() => props.equipment, rebuildEquipment, { deep: true })

onBeforeUnmount(() => {
  if (animationFrame) cancelAnimationFrame(animationFrame)
  resizeObserver?.disconnect()
  controls?.dispose()
  renderer?.dispose()
})
</script>

<template>
  <div ref="host" class="factory-scene" @mousemove="pick" @mouseleave="hoveredId = null" @click="pick($event, true)">
    <div class="label-layer">
      <button
        v-for="item in equipment"
        :key="item.id"
        class="equipment-label"
        :class="{ active: selectedId === item.id || hoveredId === item.id }"
        :style="{
          transform: `translate(${labelPositions[item.id]?.x || 0}px, ${labelPositions[item.id]?.y || 0}px) translate(-50%, -100%)`,
          opacity: labelPositions[item.id]?.visible ? 1 : 0,
          borderColor: selectedId === item.id || hoveredId === item.id ? statusMeta[item.status]?.color : 'rgba(148, 163, 184, 0.45)'
        }"
        @click.stop="emit('select', item.id)"
      >
        <span :style="{ background: statusMeta[item.status]?.color }"></span>{{ item.name }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.factory-scene {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 520px;
  overflow: hidden;
  background: #07111f;
}

.factory-scene :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}

.label-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.equipment-label {
  position: absolute;
  left: 0;
  top: 0;
  max-width: 172px;
  padding: 6px 9px;
  border: 1px solid rgba(148, 163, 184, 0.45);
  border-radius: 7px;
  background: rgba(15, 23, 42, 0.82);
  color: #e5eefb;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  line-height: 1.25;
  pointer-events: auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.equipment-label span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex: 0 0 auto;
}
</style>
