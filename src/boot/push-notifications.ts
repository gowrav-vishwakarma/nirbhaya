import { boot } from 'quasar/wrappers';
import { messagingReadyPromise, vapidKey } from './firebase';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { useUserStore } from 'src/stores/user-store';

export default boot(async ({ app }) => {
  const userStore = useUserStore();
  console.log('Initializing push notifications');

  if (Capacitor.isNativePlatform()) {
    console.log('Running on native platform');
    try {
      const permissionStatus = await PushNotifications.requestPermissions();
      console.log('Push notification permission status:', permissionStatus);

      if (permissionStatus.receive === 'granted') {
        PushNotifications.addListener('registration', async (token) => {
          console.log('Push registration success, token: ' + token.value);
          localStorage.setItem('fcmToken', token.value); // Store token in localStorage
          if (userStore.isLoggedIn) {
            await userStore.sendTokenIfAvailable();
          }
        });

        PushNotifications.addListener(
          'pushNotificationReceived',
          (notification) => {
            console.log('Push notification received: ', notification);
            // Notification handling logic here (without showNotification)
          }
        );

        PushNotifications.addListener(
          'pushNotificationActionPerformed',
          (notification) => {
            console.log('Push notification action performed', notification);
            // Action handling logic here
          }
        );

        await PushNotifications.register();
        console.log('Push notifications registered');
      } else {
        console.log('Push notification permission denied');
      }
    } catch (error) {
      console.error('Error setting up push notifications:', error);
    }
  } else if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    console.log('Running on web platform');
    try {
      const messaging = await messagingReadyPromise;
      const { getToken, onMessage } = await import('firebase/messaging');
      const currentToken = await getToken(messaging, { vapidKey });
      if (currentToken) {
        console.log('FCM token:', currentToken);
        localStorage.setItem('fcmToken', currentToken); // Store token in localStorage
        if (userStore.isLoggedIn) {
          await userStore.sendTokenIfAvailable();
        }
      } else {
        console.log(
          'No registration token available. Request permission to generate one.'
        );
      }

      onMessage(messaging, (payload) => {
        console.log('Message received:', payload);
        // Web notification handling logic here (without showNotification)
      });
    } catch (error) {
      console.error('Error setting up push notifications:', error);
    }
  } else {
    console.log('Push notifications are not supported on this platform');
  }
});
