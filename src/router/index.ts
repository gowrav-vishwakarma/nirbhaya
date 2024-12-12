import { route } from 'quasar/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';

import routes from './routes';
import { useMediaPermissions } from 'src/composables/useMediaPermissions';
import { setupDeepLinks } from '../services/deepLinkHandler'; // Import the setupDeepLinks function

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
    ? createWebHistory
    : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // Call setupDeepLinks with the router instance
  setupDeepLinks(Router); // Integrate deep link handling

  // Add navigation guard
  Router.beforeEach(async (to, from, next) => {
    const { stopAllMediaStreams } = useMediaPermissions();
    const restrictedRoutes = ['/', '/sos'];

    if (restrictedRoutes.includes(to.path)) {
      await stopAllMediaStreams();

      // Override permissions API if available
      if (navigator.permissions) {
        const permissions = ['camera', 'microphone'];
        permissions.forEach(async (permission) => {
          try {
            const result = await navigator.permissions.query({
              name: permission as PermissionName,
            });
            if (result.state === 'granted') {
              // Attempt to revoke or deny permission
              if (navigator.permissions.revoke) {
                await navigator.permissions.revoke({
                  name: permission as PermissionName,
                });
              }
            }
          } catch (error) {
            console.warn(`Unable to modify ${permission} permission:`, error);
          }
        });
      }
    }
    next();
  });

  return Router;
});
