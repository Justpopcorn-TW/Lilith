<template>
  <div class="settings-layout">
    <aside class="sidebar">
      <div class="brand">
        <h2>⚙️ Lilith 控制台</h2>
        <p>System Configuration</p>
      </div>
      <nav class="nav-menu">
        <button :class="{ active: activeTab === 'engine' }" @click="activeTab = 'engine'">🧠 大腦引擎 (Engine)</button>
        <button :class="{ active: activeTab === 'persona' }" @click="activeTab = 'persona'">🎭 人格參數 (Persona)</button>
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
        <div v-show="activeTab === 'engine'" class="settings-panel">
          <div class="form-group">
            <label>Primary Model (大腦皮層)</label>
            <select v-model="form.llmModel" class="input-field">
              <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro Preview (推薦)</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
              <option value="claude-opus-4-6">Claude Opus 4.6</option>
              <option value="gpt-5.4">gpt-5.4</option>
              <option value="lm-studio">Local LLM (LM Studio)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Subconscious Model (數位杏仁核)</label>
            <select v-model="form.fastModel" class="input-field">
              <option value="gemini-3.1-flash-lite-preview">Gemini 3.1 Flash Lite (推薦)</option>
              <option value="gpt-4o-mini">GPT-4o-Mini</option>
              <option value="claude-3-5-haiku">Claude 3.5 Haiku</option>
              <option value="lm-studio">Local LLM (LM Studio)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Vector Embedding Model (海馬迴)</label>
            <select v-model="form.vectorModel" class="input-field">
              <option value="gemini-embedding-2-preview">gemini-embedding-2-preview</option>
              <option value="text-embedding-3-small">text-embedding-3-small</option>
            </select>
          </div>
          <div class="form-group mt-4">
            <label>Primary LLM API Key</label>
            <input type="password" v-model="form.llmApiKey" class="input-field" autocomplete="new-password" spellcheck="false" />
          </div>
          <div class="form-group">
            <label>Subconscious API Key</label>
            <input type="password" v-model="form.fastApiKey" class="input-field" placeholder="若與 Primary 相同可留空" autocomplete="new-password" spellcheck="false" />
          </div>
          <div class="form-group">
            <label>Vector DB API Key</label>
            <input type="password" v-model="form.vectorApiKey" class="input-field" placeholder="若與 Primary 相同可留空" autocomplete="new-password" spellcheck="false" />
          </div>
        </div>

        <div v-show="activeTab === 'persona'" class="settings-panel">
          <div class="form-group">
            <label>對話風格 (Conversation Style)</label>
            <input type="text" v-model="form.conversationStyle" class="input-field" placeholder="例如：俐落、自然、微傲嬌" />
          </div>
          <div class="form-group">
            <label>核心互動守則 (Interaction Rules)</label>
            <textarea v-model="form.interactionRules" class="input-field" rows="4"></textarea>
          </div>
          <div class="form-group">
            <label>角色設定卡 (Character Card - Markdown)</label>
            <textarea v-model="form.characterCard" class="input-field" rows="10"></textarea>
          </div>
        </div>

        <div v-show="activeTab === 'general'" class="settings-panel">
          <div class="form-group toggle-group">
            <label>Telemetry: Token Usage (顯示運算消耗)</label>
            <input type="checkbox" v-model="form.generalSettings.showTokenUsage" />
          </div>
          <div class="form-group toggle-group">
            <label>Multi-Agents (多智能體協作)</label>
            <input type="checkbox" v-model="form.generalSettings.multiAgents" />
          </div>
          <div class="form-group toggle-group">
            <label>Self-Improve (自我進化)</label>
            <input type="checkbox" v-model="form.generalSettings.selfImprove" />
          </div>
          <div class="form-group toggle-group">
            <label>Scheduled Tasks (背景排程)</label>
            <input type="checkbox" v-model="form.generalSettings.scheduledTasks" />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useConfigStore } from '@/stores/configStore';

const router = useRouter();
const configStore = useConfigStore();
const activeTab = ref('engine');
const isSaving = ref(false);

const tabTitle = computed(() => {
  if (activeTab.value === 'engine') return '核心引擎設定';
  if (activeTab.value === 'persona') return '人格與行為設定';
  return '系統通用設定';
});

const form = reactive({
  llmModel: 'gemini-3.1-pro-preview',
  fastModel: 'gemini-3.1-flash-lite-preview',
  vectorModel: 'gemini-embedding-2-preview',
  llmApiKey: '',
  fastApiKey: '',
  vectorApiKey: '',
  interactionRules: '',
  conversationStyle: '',
  characterCard: '',
  generalSettings: {
    multiAgents: false,
    selfImprove: false,
    scheduledTasks: false,
    showTokenUsage: true
  }
});

onMounted(async () => {
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      if (data.llmModel) form.llmModel = data.llmModel;
      if (data.fastModel) form.fastModel = data.fastModel;
      if (data.vectorModel) form.vectorModel = data.vectorModel;
      
      if (data.LLM_API_KEY) form.llmApiKey = data.LLM_API_KEY;
      if (data.FAST_LLM_API_KEY) form.fastApiKey = data.FAST_LLM_API_KEY;
      if (data.LTM_LLM_API_KEY) form.vectorApiKey = data.LTM_LLM_API_KEY;
      
      if (data.characterCard) form.characterCard = data.characterCard;
      if (data.interactionRules) form.interactionRules = data.interactionRules;
      if (data.conversationStyle) form.conversationStyle = data.conversationStyle;

      if (data.generalSettings) {
        form.generalSettings = { ...form.generalSettings, ...data.generalSettings };
      }
    }
  } catch (error) {
    console.error("載入設定失敗", error);
  }
});

const saveSettings = async () => {
  isSaving.value = true;
  try {
    const payload = {
      llmModel: form.llmModel,
      fastModel: form.fastModel,
      vectorModel: form.vectorModel,
      LLM_API_KEY: form.llmApiKey,
      FAST_LLM_API_KEY: form.fastApiKey || form.llmApiKey,
      LTM_LLM_API_KEY: form.vectorApiKey || form.llmApiKey,
      interactionRules: form.interactionRules,
      conversationStyle: form.conversationStyle,
      characterCard: form.characterCard,
      generalSettings: form.generalSettings
    };

    const response = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('儲存失敗');

    configStore.generalSettings = form.generalSettings;

    setTimeout(() => {
      router.push('/chat');
    }, 1500);

  } catch (error) {
    alert(`設定儲存失敗: ${error.message}`);
    isSaving.value = false;
  }
};

const goBack = () => {
  router.push('/chat');
};

// 🌟 新增：返回設定精靈的函式，加入防呆確認
const goToSetup = () => {
  if (confirm('確定要重新執行啟動精靈嗎？您現有的設定會被載入至精靈中。')) {
    router.push('/setup');
  }
};
</script>

<style scoped>
/* 🌟 1. 整體佈局：綁定背景與主文字顏色變數 */
.settings-layout {
  display: flex;
  height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
  transition: all 0.3s ease;
}

/* 🌟 2. 側邊欄：綁定次要背景與邊框變數 */
.sidebar {
  width: 250px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.brand {
  padding: 2rem 1.5rem;
}
.brand h2 { margin: 0; font-size: 1.2rem; color: var(--text-primary); transition: color 0.3s ease; }
.brand p { margin: 0; font-size: 0.8rem; color: var(--text-secondary); transition: color 0.3s ease; }

.nav-menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 1rem;
  gap: 0.5rem;
}

.nav-menu button {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  text-align: left;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.nav-menu button:hover { 
  background: var(--panel-bg); 
  color: var(--text-primary); 
}
/* 🌟 選中狀態：綁定主題發光與主色變數 */
.nav-menu button.active { 
  background: var(--accent-glow); 
  color: var(--accent-primary); 
  font-weight: 600; 
}

.sidebar-footer { padding: 1.5rem; }
.w-full { width: 100%; }

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content-header {
  padding: 2rem 3rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.content-header h3 { margin: 0; font-size: 1.5rem; font-weight: 600; }

.scroll-area {
  flex: 1;
  padding: 2rem 3rem;
  overflow-y: auto;
}

.settings-panel { max-width: 600px; }

.form-group { margin-bottom: 1.5rem; }
.form-group label { 
  display: block; 
  font-size: 0.85rem; 
  font-weight: 600; 
  color: var(--text-secondary); 
  margin-bottom: 0.5rem; 
  transition: color 0.3s ease; 
}

/* 🌟 輸入框與面板：綁定面板背景與邊框變數 */
.input-field { 
  width: 100%; 
  padding: 0.8rem 1rem; 
  background: var(--panel-bg);
  border: 1px solid var(--border-color); 
  border-radius: 8px; 
  font-size: 1rem; 
  color: var(--text-primary); 
  transition: all 0.2s; 
  box-sizing: border-box; 
}
.input-field:focus { 
  outline: none; 
  border-color: var(--accent-primary); 
  box-shadow: 0 0 5px var(--accent-glow); 
}

.mt-4 { margin-top: 1.5rem; }
.mt-3 { margin-top: 1rem; }

.toggle-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--panel-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.3s ease;
}
.toggle-group label { margin: 0; }

/* 🌟 主按鈕：綁定主題色 */
.btn-primary { 
  background: var(--accent-primary); 
  color: white; 
  border: none; 
  padding: 0.6rem 1.5rem; 
  border-radius: 8px; 
  font-weight: 600; 
  cursor: pointer; 
  transition: all 0.2s ease; 
}
.btn-primary:hover:not(:disabled) { 
  opacity: 0.85; 
  box-shadow: 0 0 10px var(--accent-glow); 
}
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

/* 🌟 次要按鈕：適應深淺色的按鈕背景 */
.btn-secondary { 
  background: var(--btn-bg); 
  color: var(--text-primary); 
  border: 1px solid var(--border-color); 
  padding: 0.6rem 1.5rem; 
  border-radius: 8px; 
  font-weight: 600; 
  cursor: pointer; 
  transition: all 0.2s ease; 
}
.btn-secondary:hover { 
  background: var(--panel-bg); 
  border-color: var(--accent-primary); 
  color: var(--accent-primary); 
}

/* 警示按鈕保持紅色不變，但調整為半透明邊框適應所有主題 */
.btn-danger { 
  background: transparent; 
  color: #ef4444; 
  border: 1px solid rgba(239, 68, 68, 0.4); 
  padding: 0.6rem 1.5rem; 
  border-radius: 8px; 
  font-weight: 600; 
  cursor: pointer; 
  transition: 0.2s; 
}
.btn-danger:hover { 
  background: rgba(239, 68, 68, 0.1); 
  border-color: #ef4444;
}
</style>