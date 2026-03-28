<template>
  <section class="right-ide" @dragover.prevent @drop.prevent="handleFileDrop">
    
    <div class="ide-header">
      <div class="header-left">
        <div class="ide-title">SYSTEM EXPLORER</div>
        
        <n-button 
          size="tiny" 
          color="#313244"
          text-color="white"
          class="neural-link-btn"
          @click="$emit('open-neural-link')"
          title="建立神經連結 (全屏編輯)"
        >
          <span class="icon">🔗</span> Neural Link
        </n-button>
        
        <n-button 
          size="tiny" 
          :type="isApplying ? 'success' : 'warning'" 
          class="apply-btn"
          :loading="isApplying"
          @click="handleApply"
          :disabled="isApplying"
        >
          {{ isApplying ? 'REBOOTING...' : '⚡ REBOOT' }}
        </n-button>
      </div>
      
      <div v-if="uploadProgress.uploading" class="upload-status">
        UP: {{ uploadProgress.current }}/{{ uploadProgress.total }}
      </div>

      <div class="ide-controls">
        <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
      </div>
    </div>
    
    <div class="ide-file-tree">
      <div class="nav-bar">
        <button class="nav-btn" @click="goParentDir" :disabled="currentDir === '.'" title="Go Up">⬅</button>
        <span class="current-path" :title="`Current: /${currentDir}`">/{{ currentDir }}</span>
        
        <button class="nav-btn upload" @click="triggerUpload" title="Upload File/Zip">⬆</button>
        <input type="file" ref="ideFileRef" multiple style="display: none" @change="onFileChange" />

        <button class="nav-btn refresh" @click="fetchFileList" title="Refresh">↻</button>
      </div>
      
      <div class="file-list-content">
        <div 
          v-for="file in fileList" 
          :key="file.name" 
          class="tree-item group" 
          @click="selectNode(file)"
          :title="file.name"
        >
          <div class="item-left">
            <span class="file-icon">{{ file.type === 'folder' ? '📂' : '📄' }}</span> 
            <span class="file-name-text">{{ file.name }}</span>
          </div>
          
          <button 
            class="delete-btn" 
            @click.stop="deleteNode(file, $event)"
            title="Delete File"
          >
            🗑️
          </button>
        </div>

        <div v-if="fileList.length === 0" class="empty-folder">(Empty Folder)</div>
      </div>
    </div>
    
    <div class="ide-editor preview-mode">
      <textarea 
        v-if="activeFile" 
        class="code-area read-only-pre" 
        :value="activeFile.content" 
        readonly
        spellcheck="false"
      ></textarea>
      
      <div v-else class="empty-editor">
        <div class="logo-watermark">IDE READY</div>
        <div class="hint">Select a file or Click "Neural Link"</div>
      </div>
    </div>
    
    <div class="ide-footer">
      <div class="left-stat"><span v-if="activeFile">{{ activeFile.path }}</span></div>
      <div class="right-action">
        <span class="status-txt" v-if="activeFile">Read Only Preview</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { NButton, useMessage } from 'naive-ui';
import { useIDE } from '../composables/useIDE.js';

const message = useMessage();
const ideFileRef = ref(null);

// 🌟 定義往外傳遞的事件，供 ChatRoom 接收
defineEmits(['open-neural-link']);

// Composable Extraction
const { 
  fileList, currentDir, activeFile, 
  uploadProgress, isApplying,
  fetchFileList, goParentDir, selectNode,
  handleFileUpload, applySystemChanges, deleteNode 
} = useIDE();

// --- Event Handlers ---

const triggerUpload = () => ideFileRef.value.click();

const onFileChange = (event) => {
  const files = event.target.files;
  if (files.length > 0) {
    handleFileUpload(files); 
    event.target.value = ''; // Reset input to allow re-uploading same file
  }
};

const handleApply = async () => {
  message.loading("Initiating Neural Core Reboot...", { duration: 2000 });
  try {
    await applySystemChanges();
    message.success("Core Rebooted. New Logic Active.");
  } catch (error) {
    message.error("Reboot Failed: " + error.message);
  }
};
</script>

<style scoped>
/* 原有的基礎 Layout 保留 */
.right-ide { 
  background: var(--bg-primary); 
  display: flex; 
  flex-direction: column; 
  border-left: 1px solid var(--border-color); 
  font-family: 'JetBrains Mono', monospace; 
  height: 100%; 
  transition: all 0.3s ease;
}

/* Header 優化 */
.ide-header { 
  height: 40px; 
  background: var(--bg-secondary); 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding: 0 10px; 
  font-size: 0.75em; 
  color: var(--text-secondary); 
  flex-shrink: 0; 
  border-bottom: 1px solid var(--border-color);
  transition: all 0.3s ease;
}
.header-left { display: flex; align-items: center; gap: 6px; }

/* 🌟 Neural Link 按鈕樣式 */
.neural-link-btn { font-family: 'JetBrains Mono', monospace; font-weight: bold; transform: scale(0.9); border: 1px solid #444 !important; }
.neural-link-btn .icon { margin-right: 4px; }
.neural-link-btn:hover { border-color: var(--accent-primary) !important; color: var(--accent-primary) !important; box-shadow: 0 0 10px var(--accent-glow); }

.apply-btn { font-family: 'JetBrains Mono', monospace; font-weight: bold; font-size: 0.9em; transform: scale(0.9); }
.upload-status { color: var(--accent-primary); font-weight: bold; font-size: 0.8em; animation: pulse 1.5s infinite; }
.ide-controls { display: flex; gap: 6px; margin-left: auto; }
.dot { width: 10px; height: 10px; border-radius: 50%; } 
.red { background: #ff5f56; } .yellow { background: #ffbd2e; } .green { background: #27c93f; }

/* File Tree 保持不變 */
.ide-file-tree { 
  height: 180px; /* 稍微減小檔案樹高度 */
  display: flex; 
  flex-direction: column; 
  background: var(--bg-secondary); 
  border-bottom: 1px solid var(--border-color); 
  flex-shrink: 0; 
  transition: all 0.3s ease;
}

.nav-bar { 
  display: flex; align-items: center; padding: 5px 10px; 
  background: var(--panel-bg); border-bottom: 1px solid var(--border-color); gap: 5px; 
}
.current-path { flex-grow: 1; font-size: 0.75em; color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.nav-btn { background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 2px 6px; border-radius: 3px; font-size: 1em; transition: 0.2s; }
.nav-btn:hover:not(:disabled) { background: var(--btn-bg); color: var(--text-primary); }
.nav-btn.upload { color: var(--accent-primary); }
.nav-btn.upload:hover { background: var(--accent-primary); color: white; }
.nav-btn:disabled { opacity: 0.3; cursor: default; }

.file-list-content { overflow-y: auto; padding: 5px 0; flex-grow: 1; font-size: 0.8em; color: var(--text-secondary); }
.file-list-content::-webkit-scrollbar { width: 4px; }
.file-list-content::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 2px; }

.tree-item { padding: 3px 10px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 6px; transition: 0.2s; }
.tree-item:hover { background: var(--panel-bg); color: var(--text-primary); }
.item-left { display: flex; align-items: center; gap: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.delete-btn { background: none; border: none; cursor: pointer; opacity: 0; transition: opacity 0.2s; font-size: 0.9em; padding: 2px 4px; border-radius: 3px; }
.delete-btn:hover { background: rgba(255, 77, 77, 0.2); }
.tree-item:hover .delete-btn { opacity: 1; }
.empty-folder { text-align: center; padding: 20px; font-style: italic; opacity: 0.5; font-size: 0.8em; }

/* 🌟 Editor Preview Mode 優化 */
.ide-editor { flex-grow: 1; display: flex; flex-direction: column; background: var(--bg-primary); overflow: hidden; position: relative; transition: all 0.3s ease; }
.ide-editor.preview-mode { border-top: none; } /* Preview 區不需要 Tabs 的邊框 */

/* Code Area 改為唯讀 Pre 樣式 */
.code-area { 
  flex-grow: 1; background: #181825; color: #a6e3a1; /* 深色背景與粉綠色唯讀文字 */
  border: none; padding: 15px; 
  font-family: 'JetBrains Mono', monospace; font-size: 0.8em; line-height: 1.5; 
  resize: none; outline: none; transition: all 0.3s ease;
  cursor: default; /* 改為指針 */
}
.empty-editor { flex-grow: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-secondary); }
.logo-watermark { font-size: 2em; font-weight: bold; opacity: 0.05; }
.hint { font-size: 0.8em; margin-top: 10px; opacity: 0.4; }

/* Footer 改為唯讀狀態顏色 */
.ide-footer { height: 25px; background: #313244; display: flex; align-items: center; justify-content: space-between; padding: 0 10px; font-size: 0.7em; color: var(--text-secondary); flex-shrink: 0; transition: background 0.3s ease; border-top: 1px solid var(--border-color); }
.left-stat { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 60%; }
.right-action { display: flex; align-items: center; font-style: italic; opacity: 0.8; }

@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
</style>