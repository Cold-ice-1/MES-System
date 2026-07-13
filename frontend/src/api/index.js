import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10_000,
  headers: { Accept: 'application/json' },
})
const USE_MOCK_API = import.meta.env.VITE_MOCK_API === 'true'
const MAX_QUANTITY = 1_000_000

let devices = [
  { id: 1, name: 'CNC 加工中心 01', status: 'Running', total_run_time_minutes: 450, good_parts: 120, total_parts: 125 },
  { id: 2, name: 'CNC 车床 02', status: 'Idle', total_run_time_minutes: 200, good_parts: 50, total_parts: 50 },
  { id: 3, name: '注塑机 A01', status: 'Fault', total_run_time_minutes: 800, good_parts: 1500, total_parts: 1550 },
  { id: 4, name: '注塑机 A02', status: 'Running', total_run_time_minutes: 750, good_parts: 1400, total_parts: 1410 },
  { id: 5, name: 'AGV 搬运车 01', status: 'Running', total_run_time_minutes: 1200, good_parts: 0, total_parts: 0 },
  { id: 6, name: 'AGV 搬运车 02', status: 'Maintenance', total_run_time_minutes: 80, good_parts: 0, total_parts: 0 },
  { id: 7, name: '六轴机械臂 01', status: 'Running', total_run_time_minutes: 600, good_parts: 300, total_parts: 305 },
  { id: 8, name: '包装流水线 01', status: 'Offline', total_run_time_minutes: 30, good_parts: 0, total_parts: 0 },
]

let records = [
  { id: 1, equipment_id: 1, equipment_name: 'CNC 加工中心 01', work_order: 'WO-CNC-2301', target_qty: 150, actual_qty: 126, defect_qty: 3, record_time: new Date().toISOString() },
  { id: 2, equipment_id: 3, equipment_name: '注塑机 A01', work_order: 'WO-IM-1188', target_qty: 550, actual_qty: 520, defect_qty: 18, record_time: new Date().toISOString() },
  { id: 3, equipment_id: 8, equipment_name: '包装流水线 01', work_order: 'WO-PK-0907', target_qty: 900, actual_qty: 860, defect_qty: 7, record_time: new Date().toISOString() },
]

const response = (data) => Promise.resolve({ data })

export const getApiErrorMessage = (error, fallback = '请求失败，请稍后重试') => {
  const detail = error?.response?.data?.detail
  if (Array.isArray(detail)) return detail[0]?.msg || fallback
  if (typeof detail === 'string' && detail.trim()) return detail
  if (error?.code === 'ECONNABORTED') return '请求超时，请检查后端服务'
  if (!error?.response && !error?.request && error?.message) return error.message
  if (!error?.response) return '无法连接后端服务，请确认服务已启动'
  return fallback
}

export const getDevices = () => {
  if (USE_MOCK_API) return response(devices)
  return api.get('/equipment/')
}

export const changeState = (id, data) => {
  if (!USE_MOCK_API) return api.post(`/equipment/${id}/state-change`, data)
  if (!data.reason_code || !/^[A-Z][0-9]{2}-.{1,60}$/.test(data.reason_code)) {
    return Promise.reject(new Error('原因码格式无效'))
  }
  devices = devices.map((device) => device.id === id ? { ...device, status: data.new_status } : device)
  return response({ message: '状态变更成功' })
}

export const getEvents = (id) => {
  if (!USE_MOCK_API) return api.get(`/equipment/${id}/events`, { params: { limit: 100 } })
  return response([{ id: 1, equipment_id: id, old_status: 'Idle', new_status: 'Running', reason_code: 'P01', timestamp: new Date().toISOString() }])
}

export const reportProduction = (data) => {
  const payload = {
    equipment_id: Number(data.equipment_id),
    work_order: String(data.work_order || '').trim().toUpperCase(),
    target_qty: Number(data.target_qty),
    actual_qty: Number(data.actual_qty),
    defect_qty: Number(data.defect_qty || 0),
  }
  if (!USE_MOCK_API) return api.post('/production/report', payload)
  const device = devices.find((item) => item.id === payload.equipment_id)
  if (!device) return Promise.reject(new Error('设备不存在'))
  if (!/^[A-Z0-9][A-Z0-9._/-]{0,63}$/.test(payload.work_order)) {
    return Promise.reject(new Error('工单号格式无效'))
  }
  if (payload.target_qty <= 0 || payload.target_qty > MAX_QUANTITY) {
    return Promise.reject(new Error('计划数量超出允许范围'))
  }
  if (payload.actual_qty < 0 || payload.actual_qty > MAX_QUANTITY || payload.defect_qty < 0 || payload.defect_qty > payload.actual_qty) {
    return Promise.reject(new Error('报工数量无效'))
  }
  const record = {
    id: Date.now(),
    ...payload,
    equipment_name: device.name,
    record_time: new Date().toISOString(),
  }
  records = [record, ...records]
  if (device) {
    device.total_parts += Number(data.actual_qty || 0)
    device.good_parts += Math.max(Number(data.actual_qty || 0) - Number(data.defect_qty || 0), 0)
  }
  return response({ message: '报工成功' })
}

export const getRecords = () => {
  if (USE_MOCK_API) return response(records)
  return api.get('/production/records', { params: { limit: 200 } })
}
