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
import { useQuasar } from 'quasar';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { socket } from 'boot/socket';
import Peer from 'peerjs';
import { onBeforeRouteLeave } from 'vue-router';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const $q = useQuasar();

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

const shouldStream = computed(() => process.env.STREAM_SAVE === 'true');

const locationSentToServer = ref(false);

const isAudioOpen = ref(false);

const peer = ref<Peer | null>(null);

const peerConnection = ref<RTCPeerConnection | null>(null);

const mediaRecorder = ref<MediaRecorder | null>(null);
const mediaStream = ref<MediaStream | null>(null);
const recordedChunks = ref<Blob[]>([]);

const threats = [
  'followedBySomeone',
  'verbalHarassment',
  'physicalThreat',
  'attemptedKidnapping',
  'sexualAssault',
  'domesticViolence',
];

onMounted(async () => {
  await checkPermissions();
  await activateSOSPermissions();
  startCountdown();
  await startLocationWatching();
  initializePeer();
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
            $q.notify({
              message: 'Your SOS event has been closed.',
              color: 'info',
            });
            resolve(true);
            break;
          case 'resolve':
            await updateSOSData({ status: 'resolved' });
            $q.notify({
              message: 'Your SOS event has been resolved.',
              color: 'positive',
            });
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

  // Only show the confirmation if SOS has been sent and not manually resolving
  if (sosSent.value && !isResolvingManually.value) {
    const shouldProceed = await showResolveConfirmation();
    if (shouldProceed) {
      next();
    } else {
      next(false);
    }
  } else {
    next();
  }
});

onUnmounted(() => {
  console.log('Unmounting SOSModeOnPage');
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
      locationSentToServer.value = true; // Set this to true when data is successfully sent
    }
    if (data.status) values.value.status = data.status;
    if (data.threat) values.value.threat = data.threat;
    values.value.contactsOnly = contactsOnly.value;
    values.value.sosEventId = createdSosId.value;

    await validateAndSubmit();
    console.log('SOS data updated:', values.value);

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
        mediaStream.value = await navigator.mediaDevices.getUserMedia({
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

        mediaRecorder.value = new MediaRecorder(mediaStream.value, {
          mimeType,
        });

        mediaRecorder.value.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunks.value.push(event.data);
            if (shouldStream.value) {
              socket.emit('stream-chunk', event.data);
            }
          }
        };

        mediaRecorder.value.start(1000); // Capture data every second
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
  } else if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop();
    isRecording.value = false;

    if (shouldStream.value) {
      socket.emit('end-stream');
    }

    // Stop all tracks
    if (mediaStream.value) {
      mediaStream.value.getTracks().forEach((track) => track.stop());
    }

    // Save the recorded video locally
    await saveRecording();
  }
};

const saveRecording = async () => {
  if (!Capacitor.isNativePlatform() && mediaRecorder.value) {
    try {
      const mimeType = mediaRecorder.value.mimeType;
      const fileExtension = mimeType.split('/')[1].split(';')[0];
      const videoBlob = new Blob(recordedChunks.value, { type: mimeType });
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
    socket.emit('leave_sos_room', sosEventIdString);
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
    peerConnection.value.close();
    peerConnection.value = null;
  }
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
