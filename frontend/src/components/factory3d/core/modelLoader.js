import { markRaw } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { modelPathByType, resolveModelType } from '../models/modelRegistry'

const loader = new GLTFLoader()
const existenceCache = new Map()
const gltfCache = new Map()

async function modelExists(url) {
  if (existenceCache.has(url)) return existenceCache.get(url)
  const result = fetch(url, { method: 'HEAD', cache: 'no-store' })
    .then((response) => {
      const type = response.headers.get('content-type') || ''
      return response.ok && !type.includes('text/html')
    })
    .catch(() => false)
  existenceCache.set(url, result)
  return result
}

function loadGltf(url) {
  if (gltfCache.has(url)) return gltfCache.get(url)
  const promise = new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject)
  })
  gltfCache.set(url, promise)
  return promise
}

function normalizeImportedModel(root, device) {
  const box = new THREE.Box3().setFromObject(root)
  const size = new THREE.Vector3()
  box.getSize(size)
  const maxAxis = Math.max(size.x, size.y, size.z) || 1
  root.scale.multiplyScalar(1.55 / maxAxis)
  root.position.set(...device.position)
  root.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = false
      child.receiveShadow = false
      child.userData.selectable = true
    }
  })
  return root
}

export async function createDeviceModelWithFallback(device, fallbackFactory, options = {}) {
  const modelType = resolveModelType(device)
  const url = modelPathByType[modelType]
  if (url && await modelExists(url)) {
    try {
      const gltf = await loadGltf(url)
      const root = markRaw(gltf.scene.clone(true))
      normalizeImportedModel(root, device)
      return fallbackFactory(device, { importedRoot: root, imported: true, theme: options.theme })
    } catch (error) {
      console.warn(`Failed to load ${url}, using procedural fallback.`, error)
    }
  }
  return fallbackFactory(device, { imported: false, theme: options.theme })
}
