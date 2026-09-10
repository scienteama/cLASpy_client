import { defineRouter } from '#q-app';
import { createRouter, createWebHistory } from 'vue-router';
import routes from './routes';
import { useAuth } from '@/stores/auth-store';
import { useUserStore } from '@/stores/users-store';
import { useConfigStore } from '@/stores/config-store';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createWebHistory('/'),
  });

  Router.beforeEach(async (to) => {
    const auth = useAuth();
    const user = useUserStore();
    const config = useConfigStore();

    const isFirstUserMode = config.setupStatus === false || config.setupStatus == null;

    // Première utilisation
    if (isFirstUserMode && to.name !== 'first-login') {
      return { name: 'first-login' };
    }

    // Redirection vers login si déjà configuré
    if (!isFirstUserMode && to.name === 'first-login') {
      return { name: 'login' };
    }

    // auth check
    if (to.meta?.requiresAuth) {
      if (!auth.checked) {
        try {
          await auth.checkSession();
        } catch {
          // None
        }
      }

      if (!auth.isAuthenticated) {
        return {
          name: 'login',
          query: { email: user.currentUser?.email },
        };
      }

      await user.init();
    }

    return true;
  });

  return Router;
});
