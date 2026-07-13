import * as THREE from 'three'

export function createMaterial(color, options = {}) {
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: options.roughness ?? 0.56,
    metalness: options.metalness ?? 0.18,
    transparent: options.opacity !== undefined,
    opacity: options.opacity ?? 1,
    emissive: options.emissive || '#000000',
    emissiveIntensity: options.emissiveIntensity ?? 0,
  })
  return material
}

export function createBox(width, height, depth, color, position = [0, 0, 0], options = {}) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    createMaterial(color, options)
  )
  mesh.position.set(...position)
  mesh.castShadow = true
  mesh.receiveShadow = true
  if (options.name) mesh.name = options.name
  if (options.edges !== false) addEdges(mesh, options.edgeColor || '#89d8ff', options.edgeOpacity ?? 0.22)
  return mesh
}

export function createCylinder(radiusTop, radiusBottom, height, color, position = [0, 0, 0], options = {}) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radiusTop, radiusBottom, height, options.segments || 24),
    createMaterial(color, options)
  )
  mesh.position.set(...position)
  mesh.castShadow = true
  mesh.receiveShadow = true
  if (options.rotateX) mesh.rotation.x = options.rotateX
  if (options.rotateY) mesh.rotation.y = options.rotateY
  if (options.rotateZ) mesh.rotation.z = options.rotateZ
  if (options.name) mesh.name = options.name
  return mesh
}

export function createPlane(width, height, color, position = [0, 0, 0], options = {}) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({
      color,
      transparent: options.opacity !== undefined,
      opacity: options.opacity ?? 1,
      side: THREE.DoubleSide,
    })
  )
  mesh.position.set(...position)
  if (options.rotateX) mesh.rotation.x = options.rotateX
  if (options.rotateY) mesh.rotation.y = options.rotateY
  if (options.rotateZ) mesh.rotation.z = options.rotateZ
  return mesh
}

export function addEdges(mesh, color = '#8bdcff', opacity = 0.26) {
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity })
  )
  mesh.add(edges)
  return edges
}

export function createGlowRing(radius, color, opacity = 0.28) {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(radius * 0.82, radius, 48),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide })
  )
  ring.rotation.x = -Math.PI / 2
  ring.userData.glowRing = true
  return ring
}

export function createStatusLight(color, position = [0, 1, 0], radius = 0.12) {
  const light = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 24, 14),
    createMaterial(color, { emissive: color, emissiveIntensity: 0.75, roughness: 0.32 })
  )
  light.position.set(...position)
  light.userData.statusLight = true
  return light
}

export function makeSelectable(group, device, kind) {
  group.name = device.name
  group.userData = {
    id: device.id,
    device,
    selectable: true,
    kind: kind || device.type,
    basePosition: group.position.clone(),
  }
  return group
}

export function setGroupEmphasis(group, active, fault = false) {
  if (!group) return
  group.scale.setScalar(active ? 1.08 : 1)
  group.traverse((child) => {
    if (child.material?.emissive && child.userData.statusLight) {
      child.material.emissiveIntensity = fault ? 1.3 : active ? 1 : 0.72
    }
  })
}

export function disposeGroup(scene, group) {
  if (!group) return
  scene?.remove(group)
  group.traverse((child) => {
    child.geometry?.dispose?.()
    if (Array.isArray(child.material)) {
      child.material.forEach((material) => material.dispose?.())
    } else {
      child.material?.dispose?.()
    }
  })
}

export function samplePath(points, progress) {
  if (!points?.length) return new THREE.Vector3()
  if (points.length === 1) return new THREE.Vector3(...points[0])
  const wrapped = ((progress % 1) + 1) % 1
  const scaled = wrapped * (points.length - 1)
  const index = Math.floor(scaled)
  const nextIndex = Math.min(index + 1, points.length - 1)
  const t = scaled - index
  const from = new THREE.Vector3(...points[index])
  const to = new THREE.Vector3(...points[nextIndex])
  return from.lerp(to, t)
}
