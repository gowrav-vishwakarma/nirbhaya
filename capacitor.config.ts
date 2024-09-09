import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  server: {
    hostname: 'localhost',
    iosScheme: 'https',
    androidScheme: 'https',
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
