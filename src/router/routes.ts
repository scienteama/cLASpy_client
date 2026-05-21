import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    redirect: '/home',
    children: [{ path: 'home', name: 'home', component: () => import('pages/MainPage.vue') }],
  },
  {
    path: '/users',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    redirect: '/users/list',
    children: [{ path: 'list', name: 'user-list', component: () => import('pages/UsersPage.vue') }],
  },
  {
    path: '/ml',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: 'train', name: 'ml-train', component: () => import('pages/TrainPage.vue') },
      {
        path: 'predict/:step?',
        name: 'ml-predict',
        component: () => import('pages/PredicterPage.vue'),
        props: true,
        beforeEnter: (to) => {
          if (!to.params.step) {
            return { name: 'ml-predict', params: { step: 1 } };
          }

          const valid = ['1', '2', '3'];
          if (!valid.includes(to.params.step as string)) {
            return { name: 'ml-predict', params: { step: 1 } };
          }

          return true;
        },
      },
      { path: 'segment', name: 'ml-segment', component: () => import('pages/ErrorNotFound.vue') },
    ],
  },
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { path: 'login', name: 'login', component: () => import('components/auth/LoginForm.vue') },
      { path: 'first-login', name: 'first-login', meta: { firstUserOnly: true }, component: () => import('components/auth/FirstLogin.vue') },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
