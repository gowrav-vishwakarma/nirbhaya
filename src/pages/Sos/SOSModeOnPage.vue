<template>
  <q-page>
    <q-card class="q-mt-lg" style="
        background-color: white;
        border-radius: 20px 20px 0 0;
        height: 100%;
        bottom: 0;
        left: 0;
        top: 5px;
        width: 100%;
        overflow-y: auto;
      ">
      <div class="row">
        <div class="col-12 col-md-12 q-px-md q-mt-xl">
          <h6 class="q-ma-none q-ml-xs">{{ $t('sosWarning') }}</h6>
        </div>

        <!-- Timer and Cancel SOS button -->
        <template v-if="!sosSent">
          <div class="col-12 col-md-12 q-px-md q-mt-md text-center">
            <q-circular-progress show-value class="text-red q-ma-md" :value="timeLeft" size="100px" :thickness="0.22"
              color="red" track-color="grey-3" :min="0" :max="countdownDuration" @click="resetCountdown">
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
        <div class="col-12 col-md-12 q-px-md q-mt-lg flex flex-wrap justify-between">
          <q-btn style="width: 48%" class="q-mb-md" @click="updateThreat('followedBySomeone')">
            <span class="q-ml-xs">{{ $t('followedBySomeone') }}</span>
          </q-btn>
          <q-btn style="width: 48%" class="q-mb-md" @click="updateThreat('verbalHarassment')">
            <span class="q-ml-xs">{{ $t('verbalHarassment') }}</span>
          </q-btn>
          <q-btn style="width: 48%" class="q-mb-md" @click="updateThreat('physicalThreat')">
            <span class="q-ml-xs">{{ $t('physicalThreat') }}</span>
          </q-btn>
          <q-btn style="width: 48%" class="q-mb-md" @click="updateThreat('attemptedKidnapping')">
            <span class="q-ml-xs">{{ $t('attemptedKidnapping') }}</span>
          </q-btn>
          <q-btn style="width: 48%" class="q-mb-md" @click="updateThreat('sexualAssault')">
            <span class="q-ml-xs">{{ $t('sexualAssault') }}</span>
          </q-btn>
          <q-btn style="width: 48%" class="q-mb-md" @click="updateThreat('domesticViolence')">
            <span class="q-ml-xs">{{ $t('domesticViolence') }}</span>
          </q-btn>
        </div>
        <div class="col-12 col-md-12 q-px-md q-mt-lg">
          <h6 class="q-ma-none q-ml-xs">{{ $t('currentLocation') }}</h6>
          <div>
            <q-icon name="my_location" color="deep-orange" size="sm" />
            <span class="q-ml-sm" style="font-size: 20px">
              {{ currentLocationName || $t('gettingLocation') }}
            </span>
          </div>
          <p v-if="currentLocation.latitude && currentLocation.longitude" class="text-caption q-mt-sm">
            {{ $t('coordinates') }}: {{ currentLocation.latitude.toFixed(6) }},
            {{ currentLocation.longitude.toFixed(6) }}
          </p>
        </div>
        <div class="col-12 col-md-12 q-px-md q-mt-lg">
          <h6 class="q-ma-none q-ml-xs">{{ $t('nearbyPoliceStations') }}</h6>
          <div>
            <q-btn round color="deep-orange" icon="edit_location" />
            <span class="q-ml-sm" style="font-size: 20px">South Bopal Ahmedabad</span>
          </div>
        </div>

        <div class="col-12 col-md-12 q-px-md q-mt-lg flex justify-center q-mb-lg">
          <q-btn @click="sendLocationUpdate('edit', 'active')" style="width: 100%"
            class="primaryBackGroundColor text-white"><b class="q-ml-xs q-my-md">{{
            $t('contactPoliceStation')
          }}</b></q-btn>
        </div>

        <div v-if="isGettingLocation" class="text-center q-mt-md">
          <q-spinner color="primary" size="3em" />
          <p>{{ $t('gettingLocation') }}</p>
        </div>
      </div>
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Microphone } from '@capacitor/microphone';
import { Network } from '@capacitor/network';
import { useUserForm } from 'src/composables/use-user-form';

// import { SMS } from '@capacitor/sms';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();

const countdownDuration = 10; // seconds
const timeLeft = ref(countdownDuration);
let countdownInterval: number | null = null;
const sosSent = ref(false);
const notifiedPersons = ref(0);
const acceptedPersons = ref(0);
const createdSosId = ref(0);

const initialRequestTime =
  Number(route.params.initialRequestTime) || Date.now();

const currentLocation = ref({ latitude: null, longitude: null });
const currentLocationName = ref('');
let locationUpdateInterval: number | null = null;

const isRecording = ref(false);
let mediaRecorder: MediaRecorder | null = null;
let audioStream: MediaStream | null = null;
let videoStream: MediaStream | null = null;

const isGettingLocation = ref(false);
const isLocationReceived = ref(false);
const selectedThreat = ref('');


const updateCurrentLocation = async (action = 'edit'): Promise<void> => {
  isGettingLocation.value = true;
  try {
    let position;
    if (Capacitor.isNativePlatform()) {
      position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });
    } else {
      position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });
    }

    currentLocation.value.latitude = position.coords.latitude;
    currentLocation.value.longitude = position.coords.longitude;

    currentLocationName.value = `Lat: ${position.coords.latitude.toFixed(
      4
    )}, Lon: ${position.coords.longitude.toFixed(4)}`;

    isLocationReceived.value = true;

    if (action == 'create') {
      await sendLocationUpdate('create');
    } else {
      if (sosSent.value) {
        await sendLocationUpdate('edit');
      }
    }
  } catch (error) {
    console.error('Error getting location', error);
  } finally {
    isGettingLocation.value = false;
  }
};

const startRecording = async () => {
  try {
    if (Capacitor.isNativePlatform()) {
      // For mobile platforms
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
      });

      // Save the image file
      const fileName = new Date().getTime() + '.jpeg';
      await Filesystem.writeFile({
        path: fileName,
        data: image.path,
        directory: Directory.Data,
      });

      console.log('Recording saved:', fileName);
    } else {
      // For web platform, use the existing implementation
      audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      videoStream = await navigator.mediaDevices.getUserMedia({ video: true });

      const combinedStream = new MediaStream([
        ...audioStream.getAudioTracks(),
        ...videoStream.getVideoTracks(),
      ]);

      mediaRecorder = new MediaRecorder(combinedStream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
          // Here you would send the chunk for streaming
          streamChunk(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        saveRecording(blob);
      };

      mediaRecorder.start(1000); // Capture in 1-second intervals
    }

    isRecording.value = true;
  } catch (error) {
    console.error('Failed to start recording:', error);
  }
};

const stopRecording = () => {
  if (mediaRecorder) {
    mediaRecorder.stop();
    isRecording.value = false;
  }
  if (audioStream) audioStream.getTracks().forEach((track) => track.stop());
  if (videoStream) videoStream.getTracks().forEach((track) => track.stop());
};

const saveRecording = async (blob: Blob) => {
  // Implement saving the recording locally
  // This is a placeholder implementation
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'sos_recording.webm';
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
};

const streamChunk = (chunk: Blob) => {
  // Implement your streaming logic here
  // This could involve sending the chunk to a server using WebSockets or WebRTC
  console.log('Streaming chunk:', chunk);
};

onMounted(() => {
  startCountdown();
  updateCurrentLocation('create');
  startLocationUpdates();
});

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  if (locationUpdateInterval) {
    clearInterval(locationUpdateInterval);
  }
  stopRecording();
});

const startCountdown = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  timeLeft.value = countdownDuration;
  countdownInterval = setInterval(() => {
    timeLeft.value--;
    if (timeLeft.value <= 0) {
      clearInterval(countdownInterval!);
      confirmSOS();
    }
  }, 1000);
};

const resetCountdown = () => {
  startCountdown();
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
    // Start location update in the background
    updateCurrentLocation();

    // Set a timeout for waiting for location
    setTimeout(async () => {
      if (!isLocationReceived.value) {
        await sendConfirmSOSRequest(threatType);
      }
    }, 3000); // Wait for 3 seconds

    sosSent.value = true;
    notifiedPersons.value = 10;
    acceptedPersons.value = 3;
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
    startRecording();
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
  const networkStatus = await Network.getStatus();

  const sosData = {
    threatType,
    location: currentLocation.value,
    timestamp: new Date().toISOString(),
  };

  if (networkStatus.connected) {
    try {
      // TODO: Implement actual API call
      console.log('Sending confirm SOS request', sosData);
      // If API call is successful, return
      return;
    } catch (error) {
      console.error('Failed to send SOS request via API:', error);
      // If API call fails, fall through to SMS
    }
  } else {
    // If no internet, send SMS
    try {
      await sendSOSviaSMS(sosData);
    } catch (error) {
      console.error('Failed to send SOS via SMS:', error);
    }
  }

  // If no internet or API call failed, send SMS
  try {
    // TODO: Implement SMS sending
    // await sendSOSviaSMS(sosData);
  } catch (error) {
    console.error('Failed to send SOS via SMS:', error);
    // TODO: Show error message to user
  }

  // Start background task to keep trying API
  startBackgroundAPIRetry(sosData);
};

const sendSOSviaSMS = async (sosData: any) => {
  const message = `SOS: ${sosData.threatType || 'Emergency'} at ${sosData.location.latitude
    }, ${sosData.location.longitude}. Time: ${sosData.timestamp}`;

  try {
    await SMS.send({
      numbers: ['EMERGENCY_NUMBER'], // Replace with actual emergency number
      text: message,
    });
    console.log('SOS sent via SMS');
  } catch (error) {
    console.error('Failed to send SMS:', error);
    throw error;
  }
};

const startBackgroundAPIRetry = (sosData: any) => {
  const retryInterval = setInterval(async () => {
    const networkStatus = await Network.getStatus();
    if (networkStatus.connected) {
      try {
        // TODO: Implement actual API call
        console.log('Retrying SOS API call', sosData);
        // If successful, clear the interval
        clearInterval(retryInterval);
      } catch (error) {
        console.error('Failed to send SOS request via API:', error);
      }
    }
  }, 30000); // Retry every 30 seconds
};

const updateThreat = async (threatType: string) => {
  if (!sosSent.value) {
    // If SOS hasn't been sent yet, send it immediately with the threat information
    await confirmSOS(threatType);
    console.log('threatType.........', threatType);

  } else {
    try {
      await sendUpdateThreatRequest(threatType);
      // You might want to update the UI to show that the threat has been updated
      selectedThreat.value = threatType
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

const startLocationUpdates = () => {
  locationUpdateInterval = setInterval(() => {
    updateCurrentLocation();
  }, 10000); // Update every 10 seconds
};

const {
  values,
  validateAndSubmit,
  errors,
  callbacks,
  isLoading,
  updateUrl,
} = useUserForm('auth/sos-location-crud', {
  location: '',
  userId: 1,
  status: '',
  threat: ''
})

callbacks.onSuccess = (data) => {
  console.log('data...........', data);
  return data
}


const sendLocationUpdate = async (action = 'edit', threat = 'created') => {
  try {
    values.value.status = threat
    values.value.location = currentLocation.value;
    values.value.threat = selectedThreat.value
    await validateAndSubmit()
    // TODO: Implement actual API call to update location on the server
    console.log('Sending location update:', currentLocation.value);
    // Example API call:
    // await api.updateSOSLocation(currentLocation.value);
  } catch (error) {
    console.error('Failed to send location update:', error);
  }
};

// Add a watcher for isLocationReceived
watch(isLocationReceived, async (newValue) => {
  if (newValue && sosSent.value) {
    await sendLocationUpdate('edit');
  }
});
</script>

<style scoped></style>
