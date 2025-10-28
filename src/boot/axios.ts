import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosError, type AxiosInstance } from 'axios';
import { Notify } from 'quasar';
import { isAxiosErrorResponse } from 'src/types/api.type';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    let msg = 'Erreur lors de la requête';

    if (error.response?.data && isAxiosErrorResponse(error.response.data)) {
      const data = error.response.data;
      msg = data.data?.detail || data.result || msg;
    } else if (error instanceof Error) {
      msg = error.message;
    }

    // Notification Quasar
    Notify.create({ type: 'negative', message: msg });

    return Promise.reject(error);
  },
);

export default defineBoot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { api };
