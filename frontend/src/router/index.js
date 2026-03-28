import { createRouter, createWebHistory } from 'vue-router'
import ChatRoom from '../views/chat/ChatRoom.vue'
import SetupWizard from '../views/setup/SetupWizard.vue'
import SettingsView from '../views/settings/SettingsView.vue' 

const routes = [
  {
    path: '/',
    redirect: '/chat'
  },
  {
    path: '/chat',
    name: 'Chat',
    component: ChatRoom
  },
  {
    path: '/setup',
    name: 'Setup',
    component: SetupWizard
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router