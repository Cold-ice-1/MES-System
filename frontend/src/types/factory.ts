export type FactoryMode = 'overview' | 'equipment' | 'security' | 'environment' | 'production'

export type DeviceStatus = 'running' | 'standby' | 'fault' | 'offline'

export type DeviceType =
  | 'cnc'
  | 'injection'
  | 'robot'
  | 'agv'
  | 'conveyor'
  | 'camera'
  | 'access'
  | 'sensor'
  | 'cabinet'

export interface Vector3Tuple {
  0: number
  1: number
  2: number
}

export interface FactoryDevice {
  id: string
  name: string
  type: DeviceType
  status: DeviceStatus
  zone: string
  lineId?: string
  position: Vector3Tuple
  rotation?: number
  runtimeMinutes: number
  totalParts: number
  goodParts: number
  defectParts: number
  oee: number
  energy: number
  alert?: string
}

export interface ProductionLine {
  id: string
  name: string
  zone: string
  points: Vector3Tuple[]
  throughput: number
  status: DeviceStatus
}

export interface AgvRoute {
  id: string
  name: string
  deviceId: string
  points: Vector3Tuple[]
}

export interface FactoryAlarm {
  id: string
  level: 'critical' | 'warning' | 'info'
  source: string
  message: string
  time: string
  mode: FactoryMode
}

export interface SecurityEvent {
  id: string
  type: string
  location: string
  message: string
  time: string
  severity: 'critical' | 'warning' | 'info'
}

export interface EnvironmentSensor {
  id: string
  name: string
  zone: string
  position: Vector3Tuple
  status: DeviceStatus
  temperature: number
  humidity: number
  pm25: number
  noise: number
  voltage: number
  current: number
  power: number
  energy: number
  smoke: boolean
  waterLeak: boolean
}

export interface WorkOrder {
  id: string
  deviceId: string
  product: string
  planQty: number
  actualQty: number
  defectQty: number
  progress: number
}

export interface KpiSummary {
  oee: number
  todayOutput: number
  faultCount: number
  onlineDevices: number
  planCompletion: number
}

export interface ProductionStats {
  shiftOutput: number
  taktTime: number
  throughput: number
  qualityRate: number
  defectRate: number
}

export interface EnergyStats {
  todayEnergy: number
  peakPower: number
  carbon: number
  savingRate: number
}
