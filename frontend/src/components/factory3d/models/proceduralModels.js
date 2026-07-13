import { markRaw } from 'vue'
import * as THREE from 'three'
import { basicMaterial, palette, standardMaterial, statusColor } from '../core/materials'
import { resolveModelType } from './modelRegistry'

const geometries = {
  box: new THREE.BoxGeometry(1, 1, 1),
  cyl12: new THREE.CylinderGeometry(1, 1, 1, 12),
  cyl16: new THREE.CylinderGeometry(1, 1, 1, 16),
  sphere12: new THREE.SphereGeometry(1, 12, 8),
  ring: new THREE.RingGeometry(0.78, 1, 36),
  cone12: new THREE.ConeGeometry(1, 1, 12),
}

function mesh(geometry, material, position = [0, 0, 0], scale = [1, 1, 1], options = {}) {
  const item = new THREE.Mesh(geometry, material)
  item.position.set(...position)
  item.scale.set(...scale)
  item.castShadow = options.castShadow ?? false
  item.receiveShadow = options.receiveShadow ?? false
  if (options.rotation) item.rotation.set(...options.rotation)
  if (options.name) item.name = options.name
  return item
}

function box(width, height, depth, color, position, options = {}) {
  return mesh(
    geometries.box,
    standardMaterial(color, options),
    position,
    [width, height, depth],
    options
  )
}

function panel(width, height, depth, color, position, options = {}) {
  return box(width, height, depth, color, position, {
    metalness: 0.12,
    roughness: 0.38,
    ...options,
  })
}

function cylinder(radius, height, color, position, options = {}) {
  return mesh(
    options.segments === 12 ? geometries.cyl12 : geometries.cyl16,
    standardMaterial(color, options),
    position,
    [radius, height, radius],
    options
  )
}

function statusLamp(color, position, radius = 0.1) {
  const lamp = mesh(
    geometries.sphere12,
    standardMaterial(color, { emissive: color, emissiveIntensity: 0.9, roughness: 0.26, metalness: 0.05 }),
    position,
    [radius, radius, radius]
  )
  lamp.userData.anim = 'statusLight'
  return lamp
}

function namePlate(textColor = palette.cyan) {
  return panel(0.42, 0.1, 0.025, '#07111f', [0, 0, 0], {
    emissive: textColor,
    emissiveIntensity: 0.12,
    roughness: 0.32,
    metalness: 0.08,
  })
}

function glowRing(color, radius = 0.9, opacity = 0.18) {
  const ring = new THREE.Mesh(
    geometries.ring,
    basicMaterial(color, { opacity, depthWrite: false })
  )
  ring.rotation.x = -Math.PI / 2
  ring.scale.setScalar(radius)
  ring.userData.anim = 'glowRing'
  return ring
}

function edge(meshObject, color = '#7dd3fc', opacity = 0.22) {
  const line = new THREE.LineSegments(
    new THREE.EdgesGeometry(meshObject.geometry),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity })
  )
  meshObject.add(line)
  return meshObject
}

function makeDeviceGroup(device, kind) {
  const group = markRaw(new THREE.Group())
  group.position.set(...device.position)
  group.name = device.name
  group.userData = {
    id: device.id,
    kind,
    device,
    selectable: true,
    animatedParts: [],
    statusParts: [],
    selectableMeshes: [],
    labelOffset: 1.5,
  }
  return group
}

function finalizeDevice(group, device, options = {}) {
  const color = statusColor(device.status)
  const lamp = statusLamp(color, options.lampPosition ?? [0.42, 1.18, 0.38], options.lampRadius ?? 0.1)
  const ring = glowRing(color, options.ringRadius ?? 0.9, device.status === 'fault' ? 0.32 : 0.16)
  ring.position.y = 0.035
  group.add(lamp, ring)
  group.userData.statusParts.push(lamp, ring)
  group.userData.labelOffset = options.labelOffset ?? group.userData.labelOffset
  group.traverse((child) => {
    if (child.isMesh) {
      child.userData.deviceId = device.id
      child.userData.selectable = true
      group.userData.selectableMeshes.push(child)
    }
  })
  return group
}

function decorateImported(device, importedRoot, kind) {
  const group = makeDeviceGroup(device, kind)
  importedRoot.position.set(0, 0, 0)
  group.add(importedRoot)
  return finalizeDevice(group, device, { labelOffset: 1.8, ringRadius: 1.1 })
}

export function samplePath(points, progress) {
  if (!points?.length) return new THREE.Vector3()
  if (points.length === 1) return new THREE.Vector3(...points[0])
  const wrapped = ((progress % 1) + 1) % 1
  const scaled = wrapped * points.length
  const index = Math.floor(scaled) % points.length
  const nextIndex = (index + 1) % points.length
  const t = scaled - Math.floor(scaled)
  return new THREE.Vector3(...points[index]).lerp(new THREE.Vector3(...points[nextIndex]), t)
}

export function createFactoryFloor() {
  const group = markRaw(new THREE.Group())
  group.name = 'FactoryFloorOptimized'

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 12),
    standardMaterial(palette.floor, { roughness: 0.92, metalness: 0.06 })
  )
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  group.add(floor)

  const grid = new THREE.GridHelper(20, 24, '#1f5f7a', '#14273b')
  grid.position.y = 0.018
  group.add(grid)

  const zoneMaterial = {
    machining: basicMaterial('#0ea5e9', { opacity: 0.11 }),
    injection: basicMaterial('#8b5cf6', { opacity: 0.1 }),
    logistics: basicMaterial('#facc15', { opacity: 0.12 }),
    assembly: basicMaterial('#22c55e', { opacity: 0.1 }),
    storage: basicMaterial('#14b8a6', { opacity: 0.1 }),
    security: basicMaterial('#ef4444', { opacity: 0.12 }),
    environment: basicMaterial('#f97316', { opacity: 0.1 }),
  }

  ;[
    [-5.6, -3.1, 6.2, 2.8, zoneMaterial.machining],
    [3.3, -3.1, 6.7, 2.8, zoneMaterial.injection],
    [0, 0.3, 17.2, 1.25, zoneMaterial.logistics],
    [-1.6, 2.25, 7.2, 2.55, zoneMaterial.assembly],
    [5.4, 2.55, 5.4, 2.5, zoneMaterial.storage],
    [-7.9, 2.8, 2.3, 3.3, zoneMaterial.security],
    [7.65, -2.15, 2.45, 3.7, zoneMaterial.environment],
  ].forEach(([x, z, width, depth, material]) => {
    const zone = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), material)
    zone.rotation.x = -Math.PI / 2
    zone.position.set(x, 0.022, z)
    group.add(zone)
  })

  const safety = standardMaterial(palette.yellow, { emissive: '#5f4200', emissiveIntensity: 0.08, roughness: 0.42, metalness: 0.08 })
  ;[
    [0, 0.04, -0.4, 17.2, 0.026, 0.055],
    [0, 0.04, 1.0, 17.2, 0.026, 0.055],
    [-8.25, 0.045, 0.3, 0.055, 0.026, 1.3],
    [8.25, 0.045, 0.3, 0.055, 0.026, 1.3],
  ].forEach(([x, y, z, sx, sy, sz]) => group.add(mesh(geometries.box, safety, [x, y, z], [sx, sy, sz])))

  const wallMaterial = standardMaterial('#11243a', { roughness: 0.62, metalness: 0.22 })
  group.add(edge(mesh(geometries.box, wallMaterial, [0, 0.7, -5.85], [20, 1.4, 0.14]), palette.blue, 0.2))
  group.add(edge(mesh(geometries.box, wallMaterial, [-9.95, 0.7, 0], [0.14, 1.4, 12]), palette.blue, 0.2))
  group.add(edge(mesh(geometries.box, wallMaterial, [9.95, 0.7, 0], [0.14, 1.4, 12]), palette.blue, 0.2))

  const rackGeometry = new THREE.BoxGeometry(0.34, 1.05, 1.14)
  const rackMaterial = standardMaterial('#1e3a5f', { roughness: 0.48, metalness: 0.2 })
  const racks = new THREE.InstancedMesh(rackGeometry, rackMaterial, 8)
  const matrix = new THREE.Matrix4()
  let index = 0
  for (let row = 0; row < 2; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      matrix.makeTranslation(6.15 + col * 0.58, 0.55, 2.75 + row * 0.82)
      racks.setMatrixAt(index, matrix)
      index += 1
    }
  }
  group.add(racks)

  addFactoryFixtures(group)
  group.userData.animatedParts = []
  return group
}

function addFactoryFixtures(group) {
  const columnMaterial = standardMaterial('#2a3f55', { roughness: 0.52, metalness: 0.34 })
  ;[[-8.4, -4.6], [-2.8, -4.6], [2.8, -4.6], [8.4, -4.6], [-8.4, 4.6], [-2.8, 4.6], [2.8, 4.6], [8.4, 4.6]].forEach(([x, z]) => {
    group.add(cylinder(0.065, 1.75, '#2a3f55', [x, 0.88, z], { segments: 12, metalness: 0.38, roughness: 0.42 }))
    group.add(box(0.34, 0.08, 0.34, '#526579', [x, 0.04, z], { metalness: 0.34, roughness: 0.34 }))
  })

  const cableTray = standardMaterial('#26384c', { roughness: 0.46, metalness: 0.32 })
  group.add(mesh(geometries.box, cableTray, [0, 1.75, -4.6], [16.8, 0.08, 0.16]))
  group.add(mesh(geometries.box, cableTray, [6.8, 1.62, -1.2], [0.12, 0.08, 5.8]))

  const fenceMaterial = standardMaterial('#d7a21a', { roughness: 0.45, metalness: 0.22 })
  ;[
    [-1.8, 1.12, 2.95, 3.2, 0.05, 0.08],
    [1.8, 1.12, 2.95, 3.2, 0.05, 0.08],
    [0, 1.12, 3.95, 0.08, 0.05, 1.8],
  ].forEach(([x, y, z, sx, sy, sz]) => group.add(mesh(geometries.box, fenceMaterial, [x, y, z], [sx, sy, sz])))
  ;[[-3.4, 2.95], [-1.0, 2.95], [1.0, 2.95], [3.4, 2.95], [-3.4, 3.95], [3.4, 3.95]].forEach(([x, z]) => {
    group.add(mesh(geometries.box, fenceMaterial, [x, 0.6, z], [0.06, 1.05, 0.06]))
  })

  createInspectionStation(group, [2.2, 0, 2.9])
  createPackingStation(group, [5.2, 0, 2.9])
  createWarningSign(group, [-7.8, 0, 1.15])
}

function createInspectionStation(group, position) {
  const [x, , z] = position
  const station = markRaw(new THREE.Group())
  station.position.set(x, 0, z)
  station.add(edge(box(1.18, 0.12, 0.78, '#2b3f55', [0, 0.62, 0], { metalness: 0.34, roughness: 0.36 }), '#7dd3fc', 0.12))
  station.add(box(0.08, 0.58, 0.08, '#526579', [-0.48, 0.3, -0.3], { metalness: 0.38, roughness: 0.34 }))
  station.add(box(0.08, 0.58, 0.08, '#526579', [0.48, 0.3, -0.3], { metalness: 0.38, roughness: 0.34 }))
  station.add(cylinder(0.035, 0.9, '#526579', [-0.34, 1.08, 0.2], { segments: 12, metalness: 0.42, roughness: 0.3 }))
  const camera = edge(box(0.34, 0.18, 0.2, '#dbeafe', [-0.08, 1.52, 0.2], { metalness: 0.12, roughness: 0.28 }), palette.cyan, 0.14)
  station.add(camera)
  station.add(panel(0.46, 0.04, 0.18, palette.cyan, [0, 1.22, 0.2], { emissive: palette.cyan, emissiveIntensity: 0.25, opacity: 0.78 }))
  group.add(station)
}

function createPackingStation(group, position) {
  const [x, , z] = position
  const station = markRaw(new THREE.Group())
  station.position.set(x, 0, z)
  station.add(edge(box(1.35, 0.14, 0.82, '#25384c', [0, 0.5, 0], { metalness: 0.28, roughness: 0.4 }), '#7dd3fc', 0.1))
  station.add(box(0.92, 0.42, 0.58, '#d8c8a4', [-0.12, 0.84, 0], { metalness: 0.03, roughness: 0.62 }))
  station.add(panel(0.4, 0.14, 0.04, '#07111f', [0.42, 0.92, 0.32], { emissive: palette.green, emissiveIntensity: 0.16 }))
  station.add(cylinder(0.03, 0.78, '#526579', [0.58, 0.95, -0.26], { segments: 12, metalness: 0.38, roughness: 0.32 }))
  station.add(edge(box(0.2, 0.14, 0.16, '#dbeafe', [0.58, 1.36, -0.26], { metalness: 0.1, roughness: 0.3 }), palette.cyan, 0.12))
  group.add(station)
}

function createWarningSign(group, position) {
  const [x, , z] = position
  const sign = markRaw(new THREE.Group())
  sign.position.set(x, 0, z)
  sign.add(cylinder(0.025, 0.82, '#64748b', [0, 0.42, 0], { segments: 12, metalness: 0.32, roughness: 0.36 }))
  sign.add(mesh(geometries.cone12, standardMaterial(palette.yellow, { roughness: 0.38, metalness: 0.08 }), [0, 0.98, 0], [0.24, 0.22, 0.24], { rotation: [0, 0, Math.PI] }))
  group.add(sign)
}

export function createProductionLine(line) {
  const group = markRaw(new THREE.Group())
  group.name = line.name
  group.userData = {
    id: line.id,
    kind: 'productionLine',
    routePoints: line.points,
    animatedParts: [],
    statusParts: [],
  }

  const flowColor = statusColor(line.status)
  for (let index = 0; index < line.points.length; index += 1) {
    const current = line.points[index]
    const next = line.points[(index + 1) % line.points.length]
    if (!next) continue
    const from = new THREE.Vector3(...current)
    const to = new THREE.Vector3(...next)
    const middle = from.clone().lerp(to, 0.5)
    const length = from.distanceTo(to)
    const angle = Math.atan2(to.x - from.x, to.z - from.z)
    const segment = new THREE.Group()
    segment.position.copy(middle)
    segment.rotation.y = angle
    segment.add(edge(box(0.66, 0.11, length, '#101c2e', [0, 0.38, 0], { roughness: 0.5, metalness: 0.32 }), palette.cyan, 0.18))
    segment.add(box(0.08, 0.18, length + 0.08, '#526579', [-0.42, 0.5, 0], { edges: false }))
    segment.add(box(0.08, 0.18, length + 0.08, '#526579', [0.42, 0.5, 0], { edges: false }))
    group.add(segment)
  }

  const path = new THREE.BufferGeometry().setFromPoints(line.points.map((point) => new THREE.Vector3(...point)))
  const glow = new THREE.Line(path, new THREE.LineBasicMaterial({ color: flowColor, transparent: true, opacity: 0.68 }))
  glow.position.y = 0.64
  glow.userData.anim = 'dataFlow'
  glow.userData.themeRole = 'routeLine'
  group.userData.animatedParts.push(glow)
  group.add(glow)

  for (let i = 0; i < 6; i += 1) {
    const product = edge(box(0.34, 0.22, 0.25, i % 2 ? '#dbeafe' : '#fef3c7', [0, 0.74, 0], { roughness: 0.36, metalness: 0.05 }), '#ffffff', 0.15)
    product.userData.anim = 'lineProduct'
    product.userData.offset = i / 6
    group.userData.animatedParts.push(product)
    group.add(product)
  }
  return group
}

function createCnc(device, importedRoot) {
  if (importedRoot) return decorateImported(device, importedRoot, 'cnc')
  const group = makeDeviceGroup(device, 'cnc')
  const color = statusColor(device.status)
  group.add(edge(box(1.55, 0.28, 1.08, '#10253b', [0, 0.14, 0], { roughness: 0.55, metalness: 0.3, receiveShadow: true }), palette.cyan, 0.16))
  group.add(edge(box(1.32, 0.96, 0.9, '#24445f', [-0.08, 0.78, 0], { roughness: 0.42, metalness: 0.38 }), palette.cyan, 0.18))
  group.add(panel(0.58, 0.62, 0.055, '#c7d9e8', [-0.42, 0.83, 0.48], { metalness: 0.06, roughness: 0.28 }))
  group.add(panel(0.28, 0.58, 0.075, palette.panel, [0.46, 0.82, 0.5], { edgeColor: color, emissive: '#071a2d', emissiveIntensity: 0.2 }))
  group.add(panel(0.2, 0.14, 0.04, '#06111f', [0.46, 1.01, 0.55], { emissive: palette.cyan, emissiveIntensity: 0.45 }))
  for (let i = 0; i < 5; i += 1) group.add(panel(0.038, 0.26, 0.028, '#07111f', [0.63, 0.62 + i * 0.06, -0.47], { roughness: 0.5, metalness: 0.1 }))
  group.add(cylinder(0.1, 0.46, '#bac8d8', [-0.1, 1.02, 0.18], { rotation: [Math.PI / 2, 0, 0], metalness: 0.48, roughness: 0.24 }))
  group.add(panel(0.36, 0.17, 0.28, '#64748b', [-0.1, 0.72, 0.14], { roughness: 0.35, metalness: 0.42 }))
  group.add(panel(0.54, 0.08, 0.08, palette.blue, [-0.38, 1.23, 0.5], { emissive: palette.blue, emissiveIntensity: 0.22 }))
  const plate = namePlate(palette.cyan)
  plate.position.set(-0.05, 0.32, 0.55)
  group.add(plate)
  group.add(panel(0.74, 0.02, 0.04, palette.yellow, [-0.1, 0.3, -0.56], { emissive: '#5f4200', emissiveIntensity: 0.08 }))
  return finalizeDevice(group, device, { labelOffset: 1.7, lampPosition: [-0.52, 1.38, 0.34], ringRadius: 1.05 })
}

function createLathe(device, importedRoot) {
  if (importedRoot) return decorateImported(device, importedRoot, 'lathe')
  const group = makeDeviceGroup(device, 'lathe')
  const color = statusColor(device.status)
  group.add(edge(box(1.75, 0.25, 0.74, '#10253b', [0, 0.13, 0], { metalness: 0.34, roughness: 0.48 }), palette.cyan, 0.14))
  group.add(edge(box(1.45, 0.72, 0.7, '#1f3d5a', [-0.08, 0.58, 0], { metalness: 0.36, roughness: 0.42 }), palette.cyan, 0.16))
  group.add(panel(0.62, 0.42, 0.05, '#dbeafe', [-0.42, 0.64, 0.38], { roughness: 0.28, metalness: 0.08 }))
  group.add(panel(0.3, 0.52, 0.065, palette.panel, [0.52, 0.68, 0.4], { emissive: color, emissiveIntensity: 0.1 }))
  group.add(cylinder(0.14, 0.36, '#cbd5e1', [-0.38, 0.88, 0.02], { rotation: [0, 0, Math.PI / 2], metalness: 0.55, roughness: 0.2 }))
  group.add(cylinder(0.16, 0.28, '#94a3b8', [0.22, 0.88, 0.02], { rotation: [0, 0, Math.PI / 2], metalness: 0.55, roughness: 0.22 }))
  for (let i = 0; i < 4; i += 1) group.add(panel(0.04, 0.18, 0.03, '#07111f', [0.67, 0.55 + i * 0.06, -0.36], { roughness: 0.45 }))
  group.add(panel(0.48, 0.08, 0.035, '#07111f', [-0.08, 0.3, 0.39], { emissive: palette.cyan, emissiveIntensity: 0.1 }))
  return finalizeDevice(group, device, { labelOffset: 1.45, lampPosition: [-0.68, 1.08, 0.28], ringRadius: 1.05 })
}

function createInjection(device, importedRoot) {
  if (importedRoot) return decorateImported(device, importedRoot, 'injection')
  const group = makeDeviceGroup(device, 'injection')
  const color = statusColor(device.status)
  group.add(edge(box(1.8, 0.34, 0.86, '#17324f', [-0.18, 0.17, 0], { metalness: 0.32, roughness: 0.44 }), palette.cyan, 0.16))
  group.add(edge(box(0.78, 0.66, 0.84, '#d7e4ef', [-0.68, 0.58, 0], { metalness: 0.12, roughness: 0.32 }), '#e0f2fe', 0.14))
  group.add(edge(box(1.05, 0.52, 0.78, '#34465a', [0.42, 0.54, 0], { metalness: 0.36, roughness: 0.36 }), palette.blue, 0.16))
  group.add(cylinder(0.15, 1.2, '#94a3b8', [-0.1, 0.86, 0], { rotation: [0, 0, Math.PI / 2], metalness: 0.58, roughness: 0.22 }))
  group.add(cylinder(0.22, 0.42, '#64748b', [0.62, 0.86, 0], { rotation: [0, 0, Math.PI / 2], metalness: 0.52, roughness: 0.24 }))
  group.add(cylinder(0.26, 0.42, '#cbd5e1', [0.12, 1.23, -0.28], { segments: 12, metalness: 0.24, roughness: 0.32 }))
  group.add(panel(0.5, 0.36, 0.12, palette.panel, [0.98, 0.66, -0.42], { emissive: color, emissiveIntensity: 0.08 }))
  group.add(panel(0.34, 0.16, 0.22, palette.yellow, [0.92, 0.24, 0.42], { metalness: 0.08, roughness: 0.42 }))
  ;[-0.38, 0, 0.38].forEach((offset) => {
    group.add(cylinder(0.018, 0.92, '#7dd3fc', [0.16 + offset, 1.1, -0.5], { rotation: [0, 0, Math.PI / 2], emissive: palette.blue, emissiveIntensity: 0.12, segments: 12 }))
  })
  return finalizeDevice(group, device, { labelOffset: 1.65, lampPosition: [-0.8, 1.2, 0.32], ringRadius: 1.15 })
}

function createConveyor(device, importedRoot) {
  if (importedRoot) return decorateImported(device, importedRoot, 'conveyor')
  const group = makeDeviceGroup(device, 'conveyor')
  const color = statusColor(device.status)
  group.add(edge(box(2.6, 0.1, 0.78, '#111c2e', [0, 0.45, 0], { metalness: 0.32, roughness: 0.4 }), palette.cyan, 0.12))
  group.add(box(2.72, 0.14, 0.075, '#5b7188', [0, 0.59, -0.49], { metalness: 0.45, roughness: 0.28 }))
  group.add(box(2.72, 0.14, 0.075, '#5b7188', [0, 0.59, 0.49], { metalness: 0.45, roughness: 0.28 }))
  for (let i = -3; i <= 3; i += 1) group.add(cylinder(0.052, 0.82, '#8aa4bf', [i * 0.42, 0.54, 0], { rotation: [Math.PI / 2, 0, 0], segments: 12, metalness: 0.55, roughness: 0.22 }))
  for (let i = -5; i <= 5; i += 1) group.add(panel(0.03, 0.018, 0.66, '#26384c', [i * 0.23, 0.615, 0], { metalness: 0.28, roughness: 0.46 }))
  ;[[-0.92, -0.38], [0.92, -0.38], [-0.92, 0.38], [0.92, 0.38]].forEach(([x, z]) => group.add(box(0.1, 0.42, 0.1, '#64748b', [x, 0.22, z], { metalness: 0.36, roughness: 0.34 })))
  group.add(cylinder(0.028, 0.58, '#526579', [-1.12, 0.9, 0.42], { segments: 12, metalness: 0.4, roughness: 0.32 }))
  group.add(panel(0.16, 0.1, 0.08, '#07111f', [-1.12, 1.18, 0.42], { emissive: palette.green, emissiveIntensity: 0.25 }))
  group.add(cylinder(0.028, 0.58, '#526579', [1.12, 0.9, -0.42], { segments: 12, metalness: 0.4, roughness: 0.32 }))
  group.add(panel(0.16, 0.1, 0.08, '#07111f', [1.12, 1.18, -0.42], { emissive: palette.cyan, emissiveIntensity: 0.22 }))
  for (let i = 0; i < 5; i += 1) {
    const product = edge(box(0.28, 0.2, 0.28, i % 2 ? '#fef3c7' : '#dbeafe', [-1 + i * 0.5, 0.67, 0], { roughness: 0.3, metalness: 0.02 }), '#ffffff', 0.12)
    product.userData.anim = 'beltProduct'
    product.userData.offset = i / 5
    group.userData.animatedParts.push(product)
    group.add(product)
  }
  return finalizeDevice(group, device, { labelOffset: 1.2, lampPosition: [1.08, 0.84, 0.34], ringRadius: 1.2 })
}

function createAgv(device, importedRoot) {
  if (importedRoot) return decorateImported(device, importedRoot, 'agv')
  const group = makeDeviceGroup(device, 'agv')
  const color = statusColor(device.status)
  group.add(edge(box(0.9, 0.24, 0.56, '#1b3248', [0, 0.2, 0], { metalness: 0.32, roughness: 0.38 }), color, 0.22))
  group.add(panel(0.56, 0.18, 0.34, '#dbeafe', [0.02, 0.42, 0], { metalness: 0.08, roughness: 0.28 }))
  group.add(panel(0.48, 0.2, 0.38, '#f8fafc', [-0.08, 0.64, 0], { metalness: 0.04, roughness: 0.36 }))
  group.add(panel(0.28, 0.08, 0.2, palette.panel, [0.3, 0.55, 0], { emissive: palette.cyan, emissiveIntensity: 0.38 }))
  group.add(panel(0.18, 0.04, 0.18, palette.green, [0.48, 0.28, 0], { emissive: palette.green, emissiveIntensity: 0.28 }))
  group.add(panel(0.18, 0.04, 0.18, palette.red, [-0.48, 0.28, 0], { emissive: palette.red, emissiveIntensity: 0.18 }))
  ;[-0.32, 0.32].forEach((x) => {
    ;[-0.24, 0.24].forEach((z) => group.add(cylinder(0.09, 0.08, '#0f172a', [x, 0.08, z], { rotation: [Math.PI / 2, 0, 0], segments: 12, roughness: 0.7, metalness: 0.04 })))
  })
  return finalizeDevice(group, device, { labelOffset: 1.1, lampPosition: [-0.34, 0.58, 0.22], lampRadius: 0.075, ringRadius: 0.8 })
}

function createRobot(device, importedRoot) {
  if (importedRoot) return decorateImported(device, importedRoot, 'robot')
  const group = makeDeviceGroup(device, 'robot')
  const color = statusColor(device.status)
  const base = cylinder(0.38, 0.28, '#334155', [0, 0.14, 0], { segments: 16, metalness: 0.46, roughness: 0.28 })
  const shoulder = markRaw(new THREE.Group())
  const wrist = markRaw(new THREE.Group())
  shoulder.position.set(0, 0.36, 0)
  shoulder.add(cylinder(0.2, 0.38, '#94a3b8', [0, 0.18, 0], { segments: 16, metalness: 0.48, roughness: 0.22 }))
  const armA = edge(box(0.24, 0.22, 1.15, '#dbeafe', [0, 0.58, 0.45], { roughness: 0.32, metalness: 0.12 }), '#e0f2fe', 0.12)
  armA.rotation.x = -0.42
  shoulder.add(armA)
  wrist.position.set(0, 1.0, 0.96)
  const armB = edge(box(0.2, 0.18, 0.84, '#8aa4bf', [0, 0.14, 0.32], { roughness: 0.3, metalness: 0.32 }), '#cbd5e1', 0.12)
  armB.rotation.x = 0.5
  wrist.add(armB)
  wrist.add(box(0.4, 0.055, 0.08, '#f8fafc', [0, 0.26, 0.76], { roughness: 0.24, metalness: 0.2 }))
  shoulder.add(wrist)
  group.add(base, shoulder)
  group.userData.animatedParts.push({ type: 'robotJoints', shoulder, wrist })
  return finalizeDevice(group, device, { labelOffset: 2.15, lampPosition: [0.32, 1.62, 1.22], lampRadius: 0.12, ringRadius: 0.95 })
}

function createCamera(device, importedRoot) {
  if (importedRoot) return decorateImported(device, importedRoot, device.type)
  const group = makeDeviceGroup(device, device.type === 'access' ? 'access' : 'camera')
  const color = statusColor(device.status)
  if (device.type === 'access') {
    group.add(edge(box(1.15, 1.45, 0.12, '#3b1220', [0, 0.72, 0], { roughness: 0.44, metalness: 0.24 }), palette.red, 0.28))
    group.add(panel(0.25, 0.36, 0.04, palette.panel, [0.34, 0.82, 0.08], { emissive: color, emissiveIntensity: 0.2 }))
    return finalizeDevice(group, device, { labelOffset: 1.7, lampPosition: [-0.34, 1.35, 0.12], lampRadius: 0.075, ringRadius: 0.85 })
  }
  const head = markRaw(new THREE.Group())
  group.add(cylinder(0.045, 1.15, '#64748b', [0, 0.62, 0], { segments: 12, metalness: 0.42, roughness: 0.32 }))
  group.add(box(0.46, 0.1, 0.1, '#8aa4bf', [0.18, 1.18, 0], { metalness: 0.42, roughness: 0.28 }))
  head.position.set(0.48, 1.18, 0)
  head.add(edge(box(0.44, 0.23, 0.25, '#dbeafe', [0, 0, 0], { roughness: 0.28, metalness: 0.16 }), palette.cyan, 0.16))
  head.add(cylinder(0.1, 0.09, '#07111f', [0.26, 0, 0], { rotation: [0, 0, Math.PI / 2], emissive: palette.cyan, emissiveIntensity: 0.26, roughness: 0.24 }))
  group.add(head)
  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(0.75, 2.1, 28, 1, true),
    basicMaterial(palette.cyan, { opacity: 0.1, depthWrite: false })
  )
  cone.position.set(1.15, 0.7, 0)
  cone.rotation.z = -Math.PI / 2
  cone.userData.anim = 'scanCone'
  group.userData.animatedParts.push({ type: 'cameraHead', head }, cone)
  group.add(cone)
  return finalizeDevice(group, device, { labelOffset: 1.9, lampPosition: [-0.05, 1.28, 0.12], lampRadius: 0.07, ringRadius: 0.72 })
}

function createSensor(device, importedRoot) {
  if (importedRoot) return decorateImported(device, importedRoot, device.type)
  const group = makeDeviceGroup(device, device.type === 'cabinet' ? 'cabinet' : 'sensor')
  const color = statusColor(device.status)
  if (device.type === 'cabinet') {
    group.add(edge(box(0.52, 1.15, 0.42, '#21364f', [0, 0.58, 0], { roughness: 0.42, metalness: 0.32 }), '#60a5fa', 0.16))
    group.add(panel(0.34, 0.18, 0.035, palette.panel, [0, 0.92, 0.23], { emissive: palette.cyan, emissiveIntensity: 0.32 }))
    group.add(panel(0.28, 0.36, 0.035, '#0f172a', [0, 0.48, 0.23], { emissive: color, emissiveIntensity: 0.1 }))
  } else {
    group.add(cylinder(0.16, 0.68, '#dbeafe', [0, 0.42, 0], { segments: 12, roughness: 0.28, metalness: 0.1 }))
    group.add(panel(0.42, 0.18, 0.12, palette.panel, [0, 0.78, 0], { emissive: palette.cyan, emissiveIntensity: 0.16 }))
  }
  const ringA = glowRing(color, 0.62, 0.18)
  const ringB = glowRing(color, 0.9, 0.08)
  ringA.position.y = 0.04
  ringB.position.y = 0.045
  ringA.userData.anim = 'sensorRipple'
  ringB.userData.anim = 'sensorRipple'
  ringB.userData.delay = 0.48
  group.userData.animatedParts.push(ringA, ringB)
  group.add(ringA, ringB)
  return finalizeDevice(group, device, { labelOffset: 1.35, lampPosition: [0.16, 1.05, 0.16], lampRadius: 0.075, ringRadius: 0.68 })
}

export function createDeviceFallback(device, context = {}) {
  const importedRoot = context.importedRoot
  const modelType = resolveModelType(device)
  if (modelType === 'lathe') return createLathe(device, importedRoot)
  if (device.type === 'cnc') return createCnc(device, importedRoot)
  if (device.type === 'injection') return createInjection(device, importedRoot)
  if (device.type === 'robot') return createRobot(device, importedRoot)
  if (device.type === 'agv') return createAgv(device, importedRoot)
  if (device.type === 'conveyor') return createConveyor(device, importedRoot)
  if (device.type === 'camera' || device.type === 'access') return createCamera(device, importedRoot)
  return createSensor(device, importedRoot)
}

export function createAgvRoute(route) {
  const points = route.points.map((point) => new THREE.Vector3(...point))
  const geometry = new THREE.BufferGeometry().setFromPoints([...points, points[0]])
  const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: palette.cyan, transparent: true, opacity: 0.28 }))
  line.position.y = 0.08
  line.userData = { id: route.id, kind: 'agvRoute', routePoints: route.points, animatedParts: [], themeRole: 'routeLine' }
  return line
}
