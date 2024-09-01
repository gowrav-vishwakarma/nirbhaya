import { boot } from 'quasar/wrappers';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyATkKRDqPJwPAoH8_MZy9dOD_dEA6VC7tM',
  authDomain: 'shoutout-1e61c.firebaseapp.com',
  projectId: 'shoutout-1e61c',
  storageBucket: 'shoutout-1e61c.appspot.com',
  messagingSenderId: '599043169760',
  appId: '1:599043169760:web:3522088aa2511184455f85',
  measurementId: 'G-L2WNXZ0ZQR',
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
const analytics = getAnalytics(app);

export const vapidKey =
  'BJVaeVF6AvoWFr1yIb5vYUfZ-PCyEpvT-OvTY6JNdninVg7ksFQkt3bu-6XeczzlMbUrwlZ7KMpPCs90joHCdiM';

export default boot(({ app }) => {
  app.config.globalProperties.$messaging = messaging;
  app.config.globalProperties.$analytics = analytics;
});

export { messaging, analytics };
