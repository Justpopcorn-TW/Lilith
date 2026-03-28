<template>
  <transition name="fade-scale">
    <div v-if="show" class="neural-editor-viewport-full" @click.self="$emit('close')">
      <div class="neural-core-console">
        
        <header class="console-header-mini">
          <div class="header-left">
            <span class="pulse-dot">🧬</span> 
            <span class="sys-title-mini">NEURAL CORE OVERRIDE v1.0</span>
          </div>
          
          <div class="header-tools">
            <n-button 
              v-if="activeFile && activeFile.isDirty" 
              size="tiny" 
              type="primary" 
              @click="handleSave" 
              class="save-btn-cyber"
              :loading="isApplying"
            >
              SAVE CHANGES
            </n-button>
            <button class="modal-close-btn-mini" @click="$emit('close')">×</button>
          </div>
        </header>

        <div class="vscode-layout-full">
          <aside class="vscode-sidebar">
            <div class="sidebar-header-title">
              <span>EXPLORER</span>
              <button class="nav-icon-btn" @click="reloadRoot" title="Refresh">↻</button>
            </div>
            <div class="vscode-file-tree">
              <div 
                v-for="(file, index) in flatFileTree" 
                :key="file.path" 
                class="vscode-tree-item" 
                :class="{ active: activeFilePath === file.path }"
                :style="{ paddingLeft: `${10 + file.depth * 15}px` }"
                @click="handleNodeClick(file, index)"
              >
                <span class="tree-chevron" v-if="file.type === 'folder'">
                  {{ expandedFolders.has(file.path) ? '▼' : '▶' }}
                </span>
                <span class="tree-chevron-empty" v-else></span>
                
                <span class="file-icon">{{ file.type === 'folder' ? (expandedFolders.has(file.path) ? '📂' : '📁') : '📄' }}</span> 
                <span class="file-name">{{ file.name }}</span>
              </div>
              <div v-if="flatFileTree.length === 0" class="empty-folder">(Empty)</div>
            </div>
          </aside>

          <div class="vscode-right-panel">
            <main class="vscode-main">
              <div class="monaco-editor-wrapper-full">
                <vue-monaco-editor
                  v-if="activeFile"
                  v-model:value="activeFile.content"
                  :language="inferLanguage(activeFile.name)"
                  :theme="'lilith-cyber-full'"
                  :options="monacoOptions"
                  @change="(val) => updateContent(val)"
                  @mount="handleEditorMount"
                  class="real-monaco-editor"
                />
                
                <div v-else class="empty-state-full">
                  <div class="watermark-cyber">LILITH</div>
                  <p>SELECT A FILE TO START NEURAL OVERRIDE</p>
                </div>
              </div>
            </main>

            <footer class="vscode-bottom-panel">
              <div class="panel-header">
                <span class="panel-tab active">TERMINAL</span>
                <span class="panel-tab">OUTPUT</span>
              </div>
              <div class="logs-content read-only-pre" ref="logContainer">
                <pre class="log-pre" v-for="(log, idx) in terminalLogs" :key="idx">{{ log }}</pre>
              </div>
              <div class="command-bar">
                <span class="terminal-prefix">lilith@core:~/$</span>
                <input 
                  type="text" 
                  class="terminal-input" 
                  placeholder="Type 'reboot' to restart core..." 
                  v-model="terminalInput"
                  @keydown.enter="executeCommand"
                />
              </div>
            </footer>
          </div>
        </div>

      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue';
import { NButton, useMessage } from 'naive-ui';
import { useIDE } from '../composables/useIDE.js'; 
import { VueMonacoEditor } from '@guolao/vue-monaco-editor';

const props = defineProps({ show: Boolean });
defineEmits(['close']);

const message = useMessage();
const logContainer = ref(null);

// 從 useIDE 拿取邏輯 (放棄其內建的 fileList，改用客製化 Tree)
const { 
  activeFile, activeFilePath, isApplying,
  terminalLogs, terminalInput, monacoOptions,
  selectNode, updateContent, saveFile, 
  executeCommand, inferLanguage
} = useIDE();

// ==========================================================
// 🌟 VSCode 風格樹狀目錄邏輯 (Flat Tree)
// ==========================================================
const flatFileTree = ref([]);
const expandedFolders = ref(new Set());

// 抓取指定層級的目錄資料
const fetchDir = async (dirPath) => {
  const res = await fetch(`/api/fs/list?dir=${dirPath}`);
  const data = await res.json();
  return data.filter(f => !['node_modules', '.git', '.DS_Store'].includes(f.name));
};

// 載入並插入節點
const loadDirectory = async (dirPath, depth, insertIndex = -1) => {
  try {
    const items = await fetchDir(dirPath);
    const nodes = items.map(f => ({ ...f, depth }));
    
    // 排序：資料夾優先，再來按名稱排序
    nodes.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'folder' ? -1 : 1;
    });

    if (insertIndex === -1) {
      flatFileTree.value = nodes;
    } else {
      flatFileTree.value.splice(insertIndex, 0, ...nodes);
    }
  } catch(e) { console.error("Tree Load Error:", e) }
};

// 展開 / 折疊資料夾
const toggleFolder = async (folder, index) => {
  if (expandedFolders.value.has(folder.path)) {
    // 折疊：移除 Set 中的狀態與底下所有子節點
    expandedFolders.value.delete(folder.path);
    for (let path of expandedFolders.value) {
      if (path.startsWith(folder.path + '/')) expandedFolders.value.delete(path);
    }
    flatFileTree.value = flatFileTree.value.filter(f => !f.path.startsWith(folder.path + '/'));
  } else {
    // 展開：標記狀態並去抓資料插入
    expandedFolders.value.add(folder.path);
    await loadDirectory(folder.path, folder.depth + 1, index + 1);
  }
};

// 處理點擊事件：資料夾展開，檔案交給 useIDE 開啟
const handleNodeClick = (node, index) => {
  if (node.type === 'folder') {
    toggleFolder(node, index);
  } else {
    selectNode(node); 
  }
};

// 刷新整個檔案樹
const reloadRoot = () => {
  expandedFolders.value.clear();
  loadDirectory('.', 0);
};

// 初始化：載入根目錄
onMounted(() => {
  reloadRoot();
});

// ==========================================================
// Monaco 主題與其他邏輯
// ==========================================================
const handleEditorMount = (editor, monaco) => {
  monaco.editor.defineTheme('lilith-cyber-full', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6c7086', fontStyle: 'italic' }, 
      { token: 'keyword', foreground: 'ea4c89', fontStyle: 'bold' },    
      { token: 'string', foreground: 'a6e3a1' },                        
      { token: 'number', foreground: 'fab387' },                        
      { token: 'identifier', foreground: 'cdd6f4' },                    
      { token: 'type', foreground: '89b4fa' },                          
    ],
    colors: {
      'editor.background': '#1e1e2e', 
      'editor.foreground': '#cdd6f4', 
      'editor.lineHighlightBackground': '#31324440', 
      'editorCursor.foreground': '#ea4c89', 
      'editorIndentGuide.background': '#313244', 
      'editor.selectionBackground': '#585b7050', 
    }
  });
  monaco.editor.setTheme('lilith-cyber-full');
};

const handleSave = async () => {
  message.loading("Saving override...");
  try {
    await saveFile();
    message.success("Memory override successful.");
  } catch (e) {
    message.error("Save failed.");
  }
};

// 自動捲動日誌到底部
watch(terminalLogs, async () => {
  await nextTick();
  if (logContainer.value) logContainer.value.scrollTop = logContainer.value.scrollHeight;
}, { deep: true });
</script>

<style scoped>
/* 全屏滿版遮罩 */
.neural-editor-viewport-full { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.95); backdrop-filter: blur(15px); display: flex; align-items: center; justify-content: center; z-index: 10000; overflow: hidden; }

/* 核心容器 */
.neural-core-console { width: 100vw; height: 100vh; background: #1e1e2e; display: flex; flex-direction: column; border-radius: 0; overflow: hidden; box-shadow: 0 0 0 2px var(--accent-glow); }

/* Header */
.console-header-mini { height: 35px; background: #11111b; display: flex; justify-content: space-between; align-items: center; padding: 0 15px; font-size: 0.7em; color: #cdd6f4; flex-shrink: 0; border-bottom: 1px solid #313244; }
.header-left { display: flex; align-items: center; gap: 8px; }
.pulse-dot { color: var(--accent-primary); animation: pulse 1s infinite; font-size: 0.9em; }
.sys-title-mini { color: var(--accent-primary); font-weight: bold; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; }
.header-tools { display: flex; align-items: center; gap: 12px; }
.save-btn-cyber { font-family: 'JetBrains Mono', monospace; font-weight: bold; transform: scale(0.9); }
.modal-close-btn-mini { background: none; border: none; color: #666; cursor: pointer; font-size: 1.3rem; line-height: 1; transition: 0.2s; }
.modal-close-btn-mini:hover { color: #f38ba8; }

/* 🌟 版面排版：左右分流 */
.vscode-layout-full { display: flex; flex: 1; height: calc(100vh - 35px); overflow: hidden; }

/* 🌟 左側邊欄：滿高 100% */
.vscode-sidebar { width: 250px; height: 100%; background: #181825; display: flex; flex-direction: column; border-right: 1px solid #313244; flex-shrink: 0; }
.sidebar-header-title { padding: 10px 15px; font-size: 0.7em; font-weight: bold; color: #585b70; border-bottom: 1px solid #313244; font-family: 'JetBrains Mono', monospace; display: flex; justify-content: space-between; align-items: center; }
.nav-icon-btn { background: transparent; border: none; color: #999; cursor: pointer; transition: 0.2s; padding: 0; font-size: 1.2em;}
.nav-icon-btn:hover { color: #ea4c89; }

/* 🌟 階層樹狀列表 */
.vscode-file-tree { flex: 1; overflow-y: auto; padding: 10px 0; }
.vscode-file-tree::-webkit-scrollbar { width: 3px; }
.vscode-file-tree::-webkit-scrollbar-thumb { background: #313244; border-radius: 2px; }
.vscode-tree-item { padding: 5px 15px; font-size: 0.8em; cursor: pointer; color: #9499b0; white-space: nowrap; display: flex; align-items: center; gap: 6px; transition: 0.1s; font-family: 'JetBrains Mono', monospace; }
.vscode-tree-item:hover { background: rgba(234, 76, 137, 0.05); color: #cdd6f4; }
.vscode-tree-item.active { background: #313244; color: var(--accent-primary); font-weight: bold; }
.tree-chevron { font-size: 0.7em; opacity: 0.6; width: 12px; text-align: center; }
.tree-chevron-empty { width: 12px; }
.file-icon { font-size: 1.1em; }

/* 🌟 右側面板：包含 Editor 與 Terminal */
.vscode-right-panel { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

/* Monaco 區域 */
.vscode-main { flex: 1; background: #1e1e2e; display: flex; flex-direction: column; overflow: hidden; position: relative; }
.monaco-editor-wrapper-full { flex: 1; position: relative; height: 100%; width: 100%; overflow: hidden; }
.real-monaco-editor { width: 100%; height: 100%; position: absolute; top: 0; left: 0; }

/* 空白狀態 */
.empty-state-full { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #45475a; background: #1e1e2e; }
.watermark-cyber { font-size: 4rem; font-weight: 900; opacity: 0.02; font-family: 'Inter', sans-serif; letter-spacing: -5px; }
.empty-state-full p { font-family: 'JetBrains Mono', monospace; font-size: 0.8em; }

/* 🌟 底部面板：現在被擠到右側面板下方 */
.vscode-bottom-panel { height: 250px; background: #11111b; border-top: 1px solid #313244; display: flex; flex-direction: column; flex-shrink: 0; }
.panel-header { padding: 5px 15px; display: flex; gap: 15px; border-bottom: 1px solid #181825; }
.panel-tab { font-size: 0.7em; font-weight: bold; color: #585b70; cursor: pointer; text-transform: uppercase; padding: 2px 0; position: relative; font-family: 'JetBrains Mono', monospace; }
.panel-tab.active { color: #fab387; }
.panel-tab.active:after { content: ''; position: absolute; bottom: -6px; left: 0; width: 100%; height: 2px; background: #fab387; }

.logs-content { flex: 1; padding: 10px 15px; overflow-y: auto; color: #a6e3a1; font-size: 0.8em; scroll-behavior: smooth; }
.logs-content::-webkit-scrollbar { width: 3px; }
.logs-content::-webkit-scrollbar-thumb { background: #181825; }
.log-pre { margin: 0; font-family: 'JetBrains Mono', monospace; line-height: 1.5; }

.command-bar { background: #11111b; padding: 8px 15px; border-top: 1px solid #181825; display: flex; gap: 10px; align-items: center; font-size: 0.85em; font-family: 'JetBrains Mono', monospace; }
.terminal-prefix { color: #f38ba8; font-weight: bold; }
.terminal-input { flex: 1; background: transparent; border: none; outline: none; color: #cdd6f4; }
.terminal-input::placeholder { color: #45475a; }

@keyframes pulse { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
.fade-scale-enter-active, .fade-scale-leave-active { transition: all 0.25s ease-out; }
.fade-scale-enter-from, .fade-scale-leave-to { opacity: 0; transform: scale(0.98); blur: 5px; }
</style>