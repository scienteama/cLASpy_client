import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
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
      { path: 'predict', name: 'ml-predict', component: () => import('pages/ErrorNotFound.vue') },
      { path: 'segment', name: 'ml-segment', component: () => import('pages/ErrorNotFound.vue') },
    ],
  },
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    children: [{ path: 'login', name: 'login', component: () => import('components/auth/LoginForm.vue') }],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
