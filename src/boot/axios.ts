import { boot } from 'quasar/wrappers';
import axios, { AxiosInstance } from 'axios';
import { useUserStore } from 'stores/user-store';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
// const api = axios.create({ baseURL: process.env.API_BASE_URL });
const api = axios.create({ baseURL: 'http://192.168.1.3:3000' });

export default boot(({ app, store }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api
  const userStore = useUserStore(store);

  api.interceptors.request.use((config) => {
    if (userStore.user && userStore.user.token) {
      config.headers.Authorization = `Bearer ${userStore.user.token}`;
    }
    return config;
  });

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { api };
