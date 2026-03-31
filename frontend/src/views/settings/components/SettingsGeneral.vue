<template>
  <div class="settings-panel">
    <div class="form-group toggle-group" v-if="store.settings.generalSettings">
      <div class="toggle-info">
        <label>Telemetry: Token Usage</label>
        <span class="sub-text">在介面上顯示每次對話消耗的 Token 數量</span>
      </div>
      <label class="switch">
        <input type="checkbox" v-model="store.settings.generalSettings.showTokenUsage" />
        <span class="slider round"></span>
      </label>
    </div>
    
    <div class="form-group toggle-group" v-if="store.settings.generalSettings">
      <div class="toggle-info">
        <label>Multi-Agents (多智能體協作)</label>
        <span class="sub-text">允許 Lilith 在背景召喚其他小型 AI 協助處理複雜任務</span>
      </div>
      <label class="switch">
        <input type="checkbox" v-model="store.settings.generalSettings.multiAgents" />
        <span class="slider round"></span>
      </label>
    </div>
    
    <div class="form-group toggle-group" v-if="store.settings.generalSettings">
      <div class="toggle-info">
        <label>Self-Improve (自我進化)</label>
        <span class="sub-text">允許系統在閒置時自動反思並優化程式碼與記憶</span>
      </div>
      <label class="switch">
        <input type="checkbox" v-model="store.settings.generalSettings.selfImprove" />
        <span class="slider round"></span>
      </label>
    </div>
    
    <div class="form-group toggle-group" v-if="store.settings.generalSettings">
      <div class="toggle-info">
        <label>Scheduled Tasks (背景排程)</label>
        <span class="sub-text">啟用時間感知與自動觸發的本能行為</span>
      </div>
      <label class="switch">
        <input type="checkbox" v-model="store.settings.generalSettings.scheduledTasks" />
        <span class="slider round"></span>
      </label>
    </div>
  </div>
</template>

<script setup>
import { useConfigStore } from '@/stores/configStore';
const store = useConfigStore();
</script>

<style scoped>
.settings-panel { max-width: 650px; animation: fadeIn 0.3s ease; }
.form-group { margin-bottom: 1.5rem; }
.toggle-group { display: flex; justify-content: space-between; align-items: center; padding: 1.2rem; background: var(--panel-bg); border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 1rem; }
.toggle-info label { margin: 0; font-size: 0.95rem; font-weight: 600; color: var(--text-primary); }
.sub-text { display: block; font-size: 0.75rem; color: var(--text-secondary); opacity: 0.7; margin-top: 4px; }

/* Switch Toggle */
.switch { position: relative; display: inline-block; width: 46px; height: 24px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--border-color); transition: .4s; }
.slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; }
input:checked + .slider { background-color: var(--accent-primary); }
input:checked + .slider:before { transform: translateX(22px); }
.slider.round { border-radius: 24px; }
.slider.round:before { border-radius: 50%; }

@keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
</style>