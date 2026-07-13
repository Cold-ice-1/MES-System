<script setup>
import { computed } from 'vue'
import { statusMeta } from '../../../data/factoryMock'

const props = defineProps({
  device: { type: Object, default: null },
  workOrders: { type: Array, default: () => [] },
  alarms: { type: Array, default: () => [] },
})

const qualityRate = computed(() => {
  if (!props.device?.totalParts) return 'N/A'
  return `${((props.device.goodParts / props.device.totalParts) * 100).toFixed(1)}%`
})
</script>

<template>
  <section class="panel detail-panel">
    <header>
      <span>Device Detail</span>
      <h2>设备详情</h2>
    </header>

    <div class="detail-scroll">
      <template v-if="device">
        <div class="device-title">
          <div>
            <strong>{{ device.name }}</strong>
            <span>{{ device.zone }} / {{ device.type }}</span>
          </div>
          <b :style="{ background: statusMeta[device.status]?.color }">{{ statusMeta[device.status]?.label }}</b>
        </div>

        <div class="detail-grid">
          <div><span>OEE</span><strong>{{ device.oee }}%</strong></div>
          <div><span>产量</span><strong>{{ device.totalParts }}</strong></div>
          <div><span>良率</span><strong>{{ qualityRate }}</strong></div>
          <div><span>报警</span><strong>{{ device.alert ? 1 : 0 }}</strong></div>
        </div>

        <p v-if="device.alert" class="alert">{{ device.alert }}</p>

        <div class="work-orders">
          <span>最近报工</span>
          <div v-for="order in workOrders.slice(0, 3)" :key="order.id">
            <small>{{ order.id }}</small>
            <strong>{{ order.progress }}%</strong>
          </div>
          <p v-if="!workOrders.length">暂无关联工单</p>
        </div>
      </template>

      <div class="events">
        <span>实时事件</span>
        <p v-for="item in alarms.slice(0, 5)" :key="item.id">
          <b>{{ item.time }}</b>{{ item.message }}
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.panel {
  min-height: 0;
  padding: clamp(12px, 1vw, 16px);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  background: var(--panel-bg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

header {
  flex: 0 0 auto;
  margin-bottom: 12px;
}

.detail-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  padding-right: 4px;
}

header span,
.device-title span,
.detail-grid span,
.work-orders > span,
.events > span {
  color: var(--text-secondary);
  font-size: 12px;
}

h2 {
  margin: 2px 0 0;
  color: var(--text-primary);
  font-size: clamp(16px, 1vw, 18px);
}

.device-title {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.device-title strong {
  display: block;
  color: var(--text-primary);
  font-size: 16px;
}

.device-title b {
  flex: none;
  padding: 3px 8px;
  border-radius: 999px;
  color: #05101d;
  font-size: 12px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 12px;
}

.detail-grid div,
.work-orders div {
  padding: 8px;
  border-radius: 6px;
  background: var(--panel-bg-soft);
}

.detail-grid strong {
  display: block;
  margin-top: 3px;
  color: var(--text-primary);
}

.alert {
  margin: 10px 0 0;
  padding: 8px;
  border-radius: 6px;
  color: var(--danger);
  background: color-mix(in srgb, var(--danger) 14%, transparent);
}

.work-orders,
.events {
  margin-top: 14px;
}

.work-orders div {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}

small {
  color: var(--text-secondary);
}

.events p,
.work-orders p {
  margin: 7px 0 0;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.45;
}

.events b {
  margin-right: 7px;
  color: var(--accent-blue);
  font-weight: 500;
}
</style>
