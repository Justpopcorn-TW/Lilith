<template>
  <div class="settings-layout">
    <aside class="sidebar">
      <div class="brand">
        <h2>⚙️ Lilith 控制台</h2>
        <p>System Configuration</p>
      </div>
      <nav class="nav-menu">
        <button :class="{ active: activeTab === 'engine' }" @click="activeTab = 'engine'">🧠 大腦引擎 (Engine)</button>
        <button :class="{ active: activeTab === 'persona' }" @click="activeTab = 'persona'">🎭 人格與記憶 (Persona)</button>
        <button :class="{ active: activeTab === 'bots' }" @click="activeTab = 'bots'">🤖 社群載體 (Bots)</button>
        <button :class="{ active: activeTab === 'general' }" @click="activeTab = 'general'">🎛️ 通用設定 (General)</button>
      </nav>
      <div class="sidebar-footer">
        <button @click="goBack" class="btn-secondary w-full">返回聊天室</button>
        <button @click="goToSetup" class="btn-danger w-full mt-3">重新啟動精靈</button>
      </div>
    </aside>

    <main class="content">
      <div class="content-header">
        <h3>{{ tabTitle }}</h3>
        <button @click="saveSettings" class="btn-primary" :disabled="isSaving">
          {{ isSaving ? '儲存並重啟大腦中...' : '儲存設定 (Save & Restart)' }}
        </button>
      </div>

      <div class="scroll-area">
        <SettingsEngine v-if="activeTab === 'engine'" />
        <SettingsPersona v-if="activeTab === 'persona'" />
        <SettingsBots v-if="activeTab === 'bots'" />
        <SettingsGeneral v-if="activeTab === 'general'" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useConfigStore } from '@/stores/configStore';

// 引入拆分後的子元件
import SettingsEngine from './components/SettingsEngine.vue';
import SettingsPersona from './components/SettingsPersona.vue';
import SettingsBots from './components/SettingsBots.vue';
import SettingsGeneral from './components/SettingsGeneral.vue';

const router = useRouter();
const configStore = useConfigStore();
const activeTab = ref('engine');
const isSaving = ref(false);

const tabTitle = computed(() => {
  if (activeTab.value === 'engine') return '核心引擎與 API 設定';
  if (activeTab.value === 'persona') return '人格、記憶與行為規範';
  if (activeTab.value === 'bots') return '社群平台載體映射';
  return '系統通用設定';
});

onMounted(async () => {
  await configStore.fetchSettings();
});

const saveSettings = async () => {
  isSaving.value = true;
  try {
    const payload = {
      ...configStore.settings,
    };

    const response = await fetch('/api/system/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('儲存失敗');
    
    configStore.updateLocalSettings(payload);
    setTimeout(() => { router.push('/chat'); }, 1500);
  } catch (error) {
    alert(`儲存失敗: ${error.message}`);
    isSaving.value = false;
  }
};

const goBack = () => router.push('/chat');
const goToSetup = () => {
  if (confirm('確定要重新執行啟動精靈嗎？您現有的設定會被載入至精靈中。')) router.push('/setup');
};
</script>

<style scoped>
/* 這裡只保留 Layout、Sidebar、Header 和按鈕的全局樣式 */
.settings-layout { display: flex; height: 100vh; background-color: var(--bg-primary); color: var(--text-primary); font-family: 'Inter', sans-serif; transition: all 0.3s ease; }
.sidebar { width: 250px; background: var(--bg-secondary); border-right: 1px solid var(--border-color); display: flex; flex-direction: column; transition: all 0.3s ease; }
.brand { padding: 2rem 1.5rem; }
.brand h2 { margin: 0; font-size: 1.2rem; color: var(--text-primary); }
.brand p { margin: 0; font-size: 0.8rem; color: var(--text-secondary); }

.nav-menu { flex: 1; display: flex; flex-direction: column; padding: 0 1rem; gap: 0.5rem; }
.nav-menu button { background: transparent; border: none; color: var(--text-secondary); text-align: left; padding: 12px 15px; border-radius: 8px; cursor: pointer; transition: all 0.2s; font-size: 0.95rem; }
.nav-menu button:hover { background: var(--panel-bg); color: var(--text-primary); }
.nav-menu button.active { background: var(--accent-glow); color: var(--accent-primary); font-weight: 600; border-left: 3px solid var(--accent-primary); }

.sidebar-footer { padding: 1.5rem; }
.w-full { width: 100%; }

.content { flex: 1; display: flex; flex-direction: column; }
.content-header { padding: 2rem 3rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
.content-header h3 { margin: 0; font-size: 1.5rem; font-weight: 600; }
.scroll-area { flex: 1; padding: 2rem 3rem; overflow-y: auto; }

/* 共用按鈕樣式 */
.btn-primary { background: var(--accent-primary); color: white; border: none; padding: 0.6rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
.btn-primary:hover:not(:disabled) { opacity: 0.85; box-shadow: 0 0 10px var(--accent-glow); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-secondary { background: var(--btn-bg); color: var(--text-primary); border: 1px solid var(--border-color); padding: 0.6rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
.btn-secondary:hover { background: var(--panel-bg); border-color: var(--accent-primary); color: var(--accent-primary); }

.btn-danger { background: transparent; color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.4); padding: 0.6rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
.btn-danger:hover { background: rgba(239, 68, 68, 0.1); border-color: #ef4444; }

.mt-3 { margin-top: 1rem; }
</style>