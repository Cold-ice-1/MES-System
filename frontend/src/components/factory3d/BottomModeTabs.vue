<script setup>
defineProps({
  modes: { type: Array, default: () => [] },
  activeMode: { type: String, required: true },
})

const emit = defineEmits(['change'])
</script>

<template>
  <footer class="bottom-tabs">
    <button v-for="mode in modes" :key="mode.key" :class="{ active: mode.key === activeMode }" @click="emit('change', mode.key)">
      <strong>{{ mode.label }}</strong>
      <span>{{ mode.description }}</span>
    </button>
  </footer>
</template>

<style scoped>
.bottom-tabs {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

button {
  position: relative;
  min-height: 72px;
  padding: 12px 16px;
  border: 1px solid rgba(64, 214, 255, 0.28);
  background: linear-gradient(180deg, rgba(6, 26, 50, 0.8), rgba(2, 10, 24, 0.88));
  color: #e8f7ff;
  cursor: pointer;
  text-align: left;
  overflow: hidden;
}

button::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 3px;
  height: 100%;
  background: #38bdf8;
  opacity: 0.5;
}

button::after {
  content: '';
  position: absolute;
  left: -42%;
  top: 0;
  width: 38%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.24), transparent);
  transform: skewX(-18deg);
  transition: left 0.24s ease;
}

button:hover::after,
button.active::after {
  left: 115%;
}

button.active {
  border-color: rgba(38, 245, 166, 0.65);
  box-shadow: 0 0 24px rgba(38, 245, 166, 0.18), inset 0 0 22px rgba(38, 245, 166, 0.08);
}

strong,
span {
  position: relative;
  z-index: 1;
  display: block;
}

strong {
  font-size: 16px;
}

span {
  margin-top: 5px;
  color: #8fb6d9;
  font-size: 12px;
}
</style>
