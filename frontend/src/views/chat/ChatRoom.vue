<template>
  <div class="chat-layout">
    <LeftStage 
      :stats="stats" 
      @open-aes="showAesPanel = true"
    />

    <CenterConsole
      :messages="messageHistory"
      :isThinking="isThinking"
      :currentConversationId="currentConversationId"
      :currentTime="currentTime"
      @send="handleSend"
    />

    <RightIDE 
      :files="fileList"
      :currentDir="currentDir"
      :activeFile="activeFile"
      :isApplying="isApplying"
      @go-up="goParentDir"
      @select-file="handleSelectFile"
      @close-file="closeFile"
      @save-file="handleSaveFile"
      @apply-changes="applySystemChanges"
    />

    <SomaticPanel 
      :show="showAesPanel" 
      :stats="stats" 
      @close="showAesPanel = false" 
    />
  </div>
</template>

<script setup>
// 🌟 引入 Vue 的 ref 與新組件
import { ref, onMounted } from 'vue';

import LeftStage from './components/LeftStage.vue';
import CenterConsole from './components/CenterConsole.vue';
import RightIDE from './components/RightIDE.vue';
import SomaticPanel from './components/SomaticPanel.vue'; // 🌟 引入

import { useGameSystem } from './composables/useGameSystem';
import { useChat } from './composables/useChat';
import { useIDE } from './composables/useIDE';

const showAesPanel = ref(false);

const { currentTime, stats, updateStats } = useGameSystem();
const savedConId = localStorage.getItem('lilith_conversation_id') || 'web_user';

const { 
  messageHistory, 
  isThinking, 
  currentConversationId, 
  sendMessage, 
  loadHistory 
} = useChat(savedConId, updateStats);

const { 
  fileList, 
  currentDir, 
  activeFile, 
  isApplying,
  fetchFileList, 
  goParentDir, 
  openFile, 
  closeFile, 
  saveFile, 
  applySystemChanges 
} = useIDE();

const handleSend = async (text) => {
  await sendMessage(text, []); 
};

const handleSelectFile = (item) => {
  if (item.type === 'folder') {
    currentDir.value = item.path;
    fetchFileList(); 
  } else {
    openFile(item.path); 
  }
};

const handleSaveFile = async (fileObj) => {
  await saveFile(fileObj.path, fileObj.content);
};

onMounted(() => {
  loadHistory();
});
</script>

<style scoped>
.chat-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  overflow: hidden;
  font-family: 'Inter', sans-serif;
  transition: all 0.3s ease;
}

.chat-layout > *:nth-child(1) { flex: 0 0 350px; }
.chat-layout > *:nth-child(2) { flex: 1; min-width: 400px; }
.chat-layout > *:nth-child(3) { flex: 0 0 350px; }
</style>