<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import KpiCard from './KpiCard.vue'

const props = defineProps({
  summary: { type: Object, required: true },
})

const now = ref(new Date())
let timer

const timeText = computed(() => now.value.toLocaleString('zh-CN', { hour12: false }))

onMounted(() => {
  timer = window.setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
})
</script>

<template>
  <header class="top-header">
    <div class="header-line left"></div>
    <div class="title-box">
      <p>MES Digital Twin Factory</p>
      <h1>产品加工生产线可视化</h1>
    </div>
    <div class="system-state">
      <span>{{ timeText }}</span>
      <strong>系统运行正常</strong>
    </div>
    <div class="header-kpis">
      <KpiCard label="全厂 OEE" :value="summary.oee" unit="%" tone="green" />
      <KpiCard label="当日产量" :value="summary.todayOutput" unit="件" />
      <KpiCard label="故障数量" :value="summary.faultCount" unit="台" tone="red" />
      <KpiCard label="在线设备" :value="summary.onlineDevices" unit="台" tone="green" />
    </div>
  </header>
</template>

<style scoped>
.top-header {
  display: grid;
  grid-template-columns: 1fr minmax(520px, auto) 250px 560px;
  gap: 12px;
  align-items: center;
  min-height: 96px;
}

.header-line {
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.8));
  box-shadow: 0 0 16px rgba(56, 189, 248, 0.8);
}

.title-box {
  position: relative;
  text-align: center;
  padding: 10px 42px 14px;
  border: 1px solid rgba(56, 189, 248, 0.38);
  border-top: 0;
  background: linear-gradient(180deg, rgba(14, 165, 233, 0.22), rgba(4, 18, 40, 0.78));
  clip-path: polygon(0 0, 100% 0, 94% 100%, 6% 100%);
}

.title-box p,
.title-box h1 {
  margin: 0;
}

.title-box p {
  color: #4bdcff;
  font-size: 12px;
}

.title-box h1 {
  margin-top: 3px;
  color: #f1fbff;
  font-size: 30px;
  letter-spacing: 0;
  text-shadow: 0 0 20px rgba(56, 189, 248, 0.55);
}

.system-state {
  height: 62px;
  padding: 9px 12px;
  border: 1px solid rgba(38, 245, 166, 0.28);
  background: rgba(5, 20, 38, 0.68);
}

.system-state span,
.system-state strong {
  display: block;
}

.system-state span {
  color: #9cc9e8;
  font-size: 12px;
}

.system-state strong {
  margin-top: 7px;
  color: #26f5a6;
  font-size: 17px;
}

.header-kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

@media (max-width: 1500px) {
  .top-header {
    grid-template-columns: 1fr;
  }
  .header-line {
    display: none;
  }
}
</style>
