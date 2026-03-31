<template>
  <div class="settings-panel large-panel">
    <div class="form-group">
      <label>對話風格 (Conversation Style)</label>
      <input type="text" v-model="store.settings.conversationStyle" class="input-field" placeholder="例如：俐落、自然、微傲嬌" />
    </div>
    <div class="form-group">
      <label>核心互動守則 (Interaction Rules)</label>
      <textarea v-model="store.settings.interactionRules" class="input-field" rows="3"></textarea>
    </div>
    
    <div class="grid-2-col">
      <div class="form-group">
        <label>角色設定卡 (Character Card) 📝</label>
        <textarea v-model="store.settings.characterCard" class="input-field code-font" rows="12"></textarea>
      </div>
      <div class="form-group">
        <label>使用者核心記憶 (User.md) 🧠</label>
        <textarea v-model="store.settings.userMemory" class="input-field code-font" rows="12"></textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useConfigStore } from '@/stores/configStore';
const store = useConfigStore();
</script>

<style scoped>
.settings-panel { animation: fadeIn 0.3s ease; }
.settings-panel.large-panel { max-width: 900px; }
.form-group { margin-bottom: 1.5rem; }
.form-group label { display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.5rem; }
.input-field { width: 100%; padding: 0.8rem 1rem; background: var(--panel-bg); border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.95rem; color: var(--text-primary); transition: all 0.2s; box-sizing: border-box; }
.input-field:focus { outline: none; border-color: var(--accent-primary); box-shadow: 0 0 5px var(--accent-glow); }
.grid-2-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.code-font { font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 0.85rem; line-height: 1.6; tab-size: 2; white-space: pre-wrap; resize: vertical; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
</style>