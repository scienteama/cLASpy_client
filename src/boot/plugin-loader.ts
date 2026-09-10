import { defineBoot } from '#q-app';
import { useConfigStore } from '@/stores/config-store';
import { usePluginStore } from '@/stores/plugins-store';

export default defineBoot(async () => {
  const pluginStore = usePluginStore();
  const configStore = useConfigStore();
  try {
    await pluginStore.getPluginsList();
    await configStore.getSetupStatus();
  } catch (e) {
    console.warn('Silent plugin loading failed', e);
  }
});
