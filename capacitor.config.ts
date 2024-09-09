import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  server: {
    hostname: 'localhost',
    iosScheme: 'https',
    androidScheme: 'https',
    url: 'http://10.0.2.2:8080',
    cleartext: true,
    allowNavigation: ['*'],
  },
  plugins: {
    Geolocation: {
      permissions: ['location'],
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Device: {
      id: {
        type: 'string',
      },
    },
  },
};

export default config;
