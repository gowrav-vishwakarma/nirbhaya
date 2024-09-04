import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
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
};

export const useUserStore = defineStore(
  'userStore',
  () => {
    // State
    const user = ref<User>(defaultUser);
    const language = ref(localStorage.getItem('userLanguage') || 'en-US');
    const availableLanguages = ['en-US', 'hi-IN', 'gu-IN'];

    // Getters
    const isLoggedIn = computed(() => !!user.value?.token);
    const userName = computed(() => user.value?.name ?? '');
    const userMobileNumber = computed(() => user.value?.phoneNumber ?? '');

    // Actions
    function setUser(newUser: User) {
      user.value = newUser;
    }

    function updateUser(updatedFields: Partial<User>) {
      user.value = { ...user.value, ...updatedFields };
    }

    function logout() {
      user.value = defaultUser;
    }

    async function sendFcmTokenToBackend(token: string) {
      try {
        await api.post('/auth/update-fcm-token', { fcmToken: token });
        console.log('FCM token sent to backend successfully');
      } catch (error) {
        console.error('Error sending FCM token to backend:', error);
      }
    }

    async function sendTokenIfAvailable() {
      const token = localStorage.getItem('fcmToken');
      if (token) {
        await sendFcmTokenToBackend(token);
      }
    }

    function clearUser() {
      user.value = defaultUser;
    }

    function setLanguage(lang: string) {
      language.value = lang;
      localStorage.setItem('userLanguage', lang);
    }

    return {
      user,
      isLoggedIn,
      userName,
      userMobileNumber,
      setUser,
      updateUser,
      logout,
      sendTokenIfAvailable,
      clearUser,
      language,
      availableLanguages,
      setLanguage,
    };
  },
  {
    persist: {
      key: 'nirdhaya-user',
    },
  }
);
