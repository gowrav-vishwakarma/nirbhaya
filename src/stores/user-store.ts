import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export interface UserProfile {
  name: string;
  mobileNumber: string;
  city: string;
  emergencyContacts: Array<{
    name: string;
    number: string;
  }>;
  locationSharingOption: 'always' | 'periodicallyCheck' | 'none';
  notificationLocations: Array<{
    name: string;
    latitude: number | null;
    longitude: number | null;
  }>;
}

export interface User {
  name: string;
  mobileNumber: string;
  token: string;
  profile: UserProfile;
}

export const useUserStore = defineStore(
  'userStore',
  () => {
    // State
    const user = ref<User | null>(null);

    // Getters
    const isLoggedIn = computed(() => !!user.value?.token);
    const userName = computed(() => user.value?.name ?? '');
    const userMobileNumber = computed(() => user.value?.mobileNumber ?? '');

    // Actions
    function setUser(newUser: User) {
      user.value = newUser;
    }

    function updateProfile(newProfile: Partial<UserProfile>) {
      if (user.value) {
        user.value.profile = { ...user.value.profile, ...newProfile };
      }
    }

    function logout() {
      user.value = null;
    }

    return {
      user,
      isLoggedIn,
      userName,
      userMobileNumber,
      setUser,
      updateProfile,
      logout,
    };
  },
  {
    persist: {
      key: 'nirdhaya-user',
    },
  }
);
