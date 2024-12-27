<template>
  <div class="profile-details-step">
    <h5 class="text-h6 q-mb-md q-px-md q-mt-md q-ma-none">Profile Details</h5>
    <div class="scrollable-inputs q-px-md">
      <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
        <div class="custom-input">
          <label>{{ t('common.name') }}</label>
          <q-input
            v-model="values.name"
            :rules="[val => !!val || t('common.nameRequired')]"
            :error="!!errors.name"
            :error-message="errors.name?.join('; ')"
            filled
            class="custom-radius"
            bg-color="pink-1"
            dense
            hide-bottom-space
          />
        </div>

        <div class="custom-input">
          <label>{{ t('common.mobileNumber') }}</label>
          <q-input
            v-model="values.phoneNumber"
            filled
            class="custom-radius"
            bg-color="pink-1"
            dense
            disable
            readonly
            hide-bottom-space
          />
        </div>

        <div class="custom-input">
          <label>{{ t('common.dob') }}</label>
          <q-input
            v-model="values.dob"
            type="date"
            :error="!!errors.dob"
            :error-message="errors.dob?.join('; ')"
            filled
            class="custom-radius"
            bg-color="pink-1"
            dense
            hide-bottom-space
          />
        </div>

        <div class="custom-input">
          <label>{{ t('common.state') }}</label>
          <q-select
            v-model="values.state"
            :options="stateOptions"
            filled
            class="custom-radius"
            bg-color="pink-1"
            dense
            clearable
            use-input
            input-debounce="0"
            @filter="filterStates"
            :error="!!errors.state"
            :error-message="errors.state?.join('; ')"
            @update:model-value="handleStateChange"
            hide-bottom-space
          />
        </div>

        <div class="custom-input">
          <label>{{ t('common.city') }}</label>
          <SearchCity
            v-model="values.city"
            :error="errors.city?.join('; ')"
            :selected-state="values.state || ''"
            @update:modelValue="handleCitySelection"
            :disabled="!values.state"
            :key="values.state"
            hide-bottom-space
          />
        </div>

        <div class="custom-input">
          <label>{{ t('common.userType') }}</label>
          <q-select
            v-model="values.userType"
            :options="userTypes"
            filled
            class="custom-radius"
            bg-color="pink-1"
            dense
            :error="!!errors.userType"
            :error-message="errors.userType?.join('; ')"
            hide-bottom-space
          />
        </div>

        <div class="custom-input">
          <label>{{ t('common.profession') }}</label>
          <q-select
            v-model="values.profession"
            :options="professionOptions"
            filled
            class="custom-radius"
            bg-color="pink-1"
            dense
            :error="!!errors.profession"
            :error-message="errors.profession?.join('; ')"
            map-options
            emit-value
            option-value="value"
            option-label="label"
            hide-bottom-space
          />
        </div>

        <div class="custom-input">
          <label>{{ t('common.referredBy') }}</label>
          <q-input
            v-model="values.referredBy"
            filled
            class="custom-radius"
            bg-color="pink-1"
            dense
            :error="!!errors.referredBy"
            :error-message="errors.referredBy?.join('; ')"
            :loading="isLoading"
            hide-bottom-space
            clearable
            :disable="isReferralIdStored"
          >
          </q-input>
        </div>

        <div class="custom-input">
          <q-checkbox
            v-model="values.showBusinessInfo"
            :label="t('common.addBusinessInfo')"
          />
        </div>

        <template v-if="values.showBusinessInfo && values.businessInfo">
          <div class="custom-input">
            <label>{{ t('common.businessName') }}</label>
            <q-input
              v-model="values.businessInfo.businessName"
              :rules="[val => !!val || t('common.businessNameRequired')]"
              filled
              class="custom-radius"
              bg-color="pink-1"
              dense
              hide-bottom-space
            />
          </div>

          <div class="custom-input">
            <label>{{ t('common.whatsappNumber') }}</label>
            <q-input
              v-model="values.businessInfo.whatsappNumber"
              type="number"
              :rules="[
                val => !!val || t('common.whatsappRequired'),
                val => String(val).length === 10 || t('common.phoneLength')
              ]"
              filled
              class="custom-radius"
              bg-color="pink-1"
              dense
              hide-bottom-space
              prefix="+91"
              @keydown="(e: KeyboardEvent) => {
              if (values.businessInfo.whatsappNumber && values.businessInfo.whatsappNumber.toString().length >= 10 && e.key !== 'Backspace' && e.key !== 'Delete') {
                e.preventDefault();
              }
            }"
              maxlength="10"
            />
          </div>

          <div class="custom-input">
            <label>{{ t('common.businessLocation') }}</label>
            <q-input
              v-model="values.businessInfo.locationName"
              :rules="[val => !!val || t('common.locationRequired')]"
              filled
              class="custom-radius"
              bg-color="pink-1"
              dense
              hide-bottom-space
              placeholder="e.g., Shop No. 123, Building Name"
            />
          </div>

          <div class="custom-input">
            <div v-if="values.businessInfo.latitude && values.businessInfo.longitude"
                 class="location-display q-mt-sm">
              <div class="text-caption">
                Lat: {{ values.businessInfo.latitude.toFixed(6) }}
                Lng: {{ values.businessInfo.longitude.toFixed(6) }}
              </div>
            </div>
            <q-btn
              :loading="isLoadingLocation"
              @click="getCurrentLocation"
              icon="my_location"
              color="primary"
              class="bg-pink-1 full-width q-mt-md"
              flat
            >
              {{ t('common.getCurrentLocation') }}
            </q-btn>

          </div>
        </template>
      </q-form>
    </div>
    <div class="q-px-md q-px-md q-py-sm text-center" style="border:none !important;" >
      <q-btn
        :label="t('common.next')"
        type="submit"
        color="primary"
        class="next-button q-mt-xs"
        :disable="!isFormValid"
        :loading="isLoading"
        @click="handleSubmit"
        style="border-radius: 10px !important; height: 40px;"
      >
        <template v-slot:loading>
          <q-spinner-dots />
        </template>
        <i class="fa-solid fa-arrow-right-long q-ml-sm"></i>
      </q-btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, computed, ref, watch, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { api } from 'src/boot/axios'
import { useForm } from 'src/qnatk/composibles/use-form'
import SearchCity from 'src/components/SearchCity.vue'
import { useUserStore } from 'src/stores/user-store'
import type { QSelectFilterFn } from 'quasar'
import { Geolocation } from '@capacitor/geolocation'

const $q = useQuasar()
const { t } = useI18n()
const userStore = useUserStore()

interface City {
  officename: string
  statename: string
  pincode: string
  city?: string
}

interface UserLocation {
  name: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  isBusinessLocation?: boolean;
}

interface BusinessInfo {
  businessName: string;
  whatsappNumber: string | number;
  locationName: string;
  latitude: number;
  longitude: number;
}

interface FormValues {
  name: string
  phoneNumber: string
  dob: string
  state: string
  city: City | null
  userType: string
  profession: string
  referredBy: string
  pincode: string
  showBusinessInfo: boolean
  businessInfo: BusinessInfo | null
  locations?: UserLocation[]
  whatsappNumber?: string
  businessName?: string
}

// const props = defineProps<{
//   userData: FormValues
// }>()

const emit = defineEmits(['update-profile', 'next-step'])

const originalStateOptions = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Telangana',
  'Assam',
  'Bihar',
  'Uttar Pradesh',
  'Gujarat',
  'Goa',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Madhya Pradesh',
  'Karnataka',
  'Kerala',
  'Maharashtra',
  'Chattisgarh',
  'Delhi',
  'Daman and Diu',
  'Dadra and Nagar Hav.',
  'Manipur',
  'Megalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Tripura',
  'Jharkhand',
  'Uttarakhand',
  'BIJAPUR(KAR)',
  'Lakshadweep',
  'Chandigarh',
  'Pondicherry',
  'Andaman and Nico.In.',
  'West Bengal'
];

const stateOptions = ref([...originalStateOptions]);
const userTypes = ['Girl', 'Child', 'Elder Woman', 'Elder Man', 'Youth'];

const professionOptions = [
  { label: t('common.hospital'), value: 'hospital' },
  { label: t('common.doctorGeneral'), value: 'doctorGeneral' },
  { label: t('common.doctorEmergency'), value: 'doctorEmergency' },
  { label: t('common.mechanic2Wheeler'), value: 'mechanic2Wheeler' },
  { label: t('common.mechanic4Wheeler'), value: 'mechanic4Wheeler' },
  { label: t('common.mechanicBoth'), value: 'mechanicBoth' },
  { label: t('common.nurse'), value: 'nurse' },
  { label: t('common.tech'), value: 'tech' },
  { label: t('common.student'), value: 'student' },
  { label: t('common.freelancer'), value: 'freelancer' },
  { label: t('common.onlineSeller'), value: 'onlineSeller' },
  { label: t('common.handicraftMaker'), value: 'handicraftMaker' },
  { label: t('common.tailor'), value: 'tailor' },
  { label: t('common.beautician'), value: 'beautician' },
  { label: t('common.foodSeller'), value: 'foodSeller' },
  { label: t('common.artsMediaDesigner'), value: 'artsMediaDesigner' },
  { label: t('common.skilledTradesWorker'), value: 'skilledTradesWorker' },
  { label: t('common.shopOwner'), value: 'shopOwner' },
  { label: t('common.techITProfessional'), value: 'techITProfessional' },
  { label: t('common.healthcareMedicalWorker'), value: 'healthcareMedicalWorker' },
  { label: t('common.socialWorker'), value: 'socialWorker' },
  { label: t('common.privateSectorEmployee'), value: 'privateSectorEmployee' },
  { label: t('common.governmentEmployee'), value: 'governmentEmployee' },
  { label: t('common.businessOwner'), value: 'businessOwner' },
  { label: t('common.housewife'), value: 'housewife' },
  { label: t('common.retired'), value: 'retired' },
  { label: t('common.unemployed'), value: 'unemployed' },
  { label: t('common.other'), value: 'other' },
];

const isReferralIdStored = computed(() => {
  return !!userStore.user.referredBy;
});

const { values, errors, isLoading, validateAndSubmit, callbacks } = useForm<FormValues>(
  api,
  'user/user-profile-update',
  {
    name: '',
    phoneNumber: '',
    city: null,
    state: '',
    dob: '',
    userType: '',
    profession: '',
    pincode: '',
    emergencyContacts: [],
    startAudioVideoRecordOnSos: false,
    streamAudioVideoOnSos: false,
    broadcastAudioOnSos: false,
    referredBy: '',
    showBusinessInfo: false,
    businessInfo: null
  }
)

const isFormValid = computed(() => {
  const baseValidation = (
    !!values.value.name &&
    !!values.value.phoneNumber &&
    !!values.value.dob &&
    !!values.value.state &&
    !!values.value.city &&
    !!values.value.userType &&
    !!values.value.profession &&
    Object.keys(errors.value).length === 0
  );

  // Add business info validation if enabled
  if (values.value.showBusinessInfo && values.value.businessInfo) {
    return baseValidation &&
      !!values.value.businessInfo.businessName &&
      !!values.value.businessInfo.whatsappNumber &&
      String(values.value.businessInfo.whatsappNumber).length === 10 &&
      !!values.value.businessInfo.locationName &&
      !!values.value.businessInfo.latitude &&
      !!values.value.businessInfo.longitude;
  }

  return baseValidation;
});

callbacks.beforeSubmit = (data: FormValues) => {
  const processedData = {
    ...data,
    dob: data.dob || '',
    state: data.state || '',
    pincode: data.pincode || ''
  };

  if (data.city && typeof data.city === 'object') {
    const cityData = data.city as City;
    processedData.state = cityData.statename;
    processedData.pincode = cityData.pincode;
    processedData.city = cityData.officename;
  }

  if (data.showBusinessInfo && data.businessInfo && 'longitude' in data.businessInfo) {
    processedData.businessName = data.businessInfo.businessName;
    processedData.whatsappNumber = data.businessInfo.whatsappNumber.toString();

    const businessLocation: UserLocation = {
      name: data.businessInfo.locationName,
      location: {
        type: 'Point',
        coordinates: [data.businessInfo.longitude, data.businessInfo.latitude]
      },
      isBusinessLocation: true
    };

    processedData.locations = [
      ...(userStore.user?.locations || []).filter(
        (loc: UserLocation) => !loc.isBusinessLocation
      ),
      businessLocation
    ];
  }

  return processedData;
};

const handleSubmit = async () => {
  if (isFormValid.value) {
    try {
      // If business info is enabled, handle it first
      if (values.value.showBusinessInfo && values.value.businessInfo) {
        // First make the API call for business information
        await api.post('/user/add-business-information', values.value.businessInfo);

        // After successful API call, update the store with business info
        const businessLocation: UserLocation = {
          name: values.value.businessInfo.locationName,
          location: {
            type: 'Point',
            coordinates: [values.value.businessInfo.longitude, values.value.businessInfo.latitude]
          },
          isBusinessLocation: true
        };

        // Update store with business details and location
        const updatedLocations = [
          ...(userStore.user?.locations || []).filter(
            (loc: UserLocation) => !loc.isBusinessLocation
          ),
          businessLocation
        ];

        userStore.updateUser({
          ...userStore.user,
          businessName: values.value.businessInfo.businessName,
          whatsappNumber: values.value.businessInfo.whatsappNumber.toString(),
          locations: updatedLocations
        });
      }

      // Then submit the profile data
      await validateAndSubmit(false);

      // Show success notification
      $q.notify({
        color: 'black',
        message: t('common.profileUpdateSuccess'),
        icon: 'check',
        position: 'top-right',
      });

      // Emit events
      emit('update-profile', { ...values.value });
      emit('next-step');

    } catch (error) {
      console.error('Error in form submission:', error);
      $q.notify({
        color: 'negative',
        message: t('common.profileUpdateError'),
        icon: 'error',
        position: 'top-right',
      });
    }
  } else {
    $q.notify({
      color: 'negative',
      message: t('common.pleaseFixErrors'),
      icon: 'error',
      position: 'top-right',
    });
  }
};

callbacks.onSuccess = (data) => {
  // Prepare locations array
  const locations = userStore.user?.locations || [];

  // Update the user store with the new data
  const updatedUserData = {
    ...userStore.user, // Keep existing user data
    ...data.user, // Update with new data from API
    // Ensure specific fields are updated
    name: values.value.name,
    phoneNumber: values.value.phoneNumber,
    dob: values.value.dob,
    state: values.value.state,
    city: values.value.city?.officename || '',
    pincode: values.value.pincode,
    userType: values.value.userType,
    profession: values.value.profession,
    referredBy: values.value.referredBy,
    locations: locations // Preserve the locations array
  };

  // Update the store
  userStore.updateUser(updatedUserData);
};

callbacks.onError = (error: any) => {
  console.error('Error updating profile details:', error);
  $q.notify({
    color: 'negative',
    message: t('common.profileUpdateError'),
    icon: 'error',
    position: 'top-right',
  });
  return error
};

const filterStates: QSelectFilterFn = (val: string, update: (fn: () => void) => void) => {
  if (val === '') {
    update(() => {
      stateOptions.value = originalStateOptions;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    stateOptions.value = originalStateOptions.filter(
      (state) => state.toLowerCase().indexOf(needle) > -1
    );
  });
};

const handleStateChange = (newState: string | null) => {
  if (!newState) {
    values.value.state = '';
    values.value.city = null;
    values.value.pincode = '';
    errors.value.state = ['State Required'];
    errors.value.city = ['City Required'];
  } else {
    values.value.state = newState;
    values.value.city = null;
    values.value.pincode = '';
    delete errors.value.state;
    errors.value.city = ['City Required'];
    nextTick(() => {
      values.value.city = null;
    });
  }
};

const handleCitySelection = (selectedCity: City | null) => {
  if (!selectedCity) {
    values.value.city = null;
    values.value.pincode = '';
    errors.value.city = ['City Required'];
  } else {
    values.value.state = selectedCity.statename;
    values.value.pincode = selectedCity.pincode;
    values.value.city = selectedCity;
    delete errors.value.city;
  }
};

const lastCheckedReferralId = ref('');

// Replace the debounce utility with properly typed version
type DebouncedFunction<T extends (...args: any[]) => any> = (...args: Parameters<T>) => void;

const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): DebouncedFunction<T> => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

// Replace the validateReferralId implementation
const validateReferralId = debounce(async (value: string) => {
  if (!value || value.length < 3) {
    delete errors.value.referredBy;
    return;
  }

  try {
    isLoading.value = true;
    const response = await api.get(`/user/validate-referral/${value}`);
    if (!response.data.exists) {
      errors.value.referredBy = [t('common.referralIdNotFound')];
    } else {
      delete errors.value.referredBy;
      lastCheckedReferralId.value = value;
    }
  } catch (error) {
    console.error('Error validating referral ID:', error);
    errors.value.referredBy = [t('common.referralIdValidationFailed')];
  } finally {
    isLoading.value = false;
  }
}, 500);

// Update the watch function
watch(
  () => values.value.referredBy,
  (newValue: string) => {
    if (newValue) {
      validateReferralId(newValue);
    } else {
      delete errors.value.referredBy;
    }
  }
);

const loadUserData = async () => {
  const userData = userStore.user;

  if (userData) {
    // Set initial values
    values.value = {
      ...userData
    };

    // Create city object if city data exists
    if (userData.city && userData.state && userData.pincode) {
      values.value.city = {
        officename: userData.city,
        statename: userData.state,
        pincode: userData.pincode
      };
    }

    // Set referral ID for validation
    lastCheckedReferralId.value = values.value.referredBy;

    // Load business info if exists
    if (userData.businessName) {
      values.value.showBusinessInfo = true;
      values.value.businessInfo = {
        businessName: userData.businessName,
        whatsappNumber: userData.whatsappNumber || '',
        locationName: '',
        latitude: 0,
        longitude: 0
      };

      // Get business location from locations array
      const businessLocation = userData.locations?.find(
        (loc: UserLocation) => loc.isBusinessLocation
      );
      if (businessLocation) {
        values.value.businessInfo.locationName = businessLocation.name;
        values.value.businessInfo.longitude = businessLocation.location.coordinates[0];
        values.value.businessInfo.latitude = businessLocation.location.coordinates[1];
      }
    }
  }
};

const isLoadingLocation = ref(false);

const getCurrentLocation = async () => {
  try {
    isLoadingLocation.value = true;

    // Request location permissions first
    const permissionStatus = await Geolocation.checkPermissions();
    if (permissionStatus.location !== 'granted') {
      await Geolocation.requestPermissions();
    }

    // Get current position
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    });

    if (position && values.value.businessInfo) {
      values.value.businessInfo.latitude = position.coords.latitude;
      values.value.businessInfo.longitude = position.coords.longitude;

      // Optional: Show success notification
      $q.notify({
        type: 'black',
        color: 'black',
        message: t('common.locationCaptured'),
        position: 'top-right',
      });
    }
  } catch (error: any) {
    console.error('Location error:', error);
    let errorMessage = '';

    // Handle specific error cases
    if (error.code === 1) {
      errorMessage = t('common.locationPermissionDenied');
    } else if (error.code === 2) {
      errorMessage = t('common.locationUnavailable');
    } else if (error.code === 3) {
      errorMessage = t('common.locationTimeout');
    } else {
      errorMessage = t('common.locationError');
    }

    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top-right',
    });
  } finally {
    isLoadingLocation.value = false;
  }
};

// Add this watch to initialize businessInfo when checkbox is checked
watch(
  () => values.value.showBusinessInfo,
  (newValue) => {
    if (newValue && !values.value.businessInfo) {
      // Initialize businessInfo when checkbox is checked
      values.value.businessInfo = {
        businessName: '',
        whatsappNumber: '',
        locationName: '',
        latitude: 0,
        longitude: 0
      };
    }
  }
);

onMounted(() => {
  loadUserData();
});
</script>

<style scoped>
.profile-details-step {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: white;
}

.scrollable-inputs {

  flex: 1;
  overflow-y: auto;
  padding-bottom: 10px;
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

.button-container-main {
  background-color:white;
  height: 60px  ;
  width: 100%;
  position: absolute;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.next-button {
  width: 90%;
  border-radius: 10px;
}

/* Scrollbar styles */
.scrollable-inputs::-webkit-scrollbar {
  width: 3px;
}

.scrollable-inputs::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.scrollable-inputs::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.scrollable-inputs::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Add this new style for custom border radius */
:deep(.custom-radius) .q-field__control {
  border-radius: 10px !important;
  height: 45px;
}

:deep(.custom-radius) .q-field__marginal {
  height: 56px;
  border-radius: 20px;
}

/* Optional: If you want to style the inner input area as well */
:deep(.custom-radius) .q-field__native,
:deep(.custom-radius) .q-field__input {
  border-radius: 20px;
}

.location-display {
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  text-align: center;
}
</style>

