import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export interface User {
  id: number;
  name: string;
  email: string;
  location: string;
  lastLogin: Date;
}

export const useUserStore = defineStore(
  'userStore',
  () => {
    // State
    const user = ref<User>({} as User);

    // Getters
    const userName = computed(() => user.value.name);
    const userEmail = computed(() => user.value.email);
    const userLocation = computed(() => user.value.location);
    const userLastLogin = computed(() => user.value.lastLogin);

    // Actions
    function setUser(newUser: User) {
      user.value = newUser;
    }

    function updateUser(data: Partial<User>) {
      Object.assign(user.value, data);
    }

    return {
      user,
      userName,
      userEmail,
      userLocation,
      userLastLogin,
      setUser,
      updateUser,
    };
  },
  {
    persist: {
      key: 'nirdhaya',
    },
  }
);
