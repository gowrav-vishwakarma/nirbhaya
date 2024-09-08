import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  server: {
    androidScheme: 'https',
    url: 'https://192.168.1.3:9500',
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
