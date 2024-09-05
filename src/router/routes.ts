import { RouteRecordRaw } from 'vue-router';
import VolunteersNearByPage from 'pages/VolunteersNearByPage.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'login',
        component: () => import('pages/LoginPage.vue'),
      },
      {
        path: '',
        component: () => import('pages/Dashboard/DashboardPage.vue'),
      },
      {
        path: 'dashboard',
        component: () => import('pages/Dashboard/DashboardPage.vue'),
      },
      {
        path: 'account',
        component: () => import('pages/Account/AccountDetailsPage.vue'),
      },
      {
        path: 'sos-mode',
        component: () => import('pages/Sos/SOSModeOnPage.vue'),
      },
      {
        path: 'volunteers',
        component: () => import('pages/VolunteersNearByPage.vue'),
      },
      {
        path: 'notifications',
        component: () => import('pages/NotificationsPage.vue'),
      },
      {
        path: 'help',
        component: () => import('pages/HelpPage.vue'),
      },
      {
        path: 'test',
        component: () => import('pages/TestPage.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },

  {
    path: '/volunteers-nearby',
    component: VolunteersNearByPage,
    meta: { requiresAuth: true },
  },
];

export default routes;
