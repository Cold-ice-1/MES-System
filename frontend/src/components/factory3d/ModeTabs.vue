<script setup>
defineProps({
  modes: { type: Array, default: () => [] },
  activeMode: { type: String, default: 'overview' },
})

const emit = defineEmits(['change'])
</script>

<template>
  <nav class="mode-tabs">
    <button
      v-for="mode in modes"
      :key="mode.key"
      :class="{ active: mode.key === activeMode }"
      @click="emit('change', mode.key)"
    >
      <strong>{{ mode.label }}</strong>
      <span>{{ mode.description }}</span>
    </button>
  </nav>
</template>

<style scoped>
.mode-tabs {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

button {
  position: relative;
  min-height: 68px;
  padding: 11px 14px;
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(10, 28, 52, 0.72), rgba(5, 15, 31, 0.78));
  color: #e8f7ff;
  cursor: pointer;
  text-align: left;
  overflow: hidden;
}

button::after {
  content: '';
  position: absolute;
  left: -40%;
  top: 0;
  width: 36%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.24), transparent);
  transform: skewX(-18deg);
  transition: left 0.22s ease;
}

button:hover::after,
button.active::after {
  left: 110%;
}

button.active {
  border-color: rgba(38, 245, 166, 0.52);
  box-shadow: 0 0 22px rgba(38, 245, 166, 0.18);
}

strong,
span {
  position: relative;
  z-index: 1;
  display: block;
}

strong {
  font-size: 15px;
}

span {
  margin-top: 5px;
  color: #8fb6d9;
  font-size: 12px;
}

@media (max-width: 900px) {
  .mode-tabs {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
