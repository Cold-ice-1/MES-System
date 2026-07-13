import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  agvRoutes as mockAgvRoutes,
  alarms as mockAlarms,
  devices as mockDevices,
  energyStats as mockEnergyStats,
  environmentSensors as mockEnvironmentSensors,
  kpiSummary as mockKpiSummary,
  modeOptions,
  productionStats as mockProductionStats,
  productionLines as mockProductionLines,
  securityEvents as mockSecurityEvents,
  statusMeta,
  workOrders as mockWorkOrders,
} from '../data/factoryMock'
import type { DeviceStatus, FactoryDevice, FactoryMode } from '../types/factory'

export const useFactoryStore = defineStore('factoryDigitalTwin', () => {
  const activeMode = ref<FactoryMode>('overview')
  const selectedDeviceId = ref('inj-01')
  const tick = ref(0)

  const devices = ref(mockDevices.map((item) => ({ ...item })))
  const productionLines = ref(mockProductionLines)
  const agvRoutes = ref(mockAgvRoutes)
  const alarms = ref(mockAlarms)
  const securityEvents = ref(mockSecurityEvents)
  const environmentSensors = ref(mockEnvironmentSensors.map((item) => ({ ...item })))
  const workOrders = ref(mockWorkOrders)
  const baseKpiSummary = ref(mockKpiSummary)
  const baseProductionStats = ref(mockProductionStats)
  const baseEnergyStats = ref(mockEnergyStats)

  const selectedDevice = computed(() => devices.value.find((item) => item.id === selectedDeviceId.value) || devices.value[0])
  const selectedWorkOrders = computed(() => workOrders.value.filter((item) => item.deviceId === selectedDevice.value?.id))

  const statusCounts = computed<Record<DeviceStatus, number>>(() => {
    const counts: Record<DeviceStatus, number> = { running: 0, standby: 0, fault: 0, offline: 0 }
    devices.value.forEach((device) => {
      counts[device.status] += 1
    })
    return counts
  })

  const productionSummary = computed(() => {
    const totalParts = devices.value.reduce((sum, item) => sum + item.totalParts, 0)
    const goodParts = devices.value.reduce((sum, item) => sum + item.goodParts, 0)
    const defectParts = devices.value.reduce((sum, item) => sum + item.defectParts, 0)
    const avgOee = devices.value.length ? devices.value.reduce((sum, item) => sum + item.oee, 0) / devices.value.length : 0
    const qualityRate = totalParts ? (goodParts / totalParts) * 100 : 0
    const energy = devices.value.reduce((sum, item) => sum + item.energy, 0)

    return {
      totalDevices: devices.value.length,
      totalParts: totalParts + tick.value * 18,
      goodParts,
      defectParts,
      alarmCount: alarms.value.filter((item) => item.level !== 'info').length,
      oee: Number(avgOee.toFixed(1)),
      qualityRate: Number(qualityRate.toFixed(1)),
      energy: Number((energy + tick.value * 1.2).toFixed(1)),
      runningCount: statusCounts.value.running,
      faultCount: statusCounts.value.fault,
    }
  })

  const leftMetrics = computed(() => [
    { label: '总设备数', value: productionSummary.value.totalDevices, unit: '台', trend: '+2' },
    { label: '当日产量', value: productionSummary.value.totalParts, unit: '件', trend: '+8.6%' },
    { label: '报警数量', value: productionSummary.value.alarmCount, unit: '条', trend: '-1' },
    { label: 'OEE', value: productionSummary.value.oee, unit: '%', trend: '+1.8%' },
  ])

  const rightMetrics = computed(() => [
    { label: '排日产量', value: productionSummary.value.totalParts + 460, unit: '件' },
    { label: '能耗', value: productionSummary.value.energy, unit: 'kWh' },
    { label: '良率', value: productionSummary.value.qualityRate, unit: '%' },
    { label: '不良品', value: productionSummary.value.defectParts, unit: '件' },
  ])

  const modeDevices = computed(() => {
    if (activeMode.value === 'security') return devices.value.filter((item) => ['camera', 'access'].includes(item.type))
    if (activeMode.value === 'environment') return devices.value.filter((item) => ['sensor', 'cabinet'].includes(item.type))
    if (activeMode.value === 'equipment') return devices.value.filter((item) => ['cnc', 'injection', 'robot', 'agv', 'conveyor'].includes(item.type))
    if (activeMode.value === 'production') return devices.value.filter((item) => ['cnc', 'injection', 'robot', 'conveyor'].includes(item.type))
    return devices.value
  })

  const modeAlarms = computed(() => {
    const current = alarms.value.filter((item) => item.mode === activeMode.value)
    return current.length ? current : alarms.value
  })

  const statusSeries = computed(() => Object.entries(statusCounts.value).map(([status, value]) => ({
    name: statusMeta[status as DeviceStatus].label,
    value,
    itemStyle: { color: statusMeta[status as DeviceStatus].color },
  })))

  const productionSeries = computed(() => productionLines.value.map((line) => ({
    name: line.name,
    value: line.throughput + (tick.value % 6) * 18,
  })))

  const environmentSnapshot = computed(() => {
    const main = environmentSensors.value[0]
    return [
      { label: '温度', value: (main.temperature + Math.sin(tick.value / 4) * 0.3).toFixed(1), unit: '°C' },
      { label: '湿度', value: (main.humidity + Math.cos(tick.value / 5) * 0.4).toFixed(0), unit: '%' },
      { label: 'PM2.5', value: (main.pm25 + (tick.value % 4)).toFixed(0), unit: 'μg/m³' },
      { label: '噪声', value: (main.noise + Math.sin(tick.value / 3) * 1.2).toFixed(0), unit: 'dB' },
      { label: '电压', value: main.voltage.toFixed(0), unit: 'V' },
      { label: '功率', value: main.power.toFixed(0), unit: 'kW' },
    ]
  })

  const securitySummary = computed(() => ({
    onlineCameras: devices.value.filter((item) => item.type === 'camera' && item.status === 'running').length,
    accessState: devices.value.find((item) => item.type === 'access')?.status === 'fault' ? '异常' : '正常',
    intrusionAlerts: securityEvents.value.filter((item) => item.severity === 'critical').length,
    eventCount: securityEvents.value.length,
  }))

  const kpiSummary = computed(() => ({
    ...baseKpiSummary.value,
    oee: productionSummary.value.oee,
    todayOutput: productionSummary.value.totalParts,
    faultCount: productionSummary.value.faultCount,
    onlineDevices: devices.value.filter((item) => item.status !== 'offline').length,
    planCompletion: Number((baseKpiSummary.value.planCompletion + Math.sin(tick.value / 6) * 0.6).toFixed(1)),
  }))

  const productionStats = computed(() => ({
    ...baseProductionStats.value,
    shiftOutput: baseProductionStats.value.shiftOutput + tick.value * 8,
    throughput: baseProductionStats.value.throughput + (tick.value % 6) * 3,
    qualityRate: productionSummary.value.qualityRate,
    defectRate: Number((100 - productionSummary.value.qualityRate).toFixed(1)),
  }))

  const energyStats = computed(() => ({
    ...baseEnergyStats.value,
    todayEnergy: Number((baseEnergyStats.value.todayEnergy + tick.value * 1.8).toFixed(1)),
    peakPower: Number((baseEnergyStats.value.peakPower + Math.sin(tick.value / 4) * 8).toFixed(1)),
    savingRate: Number((baseEnergyStats.value.savingRate + Math.cos(tick.value / 7) * 0.3).toFixed(1)),
  }))

  function selectMode(mode: FactoryMode) {
    activeMode.value = mode
    const first = modeDevices.value[0]
    if (first) selectedDeviceId.value = first.id
  }

  function selectDevice(deviceId: string) {
    selectedDeviceId.value = deviceId
  }

  function tickRealtime() {
    tick.value += 1
  }

  return {
    activeMode,
    selectedDeviceId,
    devices,
    modeDevices,
    selectedDevice,
    selectedWorkOrders,
    productionLines,
    agvRoutes,
    alarms,
    modeAlarms,
    securityEvents,
    environmentSensors,
    modeOptions,
    statusSeries,
    productionSeries,
    statusCounts,
    productionSummary,
    leftMetrics,
    rightMetrics,
    environmentSnapshot,
    securitySummary,
    kpiSummary,
    productionStats,
    energyStats,
    selectMode,
    selectDevice,
    tickRealtime,
  }
})
