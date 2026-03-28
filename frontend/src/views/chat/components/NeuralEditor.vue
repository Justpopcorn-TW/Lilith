<template>
  <transition name="fade-scale">
    <div v-if="show" class="neural-link-overlay" @click.self="$emit('close')">
      
        <n-modal 
        :show="show" 
        @update:show="(val) => { if (!val) $emit('close') }"
        preset="card" 
        class="neural-vscode-modal" 
        :bordered="false"
        :on-after-leave="() => $emit('close')"
        content-style="padding: 0; height: 100vh; display: flex; flex-direction: column;"
        style="width: 100%; height: 100%; max-width: 100%; margin: 0; border-radius: 0; background: #11111b;"
        >
        
        <template #header>
          <div class="neural-title">
            <span class="pulse-dot">🔴</span> [NEURAL LINK] LILITH CORE EDITOR v1.0
          </div>
        </template>
        <template #header-extra>
          <button class="modal-close-btn" @click="$emit('close')">× Close</button>
        </template>

        <div class="vscode-layout">
          
          <aside class="vscode-sidebar">
            <div class="sidebar-header">EXPLORER</div>
            <div class="vscode-file-tree">
              <div v-for="file in fileList" :key="file.name" class="vscode-tree-item" @click="selectNode(file)">
                <span class="file-icon">{{ file.type === 'folder' ? '📂' : '📄' }}</span> 
                {{ file.name }}
              </div>
              <div v-if="fileList.length === 0" class="empty-folder">(Empty)</div>
            </div>
          </aside>

          <main class="vscode-main">
            <div class="vscode-tabs-container">
              <div v-for="file in openFiles" :key="file.path" class="vscode-tab" :class="{ active: activeFilePath === file.path }" @click="activeFilePath = file.path">
                {{ file.name }} <span class="tab-unsaved-dot" v-if="file.isDirty">●</span>
                <span class="close-tab" @click.stop="(e) => closeFile(file.path, e)">×</span>
              </div>
            </div>
            
            <div class="vscode-editor-pane">
              <div class="editor-gutter">
                <span v-for="n in lineCount" :key="n" class="line-number">{{ n }}</span>
              </div>
              
              <div class="editor-area-wrapper">
                <textarea 
                  v-if="activeFile" 
                  class="code-area neural-textarea" 
                  :value="activeFile.content" 
                  @input="handleInput"
                  spellcheck="false"
                  ref="textareaRef"
                ></textarea>
                
                <div v-if="showSuggestions" class="vscode-suggestions-popup" :style="suggestionsStyle">
                  <div class="suggestion-item active">DOPAMINE_METABOLISM_RATE</div>
                  <div class="suggestion-item">CORTISOL_STRESS_THRESHOLD</div>
                  <div class="suggestion-item">OXYTOCIN_TRUST_PROTOCOL</div>
                  <div class="suggestion-item">system.apply_neural_logic()</div>
                  <div class="suggestion-item">system.reboot_core()</div>
                </div>
              </div>
            </div>
          </main>
        </div>

        <footer class="vscode-bottom-panel">
          <div class="panel-header">
            <span class="panel-tab active">CORE LOGS</span>
            <span class="panel-tab">COMMAND TERMINAL</span>
          </div>
          <div class="logs-content read-only-pre">
            <pre class="log-pre" ref="logsRef">
> [SYSTEM] Initializing Neural Link... OK
> [MEM] Memory Context Synchronized... OK
> [AES] All endocrine values are nominal.
> [WARN] Minor code degradation in CognitiveEngine.js (Line 42).
> Waiting for Neural Reboot Command...
            </pre>
          </div>
          <div class="command-bar">
            <span class="terminal-prefix">lilith@core:~/$</span>
            <input type="text" class="terminal-input" placeholder="模擬命令行..." @keydown.enter="simulateCommand" />
          </div>
        </footer>

        </n-modal>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue';
import { NModal, useMessage } from 'naive-ui';
import { useIDE } from '../composables/useIDE.js';

const props = defineProps({
  show: Boolean
});
defineEmits(['close']);

const message = useMessage();
const textareaRef = ref(null);
const logsRef = ref(null);

// 🌟 自動補齊相關狀態
const showSuggestions = ref(false);
const suggestionsStyle = ref({ top: '0px', left: '0px' });
const lineCount = computed(() => {
  if (!activeFile.value) return 1;
  return activeFile.value.content.split('\n').length || 1;
});

// Composable Extraction (與 RightIDE 共用同一個狀態store)
const { 
  fileList, openFiles, activeFile, activeFilePath,
  selectNode, closeFile, updateContent, saveFile
} = useIDE();

// --- Event Handlers ---

// 🌟 模擬自動補齊邏輯
const handleInput = (e) => {
  const text = e.target.value;
  updateContent(text);
  
  // 當輸入 '.' 或在特徵位置時顯示彈窗
  const cursorPos = e.target.selectionStart;
  const lastChar = text[cursorPos - 1];
  
  if (lastChar === '.') {
    const coords = getCursorCoordinates(e.target);
    suggestionsStyle.value = {
      top: `${coords.y + 20}px`, // 彈窗顯示在光標下方
      left: `${coords.x}px`
    };
    showSuggestions.value = true;
  } else if (text.endsWith('system') || text.endsWith('const')) {
      showSuggestions.value = true;
      suggestionsStyle.value = { top: '50px', left: '150px' }; // 定點模擬
  }
   else {
    showSuggestions.value = false;
  }
};

// 🌟 模擬命令行執行
const simulateCommand = (e) => {
  const cmd = e.target.value;
  message.loading(`Executing [${cmd}] on Neural Core...`);
  message.info(`Command simulation finished. (Command Line not fully implemented)`, { duration: 3000 });
  e.target.value = '';
};

// 輔助函式：獲取 Textarea 光標坐標 (模擬)
const getCursorCoordinates = (textarea) => {
  // 這裡是一個極簡的模擬，真實實現需要精確計算文字寬度、行高、捲動位置等
  const rect = textarea.getBoundingClientRect();
  return {
    x: 30, // 模擬左側 gutter
    y: 0
  };
};

</script>

<style scoped>
/* 🌟 全屏模態與 VSCode 排版核心 */
.neural-vscode-modal { --modal-bg: #11111b; font-family: 'JetBrains Mono', monospace; color: #cdd6f4; }
.neural-title { display: flex; align-items: center; gap: 6px; font-weight: bold; color: #fab387; }
.pulse-dot { color: #f38ba8; animation: pulse 1s infinite; font-size: 0.8em; }
.modal-close-btn { background: none; border: none; color: #999; cursor: pointer; }
.modal-close-btn:hover { color: #f38ba8; }

/* 🌟 VSCode Layout */
.vscode-layout { display: flex; flex: 1; height: calc(100vh - 40px - 150px); /* 減去 Header 和底部 Panel */ }

/* 左側邊欄 (探索器) */
.vscode-sidebar { width: 180px; flex-shrink: 0; background: #181825; border-right: 1px solid #313244; display: flex; flex-direction: column; }
.sidebar-header { padding: 10px 15px; font-size: 0.7em; font-weight: bold; color: var(--text-secondary); text-transform: uppercase; border-bottom: 1px solid #313244; }
.vscode-file-tree { padding: 5px 0; overflow-y: auto; font-size: 0.8em; color: var(--text-secondary); }
.vscode-file-tree::-webkit-scrollbar { width: 3px; }
.vscode-file-tree::-webkit-scrollbar-thumb { background: #313244; }
.vscode-tree-item { padding: 3px 15px; cursor: pointer; transition: 0.15s; white-space: nowrap; }
.vscode-tree-item:hover { background: rgba(234, 76, 137, 0.05); color: #cdd6f4; }
.file-icon { margin-right: 6px; }

/* 中間主欄 (編輯器) */
.vscode-main { flex-grow: 1; background: #11111b; display: flex; flex-direction: column; overflow: hidden; }

/* Tabs */
.vscode-tabs-container { height: 35px; background: #181825; display: flex; overflow-x: auto; flex-shrink: 0; border-bottom: 1px solid #313244; }
.vscode-tabs-container::-webkit-scrollbar { height: 2px; }
.vscode-tabs-container::-webkit-scrollbar-thumb { background: #313244; }
.vscode-tab { padding: 0 10px; color: var(--text-secondary); font-size: 0.8em; display: flex; align-items: center; gap: 8px; cursor: pointer; border-right: 1px solid #313244; min-width: 100px; user-select: none; transition: 0.2s; white-space: nowrap; position: relative; }
.vscode-tab.active { background: #1e1e2e; color: #cdd6f4; border-bottom: none; }
.vscode-tab.active:after { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: #ea4c89; }
.tab-unsaved-dot { font-size: 1.2em; color: #ea4c89; margin-right: -2px; }
.close-tab { border-radius: 4px; width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.1em; transition: 0.2s; color: #6c7086; }
.close-tab:hover { background: rgba(255,255,255,0.05); color: #f38ba8; }

/* 編輯器核心 */
.vscode-editor-pane { flex-grow: 1; display: flex; position: relative; overflow: hidden; }

/* Gutter 行號 */
.editor-gutter { width: 30px; background: #1e1e2e; color: #6c7086; text-align: right; font-size: 0.8em; padding: 15px 5px; box-sizing: border-box; display: flex; flex-direction: column; line-height: 1.6; user-select: none; }
.line-number { display: block; }

.editor-area-wrapper { flex-grow: 1; position: relative; }

/* 🌟 Textarea 代碼編輯器 (代碼高亮風格) */
.code-area.neural-textarea { 
  width: 100%; height: 100%; padding: 15px; 
  background: #1e1e2e; color: #cdd6f4; /* 深色背景，米色文字 */
  border: none; outline: none; resize: none; 
  font-family: 'JetBrains Mono', monospace; font-size: 0.85em; line-height: 1.6; 
  transition: none; 
}
.code-area.neural-textarea:focus { border: 1px solid var(--accent-primary) !important; box-shadow: inset 0 0 10px var(--accent-glow); }

/* 🌟 自動補齊彈窗 (Suggestions Popup) 樣式 */
.vscode-suggestions-popup { 
  position: absolute; width: 220px; 
  background: #181825; border: 1px solid #313244; border-radius: 4px; 
  box-shadow: 0 4px 15px rgba(0,0,0,0.3); z-index: 100;
  font-size: 0.8em; color: #cdd6f4; 
  overflow: hidden; padding: 2px 0;
}
.suggestion-item { padding: 4px 10px; cursor: pointer; transition: 0.1s; }
.suggestion-item.active { background: #313244; color: #ea4c89; font-weight: bold; }
.suggestion-item:hover { background: #2a2b3b; }

/* 🌟 VSCode 底部日誌 + 命令行 */
.vscode-bottom-panel { height: 150px; flex-shrink: 0; background: #181825; border-top: 1px solid #313244; display: flex; flex-direction: column; }
.panel-header { display: flex; gap: 15px; padding: 5px 15px; border-bottom: 1px solid #313244; }
.panel-tab { font-size: 0.7em; font-weight: bold; color: var(--text-secondary); cursor: pointer; text-transform: uppercase; padding: 2px 0; position: relative; }
.panel-tab.active { color: #fab387; }
.panel-tab.active:after { content: ''; position: absolute; bottom: -6px; left: 0; width: 100%; height: 2px; background: #fab387; }

/* 日誌內容改為 ReadPre 風格 */
.logs-content { flex-grow: 1; padding: 10px 15px; overflow-y: auto; font-size: 0.75em; color: #a6e3a1; /* 粉綠色日誌 */ }
.logs-content::-webkit-scrollbar { width: 3px; }
.logs-content::-webkit-scrollbar-thumb { background: #313244; }
.log-pre { margin: 0; line-height: 1.4; color: #a6e3a1; font-family: 'JetBrains Mono', monospace; white-space: pre-wrap; word-break: break-word; }

/* 🌟 命令行 Input */
.command-bar { height: 25px; background: #11111b; border-top: 1px solid #313244; display: flex; align-items: center; padding: 0 10px; gap: 8px; font-size: 0.8em; }
.terminal-prefix { color: #ea4c89; font-weight: bold; }
.terminal-input { flex-grow: 1; background: transparent; border: none; outline: none; color: #cdd6f4; font-family: inherit; font-size: inherit; margin: 0; padding: 0; }
.terminal-input::placeholder { color: #585b70; opacity: 0.7; }

/* 動畫 */
.fade-scale-enter-active, .fade-scale-leave-active { transition: all 0.25s ease; }
.fade-scale-enter-from, .fade-scale-leave-to { opacity: 0; transform: scale(0.98) translateY(10px); filter: blur(10px); }

@keyframes pulse { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
</style>