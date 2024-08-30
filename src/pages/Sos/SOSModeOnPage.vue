<template>
  <q-page>
    <q-card
      class="q-mt-lg"
      style="
        background-color: white;
        border-radius: 20px 20px 0 0;
        height: 100%;
        bottom: 0;
        left: 0;
        top: 5px;
        width: 100%;
        overflow-y: auto;
      "
    >
      <div class="row">
        <div class="col-12 col-md-12 q-px-md q-mt-xl">
          <h6 class="q-ma-none q-ml-xs">{{ $t('sosWarning') }}</h6>
        </div>

        <!-- Timer and Cancel SOS button -->
        <template v-if="!sosSent">
          <div class="col-12 col-md-12 q-px-md q-mt-md text-center">
            <q-circular-progress
              show-value
              class="text-red q-ma-md"
              :value="timeLeft"
              size="100px"
              :thickness="0.22"
              color="red"
              track-color="grey-3"
              :min="0"
              :max="countdownDuration"
            >
              {{ timeLeft }}
            </q-circular-progress>
          </div>
          <div class="col-12 col-md-12 q-px-md q-mt-md text-center">
            <q-btn color="red" :label="$t('cancelSOS')" @click="cancelSOS" />
          </div>
        </template>

        <!-- SOS Sent message -->
        <div v-else class="col-12 col-md-12 q-px-md q-mt-md text-center">
          <h4 class="text-red">SOS Sent</h4>
        </div>

        <!-- Notification status -->
        <div v-if="sosSent" class="col-12 col-md-12 q-px-md q-mt-md">
          <p>Notification sent to {{ notifiedPersons }} nearby persons</p>
          <p>Accepted by {{ acceptedPersons }} persons</p>
          <p>Emergency contacts informed</p>
        </div>

        <div class="col-12 col-md-12 q-px-md">
          <h5 class="q-ma-none q-ml-xs text-bold q-mt-md">
            {{ $t('helpUsMore') }}
          </h5>
        </div>
        <div
          class="col-12 col-md-12 q-px-md q-mt-lg flex flex-wrap justify-between"
        >
          <q-btn
            style="width: 48%"
            class="q-mb-md"
            @click="updateThreat('followedBySomeone')"
          >
            <span class="q-ml-xs">{{ $t('followedBySomeone') }}</span>
          </q-btn>
          <q-btn
            style="width: 48%"
            class="q-mb-md"
            @click="updateThreat('verbalHarassment')"
          >
            <span class="q-ml-xs">{{ $t('verbalHarassment') }}</span>
          </q-btn>
          <q-btn
            style="width: 48%"
            class="q-mb-md"
            @click="updateThreat('physicalThreat')"
          >
            <span class="q-ml-xs">{{ $t('physicalThreat') }}</span>
          </q-btn>
          <q-btn
            style="width: 48%"
            class="q-mb-md"
            @click="updateThreat('attemptedKidnapping')"
          >
            <span class="q-ml-xs">{{ $t('attemptedKidnapping') }}</span>
          </q-btn>
          <q-btn
            style="width: 48%"
            class="q-mb-md"
            @click="updateThreat('sexualAssault')"
          >
            <span class="q-ml-xs">{{ $t('sexualAssault') }}</span>
          </q-btn>
          <q-btn
            style="width: 48%"
            class="q-mb-md"
            @click="updateThreat('domesticViolence')"
          >
            <span class="q-ml-xs">{{ $t('domesticViolence') }}</span>
          </q-btn>
        </div>
        <div class="col-12 col-md-12 q-px-md q-mt-lg">
          <h6 class="q-ma-none q-ml-xs">Current Location</h6>
          <div>
            <q-icon name="my_location" color="deep-orange" size="sm" />
            <span class="q-ml-sm" style="font-size: 20px">
              {{ currentLocationName || 'Updating location...' }}
            </span>
          </div>
          <p
            v-if="currentLocation.latitude && currentLocation.longitude"
            class="text-caption q-mt-sm"
          >
            {{ $t('coordinates') }}: {{ currentLocation.latitude.toFixed(6) }},
            {{ currentLocation.longitude.toFixed(6) }}
          </p>
        </div>
        <div class="col-12 col-md-12 q-px-md q-mt-lg">
          <h6 class="q-ma-none q-ml-xs">Nearby Police Stations</h6>
          <div>
            <q-btn round color="deep-orange" icon="edit_location" />
            <span class="q-ml-sm" style="font-size: 20px"
              >South Bopal Ahmedabad</span
            >
          </div>
        </div>

        <div
          class="col-12 col-md-12 q-px-md q-mt-lg flex justify-center q-mb-lg"
        >
          <q-btn style="width: 100%" class="primaryBackGroundColor text-white"
            ><b class="q-ml-xs q-my-md">Contect Police Station</b></q-btn
          >
        </div>
      </div>
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();

const countdownDuration = 10; // seconds
const timeLeft = ref(countdownDuration);
let countdownInterval: number | null = null;
const sosSent = ref(false);
const notifiedPersons = ref(0);
const acceptedPersons = ref(0);

const initialRequestTime =
  Number(route.params.initialRequestTime) || Date.now();

const currentLocation = ref({ latitude: null, longitude: null });
const currentLocationName = ref('');
let locationUpdateInterval: number | null = null;

onMounted(() => {
  startCountdown();
  updateCurrentLocation();
  startLocationUpdates();
});

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  if (locationUpdateInterval) {
    clearInterval(locationUpdateInterval);
  }
});

const startCountdown = () => {
  countdownInterval = setInterval(() => {
    timeLeft.value--;
    if (timeLeft.value <= 0) {
      clearInterval(countdownInterval!);
      confirmSOS();
    }
  }, 1000);
};

const cancelSOS = async () => {
  try {
    await sendCancelSOSRequest();
    router.push('/dashboard');
  } catch (error) {
    console.error('Failed to cancel SOS request:', error);
    // TODO: Show error message to user
  }
};

const confirmSOS = async (threatType?: string) => {
  try {
    await sendConfirmSOSRequest(threatType);
    sosSent.value = true;
    // Simulate receiving notification data
    notifiedPersons.value = 10;
    acceptedPersons.value = 3;
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
  } catch (error) {
    console.error('Failed to confirm SOS request:', error);
    // TODO: Show error message to user
  }
};

const sendCancelSOSRequest = async () => {
  // TODO: Implement actual API call
  console.log('Sending cancel SOS request');
};

const sendConfirmSOSRequest = async (threatType?: string) => {
  // TODO: Implement actual API call
  console.log(
    'Sending confirm SOS request',
    threatType ? `with threat: ${threatType}` : '',
    'Current location:',
    currentLocation.value
  );
};

const updateThreat = async (threatType: string) => {
  if (!sosSent.value) {
    // If SOS hasn't been sent yet, send it immediately with the threat information
    await confirmSOS(threatType);
  } else {
    try {
      await sendUpdateThreatRequest(threatType);
      // You might want to update the UI to show that the threat has been updated
      console.log(`Threat updated: ${threatType}`);
    } catch (error) {
      console.error('Failed to update threat:', error);
      // TODO: Show error message to user
    }
  }
};

const sendUpdateThreatRequest = async (threatType: string) => {
  // TODO: Implement actual API call to update the threat
  console.log(
    `Sending update threat request: ${threatType}`,
    'Current location:',
    currentLocation.value
  );
};

const updateCurrentLocation = async () => {
  try {
    let position;
    if (Capacitor.isNativePlatform()) {
      position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
      });
    } else {
      // Fallback for web browsers
      position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
        });
      });
    }

    currentLocation.value.latitude = position.coords.latitude;
    currentLocation.value.longitude = position.coords.longitude;

    // Update location name (you might want to use a reverse geocoding service here)
    currentLocationName.value = `Lat: ${position.coords.latitude.toFixed(
      4
    )}, Lon: ${position.coords.longitude.toFixed(4)}`;

    // If SOS is already sent, update the server with the new location
    if (sosSent.value) {
      await sendLocationUpdate();
    }
  } catch (error) {
    console.error('Error getting location', error);
    // TODO: Show error message to user
  }
};

const startLocationUpdates = () => {
  locationUpdateInterval = setInterval(() => {
    updateCurrentLocation();
  }, 10000); // Update every 10 seconds
};

const sendLocationUpdate = async () => {
  // TODO: Implement actual API call to update location on the server
  console.log('Sending location update:', currentLocation.value);
};
</script>

<style scoped></style>
