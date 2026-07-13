<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import ModuleMenu from './ModuleMenu.vue'

defineProps({
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
  <header class="factory-header">
    <div class="title-block">
      <span>MES Digital Twin</span>
      <h1>智能化产品加工生产线数字孪生系统</h1>
    </div>

    <div class="status-strip">
      <div>
        <span>当前时间</span>
        <strong>{{ timeText }}</strong>
      </div>
      <div>
        <span>系统状态</span>
        <strong class="ok">运行正常</strong>
      </div>
      <div>
        <span>全厂 OEE</span>
        <strong>{{ summary.oee }}%</strong>
      </div>
      <div>
        <span>当日产量</span>
        <strong>{{ summary.todayOutput }}</strong>
      </div>
      <div>
        <span>故障</span>
        <strong class="danger">{{ summary.faultCount }}</strong>
      </div>
      <div>
        <span>在线设备</span>
        <strong>{{ summary.onlineDevices }}</strong>
      </div>
    </div>

    <ModuleMenu />
  </header>
</template>

<style scoped>
.factory-header {
  display: grid;
  grid-template-columns: minmax(280px, 0.9fr) minmax(520px, 1.5fr) minmax(360px, 0.9fr);
  align-items: center;
  gap: clamp(10px, 1vw, 16px);
  min-height: clamp(64px, 7.4dvh, 82px);
  padding: 10px clamp(14px, 1.4vw, 24px);
  border-bottom: 1px solid rgba(92, 130, 160, 0.18);
  background: linear-gradient(180deg, rgba(8, 20, 34, 0.95), rgba(5, 13, 25, 0.82));
}

.title-block span,
.status-strip span {
  color: #7f9db5;
  font-size: 11px;
}

h1 {
  margin: 3px 0 0;
  color: #eaf6ff;
  font-size: clamp(18px, 1.35vw, 26px);
  font-weight: 650;
  letter-spacing: 0;
}

.status-strip {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
}

.status-strip div {
  min-width: 0;
  padding: 6px 8px;
  border-left: 1px solid rgba(56, 189, 248, 0.18);
}

.status-strip strong {
  display: block;
  margin-top: 2px;
  color: #e8f7ff;
  font-size: clamp(13px, 0.9vw, 17px);
  font-weight: 650;
  white-space: nowrap;
}

.status-strip .ok {
  color: #26f5a6;
}

.status-strip .danger {
  color: #ff6876;
}

@media (max-width: 1400px) {
  .factory-header {
    grid-template-columns: minmax(260px, 0.8fr) 1.3fr;
  }
  .factory-header :deep(.module-menu) {
    grid-column: 1 / -1;
    justify-content: flex-start;
  }
}

@media (max-width: 980px) {
  .factory-header {
    grid-template-columns: 1fr;
  }
  .status-strip {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
