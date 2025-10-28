import { defineStore } from '#q-app/wrappers';
import { createPinia } from 'pinia';

declare module 'pinia' {}

export default defineStore(() => {
  const pinia = createPinia();

  // You can add Pinia plugins here
  // pinia.use(SomePiniaPlugin)

  return pinia;
});
