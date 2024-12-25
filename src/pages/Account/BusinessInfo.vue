<template>
  <div class="business-info-container">
    <h5 class="text-h6 q-mb-sm q-px-md q-mt-md q-ma-none">
      {{ t('common.businessInformation') }}
    </h5>
    <p class="q-px-md q-ma-none q-mb-sm">
      {{ t('common.businessLocationHelp') }}
    </p>

    <!-- <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1 text-weight-bold q-mb-sm">
          {{ t('common.businessSettings') }}
        </div>
      </q-card-section>
    </q-card> -->

    <div class="scrollable-inputs q-px-md q-pt-md">
      <q-btn
        v-if="!userStore.user?.businessName"
        icon="add"
        color="primary"
        class="full-width custom-radius q-mb-md"
        @click="showInputFields = !showInputFields"
        label="Add Business Information"
        style="border-radius: 10px !important"
      />

      <div v-if="showInputFields" class="input-fields">
        <div class="custom-input">
          <label>{{ t('common.businessName') }}</label>
          <q-input
            v-model="businessData.businessName"
            filled
            class="custom-radius"
            bg-color="pink-1"
            dense
            hide-bottom-space
            :rules="[(val) => !!val || 'Business name is required']"
          />
        </div>

        <div class="custom-input">
          <label>{{ t('common.whatsappNumber') }}</label>
          <q-input
            v-model="businessData.whatsappNumber"
            type="number"
            filled
            class="custom-radius"
            bg-color="pink-1"
            dense
            hide-bottom-space
            prefix="+91"
            :rules="[
              (val) =>
                !val ||
                String(val).length === 10 ||
                'Phone number must be 10 digits',
            ]"
            @input="validatePhoneNumber"
            maxlength="10"
          />
        </div>

        <div class="custom-input">
          <label>{{ t('common.businessLocation') }}</label>
          <q-input
            v-model="businessData.locationName"
            filled
            class="custom-radius"
            bg-color="pink-1"
            dense
            hide-bottom-space
            :rules="[(val) => !!val || 'Location name is required']"
            placeholder="e.g., Shop No. 123, Building Name"
          />
        </div>

        <div class="custom-input">
          <q-btn
            flat
            color="white"
            style="border-radius: 10px !important"
            icon="my_location"
            class="full-width custom-radius bg-primary"
            @click="showLocationSelector = true"
          >
            {{ t('common.setLocation') }}
          </q-btn>
          <div
            v-if="businessData.latitude && businessData.longitude"
            class="text-caption q-mt-sm"
          >
            {{ t('common.coordinates') }}:
            {{ businessData.latitude.toFixed(6) }},
            {{ businessData.longitude.toFixed(6) }}
          </div>
        </div>

        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <q-btn
              label="Cancel"
              color="black"
              style="border-radius: 10px !important"
              class="full-width custom-radius"
              @click="showInputFields = false"
            />
          </div>
          <div class="col-6">
            <q-btn
              label="Add"
              color="primary"
              style="border-radius: 10px !important"
              class="full-width custom-radius"
              @click="handleSubmit"
              :disabled="!isFormValid"
              :loading="loading"
            />
          </div>
        </div>
      </div>

      <div class="contact-cards q-mt-md" v-if="userStore.user?.businessName">
        <q-card flat bordered class="contact-card q-mb-sm">
          <q-card-section class="row items-center" style="width: 100%">
            <div class="col-auto q-pa-none q-ma-none">
              <q-avatar class="q-pa-none q-ma-none">
                <img
                  src="/my-business.png"
                  alt="business-icon"
                  style="width: 80%; height: 100%; object-fit: contain"
                />
              </q-avatar>
            </div>
            <div class="col q-pl-sm">
              <div class="text-subtitle2">
                {{ userStore.user?.businessName }}
              </div>
              <div class="text-caption">
                WhatsApp: +91 {{ userStore.user?.whatsappNumber }}
              </div>
              <div class="text-caption">
                Address: {{ businessLocation?.name }}
              </div>
              <div class="col-auto">
                <q-btn
                  class="remove-btn"
                  flat
                  label="Remove"
                  style="border-radius: 10px !important"
                  @click="confirmRemoveBusiness"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <LocationSelectorDialog
      v-model="showLocationSelector"
      @location-selected="handleLocationSelected"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { Geolocation } from '@capacitor/geolocation';
import { useI18n } from 'vue-i18n';
import { api } from 'src/boot/axios';
import { useUserStore } from 'src/stores/user-store';
import LocationSelectorDialog from 'src/components/Location/LocationSelectorDialog.vue';

const $q = useQuasar();
const formRef = ref();
const loading = ref(false);
const isLoadingLocation = ref(false);
const userStore = useUserStore();
const showInputFields = ref(false);
const showLocationSelector = ref(false);
const selectedLocation = ref<{ type: string; coordinates: number[] } | null>(
  null
);

const props = defineProps<{
  reloadComponents?: () => void;
}>();

const emit = defineEmits(['reloadComponents']);

interface BusinessData {
  businessName: string;
  whatsappNumber: number | null;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
}

interface LocationPoint {
  type: 'Point';
  coordinates: [number, number];
}

interface UserLocation {
  id: number;
  name: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  timestamp: string | null;
  isBusinessLocation: boolean;
}

const businessData = reactive<BusinessData>({
  businessName: '',
  whatsappNumber: null,
  locationName: '',
  latitude: null,
  longitude: null,
});

const validatePhoneNumber = (value: number | string) => {
  if (value) {
    const phoneStr = String(value).replace(/\D/g, '').trim(); // Remove non-digits and trim
    if (phoneStr.length > 10) {
      businessData.whatsappNumber = Number(phoneStr.slice(0, 10));
      $q.notify({
        type: 'warning',
        message: 'Phone number should be 10 digits',
        position: 'top',
        timeout: 2000,
      });
    } else {
      businessData.whatsappNumber = phoneStr ? Number(phoneStr) : null;
    }
  } else {
    businessData.whatsappNumber = null;
  }
};

const getCurrentLocation = async () => {
  try {
    isLoadingLocation.value = true;

    // Request location permissions
    const permissionStatus = await Geolocation.checkPermissions();
    if (permissionStatus.location !== 'granted') {
      await Geolocation.requestPermissions();
    }

    // Get current position
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    });

    if (position) {
      businessData.latitude = position.coords.latitude;
      businessData.longitude = position.coords.longitude;

      $q.notify({
        type: 'black',
        message: t('common.locationUpdated'),
        position: 'top-right',
      });
    }
  } catch (error) {
    console.error('Location error:', error);
    $q.notify({
      type: 'negative',
      message:
        error instanceof Error ? error.message : t('common.locationError'),
      position: 'top-right',
    });
  } finally {
    isLoadingLocation.value = false;
  }
};

const handleSubmit = async () => {
  if (!isFormValid.value) {
    $q.notify({
      type: 'warning',
      message: 'Please fill all required fields including location',
      position: 'top-right',
    });
    return;
  }

  const submitBusinessInfo = async () => {
    try {
      loading.value = true;

      const businessInfo = {
        businessName: businessData.businessName,
        whatsappNumber: businessData.whatsappNumber,
        locationName: businessData.locationName,
        latitude: businessData.latitude,
        longitude: businessData.longitude,
      };

      const response = await api.post(
        '/user/add-business-information',
        businessInfo
      );

      if (response.data) {
        const currentLocations = [
          ...(userStore.user?.locations || []),
        ] as UserLocation[];
        const businessLocationIndex = currentLocations.findIndex(
          (loc) => loc.isBusinessLocation
        );

        const updatedLocation: UserLocation = {
          id: response.data.locationId,
          name: businessData.locationName,
          location: {
            type: 'Point',
            coordinates: [businessData.longitude, businessData.latitude],
          },
          timestamp: null,
          isBusinessLocation: true,
        };

        if (businessLocationIndex !== -1) {
          currentLocations[businessLocationIndex] = updatedLocation;
        } else {
          currentLocations.push(updatedLocation);
        }

        userStore.updateUser({
          ...userStore.user,
          businessName: businessData.businessName,
          whatsappNumber: businessData.whatsappNumber?.toString(),
          locations: currentLocations,
        });

        showInputFields.value = false;

        $q.notify({
          color: 'black',
          message: 'Business information saved successfully',
          position: 'top-right',
        });
      }
    } catch (err: unknown) {
      console.error('Error saving business info:', err);
      const error = err as { response?: { data?: { message?: string } } };
      $q.notify({
        type: 'negative',
        message:
          error.response?.data?.message ||
          'Failed to save business information',
        position: 'top-right',
      });
    } finally {
      loading.value = false;
      props.reloadComponents?.();
      emit('reloadComponents');
    }
  };

  if (!businessData.whatsappNumber) {
    $q.dialog({
      title: 'WhatsApp Number Missing',
      message:
        "You are not submitting a WhatsApp number. You won't be able to be contacted. Do you still want to proceed?",
      cancel: true,
      persistent: true,
    })
      .onOk(() => {
        submitBusinessInfo(); // Only submit if user clicks OK
      })
      .onCancel(() => {
        // Do nothing if user cancels
        return;
      });
  } else {
    // If WhatsApp number is provided, submit directly
    await submitBusinessInfo();
  }
};

const fetchExistingBusinessInfo = () => {
  const user = userStore.user;
  if (user) {
    if (user.businessName) {
      businessData.businessName = user.businessName;
    }
    if (user.whatsappNumber) {
      businessData.whatsappNumber = parseInt(user.whatsappNumber, 10);
    }

    // Get the business location from user's locations
    const locations = user.locations as UserLocation[];
    if (locations && locations.length > 0) {
      // Filter for business locations and get the most recent one
      const businessLocations = locations.filter(
        (loc) => loc.isBusinessLocation
      );

      if (businessLocations.length > 0) {
        const mostRecentLocation = businessLocations.sort((a, b) => {
          if (!a.timestamp) return 1;
          if (!b.timestamp) return -1;
          return (
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        })[0];

        businessData.locationName = mostRecentLocation.name;
        businessData.longitude = mostRecentLocation.location.coordinates[0];
        businessData.latitude = mostRecentLocation.location.coordinates[1];
      }
    }
  }
};

onMounted(() => {
  fetchExistingBusinessInfo();
});

const { t } = useI18n();

const isFormValid = computed(() => {
  return (
    businessData.businessName &&
    businessData.locationName &&
    businessData.latitude &&
    businessData.longitude
  );
});

const confirmRemoveBusiness = () => {
  $q.dialog({
    title: 'Confirm Removal',
    message: 'Are you sure you want to remove your business information?',
    cancel: true,
    persistent: true,
  }).onOk(removeBusinessInfo);
};

const removeBusinessInfo = async () => {
  try {
    loading.value = true;
    await api.delete('/user/remove-business-information');

    // Clear business data
    businessData.businessName = '';
    businessData.whatsappNumber = null;
    businessData.locationName = '';
    businessData.latitude = null;
    businessData.longitude = null;

    // Update user store
    userStore.updateUser({
      ...userStore.user,
      businessName: null,
      whatsappNumber: null,
      locations: (userStore.user?.locations || []).filter(
        (loc) => !loc.isBusinessLocation
      ),
    });

    $q.notify({
      color: 'black',
      message: 'Business information removed successfully',
      position: 'top-right',
    });

    props.reloadComponents?.();
    emit('reloadComponents');
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } };
    $q.notify({
      type: 'negative',
      message:
        error.response?.data?.message ||
        'Failed to remove business information',
      position: 'top-right',
    });
  } finally {
    loading.value = false;
  }
};

const openGoogleMaps = (latitude: number, longitude: number) => {
  const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  window.open(url, '_blank');
};

const businessLocation = computed(() => {
  return userStore.user?.locations?.find((loc) => loc.isBusinessLocation);
});

const handleLocationSelected = (location: {
  type: string;
  coordinates: number[];
}) => {
  businessData.latitude = location.coordinates[1]; // latitude is second in GeoJSON
  businessData.longitude = location.coordinates[0]; // longitude is first in GeoJSON
  showLocationSelector.value = false; // Close the dialog
};
</script>

<style scoped>
.business-info-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  background-color: white;
}

.scrollable-inputs {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 80px;
}

.custom-input {
  margin-bottom: 20px;
}

.custom-input label {
  display: block;
  margin-bottom: 4px;
  font-size: 0.9rem;
  color: #666;
}

:deep(.custom-radius) .q-field__control {
  border-radius: 10px !important;
  height: 45px;
}

:deep(.custom-radius) .q-field__marginal {
  height: 56px;
  border-radius: 20px;
}

:deep(.custom-radius) .q-field__native,
:deep(.custom-radius) .q-field__input {
  border-radius: 20px;
}

.contact-card {
  border-radius: 10px;
  display: flex;
  align-items: center;
}

.remove-btn {
  position: absolute;
  top: 10px;
  right: 5px;
  background-color: black;
  align-self: flex-end;
  border-radius: 10px;
  margin-left: 10px;
  color: white;
  font-size: 12px;
  text-transform: capitalize;
}

/* Hide number input spinners */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
  max-width: 100%;
}
</style>
