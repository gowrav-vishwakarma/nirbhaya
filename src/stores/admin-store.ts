import { defineStore } from 'pinia';

export interface User {
  id: number;
  phoneNumber: number;
  role: string;
  roleId: string;
  email: string;
  token: string;
}

export const useAdminStore = defineStore('adminStore', {
  state: () => ({
    _user: {} as User,
  }),
  getters: {
    user: (state) => ({ ...state._user }),
    isLoggedIn: (state) => !!state._user.token,
  },
  actions: {
    setUser(user: User) {
      this._user = user;
    },
    updateUser(updatedFields: Partial<User>) {
      this._user = { ...this.user, ...updatedFields };
    },
    logout() {
      this._user = {} as User;
      this._user.token = '';

      localStorage.removeItem('sos-user');
    },
  },
  persist: {
    key: 'sos-admin',
  },
});
