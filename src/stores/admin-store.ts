import { defineStore } from 'pinia';
import { useQuasar } from 'quasar';

export interface User {
  id: number;
  token: string;
  branch_id: number;
  branch: { name: string; address: string; Code: string; id: number };
  workingDate: string;
  permissions: string[];
  role: string;
  userType: string;
  url: string;
  mobile: string;
  firstName: string;
  middleName: string;
  lastName: string;
  status: string;
  email: string;
}

export interface SessionDto {
  id: number;
  token: string;
  employeeId: string;
  affiliateId: string;
  status: string;
  loginTime: Date;
  lastUsedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  userType: string;
}

export const useAdminStore = defineStore('adminStore', {
  state: () => ({
    _user: {} as User,
    _session: {} as SessionDto,
  }),

  getters: {
    user: (state) => ({ ...state._user }),
    session: (state) => ({ ...state._session }),
    userType: (state) => state._user?.userType,
    isLoggedIn: (state) => !!state._session.token,
    role: (state) => state._user.role,
  },

  actions: {
    setUser(user: User) {
      this._user = user;
    },
    setSession(session: SessionDto) {
      this._session = session;
    },
    login(loginData: { user: User; session: SessionDto }) {
      const { user, session } = loginData;
      this.setUser(user);
      this.setSession(session);
    },

    logout(redirect = false) {
      this._user = {} as User;
      this._session = {} as SessionDto;
      if (redirect) {
        window.location.href = '/admin/login';
      }
    },

    can(action: string, model: string) {
      return this._user.permissions?.includes(`${action}:${model}`);
    },
  },

  persist: {
    key: 'FP_Admin',
  },
});
