import { defineStore } from 'pinia';
import { pluginService } from 'src/services/plugins.service';
import { ref } from 'vue';
import type { Plugin } from 'src/types/plugins.types';

export const usePluginStore = defineStore('plugins', () => {
  const plugins = ref<Plugin[]>([]);
  const loaded = ref(false);
  const loading = ref(false);

  async function getPluginsList(force = false) {
    if (loaded.value && !force) return; //ne recharge pas inutilement

    loading.value = true;
    try {
      const plu = await pluginService.getPlugins();
      plugins.value = plu;
      loaded.value = true;
    } finally {
      loading.value = false;
    }
  }

  async function addPlugin(pluginName: string) {
    const res = await pluginService.installPlugin(pluginName);
    await getPluginsList(true);
    return res;
  }

  async function removePlugin(pluginName: string) {
    const res = await pluginService.uninstallPlugin(pluginName);
    await getPluginsList(true);
    return res;
  }

  return {
    plugins,
    loaded,
    loading,
    getPluginsList,
    addPlugin,
    removePlugin,
  };
});
