export function disposeObject3D(object) {
  if (!object) return
  object.traverse((child) => {
    child.geometry?.dispose?.()
    if (Array.isArray(child.material)) {
      child.material.forEach((material) => material?.dispose?.())
    } else {
      child.material?.dispose?.()
    }
  })
}

export function removeAndDispose(scene, object) {
  if (!object) return
  scene?.remove(object)
  disposeObject3D(object)
}
