import { boot } from 'quasar/wrappers';
import { useUserStore } from 'stores/user-store';

export default boot(({ router, store }) => {
  const userStore = useUserStore(store);

  // Global before guard
  router.beforeEach((to, from, next) => {
    const loggedIn = userStore.isLoggedIn;

    // Check if the route requires authentication
    if (to.meta.requiresAuth && !loggedIn) {
      userStore.logout();
      next('/login'); // Redirect to login if not authenticated
    } else {
      next(); // Proceed to the route
    }
  });
});
