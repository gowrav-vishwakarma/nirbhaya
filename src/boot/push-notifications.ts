import { boot } from 'quasar/wrappers';
import { messaging, vapidKey } from './firebase';
import { Notify } from 'quasar';
import { api } from 'src/boot/axios';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

async function sendFcmTokenToBackend(token: string) {
  try {
    await api.post('/auth/update-fcm-token', { fcmToken: token });
    console.log('FCM token sent to backend successfully');
  } catch (error) {
    console.error('Error sending FCM token to backend:', error);
  }
}

function showNotification(title: string, body: string) {
  Notify.create({
    message: title,
    caption: body,
    actions: [
      {
        label: 'Go to SOS',
        color: 'red',
        handler: () => {
          window.location.href = '/#/sos';
        },
      },
    ],
  });
}

export default boot(async ({ app }) => {
  console.log('Initializing push notifications');
  if (Capacitor.isNativePlatform()) {
    console.log('Running on native platform');
    // Native platform (iOS/Android)
    try {
      const permissionStatus = await PushNotifications.requestPermissions();
      console.log('Push notification permission status:', permissionStatus);
      await PushNotifications.register();
      console.log('Push notifications registered');

      PushNotifications.addListener('registration', async (token) => {
        console.log('Push registration success, token: ' + token.value);
        await sendFcmTokenToBackend(token.value);
      });

      PushNotifications.addListener(
        'pushNotificationReceived',
        (notification) => {
          console.log('Push notification received: ', notification);
          showNotification(notification.title || '', notification.body || '');
        }
      );

      PushNotifications.addListener(
        'pushNotificationActionPerformed',
        (notification) => {
          console.log('Push notification action performed', notification);
          if (
            notification.notification.data &&
            notification.notification.data.url
          ) {
            window.location.href = notification.notification.data.url;
          }
        }
      );
    } catch (error) {
      console.error('Error setting up push notifications:', error);
    }
  } else if (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    messaging
  ) {
    console.log('Running on web platform');
    // Web platform
    try {
      const { getToken, onMessage } = await import('firebase/messaging');
      const currentToken = await getToken(messaging, { vapidKey });
      if (currentToken) {
        console.log('FCM token:', currentToken);
        await sendFcmTokenToBackend(currentToken);
      } else {
        console.log(
          'No registration token available. Request permission to generate one.'
        );
      }

      onMessage(messaging, (payload) => {
        console.log('Message received:', payload);
        showNotification(
          payload.notification?.title || '',
          payload.notification?.body || ''
        );
      });
    } catch (error) {
      console.error('Error setting up push notifications:', error);
    }
  } else {
    console.log('Push notifications are not supported on this platform');
  }
});

// Export the showNotification function
export { showNotification };
