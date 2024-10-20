import { ref, Ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Geolocation } from '@capacitor/geolocation';
import { api } from 'src/boot/axios';

export interface Volunteer {
  id: string;
  profession: string;
  location: {
    coordinates: [number, number];
  };
}

export function useNearbyVolunteers(volunteerMap: Ref<HTMLElement | null>) {
  const { t } = useI18n();

  const coords = ref({ latitude: 0, longitude: 0 });
  const nearbyVolunteers = ref<Volunteer[]>([]);
  const isLoadingLocation = ref(true);
  const locationError = ref('');

  const fetchLocation = async () => {
    isLoadingLocation.value = true;
    locationError.value = '';
    try {
      const position = await Geolocation.getCurrentPosition({ timeout: 10000 });
      coords.value = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      await fetchNearbyVolunteers();
    } catch (error) {
      console.error('Error getting current position:', error);
      locationError.value = t('common.errorGettingLocation');
    } finally {
      isLoadingLocation.value = false;
    }
  };

  const fetchNearbyVolunteers = async () => {
    if (coords.value.latitude && coords.value.longitude) {
      try {
        const response = await api.get<Volunteer[]>(
          '/community/volunteers-nearby',
          {
            params: {
              location: `${coords.value.latitude},${coords.value.longitude}`,
              range: 1000, // 1km radius
            },
          }
        );
        nearbyVolunteers.value = response.data.slice(0, 5);
      } catch (error) {
        console.error('Error fetching nearby volunteers', error);
        locationError.value = t('common.errorFetchingVolunteers');
      }
    }
  };

  const getVolunteerPosition = (volunteer: Volunteer) => {
    const mapWidth = volunteerMap.value?.offsetWidth || 300;
    const mapHeight = volunteerMap.value?.offsetHeight || 150;

    const latitude = coords.value.latitude;
    const longitude = coords.value.longitude;

    const distanceX = volunteer.location.coordinates[0] - longitude;
    const distanceY = volunteer.location.coordinates[1] - latitude;

    const scaleX = distanceX * 111320 * (mapWidth / 2000);
    const scaleY = distanceY * 111320 * (mapHeight / 2000);

    const x = mapWidth / 2 + scaleX;
    const y = mapHeight / 2 - scaleY;

    return {
      left: `${x}px`,
      top: `${y}px`,
    };
  };

  const getVolunteerIcon = (volunteer: Volunteer) => {
    // Implement logic to determine volunteer icon based on profession
    return 'person';
  };

  const getVolunteerColor = (volunteer: Volunteer) => {
    // Implement logic to determine volunteer color based on profession
    return 'green';
  };

  onMounted(() => {
    fetchLocation();
  });

  watch(volunteerMap, () => {
    if (volunteerMap.value && nearbyVolunteers.value.length > 0) {
      // Recalculate positions when the map is resized
      nearbyVolunteers.value = [...nearbyVolunteers.value];
    }
  });

  return {
    nearbyVolunteers,
    isLoadingLocation,
    locationError,
    fetchLocation,
    getVolunteerPosition,
    getVolunteerIcon,
    getVolunteerColor,
  };
}
