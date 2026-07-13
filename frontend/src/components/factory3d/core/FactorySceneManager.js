import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { createDeviceModelWithFallback } from './modelLoader'
import { disposeObject3D, removeAndDispose } from './dispose'
import {
  createAgvRoute,
  createDeviceFallback,
  createFactoryFloor,
  createProductionLine,
  samplePath,
} from '../models/proceduralModels'
import { applyMaterialTheme, factoryThemes, statusColor } from './materials'

const MODE_TYPES = {
  overview: null,
  equipment: ['cnc', 'lathe', 'injection', 'robot', 'agv', 'conveyor'],
  security: ['camera', 'access'],
  environment: ['sensor', 'cabinet'],
  production: ['cnc', 'lathe', 'injection', 'robot', 'conveyor'],
}

export class FactorySceneManager {
  constructor(host, options = {}) {
    this.host = host
    this.options = options
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(46, 1, 0.1, 90)
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
    this.controls = null
    this.raycaster = new THREE.Raycaster()
    this.pointer = new THREE.Vector2()
    this.resizeObserver = null
    this.frameId = 0
    this.records = new Map()
    this.selectableMeshes = []
    this.routeByDevice = new Map()
    this.selectedId = ''
    this.hoveredId = ''
    this.activeMode = 'overview'
    this.desiredTarget = new THREE.Vector3(0, 0.45, -0.2)
    this.desiredCameraPosition = new THREE.Vector3(8.8, 6.8, 9.2)
    this.lastPickAt = 0
    this.lastLabelAt = 0
    this.resizeFrame = 0
    this.disposed = false
    this.theme = options.theme === 'light' ? 'light' : 'dark'
    this.ambientLight = null
    this.keyLight = null
    this.rimLight = null

    this.onPointerMove = this.onPointerMove.bind(this)
    this.onPointerLeave = this.onPointerLeave.bind(this)
    this.onClick = this.onClick.bind(this)
    this.animate = this.animate.bind(this)
  }

  init() {
    const themeDef = factoryThemes[this.theme]
    this.scene.background = new THREE.Color(themeDef.background)
    this.scene.fog = new THREE.Fog(themeDef.fog, 13, 32)

    this.camera.position.copy(this.desiredCameraPosition)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    this.renderer.setSize(this.host.clientWidth, this.host.clientHeight, false)
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFShadowMap
    this.host.appendChild(this.renderer.domElement)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.target.copy(this.desiredTarget)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.08
    this.controls.minDistance = 5
    this.controls.maxDistance = 23
    this.controls.maxPolarAngle = Math.PI * 0.48

    this.ambientLight = new THREE.AmbientLight(themeDef.lightAmbient, themeDef.lightAmbientIntensity)
    this.scene.add(this.ambientLight)
    this.keyLight = new THREE.DirectionalLight(themeDef.lightKey, themeDef.lightKeyIntensity)
    this.keyLight.position.set(4, 9, 5)
    this.keyLight.castShadow = true
    this.keyLight.shadow.mapSize.set(1024, 1024)
    this.scene.add(this.keyLight)
    this.rimLight = new THREE.PointLight(themeDef.lightRim, themeDef.lightRimIntensity, 22)
    this.rimLight.position.set(-6, 4, 5)
    this.scene.add(this.rimLight)

    this.renderer.domElement.addEventListener('pointermove', this.onPointerMove)
    this.renderer.domElement.addEventListener('pointerleave', this.onPointerLeave)
    this.renderer.domElement.addEventListener('click', this.onClick)
    this.resizeObserver = new ResizeObserver(() => this.scheduleResize())
    this.resizeObserver.observe(this.host)
    this.resize()
    this.frameId = requestAnimationFrame(this.animate)
  }

  setTheme(theme = 'dark') {
    this.theme = theme === 'light' ? 'light' : 'dark'
    const themeDef = factoryThemes[this.theme]
    this.scene.background = new THREE.Color(themeDef.background)
    this.scene.fog = new THREE.Fog(themeDef.fog, 13, 32)
    if (this.ambientLight) {
      this.ambientLight.color.set(themeDef.lightAmbient)
      this.ambientLight.intensity = themeDef.lightAmbientIntensity
    }
    if (this.keyLight) {
      this.keyLight.color.set(themeDef.lightKey)
      this.keyLight.intensity = themeDef.lightKeyIntensity
    }
    if (this.rimLight) {
      this.rimLight.color.set(themeDef.lightRim)
      this.rimLight.intensity = themeDef.lightRimIntensity
    }
    this.scene.traverse((child) => {
      if (child.type === 'GridHelper' && child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        materials[0]?.color?.set(themeDef.gridA)
        materials[1]?.color?.set(themeDef.gridB)
      }
      if (child.userData?.themeRole === 'routeLine' && child.material?.color) {
        child.material.color.set(this.theme === 'light' ? '#087fc0' : '#38bdf8')
      }
      if (child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        materials.forEach((material) => applyMaterialTheme(material, this.theme))
      }
    })
  }

  resize() {
    const width = this.host.clientWidth || 1
    const height = this.host.clientHeight || 1
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height, false)
  }

  scheduleResize() {
    if (this.resizeFrame) return
    this.resizeFrame = requestAnimationFrame(() => {
      this.resizeFrame = 0
      this.resize()
    })
  }

  async build({ devices = [], productionLines = [], agvRoutes = [], environmentSensors = [] }) {
    this.clearSceneContent()
    this.environmentSensors = environmentSensors
    this.routeByDevice = new Map(agvRoutes.map((route) => [route.deviceId, route]))

    const floor = createFactoryFloor(this.theme)
    this.scene.add(floor)
    this.records.set('factory-floor', { id: 'factory-floor', group: floor, kind: 'floor', animatedParts: floor.userData.animatedParts || [] })

    productionLines.forEach((line) => {
      const group = createProductionLine(line, this.theme)
      this.scene.add(group)
      this.records.set(line.id, { id: line.id, group, kind: 'productionLine', line, animatedParts: group.userData.animatedParts || [] })
    })

    agvRoutes.forEach((route) => {
      const group = createAgvRoute(route, this.theme)
      this.scene.add(group)
      this.records.set(route.id, { id: route.id, group, kind: 'agvRoute', route, animatedParts: [] })
    })

    await Promise.all(devices.map((device) => this.addDevice(device)))
    this.setTheme(this.theme)
    this.setActiveMode(this.activeMode)
    if (this.selectedId) this.focusDevice(this.selectedId, false)
  }

  async addDevice(device) {
    const group = await createDeviceModelWithFallback(device, createDeviceFallback, { theme: this.theme })
    if (this.disposed) {
      disposeObject3D(group)
      return
    }
    const route = this.routeByDevice.get(device.id)
    if (route) group.userData.routePoints = route.points
    group.userData.routeOffset = device.id.endsWith('02') ? 0.42 : 0
    this.scene.add(group)
    const record = {
      id: device.id,
      device,
      group,
      kind: group.userData.kind || device.type,
      animatedParts: group.userData.animatedParts || [],
      statusParts: group.userData.statusParts || [],
      selectableMeshes: group.userData.selectableMeshes || [],
      labelOffset: group.userData.labelOffset || 1.4,
    }
    this.records.set(device.id, record)
    this.selectableMeshes.push(...record.selectableMeshes)
  }

  clearSceneContent() {
    this.records.forEach((record) => removeAndDispose(this.scene, record.group))
    this.records.clear()
    this.selectableMeshes = []
  }

  setSelected(id) {
    this.selectedId = id || ''
    this.records.forEach((record) => this.applyRecordEmphasis(record))
    if (this.selectedId) this.focusDevice(this.selectedId)
  }

  setActiveMode(mode) {
    this.activeMode = mode || 'overview'
    this.records.forEach((record) => this.applyRecordEmphasis(record))
  }

  updateDevices(devices = []) {
    devices.forEach((device) => {
      const record = this.records.get(device.id)
      if (!record) return
      record.device = device
      record.group.userData.device = device
      this.updateStatusParts(record)
    })
  }

  updateStatusParts(record) {
    const color = statusColor(record.device?.status)
    record.statusParts?.forEach((part) => {
      if (part.material?.color) part.material.color.set(color)
      if (part.material?.emissive) part.material.emissive.set(color)
    })
  }

  shouldHighlight(record) {
    if (!record?.device) return false
    if (record.id === this.selectedId || record.id === this.hoveredId) return true
    const modeTypes = MODE_TYPES[this.activeMode]
    return !modeTypes || modeTypes.includes(record.kind) || modeTypes.includes(record.device.type)
  }

  applyRecordEmphasis(record) {
    if (!record?.device) return
    const active = this.shouldHighlight(record)
    const fault = record.device.status === 'fault'
    record.group.scale.setScalar(active ? 1.06 : 1)
    record.group.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.opacity = !active && this.activeMode !== 'overview' && child.material.transparent ? Math.min(child.material.opacity, 0.5) : child.material.opacity
      }
    })
    record.statusParts?.forEach((part) => {
      if (part.material?.emissive) part.material.emissiveIntensity = fault ? 1.2 : active ? 0.95 : 0.62
    })
  }

  focusDevice(id, markManual = true) {
    const record = this.records.get(id)
    if (!record) return
    const position = new THREE.Vector3()
    record.group.getWorldPosition(position)
    this.desiredTarget = position.clone().add(new THREE.Vector3(0, 0.72, 0))
    this.desiredCameraPosition = position.clone().add(new THREE.Vector3(4.4, 3.2, 4.3))
    if (markManual) this.manualFocusUntil = performance.now() + 4500
  }

  onPointerMove(event) {
    const now = performance.now()
    if (now - this.lastPickAt < 48) return
    this.lastPickAt = now
    this.pick(event, false)
  }

  onPointerLeave() {
    if (!this.hoveredId) return
    this.hoveredId = ''
    this.options.onHover?.('')
    this.records.forEach((record) => this.applyRecordEmphasis(record))
  }

  onClick(event) {
    this.pick(event, true)
  }

  pick(event, click) {
    if (!this.selectableMeshes.length) return
    const bounds = this.renderer.domElement.getBoundingClientRect()
    this.pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
    this.pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1
    this.raycaster.setFromCamera(this.pointer, this.camera)
    const hit = this.raycaster.intersectObjects(this.selectableMeshes, false)[0]
    let id = ''
    let object = hit?.object
    while (object) {
      id = object.userData?.deviceId || object.userData?.id || ''
      if (id) break
      object = object.parent
    }
    if (id !== this.hoveredId) {
      this.hoveredId = id
      this.options.onHover?.(id)
      this.records.forEach((record) => this.applyRecordEmphasis(record))
    }
    if (click && id) this.options.onSelect?.(id)
  }

  animate(time = 0) {
    this.frameId = requestAnimationFrame(this.animate)
    const seconds = time * 0.001
    const pulse = (Math.sin(seconds * 4) + 1) / 2

    if (this.activeMode === 'overview' && performance.now() > (this.manualFocusUntil || 0) && !this.hoveredId) {
      this.desiredTarget.set(0, 0.45, -0.2)
      this.desiredCameraPosition.set(
        Math.sin(seconds * 0.065) * 9.4,
        6.6 + Math.sin(seconds * 0.05) * 0.32,
        Math.cos(seconds * 0.065) * 9.4
      )
    }

    this.records.forEach((record) => this.animateRecord(record, seconds, pulse))
    this.camera.position.lerp(this.desiredCameraPosition, this.activeMode === 'overview' ? 0.012 : 0.045)
    this.controls.target.lerp(this.desiredTarget, 0.055)
    this.controls.update()
    this.emitLabels(time)
    this.renderer.render(this.scene, this.camera)
  }

  animateRecord(record, seconds, pulse) {
    const device = record.device
    if (record.kind === 'agv' && record.group.userData.routePoints?.length && device?.status === 'running') {
      const progress = seconds * 0.045 + (record.group.userData.routeOffset || 0)
      const current = samplePath(record.group.userData.routePoints, progress)
      const next = samplePath(record.group.userData.routePoints, progress + 0.01)
      record.group.position.copy(current)
      record.group.lookAt(next.x, current.y, next.z)
    }

    record.animatedParts?.forEach((part) => {
      if (part.type === 'robotJoints') {
        part.shoulder.rotation.y = Math.sin(seconds * 0.75) * 0.48
        part.wrist.rotation.z = Math.cos(seconds * 1.1) * 0.36
        return
      }
      if (part.type === 'cameraHead') {
        part.head.rotation.y = Math.sin(seconds * 0.9) * 0.55
        return
      }
      if (part.userData?.anim === 'lineProduct') {
        part.position.copy(samplePath(record.group.userData.routePoints, seconds * 0.08 + part.userData.offset))
        part.position.y = 0.76
      }
      if (part.userData?.anim === 'beltProduct') {
        part.position.x = ((seconds * 0.56 + part.userData.offset) % 1) * 2.1 - 1.05
      }
      if (part.userData?.anim === 'dataFlow' && part.material) {
        part.material.opacity = 0.36 + pulse * 0.32
      }
      if (part.userData?.anim === 'sensorRipple' && part.material) {
        const scale = 1 + ((seconds * 0.72 + (part.userData.delay || 0)) % 1) * 0.86
        part.scale.setScalar(scale)
        part.material.opacity = Math.max(0.02, 0.22 - (scale - 1) * 0.18)
      }
      if (part.userData?.anim === 'plantPulse') part.scale.setScalar(1 + pulse * 0.02)
      if (part.userData?.anim === 'scanCone' && part.material) {
        part.material.opacity = this.activeMode === 'security' ? 0.16 + pulse * 0.08 : 0.05
      }
    })

    record.statusParts?.forEach((part) => {
      if (part.userData?.anim === 'statusLight' && part.material?.emissive) {
        const fault = device?.status === 'fault'
        part.material.emissiveIntensity = fault ? 0.65 + pulse * 1.3 : 0.46 + pulse * 0.42
      }
      if (part.userData?.anim === 'glowRing' && part.material) {
        const fault = device?.status === 'fault'
        part.material.opacity = (fault ? 0.28 : 0.12) + pulse * (fault ? 0.28 : 0.12)
      }
    })
  }

  emitLabels(time) {
    if (time - this.lastLabelAt < 140) return
    this.lastLabelAt = time
    const width = this.host.clientWidth || 1
    const height = this.host.clientHeight || 1
    const labels = []
    this.records.forEach((record) => {
      if (!record.device) return
      const important = record.id === this.selectedId || record.id === this.hoveredId || record.device.status === 'fault' || this.shouldHighlight(record)
      if (!important || labels.length >= 8) return
      const vector = new THREE.Vector3()
      record.group.getWorldPosition(vector)
      vector.y += record.labelOffset || 1.4
      vector.project(this.camera)
      if (vector.z < -1 || vector.z > 1) return
      labels.push({
        id: record.id,
        device: record.device,
        active: record.id === this.selectedId || record.id === this.hoveredId || this.shouldHighlight(record),
        x: (vector.x * 0.5 + 0.5) * width,
        y: (-vector.y * 0.5 + 0.5) * height,
      })
    })
    this.options.onLabels?.(labels)
  }

  dispose() {
    this.disposed = true
    cancelAnimationFrame(this.frameId)
    if (this.resizeFrame) cancelAnimationFrame(this.resizeFrame)
    this.resizeObserver?.disconnect()
    this.renderer.domElement.removeEventListener('pointermove', this.onPointerMove)
    this.renderer.domElement.removeEventListener('pointerleave', this.onPointerLeave)
    this.renderer.domElement.removeEventListener('click', this.onClick)
    this.controls?.dispose()
    this.clearSceneContent()
    this.renderer.dispose()
    if (this.renderer.domElement.parentNode) this.renderer.domElement.parentNode.removeChild(this.renderer.domElement)
  }
}
