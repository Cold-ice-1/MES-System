<script setup>
import { computed } from 'vue'
import { modeOptions } from '../../data/factoryMock'

const props = defineProps({
  mode: { type: String, default: 'overview' },
  summary: { type: Object, default: () => ({}) },
})

const modeLabel = computed(() => modeOptions.find((item) => item.key === props.mode)?.label || '全局总览')
</script>

<template>
  <header class="digital-hud">
    <div class="hud-wing left"></div>
    <div class="title-block">
      <p>PRODUCT PROCESSING LINE VISUALIZATION</p>
      <h1>产品加工生产线可视化 / MES 数字孪生工厂</h1>
      <span>{{ modeLabel }} · OEE {{ summary.oee }}% · 良率 {{ summary.qualityRate }}%</span>
    </div>
    <div class="hud-wing right"></div>
  </header>
</template>

<style scoped>
.digital-hud {
  position: relative;
  height: 82px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 18px;
  color: #e8f7ff;
}

.title-block {
  min-width: 620px;
  text-align: center;
  padding: 10px 44px 14px;
  border: 1px solid rgba(56, 189, 248, 0.36);
  border-top: 0;
  background: linear-gradient(180deg, rgba(14, 165, 233, 0.2), rgba(3, 15, 33, 0.74));
  clip-path: polygon(0 0, 100% 0, 94% 100%, 6% 100%);
  box-shadow: 0 0 28px rgba(14, 165, 233, 0.18);
}

p,
h1,
span {
  margin: 0;
}

p {
  color: #38bdf8;
  font-size: 11px;
}

h1 {
  margin-top: 4px;
  font-size: 25px;
  font-weight: 700;
  text-shadow: 0 0 18px rgba(56, 189, 248, 0.5);
}

span {
  display: block;
  margin-top: 5px;
  color: #9fe7ff;
  font-size: 12px;
}

.hud-wing {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.75));
  box-shadow: 0 0 14px rgba(56, 189, 248, 0.8);
}

.hud-wing.right {
  transform: scaleX(-1);
}

@media (max-width: 1200px) {
  .digital-hud {
    grid-template-columns: 1fr;
    height: auto;
  }

  .hud-wing {
    display: none;
  }

  .title-block {
    min-width: 0;
  }
}
</style>
