import { RouteRecordRaw } from 'vue-router';
import VolunteersNearByPage from 'pages/VolunteersNearByPage.vue';
import publicRoutes from './publicRoutes'; // Import public routes
import SOSEventsMapPage from 'pages/SOSEventsMapPage.vue';
import IncidentReelsPage from 'pages/IncidentReelsPage.vue';
import CreateReelPage from 'pages/CreateReelPage.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      ...publicRoutes,
      {
        path: '',
        component: () => import('pages/Dashboard/DashboardPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'sos',
        component: () => import('pages/Dashboard/DashboardPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'account',
        component: () => import('pages/Account/AccountDetailsPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'sos-mode',
        component: () => import('pages/Sos/SOSModeOnPage.vue'),
        name: 'sos-mode',
        props: (route) => ({
          sosEventId: route.query.sosEventId,
          contactsOnly: route.query.contactsOnly === 'true',
        }),
        meta: { requiresAuth: true },
      },
      {
        path: 'volunteers',
        component: () => import('pages/VolunteersNearByPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'notifications',
        component: () =>
          import('pages/NotificationsPage/NotificationsPage.vue'),
        name: 'notifications', // This is the named route
        meta: { requiresAuth: true },
      },
      {
        path: 'community',
        component: () => import('pages/CommunityPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'joined-community',
        component: () => import('pages/CommunityPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'incident-reels',
        component: IncidentReelsPage,
        meta: { requiresAuth: true },
      },
      {
        path: 'create-reel',
        component: CreateReelPage,
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
  {
    path: '/volunteers-nearby',
    component: VolunteersNearByPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/sos-events-map',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: SOSEventsMapPage }],
  },
];

export default routes;
