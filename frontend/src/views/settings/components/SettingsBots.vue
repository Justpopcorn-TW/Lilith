<template>
  <div class="settings-panel">
    <p class="help-text mb-4">將 Lilith 的意識投射到不同的通訊軟體中。啟用後請填入對應的 Bot Token。</p>
    <template v-if="store.settings.bots && store.settings.bots.length > 0">
      <div v-for="(bot, index) in store.settings.bots" :key="index" class="bot-card">
        <div class="bot-header">
          <div class="bot-title">
            <span class="bot-icon">{{ getBotIcon(bot.platform) }}</span>
            <strong>{{ bot.name }}</strong>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="bot.enabled" />
            <span class="slider round"></span>
          </label>
        </div>
        <div v-if="bot.enabled" class="bot-body">
          <input type="password" v-model="bot.apiKey" class="input-field" :placeholder="`請輸入 ${bot.platform} Token`" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { useConfigStore } from '@/stores/configStore';
const store = useConfigStore();

const getBotIcon = (platform) => {
  const icons = { discord: '🎮', telegram: '✈️', whatsapp: '💬', line: '🟢' };
  return icons[platform.toLowerCase()] || '🤖';
};
</script>

<style scoped>
.settings-panel { max-width: 650px; animation: fadeIn 0.3s ease; }
.help-text { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.8rem; opacity: 0.8; }
.mb-4 { margin-bottom: 1.5rem; }

/* Switch Toggle */
.switch { position: relative; display: inline-block; width: 46px; height: 24px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--border-color); transition: .4s; }
.slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; }
input:checked + .slider { background-color: var(--accent-primary); }
input:checked + .slider:before { transform: translateX(22px); }
.slider.round { border-radius: 24px; }
.slider.round:before { border-radius: 50%; }

/* Cards & Inputs */
.bot-card { background: var(--panel-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.2rem; margin-bottom: 1rem; transition: border-color 0.3s; }
.bot-card:focus-within { border-color: var(--accent-primary); }
.bot-header { display: flex; justify-content: space-between; align-items: center; }
.bot-title { display: flex; align-items: center; gap: 10px; font-size: 1.1rem; }
.bot-icon { font-size: 1.5rem; }
.bot-body { margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed var(--border-color); animation: fadeIn 0.3s ease; }
.input-field { width: 100%; padding: 0.8rem 1rem; background: var(--panel-bg); border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.95rem; color: var(--text-primary); transition: all 0.2s; box-sizing: border-box; }
.input-field:focus { outline: none; border-color: var(--accent-primary); box-shadow: 0 0 5px var(--accent-glow); }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
</style>