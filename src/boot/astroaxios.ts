import { boot } from 'quasar/wrappers';
import axios, { AxiosInstance } from 'axios';
import { useUserStore } from 'stores/user-store';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $astroApi: AxiosInstance;
  }
}

const astroApi = axios.create({ baseURL: process.env.ASTRO_API_BASE_URL });

export default boot(({ app, store, router }) => {
  const userStore = useUserStore(store);

  astroApi.interceptors.request.use((config) => {
    if (userStore.user && userStore.user.token) {
      config.headers.Authorization = `Bearer ${userStore.user.token}`;
    }
    return config;
  });

  astroApi.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        userStore.logout();
        router.push('/login');
      }
      return Promise.reject(error);
    }
  );

  app.config.globalProperties.$astroApi = astroApi;
});

export { astroApi };
