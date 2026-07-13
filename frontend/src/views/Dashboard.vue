<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import FactoryShell from '../layouts/FactoryShell.vue'
import MetricCard from '../components/factory/MetricCard.vue'
import PanelCard from '../components/factory/PanelCard.vue'
import { getApiErrorMessage, getDevices } from '../api'
import { statusColors, statusMap } from '../utils/config'
import { useFactoryStore } from '../stores/factoryStore'
import { useTheme } from '../composables/useTheme'

const store = useFactoryStore()
const { theme } = useTheme()
const devices = ref([])
const pieRef = ref(null)
const barRef = ref(null)
const oeeRef = ref(null)
const outputRef = ref(null)
let pieChart
let barChart
let oeeChart
let outputChart
let initFrame = 0

const statusCounts = computed(() => {
  const counts = {}
  devices.value.forEach((device) => {
    counts[device.status] = (counts[device.status] || 0) + 1
  })
  return counts
})

const faultDevices = computed(() => devices.value.filter((device) => String(device.status).toLowerCase() === 'fault'))
const todayTotal = computed(() => devices.value.reduce((sum, item) => sum + Number(item.total_parts || 0), 0))

const productionEvents = computed(() => {
  const source = store.modeAlarms.length ? store.modeAlarms : []
  return source.slice(0, 6).map((item) => ({
    id: item.id,
    time: item.time,
    source: item.source,
    type: item.level === 'critical' ? '告警' : item.level === 'warning' ? '预警' : '事件',
    message: item.message,
    status: item.level === 'critical' ? '待处理' : item.level === 'warning' ? '跟踪中' : '已记录',
    level: item.level,
  }))
})

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function chartTokens() {
  return {
    text: cssVar('--text-primary'),
    muted: cssVar('--text-secondary'),
    grid: cssVar('--chart-grid'),
    axis: cssVar('--chart-axis'),
    tooltipBg: cssVar('--tooltip-bg'),
    tooltipBorder: cssVar('--tooltip-border'),
    accent: cssVar('--accent'),
    blue: cssVar('--accent-blue'),
  }
}

function qualityRate(device) {
  const total = Number(device.total_parts || 0)
  if (!total) return 0
  return Number(((Number(device.good_parts || 0) / total) * 100).toFixed(1))
}

function hasChartSize() {
  return [pieRef.value, barRef.value, oeeRef.value, outputRef.value].every((item) => item?.clientWidth && item?.clientHeight)
}

function initChartsWhenReady() {
  if (!hasChartSize()) {
    initFrame = requestAnimationFrame(initChartsWhenReady)
    return
  }
  pieChart = echarts.init(pieRef.value)
  barChart = echarts.init(barRef.value)
  oeeChart = echarts.init(oeeRef.value)
  outputChart = echarts.init(outputRef.value)
  renderCharts()
}

function axisStyle(tokens) {
  return {
    axisLine: { lineStyle: { color: tokens.axis } },
    axisTick: { show: false },
    axisLabel: { color: tokens.muted },
    splitLine: { lineStyle: { color: tokens.grid } },
  }
}

function tooltipStyle(tokens) {
  return {
    backgroundColor: tokens.tooltipBg,
    borderColor: tokens.tooltipBorder,
    textStyle: { color: tokens.text },
  }
}

function renderCharts() {
  if (!pieChart || !barChart || !oeeChart || !outputChart) return
  const tokens = chartTokens()
  const tooltip = tooltipStyle(tokens)
  const axis = axisStyle(tokens)
  const statusData = Object.keys(statusCounts.value).map((key) => ({
    name: statusMap[key] || key,
    value: statusCounts.value[key],
    itemStyle: { color: statusColors[key] || tokens.muted },
  }))

  pieChart.setOption({
    backgroundColor: 'transparent',
    textStyle: { color: tokens.text },
    tooltip: { trigger: 'item', ...tooltip },
    legend: { bottom: 0, textStyle: { color: tokens.muted } },
    series: [{
      type: 'pie',
      radius: ['48%', '70%'],
      center: ['50%', '44%'],
      label: { color: tokens.text },
      data: statusData,
    }],
  }, true)

  barChart.setOption({
    backgroundColor: 'transparent',
    textStyle: { color: tokens.text },
    tooltip,
    legend: { top: 0, textStyle: { color: tokens.muted } },
    grid: { left: 42, right: 42, top: 48, bottom: 56 },
    xAxis: {
      type: 'category',
      data: devices.value.map((device) => device.name),
      axisLabel: { color: tokens.muted, rotate: 24, interval: 0 },
      axisLine: axis.axisLine,
      axisTick: { show: false },
    },
    yAxis: [
      { type: 'value', name: '产量', nameTextStyle: { color: tokens.muted }, ...axis },
      { type: 'value', name: '良率(%)', max: 100, nameTextStyle: { color: tokens.muted }, ...axis },
    ],
    series: [
      {
        name: '累计产量',
        type: 'bar',
        data: devices.value.map((device) => Number(device.total_parts || 0)),
        itemStyle: { color: tokens.blue, borderRadius: [4, 4, 0, 0] },
      },
      {
        name: '良品率',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: devices.value.map(qualityRate),
        itemStyle: { color: tokens.accent },
      },
    ],
  }, true)

  oeeChart.setOption({
    backgroundColor: 'transparent',
    textStyle: { color: tokens.text },
    tooltip,
    grid: { left: 42, right: 20, top: 28, bottom: 34 },
    xAxis: { type: 'category', data: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'], ...axis },
    yAxis: { type: 'value', min: 60, max: 100, ...axis },
    series: [{
      type: 'line',
      smooth: true,
      areaStyle: { color: 'rgba(38, 245, 166, 0.12)' },
      lineStyle: { color: tokens.accent, width: 2 },
      data: [78, 81, 83, store.kpiSummary.oee - 1, store.kpiSummary.oee, store.kpiSummary.oee + 0.8],
    }],
  }, true)

  outputChart.setOption({
    backgroundColor: 'transparent',
    textStyle: { color: tokens.text },
    tooltip,
    grid: { left: 42, right: 20, top: 28, bottom: 34 },
    xAxis: { type: 'category', data: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'], ...axis },
    yAxis: { type: 'value', ...axis },
    series: [{
      type: 'bar',
      data: [820, 1280, 1860, 2640, 3560, Math.max(todayTotal.value, 4200)],
      itemStyle: { color: tokens.blue, borderRadius: [4, 4, 0, 0] },
    }],
  }, true)
}

function resizeCharts() {
  pieChart?.resize()
  barChart?.resize()
  oeeChart?.resize()
  outputChart?.resize()
}

onMounted(async () => {
  try {
    devices.value = (await getDevices()).data
  } catch (error) {
    ElMessage.error(getApiErrorMessage(error, '综合看板数据加载失败'))
  }
  await nextTick()
  initFrame = requestAnimationFrame(initChartsWhenReady)
  window.addEventListener('resize', resizeCharts)
})

watch(theme, async () => {
  await nextTick()
  renderCharts()
  resizeCharts()
})

onBeforeUnmount(() => {
  if (initFrame) cancelAnimationFrame(initFrame)
  window.removeEventListener('resize', resizeCharts)
  pieChart?.dispose()
  barChart?.dispose()
  oeeChart?.dispose()
  outputChart?.dispose()
})
</script>

<template>
  <FactoryShell title="MES 综合数据看板" subtitle="Manufacturing Dashboard">
    <div class="dashboard-page">
      <div class="metrics-row">
        <MetricCard label="全厂 OEE" :value="store.kpiSummary.oee" unit="%" tone="green" />
        <MetricCard label="当日产量" :value="store.kpiSummary.todayOutput" unit="件" />
        <MetricCard label="故障数量" :value="store.kpiSummary.faultCount" unit="台" tone="red" />
        <MetricCard label="在线设备" :value="store.kpiSummary.onlineDevices" unit="台" />
      </div>

      <div class="dashboard-grid">
        <PanelCard class="status-card">
          <div class="panel-title">
            <span>Equipment Status</span>
            <h2>全厂设备状态分布</h2>
          </div>
          <div ref="pieRef" class="chart"></div>
        </PanelCard>

        <PanelCard class="output-card">
          <div class="panel-title">
            <span>Output & Quality</span>
            <h2>各设备累计产量与良品率</h2>
          </div>
          <div ref="barRef" class="chart"></div>
        </PanelCard>

        <PanelCard>
          <div class="panel-title">
            <span>OEE Trend</span>
            <h2>OEE 趋势</h2>
          </div>
          <div ref="oeeRef" class="small-chart"></div>
        </PanelCard>

        <PanelCard>
          <div class="panel-title">
            <span>Today Output</span>
            <h2>当日产量趋势</h2>
          </div>
          <div ref="outputRef" class="small-chart"></div>
        </PanelCard>

        <PanelCard>
          <div class="panel-title">
            <span>Fault Devices</span>
            <h2>故障设备列表</h2>
          </div>
          <div class="list fault-list">
            <div v-for="device in faultDevices" :key="device.id" class="list-item danger">
              <strong>{{ device.name }}</strong>
              <span>{{ statusMap[device.status] }}</span>
            </div>
            <p v-if="!faultDevices.length" class="empty">当前无故障设备</p>
          </div>
        </PanelCard>

        <PanelCard class="events-card">
          <div class="panel-title events-title">
            <div>
              <span>Realtime Events</span>
              <h2>实时生产事件</h2>
            </div>
          </div>
          <div class="event-stream">
            <div v-for="item in productionEvents" :key="item.id" class="event-item" :class="item.level">
              <time>{{ item.time }}</time>
              <strong>{{ item.source }}</strong>
              <b>{{ item.type }}</b>
              <span>{{ item.message }}</span>
              <em>{{ item.status }}</em>
            </div>
          </div>
        </PanelCard>
      </div>
    </div>
  </FactoryShell>
</template>

<style scoped>
.dashboard-page {
  display: grid;
  gap: clamp(12px, 1vw, 18px);
}

.metrics-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: clamp(10px, 1vw, 16px);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(280px, 0.82fr) minmax(320px, 1fr) minmax(280px, 0.86fr);
  gap: clamp(10px, 1vw, 16px);
  align-items: stretch;
}

.output-card {
  grid-column: span 2;
}

.events-card {
  grid-column: 1 / -1;
}

.panel-title {
  margin-bottom: 10px;
}

.panel-title span {
  color: var(--text-secondary);
  font-size: 12px;
}

h2 {
  margin: 2px 0 0;
  color: var(--text-primary);
  font-size: clamp(16px, 1vw, 18px);
  letter-spacing: 0;
}

.chart {
  height: clamp(260px, 30dvh, 360px);
}

.small-chart {
  height: clamp(190px, 22dvh, 260px);
}

.list {
  display: grid;
  gap: 8px;
}

.list-item {
  display: grid;
  gap: 4px;
  padding: 10px;
  border-radius: 8px;
  background: var(--panel-bg-soft);
}

.list-item strong {
  color: var(--text-primary);
}

.list-item span,
.empty {
  color: var(--text-secondary);
  font-size: 12px;
}

.danger {
  border: 1px solid color-mix(in srgb, var(--danger) 30%, var(--panel-border));
}

.events-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.event-stream {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.event-item {
  display: grid;
  grid-template-columns: 74px minmax(120px, 0.8fr) 58px minmax(220px, 1.5fr) 70px;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 10px 12px;
  border: 1px solid var(--panel-border);
  border-radius: 9px;
  background: var(--panel-bg-soft);
}

.event-item time,
.event-item b,
.event-item em {
  font-size: 12px;
  font-style: normal;
  white-space: nowrap;
}

.event-item time {
  color: var(--accent-blue);
  font-variant-numeric: tabular-nums;
}

.event-item strong {
  overflow: hidden;
  color: var(--text-primary);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-item b {
  color: var(--text-secondary);
  font-weight: 500;
}

.event-item span {
  overflow: hidden;
  color: var(--text-secondary);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-item em {
  justify-self: end;
  color: var(--accent);
}

.event-item.critical {
  border-color: color-mix(in srgb, var(--danger) 32%, var(--panel-border));
}

.event-item.critical em {
  color: var(--danger);
}

.event-item.warning em {
  color: var(--warning);
}

@media (max-width: 1366px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .output-card,
  .events-card {
    grid-column: 1 / -1;
  }

  .event-stream {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .metrics-row,
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .output-card,
  .events-card {
    grid-column: auto;
  }

  .event-item {
    grid-template-columns: 70px 1fr auto;
  }

  .event-item span {
    grid-column: 1 / -1;
  }

  .event-item em {
    justify-self: start;
  }
}
</style>
