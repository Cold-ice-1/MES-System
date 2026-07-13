<script setup>
defineProps({
  alarms: { type: Array, default: () => [] },
  securityEvents: { type: Array, default: () => [] },
  mode: { type: String, default: 'overview' },
})

const levelText = {
  critical: '严重',
  warning: '预警',
  info: '信息',
}
</script>

<template>
  <section class="alarm-panel">
    <div class="panel-title">
      <span>REALTIME EVENTS</span>
      <h3>{{ mode === 'security' ? '安防事件' : '实时告警' }}</h3>
    </div>
    <div class="event-list">
      <div v-for="item in alarms" :key="item.id" class="event-item" :class="item.level">
        <b>{{ levelText[item.level] }}</b>
        <div>
          <strong>{{ item.source }}</strong>
          <span>{{ item.message }}</span>
        </div>
        <em>{{ item.time }}</em>
      </div>
      <div v-if="mode === 'security'" v-for="item in securityEvents" :key="item.id" class="event-item" :class="item.severity">
        <b>{{ item.type }}</b>
        <div>
          <strong>{{ item.location }}</strong>
          <span>{{ item.message }}</span>
        </div>
        <em>{{ item.time }}</em>
      </div>
    </div>
  </section>
</template>

<style scoped>
.alarm-panel {
  padding: 14px;
  border: 1px solid rgba(56, 189, 248, 0.28);
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(10, 28, 52, 0.78), rgba(5, 15, 31, 0.84));
}

.panel-title span {
  color: #38bdf8;
  font-size: 10px;
}

h3 {
  margin: 3px 0 12px;
  color: #e8f7ff;
  font-size: 16px;
}

.event-list {
  display: grid;
  gap: 8px;
  max-height: 260px;
  overflow: auto;
}

.event-item {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 56px;
  gap: 8px;
  align-items: center;
  padding: 9px;
  border: 1px solid rgba(125, 211, 252, 0.14);
  border-radius: 6px;
  background: rgba(8, 25, 47, 0.66);
}

.event-item.critical {
  border-color: rgba(255, 77, 94, 0.38);
  background: rgba(127, 29, 29, 0.24);
}

.event-item.warning {
  border-color: rgba(255, 176, 32, 0.35);
}

b {
  color: #7dd3fc;
  font-size: 12px;
}

strong,
span {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

strong {
  color: #e8f7ff;
  font-size: 13px;
}

span,
em {
  color: #8fb6d9;
  font-size: 12px;
  font-style: normal;
}
</style>
