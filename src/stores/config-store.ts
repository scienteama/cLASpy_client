import { defineStore } from 'pinia';
import { configService } from 'src/services/conf.service';
import type { ApiSettings } from 'src/types/api.type';
import { ref } from 'vue';

export const useConfigStore = defineStore('config', () => {
  const apiSettings = ref<ApiSettings | null>(null);
  const loaded = ref(false);
  const isLoading = ref(false);

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

  // Charger automatiquement
  void initStore();

  return {
    apiSettings,
    getApiConfig,
  };
});
