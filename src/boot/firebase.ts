import { boot } from 'quasar/wrappers';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { Capacitor } from '@capacitor/core';
import { Messaging } from 'firebase/messaging';

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
const analytics = getAnalytics(app);

export const vapidKey =
  'BJVaeVF6AvoWFr1yIb5vYUfZ-PCyEpvT-OvTY6JNdninVg7ksFQkt3bu-6XeczzlMbUrwlZ7KMpPCs90joHCdiM';

let messaging: Messaging | undefined;

if (!Capacitor.isNativePlatform()) {
  import('firebase/messaging').then(({ getMessaging }) => {
    messaging = getMessaging(app);
  });
}

export default boot(({ app }) => {
  if (messaging) {
    app.config.globalProperties.$messaging = messaging;
  }
  app.config.globalProperties.$analytics = analytics;
});

export { messaging, analytics };
