import { Plugins } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

export class PushNotificationService {
  public async initialize(): Promise<void> {
    const permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      await PushNotifications.requestPermissions();
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
      }
    );

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: any) => {
        console.log('Push action performed: ' + JSON.stringify(notification));
      }
    );
  }
}
