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
      v-if="userStore?.user"
    >
      <div class="row q-pa-md">
        <!-- Language switcher -->
        <div class="col-12 q-mb-md">
          <LanguageSelector />
        </div>

        <!-- Basic profile information -->
        <div class="col-12 q-mb-md">
          <h6 class="q-ma-none q-ml-xs">{{ $t('name') }}</h6>
          <q-input
            class="q-mt-sm"
            outlined
            v-model="values.name"
            :label="$t('name')"
            style="border-radius: 20px"
          />
        </div>
        <div class="col-12 q-mb-md">
          <h6 class="q-ma-none q-ml-xs">{{ $t('mobileNumber') }}</h6>
          <q-input
            readonly
            disable
            class="q-mt-sm"
            outlined
            v-model="values.phoneNumber"
            :label="$t('mobileNumber')"
            style="border-radius: 20px"
          />
        </div>
        <div class="col-12 q-mb-md">
          <h6 class="q-ma-none q-ml-xs">{{ $t('city') }}</h6>
          <q-input
            class="q-mt-sm"
            outlined
            v-model="values.city"
            :label="$t('city')"
            style="border-radius: 20px"
          />
        </div>

        <!-- New user type dropdown -->
        <div class="col-12 q-mb-md">
          <h6 class="q-ma-none q-ml-xs">{{ $t('userType') }}</h6>
          <q-select
            class="q-mt-sm"
            outlined
            v-model="values.userType"
            :options="userTypeOptions"
            :label="$t('userType')"
            style="border-radius: 20px"
          />
        </div>

        <!-- Emergency contacts -->
        <div class="col-12 q-mb-md">
          <div class="flex items-center">
            <h6 class="q-ma-none q-ml-xs">{{ $t('emergencyContacts') }}</h6>
            <q-icon name="help" size="xs" class="q-ml-sm">
              <q-tooltip>{{ $t('emergencyContactsHelp') }}</q-tooltip>
            </q-icon>
          </div>
          <div
            v-for="(contact, index) in values.emergencyContacts"
            :key="index"
            class="q-mt-sm"
          >
            <q-input
              outlined
              v-model="contact.contactName"
              :label="$t('name')"
              class="q-mb-sm"
              style="border-radius: 20px"
            />
            <q-input
              outlined
              v-model="contact.contactPhone"
              :label="$t('number')"
              class="q-mb-sm"
              style="border-radius: 20px"
            />

            <q-btn
              flat
              round
              color="negative"
              icon="delete"
              @click="removeEmergencyContact(index)"
            />
          </div>
          <q-btn
            v-if="values.emergencyContacts?.length < 3"
            @click="addEmergencyContact"
            class="q-mt-sm primaryBackGroundColor text-white"
            icon="add_circle"
          >
            <span class="q-ml-xs">{{ $t('addEmergencyContact') }}</span>
          </q-btn>
        </div>

        <!-- Notification locations -->
        <div class="col-12 q-mb-md">
          <div class="flex items-center">
            <h6 class="q-ma-none q-ml-xs">{{ $t('notificationLocations') }}</h6>
            <q-icon name="help" size="xs" class="q-ml-sm">
              <q-tooltip>{{ $t('notificationLocationsHelp') }}</q-tooltip>
            </q-icon>
          </div>
          <div
            v-for="(location, index) in values.locations"
            :key="index"
            class="q-mt-sm"
          >
            <div class="row q-col-gutter-sm">
              <div class="col">
                <q-input
                  outlined
                  v-model="location.name"
                  :label="$t('locationName')"
                  :hint="getLocationHint(location)"
                  class="q-mb-sm"
                  style="border-radius: 20px"
                />
              </div>
              <div class="col-auto">
                <q-btn
                  flat
                  round
                  color="primary"
                  icon="my_location"
                  @click="updateLocationCoordinates(index)"
                >
                  <q-tooltip>{{ $t('useCurrentLocation') }}</q-tooltip>
                </q-btn>
              </div>
              <div class="col-auto">
                <q-btn
                  flat
                  round
                  color="negative"
                  icon="delete"
                  @click="removeNotificationLocation(index)"
                />
              </div>
            </div>
            <p
              v-if="
                location.location.coordinates[1] &&
                location.location.coordinates[0]
              "
              class="text-caption q-mt-sm"
            >
              {{ $t('coordinates') }}: {{ location.location.coordinates[1] }},
              {{ location.location.coordinates[0] }}
            </p>
          </div>
          <q-btn
            v-if="values.locations.length < 2"
            @click="addNotificationLocation"
            class="q-mt-sm primaryBackGroundColor text-white"
            icon="add_circle"
          >
            <span class="q-ml-xs">{{ $t('addNotificationLocation') }}</span>
          </q-btn>
        </div>

        <!-- Live SOS event checking toggle -->
        <div class="col-12 q-mb-md">
          <div class="flex items-center justify-between">
            <div>
              <h6 class="q-ma-none q-ml-xs">
                {{ $t('liveSosEventChecking') }}
              </h6>
              <p class="text-caption q-mb-sm">
                {{ $t('liveSosEventCheckingDescription') }}
              </p>
            </div>
            <q-toggle
              v-model="values.liveSosEventChecking"
              color="primary"
              @update:model-value="handleLiveSosToggle"
            />
          </div>
        </div>

        <!-- Permissions section -->
        <div class="col-12 q-mb-md">
          <h6 class="q-ma-none q-ml-xs">{{ $t('appPermissions') }}</h6>
          <div
            v-for="(permission, index) in permissions"
            :key="index"
            class="q-mt-sm"
          >
            <div class="flex items-center justify-between">
              <span>{{ $t(permission.name) }}</span>
              <q-btn
                :label="
                  $t(permission.granted ? 'granted' : 'requestPermission')
                "
                :color="permission.granted ? 'positive' : 'primary'"
                @click="requestPermission(permission.name)"
                :disable="permission.granted"
              />
            </div>
          </div>
        </div>

        <!-- Save button -->
        <div class="col-12 q-mt-lg">
          <q-btn
            :loading="updateProfileIsLoading"
            @click="saveChanges"
            style="width: 100%"
            class="bg-green text-white"
          >
            <b class="q-ml-xs q-my-md">{{ $t('saveChanges') }}</b>
          </q-btn>
        </div>

        <!-- Logout button -->
        <div class="col-12 q-mt-md">
          <q-btn @click="logout" style="width: 100%" class="bg-red text-white">
            <b class="q-ml-xs q-my-md">{{ $t('logout') }}</b>
          </q-btn>
        </div>
      </div>
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLanguageStore } from 'src/stores/languageStore';
import { Capacitor, Plugins } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Camera } from '@capacitor/camera';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { useForm } from 'src/qnatk/composibles/use-form';
import { useUserStore } from 'src/stores/user-store';
import { useRouter } from 'vue-router';
import LanguageSelector from 'src/components/LanguageSelector.vue';

const { t } = useI18n();
const languageStore = useLanguageStore();
const $q = useQuasar();
const router = useRouter();
const userStore = useUserStore();

// Add this block to check user authentication
onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push('/login');
    $q.notify({
      color: 'warning',
      message: t('pleaseLoginFirst'),
      icon: 'warning',
    });
  }
});

const userTypeOptions = [
  'Girl',
  'Child',
  'Elder Woman',
  'Elder Man',
  'Youth',
  // Add more options as needed
];

// Modify the useForm hook to include userType
const {
  values,
  isLoading: updateProfileIsLoading,
  validateAndSubmit: updateProfileValidateAndSubmit,
  callbacks: updateProfileCallbacks,
} = useForm(api, 'auth/user-profile-update', {
  name: userStore?.user?.name,
  phoneNumber: userStore?.user?.phoneNumber,
  city: userStore?.user?.city,
  userType: userStore?.user?.userType, // Add this line
  emergencyContacts: userStore?.user?.emergencyContacts,
  locations: userStore?.user?.locations,
  liveSosEventChecking: userStore?.user?.liveSosEventChecking,
});

const permissions = ref([
  { name: 'location', granted: false },
  { name: 'camera', granted: false },
  { name: 'microphone', granted: false },
]);

const requestPermission = async (permissionName: string) => {
  try {
    let result;
    if (Capacitor.isNativePlatform()) {
      switch (permissionName) {
        case 'location':
          result = await Geolocation.requestPermissions();
          break;
        case 'camera':
          result = await Camera.requestPermissions();
          break;
        case 'microphone':
          result = await Plugins.Permissions.requestPermissions({
            permissions: ['microphone'],
          });
          break;
      }
    } else {
      // Web API fallback
      switch (permissionName) {
        case 'location':
          result = await navigator.permissions.query({ name: 'geolocation' });
          break;
        case 'camera':
        case 'microphone':
          result = await navigator.mediaDevices.getUserMedia({
            video: permissionName === 'camera',
            audio: permissionName === 'microphone',
          });
          break;
      }
    }

    const permissionIndex = permissions.value.findIndex(
      (p) => p.name === permissionName
    );
    if (permissionIndex !== -1) {
      permissions.value[permissionIndex].granted = true;
    }

    $q.notify({
      color: 'positive',
      message: t('permissionGranted', { permission: t(permissionName) }),
      icon: 'check',
    });
  } catch (error) {
    console.error(`Error requesting ${permissionName} permission:`, error);
    $q.notify({
      color: 'negative',
      message: t('permissionDenied', { permission: t(permissionName) }),
      icon: 'error',
    });
  }
};

const handleLiveSosToggle = async (value: boolean) => {
  if (value) {
    if (Capacitor.isNativePlatform()) {
      try {
        const result = await Geolocation.requestPermissions({
          permissions: ['location', 'coarseLocation'],
        });
        if (
          result.location === 'granted' &&
          result.coarseLocation === 'granted'
        ) {
          // Enable background tracking
          await Geolocation.watchPosition({ enableHighAccuracy: true }, () => {
            // Handle position updates
          });
        } else {
          values.liveSosEventChecking = false;
          $q.notify({
            color: 'negative',
            message: t('backgroundLocationPermissionRequired'),
            icon: 'error',
          });
        }
      } catch (error) {
        console.error(
          'Error requesting background location permission:',
          error
        );
        values.liveSosEventChecking = false;
      }
    } else {
      // For PWA, we can't do true background tracking, but we can inform the user
      $q.notify({
        color: 'info',
        message: t('pwaBackgroundLocationLimited'),
        icon: 'info',
      });
    }
  } else {
    if (Capacitor.isNativePlatform()) {
      await Geolocation.clearWatch({ id: '' }); // Clear all watches
    }
  }
};

onMounted(async () => {
  // Initialize form values with user store data
  values.name = userStore.user.name;
  values.phoneNumber = userStore.user.phoneNumber;
  values.city = userStore.user.city;
  values.userType = userStore.user.userType; // Add this line
  values.emergencyContacts = userStore.user.emergencyContacts;
  values.locations = userStore.user.locations;
  values.liveSosEventChecking = userStore.user.liveSosEventChecking;

  // Check initial permission states
  for (const permission of permissions.value) {
    try {
      let result;
      if (Capacitor.isNativePlatform()) {
        switch (permission.name) {
          case 'location':
            result = await Geolocation.checkPermissions();
            permission.granted = result.location === 'granted';
            break;
          case 'camera':
            result = await Camera.checkPermissions();
            permission.granted = result.camera === 'granted';
            break;
          case 'microphone':
            result = await Plugins.Permissions.query({ name: 'microphone' });
            permission.granted = result.state === 'granted';
            break;
        }
      } else {
        // Web API fallback
        if (permission.name === 'location') {
          result = await navigator.permissions.query({ name: 'geolocation' });
          permission.granted = result.state === 'granted';
        } else {
          try {
            await navigator.mediaDevices.getUserMedia({
              video: permission.name === 'camera',
              audio: permission.name === 'microphone',
            });
            permission.granted = true;
          } catch {
            permission.granted = false;
          }
        }
      }
    } catch (error) {
      console.error(`Error checking ${permission.name} permission:`, error);
    }
  }
});

// Update callbacks for the profile update
updateProfileCallbacks.onSuccess = (updatedUser) => {
  // Update the user store with the new data
  userStore.updateUser({
    name: updatedUser.name,
    city: updatedUser.city,
    userType: updatedUser.userType, // Add this line
    liveSosEventChecking: updatedUser.liveSosEventChecking,
    emergencyContacts: updatedUser.emergencyContacts,
    locations: updatedUser.locations,
  });

  $q.notify({
    color: 'positive',
    message: t('profileUpdateSuccess'),
    icon: 'check',
  });
};

updateProfileCallbacks.onError = (error) => {
  console.log(error.response.data);
  if (error.response.data.message === 'Validation Exception') {
    Object.keys(error.response.data.response.errors).forEach((key) => {
      $q.notify({
        color: 'negative',
        message: `${key}: ${t('notAMember', { contactPhone: key })}`,
        icon: 'error',
      });
      const index = values.emergencyContacts.findIndex(
        (contact) => contact.contactPhone === key
      );
      if (index !== -1) {
        values.emergencyContacts.splice(index, 1);
      }
    });
  } else {
    console.error('Error updating profile', error);
    $q.notify({
      color: 'negative',
      message: t('profileUpdateError'),
      icon: 'error',
    });
  }
};

const addEmergencyContact = () => {
  if (values.emergencyContacts.length < 3) {
    values.emergencyContacts.push({
      contactName: '',
      contactPhone: '',
      relationship: '',
      isAppUser: false,
      priority: 0,
    });
  }
};

const removeEmergencyContact = (index: number) => {
  values.emergencyContacts.splice(index, 1);
};

const addNotificationLocation = () => {
  if (values.locations.length < 2) {
    values.locations.push({
      name: '',
      location: {
        type: 'Point',
        coordinates: [null, null],
      },
    });
  }
};

const removeNotificationLocation = (index: number) => {
  values.locations.splice(index, 1);
};

const updateLocationCoordinates = async (index: number) => {
  try {
    let position;
    if (Capacitor.isNativePlatform()) {
      position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });
    } else {
      // Fallback for web browsers
      position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });
    }

    values.locations[index].location.coordinates = [
      position.coords.longitude,
      position.coords.latitude,
    ];
    $q.notify({
      color: 'positive',
      message: t('locationUpdated'),
      icon: 'check',
    });
  } catch (error) {
    console.error('Error getting location', error);
    $q.notify({
      color: 'negative',
      message: t('locationError'),
      icon: 'error',
    });
  }
};

const getLocationHint = (location: {
  location: { coordinates: [number, number] };
}) => {
  const [longitude, latitude] = location.location.coordinates;
  if (latitude && longitude) {
    return `${t('coordinates')}: ${latitude.toFixed(6)}, ${longitude.toFixed(
      6
    )}`;
  }
  return t('noLocationSet');
};

const saveChanges = async () => {
  await updateProfileValidateAndSubmit(false);
};

const logout = async () => {
  try {
    userStore.clearUser();
    router.push('/login');
    $q.notify({
      color: 'positive',
      message: t('logoutSuccess'),
      icon: 'check',
    });
  } catch (error) {
    console.error('Error logging out', error);
    $q.notify({
      color: 'negative',
      message: t('logoutError'),
      icon: 'error',
    });
  }
};

// You can add more custom logic or error handling as needed
</script>

<style scoped>
/* Add any scoped styles here */
</style>
