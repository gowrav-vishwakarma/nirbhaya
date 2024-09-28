<template>
  <q-page class="dashboard-page q-pa-md">
    <div class="dashboard-content">
      <q-card class="welcome-card ">
        <q-card-section>
          <h4 class="text-h6 text-weight-bold text-primary q-ma-none">
            {{ $t('common.welcome', { name: userName }) }}
          </h4>
          <p class="text-subtitle1 text-grey-7 q-mt-sm" style="line-height: 16px;">
            {{ $t('common.dashboardSubtitle') }}
          </p>
        </q-card-section>
      </q-card>

      <div class="sos-buttons q-mb-lg q-pb-md" style="border: 1px solid white; border-radius: 10px; margin-top: 30px;">
        <q-btn round style="background-color: #e74c3c;" class="sos-button q-my-lg glowing-border"
          @click="initiateSOSMode">
          <div class="row items-center full-width">
            <span style="margin: auto; font-size: 40px; color: whitesmoke;">sos</span>
            <!-- <q-icon name="warning" size="3rem" class="q-mr-md col-3" /> -->
            <!-- <div class="text-left col-5">
              <div class="text-h5 text-weight-bold">
                {{ $t('common.sosButton') }}
              </div>
              <div class="text-subtitle2">
                {{ $t('common.sosButtonSubtitle') }}
              </div>
            </div> -->
          </div>
        </q-btn>
        <div class="q-pr-md" style="margin-top: -30px;">
          <q-btn @click="() => { contactsOnly = true; initiateSOSMode(); }" round style="height: 50px;width: 50px; color: whitesmoke; background-color: orange; display: flex; float: right;
            ">
            <span style="font-weight: bolder;">
              sos
            </span>
          </q-btn>
        </div>
      </div>


      <div class="q-mt-sm flex-container">

        <div class="card groupBox welcome-card" @click="router.push('/volunteers')">
          <q-img class="icon" src="/public/volunteers.png" />
          <p class="title">Nearby Volunteers</p>
          <p class="subtitle">{{ nearbyVolunteers.length }} {{ $t('common.volunteersNearby') }}</p>
        </div>
        <div class="card groupBox welcome-card" style="background-color: orange;"
          @click="() => { contactsOnly = true; initiateSOSMode(); }">
          <q-img class="icon" src="/icons/nearby.png" />
          <p class="title text-white">{{ $t('common.helpContacts') }}</p>
          <div class="q-px-sm">
            <q-btn outline color="white" class="" size="sm">
              <span style="font-weight: bolder;">
                {{ $t('common.helpContactsSubtitle') }}
              </span>
            </q-btn>
          </div>

        </div>

        <div class="card groupBox welcome-card" @click="router.push('/volunteers')">
          <q-img class="icon" src="/public/sosicon.png" />
          <p class="title">Emergency Services</p>
          <p class="subtitle">5 Emergency Services </p>
        </div>
        <div class="card groupBox welcome-card">
          <q-img class="icon" src="/safety.png" />
          <p class="title">{{ $t('common.safetyTip') }}</p>
          <p class="subtitle">{{ currentSafetyTip }}</p>
        </div>
      </div>



      <q-btn color="orange" class="help-button q-my-lg" @click="() => {
        contactsOnly = true;
        initiateSOSMode();
      }
        ">
        <div class="row items-center full-width">
          <q-icon name="people" size="2rem" class="q-mr-md" />
          <div class="text-left">
            <div class="text-subtitle1 text-weight-bold">
              {{ $t('common.helpContacts') }}
            </div>
            <div class="text-caption">
              {{ $t('common.helpContactsSubtitle') }}
            </div>
          </div>
        </div>
      </q-btn>
    </div>

    <MissingPermissions />

    <!-- <q-card class="safety-card q-mb-md">
        <q-card-section>
          <h6 class="text-h6 text-weight-bold q-mb-sm">
            {{ $t('common.safetyTip') }}
          </h6>
          <p class="text-body1">{{ currentSafetyTip }}</p>
        </q-card-section>
      </q-card> -->

    <!-- <q-card class="emergency-contacts-card q-mb-md">
        <q-card-section>
          <h6 class="text-h6 text-weight-bold q-mb-sm">
            {{ $t('common.emergencyServices') }}
          </h6>
          <div class="row q-col-gutter-md">
            <div v-for="service in emergencyServices" :key="service.name" class="col-6">
              <q-btn :label="$t(service.name)" :icon="service.icon" color="primary" outline class="full-width"
                @click="callEmergencyService(service.number)" size="sm" />
            </div>
          </div>
        </q-card-section>
      </q-card> -->

    <q-card v-if="isVolunteer" class="volunteer-status-card">
      <q-card-section>
        <h6 class="text-h6 text-weight-bold q-mb-sm">
          {{ $t('common.volunteerStatus') }}
        </h6>
        <q-toggle v-model="volunteerAvailable" :label="$t(
          volunteerAvailable
            ? 'volunteerAvailable'
            : 'volunteerUnavailable'
        )
          " color="positive" @update:model-value="updateVolunteerStatus" />
      </q-card-section>
    </q-card>

    <q-card class="nearby-volunteers-card q-mb-md">
      <!-- <q-card-section> -->
      <!-- <div class="row items-center justify-between q-mb-sm">
            <h6 class="text-h6 text-weight-bold q-my-none">
              {{ $t('common.nearbyVolunteers') }}
            </h6>
            <q-btn flat color="primary" :label="$t('common.viewAll')" @click="router.push('/volunteers')" />
          </div> -->
      <!-- <div v-if="isLoadingLocation" class="text-center">
            <q-spinner color="primary" size="3em" />
            <p>{{ $t('common.gettingLocation') }}</p>
          </div> -->
      <!-- <div v-else-if="nearbyVolunteers.length > 0" class="volunteer-map" ref="volunteerMap">
            <div class="map-center">
              <q-icon :name="$t('common.icons.myLocation')" size="24px" color="primary" />
            </div>
            <div v-for="volunteer in nearbyVolunteers" :key="volunteer.id" class="volunteer-icon"
              :style="getVolunteerPosition(volunteer)">
              <q-icon :name="getVolunteerIcon(volunteer)" size="20px" :color="getVolunteerColor(volunteer)" />
              <q-tooltip>
                {{ volunteer.profession }}
              </q-tooltip>
            </div>
          </div> -->
      <!-- <p v-if="!isLoadingLocation" class="text-center q-mt-sm">
            {{ nearbyVolunteers.length }} {{ $t('common.volunteersNearby') }}
          </p>
          <p v-if="!isLoadingLocation && nearbyVolunteers.length === 0" class="text-center">
            {{ $t('common.noVolunteersNearby') }}
          </p> -->
      <!-- </q-card-section> -->
    </q-card>

  </q-page>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserForm } from 'src/composables/use-user-form';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useUserStore } from 'src/stores/user-store';
import { Geolocation } from '@capacitor/geolocation';
import { api } from 'src/boot/axios';
import MissingPermissions from 'src/components/MissingPermissions.vue';

const router = useRouter();
const $q = useQuasar();
const { t } = useI18n();

const userStore = useUserStore();
const userName = computed(() => userStore.user.name || 'User');
const contactsOnly = ref(false);

const initiateSOSMode = async () => {
  const response = await sendInitialSOSRequest();
  if (response && response.sosEventId) {
    localStorage.setItem('sosEventId', response.sosEventId);
    localStorage.setItem('contactsOnly', contactsOnly.value.toString());
    router.push({
      name: 'sos-mode',
    });
  }
};

const { values, validateAndSubmit, callbacks } = useUserForm(
  'auth/sos-update',
  {
    status: 'created',
    contactsOnly: contactsOnly.value,
  }
);

callbacks.onSuccess = (response) => {
  console.log('SOS log started');
  if (response && response.sosEventId) {
    router.push({
      name: 'sos-mode',
      query: {
        sosEventId: response.sosEventId,
        contactsOnly: contactsOnly.value.toString(),
      },
    });
  }
  return response;
};

const sendInitialSOSRequest = async () => {
  values.value.contactsOnly = contactsOnly.value;
  await validateAndSubmit();
};

const isVolunteer = computed(() => userStore.user.isVolunteer);
const volunteerAvailable = ref(userStore.user.volunteerAvailable);

const safetyTips = [
  'common.safetyTip1',
  'common.safetyTip2',
  'common.safetyTip3',
  'common.safetyTip4',
  'common.safetyTip5',
];
const currentSafetyTip = computed(() =>
  t(safetyTips[Math.floor(Math.random() * safetyTips.length)])
);

const emergencyServices = [
  { name: 'common.police', icon: 'local_police', number: '100' },
  { name: 'common.ambulance', icon: 'emergency', number: '108' },
  {
    name: 'common.fireDepartment',
    icon: 'local_fire_department',
    number: '101',
  },
  { name: 'common.womenHelpline', icon: 'woman', number: '1091' },
];

const callEmergencyService = (number: string) => {
  window.location.href = `tel:${number}`;
};

const updateVolunteerStatus = async () => {
  try {
    await api.post('/user/update-volunteer-status', {
      available: volunteerAvailable.value,
    });
    userStore.updateUser({ volunteerAvailable: volunteerAvailable.value });
    $q.notify({
      type: 'positive',
      message: $t('common.volunteerStatusUpdated'),
    });
  } catch (error) {
    console.error('Failed to update volunteer status:', error);
    $q.notify({
      type: 'negative',
      message: $t('common.volunteerStatusUpdateFailed'),
    });
  }
};

const coords = ref({ latitude: 0, longitude: 0 });
const nearbyVolunteers = ref([]);
const volunteerMap = ref(null);
const isLoadingLocation = ref(true);

const fetchNearbyVolunteers = async () => {
  if (coords.value.latitude && coords.value.longitude) {
    try {
      const response = await api.get('/auth/volunteers-nearby', {
        params: {
          location: `${coords.value.latitude},${coords.value.longitude}`,
          range: 1000, // 1km radius
        },
      });
      nearbyVolunteers.value = response.data.slice(0, 5); // Limit to 5 volunteers for simplicity
    } catch (error) {
      console.error('Error fetching nearby volunteers', error);
    }
  }
};

const getVolunteerPosition = (volunteer) => {
  const mapWidth = volunteerMap.value?.offsetWidth || 300;
  const mapHeight = volunteerMap.value?.offsetHeight || 150;

  // Use the current position as the center
  const latitude = coords.value.latitude;
  const longitude = coords.value.longitude;

  // Calculate the distance from the center to the volunteer's location
  const distanceX = volunteer.location.coordinates[0] - longitude;
  const distanceY = volunteer.location.coordinates[1] - latitude;

  // Convert degrees to meters (approximate)
  const scaleX = distanceX * 111320 * (mapWidth / 2000); // Scale based on 1km radius
  const scaleY = distanceY * 110574 * (mapHeight / 2000); // Scale based on 1km radius

  const x = mapWidth / 2 + scaleX;
  const y = mapHeight / 2 - scaleY;

  return {
    left: `${x}px`,
    top: `${y}px`,
  };
};

const getVolunteerIcon = (volunteer) => {
  const professionIcons = {
    hospital: 'local_hospital',
    'Doctor General': 'local_hospital',
    'Doctor Emergency': 'local_hospital',
    '2 Wheeler Mechanic': 'build',
    '4 Wheeler Mechanic': 'build',
    '2&4 Wheeler Mechanic': 'build',
    Nurse: 'local_hospital',
    Other: 'person',
  };
  return professionIcons[volunteer.profession] || 'person';
};

const getVolunteerColor = (volunteer) => {
  const professionColors = {
    doctor: 'red',
    police: 'blue',
    firefighter: 'orange',
    default: 'green',
  };
  return professionColors[volunteer.profession] || professionColors.default;
};

onMounted(async () => {
  isLoadingLocation.value = true;
  try {
    const position = await Geolocation.getCurrentPosition();
    coords.value = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    await fetchNearbyVolunteers();
  } catch (error) {
    console.error('Error getting current position:', error);
  } finally {
    isLoadingLocation.value = false;
  }
});
</script>

<style lang="scss" scoped>
.dashboard-page {
  background: linear-gradient(135deg, $primary, darken($primary, 20%));
  min-height: 100vh;
}

.dashboard-content {
  max-width: 600px;
  margin: 0 auto;
}

.welcome-card,
.safety-card,
.emergency-contacts-card,
.volunteer-status-card,
.nearby-volunteers-card {
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.sos-buttons {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.sos-button {
  height: 200px;
  width: 200px;
  font-weight: bold;
  // box-shadow: 0 4px 8px rgba(255, 0, 0, 0.3);
}

.glowing-border {
  border: 5px solid #ffffff;
  margin: auto;
  margin-top: 20px;
  border-radius: 100%;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.5),
    /* Glow effect */
    0 0 40px rgba(255, 255, 255, 0.5);
  /* Further glow */
}


.help-button {
  height: 80px;
  font-weight: bold;
  width: 100%;
  box-shadow: 0 4px 8px rgba(255, 165, 0, 0.3);
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

.flex-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-top: 30px;
}

.groupBox {
  width: 49%;
  height: 200px;
  background-color: white;
  text-align: center;
  margin-bottom: 8px;

  /* Adjusted the margin */
}

.icon {
  width: 80px;
  height: 80px;
  margin-top: 8px;
}

.title {
  font-size: 16px;
  font-weight: bold;
  margin-top: 5px;
  padding: 0 16px;
}

.subtitle {
  font-size: 12px;
  padding: 5px;
}
</style>
