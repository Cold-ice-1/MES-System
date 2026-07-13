<script setup>
import { computed } from 'vue'
import { statusMeta } from '../../data/factoryMock'

const props = defineProps({
  device: { type: Object, default: null },
  workOrders: { type: Array, default: () => [] },
  mode: { type: String, default: 'overview' },
  environment: { type: Array, default: () => [] },
  securitySummary: { type: Object, default: () => ({}) },
})

const qualityRate = computed(() => {
  if (!props.device?.totalParts) return 'N/A'
  return `${((props.device.goodParts / props.device.totalParts) * 100).toFixed(1)}%`
})
</script>

<template>
  <section class="detail-card hud-card">
    <div v-if="device">
      <div class="section-title">
        <span>DEVICE DETAIL</span>
        <strong>设备详情</strong>
      </div>
      <div class="device-title">
        <div>
          <h3>{{ device.name }}</h3>
          <p>{{ device.zone }} / {{ device.type }}</p>
        </div>
        <el-tag :type="statusMeta[device.status]?.tag">{{ statusMeta[device.status]?.label }}</el-tag>
      </div>

      <div class="detail-grid">
        <div><span>运行分钟</span><strong>{{ device.runtimeMinutes }}</strong></div>
        <div><span>OEE</span><strong>{{ device.oee }}%</strong></div>
        <div><span>产量</span><strong>{{ device.totalParts }}</strong></div>
        <div><span>良率</span><strong>{{ qualityRate }}</strong></div>
        <div><span>不良品</span><strong>{{ device.defectParts }}</strong></div>
        <div><span>能耗</span><strong>{{ device.energy }} kWh</strong></div>
      </div>

      <div v-if="device.alert" class="alert-strip">{{ device.alert }}</div>

      <div class="section-title compact">
        <span>WORK ORDERS</span>
        <strong>最近报工</strong>
      </div>
      <div class="work-list">
        <div v-for="order in workOrders" :key="order.id" class="work-item">
          <span>{{ order.id }} / {{ order.product }}</span>
          <strong>{{ order.progress }}%</strong>
        </div>
        <p v-if="!workOrders.length" class="empty">暂无关联工单</p>
      </div>

      <div v-if="mode === 'environment'" class="mode-extra">
        <div v-for="item in environment" :key="item.label">
          <span>{{ item.label }}</span><strong>{{ item.value }}{{ item.unit }}</strong>
        </div>
      </div>

      <div v-if="mode === 'security'" class="mode-extra">
        <div><span>在线摄像头</span><strong>{{ securitySummary.onlineCameras }}</strong></div>
        <div><span>门禁状态</span><strong>{{ securitySummary.accessState }}</strong></div>
        <div><span>闯入告警</span><strong>{{ securitySummary.intrusionAlerts }}</strong></div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hud-card {
  position: relative;
  border: 1px solid rgba(56, 189, 248, 0.28);
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(10, 28, 52, 0.78), rgba(5, 15, 31, 0.84));
  box-shadow: inset 0 0 18px rgba(14, 165, 233, 0.07), 0 0 16px rgba(14, 165, 233, 0.06);
}

.detail-card {
  padding: 14px;
  min-height: 0;
  overflow: hidden;
}

.section-title {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-title span {
  color: #38bdf8;
  font-size: 10px;
  letter-spacing: 0;
}

.section-title strong {
  color: #e0f7ff;
  font-size: 15px;
}

.compact {
  margin-top: 16px;
}

.device-title {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

h3,
p {
  margin: 0;
}

h3 {
  color: #f8fdff;
  font-size: 18px;
}

p {
  margin-top: 5px;
  color: #7dd3fc;
  font-size: 12px;
}

.detail-grid,
.mode-extra {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.detail-grid div,
.mode-extra div,
.work-item {
  border: 1px solid rgba(125, 211, 252, 0.15);
  border-radius: 6px;
  background: rgba(8, 25, 47, 0.66);
  padding: 9px;
}

span {
  color: #8fb6d9;
  font-size: 12px;
}

strong {
  color: #e8f7ff;
}

.detail-grid strong,
.mode-extra strong {
  display: block;
  margin-top: 4px;
  font-size: 16px;
}

.alert-strip {
  margin-top: 10px;
  padding: 9px;
  border: 1px solid rgba(255, 77, 94, 0.35);
  border-radius: 6px;
  color: #ffd8dd;
  background: rgba(127, 29, 29, 0.34);
}

.work-list {
  display: grid;
  gap: 8px;
}

.work-item {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.empty {
  color: #8fb6d9;
  font-size: 12px;
}

.mode-extra {
  margin-top: 14px;
}
</style>
