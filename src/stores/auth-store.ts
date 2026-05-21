import { defineStore } from 'pinia';
import { useQuasar } from 'quasar';
import { authService } from 'src/services/auth.service';
import { useUserStore } from './users-store';
import { ref } from 'vue';
import { useConfigStore } from './config-store';
import { type LoginDto } from 'src/models/types/auth.type';
import { type User } from 'src/models/types/users.type';
import { socketClient } from 'src/services/socket.service';

export const useAuth = defineStore('auth', () => {
  const $q = useQuasar();
  const userStore = useUserStore();
  const configStore = useConfigStore();
  const isAuthenticated = ref(false);
  const exp = ref(0);
  const checked = ref(false);

  async function checkSession() {
    if (checked.value) return;
    try {
      const session = await authService.checkSession();
      if (session.isOk && session.data) {
        isAuthenticated.value = session.data.isAuthenticated;
        exp.value = session.data.exp;
      } else {
        isAuthenticated.value = false;
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
      setToken(res.data.access_token);
      const me = await userStore.getMe();
      await configStore.initStore();
      if (me != null) {
        isAuthenticated.value = true;
        await userStore.init();
        socketClient.connect();
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
      socketClient.close();
      isAuthenticated.value = false;
      clearToken();
      $q.notify({ type: 'positive', message: 'Déconnexion réussie' });
      return true;
    } else {
      $q.notify({ type: 'negative', message: 'Erreur lors de la déconnexion.' });
      return false;
    }
  }

  function setToken(token: string) {
    localStorage.setItem('access_token', token);
  }

  function clearToken() {
    localStorage.removeItem('access_token');
  }

  return {
    isAuthenticated,
    exp,
    checked,
    checkSession,
    userLogin,
    userLogout,
  };
});
