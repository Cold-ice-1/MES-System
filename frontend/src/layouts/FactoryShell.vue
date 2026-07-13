<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import ModuleNav from '../components/factory/ModuleNav.vue'
import { useFactoryStore } from '../stores/factoryStore'

defineProps({
  title: { type: String, default: 'MES 数字化制造系统' },
  subtitle: { type: String, default: 'MES Digital Twin' },
  full: { type: Boolean, default: false },
})

const store = useFactoryStore()
const now = ref(new Date())
let timer

function pad(value) {
  return String(value).padStart(2, '0')
}

const timeText = computed(() => {
  const date = now.value
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
})

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
  <section class="factory-shell" :class="{ full }">
    <header class="factory-header">
      <div class="title-block">
        <span>{{ subtitle }}</span>
        <h1>{{ title }}</h1>
      </div>

      <div class="status-strip">
        <div class="status-item time-item">
          <span>当前时间</span>
          <strong>{{ timeText }}</strong>
        </div>
        <div class="status-item">
          <span>系统状态</span>
          <strong class="ok">运行正常</strong>
        </div>
        <div class="status-item">
          <span>全厂 OEE</span>
          <strong>{{ store.kpiSummary.oee }}%</strong>
        </div>
        <div class="status-item">
          <span>当日产量</span>
          <strong>{{ store.kpiSummary.todayOutput }}</strong>
        </div>
        <div class="status-item">
          <span>故障</span>
          <strong class="danger">{{ store.kpiSummary.faultCount }}</strong>
        </div>
        <div class="status-item">
          <span>在线设备</span>
          <strong>{{ store.kpiSummary.onlineDevices }}</strong>
        </div>
      </div>

      <ModuleNav />
    </header>

    <main class="factory-content">
      <slot></slot>
    </main>
  </section>
</template>

<style scoped>
.factory-shell {
  width: 100%;
  height: 100dvh;
  overflow: hidden;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  background:
    radial-gradient(circle at 50% 0%, var(--page-radial), transparent 34%),
    linear-gradient(180deg, var(--page-bg-2) 0%, var(--page-bg) 100%);
  color: var(--text-primary);
}

.factory-header {
  display: grid;
  grid-template-columns: minmax(260px, 0.75fr) minmax(590px, 1.55fr) minmax(360px, 0.8fr);
  align-items: center;
  gap: clamp(10px, 1vw, 16px);
  min-height: clamp(64px, 7.4dvh, 82px);
  padding: 10px clamp(14px, 1.4vw, 24px);
  border-bottom: 1px solid var(--panel-border);
  background: linear-gradient(180deg, var(--shell-bg), var(--panel-bg));
}

.title-block {
  min-width: 0;
}

.title-block span,
.status-item span {
  color: var(--text-secondary);
  font-size: 11px;
}

h1 {
  margin: 3px 0 0;
  overflow: hidden;
  color: var(--text-primary);
  font-size: clamp(18px, 1.35vw, 26px);
  font-weight: 650;
  letter-spacing: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-strip {
  min-width: 0;
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: clamp(8px, 0.75vw, 14px);
}

.status-item {
  flex: 0 1 auto;
  min-width: 74px;
  padding-left: 10px;
  border-left: 1px solid var(--panel-border);
}

.time-item {
  min-width: 184px;
}

.status-item strong {
  display: block;
  margin-top: 2px;
  color: var(--text-primary);
  font-family: DIN, Inter, "Microsoft YaHei", sans-serif;
  font-size: clamp(13px, 0.9vw, 17px);
  font-variant-numeric: tabular-nums;
  font-weight: 650;
  line-height: 1.2;
  white-space: nowrap;
}

.status-item .ok {
  color: var(--success);
}

.status-item .danger {
  color: var(--danger);
}

.factory-content {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.factory-shell:not(.full) .factory-content {
  overflow: auto;
  padding: clamp(12px, 1.25vw, 22px);
}

@media (max-width: 1420px) {
  .factory-header {
    grid-template-columns: minmax(240px, 0.7fr) minmax(560px, 1.5fr) auto;
  }

  .status-strip {
    gap: 8px;
  }

  .status-item {
    min-width: 64px;
    padding-left: 8px;
  }

  .time-item {
    min-width: 178px;
  }
}

@media (max-width: 1180px) {
  .factory-header {
    grid-template-columns: minmax(250px, 1fr) auto;
  }

  .status-strip {
    grid-column: 1 / -1;
    justify-content: flex-start;
    overflow: hidden;
  }
}

@media (max-width: 820px) {
  .status-strip {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .time-item {
    min-width: 0;
  }
}
</style>
