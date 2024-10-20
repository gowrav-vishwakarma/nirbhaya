import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

export interface EmergencyContact {
  contactName: string;
  contactPhone: string;
  relationship?: string;
  isAppUser: boolean;
  priority?: number;
}

export interface UserLocation {
  name: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export interface User {
  id: number;
  phoneNumber: string;
  userType: string;
  name: string;
  email: string;
  lastLogin?: Date;
  token: string;
  isVerified: boolean;
  city: string;
  availableForCommunity: boolean; // Changed from liveSosEventChecking
  emergencyContacts: EmergencyContact[];
  locations: UserLocation[];
  availableForPaidProfessionalService: boolean; // Added new field
  hasJoinedCommunity: boolean;
  startAudioVideoRecordOnSos: boolean;
  streamAudioVideoOnSos: boolean;
  broadcastAudioOnSos: boolean;
  referralId: string;
  referredBy: string;
}

const defaultUser: User = {
  id: 0,
  phoneNumber: '',
  userType: 'Youth',
  name: '',
  email: '',
  token: '',
  isVerified: false,
  city: '',
  availableForCommunity: false, // Changed from liveSosEventChecking
  emergencyContacts: [],
  locations: [],
  availableForPaidProfessionalService: false, // Added new field
  hasJoinedCommunity: false,
  startAudioVideoRecordOnSos: false,
  streamAudioVideoOnSos: false,
  broadcastAudioOnSos: false,
  referralId: '',
  referredBy: '',
};

export const useUserStore = defineStore('userStore', {
  state: () => ({
    user: defaultUser,
    language: localStorage.getItem('userLanguage') || 'en-US',
    availableLanguages: ['en-US', 'hi-IN', 'gu-IN'],
    referredBy: '',
  }),
  actions: {
    setUser(newUser: User) {
      this.user = newUser;
    },
    updateUser(updatedFields: Partial<User>) {
      this.user = { ...this.user, ...updatedFields };
    },
    logout() {
      this.user = { ...defaultUser };
      this.user.token = '';

      // Clear persisted data
      localStorage.removeItem('sos-user');

      // If you're using @vueuse/core for persistence, you can also do:
      // const storage = useStorage('sos-user', null);
      // storage.value = null;
    },
    sendFcmTokenToBackend(token: string) {
      try {
        api.post('/auth/update-fcm-token', { fcmToken: token });
        console.log('FCM token sent to backend successfully');
      } catch (error) {
        console.error('Error sending FCM token to backend:', error);
      }
    },
    sendTokenIfAvailable() {
      const token = localStorage.getItem('fcmToken');
      if (token) {
        this.sendFcmTokenToBackend(token);
      }
    },
    clearUser() {
      this.user = defaultUser;
    },
    setLanguage(lang: string) {
      this.language = lang;
      localStorage.setItem('userLanguage', lang);
    },
    setReferrer(referrer: string) {
      this.referredBy = referrer;
    },
  },
  getters: {
    isLoggedIn: (state) => !!state.user.token,
    userName: (state) => state.user.name ?? '',
    userMobileNumber: (state) => state.user.phoneNumber ?? '',
  },
  persist: {
    key: 'sos-user',
  },
});
