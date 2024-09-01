import { boot } from 'quasar/wrappers';
import { messaging, vapidKey } from './firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { Notify } from 'quasar';
import { api } from 'src/boot/axios';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

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
