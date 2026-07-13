<script setup>
defineProps({
  modes: { type: Array, default: () => [] },
  activeMode: { type: String, required: true },
})

const emit = defineEmits(['change'])
</script>

<template>
  <footer class="monitor-bar">
    <button
      v-for="mode in modes"
      :key="mode.key"
      :class="{ active: mode.key === activeMode }"
      @click="emit('change', mode.key)"
    >
      {{ mode.label }}
    </button>
  </footer>
</template>

<style scoped>
.monitor-bar {
  display: flex;
  justify-content: center;
  gap: 8px;
  min-height: clamp(44px, 5.2dvh, 58px);
  padding: 8px clamp(14px, 1.4vw, 24px);
  border-top: 1px solid var(--panel-border);
  background: var(--panel-bg);
}

button {
  min-width: clamp(96px, 8vw, 132px);
  border: 1px solid var(--panel-border);
  border-radius: 999px;
  background: var(--panel-bg-soft);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: clamp(12px, 0.8vw, 14px);
}

button.active {
  border-color: color-mix(in srgb, var(--accent) 48%, var(--panel-border));
  color: var(--text-primary);
  background: color-mix(in srgb, var(--accent) 16%, transparent);
}
</style>
