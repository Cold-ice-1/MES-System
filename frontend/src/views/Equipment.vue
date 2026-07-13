<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import FactoryShell from '../layouts/FactoryShell.vue'
import PanelCard from '../components/factory/PanelCard.vue'
import { changeState, getApiErrorMessage, getDevices } from '../api'

const statusLabels = {
  All: '全部',
  Running: '运行中',
  Idle: '待机',
  Fault: '故障',
  Maintenance: '维护中',
  Offline: '离线',
}

const filterOptions = [
  { key: 'All', label: '全部' },
  { key: 'Running', label: '运行中' },
  { key: 'Idle', label: '待机' },
  { key: 'Fault', label: '故障' },
  { key: 'Offline', label: '离线' },
]

const devices = ref([])
const activeFilter = ref('All')
const dialogVisible = ref(false)
const current = ref(null)
const newStatus = ref('Running')
const reason = ref('')
const loading = ref(false)
const submitting = ref(false)

const filteredDevices = computed(() => {
  if (activeFilter.value === 'All') return devices.value
  return devices.value.filter((device) => device.status === activeFilter.value)
})

const statusCounts = computed(() => {
  return filterOptions.reduce((acc, item) => {
    acc[item.key] = item.key === 'All'
      ? devices.value.length
      : devices.value.filter((device) => device.status === item.key).length
    return acc
  }, {})
})

const loadData = async () => {
  loading.value = true
  try {
    devices.value = (await getDevices()).data
  } catch (error) {
    ElMessage.error(getApiErrorMessage(error, '设备数据加载失败'))
  } finally {
    loading.value = false
  }
}

const openDialog = (device) => {
  current.value = device
  newStatus.value = device.status
  reason.value = ''
  dialogVisible.value = true
}

const submitChange = async () => {
  if (!reason.value) {
    ElMessage.error('MES 拦截：必须选择原因码')
    return
  }
  submitting.value = true
  try {
    await changeState(current.value.id, { new_status: newStatus.value, reason_code: reason.value })
    ElMessage.success('设备状态已更新')
    dialogVisible.value = false
    await loadData()
  } catch (error) {
    ElMessage.error(getApiErrorMessage(error, error?.message || '设备状态更新失败'))
  } finally {
    submitting.value = false
  }
}

const getQualityRate = (device) => {
  if (!device.total_parts) return 'N/A'
  return `${((device.good_parts / device.total_parts) * 100).toFixed(1)}%`
}

const getOee = (device) => {
  if (!device.total_parts) return '--'
  const quality = device.good_parts / device.total_parts
  const availability = device.status === 'Running' ? 0.92 : device.status === 'Idle' ? 0.64 : 0.38
  return `${(quality * availability * 100).toFixed(1)}%`
}

const getArea = (device) => {
  if (device.name.includes('CNC') || device.name.includes('车床')) return '加工区'
  if (device.name.includes('注塑')) return '注塑区'
  if (device.name.includes('AGV')) return '物流区'
  if (device.name.includes('机械臂')) return '装配区'
  if (device.name.includes('包装')) return '包装区'
  return '生产区'
}

const getRecentInfo = (device) => {
  if (device.status === 'Fault') return '最近告警：主轴负载异常'
  if (device.status === 'Offline') return '当前离线：等待点检'
  if (device.status === 'Idle') return '工位状态：等待上料'
  if (device.status === 'Maintenance') return '维护计划：例行保养'
  return `工位区域：${getArea(device)}`
}

onMounted(loadData)
</script>

<template>
  <FactoryShell title="设备状态管理" subtitle="ISA-95 Equipment Management">
    <div class="equipment-page">
      <PanelCard class="toolbar-card">
        <div class="toolbar-copy">
          <span>Equipment Status Board</span>
          <h2>设备状态看板</h2>
        </div>
        <div class="filter-group" aria-label="设备状态筛选">
          <button
            v-for="item in filterOptions"
            :key="item.key"
            type="button"
            :class="{ active: activeFilter === item.key }"
            @click="activeFilter = item.key"
          >
            {{ item.label }}
            <strong>{{ statusCounts[item.key] || 0 }}</strong>
          </button>
        </div>
      </PanelCard>

      <div v-loading="loading" class="device-grid">
        <PanelCard
          v-for="device in filteredDevices"
          :key="device.id"
          class="device-card"
          :class="`status-${device.status}`"
          @click="openDialog(device)"
        >
          <div class="card-top">
            <span class="device-code">{{ String(device.id).padStart(3, '0') }}</span>
            <span class="status-pill" :class="device.status">
              <i></i>{{ statusLabels[device.status] || device.status }}
            </span>
          </div>

          <h3>{{ device.name }}</h3>

          <div class="metric-grid">
            <div>
              <span>运行时间</span>
              <strong>{{ device.total_run_time_minutes }} 分钟</strong>
            </div>
            <div>
              <span>累计产量</span>
              <strong>{{ device.total_parts }}</strong>
            </div>
            <div>
              <span>良品率</span>
              <strong>{{ getQualityRate(device) }}</strong>
            </div>
            <div>
              <span>OEE</span>
              <strong>{{ getOee(device) }}</strong>
            </div>
          </div>

          <footer>{{ getRecentInfo(device) }}</footer>
        </PanelCard>
      </div>

      <el-dialog
        v-model="dialogVisible"
        :title="`设备操作：${current?.name || ''}`"
        width="460px"
        class="factory-dialog"
      >
        <el-form label-width="88px">
          <el-form-item label="目标状态">
            <el-radio-group v-model="newStatus">
              <el-radio-button label="Running">运行</el-radio-button>
              <el-radio-button label="Idle">待机</el-radio-button>
              <el-radio-button label="Fault">故障</el-radio-button>
              <el-radio-button label="Offline">离线</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="原因码">
            <el-select v-model="reason" placeholder="请选择原因码" class="full-width">
              <el-option label="P01-正常开机" value="P01-正常开机" />
              <el-option label="F01-缺料停机" value="F01-缺料停机" />
              <el-option label="F02-设备报警" value="F02-设备报警" />
              <el-option label="M01-计划维护" value="M01-计划维护" />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="submitChange">确认变更</el-button>
        </template>
      </el-dialog>
    </div>
  </FactoryShell>
</template>

<style scoped>
.equipment-page {
  display: grid;
  gap: clamp(12px, 1vw, 18px);
  min-width: 0;
}

.toolbar-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding-block: 14px;
}

.toolbar-copy span,
.device-code,
.metric-grid span {
  color: var(--text-secondary);
  font-size: 12px;
}

h2,
h3 {
  margin: 0;
  color: var(--text-primary);
  letter-spacing: 0;
}

h2 {
  margin-top: 3px;
  font-size: clamp(17px, 1.1vw, 20px);
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.filter-group button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  padding: 0 12px;
  border: 1px solid var(--panel-border);
  border-radius: 999px;
  color: var(--text-secondary);
  background: var(--panel-bg-soft);
  cursor: pointer;
}

.filter-group button.active {
  border-color: var(--panel-border-strong);
  color: var(--text-primary);
  background: color-mix(in srgb, var(--accent-blue) 14%, transparent);
}

.filter-group strong {
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}

.device-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  align-items: stretch;
  min-width: 0;
}

.device-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 205px;
  height: auto;
  max-height: none;
  padding: 16px 16px 18px;
  overflow: visible;
  cursor: pointer;
}

.device-card::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  border-radius: 10px 0 0 10px;
  background: var(--info);
}

.device-card.status-Running::before {
  background: var(--success);
}

.device-card.status-Idle::before {
  background: var(--warning);
}

.device-card.status-Fault {
  border-color: color-mix(in srgb, var(--danger) 42%, var(--panel-border));
}

.device-card.status-Fault::before {
  background: var(--danger);
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
}

h3 {
  overflow: hidden;
  font-size: 16px;
  font-weight: 650;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  min-height: 24px;
  padding: 0 9px;
  border-radius: 999px;
  color: var(--text-secondary);
  background: var(--panel-bg-soft);
  font-size: 12px;
}

.status-pill i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--info);
}

.status-pill.Running i {
  background: var(--success);
}

.status-pill.Idle i {
  background: var(--warning);
}

.status-pill.Fault i {
  background: var(--danger);
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px 12px;
}

.metric-grid div {
  min-width: 0;
  padding: 8px 10px;
  border-radius: 8px;
  background: var(--panel-bg-soft);
}

.metric-grid strong {
  display: block;
  margin-top: 2px;
  overflow: hidden;
  color: var(--text-primary);
  font-size: 14px;
  font-variant-numeric: tabular-nums;
  text-overflow: ellipsis;
  white-space: nowrap;
}

footer {
  margin-top: auto;
  padding-top: 2px;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.45;
}

.full-width {
  width: 100%;
}

@media (max-width: 760px) {
  .toolbar-card {
    align-items: flex-start;
    flex-direction: column;
  }

  .filter-group {
    justify-content: flex-start;
  }

  .device-grid {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  }
}
</style>
