import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'theme'
const theme = ref('dark')
let initialized = false

function readStoredTheme() {
  if (typeof window === 'undefined') return 'dark'
  const stored = window.localStorage.getItem(STORAGE_KEY) || window.localStorage.getItem('mes-theme')
  return stored === 'light' || stored === 'dark' ? stored : 'dark'
}

function applyTheme(value) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', value)
  document.documentElement.style.colorScheme = value
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, value)
    window.localStorage.removeItem('mes-theme')
  }
}

export function useTheme() {
  if (!initialized) {
    theme.value = readStoredTheme()
    applyTheme(theme.value)
    watch(theme, applyTheme, { immediate: true })
    initialized = true
  }

  const isDark = computed(() => theme.value === 'dark')
  const setTheme = (value) => {
    theme.value = value === 'light' ? 'light' : 'dark'
  }
  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  return { theme, isDark, setTheme, toggleTheme }
}
