import { defineStore } from 'pinia';
import { configService } from 'src/services/conf.service';
import type { ApiSettings } from 'src/models/types/api.type';
import { defaultPals, getTextColorForPalette, glossyStyle, sortPaletteByBrightness } from 'src/helpers/color-utils';
import { computed, ref } from 'vue';

export const useConfigStore = defineStore(
  'config',
  () => {
    const apiSettings = ref<ApiSettings | null>(null);
    const loaded = ref(false);
    const isLoading = ref(false);
    const currentTheme = ref<string[]>([]);
    const defaultThemes = ref(defaultPals);

    const gradient = computed(() => `${glossyStyle}, linear-gradient(90deg, ${currentTheme.value.join(', ')})`);
    const sortedPal = computed(() => sortPaletteByBrightness(currentTheme.value));
    const textColor = computed(() => getTextColorForPalette(sortedPal.value));
    const computedStyle = computed(() => ({ background: gradient.value, color: textColor.value }));

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
      computedStyle,
      getApiConfig,
      initStore,
    };
  },
  {
    persist: {
      pick: ['apiSettings'],
    },
  }
);
