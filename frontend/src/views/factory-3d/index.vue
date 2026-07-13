<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue'
import FactoryShell from '../../layouts/FactoryShell.vue'
import OverviewPanel from './components/OverviewPanel.vue'
import KpiPanel from './components/KpiPanel.vue'
import DeviceDetailPanel from './components/DeviceDetailPanel.vue'
import BottomMonitorBar from './components/BottomMonitorBar.vue'
import FactoryScene from './components/FactoryScene.vue'
import { useFactoryStore } from '../../stores/factoryStore'

const store = useFactoryStore()
let timer

const productionMetrics = computed(() => {
  if (store.activeMode === 'environment') {
    return [
      { label: '当日能耗', value: store.energyStats.todayEnergy, unit: 'kWh' },
      { label: '峰值功率', value: store.energyStats.peakPower, unit: 'kW' },
      { label: '碳排放', value: store.energyStats.carbon, unit: 't' },
      { label: '节能率', value: store.energyStats.savingRate, unit: '%' },
    ]
  }
  if (store.activeMode === 'security') {
    return [
      { label: '在线摄像头', value: store.securitySummary.onlineCameras, unit: '路' },
      { label: '门禁状态', value: store.securitySummary.accessState, unit: '' },
      { label: '闯入告警', value: store.securitySummary.intrusionAlerts, unit: '条' },
      { label: '事件数量', value: store.securitySummary.eventCount, unit: '条' },
    ]
  }
  return [
    { label: '班次产量', value: store.productionStats.shiftOutput, unit: '件' },
    { label: '节拍', value: store.productionStats.taktTime, unit: 's' },
    { label: '吞吐率', value: store.productionStats.throughput, unit: '件/h' },
    { label: '不良率', value: store.productionStats.defectRate, unit: '%' },
  ]
})

onMounted(() => {
  timer = window.setInterval(store.tickRealtime, 3000)
})

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
})
</script>

<template>
  <section class="factory-page">
    <FactoryShell title="智能化产品加工生产线数字孪生系统" subtitle="MES Digital Twin Factory" full>
      <main class="factory-main-grid">
        <OverviewPanel
          class="side-panel overview"
          :summary="store.kpiSummary"
          :status-counts="store.statusCounts"
        />

        <section class="scene-card">
          <FactoryScene
            :devices="store.devices"
            :production-lines="store.productionLines"
            :agv-routes="store.agvRoutes"
            :environment-sensors="store.environmentSensors"
            :selected-id="store.selectedDevice?.id"
            :active-mode="store.activeMode"
            @select="store.selectDevice"
          />
        </section>

        <aside class="right-column">
          <KpiPanel class="kpi-block" :metrics="productionMetrics" />
          <DeviceDetailPanel
            class="detail-block"
            :device="store.selectedDevice"
            :work-orders="store.selectedWorkOrders"
            :alarms="store.modeAlarms"
          />
        </aside>
      </main>

      <BottomMonitorBar
        :modes="store.modeOptions"
        :active-mode="store.activeMode"
        @change="store.selectMode"
      />
    </FactoryShell>
  </section>
</template>

<style scoped>
.factory-page {
  width: 100%;
  height: 100dvh;
  overflow: hidden;
}

.factory-page :deep(.factory-content) {
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  min-height: 0;
}

.factory-main-grid {
  min-width: 0;
  min-height: 0;
  height: 100%;
  display: grid;
  grid-template-columns:
    minmax(220px, clamp(230px, 16vw, 310px))
    minmax(500px, 1fr)
    minmax(280px, clamp(290px, 20vw, 390px));
  gap: clamp(10px, 1vw, 16px);
  padding: clamp(10px, 1vw, 16px) clamp(14px, 1.4vw, 24px);
  overflow: hidden;
}

.scene-card {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  border: 1px solid var(--panel-border);
  border-radius: 10px;
  background: var(--panel-bg-strong);
}

.scene-card :deep(.factory-scene) {
  min-height: 0;
}

.right-column {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: clamp(10px, 1vw, 16px);
  overflow: hidden;
}

.kpi-block {
  flex: 0 0 auto;
}

.detail-block {
  flex: 1 1 auto;
  min-height: 0;
}

.side-panel {
  min-height: 0;
}

@media (max-width: 1500px) {
  .factory-main-grid {
    grid-template-columns: minmax(200px, 250px) minmax(450px, 1fr) minmax(260px, 330px);
  }
}

@media (max-width: 1180px) {
  .factory-main-grid {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: minmax(380px, 1fr) auto;
    overflow: auto;
  }

  .overview {
    display: none;
  }

  .scene-card {
    min-height: 380px;
  }

  .right-column {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    overflow: visible;
  }
}

@media (max-width: 760px) {
  .factory-main-grid {
    padding: 10px;
  }

  .right-column {
    grid-template-columns: 1fr;
  }
}
</style>
