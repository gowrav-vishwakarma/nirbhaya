<template>
  <q-card class="nearby-volunteers-card q-mb-md">
    <q-card-section>
      <div class="row items-center justify-between q-mb-sm">
        <h6 class="text-h6 text-weight-bold q-my-none">
          {{ $t('common.nearbyVolunteers') }}
        </h6>
        <q-btn
          flat
          color="primary"
          :label="$t('common.viewAll')"
          @click="router.push('/volunteers')"
        />
      </div>
      <div v-if="isLoadingLocation" class="text-center">
        <q-spinner color="primary" size="3em" />
        <p>{{ $t('common.gettingLocation') }}</p>
      </div>
      <div v-else-if="locationError" class="text-center">
        <p>{{ locationError }}</p>
        <q-btn
          @click="retryFetchLocation"
          color="primary"
          :label="$t('common.retry')"
        />
      </div>
      <div
        v-else-if="nearbyVolunteers.length > 0"
        class="volunteer-map"
        ref="volunteerMap"
      >
        <div class="map-center">
          <q-icon
            :name="$t('common.icons.myLocation')"
            size="24px"
            color="primary"
          />
        </div>
        <div
          v-for="volunteer in nearbyVolunteers"
          :key="volunteer.id"
          class="volunteer-icon"
          :style="getVolunteerPosition(volunteer)"
        >
          <q-icon
            :name="getVolunteerIcon(volunteer)"
            size="20px"
            :color="getVolunteerColor(volunteer)"
          />
          <q-tooltip>
            {{ volunteer.profession }}
          </q-tooltip>
        </div>
      </div>
      <p
        v-else-if="!isLoadingLocation && nearbyVolunteers.length === 0"
        class="text-center"
      >
        {{ $t('common.noVolunteersNearby') }}
      </p>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNearbyVolunteers } from 'src/composables/useNearbyVolunteers';
import { usePermissions } from 'src/composables/usePermissions';

const router = useRouter();
const volunteerMap = ref<HTMLElement | null>(null);

const {
  nearbyVolunteers,
  isLoadingLocation,
  locationError,
  fetchLocation,
  getVolunteerPosition,
  getVolunteerIcon,
  getVolunteerColor,
} = useNearbyVolunteers(volunteerMap);

const { permissions, checkPermissions, requestPermission } = usePermissions();

const retryFetchLocation = async () => {
  const locationPermission = permissions.value.find(
    (p) => p.name === 'common.location'
  );
  if (locationPermission && !locationPermission.granted) {
    const granted = await requestPermission('common.location');
    if (!granted) {
      locationError.value = t('common.locationPermissionDenied');
      return;
    }
  }
  await fetchLocation();
};

onMounted(async () => {
  await checkPermissions();
});
</script>

<style lang="scss" scoped>
.nearby-volunteers-card {
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.volunteer-map {
  position: relative;
  width: 100%;
  height: 150px;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
}

.map-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.volunteer-icon {
  position: absolute;
  transform: translate(-50%, -50%);
}
</style>
