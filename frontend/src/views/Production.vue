<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import FactoryShell from '../layouts/FactoryShell.vue'
import PanelCard from '../components/factory/PanelCard.vue'
import { getApiErrorMessage, getDevices, getRecords, reportProduction } from '../api'
import { formatTime } from '../utils/config'

const devices = ref([])
const records = ref([])
const loading = ref(false)
const submitting = ref(false)
const form = ref({
  equipment_id: '',
  equipment_name: '',
  work_order: '',
  target_qty: 100,
  actual_qty: 100,
  defect_qty: 0,
})

const formYield = computed(() => {
  const actual = Number(form.value.actual_qty || 0)
  const defect = Number(form.value.defect_qty || 0)
  if (!actual) return 0
  return Math.max(((actual - defect) / actual) * 100, 0)
})

const isToday = (value) => {
  const date = new Date(value)
  const now = new Date()
  return !Number.isNaN(date.getTime())
    && date.getFullYear() === now.getFullYear()
    && date.getMonth() === now.getMonth()
    && date.getDate() === now.getDate()
}

const todayRecords = computed(() => records.value.filter((item) => isToday(item.record_time)))
const todayActual = computed(() => todayRecords.value.reduce((sum, item) => sum + Number(item.actual_qty || 0), 0))
const todayDefect = computed(() => todayRecords.value.reduce((sum, item) => sum + Number(item.defect_qty || 0), 0))
const avgYield = computed(() => {
  if (!todayActual.value) return 0
  return ((todayActual.value - todayDefect.value) / todayActual.value) * 100
})
const activeOrders = computed(() => new Set(todayRecords.value.map((item) => item.work_order)).size)

const latestRecord = computed(() => records.value[0])

const loadData = async () => {
  loading.value = true
  try {
    const [deviceResponse, recordResponse] = await Promise.all([getDevices(), getRecords()])
    devices.value = deviceResponse.data
    records.value = recordResponse.data
  } catch (error) {
    ElMessage.error(getApiErrorMessage(error, '报工数据加载失败'))
  } finally {
    loading.value = false
  }
}

const onDeviceChange = (id) => {
  const device = devices.value.find((item) => item.id === id)
  if (device) form.value.equipment_name = device.name
}

const submitReport = async () => {
  if (!form.value.equipment_id || !form.value.work_order) {
    ElMessage.warning('请完善报工信息')
    return
  }
  if (Number(form.value.defect_qty) > Number(form.value.actual_qty)) {
    ElMessage.warning('不良数量不能大于实际数量')
    return
  }
  if (!/^[A-Za-z0-9][A-Za-z0-9._/-]{0,63}$/.test(form.value.work_order.trim())) {
    ElMessage.warning('工单号仅支持字母、数字、点、下划线、斜杠和连字符')
    return
  }
  submitting.value = true
  try {
    await reportProduction(form.value)
    ElMessage.success('报工成功')
    form.value = {
      equipment_id: '',
      equipment_name: '',
      work_order: '',
      target_qty: 100,
      actual_qty: 100,
      defect_qty: 0,
    }
    await loadData()
  } catch (error) {
    ElMessage.error(getApiErrorMessage(error, error?.message || '报工提交失败'))
  } finally {
    submitting.value = false
  }
}

const getYield = (record) => {
  if (!record.actual_qty) return 0
  return ((record.actual_qty - record.defect_qty) / record.actual_qty) * 100
}

onMounted(loadData)
</script>

<template>
  <FactoryShell title="生产报工管理" subtitle="Production Reporting">
    <div v-loading="loading" class="production-page">
      <PanelCard class="form-card">
        <div class="panel-title">
          <span>Production Form</span>
          <h2>生产报工</h2>
        </div>

        <div class="work-order-strip">
          <div>
            <span>当前良品率</span>
            <strong>{{ formYield.toFixed(1) }}%</strong>
          </div>
          <div>
            <span>计划完成</span>
            <strong>{{ form.target_qty ? Math.min((form.actual_qty / form.target_qty) * 100, 999).toFixed(1) : 0 }}%</strong>
          </div>
        </div>

        <el-form class="report-form" :model="form" label-position="top">
          <el-form-item label="选择设备" class="span-2">
            <el-select v-model="form.equipment_id" placeholder="请选择设备" @change="onDeviceChange">
              <el-option v-for="device in devices" :key="device.id" :label="device.name" :value="device.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="工单号" class="span-2">
            <el-input v-model="form.work_order" maxlength="64" placeholder="例如：WO-CNC-2301" />
          </el-form-item>
          <el-form-item label="计划数量">
            <el-input-number v-model="form.target_qty" :min="1" :max="1000000" controls-position="right" />
          </el-form-item>
          <el-form-item label="实际数量">
            <el-input-number v-model="form.actual_qty" :min="0" :max="1000000" controls-position="right" />
          </el-form-item>
          <el-form-item label="不良数量">
            <el-input-number v-model="form.defect_qty" :min="0" :max="form.actual_qty" controls-position="right" />
          </el-form-item>
          <el-form-item label="良品率">
            <el-input :model-value="`${formYield.toFixed(1)}%`" disabled />
          </el-form-item>
          <el-form-item class="submit-row span-2">
            <el-button type="primary" :loading="submitting" @click="submitReport">提交报工</el-button>
          </el-form-item>
        </el-form>
      </PanelCard>

      <div class="right-stack">
        <div class="stats-grid">
          <PanelCard class="stat-card">
            <span>今日报工产量</span>
            <strong>{{ todayActual }}</strong>
          </PanelCard>
          <PanelCard class="stat-card">
            <span>不良数量</span>
            <strong class="danger">{{ todayDefect }}</strong>
          </PanelCard>
          <PanelCard class="stat-card">
            <span>平均良品率</span>
            <strong class="success">{{ avgYield.toFixed(1) }}%</strong>
          </PanelCard>
          <PanelCard class="stat-card">
            <span>活跃工单</span>
            <strong>{{ activeOrders }}</strong>
          </PanelCard>
        </div>

        <PanelCard class="order-card">
          <div class="panel-title inline-title">
            <div>
              <span>Current Work Order</span>
              <h2>当前工单信息</h2>
            </div>
            <strong v-if="latestRecord">{{ latestRecord.work_order }}</strong>
          </div>
          <div v-if="latestRecord" class="order-info">
            <div><span>设备</span><strong>{{ latestRecord.equipment_name }}</strong></div>
            <div><span>实际产量</span><strong>{{ latestRecord.actual_qty }}</strong></div>
            <div><span>不良品</span><strong>{{ latestRecord.defect_qty }}</strong></div>
            <div><span>报工时间</span><strong>{{ formatTime(latestRecord.record_time) }}</strong></div>
          </div>
          <p v-else class="empty">暂无报工记录</p>
        </PanelCard>

        <PanelCard class="records-card">
          <div class="panel-title">
            <span>Report Records</span>
            <h2>今日报工记录</h2>
          </div>
          <el-table :data="todayRecords" class="factory-table" height="100%">
            <el-table-column prop="work_order" label="工单号" min-width="130" />
            <el-table-column prop="equipment_name" label="设备" min-width="150" />
            <el-table-column prop="actual_qty" label="实际产量" width="96" />
            <el-table-column prop="defect_qty" label="不良品" width="88" />
            <el-table-column label="良品率" width="96">
              <template #default="scope">
                <el-tag :type="getYield(scope.row) > 95 ? 'success' : 'danger'">
                  {{ getYield(scope.row).toFixed(1) }}%
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="record_time" label="报工时间" min-width="160" :formatter="(row) => formatTime(row.record_time)" />
          </el-table>
        </PanelCard>
      </div>
    </div>
  </FactoryShell>
</template>

<style scoped>
.production-page {
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(320px, 0.42fr) minmax(0, 1fr);
  gap: clamp(12px, 1vw, 18px);
}

.form-card,
.right-stack,
.records-card {
  min-height: 0;
}

.panel-title {
  margin-bottom: 14px;
}

.panel-title span,
.work-order-strip span,
.stat-card span,
.order-info span,
.empty {
  color: var(--text-secondary);
  font-size: 12px;
}

h2 {
  margin: 3px 0 0;
  color: var(--text-primary);
  font-size: 18px;
  letter-spacing: 0;
}

.work-order-strip {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}

.work-order-strip div,
.order-info div {
  padding: 12px;
  border: 1px solid var(--panel-border);
  border-radius: 10px;
  background: var(--panel-bg-soft);
}

.work-order-strip strong {
  display: block;
  margin-top: 4px;
  color: var(--accent);
  font-size: 22px;
  font-variant-numeric: tabular-nums;
}

.report-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2px 12px;
}

.span-2 {
  grid-column: span 2;
}

.submit-row {
  margin-top: 6px;
}

.submit-row :deep(.el-button) {
  width: 100%;
  min-height: 38px;
}

.right-stack {
  display: grid;
  grid-template-rows: auto auto minmax(260px, 1fr);
  gap: clamp(12px, 1vw, 18px);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.stat-card {
  padding: 14px;
}

.stat-card strong {
  display: block;
  margin-top: 6px;
  color: var(--text-primary);
  font-size: clamp(22px, 1.6vw, 30px);
  font-variant-numeric: tabular-nums;
}

.stat-card .success {
  color: var(--success);
}

.stat-card .danger {
  color: var(--danger);
}

.inline-title {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.inline-title > strong {
  color: var(--accent-blue);
  font-size: 14px;
}

.order-info {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.order-info strong {
  display: block;
  margin-top: 5px;
  overflow: hidden;
  color: var(--text-primary);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.records-card {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}

.factory-table {
  min-height: 0;
}

@media (max-width: 1180px) {
  .production-page {
    grid-template-columns: 1fr;
  }

  .stats-grid,
  .order-info {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .report-form,
  .work-order-strip,
  .stats-grid,
  .order-info {
    grid-template-columns: 1fr;
  }

  .span-2 {
    grid-column: auto;
  }
}
</style>
