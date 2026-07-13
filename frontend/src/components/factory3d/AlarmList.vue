<script setup>
defineProps({
  items: { type: Array, default: () => [] },
  title: { type: String, default: '实时告警' },
})

const levelMap = {
  critical: '严重',
  warning: '预警',
  info: '信息',
}
</script>

<template>
  <section class="alarm-list">
    <div class="panel-heading">
      <span>REALTIME ALARM</span>
      <h3>{{ title }}</h3>
    </div>
    <div class="marquee">
      <div class="marquee-inner">
        <div v-for="(item, index) in [...items, ...items]" :key="`${item.id}-${index}`" class="alarm-item" :class="item.level || item.severity">
          <b>{{ levelMap[item.level] || item.type || '事件' }}</b>
          <div>
            <strong>{{ item.source || item.location }}</strong>
            <span>{{ item.message }}</span>
          </div>
          <em>{{ item.time }}</em>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.alarm-list {
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
  margin-bottom: 10px;
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

.marquee {
  height: 170px;
  overflow: hidden;
}

.marquee-inner {
  display: grid;
  gap: 8px;
  animation: roll 16s linear infinite;
}

.alarm-item {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) 54px;
  gap: 8px;
  align-items: center;
  min-height: 48px;
  padding: 8px;
  border: 1px solid rgba(125, 211, 252, 0.14);
  background: rgba(8, 25, 47, 0.58);
}

.alarm-item.critical {
  border-color: rgba(255, 77, 94, 0.42);
  box-shadow: inset 0 0 18px rgba(255, 77, 94, 0.12);
}

.alarm-item.warning {
  border-color: rgba(255, 176, 32, 0.36);
}

b,
em,
span {
  color: #8fb6d9;
  font-size: 12px;
  font-style: normal;
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
  color: #f1fbff;
  font-size: 13px;
}

@keyframes roll {
  from { transform: translateY(0); }
  to { transform: translateY(-50%); }
}
</style>
