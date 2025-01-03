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
  availableForCommunity: boolean;
  emergencyContacts: EmergencyContact[];
  locations: UserLocation[];
  availableForPaidProfessionalService: boolean;
  hasJoinedCommunity: boolean;
  startAudioVideoRecordOnSos: boolean;
  streamAudioVideoOnSos: boolean;
  broadcastAudioOnSos: boolean;
  referralId: string;
  referredBy: string;
  state: string;
  dob: Date;
  pincode: string;
  profession: string;
  isAmbassador: boolean;
  avatar?: string;
  canCreatePost: boolean;
  businessName: string;
  whatsappNumber: string;
  profileImage: '';
}

interface NewsPreferences {
  language?: string;
  categories?: string[];
  newsType?: 'all' | 'indian' | 'international';
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
  availableForCommunity: false,
  emergencyContacts: [],
  locations: [],
  availableForPaidProfessionalService: false,
  hasJoinedCommunity: false,
  startAudioVideoRecordOnSos: false,
  streamAudioVideoOnSos: false,
  broadcastAudioOnSos: false,
  referralId: '',
  referredBy: '',
  state: '',
  dob: new Date(),
  pincode: '',
  profession: '',
  isAmbassador: false,
  canCreatePost: false,
  businessName: '',
  whatsappNumber: '',
  profileImage: '',
};

export const useUserStore = defineStore('userStore', {
  state: () => ({
    user: defaultUser,
    language: localStorage.getItem('userLanguage') || 'en-US',
    availableLanguages: ['en-US', 'hi-IN', 'gu-IN'],
    referredBy: '',
    newsPreferences: {
      language: 'en',
      categories: [],
      newsType: 'all',
    } as NewsPreferences,
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
    setNewsPreferences(preferences: Partial<NewsPreferences>) {
      this.newsPreferences = { ...this.newsPreferences, ...preferences };
      if (preferences.language) {
        localStorage.setItem('newsLanguage', preferences.language);
      }
      if (preferences.categories) {
        localStorage.setItem(
          'newsCategories',
          JSON.stringify(preferences.categories)
        );
      }
    },
    updateUserSettings(settings: Partial<User>) {
      if (this.user) {
        this.user = {
          ...this.user,
          ...settings,
        };
      }
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
