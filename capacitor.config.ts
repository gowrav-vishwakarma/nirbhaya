import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.xavoc.shoutout',
  appName: 'SOS Bharat',
  webDir: 'www',
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
    CapacitorUpdater: {
      // updateUrl: 'http://localhost:3000/check-version-capgo',
      autoUpdate: false,
      // updateUrl: 'https://myserver.com/app/updates/updates.json',
    },
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
