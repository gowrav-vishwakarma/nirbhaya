<template>
  <q-page :class="['sos-page q-pa-md', { 'platform-ios': Platform.is.ios }]">
    <!-- Loader overlay -->
    <div v-if="leavingSos" class="loader-overlay">
      <q-spinner-dots color="white" size="60" class="q-mb-md" />
    </div>

    <!-- Main content card - always visible -->
    <q-card class="sos-card q-pa-lg">
      <q-card-section>
        <div class="text-h5 text-weight-bold text-center q-mb-md">
          {{ $t('common.sosMode') }}
        </div>

        <template v-if="!sosSent">
          <div class="text-center q-mb-lg">
            <q-circular-progress show-value class="text-red q-ma-md" :value="timeLeft" size="150px" :thickness="0.22"
              color="red" track-color="grey-3" :min="0" :max="countdownDuration" @click="resetCountdown">
              <div class="text-h5">{{ timeLeft }}</div>
            </q-circular-progress>
            <div class="text-subtitle1 q-mt-sm">
              {{ $t('common.sosCountdownMessage') }}
            </div>
            <q-btn @click="cancelSOS" class="cancel-sos-button full-width q-py-sm">
              <span class="text-bold">{{ $t('common.cancelSOS') }}</span>
            </q-btn>
          </div>
        </template>


        <template v-else>
          <!-- <template v-else> -->
          <!-- <SosButtonNearby @initiate-sos="initiateSOSMode" /> -->

          <div class="text-center q-mb-lg">
            <q-icon name="warning" color="red" size="4rem" style="margin-top: -10px;" />
            <div class="text-h6 text-red text-weight-bold q-mt-sm">
              {{ $t('common.sosSent') }}
            </div>
            <!-- Move status icons here -->
            <div class="status-icons q-mb-md" style="
              display: flex;
              justify-content: center;
              align-items: center;
              background-color: antiquewhite;
              border-radius: 20px;
              width: 200px;
              margin: auto;
              padding: 3px;
              margin-bottom: 20px;
              margin-top: 10px;
            ">
              <q-icon :name="$t('common.icons.videocam')" :color="getIconColor(recordingStatus)" size="sm">
                <q-tooltip>{{
                  getTooltip(recordingStatus, 'recording')
                }}</q-tooltip>
              </q-icon>
              <q-icon :name="$t('common.icons.mic')" :color="getIconColor(audioStatus)" size="sm" class="q-ml-sm">
                <q-tooltip>{{ getTooltip(audioStatus, 'audio') }}</q-tooltip>
              </q-icon>
              <q-icon :name="$t('common.icons.locationOn')" :color="getIconColor(locationStatus)" size="sm"
                class="q-ml-sm">
                <q-tooltip>{{
                  getTooltip(locationStatus, 'location')
                }}</q-tooltip>
              </q-icon>
            </div>
            <AudioControls :sosEventId="createdSosId" @audioStatusChange="handleAudioStatusChange" />

          </div>

          <!-- <div> -->
          <div class="q-ma-none" style="margin-top: -10px; text-align: center;" v-if="!sentSosUpdateNearByAlso">
            <div class="q-mb-sm">
              <q-btn @click="updateNearByAlso" round
                style="height: 60px;width: 60px;color: white;background-color:orange; border-radius: 50%; ">
                <span style="font-weight: bolder;padding-top: 15px; font-weight: 900; font-size: 18px;"> Sos <p
                    style="font-size: 9px;margin-top: -8px;font-weight: 800;" class="text-capitalize">
                    Nearby
                  </p>
                </span>
              </q-btn>
            </div>
            <span class="q-ma-none" style="font-weight: 700">Send SOS to nearby volunteers?</span>
          </div>
          <!-- </div> -->


          <q-list bordered class="rounded-borders notify-person-box q-mb-md q-mt-none flex justify-evenly"
            style="border: 1px solid pink;margin-top: 10px;">
            <!-- <q-item v-if="!contactsOnly"> -->
            <q-item>
              <q-item-section style="text-align: center;">
                <q-item-label>
                  <span class=""
                    style="font-size: 20px; font-weight: bolder; color: whitesmoke;  margin: 0;padding: 0;">{{
                      informed
                    }}</span> </q-item-label>
                <q-item-label class="q-px-sm notify-person-box-label"> <q-icon name="person" />
                  <span style="margin-top: -30px;">
                    {{ $t('common.notifiedPersons') }}
                  </span>
                </q-item-label>
              </q-item-section>
            </q-item>
            <!-- <q-item v-if="!contactsOnly"> -->
            <q-item>
              <q-item-section style="text-align: center;">
                <q-item-label>
                  <span class=""
                    style="font-size: 20px; font-weight: bolder; color: whitesmoke;  margin: 0;padding: 0;">{{
                      accepted
                    }}</span> </q-item-label>
                <q-item-label class="q-px-sm notify-person-box-label"> <q-icon name="person" />
                  <span style="margin-top: -30px;">
                    {{ $t('common.acceptedPersons') }}
                  </span>
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section style="text-align: center;">
                <q-item-label>
                  <span class=""
                    style="font-size: 18px; font-weight: bolder; color: whitesmoke;  margin: 0;padding: 0;">{{
                      $t('common.yes')
                    }}</span> </q-item-label>
                <q-item-label class="q-px-sm notify-person-box-label">
                  <span style="margin-top: -30px;"> {{ $t('common.emergencyContactsInformed')
                    }}
                  </span>
                  <q-icon name="done_all" color="blue" />
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </template>
        <!-- <q-list bordered class="rounded-borders notify-person-box q-mb-md" style="border: 1px solid red;">
          <q-item v-if="!contactsOnly">
            <q-item-section>
              <q-item-label>{{ $t('common.notifiedPersons') }}</q-item-label>
              <q-item-label caption>{{ informed }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-if="!contactsOnly">
            <q-item-section>
              <q-item-label>{{ $t('common.acceptedPersons') }}</q-item-label>
              <q-item-label caption>{{ accepted }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>{{
                $t('common.emergencyContactsInformed')
              }}</q-item-label>
              <q-item-label caption>{{ $t('common.yes') }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list> -->

        <div class=" text-weight-bold q-mb-sm" style="font-size: 16px;">
          {{ $t('common.helpUsMore') }}
        </div>
        <div class=" q-col-gutter-sm q-mb-md">
          <div class="flex " style="width: 100%; ">
            <q-btn v-for="threat in threats" :key="threat.threatName" class="button-background q-mr-xs"
              @click="handleThreatButtonClick(threat.threatName)" size="sm" style="border-radius: 30px">
              <q-btn round size="sm" :style="{
                marginLeft: '-10px',
                backgroundColor: `${threat.color}`,
                borderRadius: '50%',
              }"><q-icon :name="threat.icon" style="color: whitesmoke"></q-icon> </q-btn><span class="q-ml-xs"
                style="font-weight: bold">
                {{ $t(threat.visibleThreat) }}</span>
            </q-btn>
          </div>
        </div>

        <div class="text-subtitle1 text-weight-bold q-mb-sm">
          {{ $t('common.currentLocation') }}
        </div>
        <q-item class="bg-grey-2 rounded-borders q-mb-md">
          <q-item-section avatar>
            <q-icon :name="$t('common.icons.myLocation')" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{
              currentLocationName || $t('common.gettingLocation')
              }}</q-item-label>
            <q-item-label caption v-if="currentLocation.latitude != null && currentLocation.longitude != null">
              {{ t('common.coordinates') }}:
              {{ currentLocation.latitude.toFixed(6) }},
              {{ currentLocation.longitude.toFixed(6) }}
            </q-item-label>
          </q-item-section>
        </q-item>

        <!-- <div class="text-subtitle1 text-weight-bold q-mb-sm">
          {{ $t('common.nearbyPoliceStations') }}
        </div> -->
        <!-- <q-item class="bg-grey-2 rounded-borders q-mb-md">
          <q-item-section avatar>
            <q-icon :name="$t('common.icons.locationOn')" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>South Bopal Ahmedabad</q-item-label>
          </q-item-section>
        </q-item> -->

        <!-- <q-btn @click="updateSOSData({ status: 'active' })" color="" class=" notify-person-box full-width q-mb-md">
          <span class="text-bold">{{ $t('common.contactPoliceStation') }}</span>
        </q-btn> -->
        <!--v-if="sosSent" -->
        <q-btn @click="showResolveConfirmation" color="" class="green-bg-color full-width q-mt-md">
          <span class="text-bold">{{ $t('common.resolveSOSIssue') }}</span>
        </q-btn>
      </q-card-section>

      <q-card-section>
        <!-- <q-expansion-item label="Logs" icon="mdi-clipboard-text" class="text-subtitle1 text-weight-bold">
          <q-card>
            <q-card-section>
              <div v-for="(log, index) in logs" :key="index" class="text-body2 q-mb-xs">
                {{ log }}
                <q-separator v-if="index < logs.length - 1" class="q-my-sm" />
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item> -->
      </q-card-section>
    </q-card>
  </q-page>
</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch, computed, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Platform } from 'quasar';
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
import { onBeforeRouteLeave } from 'vue-router';
import { useUserStore } from 'src/stores/user-store';
import { api } from 'boot/axios';
import { throttle } from 'quasar';
import AudioControls from './SosAudioControls.vue';
import { Filesystem, Directory } from '@capacitor/filesystem';
import SosRating from './SosRating.vue';
import SosButtonNearby from 'pages/Dashboard/components/SosButtonNearby.vue'
import { Plugins } from '@capacitor/core';
const { SMS } = Plugins;

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const $q = useQuasar();
const userStore = useUserStore();
const leavingSos = ref(false);
const sentSosUpdateNearByAlso = ref(false)

const STREAM_SAVE = process.env.STREAM_SAVE;

const countdownDuration = 10; // seconds
const timeLeft = ref(countdownDuration);
let countdownInterval: ReturnType<typeof setInterval> | null = null;
const sosSent = ref(false);
const isResolvingManually = ref(false);
const notifiedPersons = ref(0);
const acceptedPersons = ref(0);

const createdSosId = ref(route.query.sosEventId ? parseInt(String(route.query.sosEventId)) : 0);
const contactsOnly = ref(route.query.contactsOnly === 'true');

const currentLocation = ref<Location>({ latitude: null, longitude: null });
const currentLocationName = ref('');
let watchId: string | null = null;

const isRecording = ref(false);
const isLocationReceived = ref(false);

const { permissions, checkPermissions, requestPermission, activatePermission } =
  usePermissions();

const shouldStream = computed(
  () => STREAM_SAVE === 'true' && userStore.user.streamAudioVideoOnSos
);

const presignedUrl = ref<string | null>(null); // Create a ref for presigned URL

const shouldRecord = computed(() => userStore.user.startAudioVideoRecordOnSos);

const locationSentToServer = ref(false);

const threats = [
  {
    color: '#000000',
    icon: 'emergency',
    threatName: 'domesticViolence',
    visibleThreat: 'Violence',
  },
  {
    color: '#FF0000',
    icon: 'diversity_3',
    threatName: 'attemptedKidnapping',
    visibleThreat: 'Kidnapping',
  },

  {
    color: '#808000',
    icon: 'touch_app',
    threatName: 'physicalThreat',
    visibleThreat: 'Physical Threat',
  },
  {
    color: '#641e16',
    icon: 'pan_tool',
    threatName: 'sexualAssault',
    visibleThreat: 'Sexual Assault',
  },
  {
    color: '#FF00FF',
    icon: 'gesture',
    threatName: 'followedBySomeone',
    visibleThreat: 'Someone Followed',
  },




  {
    color: '#008080',
    icon: 'record_voice_over',
    threatName: 'verbalHarassment',
    visibleThreat: 'Verbal Harassment',
  },

  // 'common.followedBySomeone',
  // 'common.verbalHarassment',
  // 'common.physicalThreat',
  // 'common.attemptedKidnapping',
  // 'common.sexualAssault',
  // 'common.domesticViolence',
];

const logs = ref<string[]>([]); // Reactive array to store logs

const logMessage = (message: string) => {
  logs.value.push(message); // Add new log message
};

const recordingIntervals = ref([5000, 10000, 20000, 30000]); // in milliseconds
const currentIntervalIndex = ref(0);
const recordingStartTime = ref(0);
const nextUploadTimeout = ref<ReturnType<typeof setTimeout> | null>(null);
const accumulatedChunks = ref<Blob[]>([]);
const entireRecording = ref<Blob[]>([]);

const lastUpdateTime = ref(0);
const significantChange = ref(false);

const mediaRecorder = ref<MediaRecorder | null>(null);
const mediaStream = ref<MediaStream | null>(null);
const recordedChunks = ref<Blob[]>([]);

// Add these new refs for status
const recordingStatus = ref('pending');
const audioStatus = ref('pending');
const locationStatus = ref('pending');

// Add this constant to determine video format
const VIDEO_FORMAT = computed(() => {
  const isIOS = Capacitor.getPlatform() === 'ios';
  return {
    extension: isIOS ? 'mp4' : 'webm',
    mimeType: isIOS ? 'video/mp4' : 'video/webm;codecs=vp8,opus',
  };
});

// Add this new function to get icon color based on status
const getIconColor = (status: string) => {
  switch (status) {
    case 'success':
      return 'green';
    case 'error':
      return 'red';
    case 'pending':
      return 'grey';
    default:
      return 'grey';
  }
};

// Add this new function to get tooltip text based on status
const getTooltip = (status: string, type: string) => {
  switch (status) {
    case 'success':
      return `${type} is working properly`;
    case 'error':
      return `Error with ${type}`;
    case 'pending':
      return `Initializing ${type}`;
    default:
      return `Unknown ${type} status`;
  }
};

onMounted(async () => {
  await checkPermissions();
  await activateSOSPermissions();
  startCountdown();
  await startLocationWatching();
  if (shouldRecord.value || shouldStream.value) {
    await startRecordingAndStreaming();
  }

  // Add this to update audio status based on SosAudioControls
  if (shouldRecord.value || shouldStream.value) {
    audioStatus.value = 'pending';
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
            $q.notify({
              message: 'Your SOS event has been closed.',
              color: 'info',
              position: 'top-right',
              // multiLine: true,
              timeout: 3000
            });
            sosSent.value = false; // Reset sosSent
            router.push('/sos'); // Redirect to dashboard
            resolve(true);
            break;
          case 'resolve':
            await updateSOSData({ status: 'resolved' });
            $q.notify({
              message: 'Your SOS event has been resolved.',
              color: 'positive',
              position: 'top-right',
              // multiLine: true,
              timeout: 3000
            });
            sosSent.value = false; // Reset sosSent
            resolve(true);
            break;
          case 'keep':
            $q.notify({
              message: 'Your SOS event remains active.',
              color: 'warning',
              position: 'top-right',
              // multiLine: true,
              timeout: 3000
            });
            resolve(false);
            break;
        }
      })
      .onCancel(() => {
        $q.notify({
          message: 'Action cancelled. Your SOS event remains active.',
            color: 'warning',
          position:'top-right'
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
  leavingSos.value = true
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  await stopLocationWatching();
  await stopRecordingAndStreaming();

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
  leavingSos.value = false;
});

onUnmounted(async () => {
  console.log('Unmounting SOSModeOnPage');
  await stopRecordingAndStreaming();
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
    // await sendCancelSOSRequest();
    logMessage('SOS request cancelled.');
    router.push('/sos');
  } catch (error) {
    logMessage('Failed to cancel SOS request: ' + error);
  }
};

const activateSOSPermissions = async () => {
  const requiredPermissions: PermissionType[] = ['common.location', 'common.camera'];
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
  location?: Location;
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
    if (currentLocation.value.latitude && currentLocation.value.longitude) {
      values.value.location = {
        latitude: currentLocation.value.latitude,
        longitude: currentLocation.value.longitude
      };
      locationSentToServer.value = true; // Set this to true when data is successfully sent
    }
    if (data.status) values.value.status = data.status;
    if (data.threat) values.value.threat = data.threat;
    values.value.contactsOnly = contactsOnly.value;
    values.value.sosEventId = createdSosId.value;

    if (data.status === 'resolved' || data.status === 'cancelled') {
      leavingSos.value = true
    }
    await validateAndSubmit();
    if (data.status === 'resolved') {
      $q.dialog({
        component: SosRating,
        componentProps: {
          eventId: createdSosId.value,
          source: 'sosmode'
        }
      });
    }
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
    leavingSos.value = false
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

const startLocationWatching = async () => {
  try {
    locationStatus.value = 'pending'; // Set initial status to pending
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
    currentLocationName.value = t('common.locationWatchError');
    locationStatus.value = 'error'; // Set status to error
  }
};

const handleLocationUpdate: WatchPositionCallback = (position: Position | null, err?: any) => {
  if (err) {
    logMessage('Error in location update: ' + err);
    console.error('Error in location update:', err);
    locationStatus.value = 'error';
    currentLocationName.value = t('common.locationError');
    return;
  }

  if (position) {
    const newLocation: Location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };

    currentLocation.value = newLocation;
    currentLocationName.value = `Lat: ${newLocation.latitude?.toFixed(4)}, Lon: ${newLocation.longitude?.toFixed(4)}`;
    isLocationReceived.value = true;
    locationStatus.value = 'success';

    throttledUpdateSOS();
  }
};

const calculateDistance = (loc1: LocationWithCoords, loc2: LocationWithCoords): number => {
  const R = 6371;
  const dLat = (loc2.latitude - loc1.latitude) * (Math.PI / 180);
  const dLon = (loc2.longitude - loc1.longitude) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(loc1.latitude * (Math.PI / 180)) *
    Math.cos(loc2.latitude * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c * 1000; // Convert to meters

  return Math.round(distance);
};

const throttledUpdateSOS = throttle(() => {
  const now = Date.now();
  if (
    sosSent.value &&
    (now - lastUpdateTime.value > 10000 || significantChange.value)
  ) {
    updateSOSData({}).catch(console.error);
    logMessage('Location updated and sent to server');
    lastUpdateTime.value = now;
    significantChange.value = false;
  }
}, 10000);

const stopLocationWatching = async () => {
  if (watchId !== null) {
    await Geolocation.clearWatch({ id: watchId });
    watchId = null;
    console.log('Stopped watching location');
  }
};

const { values, validateAndSubmit, errors, callbacks, isLoading, updateUrl } =
  useUserForm('sos/sos-update', {
    location: '',
    status: '',
    threat: '',
    contactsOnly: contactsOnly.value,
    sosEventId: createdSosId.value,
    updateNearbyAlso: false
  });

callbacks.beforeSubmit = (data) => {
  data.updateNearbyAlso = sentSosUpdateNearByAlso.value;
  if (sentSosUpdateNearByAlso.value) {
    data.status = !data.status ? 'active' : data.status
    data.contactsOnly = false
  }
  return data
}

const informed = ref(0);
const accepted = ref(0);

callbacks.onSuccess = (data) => {
  console.log('data...........', data);
  informed.value = data.informed;
  accepted.value = data.accepted;
  createdSosId.value = parseInt(data.sosEventId);
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
  // Add VIDEO_FORMAT.value.mimeType as the first option
  const allTypes = [VIDEO_FORMAT.value.mimeType, ...types];
  for (const type of allTypes) {
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
      recordingStatus.value = 'success'; // Set status to success

      if (shouldStream.value) {
        scheduleNextProcessing();
      }
    } else {
      throw new Error('Media Devices API not available');
    }
  } catch (error) {
    console.error('Failed to start recording:', error);
    logMessage('Failed to start recording: ' + error);
    recordingStatus.value = 'error'; // Set status to error
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
      type: VIDEO_FORMAT.value.mimeType,
    });
    const fileName = `video_${Date.now()}.${VIDEO_FORMAT.value.extension}`;

    await uploadVideo(blob, fileName);

    accumulatedChunks.value = []; // Clear the chunks after processing
  }
};

const uploadVideo = async (blob: Blob, fileName: string) => {
  try {
    const { data } = await api.get('/sos/get-presigned-url', {
      params: {
        sosEventId: createdSosId.value,
        fileName,
        contentType: VIDEO_FORMAT.value.mimeType,
      },
    });

    await fetch(data.presignedUrl, {
      method: 'PUT',
      body: blob,
      headers: {
        'Content-Type': VIDEO_FORMAT.value.mimeType,
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
      type: VIDEO_FORMAT.value.mimeType,
    });

    const fileName = `sos_recording_${Date.now()}.${VIDEO_FORMAT.value.extension
      }`;

    if (Capacitor.isNativePlatform()) {
      const { Filesystem, Directory } = await import('@capacitor/filesystem');
      const base64Data = await blobToBase64(blob);

      try {
        // Save to external storage (usually accessible to the user)
        const result = await Filesystem.writeFile({
          path: `DCIM/Nirbhaya/${fileName}`,
          data: base64Data,
          directory: Directory.ExternalStorage,
          recursive: true,
        });

        console.log('File saved:', result.uri);
        logMessage(`Full recording saved to DCIM/Nirbhaya/${fileName}`);

        // Optionally, you can show a notification to the user
        $q.notify({
          message: `Video saved to DCIM/Nirbhaya/${fileName}`,
          color: 'positive',
          icon: 'save',
          position: 'top',
          // multiLine: true,
          timeout: 3000
        });
      } catch (error) {
        console.error('Failed to save full recording:', error);
        logMessage('Failed to save full recording: ' + error);

        // Show error notification
        $q.notify({
          message: 'Failed to save video. Please check app permissions.',
          color: 'negative',
          icon: 'error',
          position: 'top-right',
          // multiLine: true,
          timeout: 3000
        });
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
      document.body.removeChild(a);
      logMessage('Full recording downloaded in browser: ' + fileName);
    }

    entireRecording.value = []; // Clear the recording after saving
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

const handleAudioStatusChange = (status: string) => {
  audioStatus.value = status;
};

const updateNearByAlso = () => {
  sentSosUpdateNearByAlso.value = true;
  values.value.updateNearbyAlso = sentSosUpdateNearByAlso.value
  validateAndSubmit();
  $q.notify({
    message: 'SOS Sent Nearby Volunteers.',
    color: 'positive',
    position: 'top-right',
    // multiLine: true,
    timeout: 2000
  });
}
</script>

<style lang="scss" scoped>
.sos-page {
  background: linear-gradient(135deg, $primary, darken($primary, 20%));
  min-height: 100vh;

  // Add iOS specific padding
  .platform-ios & {
    padding-top: 50px !important;
  }
}

.sos-card {
  max-width: 600px;
  margin: 0 auto;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.q-circular-progress {
  cursor: pointer;
}

.q-btn {
  border-radius: 8px;
}

.q-item {
  border-radius: 8px;
}

.q-expansion-item {
  border: 1px solid $grey-4;
  border-radius: 8px;
}

.status-icons {
  display: flex;
  justify-content: center;
  align-items: center;
}

.q-icon {
  animation: blink 2s infinite;
}

@keyframes blink {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }

  100% {
    opacity: 1;
  }
}

.button-background {
  background: linear-gradient(135deg,
      white,
      darken(rgb(255, 255, 255), 0%)) !important;
  border: 1px solid rgba(221, 218, 218, 0.418) !important;
  width: 180px;
  margin-bottom: 5px;
  margin-left: 5px;
  // display: flex;
  justify-content: space-between;
  text-align: start;
  align-items: self-start;
}

.notify-person-box {
  background: linear-gradient(135deg, $primary, darken($primary, 10%));
  border-radius: 10px;
  margin-top: 30px;

}

.green-bg-color {
  background: linear-gradient(40deg, green, darken(green, 15%));
  border-radius: 10px;

}

.cancel-sos-button {
  background: linear-gradient(40deg, red, darken(red, 15%));
  border-radius: 10px;
  color: whitesmoke;

}

.notify-person-box-label {
  background-color: rgba(233, 232, 231, 0.178);
  height: auto;
  border-radius: 20px;
  padding: 5px;
  color: whitesmoke;
  margin-bottom: -5px;

}

.q-list {
  display: flex; // Use flexbox to align items in a row
  flex-wrap: nowrap; // Prevent items from wrapping to the next line
  justify-content: space-between; // Space items evenly
  max-width: 100%; // Set maximum width to 100% of the parent
}

.q-item {
  flex: 1; // Allow items to grow and shrink
  min-width: 0; // Prevent items from overflowing their container
  font-size: 2vw; // Responsive font size based on viewport width
  height: auto;
  margin: 5px;
}

.q-item-label {
  font-size: 2vw; // Responsive font size for item labels
}

.q-icon {
  font-size: 3vw;
  // Responsive size for icons
}

.fullscreen-loader {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(3px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.q-dialog__backdrop {
  background: rgba(0, 0, 0, 0.3) !important;
  backdrop-filter: blur(3px);
}

.q-dialog .q-card {
  background: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}

.q-spinner-dots {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.loader-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loader-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 20px;
  min-width: 200px;
}
</style>
