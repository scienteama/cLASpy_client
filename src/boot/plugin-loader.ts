import { boot } from 'quasar/wrappers';
import { usePluginStore } from 'src/stores/plugins-store';

export default boot(async () => {
  const pluginStore = usePluginStore();
  try {
    await pluginStore.getPluginsList();
  } catch (e) {
    console.warn('Silent plugin loading failed', e);
  }
});
