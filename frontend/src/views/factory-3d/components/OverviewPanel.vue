<script setup>
defineProps({
  summary: { type: Object, required: true },
  statusCounts: { type: Object, required: true },
})
</script>

<template>
  <aside class="panel overview-panel">
    <header>
      <span>Factory Overview</span>
      <h2>工厂总览</h2>
    </header>

    <div class="metric primary">
      <span>计划完成率</span>
      <strong>{{ summary.planCompletion }}%</strong>
    </div>

    <div class="status-grid">
      <div><b class="run"></b><span>运行</span><strong>{{ statusCounts.running }}</strong></div>
      <div><b class="standby"></b><span>待机</span><strong>{{ statusCounts.standby }}</strong></div>
      <div><b class="fault"></b><span>故障</span><strong>{{ statusCounts.fault }}</strong></div>
      <div><b class="offline"></b><span>离线</span><strong>{{ statusCounts.offline }}</strong></div>
    </div>

    <section class="note">
      <span>生产线状态</span>
      <p>加工、检测、包装与仓储物流处于联动监控中。红色状态灯代表需要立即处理的异常设备。</p>
    </section>
  </aside>
</template>

<style scoped>
.panel {
  min-width: 0;
  padding: clamp(12px, 1vw, 16px);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  background: var(--panel-bg);
}

header {
  margin-bottom: 14px;
}

header span,
.metric span,
.status-grid span,
.note span {
  color: var(--text-secondary);
  font-size: 12px;
}

h2 {
  margin: 2px 0 0;
  color: var(--text-primary);
  font-size: clamp(16px, 1vw, 18px);
}

.metric {
  padding: 12px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--accent-blue) 10%, transparent);
}

.metric strong {
  display: block;
  margin-top: 4px;
  color: var(--accent);
  font-size: clamp(26px, 2.1vw, 38px);
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 12px;
}

.status-grid div {
  display: grid;
  grid-template-columns: 8px 1fr auto;
  align-items: center;
  gap: 7px;
  padding: 9px;
  border-radius: 6px;
  background: var(--panel-bg-soft);
}

b {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.run { background: var(--success); }
.standby { background: var(--warning); }
.fault { background: var(--danger); }
.offline { background: var(--info); }

.status-grid strong {
  color: var(--text-primary);
}

.note {
  margin-top: 14px;
}

.note p {
  margin: 6px 0 0;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.55;
}
</style>
