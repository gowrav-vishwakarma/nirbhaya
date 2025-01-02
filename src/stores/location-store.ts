import { defineStore } from 'pinia';

interface Location {
  type: string;
  latitude: number;
  longitude: number;
  name?: string;
  source?: 'current' | 'stored' | 'map';
}

export const useLocationStore = defineStore('location', {
  state: () => ({
    location: null as Location | null,
  }),
  getters: {
    getLocation: (state) => state.location,
  },
  actions: {
    setLocation(location: Location) {
      this.location = location;
    },
  },
});
