<template>
  <div class="chat-viewport" ref="chatContainerRef">
    <div 
      v-for="(msg, index) in messages" 
      :key="index" 
      class="msg-row" 
      :class="msg.role"
    >
      <div class="avatar-col" v-if="msg.role === 'assistant'">
        <div class="avatar-frame">
          <img src="/lilith.png" class="avatar-img" alt="lilith" />
        </div>
      </div>

      <div class="bubble-col">
        <div v-if="msg.attachments && msg.attachments.length > 0" class="msg-attachments">
          <div v-for="file in msg.attachments" :key="file.name" class="attachment-item">
            📎 {{ file.name }}
          </div>
        </div>
        
        <div v-for="(seg, sIdx) in msg.segments" :key="sIdx">
          <div v-if="seg.type === 'text'" class="message-bubble">
            <pre class="content-text">{{ seg.content }}</pre>
          </div>
          
          <div v-else-if="seg.type === 'image'" class="lilith-image-wrapper">
            <img :src="seg.url" class="generated-img" alt="AI Generated" />
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="isThinking" class="typing-indicator">Lilith 正在思考中...</div>
  </div>
</template>

<script setup>
// 🌟 只需要接收 Props，不需要發送任何 Emit 了
const props = defineProps({
  messages: Array,
  isThinking: Boolean
});
</script>

<style scoped>
/* 🌟 讓 viewport 佔滿父容器 (.center-column) 的彈性空間 */
.chat-viewport { 
  flex: 1; 
  overflow-y: auto; 
  padding: 20px; 
  display: flex; 
  flex-direction: column; 
  gap: 20px; 
}

.msg-row { display: flex; gap: 15px; max-width: 85%; }
.msg-row.user { align-self: flex-end; flex-direction: row-reverse; }
.msg-row.assistant { align-self: flex-start; }

.avatar-col { width: 36px; flex-shrink: 0; }
.avatar-frame { width: 36px; height: 36px; border-radius: 8px; overflow: hidden; border: 1px solid var(--accent-glow); transition: border-color 0.3s ease; }
.avatar-img { width: 100%; height: 100%; object-fit: cover; }

.bubble-col { display: flex; flex-direction: column; gap: 8px; max-width: 100%; }
.message-bubble { padding: 12px 16px; border-radius: 12px; background: var(--bg-secondary); color: var(--text-primary); font-size: 0.95em; line-height: 1.6; border: 1px solid var(--border-color); transition: all 0.3s ease; }
.user .message-bubble { background: var(--accent-primary); color: white; border: none; box-shadow: 0 2px 10px var(--accent-glow); }
.content-text { white-space: pre-wrap; font-family: inherit; margin: 0; word-break: break-word; }

.msg-attachments { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 4px; }
.attachment-item { background: var(--panel-bg); border: 1px solid var(--border-color); padding: 4px 8px; border-radius: 4px; font-size: 0.8em; color: var(--text-secondary); }

.lilith-image-wrapper { border-radius: 12px; overflow: hidden; background: var(--panel-bg); border: 1px solid var(--border-color); max-width: 400px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15); transition: all 0.3s ease; }
.generated-img { width: 100%; height: auto; display: block; }

.typing-indicator { font-size: 0.85em; color: var(--text-secondary); font-style: italic; margin-left: 50px; }
</style>