import type {
  AgvRoute,
  EnvironmentSensor,
  FactoryAlarm,
  FactoryDevice,
  FactoryMode,
  EnergyStats,
  KpiSummary,
  ProductionLine,
  ProductionStats,
  SecurityEvent,
  WorkOrder,
} from '../types/factory'

export const statusMeta = {
  running: { label: '运行中', color: '#26f5a6', panelColor: '#00e096', tag: 'success' },
  standby: { label: '待机', color: '#ffb020', panelColor: '#ffb020', tag: 'warning' },
  fault: { label: '故障', color: '#ff4d5e', panelColor: '#ff4d5e', tag: 'danger' },
  offline: { label: '离线', color: '#8b9bb4', panelColor: '#8b9bb4', tag: 'info' },
} as const

export const modeOptions: Array<{ key: FactoryMode; label: string; description: string }> = [
  { key: 'overview', label: '全局总览', description: '整厂 OEE、产线状态、关键 KPI' },
  { key: 'equipment', label: '设备监测', description: 'CNC、注塑机、AGV、流水线' },
  { key: 'security', label: '安防监测', description: '摄像头、门禁、危险区域告警' },
  { key: 'environment', label: '动环监测', description: '温湿度、能耗、烟感、水浸' },
  { key: 'production', label: '生产监测', description: '产量、节拍、工单、良率' },
]

export const kpiSummary: KpiSummary = {
  oee: 86.7,
  todayOutput: 11150,
  faultCount: 2,
  onlineDevices: 11,
  planCompletion: 92.4,
}

export const productionStats: ProductionStats = {
  shiftOutput: 4580,
  taktTime: 18.6,
  throughput: 286,
  qualityRate: 97.6,
  defectRate: 2.4,
}

export const energyStats: EnergyStats = {
  todayEnergy: 2784,
  peakPower: 428,
  carbon: 1.86,
  savingRate: 7.8,
}

export const productionLines: ProductionLine[] = [
  {
    id: 'line-machining',
    name: '机加工生产线',
    zone: '加工区',
    points: [[-7.8, 0.06, -2.8], [-5.6, 0.06, -2.8], [-3.3, 0.06, -2.8], [-1.0, 0.06, -2.2]],
    throughput: 1280,
    status: 'running',
  },
  {
    id: 'line-injection',
    name: '注塑成型线',
    zone: '注塑区',
    points: [[-0.4, 0.06, -2.0], [1.9, 0.06, -2.0], [4.2, 0.06, -2.0], [6.6, 0.06, -1.6]],
    throughput: 2460,
    status: 'fault',
  },
  {
    id: 'line-assembly',
    name: '装配包装线',
    zone: '装配区',
    points: [[-4.8, 0.06, 2.2], [-1.6, 0.06, 2.2], [1.8, 0.06, 2.3], [5.8, 0.06, 2.5]],
    throughput: 3120,
    status: 'running',
  },
]

export const devices: FactoryDevice[] = [
  { id: 'cnc-01', name: 'CNC 加工中心 01', type: 'cnc', status: 'running', zone: '加工区', lineId: 'line-machining', position: [-6.7, 0, -3.35], runtimeMinutes: 1460, totalParts: 1180, goodParts: 1152, defectParts: 28, oee: 88.6, energy: 152 },
  { id: 'cnc-02', name: 'CNC 车削单元 02', type: 'cnc', status: 'standby', zone: '加工区', lineId: 'line-machining', position: [-4.2, 0, -3.35], runtimeMinutes: 980, totalParts: 760, goodParts: 748, defectParts: 12, oee: 76.4, energy: 118 },
  { id: 'inj-01', name: '注塑机 A01', type: 'injection', status: 'fault', zone: '注塑区', lineId: 'line-injection', position: [1.1, 0, -3.15], runtimeMinutes: 1840, totalParts: 2260, goodParts: 2180, defectParts: 80, oee: 62.8, energy: 284, alert: '液压压力异常' },
  { id: 'inj-02', name: '注塑机 A02', type: 'injection', status: 'running', zone: '注塑区', lineId: 'line-injection', position: [4.3, 0, -3.05], runtimeMinutes: 1730, totalParts: 2410, goodParts: 2388, defectParts: 22, oee: 91.2, energy: 276 },
  { id: 'robot-01', name: '六轴机械臂 R01', type: 'robot', status: 'running', zone: '装配区', lineId: 'line-assembly', position: [-0.8, 0, 1.55], runtimeMinutes: 1340, totalParts: 1380, goodParts: 1369, defectParts: 11, oee: 89.3, energy: 96 },
  { id: 'conv-01', name: '包装流水线 P01', type: 'conveyor', status: 'running', zone: '包装区', lineId: 'line-assembly', position: [4.3, 0, 1.75], runtimeMinutes: 1225, totalParts: 3180, goodParts: 3144, defectParts: 36, oee: 92.5, energy: 88 },
  { id: 'agv-01', name: 'AGV 搬运车 01', type: 'agv', status: 'running', zone: '物流通道', position: [-4.6, 0, 0.15], runtimeMinutes: 1680, totalParts: 0, goodParts: 0, defectParts: 0, oee: 86.1, energy: 42 },
  { id: 'agv-02', name: 'AGV 搬运车 02', type: 'agv', status: 'standby', zone: '物流通道', position: [3.6, 0, 0.55], runtimeMinutes: 740, totalParts: 0, goodParts: 0, defectParts: 0, oee: 73.4, energy: 35 },
  { id: 'cam-01', name: '入口安防摄像头', type: 'camera', status: 'running', zone: '安防区', position: [-8.2, 0, 3.7], runtimeMinutes: 4320, totalParts: 0, goodParts: 0, defectParts: 0, oee: 99.2, energy: 8 },
  { id: 'cam-02', name: '仓储区摄像头', type: 'camera', status: 'running', zone: '仓储区', position: [7.4, 0, 3.5], runtimeMinutes: 4320, totalParts: 0, goodParts: 0, defectParts: 0, oee: 98.8, energy: 8 },
  { id: 'door-01', name: '危险区门禁', type: 'access', status: 'fault', zone: '安防区', position: [-7.9, 0, 1.85], runtimeMinutes: 890, totalParts: 0, goodParts: 0, defectParts: 0, oee: 58.2, energy: 5, alert: '门禁异常开启' },
  { id: 'env-01', name: '动环传感器 E01', type: 'sensor', status: 'running', zone: '动环区', position: [7.5, 0, -3.45], runtimeMinutes: 4320, totalParts: 0, goodParts: 0, defectParts: 0, oee: 97.5, energy: 4 },
  { id: 'cab-01', name: '主电控柜 C01', type: 'cabinet', status: 'running', zone: '动环区', position: [7.6, 0, -0.7], runtimeMinutes: 4320, totalParts: 0, goodParts: 0, defectParts: 0, oee: 95.4, energy: 44 },
]

export const agvRoutes: AgvRoute[] = [
  {
    id: 'agv-route-01',
    name: '物料配送循环线',
    deviceId: 'agv-01',
    points: [[-6.4, 0, 0.25], [-2.6, 0, 0.25], [0.6, 0, 0.6], [4.8, 0, 0.6], [6.4, 0, 2.8], [-6.2, 0, 2.8]],
  },
  {
    id: 'agv-route-02',
    name: '包装入库循环线',
    deviceId: 'agv-02',
    points: [[4.2, 0, 0.4], [6.6, 0, 0.9], [7.2, 0, 3.0], [3.0, 0, 3.0]],
  },
]

export const environmentSensors: EnvironmentSensor[] = [
  { id: 'env-01', name: '动环传感器 E01', zone: '动环区', position: [7.5, 0, -3.45], status: 'running', temperature: 26.8, humidity: 48, pm25: 22, noise: 61, voltage: 380, current: 126, power: 82, energy: 1240, smoke: false, waterLeak: false },
  { id: 'env-02', name: '仓储温湿度 E02', zone: '仓储区', position: [6.8, 0, 3.2], status: 'running', temperature: 24.1, humidity: 52, pm25: 18, noise: 54, voltage: 220, current: 34, power: 12, energy: 420, smoke: false, waterLeak: false },
  { id: 'env-03', name: '注塑烟感 E03', zone: '注塑区', position: [5.8, 0, -3.7], status: 'standby', temperature: 29.4, humidity: 44, pm25: 36, noise: 67, voltage: 220, current: 18, power: 8, energy: 260, smoke: false, waterLeak: false },
]

export const alarms: FactoryAlarm[] = [
  { id: 'a-001', level: 'critical', source: '注塑机 A01', message: '液压压力异常，建议停机检查', time: '09:42:18', mode: 'equipment' },
  { id: 'a-002', level: 'critical', source: '危险区门禁', message: '门禁异常开启，已触发安防联动', time: '09:46:03', mode: 'security' },
  { id: 'a-003', level: 'warning', source: '注塑区 E03', message: 'PM2.5 接近阈值，排风系统升档', time: '09:48:55', mode: 'environment' },
  { id: 'a-004', level: 'info', source: 'AGV 01', message: '物料配送任务完成', time: '09:50:21', mode: 'overview' },
  { id: 'a-005', level: 'warning', source: '包装流水线 P01', message: '节拍波动超过阈值，已自动调整速度', time: '09:53:36', mode: 'production' },
]

export const securityEvents: SecurityEvent[] = [
  { id: 's-001', type: '摄像头', location: '入口', message: '人员进入检测正常', time: '09:51:05', severity: 'info' },
  { id: 's-002', type: '门禁', location: '危险区', message: '未授权开门模拟告警', time: '09:46:03', severity: 'critical' },
  { id: 's-003', type: '视频巡检', location: '仓储区', message: '货架通道无遮挡', time: '09:43:12', severity: 'info' },
]

export const workOrders: WorkOrder[] = [
  { id: 'WO-CNC-2301', deviceId: 'cnc-01', product: '轴承座', planQty: 1500, actualQty: 1180, defectQty: 28, progress: 78 },
  { id: 'WO-IM-1188', deviceId: 'inj-01', product: '控制器外壳', planQty: 2800, actualQty: 2260, defectQty: 80, progress: 81 },
  { id: 'WO-PK-0907', deviceId: 'conv-01', product: '成品包装', planQty: 3500, actualQty: 3180, defectQty: 36, progress: 91 },
]
