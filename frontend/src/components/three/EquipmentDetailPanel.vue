<script setup>
import { computed } from 'vue'
import { statusMeta } from '../../stores/mesFactory'

const props = defineProps({
  equipment: { type: Object, default: null },
  records: { type: Array, default: () => [] },
})

const qualityRate = computed(() => {
  if (!props.equipment?.total_parts) return 'N/A'
  return `${((props.equipment.good_parts / props.equipment.total_parts) * 100).toFixed(1)}%`
})
</script>

<template>
  <aside class="detail-panel">
    <div v-if="equipment">
      <div class="panel-header">
        <div>
          <p class="eyebrow">{{ equipment.line }}</p>
          <h3>{{ equipment.name }}</h3>
        </div>
        <el-tag :type="statusMeta[equipment.status]?.type">{{ statusMeta[equipment.status]?.label }}</el-tag>
      </div>

      <div class="metric-grid">
        <div><span>运行分钟</span><strong>{{ equipment.total_run_time_minutes }}</strong></div>
        <div><span>良品率</span><strong>{{ qualityRate }}</strong></div>
        <div><span>总产量</span><strong>{{ equipment.total_parts }}</strong></div>
        <div><span>不良品</span><strong>{{ Math.max((equipment.total_parts || 0) - (equipment.good_parts || 0), 0) }}</strong></div>
      </div>

      <h4>最近报工记录</h4>
      <div class="record-list">
        <div v-for="record in records" :key="record.id" class="record-item">
          <span>{{ record.work_order }}</span>
          <strong>{{ record.actual_qty }} / {{ record.defect_qty }}</strong>
        </div>
        <el-empty v-if="!records.length" description="暂无报工记录" :image-size="72" />
      </div>
    </div>
  </aside>
</template>

<style scoped>
.detail-panel {
  min-width: 280px;
  height: 100%;
  padding: 18px;
  border-left: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(15, 23, 42, 0.88);
  color: #e5eefb;
  overflow: auto;
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.eyebrow {
  margin: 0 0 4px;
  color: #93c5fd;
  font-size: 12px;
}

h3 {
  margin: 0;
  font-size: 18px;
}

h4 {
  margin: 20px 0 10px;
  color: #cbd5e1;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 18px;
}

.metric-grid div,
.record-item {
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 7px;
  background: rgba(30, 41, 59, 0.72);
}

.metric-grid div {
  padding: 12px;
}

.metric-grid span,
.record-item span {
  display: block;
  color: #94a3b8;
  font-size: 12px;
}

.metric-grid strong {
  display: block;
  margin-top: 6px;
  font-size: 20px;
}

.record-list {
  display: grid;
  gap: 8px;
}

.record-item {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 10px;
}
</style>
