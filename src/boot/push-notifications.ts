import { boot } from 'quasar/wrappers';
import { messaging, vapidKey } from './firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { Notify } from 'quasar';
import { api } from 'src/boot/axios';

async function sendFcmTokenToBackend(token: string) {
  try {
    await api.post('/auth/update-fcm-token', { fcmToken: token });
    console.log('FCM token sent to backend successfully');
  } catch (error) {
    console.error('Error sending FCM token to backend:', error);
  }
}

export default boot(async ({ app }) => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
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
        Notify.create({
          message: payload.notification?.title,
          caption: payload.notification?.body,
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
      });
    } catch (error) {
      console.error('Error setting up push notifications:', error);
    }
  }
});
