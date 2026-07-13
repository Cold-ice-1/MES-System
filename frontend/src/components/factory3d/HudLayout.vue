<script setup>
defineProps({
  dense: { type: Boolean, default: false },
})
</script>

<template>
  <section class="hud-layout" :class="{ dense }">
    <slot></slot>
  </section>
</template>

<style scoped>
.hud-layout {
  position: relative;
  height: 100vh;
  box-sizing: border-box;
  padding: 12px 14px 14px;
  overflow: hidden;
  background:
    linear-gradient(90deg, rgba(2, 7, 19, 0.7), transparent 18%, transparent 82%, rgba(2, 7, 19, 0.72)),
    radial-gradient(circle at 50% 8%, rgba(14, 165, 233, 0.24), transparent 30%),
    radial-gradient(circle at 82% 75%, rgba(38, 245, 166, 0.1), transparent 28%),
    linear-gradient(180deg, #020611 0%, #061426 52%, #020713 100%);
}

.hud-layout::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    radial-gradient(circle, rgba(125, 211, 252, 0.36) 1px, transparent 1.5px),
    linear-gradient(rgba(56, 189, 248, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(56, 189, 248, 0.035) 1px, transparent 1px);
  background-size: 120px 120px, 42px 42px, 42px 42px;
  animation: drift 28s linear infinite;
}

.hud-layout::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    repeating-linear-gradient(180deg, rgba(255, 255, 255, 0.025) 0, rgba(255, 255, 255, 0.025) 1px, transparent 1px, transparent 4px),
    linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.18) 50%, transparent);
  mix-blend-mode: screen;
}

@keyframes drift {
  from { background-position: 0 0, 0 0, 0 0; }
  to { background-position: 120px 120px, 42px 42px, 42px 42px; }
}
</style>
