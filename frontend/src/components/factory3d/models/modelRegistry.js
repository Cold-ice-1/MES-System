export const modelPathByType = {
  cnc: '/models/cnc.glb',
  lathe: '/models/lathe.glb',
  injection: '/models/injection-machine.glb',
  robot: '/models/robot-arm.glb',
  agv: '/models/agv.glb',
  conveyor: '/models/conveyor.glb',
  camera: '/models/security-camera.glb',
  access: '/models/security-camera.glb',
  sensor: '/models/sensor.glb',
  cabinet: '/models/sensor.glb',
}

export function resolveModelType(device) {
  if (device.type === 'cnc' && /02|车|lathe/i.test(device.id + device.name)) return 'lathe'
  return device.type
}
