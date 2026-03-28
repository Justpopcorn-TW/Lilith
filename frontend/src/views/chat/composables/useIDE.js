/**
 * src/composables/useIDE.js
 * IDE 核心邏輯 (IDE Core Logic)
 */

import { ref, computed, onMounted, nextTick } from 'vue';

export function useIDE() {
  
  // ============================================================
  // 1. FS State Definitions
  // ============================================================
  const fileList = ref([]);
  const openFiles = ref([]); 
  const activeFilePath = ref(''); 
  const currentDir = ref('src/core'); 
  const isApplying = ref(false);
  const uploadProgress = ref({ total: 0, current: 0, uploading: false });

  const activeFile = computed(() => {
    return openFiles.value.find(f => f.path === activeFilePath.value) || null;
  });

  // ============================================================
  // 2. Editor & Monaco Logic
  // ============================================================
  
  // 編輯器核心設定
  const monacoOptions = ref({
    automaticLayout: true,      
    formatOnPaste: true,       
    formatOnType: true,        
    fontSize: 13,              
    fontFamily: "'JetBrains Mono', monospace", 
    lineNumbers: 'on',         
    minimap: { enabled: true, scale: 0.75 }, 
    scrollBeyondLastLine: false, 
    tabSize: 4,                
    cursorBlinking: 'smooth',   
    contextmenu: true,         
    quickSuggestions: true,    
    wordWrap: 'on',            
    padding: { top: 10, bottom: 10 }, 
  });

  // 檔名後綴自動推斷語言
  const inferLanguage = (fileName) => {
    if (!fileName) return 'plaintext';
    const ext = fileName.split('.').pop().toLowerCase();
    const langMap = {
      js: 'javascript', ts: 'typescript', json: 'json', md: 'markdown', 
      html: 'html', css: 'css', vue: 'html', py: 'python', sh: 'shell',
    };
    return langMap[ext] || 'plaintext';
  };

  const updateContent = (newContent) => {
    if (!activeFile.value) return;
    activeFile.value.content = newContent;
    activeFile.value.isDirty = activeFile.value.content !== activeFile.value.originalContent;
  };

  // ============================================================
  // 3. Terminal & System Control Logic
  // ============================================================
  
  // 終端機日誌狀態
  const terminalLogs = ref([
    '> [SYSTEM] Synchronizing Neural Link... OK',
    '> [MEM] Memory Context Synchronized... OK',
    '> [AES] Nominal baseline endocrine levels.',
    '> [INFO] Loading relationshipRules.json (Tabula Rasa)',
    '> Waiting for Neural Reboot Command...'
  ]);

  const terminalInput = ref('');

  // 終端機指令執行器
  const executeCommand = async () => {
    const cmd = terminalInput.value.trim();
    if (!cmd) return;

    // 將使用者輸入印上螢幕
    terminalLogs.value.push(`lilith@core:~/$ ${cmd}`);
    terminalInput.value = '';

    // 解析特殊指令
    if (cmd === 'clear') {
      terminalLogs.value = [];
      return;
    }

    if (cmd === 'reboot' || cmd === 'npm run restart') {
      terminalLogs.value.push('> [SYS] Initiating core reboot sequence...');
      try {
        await applySystemChanges();
        terminalLogs.value.push('> [SYS] Reboot successful. Logic updated.');
      } catch (e) {
        terminalLogs.value.push(`> [ERR] Reboot failed: ${e.message}`);
      }
      return;
    }

    // 預設模擬執行
    terminalLogs.value.push(`> [EXEC] Command '${cmd}' processed. (Simulation)`);
  };

  const applySystemChanges = async () => {
    if (isApplying.value) return;
    isApplying.value = true;
    try {
      const res = await fetch('/api/system/restart', { method: 'POST' });
      const data = await res.json();
      if (data.success) return true;
    } catch (e) {
      console.error("Restart failed:", e);
      throw e; 
    } finally {
      setTimeout(() => { isApplying.value = false; }, 2000);
    }
  };

  // ============================================================
  // 4. File System Navigation & CRUD (保持不變，為省篇幅略縮)
  // ============================================================
  
  const getParentPath = (path) => {
    if (path === '.' || !path.includes('/')) return '.';
    return path.substring(0, path.lastIndexOf('/'));
  };

  const fetchFileList = async () => {
    try {
      const res = await fetch(`/api/fs/list?dir=${currentDir.value}`);
      const data = await res.json();
      fileList.value = data.filter(f => !['node_modules', '.git', '.DS_Store'].includes(f.name));
    } catch (e) { console.error("[IDE] List failed:", e); }
  };

  const goParentDir = () => {
    if (currentDir.value === '.') return;
    currentDir.value = getParentPath(currentDir.value);
    fetchFileList();
  };

  const openFile = async (fileNode) => {
    const existing = openFiles.value.find(f => f.path === fileNode.path);
    if (existing) {
      activeFilePath.value = existing.path; return;
    }
    try {
      const res = await fetch(`/api/fs/read?path=${encodeURIComponent(fileNode.path)}`);
      const data = await res.json();
      const newFile = { name: fileNode.name, path: fileNode.path, content: data.content, originalContent: data.content, isDirty: false };
      openFiles.value.push(newFile);
      activeFilePath.value = newFile.path;
    } catch (e) { console.error("[IDE] Read failed:", e); }
  };

  const selectNode = async (node) => {
    if (node.type === 'folder') {
      currentDir.value = node.path;
      await fetchFileList();
    } else {
      await openFile(node);
    }
  };

  const saveFile = async () => {
    if (!activeFile.value) return;
    try {
      await fetch('/api/fs/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: activeFile.value.path, content: activeFile.value.content, encoding: 'utf-8' })
      });
      activeFile.value.originalContent = activeFile.value.content;
      activeFile.value.isDirty = false;
      terminalLogs.value.push(`> [FS] Saved changes to ${activeFile.value.path}`);
    } catch (e) { 
        terminalLogs.value.push(`> [ERR] Save failed: ${e.message}`);
    }
  };

  // 生命週期
  onMounted(() => fetchFileList());

  return {
    fileList, currentDir, openFiles, activeFile, activeFilePath,
    uploadProgress, isApplying,
    terminalLogs, terminalInput, monacoOptions, // 🌟 新增暴露狀態
    fetchFileList, goParentDir, selectNode, updateContent, saveFile, applySystemChanges,
    executeCommand, inferLanguage // 🌟 新增暴露方法
  };
}