import { boot } from 'quasar/wrappers';
import { useUserStore } from 'stores/user-store';
import { useAdminStore } from 'stores/admin-store';

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ app, redirect, store, urlPath }) => {
  console.log('urlPath', urlPath);
  const userStore = useUserStore(store);
  const adminStore = useAdminStore(store);
  const loggedInStore = userStore.isLoggedIn ? userStore : adminStore;
  const loggedIn = loggedInStore.isLoggedIn;
  // const role = loggedInStore.userType?.toLowerCase();

  // Define the login routes for each role
  const loginRoutes: Record<string, string> = {
    admin: '/admin/login',
    member: '/login',
    affiliate: '/affiliate/login',
  };

  // Define the base routes for each role
  // const baseRoutes: Record<string, string> = {
  //   admin: '/admin',
  //   member: '/member',
  //   affiliate: '/affiliate',
  // };

  // Check if the user is not logged in and accessing a protected route
  if (!loggedIn && !urlPath.endsWith('/login')) {
    // Determine the role based on the accessed path
    let roleForPath = null;
    if (urlPath.startsWith('/admin/')) {
      roleForPath = 'admin';
    } else if (urlPath.startsWith('/member/')) {
      roleForPath = 'member';
    } else if (urlPath.startsWith('/affiliate/')) {
      roleForPath = 'affiliate';
    }

    if (
      urlPath === '/admin' ||
      urlPath === '/member' ||
      urlPath === '/affiliate'
    ) {
      redirect(loginRoutes[urlPath.split('/')[1]]);
    }

    // Redirect to the appropriate login route based on the accessed path
    if (roleForPath) {
      redirect(loginRoutes[roleForPath]);
    }
  } else if (loggedIn) {
    // Check if the user's role matches the accessed path
    console.log('loggedIn');
    // const expectedRole = urlPath.split('/')[1]; // Extract the role from the path
    // if (
    //   expectedRole !== 'admin' &&
    //   expectedRole !== 'member' &&
    //   expectedRole !== 'affiliate'
    // ) {
    //   console.log('loggedIn...,', loggedIn);
    //   console.log('loggedInStore...,', loggedInStore);
    //   console.log('role...,', role);
    //   if (baseRoutes[role]) {
    //     // Redirect to the base route for the user's role if the accessed path is invalid
    //     redirect(baseRoutes[role] + '/dashboard');
    //   }
    // }
    // if (role !== expectedRole) {
    //   // Redirect to the base route for the user's role if there's a role mismatch
    //   redirect(baseRoutes[role]);
    // }
  }

  // Set the current user in global properties if logged in
  if (loggedIn) {
    app.config.globalProperties.$currentUser = loggedInStore.user;
  }
});
