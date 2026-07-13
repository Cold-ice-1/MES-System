<script setup>
import VChart from 'vue-echarts'
import KpiCard from './KpiCard.vue'

defineProps({
  summary: { type: Object, required: true },
  statusCounts: { type: Object, required: true },
  statusOption: { type: Object, required: true },
})
</script>

<template>
  <aside class="left-panel">
    <div class="panel-heading">
      <span>FACTORY SITUATION</span>
      <h3>总体态势</h3>
    </div>
    <div class="kpi-grid">
      <KpiCard label="设备总数" :value="summary.totalDevices ?? summary.onlineDevices" unit="台" />
      <KpiCard label="运行中" :value="statusCounts.running" unit="台" tone="green" />
      <KpiCard label="待机" :value="statusCounts.standby" unit="台" tone="orange" />
      <KpiCard label="故障" :value="statusCounts.fault" unit="台" tone="red" />
      <KpiCard label="离线" :value="statusCounts.offline" unit="台" />
      <KpiCard label="计划完成率" :value="summary.planCompletion ?? 0" unit="%" tone="green" />
    </div>
    <div class="chart-box">
      <VChart class="chart" :option="statusOption" autoresize />
    </div>
  </aside>
</template>

<style scoped>
.left-panel {
  box-sizing: border-box;
  height: 100%;
  padding: 14px;
  border: 1px solid rgba(64, 214, 255, 0.24);
  background: linear-gradient(180deg, rgba(7, 28, 53, 0.76), rgba(3, 12, 28, 0.82));
  box-shadow: inset 0 0 18px rgba(14, 165, 233, 0.07);
  overflow: hidden;
}

.panel-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
}

.panel-heading span {
  color: #38bdf8;
  font-size: 10px;
}

.panel-heading h3 {
  margin: 0;
  color: #e8f7ff;
  font-size: 17px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.chart-box {
  margin-top: 12px;
  height: min(230px, 34vh);
}

.chart {
  height: 100%;
}
</style>
