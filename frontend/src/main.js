import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'

const savedTheme = localStorage.getItem('theme') || localStorage.getItem('mes-theme') || 'dark'
const initialTheme = savedTheme === 'light' ? 'light' : 'dark'
document.documentElement.setAttribute('data-theme', initialTheme)
document.documentElement.style.colorScheme = initialTheme
localStorage.setItem('theme', initialTheme)

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', component: () => import('./views/Dashboard.vue') },
    { path: '/factory-3d', component: () => import('./views/Factory3D.vue') },
    { path: '/equipment', component: () => import('./views/Equipment.vue') },
    { path: '/production', component: () => import('./views/Production.vue') }
  ]
})

const app = createApp(App)
app.use(createPinia()).use(ElementPlus).use(router).mount('#app')
