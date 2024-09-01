import { boot } from 'quasar/wrappers';
import { PushNotifications } from '@capacitor/push-notifications';
import { Notify } from 'quasar';

export default boot(async () => {
  const initializePushNotifications = async () => {
    if (process.env.MODE === 'capacitor') {
      // Capacitor push notifications setup
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        throw new Error('User denied permissions!');
      }

      await PushNotifications.register();

      PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success, token: ' + token.value);
        // TODO: Send this token to your server
      });

      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Error on registration: ' + JSON.stringify(error));
      });

      PushNotifications.addListener(
        'pushNotificationReceived',
        (notification: any) => {
          console.log('Push received: ' + JSON.stringify(notification));
          Notify.create({
            title: notification.title,
            message: notification.body,
            icon: 'notifications',
          });
        }
      );

      PushNotifications.addListener(
        'pushNotificationActionPerformed',
        (notification: any) => {
          console.log('Push action performed: ' + JSON.stringify(notification));
        }
      );
    }
    // Web push notifications will be handled in the service worker
  };

  await initializePushNotifications();
});
