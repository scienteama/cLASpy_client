/* eslint-disable @typescript-eslint/no-explicit-any */

import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosError } from 'axios';
import { Notify } from 'quasar';
import { useAuth } from 'src/stores/auth-store';
import { isAxiosErrorResponse } from 'src/models/types/api.type';

export const api_url = import.meta.env.VITE_API_URL || 'https://localhost:5000/api';
export const wss_url = import.meta.env.VITE_WSS_URL || 'wss://localhost:8081/api/events/ws'; // proxy configuré pour rediriger vers le backend

const api = axios.create({
  baseURL: api_url,
  withCredentials: true,
});

export default defineBoot(({ app, router }) => {
  const auth = useAuth();

  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      let msg = 'Une erreur est survenue.';

      if (error.response?.status === 401) {
        auth.isAuthenticated = false;
        auth.checked = true;

        if (isAxiosErrorResponse(error.response.data)) {
          msg = error.response.data.data?.detail || msg;
        } else if (typeof error.response.data === 'object' && error.response.data !== null) {
          msg = (error.response.data as any).detail || msg;
        }

        Notify.create({ type: 'negative', message: msg });
        await router.push('/auth/login');
        return Promise.reject(error);
      }

      if (error.response?.data && isAxiosErrorResponse(error.response.data)) {
        const api_error = error.response.data;
        msg = api_error.data?.detail || api_error.result || msg;
      } else if (error instanceof Error) {
        msg = error.message;
      }

      Notify.create({ type: 'negative', message: msg });

      return Promise.reject(error);
    }
  );

  // pour accès global via this.$axios / this.$api
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
