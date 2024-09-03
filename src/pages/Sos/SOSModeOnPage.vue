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
              @click="resetCountdown"
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
          <p>Notification sent to {{ informed }} nearby persons</p>
          <p>Accepted by {{ accepted }} persons</p>
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
            @click="handleThreatButtonClick('followedBySomeone')"
          >
            <span class="q-ml-xs">{{ $t('followedBySomeone') }}</span>
          </q-btn>
          <q-btn
            style="width: 48%"
            class="q-mb-md"
            @click="handleThreatButtonClick('verbalHarassment')"
          >
            <span class="q-ml-xs">{{ $t('verbalHarassment') }}</span>
          </q-btn>
          <q-btn
            style="width: 48%"
            class="q-mb-md"
            @click="handleThreatButtonClick('physicalThreat')"
          >
            <span class="q-ml-xs">{{ $t('physicalThreat') }}</span>
          </q-btn>
          <q-btn
            style="width: 48%"
            class="q-mb-md"
            @click="handleThreatButtonClick('attemptedKidnapping')"
          >
            <span class="q-ml-xs">{{ $t('attemptedKidnapping') }}</span>
          </q-btn>
          <q-btn
            style="width: 48%"
            class="q-mb-md"
            @click="handleThreatButtonClick('sexualAssault')"
          >
            <span class="q-ml-xs">{{ $t('sexualAssault') }}</span>
          </q-btn>
          <q-btn
            style="width: 48%"
            class="q-mb-md"
            @click="handleThreatButtonClick('domesticViolence')"
          >
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
          <p
            v-if="currentLocation.latitude && currentLocation.longitude"
            class="text-caption q-mt-sm"
          >
            {{ $t('coordinates') }}: {{ currentLocation.latitude.toFixed(6) }},
            {{ currentLocation.longitude.toFixed(6) }}
          </p>
        </div>
        <div class="col-12 col-md-12 q-px-md q-mt-lg">
          <h6 class="q-ma-none q-ml-xs">{{ $t('nearbyPoliceStations') }}</h6>
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
          <q-btn
            @click="updateSOSData({ status: 'active' })"
            style="width: 100%"
            class="primaryBackGroundColor text-white"
            ><b class="q-ml-xs q-my-md">{{
              $t('contactPoliceStation')
            }}</b></q-btn
          >
        </div>

        <div
          v-if="sosSent"
          class="col-12 col-md-12 q-px-md q-mt-lg flex justify-center q-mb-lg"
        >
          <q-btn
            @click="showResolveConfirmation"
            style="width: 100%"
            color="positive"
            class="q-mb-md"
          >
            <b class="q-ml-xs q-my-md">{{ $t('resolveSOSIssue') }}</b>
          </q-btn>
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
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  Geolocation,
  Position,
  WatchPositionCallback,
} from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Network } from '@capacitor/network';
import { useUserForm } from 'src/composables/use-user-form';
import { usePermissions } from 'src/composables/usePermissions';
import { io } from 'socket.io-client';
import { useQuasar } from 'quasar';
// import { SMS } from '@capacitor/sms';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const $q = useQuasar();

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
let watchId: string | null = null;

const isRecording = ref(false);
const socket = io(process.env.API_BASE_URL);
let mediaRecorder: MediaRecorder | null = null;
let mediaStream: MediaStream | null = null;
let recordedChunks: Blob[] = [];

const isGettingLocation = ref(false);
const isLocationReceived = ref(false);
const selectedThreat = ref('');

const { permissions, checkPermissions, requestPermission, activatePermission } =
  usePermissions();

const shouldStream = computed(() => process.env.STREAM_SAVE === 'true');

const locationSentToServer = ref(false);

onMounted(async () => {
  await checkPermissions();
  await activateSOSPermissions();
  startCountdown();
  await startLocationWatching();
});

const showResolveConfirmation = () => {
  const locationMessage = locationSentToServer.value
    ? 'Your location has been sent to the server.'
    : 'Your location has not been sent to the server yet.';

  $q.dialog({
    title: 'SOS Event Options',
    message: `What would you like to do with your SOS event? ${locationMessage}`,
    options: {
      type: 'radio',
      model: 'close',
      items: [
        { label: 'Close the SOS event', value: 'close' },
        { label: 'Resolve the SOS event', value: 'resolve' },
        { label: 'Keep the SOS event active', value: 'keep' },
      ],
    },
    cancel: true,
    persistent: true,
  })
    .onOk(async (action) => {
      switch (action) {
        case 'close':
          await updateSOSData({ status: 'closed' });
          $q.notify({
            message: 'Your SOS event has been closed.',
            color: 'info',
          });
          router.push('/dashboard');
          break;
        case 'resolve':
          await updateSOSData({ status: 'resolved' });
          $q.notify({
            message: 'Your SOS event has been resolved.',
            color: 'positive',
          });
          router.push('/dashboard');
          break;
        case 'keep':
          $q.notify({
            message: 'Your SOS event remains active.',
            color: 'warning',
          });
          break;
      }
    })
    .onCancel(() => {
      $q.notify({
        message: 'Action cancelled. Your SOS event remains active.',
        color: 'warning',
      });
    });
};

onUnmounted(async () => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  await stopLocationWatching();
  await stopRecordingAndStreaming();

  // Only show the confirmation if SOS has been sent
  if (sosSent.value) {
    showResolveConfirmation();
  }
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
      updateSOSData({ status: 'active', confirm: true });
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

const activateSOSPermissions = async () => {
  const requiredPermissions = ['location', 'camera'];
  for (const permissionName of requiredPermissions) {
    const permission = permissions.value.find((p) => p.name === permissionName);
    if (permission && !permission.granted) {
      await requestPermission(permissionName);
    }
    await activatePermission(permissionName);
  }
};

const updateSOSData = async (data: {
  location?: { latitude: number | null; longitude: number | null };
  status?: string;
  threat?: string;
  confirm?: boolean;
}) => {
  try {
    if (data.confirm || !sosSent.value) {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
      sosSent.value = true;
      notifiedPersons.value = 10;
      acceptedPersons.value = 3;
      startRecordingAndStreaming();
    }

    // Always update all available values
    if (currentLocation.value.longitude && currentLocation.value.latitude) {
      values.value.location = currentLocation.value;
    }
    if (data.status) values.value.status = data.status;
    if (data.threat) values.value.threat = data.threat;

    await validateAndSubmit();
    console.log('SOS data updated:', values.value);
    locationSentToServer.value = true; // Set this to true when data is successfully sent

    if (!isLocationReceived.value) {
      updateCurrentLocation();
    }
  } catch (error) {
    console.error('Failed to update SOS data:', error);
  }
};

const handleThreatButtonClick = (threatType: string) => {
  updateSOSData({ threat: threatType, status: 'active', confirm: true });
};

const sendCancelSOSRequest = async () => {
  // TODO: Implement actual API call
  await updateSOSData({ status: 'cancelled' });
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
  const message = `SOS: ${sosData.threatType || 'Emergency'} at ${
    sosData.location.latitude
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

const startLocationWatching = async () => {
  try {
    watchId = await Geolocation.watchPosition(
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 10000,
      },
      handleLocationUpdate
    );

    console.log('Started watching location');
  } catch (error) {
    console.error('Error starting location watch:', error);
    currentLocationName.value = t('locationWatchError');
  }
};

const handleLocationUpdate: WatchPositionCallback = (
  position: Position | null,
  err?: any
) => {
  if (err) {
    console.error('Error in location update:', err);
    return;
  }

  if (position) {
    currentLocation.value = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    currentLocationName.value = `Lat: ${currentLocation.value.latitude.toFixed(
      4
    )}, Lon: ${currentLocation.value.longitude.toFixed(4)}`;
    isLocationReceived.value = true;

    if (sosSent.value) {
      updateSOSData({}).catch(console.error);
    }
  }
};

const stopLocationWatching = async () => {
  if (watchId !== null) {
    await Geolocation.clearWatch({ id: watchId });
    watchId = null;
    console.log('Stopped watching location');
  }
};

const { values, validateAndSubmit, errors, callbacks, isLoading, updateUrl } =
  useUserForm('auth/sos-update', {
    location: '',
    status: '',
    threat: '',
  });

const informed = ref(0);
const accepted = ref(0);

callbacks.onSuccess = (data) => {
  console.log('data...........', data);
  informed.value = data.informed;
  accepted.value = data.accepted;
  return data;
};

const updateCurrentLocation = async (): Promise<void> => {
  if (!watchId) {
    await startLocationWatching();
  }

  if (isLocationReceived.value) {
    await updateSOSData({ location: currentLocation.value, status: 'active' });
  }
};

const startRecordingAndStreaming = async () => {
  try {
    if (Capacitor.isNativePlatform()) {
      // For mobile platforms (iOS and Android)
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
      });

      // Save the image file
      const fileName = `sos_image_${Date.now()}.jpeg`;
      await Filesystem.writeFile({
        path: fileName,
        data: image.path!,
        directory: Directory.Data,
      });

      console.log('Image saved:', fileName);
      isRecording.value = true;
    } else {
      // For web platform (PWA mode)
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        // Try to use a more widely supported format
        const mimeType = getSupportedMimeType([
          'video/webm',
          'video/mp4',
          'video/x-matroska',
          'video/quicktime',
        ]);

        if (!mimeType) {
          throw new Error('No supported mime type found for video recording');
        }

        mediaRecorder = new MediaRecorder(mediaStream, { mimeType });

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunks.push(event.data);
            if (shouldStream.value) {
              socket.emit('stream-chunk', event.data);
            }
          }
        };

        mediaRecorder.start(1000); // Capture data every second
        isRecording.value = true;
      } else {
        throw new Error('Media Devices API not available');
      }
    }
  } catch (error) {
    console.error('Failed to start recording:', error);
    // You might want to show a user-friendly error message here
  }
};

// Helper function to get supported MIME type
const getSupportedMimeType = (types: string[]): string | null => {
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return null;
};

const stopRecordingAndStreaming = async () => {
  if (Capacitor.isNativePlatform()) {
    isRecording.value = false;
    // For mobile platforms, we don't need to do anything here
    // as we've already saved the image in startRecordingAndStreaming
  } else if (mediaRecorder && isRecording.value) {
    mediaRecorder.stop();
    isRecording.value = false;

    if (shouldStream.value) {
      socket.emit('end-stream');
    }

    // Stop all tracks
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
    }

    // Save the recorded video locally
    await saveRecording();
  }
};

const saveRecording = async () => {
  if (!Capacitor.isNativePlatform() && mediaRecorder) {
    try {
      const mimeType = mediaRecorder.mimeType;
      const fileExtension = mimeType.split('/')[1].split(';')[0];
      const videoBlob = new Blob(recordedChunks, { type: mimeType });
      const fileName = `sos_recording_${Date.now()}.${fileExtension}`;

      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      console.log('Recording downloaded in browser:', fileName);
    } catch (error) {
      console.error('Failed to save recording:', error);
    }
  }
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
</script>

<style scoped></style>
