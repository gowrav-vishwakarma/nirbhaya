import { RouteRecordRaw } from 'vue-router';

const publicRoutes: RouteRecordRaw[] = [
  {
    path: '/home',
    component: () => import('pages/HomePage.vue'),
  },
  {
    path: '/login/:referrer?',
    component: () => import('pages/LoginPage.vue'),
  },
  {
    path: '/admin/login',
    component: () => import('pages/Admin/AdminLoginPage.vue'),
  },
  {
    path: 'help',
    component: () => import('pages/HelpPage.vue'),
  },
  {
    path: 'test',
    component: () => import('pages/TestPage.vue'),
  },
  {
    path: 'home',
    component: () => import('pages/HomePage.vue'),
  },
  {
    path: 'about-us',
    component: () => import('pages/AboutUs.vue'),
  },
  // Add more public routes here
];

export default publicRoutes;
