import { defineStore } from 'pinia';
import { configService } from 'src/services/conf.service';
import type { ApiSettings } from 'src/models/types/api.type';
import { defaultPals, getTextColorForPalette, glossyStyle, sortPaletteByBrightness } from 'src/helpers/color-utils';
import { computed, ref, watch } from 'vue';

export const useConfigStore = defineStore(
  'config',
  () => {
    const apiSettings = ref<ApiSettings | null>(null);
    const loaded = ref(false);
    const isLoading = ref(false);
    const currentTheme = ref<string[]>([]);
    const defaultThemes = ref(defaultPals);
    const setupStatus = ref(false);

    const gradient = computed(() => `${glossyStyle}, linear-gradient(90deg, ${currentTheme.value.join(', ')})`);
    const sortedPal = computed(() => sortPaletteByBrightness(currentTheme.value));
    const textColor = computed(() => getTextColorForPalette(sortedPal.value));
    const computedStyle = computed(() => ({ background: gradient.value, color: textColor.value }));

    async function initStore() {
      await getApiConfig();
    }

    async function getSetupStatus() {
      const setup = await configService.getSetupStatus();
      if (setup.isOk) setupStatus.value = setup.data.firstLaunchCompleted;
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

    function getThemeFromStorage() {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme) {
        currentTheme.value = storedTheme.split(',').map((color) => color.trim());
      } else {
        currentTheme.value = [];
      }
    }

    watch(currentTheme, () => {
      if (currentTheme.value) {
        localStorage.setItem('theme', currentTheme.value.join(','));
      }
    });

    return {
      apiSettings,
      currentTheme,
      defaultThemes,
      computedStyle,
      setupStatus,
      getSetupStatus,
      getApiConfig,
      getThemeFromStorage,
      initStore,
    };
  },
  {
    persist: {
      pick: ['apiSettings', 'setupStatus'],
    },
  }
);
