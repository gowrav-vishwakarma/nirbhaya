import { boot } from 'quasar/wrappers';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { Capacitor } from '@capacitor/core';
import { Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSANGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
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
