import { defineStore } from '#q-app/wrappers';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

declare module 'pinia' {}

export default defineStore(() => {
  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);

  return pinia;
});
