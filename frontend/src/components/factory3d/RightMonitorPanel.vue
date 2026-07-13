<script setup>
import VChart from 'vue-echarts'
import AlarmList from './AlarmList.vue'
import DeviceDetailPanel from './DeviceDetailPanel.vue'
import KpiCard from './KpiCard.vue'

defineProps({
  mode: { type: String, required: true },
  metrics: { type: Array, default: () => [] },
  productionOption: { type: Object, required: true },
  alarms: { type: Array, default: () => [] },
  securityEvents: { type: Array, default: () => [] },
  device: { type: Object, default: null },
  workOrders: { type: Array, default: () => [] },
  environment: { type: Array, default: () => [] },
  securitySummary: { type: Object, default: () => ({}) },
})
</script>

<template>
  <aside class="right-panel">
    <div class="metric-grid">
      <KpiCard v-for="item in metrics" :key="item.label" :label="item.label" :value="item.value" :unit="item.unit" />
    </div>
    <div class="chart-card">
      <div class="panel-heading">
        <span>PRODUCTION TREND</span>
        <h3>排日产量</h3>
      </div>
      <VChart class="chart" :option="productionOption" autoresize />
    </div>
    <DeviceDetailPanel :device="device" :work-orders="workOrders" :mode="mode" :environment="environment" :security-summary="securitySummary" />
    <AlarmList :items="mode === 'security' ? securityEvents : alarms" :title="mode === 'security' ? '安防事件' : '实时事件'" />
  </aside>
</template>

<style scoped>
.right-panel {
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr) auto;
  gap: 10px;
  box-sizing: border-box;
  height: 100%;
  min-width: 0;
  overflow: hidden;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.chart-card {
  padding: 14px;
  border: 1px solid rgba(64, 214, 255, 0.24);
  background: linear-gradient(180deg, rgba(7, 28, 53, 0.76), rgba(3, 12, 28, 0.82));
  box-shadow: inset 0 0 18px rgba(14, 165, 233, 0.07);
}

.panel-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 8px;
}

.panel-heading span {
  color: #38bdf8;
  font-size: 10px;
}

.panel-heading h3 {
  margin: 0;
  color: #e8f7ff;
  font-size: 16px;
}

.chart {
  height: 132px;
}
</style>
