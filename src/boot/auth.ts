import { boot } from 'quasar/wrappers';
import { useUserStore } from 'stores/user-store';

export default boot(async ({ app, redirect, store, urlPath }) => {
  console.log('urlPath', urlPath);
  const userStore = useUserStore(store);
  const loggedIn = userStore.isLoggedIn;

  // Check if the user is not logged in and accessing a protected route
  if (!loggedIn && !urlPath.endsWith('/login')) {
    redirect('/login');
  }
});
