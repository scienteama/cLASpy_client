import { defineStore } from 'pinia';
import { configService } from 'src/services/conf.service';
import type { ApiSettings } from 'src/types/api.type';
import { defaultPals } from 'src/helpers/color-utils';
import { ref } from 'vue';

export const useConfigStore = defineStore('config', () => {
  const apiSettings = ref<ApiSettings | null>(null);
  const loaded = ref(false);
  const isLoading = ref(false);
  const currentTheme = ref<string[]>([]);
  const defaultThemes = ref(defaultPals);

  async function initStore() {
    await getApiConfig();
  }

  async function getApiConfig(force = false) {
    if (loaded.value && !force) return;

    isLoading.value = true;
    try {
      const result = await configService.getConfig();
      if (result.isOk) apiSettings.value = result.data;
      loaded.value = true;
    } finally {
      isLoading.value = false;
    }
  }
  return {
    apiSettings,
    currentTheme,
    defaultThemes,
    getApiConfig,
    initStore,
  };
},
{
  persist: {
    pick: ['apiSettings'],
  },
});
