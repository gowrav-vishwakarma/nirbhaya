import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // ... existing configuration ...
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
