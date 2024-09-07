import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  server: {
    url: 'http://127.0.0.1:3000',
    cleartext: true,
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
