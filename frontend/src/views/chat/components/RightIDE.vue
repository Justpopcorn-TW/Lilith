<template>
  <section class="right-ide" @dragover.prevent @drop.prevent="handleFileDrop">
    
    <div class="ide-header">
      <div class="header-left">
        <div class="ide-title">SYSTEM EXPLORER</div>
        <n-button 
          size="tiny" 
          :type="isApplying ? 'success' : 'warning'" 
          class="apply-btn"
          :loading="isApplying"
          @click="handleApply"
          :disabled="isApplying"
        >
          {{ isApplying ? 'REBOOTING...' : '⚡ APPLY' }}
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
    
    <div class="ide-editor">
      <div class="editor-tabs">
        <div 
          v-for="file in openFiles" 
          :key="file.path" 
          class="tab" 
          :class="{ active: activeFilePath === file.path }" 
          @click="activeFilePath = file.path"
          :title="file.path"
        >
          <span class="tab-name">{{ file.name }}</span>
          <span class="unsaved-dot" v-if="file.isDirty">●</span>
          <span class="close-tab" @click.stop="(e) => closeFile(file.path, e)">×</span>
        </div>
      </div>

      <textarea 
        v-if="activeFile" 
        class="code-area" 
        :value="activeFile.content" 
        @input="(e) => updateContent(e.target.value)" 
        spellcheck="false"
      ></textarea>
      
      <div v-else class="empty-editor">
        <div class="logo-watermark">IDE READY</div>
        <div class="hint">Select a file or Drag & Drop</div>
      </div>
    </div>
    
    <div class="ide-footer">
      <div class="left-stat"><span v-if="activeFile">{{ activeFile.path }}</span></div>
      <div class="right-action">
        <span class="status-txt" v-if="activeFile">{{ activeFile.isDirty ? 'Unsaved' : 'Saved' }}</span>
        <n-button 
          v-if="activeFile" 
          size="tiny" 
          color="#ffffff" 
          text-color="#ea4c89" 
          @click="saveFile" 
          style="font-weight: bold; margin-left: 10px;"
        >
          Save
        </n-button>
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

// Composable Extraction
const { 
  fileList, currentDir, openFiles, activeFile, activeFilePath,
  uploadProgress, isApplying,
  fetchFileList, goParentDir, selectNode, closeFile, updateContent, saveFile,
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

const handleFileDrop = (event) => {
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    handleFileUpload(files); 
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
/* Base Layout */
.right-ide { 
  background: var(--bg-primary); 
  display: flex; 
  flex-direction: column; 
  border-left: 1px solid var(--border-color); 
  font-family: 'JetBrains Mono', monospace; 
  height: 100%; 
  transition: all 0.3s ease;
}

/* Header */
.ide-header { 
  height: 40px; 
  background: var(--bg-secondary); 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding: 0 15px; 
  font-size: 0.75em; 
  color: var(--text-secondary); 
  flex-shrink: 0; 
  border-bottom: 1px solid var(--border-color);
  transition: all 0.3s ease;
}
.header-left { display: flex; align-items: center; gap: 10px; }
.apply-btn { font-family: 'JetBrains Mono', monospace; font-weight: bold; font-size: 0.9em; transform: scale(0.9); }
.upload-status { color: var(--accent-primary); font-weight: bold; font-size: 0.8em; animation: pulse 1.5s infinite; }
.ide-controls { display: flex; gap: 6px; }
.dot { width: 10px; height: 10px; border-radius: 50%; } 
.red { background: #ff5f56; } .yellow { background: #ffbd2e; } .green { background: #27c93f; }

/* File Tree */
.ide-file-tree { 
  height: 200px; 
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
.tree-item { padding: 3px 10px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 6px; transition: 0.2s; }
.tree-item:hover { background: var(--panel-bg); color: var(--text-primary); }
.item-left { display: flex; align-items: center; gap: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.empty-folder { text-align: center; padding: 20px; font-style: italic; opacity: 0.5; font-size: 0.8em; }

/* Delete Button */
.delete-btn {
  background: none; border: none; cursor: pointer;
  opacity: 0; /* Hidden by default */
  transition: opacity 0.2s;
  font-size: 0.9em; padding: 2px 4px; border-radius: 3px;
}
.delete-btn:hover { background: rgba(255, 77, 77, 0.2); }
.tree-item:hover .delete-btn { opacity: 1; }

/* Editor Area */
.ide-editor { flex-grow: 1; display: flex; flex-direction: column; background: var(--bg-primary); overflow: hidden; position: relative; transition: all 0.3s ease; }

/* Tabs */
.editor-tabs { background: var(--bg-secondary); height: 35px; display: flex; overflow-x: auto; flex-shrink: 0; border-bottom: 1px solid var(--border-color); }
.editor-tabs::-webkit-scrollbar { height: 3px; }
.editor-tabs::-webkit-scrollbar-thumb { background: var(--border-color); }

.tab { 
  padding: 0 10px; background: var(--panel-bg); color: var(--text-secondary); font-size: 0.8em; 
  display: flex; align-items: center; gap: 8px; cursor: pointer; 
  border-right: 1px solid var(--border-color); min-width: 100px; user-select: none; transition: 0.2s;
}
.tab:hover { background: var(--btn-bg); }
.tab.active { background: var(--bg-primary); color: var(--text-primary); border-top: 2px solid var(--accent-primary); border-bottom: 1px solid var(--bg-primary); margin-bottom: -1px; }
.tab-name { max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.unsaved-dot { font-size: 1.2em; color: var(--accent-primary); }
.close-tab { border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; font-size: 1.1em; transition: 0.2s; }
.close-tab:hover { background: var(--btn-bg); color: var(--text-primary); }

/* Code Area */
.code-area { 
  flex-grow: 1; background: var(--bg-primary); color: var(--text-primary); border: none; padding: 15px; 
  font-family: 'JetBrains Mono', monospace; font-size: 0.85em; line-height: 1.5; 
  resize: none; outline: none; transition: all 0.3s ease;
}
.empty-editor { flex-grow: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-secondary); }
.logo-watermark { font-size: 2em; font-weight: bold; opacity: 0.1; }
.hint { font-size: 0.8em; margin-top: 10px; opacity: 0.5; }

/* Footer */
.ide-footer { height: 25px; background: var(--accent-primary); display: flex; align-items: center; justify-content: space-between; padding: 0 10px; font-size: 0.7em; color: white; flex-shrink: 0; transition: background 0.3s ease; }
.left-stat { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 60%; }
.right-action { display: flex; align-items: center; }

@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }

/* Mobile Optimizations */
@media (max-width: 768px) {
  .ide-file-tree { height: 150px; } 
  .nav-btn { padding: 8px 12px; font-size: 1.2em; } 
  .code-area { font-size: 14px; padding: 10px; }
  .editor-tabs { overflow-x: auto; -webkit-overflow-scrolling: touch; } 
  .tab { min-width: auto; padding: 0 15px; height: 35px; }
  .ide-controls { display: none; } 
  .delete-btn { opacity: 0.6; padding: 8px; font-size: 1.1em; display: block; }
}
</style>