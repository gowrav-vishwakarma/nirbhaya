import { RouteRecordRaw } from 'vue-router';
import VolunteersNearByPage from 'pages/VolunteersNearByPage.vue';
import publicRoutes from './publicRoutes'; // Import public routes
import SOSEventsMapPage from 'pages/SOSEventsMapPage.vue';
import IncidentReelsPage from 'pages/IncidentReelsPage.vue';
import CreateReelPage from 'pages/CreateReelPage.vue';
import NewsPage from 'pages/CommunityFeeds/NewsPage.vue';
import CommunityFeedback from 'pages/Sos/SosRating.vue';
import ShareCartificatePage from 'pages/Cartificate/ShareCartificatePage.vue';

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
        component: () => import('pages/Account/ProfileTabs.vue'),
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
      {
        path: 'all-news',
        name: 'news',
        component: NewsPage,
        meta: { requiresAuth: true },
      },
      {
        path: 'news/:id',
        name: 'news-article',
        component: () => import('pages/CommunityFeeds/NewsArticlePage.vue'),
        props: true,
        meta: { requiresAuth: true },
      },
      {
        path: 'feedback',
        component: CommunityFeedback,
        meta: { requiresAuth: true },
      },
      {
        path: '/community-feeds/manage',
        component: () => import('pages/CommunityFeeds/CommunityFeedCrud.vue'),
        // meta: { requiresAuth: true },
      },
      {
        path: '/news/manage',
        component: () => import('pages/CommunityFeeds/NewsManagement.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'news',
        name: 'news-list',
        component: () => import('pages/CommunityFeeds/NewsListPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'shorts-crud',
        name: 'shorts-crud',
        component: () => import('pages/ShortsPageCurd.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'cartificate',
        name: 'cartificate',
        component: () => ShareCartificatePage,
        meta: { requiresAuth: true },
      },
      {
        path: '/tnc',
        name: 'TncPage',
        component: () => import('pages/Sos/TncPage.vue'),
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
