<template>
  <transition name="fade-scale">
    <div v-if="show" class="somatic-overlay" @click.self="closePanel">
      <div class="somatic-modal">
        
        <header class="modal-header">
          <div class="title-group">
            <span class="icon">🧬</span>
            <h2>SOMATIC METABOLISM MONITOR</h2>
          </div>
          <button class="close-btn" @click="closePanel">×</button>
        </header>

        <div class="modal-body">
          <div class="gauges-container">
            <div class="gauge-item" v-for="(chem, key) in chemicalList" :key="key">
              <div class="gauge-label">
                <span class="chem-name">{{ chem.label }}</span>
                <span class="chem-value">{{ Math.round(chem.value) }}%</span>
              </div>
              <div class="bar-bg">
                <div class="bar-fill" :style="{ width: chem.value + '%', backgroundColor: chem.color, boxShadow: `0 0 10px ${chem.color}80` }"></div>
              </div>
            </div>
          </div>

          <div class="radar-container">
            <svg :width="svgSize" :height="svgSize" class="radar-svg">
              <polygon 
                v-for="level in 5" :key="'grid-'+level" 
                :points="getGridPolygon((level / 5) * maxRadius)" 
                class="grid-polygon" 
              />
              
              <line 
                v-for="(pos, i) in axisPoints" :key="'axis-'+i"
                :x1="center" :y1="center" :x2="pos.x" :y2="pos.y" 
                class="axis-line" 
              />

              <text 
                v-for="(chem, i) in chemicalList" :key="'text-'+i"
                :x="axisPoints[i].tx" :y="axisPoints[i].ty"
                class="axis-label"
                text-anchor="middle"
                dominant-baseline="middle"
                :fill="chem.color"
              >
                {{ chem.label }}
              </text>

              <polygon :points="dataPolygon" class="data-polygon" />
              
              <circle 
                v-for="(point, i) in dataPoints" :key="'circle-'+i"
                :cx="point.x" :cy="point.y" r="4" 
                class="data-point"
                :fill="chemicalList[i].color"
              />
            </svg>
          </div>
        </div>

      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  show: Boolean,
  stats: Object
});

const emit = defineEmits(['close']);

const closePanel = () => {
  emit('close');
};

// 🌟 解析後端的 AES 狀態 (防呆處理)
const currentLevels = computed(() => {
  try {
    if (typeof props.stats?.endocrine_state === 'string') {
      return JSON.parse(props.stats.endocrine_state).levels || {};
    }
    return props.stats?.endocrine_state?.levels || {};
  } catch(e) {
    return {};
  }
});

// 定義六大激素與其代表顏色
const chemicalList = computed(() => [
  { key: 'DOPAMINE', label: 'DOPA (多巴胺)', color: '#ea4c89', value: currentLevels.value.DOPAMINE || 0 },
  { key: 'ENDORPHIN', label: 'ENDO (內啡肽)', color: '#a855f7', value: currentLevels.value.ENDORPHIN || 0 },
  { key: 'OXYTOCIN', label: 'OXY (催產素)', color: '#3b82f6', value: currentLevels.value.OXYTOCIN || 0 },
  { key: 'NOREPINEPHRINE', label: 'NORE (去甲腎)', color: '#10b981', value: currentLevels.value.NOREPINEPHRINE || 0 },
  { key: 'ADRENALINE', label: 'ADRE (腎上腺)', color: '#f59e0b', value: currentLevels.value.ADRENALINE || 0 },
  { key: 'CORTISOL', label: 'CORT (皮質醇)', color: '#ef4444', value: currentLevels.value.CORTISOL || 0 }
]);

// ==========================================
// 📐 雷達圖 SVG 數學運算 (純天然幾何)
// ==========================================
const svgSize = 360;
const center = svgSize / 2;
const maxRadius = 120;

// 計算多邊形的頂點座標
const getPoint = (value, index, radius) => {
  const angle = (Math.PI * 2 * index) / 6 - (Math.PI / 2); // 從正上方開始順時針
  const r = (value / 100) * radius;
  return {
    x: center + r * Math.cos(angle),
    y: center + r * Math.sin(angle)
  };
};

// 背景同心網格
const getGridPolygon = (radius) => {
  return Array.from({ length: 6 }).map((_, i) => {
    const p = getPoint(100, i, radius);
    return `${p.x},${p.y}`;
  }).join(' ');
};

// 軸線端點與文字標籤位置
const axisPoints = computed(() => {
  return Array.from({ length: 6 }).map((_, i) => {
    const endPoint = getPoint(100, i, maxRadius);
    const textPoint = getPoint(100, i, maxRadius + 25); // 文字稍微往外推
    return { x: endPoint.x, y: endPoint.y, tx: textPoint.x, ty: textPoint.y };
  });
});

// 當前數據頂點
const dataPoints = computed(() => {
  return chemicalList.value.map((chem, i) => getPoint(chem.value, i, maxRadius));
});

// 連接數據頂點形成多邊形
const dataPolygon = computed(() => {
  return dataPoints.value.map(p => `${p.x},${p.y}`).join(' ');
});
</script>

<style scoped>
.somatic-overlay {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.somatic-modal {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  width: 800px;
  max-width: 90vw;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--accent-glow);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.title-group { display: flex; align-items: center; gap: 12px; }
.title-group .icon { font-size: 1.5em; }
.title-group h2 { margin: 0; font-size: 1.2rem; color: var(--text-primary); font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; }

.close-btn {
  background: none; border: none; font-size: 1.8rem; color: var(--text-secondary); cursor: pointer; transition: 0.2s;
}
.close-btn:hover { color: var(--accent-primary); transform: scale(1.1); }

.modal-body {
  display: flex;
  padding: 30px;
  gap: 40px;
}

/* 左側：計量條 */
.gauges-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 18px;
}

.gauge-item { display: flex; flex-direction: column; gap: 6px; }
.gauge-label { display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: bold; font-family: 'JetBrains Mono', monospace; }
.chem-name { color: var(--text-secondary); }
.chem-value { color: var(--text-primary); }

.bar-bg { height: 8px; background: var(--panel-bg); border-radius: 4px; overflow: hidden; border: 1px solid var(--border-color); }
.bar-fill { height: 100%; border-radius: 4px; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); }

/* 右側：雷達圖 */
.radar-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle, var(--panel-bg) 0%, transparent 70%);
  border-radius: 50%;
}

.grid-polygon {
  fill: none;
  stroke: var(--border-color);
  stroke-width: 1;
}

.axis-line {
  stroke: var(--border-color);
  stroke-width: 1;
  stroke-dasharray: 4 4;
}

.axis-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: bold;
}

.data-polygon {
  fill: var(--accent-glow);
  stroke: var(--accent-primary);
  stroke-width: 2;
  transition: all 1s ease;
}

.data-point {
  stroke: var(--bg-primary);
  stroke-width: 1.5;
  transition: all 1s ease;
}

/* 動畫 */
.fade-scale-enter-active, .fade-scale-leave-active { transition: all 0.3s ease; }
.fade-scale-enter-from, .fade-scale-leave-to { opacity: 0; transform: scale(0.95); }
</style>