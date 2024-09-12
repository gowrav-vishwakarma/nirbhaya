<template>
  <q-page class="bg-grey-1">
    <q-card class="sos-card q-pa-lg">
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <div class="text-h6 text-weight-bold text-red text-center">
            {{ $t('sosWarning') }}
          </div>
        </div>

        <template v-if="!sosSent">
          <div class="col-12 text-center">
            <q-circular-progress
              show-value
              class="text-red q-ma-md"
              :value="timeLeft"
              size="120px"
              :thickness="0.22"
              color="red"
              track-color="grey-3"
              :min="0"
              :max="countdownDuration"
              @click="resetCountdown"
            >
              <div class="text-h6">{{ timeLeft }}</div>
            </q-circular-progress>
          </div>
          <div class="col-12 text-center">
            <q-btn color="red" :label="$t('cancelSOS')" @click="cancelSOS" />
          </div>
        </template>

        <div v-else class="col-12 text-center">
          <div class="text-h6 text-red text-weight-bold">SOS Sent</div>
          <div v-if="isNavigatorMediaSupported">
            <q-btn
              round
              size="xl"
              :color="isAudioOpen ? 'primary' : 'grey'"
              :icon="$t('icons.mic')"
              @click="toggleAudio"
            />
            <p class="q-mt-sm">
              {{ isAudioOpen ? 'Audio Connected' : 'Click to Open Audio' }}
            </p>
          </div>
        </div>

        <div v-if="sosSent" class="col-12">
          <p class="text-body1">
            Notification sent to {{ informed }} nearby persons
          </p>
          <p class="text-body1">Accepted by {{ accepted }} persons</p>
          <p class="text-body1">Emergency contacts informed</p>
        </div>

        <div class="col-12">
          <h5 class="text-h6 text-weight-bold q-mt-md">
            {{ $t('helpUsMore') }}
          </h5>
        </div>

        <div class="col-12 q-gutter-y-sm">
          <q-btn
            v-for="threat in threats"
            :key="threat"
            class="full-width"
            color="primary"
            outline
            @click="handleThreatButtonClick(threat)"
          >
            {{ $t(threat) }}
          </q-btn>
        </div>

        <div class="col-12 q-mt-md">
          <h6 class="text-subtitle1 text-weight-bold">
            {{ $t('currentLocation') }}
          </h6>
          <div class="text-body1">
            <q-icon :name="$t('icons.myLocation')" color="primary" size="sm" />
            <span class="q-ml-sm">
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

        <div class="col-12 q-mt-md">
          <h6 class="text-subtitle1 text-weight-bold">
            {{ $t('nearbyPoliceStations') }}
          </h6>
          <div class="text-body1">
            <q-icon :name="$t('icons.locationOn')" color="primary" size="sm" />
            <span class="q-ml-sm">South Bopal Ahmedabad</span>
          </div>
        </div>

        <div class="col-12 q-mt-lg">
          <q-btn
            @click="updateSOSData({ status: 'active' })"
            color="primary"
            class="full-width"
          >
            <b>{{ $t('contactPoliceStation') }}</b>
          </q-btn>
        </div>

        <div v-if="sosSent" class="col-12 q-mt-md">
          <q-btn
            @click="showResolveConfirmation"
            color="positive"
            class="full-width"
          >
            <b>{{ $t('resolveSOSIssue') }}</b>
          </q-btn>
        </div>

        <div class="col-12 q-mt-lg">
          <q-expansion-item
            label="Logs"
            icon="mdi-clipboard-text"
            class="text-h6 text-weight-bold"
          >
            <div v-for="(log, index) in logs" :key="index" class="text-body1">
              {{ log }}
              <q-separator v-if="index < logs.length - 1" class="q-my-sm" />
            </div>
          </q-expansion-item>
        </div>
      </div>
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch, computed, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  Geolocation,
  Position,
  WatchPositionCallback,
} from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';
import { useUserForm } from 'src/composables/use-user-form';
import { usePermissions } from 'src/composables/usePermissions';
import { useQuasar } from 'quasar';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { socket } from 'boot/socket';
import Peer from 'peerjs';
import { onBeforeRouteLeave } from 'vue-router';
import { useUserStore } from 'src/stores/user-store';
import { api } from 'boot/axios';
import axios from 'axios';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const $q = useQuasar();
const userStore = useUserStore();

const STREAM_SAVE = process.env.STREAM_SAVE;

const countdownDuration = 10; // seconds
const timeLeft = ref(countdownDuration);
let countdownInterval: number | null = null;
const sosSent = ref(false);
const isResolvingManually = ref(false);
const notifiedPersons = ref(0);
const acceptedPersons = ref(0);

const createdSosId = ref(route.query.sosEventId || '');
const contactsOnly = ref(route.query.contactsOnly === 'true');

const initialRequestTime =
  Number(route.params.initialRequestTime) || Date.now();

const currentLocation = ref({ latitude: null, longitude: null });
const currentLocationName = ref('');
let watchId: string | null = null;

const isRecording = ref(false);
const isGettingLocation = ref(false);
const isLocationReceived = ref(false);
const selectedThreat = ref('');

const { permissions, checkPermissions, requestPermission, activatePermission } =
  usePermissions();

const shouldStream = computed(
  () => STREAM_SAVE === 'true' && userStore.user.streamAudioVideoOnSos
);

const presignedUrl = ref<string | null>(null); // Create a ref for presigned URL

const shouldRecord = computed(() => userStore.user.startAudioVideoRecordOnSos);

const locationSentToServer = ref(false);

const isAudioOpen = ref(false);

const peer = ref<Peer | null>(null);

const peerConnection = ref<RTCPeerConnection | null>(null);

const currentChunkDuration = ref(5);

const mediaRecorder = ref<MediaRecorder | null>(null);
const mediaStream = ref<MediaStream | null>(null);
const recordedChunks = ref<Blob[]>([]);

const isNavigatorMediaSupported = computed(() => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
});

const threats = [
  'followedBySomeone',
  'verbalHarassment',
  'physicalThreat',
  'attemptedKidnapping',
  'sexualAssault',
  'domesticViolence',
];

const audioElements = reactive({}); // Store audio elements by peer ID

const logs = ref<string[]>([]); // Reactive array to store logs

const logMessage = (message: string) => {
  logs.value.push(message); // Add new log message
  console.log(message); // Optional: log to console as well
};

const chunks = ref<Blob[]>([]);
const partNumber = ref(1);
const uploadedParts = ref<{ PartNumber: number; ETag: string }[]>([]);

const uploadId = ref<string | null>(null);

const recordingIntervals = ref([5000, 10000, 20000, 30000]); // in milliseconds
const currentIntervalIndex = ref(0);
const recordingStartTime = ref(0);
const nextUploadTimeout = ref<number | null>(null);
const accumulatedChunks = ref<Blob[]>([]);
const entireRecording = ref<Blob[]>([]);

onMounted(async () => {
  await checkPermissions();
  await activateSOSPermissions();
  startCountdown();
  await startLocationWatching();
  initializePeer();
  if (shouldRecord.value || shouldStream.value) {
    startRecordingAndStreaming();
  }
});

const showResolveConfirmation = (): Promise<boolean> => {
  return new Promise((resolve) => {
    isResolvingManually.value = true;
    console.log('showResolveConfirmation');
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
          { label: 'Cancel the SOS event', value: 'cancel' },
          { label: 'Resolve the SOS event', value: 'resolve' },
          { label: 'Keep the SOS event active', value: 'keep' },
        ],
      },
      cancel: true,
      persistent: true,
    })
      .onOk(async (action) => {
        switch (action) {
          case 'cancel':
            await updateSOSData({ status: 'cancelled' });
            closeAudioConnection(); // Close audio connection
            $q.notify({
              message: 'Your SOS event has been closed.',
              color: 'info',
            });
            sosSent.value = false; // Reset sosSent
            router.push('/dashboard'); // Redirect to dashboard
            resolve(true);
            break;
          case 'resolve':
            await updateSOSData({ status: 'resolved' });
            closeAudioConnection(); // Close audio connection
            $q.notify({
              message: 'Your SOS event has been resolved.',
              color: 'positive',
            });
            sosSent.value = false; // Reset sosSent
            router.push('/dashboard'); // Redirect to dashboard
            resolve(true);
            break;
          case 'keep':
            $q.notify({
              message: 'Your SOS event remains active.',
              color: 'warning',
            });
            resolve(false);
            break;
        }
      })
      .onCancel(() => {
        $q.notify({
          message: 'Action cancelled. Your SOS event remains active.',
          color: 'warning',
        });
        resolve(false);
      })
      .onDismiss(() => {
        isResolvingManually.value = false;
      });
  });
};

onBeforeRouteLeave(async (to, from, next) => {
  console.log('Leaving SOSModeOnPage');
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  await stopLocationWatching();
  await stopRecordingAndStreaming();
  closePeerConnection();

  // Only show the confirmation if SOS is still active
  if (sosSent.value) {
    const shouldProceed = await showResolveConfirmation();
    if (shouldProceed) {
      next(); // Allow navigation only if the user chose to cancel or resolve
    } else {
      next(false); // Prevent navigation
    }
  } else {
    next(); // Allow navigation if SOS not sent or already resolved/cancelled
  }
});

onUnmounted(async () => {
  console.log('Unmounting SOSModeOnPage');
  await stopRecordingAndStreaming();
  // No need to call complete-upload endpoint
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
    logMessage('SOS request cancelled.');
    router.push('/dashboard');
  } catch (error) {
    logMessage('Failed to cancel SOS request: ' + error);
  }
};

const activateSOSPermissions = async () => {
  const requiredPermissions = ['location', 'camera'];
  for (const permissionName of requiredPermissions) {
    const permission = permissions.value.find((p) => p.name === permissionName);
    if (permission && !permission.granted) {
      await requestPermission(permissionName);
      logMessage(`${permissionName} permission granted.`);
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
    }

    // Always update all available values
    if (currentLocation.value.longitude && currentLocation.value.latitude) {
      values.value.location = currentLocation.value;
      locationSentToServer.value = true; // Set this to true when data is successfully sent
    }
    if (data.status) values.value.status = data.status;
    if (data.threat) values.value.threat = data.threat;
    values.value.contactsOnly = contactsOnly.value;
    values.value.sosEventId = createdSosId.value;

    await validateAndSubmit();
    console.log('SOS data updated:', values.value);
    logMessage(
      'SOS data updated: ' +
        JSON.stringify(
          {
            location: currentLocation.value,
            status: data.status,
            threat: data.threat,
            contactsOnly: contactsOnly.value,
            sosEventId: createdSosId.value,
          },
          null,
          2
        )
    );

    if (!isLocationReceived.value) {
      updateCurrentLocation();
    }
  } catch (error) {
    logMessage('Failed to update SOS data: ' + error);
    console.error('Failed to update SOS data:', error);
  }
};

const handleThreatButtonClick = (threatType: string) => {
  updateSOSData({ threat: threatType, status: 'active', confirm: true });
};

const sendCancelSOSRequest = async () => {
  // TODO: Implement actual API call
  await updateSOSData({ status: 'cancelled' });
  logMessage('Sending cancel SOS request');
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
    logMessage('Started watching location');
    console.log('Started watching location');
  } catch (error) {
    logMessage('Error starting location watch: ' + error);
    console.error('Error starting location watch:', error);
    currentLocationName.value = t('locationWatchError');
  }
};

const handleLocationUpdate: WatchPositionCallback = (
  position: Position | null,
  err?: any
) => {
  if (err) {
    logMessage('Error in location update: ' + err);
    console.error('Error in location update:', err);
    return;
  }

  logMessage('Location updated: ' + JSON.stringify(position, null, 2));

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
      logMessage('Location updated and sent to server');
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
    contactsOnly: contactsOnly.value,
    sosEventId: createdSosId.value,
  });

const informed = ref(0);
const accepted = ref(0);

callbacks.onSuccess = (data) => {
  console.log('data...........', data);
  informed.value = data.informed;
  accepted.value = data.accepted;
  createdSosId.value = data.sosEventId;
  presignedUrl.value = data.presignedUrl; // Set the presigned URL
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

const getSupportedMimeType = (types: string[]): string | null => {
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      logMessage('Supported MIME type found: ' + type);
      return type;
    }
  }
  return null;
};

const startRecordingAndStreaming = async () => {
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      mediaStream.value = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true,
      });

      const mimeType = getSupportedMimeType([
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=h264,opus',
        'video/mp4;codecs=h264,aac',
        'video/mp4;codecs=h265,aac',
        'video/mp4;codecs=avc1,aac',
        'video/webm',
        'video/mp4',
        'video/x-matroska',
        'video/quicktime',
      ]);

      if (!mimeType) {
        throw new Error('No supported mime type found for video recording');
      }

      const options = {
        mimeType,
        videoBitsPerSecond: 250000,
        audioBitsPerSecond: 128000,
      };

      mediaRecorder.value = new MediaRecorder(mediaStream.value, options);

      mediaRecorder.value.ondataavailable = handleDataAvailable;
      mediaRecorder.value.start(5000); // Record in 5-second chunks
      isRecording.value = true;
      recordingStartTime.value = Date.now();

      if (shouldStream.value) {
        scheduleNextProcessing();
      }
    } else {
      throw new Error('Media Devices API not available');
    }
  } catch (error) {
    console.error('Failed to start recording:', error);
    logMessage('Failed to start recording: ' + error);
  }
};

const scheduleNextProcessing = () => {
  const currentInterval = recordingIntervals.value[currentIntervalIndex.value];

  if (nextUploadTimeout.value) {
    clearTimeout(nextUploadTimeout.value);
  }

  nextUploadTimeout.value = setTimeout(() => {
    processAccumulatedChunks();

    if (currentIntervalIndex.value < recordingIntervals.value.length - 1) {
      currentIntervalIndex.value++;
    }

    scheduleNextProcessing();
  }, currentInterval);
};

const handleDataAvailable = (event: BlobEvent) => {
  if (event.data.size > 0) {
    if (shouldStream.value) {
      accumulatedChunks.value.push(event.data);
    }
    if (shouldRecord.value) {
      entireRecording.value.push(event.data);
    }
  }
};

const processAccumulatedChunks = async () => {
  if (accumulatedChunks.value.length > 0 && shouldStream.value) {
    const blob = new Blob(accumulatedChunks.value, {
      type: mediaRecorder.value?.mimeType || 'video/webm;codecs=vp8,opus',
    });
    const fileName = `video_${Date.now()}.webm`;

    await uploadVideo(blob, fileName);

    accumulatedChunks.value = []; // Clear the chunks after processing
  }
};

const uploadVideo = async (blob: Blob, fileName: string) => {
  try {
    const { data } = await api.get('/auth/get-presigned-url', {
      params: {
        sosEventId: createdSosId.value,
        fileName,
        contentType:
          mediaRecorder.value?.mimeType || 'video/webm;codecs=vp8,opus',
      },
    });

    await fetch(data.presignedUrl, {
      method: 'PUT',
      body: blob,
      headers: {
        'Content-Type':
          mediaRecorder.value?.mimeType || 'video/webm;codecs=vp8,opus',
      },
    });

    console.log(`Uploaded ${fileName} successfully`);
    logMessage(`Uploaded ${fileName} successfully`);
  } catch (error) {
    console.error('Failed to upload video:', error);
    logMessage('Failed to upload video: ' + error);
  }
};

const saveLocalRecording = async () => {
  if (entireRecording.value.length > 0) {
    const blob = new Blob(entireRecording.value, {
      type: mediaRecorder.value?.mimeType || 'video/webm;codecs=vp8,opus',
    });
    const fileName = `sos_recording_${Date.now()}.webm`;

    if (Capacitor.isNativePlatform()) {
      const { Filesystem, Directory } = await import('@capacitor/filesystem');
      const base64Data = await blobToBase64(blob);

      try {
        await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Data,
          recursive: true,
        });
        logMessage('Full recording saved locally: ' + fileName);
      } catch (error) {
        logMessage('Failed to save full recording locally: ' + error);
        console.error('Failed to save full recording locally:', error);
      }
    } else {
      // For web platform, we'll save the blob directly
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      logMessage('Full recording downloaded in browser: ' + fileName);
    }

    entireRecording.value = []; // Clear the recording after saving
  }
};

const stopRecordingAndStreaming = async () => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop();
    isRecording.value = false;

    if (mediaStream.value) {
      mediaStream.value.getTracks().forEach((track) => track.stop());
    }

    if (nextUploadTimeout.value) {
      clearTimeout(nextUploadTimeout.value);
    }

    // Final processing of any remaining chunks for streaming
    if (shouldStream.value) {
      await processAccumulatedChunks();
    }

    // Save the entire recording locally
    if (shouldRecord.value) {
      await saveLocalRecording();
    }
  }
};

const saveRecording = async () => {
  if (!shouldRecord.value) return;
  if (mediaRecorder.value) {
    try {
      const mimeType = mediaRecorder.value.mimeType;
      const fileExtension = mimeType.split('/')[1].split(';')[0];
      const videoBlob = new Blob(recordedChunks.value, { type: mimeType });
      const fileName = `sos_recording_${Date.now()}.${fileExtension}`;

      // Attempt to save in external storage first
      if (Capacitor.isNativePlatform()) {
        const { Filesystem, Directory } = await import('@capacitor/filesystem');
        const base64Data = await blobToBase64(videoBlob);

        // Try saving to external storage
        try {
          await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.External, // Save in external storage
          });
          logMessage('Recording saved in External storage: ' + fileName);
          return; // Exit if successful
        } catch (error) {
          logMessage('Failed to save in External storage: ' + error);
          console.error('Failed to save in External storage:', error);
        }

        // If external storage fails, try saving in internal storage
        try {
          await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Data, // Save in internal storage
          });
          logMessage('Recording saved in Internal storage: ' + fileName);
          return; // Exit if successful
        } catch (error) {
          logMessage('Failed to save in Internal storage: ' + error);
          console.error('Failed to save in Internal storage:', error);
        }
      } else {
        // For web platform (PWA mode)
        const url = URL.createObjectURL(videoBlob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        logMessage('Recording downloaded in browser: ' + fileName);
      }
    } catch (error) {
      logMessage('Failed to save recording: ' + error);
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

// Initialize PeerJS
const initializePeer = () => {
  peer.value = new Peer();

  peer.value.on('open', (id) => {
    console.log('My peer ID is: ' + id);
    socket.emit('register_peer', {
      peerId: id,
      sosEventId: createdSosId.value,
    });
  });

  peer.value.on('call', (call) => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        call.answer(stream);
        call.on('stream', (remoteStream) => {
          const audio = new Audio();
          audio.srcObject = remoteStream;
          audio.play();
        });
      })
      .catch((err) => console.error('Failed to get local stream', err));
  });
};

// Modify toggleAudio function
const toggleAudio = async () => {
  const sosEventIdString = createdSosId.value.toString();
  if (isAudioOpen.value) {
    closePeerConnection();
    socket.emit('leave_sos_room', sosEventIdString); // Ensure to leave the room
  } else {
    socket.emit('join_sos_room', sosEventIdString);
    socket.emit('get_peers_in_room', sosEventIdString);
  }
  isAudioOpen.value = !isAudioOpen.value;
};

// Add this event listener
socket.on('peers_in_room', (peerIds: string[]) => {
  console.log('peerIds............', peerIds);
  if (isAudioOpen.value) {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        peerIds.forEach((peerId) => {
          if (peerId !== peer.value?.id) {
            const call = peer.value?.call(peerId, stream);
            call?.on('stream', (remoteStream) => {
              const audio = new Audio();
              audio.srcObject = remoteStream;
              audio.play();
              audioElements[peerId] = audio; // Store the audio element
            });
          }
        });
      })
      .catch((err) => console.error('Failed to get local stream', err));
  }
});

const handleRecordingData = (data: { value: { recordDataBase64: string } }) => {
  if (socket) {
    socket.emit('audio_data', {
      sosEventId: createdSosId.value,
      audioData: data.value.recordDataBase64,
    });
  }
};

const closePeerConnection = () => {
  if (peerConnection.value) {
    // stop all tracks
    if (mediaStream.value) {
      mediaStream.value.getTracks().forEach((track) => track.stop());
    }
    if (mediaRecorder.value) {
      mediaRecorder.value.stop();
    }
    peerConnection.value.close();
    peerConnection.value = null;
  }
};

// Listen for the peer_left event
socket.on('peer_left', (peerId: string) => {
  // Logic to stop audio for the peer that left
  if (peerId !== peer.value?.id) {
    // Stop the audio stream for the peer that left
    console.log(`Peer ${peerId} has left the room. Stopping audio.`);
    if (audioElements[peerId]) {
      audioElements[peerId].pause(); // Stop the audio
      delete audioElements[peerId]; // Remove the reference
    }
  }
});

const closeAudioConnection = () => {
  closePeerConnection();
  socket.emit('leave_sos_room', createdSosId.value.toString());
  isAudioOpen.value = false;
};
</script>

<style scoped>
.sos-card {
  max-width: 600px;
  margin: 0 auto;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
