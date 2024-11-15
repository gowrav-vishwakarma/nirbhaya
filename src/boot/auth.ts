import { boot } from 'quasar/wrappers';
import { useUserStore } from 'stores/user-store';
import { useAdminStore } from 'src/stores/admin-store';
export default boot(({ app, router, store, urlPath }) => {
  const userStore = useUserStore(store);
  const adminStore = useAdminStore(store);
  const loggedInStore = userStore.isLoggedIn ? userStore : adminStore;
  const loggedIn = loggedInStore.isLoggedIn;

  // Global before guard
  router.beforeEach((to, from, next) => {
    // const loggedIn = userStore.isLoggedIn;

    // Check if the route requires authentication
    if (to.meta.requiresAuth && !loggedIn) {
      if (urlPath.startsWith('/admin/')) {
        next('/admin/login');
      } else {
        userStore.logout();
        next('/login'); // Redirect to login if not authenticated
      }
    } else {
      next(); // Proceed to the route
    }
  });

  if (loggedIn) {
    app.config.globalProperties.$currentUser = loggedInStore.user;
  }
});
