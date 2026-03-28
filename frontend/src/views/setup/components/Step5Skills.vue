<template>
  <div class="step-panel">
    <h2 class="title">擴充技能與權限 (Skills)</h2>
    <p class="subtitle">系統已自動掃描 <code>backend/skills</code> 目錄。在此配置莉莉絲能使用的物理與數位權能。</p>

    <div v-if="!showAdvanced">
      <div v-if="loading" class="text-center mt-10" style="color: #ea4c89;">
        <p>掃描本地端技能矩陣中...</p>
      </div>

      <div v-else class="skills-list">
        <div v-for="skill in availableSkills" :key="skill.id" class="skill-item" :class="{ 'is-system': skill.isSystem }">
          <div class="skill-info">
            <div class="skill-header">
              <span class="skill-name">{{ skill.name }}</span>
              <span v-if="skill.isSystem" class="badge system-badge">核心系統 (Core)</span>
            </div>
            <p class="skill-desc">{{ skill.desc }}</p>
            <p class="skill-id-hint">ID: {{ skill.id }}</p>
          </div>
          
          <div class="skill-toggle">
            <input 
              type="checkbox" 
              :id="'skill-' + skill.id"
              :value="skill.id"
              v-model="formData.skills.allowBundled"
              :disabled="skill.isSystem"
            />
            <label :for="'skill-' + skill.id" class="toggle-switch"></label>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="json-editor-container text-left">
      <p class="help-text">底層 <code>skills</code> 參數。您可以在 <code>entries</code> 中手動覆寫特定技能的運作邏輯與 API 金鑰等配置。</p>
      
      <div class="demo-box">
        <div class="demo-title">💡 配置範例 (以 webToolkit 加入 SERPAPI_API_KEY 為例)：</div>
        <pre class="demo-code">
"entries": {
  "webToolkit": {
    "skillEnv": {
      "SERPAPI_API_KEY": "請替換為妳的 API Key"
    }
  }
}</pre>
      </div>

      <textarea 
        v-model="skillsJsonStr" 
        @input="handleJsonChange"
        class="input-field json-editor"
        rows="10"
      ></textarea>
      <p v-if="jsonError" class="error-text">JSON 格式錯誤，請檢查語法。</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  formData: { type: Object, required: true },
  showAdvanced: { type: Boolean, default: false }
});

const availableSkills = ref([]);
const loading = ref(true);
const skillsJsonStr = ref('');
const jsonError = ref(false);

onMounted(async () => {
  try {
    const res = await fetch('/api/skills/available');
    availableSkills.value = await res.json();
    
    if (!props.formData.skills) props.formData.skills = { allowBundled: [], entries: {} };
    if (!props.formData.skills.allowBundled) props.formData.skills.allowBundled = [];

    // 強制將 isSystem: true 的技能加入 allowBundled
    availableSkills.value.forEach(skill => {
      if (skill.isSystem && !props.formData.skills.allowBundled.includes(skill.id)) {
        props.formData.skills.allowBundled.push(skill.id);
      }
    });

    skillsJsonStr.value = JSON.stringify(props.formData.skills, null, 2);

  } catch (error) {
    console.error("Failed to load skills:", error);
  } finally {
    loading.value = false;
  }
});

watch(() => props.formData.skills, (newVal) => {
  if (!jsonError.value) {
    skillsJsonStr.value = JSON.stringify(newVal, null, 2);
  }
}, { deep: true });

const handleJsonChange = (e) => {
  try {
    const parsed = JSON.parse(e.target.value);
    props.formData.skills.allowBundled = parsed.allowBundled || [];
    props.formData.skills.entries = parsed.entries || {};
    jsonError.value = false;
  } catch (err) {
    jsonError.value = true;
  }
};
</script>

<style scoped>
/* --- 優化後的列表與項目樣式 --- */
.skills-list { 
  display: flex; 
  flex-direction: column; 
  gap: 0.6rem; /* 🌟 縮小項目間的距離 */
  max-height: 400px; 
  overflow-y: auto; 
  padding-right: 8px; 
}

.skill-item { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding: 0.8rem 1rem; /* 🌟 縮小內距 (上下 0.8, 左右 1.0) */
  background: #fff; 
  border: 1px solid #eee; 
  border-radius: 10px; /* 稍微減小圓角以符合緊湊感 */
  transition: all 0.2s ease; 
}

.skill-item:hover { 
  border-color: #fbcfe8; 
  box-shadow: 0 2px 8px rgba(236,72,153,0.05); 
}

.skill-item.is-system { 
  background: #fafafa; 
  border-color: #ddd; 
}

.skill-info { 
  flex: 1; 
  text-align: left; 
  padding-right: 12px; /* 確保文字不會貼到按鈕 */
}

.skill-header { 
  display: flex; 
  align-items: center; 
  gap: 0.6rem; /* 🌟 縮小標題與標籤間距 */
  margin-bottom: 0.2rem; /* 🌟 縮小標題與描述間距 */
}

.skill-name { 
  font-weight: 700; 
  font-size: 1rem; /* 稍微縮小字體 */
  color: #111; 
  font-family: 'JetBrains Mono', monospace; 
}

.skill-desc { 
  font-size: 0.85rem; /* 稍微縮小描述字體 */
  color: #666; 
  line-height: 1.3; 
  margin: 0; 
}

.skill-id-hint { 
  font-size: 0.7rem; 
  color: #ccc; 
  margin-top: 2px; 
  font-family: 'JetBrains Mono', monospace; 
}

/* 🌟 小標籤同步微調 */
.badge { 
  font-size: 0.65rem; 
  padding: 1px 6px; 
  border-radius: 4px; 
}
</style>