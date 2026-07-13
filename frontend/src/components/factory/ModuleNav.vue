<script setup>
import { computed } from 'vue'
import { Moon, Sunny } from '@element-plus/icons-vue'
import { useTheme } from '../../composables/useTheme'

const modules = [
  { path: '/dashboard', label: '综合看板' },
  { path: '/factory-3d', label: '数字孪生大屏' },
  { path: '/equipment', label: '设备管理' },
  { path: '/production', label: '生产报工' },
]

const { theme, isDark, toggleTheme } = useTheme()
const themeLabel = computed(() => (isDark.value ? '切换浅色主题' : '切换深色主题'))
</script>

<template>
  <nav class="module-nav" aria-label="模块导航">
    <div class="nav-links">
      <router-link v-for="item in modules" :key="item.path" :to="item.path">
        {{ item.label }}
      </router-link>
    </div>

    <el-dropdown trigger="click" class="nav-dropdown">
      <button class="module-button">模块</button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item v-for="item in modules" :key="item.path">
            <router-link :to="item.path">{{ item.label }}</router-link>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <button
      class="theme-toggle"
      :class="theme"
      type="button"
      :aria-label="themeLabel"
      :title="themeLabel"
      @click="toggleTheme"
    >
      <span class="theme-track">
        <span class="theme-thumb">
          <Moon v-if="isDark" />
          <Sunny v-else />
        </span>
      </span>
    </button>
  </nav>
</template>

<style scoped>
.module-nav {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  min-width: 0;
}

.nav-links {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  min-width: 0;
}

a,
.module-button {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border: 1px solid var(--panel-border);
  border-radius: 999px;
  color: var(--text-secondary);
  font-size: clamp(11px, 0.68vw, 13px);
  text-decoration: none;
  background: var(--button-bg);
  white-space: nowrap;
}

a.router-link-active {
  border-color: var(--panel-border-strong);
  color: var(--text-primary);
  background: color-mix(in srgb, var(--accent-blue) 16%, transparent);
}

.module-button {
  cursor: pointer;
}

.nav-dropdown {
  display: none;
}

.nav-dropdown a {
  width: 100%;
  border: 0;
  background: transparent;
  color: inherit;
}

.theme-toggle {
  position: relative;
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 30px;
  padding: 0;
  border: 1px solid var(--panel-border);
  border-radius: 999px;
  background: var(--button-bg);
  cursor: pointer;
}

.theme-track {
  position: relative;
  width: 38px;
  height: 20px;
}

.theme-thumb {
  position: absolute;
  top: 0;
  left: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  color: var(--on-accent);
  background: linear-gradient(135deg, var(--accent-blue), var(--accent));
  box-shadow: 0 0 14px color-mix(in srgb, var(--accent-blue) 40%, transparent);
  transition: transform 260ms ease, rotate 260ms ease, background 260ms ease;
}

.theme-thumb svg {
  width: 13px;
  height: 13px;
}

.theme-toggle.light .theme-thumb {
  transform: translateX(18px) rotate(180deg) scale(1.04);
  background: linear-gradient(135deg, #f6c453, #ff8f3d);
}

.theme-toggle:hover {
  border-color: var(--panel-border-strong);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-blue) 12%, transparent);
}

.theme-toggle:active .theme-thumb {
  scale: 0.92;
}

@media (max-width: 1180px) {
  .nav-links {
    display: none;
  }

  .nav-dropdown {
    display: inline-flex;
  }
}
</style>
