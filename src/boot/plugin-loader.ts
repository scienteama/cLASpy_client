import { boot } from 'quasar/wrappers';
import { useConfigStore } from 'src/stores/config-store';
import { usePluginStore } from 'src/stores/plugins-store';

export default boot(async () => {
  const pluginStore = usePluginStore();
  const configStore = useConfigStore();
  try {
    await pluginStore.getPluginsList();
    await configStore.getSetupStatus();
  } catch (e) {
    console.warn('Silent plugin loading failed', e);
  }
});
