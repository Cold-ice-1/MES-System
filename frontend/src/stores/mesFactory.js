import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getDevices, getRecords } from '../api'

export const statusMeta = {
  Running: { label: '运行中', color: '#22c55e', type: 'success' },
  Idle: { label: '待机', color: '#f59e0b', type: 'warning' },
  Fault: { label: '故障', color: '#ef4444', type: 'danger' },
  Maintenance: { label: '维护中', color: '#64748b', type: 'info' },
  Offline: { label: '离线', color: '#94a3b8', type: 'info' },
}

const layout = [
  { id: 1, name: 'CNC 加工中心 01', type: 'cnc', line: '机加工区', position: [-5.2, 0, -2.6] },
  { id: 2, name: 'CNC 车床 02', type: 'cnc', line: '机加工区', position: [-2.8, 0, -2.6] },
  { id: 3, name: '注塑机 A01', type: 'injection', line: '注塑区', position: [1.2, 0, -2.5] },
  { id: 4, name: '注塑机 A02', type: 'injection', line: '注塑区', position: [4.0, 0, -2.5] },
  { id: 5, name: 'AGV 搬运车 01', type: 'agv', line: '物流通道', position: [-3.2, 0, 1.6] },
  { id: 6, name: 'AGV 搬运车 02', type: 'agv', line: '物流通道', position: [3.2, 0, 1.6] },
  { id: 7, name: '六轴机械臂 01', type: 'robot', line: '装配单元', position: [-0.6, 0, 2.9] },
  { id: 8, name: '包装流水线 01', type: 'conveyor', line: '包装区', position: [4.6, 0, 2.6] },
]

const fallbackDevices = layout.map((item, index) => ({
  ...item,
  status: ['Running', 'Idle', 'Fault', 'Running', 'Running', 'Maintenance', 'Running', 'Offline'][index],
  total_run_time_minutes: [450, 200, 800, 750, 1200, 80, 600, 30][index],
  good_parts: [120, 50, 1500, 1400, 0, 0, 300, 0][index],
  total_parts: [125, 50, 1550, 1410, 0, 0, 305, 0][index],
}))

const fallbackRecords = [
  { id: 101, equipment_id: 1, work_order: 'WO-CNC-2301', actual_qty: 126, defect_qty: 3 },
  { id: 102, equipment_id: 3, work_order: 'WO-IM-1188', actual_qty: 520, defect_qty: 18 },
  { id: 103, equipment_id: 8, work_order: 'WO-PK-0907', actual_qty: 860, defect_qty: 7 },
]

function mergeWithLayout(device) {
  const item = layout.find((entry) => entry.id === device.id)
  return {
    ...(item || {}),
    ...device,
    name: device.name || item?.name || `设备 ${device.id}`,
    type: item?.type || 'cnc',
    line: item?.line || '未分区',
    position: item?.position || [0, 0, 0],
  }
}

export const useMesFactoryStore = defineStore('mesFactory', () => {
  const equipment = ref([...fallbackDevices])
  const productionRecords = ref([...fallbackRecords])
  const selectedEquipmentId = ref(1)
  const realtimeTick = ref(0)

  const selectedEquipment = computed(() => equipment.value.find((item) => item.id === selectedEquipmentId.value) || equipment.value[0])
  const selectedRecords = computed(() => productionRecords.value.filter((item) => item.equipment_id === selectedEquipment.value?.id).slice(0, 5))

  const kpis = computed(() => {
    const totalParts = equipment.value.reduce((sum, item) => sum + Number(item.total_parts || 0), 0)
    const goodParts = equipment.value.reduce((sum, item) => sum + Number(item.good_parts || 0), 0)
    const runningCount = equipment.value.filter((item) => item.status === 'Running').length
    const faultCount = equipment.value.filter((item) => item.status === 'Fault').length
    const qualityRate = totalParts ? (goodParts / totalParts) * 100 : 0
    const availability = equipment.value.length ? (runningCount / equipment.value.length) * 100 : 0
    return {
      oee: Number(((availability * qualityRate * 0.92) / 100).toFixed(1)),
      totalParts,
      qualityRate: Number(qualityRate.toFixed(1)),
      faultCount,
    }
  })

  const statusDistribution = computed(() => Object.keys(statusMeta).map((status) => ({
    name: statusMeta[status].label,
    value: equipment.value.filter((item) => item.status === status).length,
    itemStyle: { color: statusMeta[status].color },
  })))

  const productionSeries = computed(() => equipment.value.map((item) => ({ name: item.name, value: item.total_parts || 0 })))

  async function loadFactoryData() {
    try {
      const [deviceResult, recordResult] = await Promise.all([getDevices(), getRecords()])
      equipment.value = deviceResult.data.map(mergeWithLayout)
      productionRecords.value = recordResult.data
    } catch {
      equipment.value = [...fallbackDevices]
      productionRecords.value = [...fallbackRecords]
    }
  }

  function selectEquipment(id) {
    selectedEquipmentId.value = id
  }

  function tickFactory() {
    realtimeTick.value += 1
    equipment.value = equipment.value.map((item) => {
      if (item.status !== 'Running') return item
      const output = item.type === 'injection' ? 9 : item.type === 'conveyor' ? 14 : 3
      return {
        ...item,
        total_run_time_minutes: Number(item.total_run_time_minutes || 0) + 1,
        total_parts: Number(item.total_parts || 0) + output,
        good_parts: Number(item.good_parts || 0) + Math.max(output - (realtimeTick.value % 9 === 0 ? 1 : 0), 0),
      }
    })
  }

  return {
    equipment,
    selectedEquipment,
    selectedRecords,
    kpis,
    statusDistribution,
    productionSeries,
    loadFactoryData,
    selectEquipment,
    tickFactory,
  }
})
