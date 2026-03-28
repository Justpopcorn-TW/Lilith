import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useConfigStore = defineStore('config', () => {
  const generalSettings = ref({
    multiAgents: false,
    selfImprove: false,
    scheduledTasks: false,
    showTokenUsage: true 
  });

  const isDarkMode = ref(localStorage.getItem('lilith_theme') !== 'light');

  watch(isDarkMode, (val) => {
    localStorage.setItem('lilith_theme', val ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', val ? 'dark' : 'light');
  }, { immediate: true });

  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value;
  };

  return { generalSettings, isDarkMode, toggleTheme };
});