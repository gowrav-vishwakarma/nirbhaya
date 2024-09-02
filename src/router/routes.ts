import { RouteRecordRaw } from 'vue-router';

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
        path: 'sos-request',
        component: () => import('pages/Sos/SOSRequestPage.vue'),
      },
      {
        path: 'sos-location-change',
        component: () => import('pages/Sos/SOSLocationChangePage.vue'),
      },
      {
        path: 'sos-page/:sosEventId/:location',
        name: 'sos-page',
        component: () => import('pages/Sos/SOSPage.vue'),
        props: true,
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
];

export default routes;
