import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

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
  userType: 'child' | 'volunteer';
  name: string;
  email: string;
  lastLogin?: Date;
  token: string;
  isVerified: boolean;
  city: string;
  liveSosEventChecking: boolean;
  emergencyContacts: EmergencyContact[];
  locations: UserLocation[];
}

const defaultUser: User = {
  id: 0,
  phoneNumber: '',
  userType: 'child',
  name: '',
  email: '',
  token: '',
  isVerified: false,
  city: '',
  liveSosEventChecking: false,
  emergencyContacts: [],
  locations: [],
};

export const useUserStore = defineStore(
  'userStore',
  () => {
    // State
    const user = ref<User>(defaultUser);

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

    return {
      user,
      isLoggedIn,
      userName,
      userMobileNumber,
      setUser,
      updateUser,
      logout,
    };
  },
  {
    persist: {
      key: 'nirdhaya-user',
    },
  }
);
