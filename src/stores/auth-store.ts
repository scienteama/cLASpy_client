import { defineStore } from 'pinia';
import { useQuasar } from 'quasar';
import { authService } from 'src/services/auth.service';
import type { LoginDto } from 'src/types/auth.type';
import { useUserStore } from './users-store';
import { ref } from 'vue';
import type { User } from 'src/types/users.type';
import { useConfigStore } from './config-store';
import { createWebsocket, registerWSHandler } from 'src/services/websocket.service';
import { useFilesStore } from './files-store';

export const useAuth = defineStore('auth', () => {
  const $q = useQuasar();
  const userStore = useUserStore();
  const configStore = useConfigStore();
  const isAuthenticated = ref(false);
  const checked = ref(false);

  async function initialize() {
    if (checked.value) return;
    try {
      const session = await authService.checkSession();
      isAuthenticated.value = session.data['isAuthenticated']!;
      if (isAuthenticated.value) {
        createWebsocket();
        registerWSHandler('ml_task_done', async () => {
          await useFilesStore().reloadRoot();
        });
      }

    } catch {
      isAuthenticated.value = false;
    } finally {
      checked.value = true;
    }
  }

  async function userLogin(params: LoginDto): Promise<false | User> {
    const credentials = new URLSearchParams();
    credentials.append('email', params.email);
    credentials.append('password', params.password);

    const res = await authService.login(credentials);

    if (res.isOk) {
      const me = await userStore.getMe();
      await configStore.initStore();
      if (me != null) {
        isAuthenticated.value = true;

        // Connexion WebSocket
        createWebsocket();
        // Enregistrement handler ML task
        registerWSHandler('ml_task_done', async () => {
          await useFilesStore().reloadRoot();
        });

        return me;
      } else {
        $q.notify({ type: 'negative', message: 'Erreur lors du chargement du profil.' });
        isAuthenticated.value = false;
        return false;
      }
    } else {
      $q.notify({ type: 'negative', message: res.result || 'Une erreur est survenue.' });
      return false;
    }
  }

  async function userLogout() {
    const result = await authService.logout();
    if (result.isOk) {
      userStore.clearUser();
      isAuthenticated.value = false;
      $q.notify({ type: 'positive', message: 'Déconnexion réussie' });
      return true;
    } else {
      $q.notify({ type: 'negative', message: 'Erreur lors de la déconnexion.' });
      return false;
    }
  }

  return {
    isAuthenticated,
    checked,
    initialize,
    userLogin,
    userLogout,
  };
});
