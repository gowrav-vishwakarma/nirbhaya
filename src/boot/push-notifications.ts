import { boot } from 'quasar/wrappers';
import { messagingReadyPromise, vapidKey } from './firebase';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { useUserStore } from 'src/stores/user-store';

export default boot(async ({ router }) => {
  const userStore = useUserStore();
  console.log('Initializing push notifications');

  if (Capacitor.isNativePlatform()) {
    console.log('Running on native platform');
    try {
      // if (Capacitor.getPlatform() === 'android') {
      console.log(
        'notification get channel after',
        JSON.stringify(PushNotifications.listChannels(), null, 2)
      );
      await PushNotifications.createChannel({
        // id: 'sosalertchannel',
        id: 'fcm_fallback_notification_channel',
        name: 'Default SOS alert',
        description: 'Used for specific sos alert',
        importance: 5,
        visibility: 1,
        sound: 'default',
        vibration: true,
      })
        .then(() => {
          console.log(
            'push notification channel created fcm_fallback_notification_channel'
          );
        })
        .catch((error) => {
          console.log(
            'push notification channel error fcm_fallback_notification_channel: ',
            error
          );
        });

      await PushNotifications.createChannel({
        id: 'sosalertchannel',
        name: 'SOS alert channel',
        description: 'sosalertchannel used for only sos event',
        importance: 5,
        visibility: 1,
        sound: 'sosalert.mp3',
        vibration: true,
        lights: true,
      })
        .then(() => {
          console.log('push notification channel created sosalertchannel');
        })
        .catch((error) => {
          console.log(
            'push notification channel error sosalertchannel: ',
            error
          );
        });
      console.log(
        'notification get channel after try 101',
        JSON.stringify(PushNotifications.listChannels, null, 2)
      );
      // }

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
            console.log(
              'Push notification received: native app ',
              notification,
              JSON.stringify(notification, null, 2)
            );
          }
        );

        PushNotifications.addListener(
          'pushNotificationActionPerformed',
          (notification) => {
            console.log('Push notification action performed', notification);
            const { sosEventId, location } = notification.notification.data;
            router.push({
              name: 'notifications', // Updated to point to the notifications page
              params: { sosEventId, location },
            });
          }
        );

        // Some issue with our setup and push will not work
        PushNotifications.addListener('registrationError', (error: any) => {
          console.log('Error on registration:', error);
        });

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
        const { title = 'Default Title', body = 'Default Body' } =
          payload.notification || {};
        const { sosEventId = '', location = '' } = payload.data || {};

        if (Notification.permission === 'granted') {
          const notification = new Notification(title, {
            body,
            data: { sosEventId, location },
          });

          // Play sound manually
          // const audio = new Audio('/mp3/sosalert.mp3');
          // audio.play().catch((error) => {
          //   console.log('Error playing notification sound:', error);
          // });
          notification.onclick = () => {
            window.focus();
            router.push({
              name: 'notifications',
              params: { sosEventId, location },
            });
          };
        }
      });
    } catch (error) {
      console.error('Error setting up push notifications:', error);
    }
  } else {
    console.log('Push notifications are not supported on this platform');
  }
});
