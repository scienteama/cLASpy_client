/* eslint-disable @typescript-eslint/no-explicit-any */

import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosError } from 'axios';
import { Notify } from 'quasar';
import { useAuth } from 'src/stores/auth-store';
import { isAxiosErrorResponse } from 'src/models/types/api.type';
import { useUserStore } from 'src/stores/users-store';

export const api_url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const socket_url = import.meta.env.VITE_WSS_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: api_url,
  withCredentials: true,
});

export default defineBoot(({ app, router }) => {
  const auth = useAuth();
  const userStore = useUserStore();

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  });

  api.interceptors.response.use(
    (response) => response,

    async (error: AxiosError) => {
      let msg = 'Une erreur est survenue.';

      /*
       * =========================
       * Unauthorized - token expiré ou invalide
       * =========================
       */
      if (error.response?.status === 401) {
        auth.isAuthenticated = false;
        auth.checked = true;

        if (isAxiosErrorResponse(error.response.data)) {
          msg = error.response.data.data?.detail || msg;
        } else if (typeof error.response.data === 'object' && error.response.data !== null) {
          msg = (error.response.data as any).detail || msg;
        }

        Notify.create({
          type: 'negative',
          message: msg,
        });

        await router.push({ name: 'login', query: { email: userStore.currentUser?.email } });

        return Promise.reject(error);
      }

      /*
       * =========================
       * API inaccessible
       * =========================
       */
      if (error.code === 'ECONNREFUSED') {
        msg = 'Le serveur est inaccessible';
      } else if (error.code === 'ECONNABORTED') {
        /*
         * =========================
         * Timeout
         * =========================
         */
        msg = 'Délai de connexion dépassé';
      } else if (error.code === 'ERR_NETWORK') {
        /*
         * =========================
         * Erreur réseau / aucune réponse
         * =========================
         */
        msg = 'Aucune réponse du serveur';
      } else if (error.response?.data && isAxiosErrorResponse(error.response.data)) {
        /*
         * =========================
         * Réponse HTTP backend
         * =========================
         */
        const api_error = error.response.data;

        msg = api_error.data?.detail || api_error.result || msg;
      } else if (error instanceof Error) {
        /*
         * =========================
         * Fallback - message d'erreur générique
         * =========================
         */
        msg = error.message;
      }

      Notify.create({
        type: 'negative',
        message: msg,
      });

      return Promise.reject(error);
    }
  );

  app.config.globalProperties.$axios = api;
  app.config.globalProperties.$api = api;
});

export { api };
