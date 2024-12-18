<template>
  <q-page class="profile-page">
    <div class="profile-content">
      <q-card flat class="profile-card">
        <q-card-section>
          <LanguageSelector class="q-mb-lg" />

          <q-form @submit.prevent="handleSubmit">
            <div class="row q-col-gutter-sm">
              <!-- Name Input -->
              <div class="col-12 col-sm-6 q-py-none custom-input">
                <label>{{ $t('common.name') }}</label>
                <q-input
                  v-model="values.name"
                  :error="!!errors.name"
                  :error-message="errors.name?.join('; ')"
                  :rules="[(val) => !!val || $t('common.nameRequired')]"
                  filled
                  class="custom-radius"
                  bg-color="pink-1"
                  dense
                  hide-bottom-space
                />
              </div>

              <!-- Phone Number Input -->
              <div class="col-12 col-sm-6 q-py-none custom-input">
                <label>{{ $t('common.mobileNumber') }}</label>
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

              <!-- DOB Input -->
              <div class="col-12 col-sm-6 q-py-none custom-input">
                <label>{{ $t('common.dob') }}</label>
                <q-input
                  v-model="values.dob"
                  mask="date"
                  filled
                  class="custom-radius"
                  bg-color="pink-1"
                  dense
                  hide-bottom-space
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy
                        cover
                        transition-show="scale"
                        transition-hide="scale"
                      >
                        <q-date v-model="values.dob">
                          <div class="row items-center justify-end">
                            <q-btn
                              v-close-popup
                              label="ok"
                              color="primary"
                              flat
                            />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>

              <!-- State Input -->
              <div class="col-12 col-sm-6 q-py-none custom-input">
                <label>{{ $t('common.state') }}</label>
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

              <!-- City Input -->
              <div class="col-12 col-sm-6 q-py-none custom-input">
                <label>{{ $t('common.city') }}</label>
                <SearchCity
                  v-model="values.city"
                  :error="errors.city?.join('; ')"
                  :selected-state="values.state || ''"
                  @update:modelValue="handleCitySelection"
                  :disabled="!values.state"
                  :key="values.state"
                />
              </div>

              <!-- User Type Input -->
              <div class="col-12 col-sm-6 q-py-none custom-input">
                <label>{{ $t('common.userType') }}</label>
                <q-select
                  v-model="values.userType"
                  :options="userTypeOptions"
                  filled
                  class="custom-radius"
                  bg-color="pink-1"
                  dense
                  :error="!!errors.userType"
                  :error-message="errors.userType?.join('; ')"
                  hide-bottom-space
                />
              </div>

              <!-- Profession Input -->
              <div class="col-12 q-py-none custom-input">
                <label>{{ $t('common.profession') }}</label>
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

              <!-- Referred By Input -->
              <div class="col-12 q-py-none custom-input">
                <label>{{ $t('common.referredBy') }}</label>
                <q-input
                  v-model="values.referredBy"
                  filled
                  class="custom-radius"
                  bg-color="pink-1"
                  dense
                  :error="!!errors.referredBy"
                  :error-message="errors.referredBy?.join('; ')"
                  :disable="isReferralIdStored"
                  hide-bottom-space
                />
              </div>
            </div>

            <!-- Submit Button -->
            <div
              class="row q-col-gutter-md q-mt-none"
              style="margin-top: -15px"
            >
              <div class="col-12">
                <q-btn
                  type="submit"
                  :loading="isLoading"
                  color="primary"
                  class="full-width next-button q-mt-xs"
                  :disable="!isFormValid"
                  no-caps
                  style="border-radius: 10px !important; height: 40px"
                >
                  <b>{{ $t('common.saveChanges') }}</b>
                </q-btn>
              </div>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed, nextTick, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { useUserStore } from 'src/stores/user-store';
import { api } from 'src/boot/axios';
import { useForm } from 'src/qnatk/composibles/use-form';
import LanguageSelector from 'src/components/LanguageSelector.vue';
import SearchCity from 'src/components/SearchCity.vue';
import type { QSelectFilterFn } from 'quasar';

const { t } = useI18n();
const $q = useQuasar();
const userStore = useUserStore();

// const STREAM_SAVE = computed(() => process.env.STREAM_SAVE);
const props = defineProps<{
  reloadComponents?: () => void;
}>();

const emit = defineEmits(['reloadComponents']);
const userTypeOptions = ['Girl', 'Child', 'Elder Woman', 'Elder Man', 'Youth'];

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
  'West Bengal',
];

const stateOptions = ref([...originalStateOptions]);

// const isNavigatorMediaSupported = computed(() => {
//   return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
// });

const professionOptions = [
  // { label: t('common.hospital'), value: 'hospital' },
  // { label: t('common.doctorGeneral'), value: 'doctorGeneral' },
  // { label: t('common.doctorEmergency'), value: 'doctorEmergency' },
  // { label: t('common.mechanic2Wheeler'), value: 'mechanic2Wheeler' },
  // { label: t('common.mechanic4Wheeler'), value: 'mechanic4Wheeler' },
  // { label: t('common.mechanicBoth'), value: 'mechanicBoth' },
  // { label: t('common.nurse'), value: 'nurse' },
  // { label: t('common.tech'), value: 'tech' },
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
  {
    label: t('common.healthcareMedicalWorker'),
    value: 'healthcareMedicalWorker',
  },
  { label: t('common.socialWorker'), value: 'socialWorker' },
  { label: t('common.privateSectorEmployee'), value: 'privateSectorEmployee' },
  { label: t('common.governmentEmployee'), value: 'governmentEmployee' },
  { label: t('common.businessOwner'), value: 'businessOwner' },
  { label: t('common.housewife'), value: 'housewife' },
  { label: t('common.retired'), value: 'retired' },
  { label: t('common.unemployed'), value: 'unemployed' },
  { label: t('common.other'), value: 'other' },
];

interface EmergencyContact {
  contactName: string;
  contactPhone: string;
  relationship: string;
  isAppUser: boolean;
  priority: number;
  consentGiven: boolean;
}
interface City {
  officename: string;
  statename: string;
  pincode: string;
  city?: string;
}

interface FormValues {
  name: string;
  phoneNumber: string;
  city: City | null;
  state: string;
  dob: string;
  userType: string;
  profession: string;
  pincode: string;
  emergencyContacts: EmergencyContact[];
  startAudioVideoRecordOnSos: boolean;
  streamAudioVideoOnSos: boolean;
  broadcastAudioOnSos: boolean;
  referredBy: string;
}

const { values, errors, isLoading, validateAndSubmit, callbacks } =
  useForm<FormValues>(api, 'user/user-profile-update', {
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
  });
callbacks.beforeSubmit = (data) => {
  console.log('data before processing...', data);
  const processedData = {
    ...data,
    dob: data.dob || '',
    state: data.state || '',
    pincode: data.pincode || '',
    referredBy: errors.value.referredBy ? '' : data.referredBy,
  };

  if (data.city && typeof data.city === 'object') {
    const cityData = data.city as City;
    processedData.state = cityData.statename;
    processedData.pincode = cityData.pincode;
    processedData.city = cityData.officename;
  }

  console.log('data after processing...', processedData);
  return processedData;
};

const loadUserData = async () => {
  const userData = userStore.user;

  // Set state first
  values.value.state = userData.state || '';

  // Create a formatted city object if city data exists in store
  if (userData.city && userData.state && userData.pincode) {
    const cityObject: City = {
      officename: userData.city,
      statename: userData.state,
      pincode: userData.pincode,
    };
    values.value.city = cityObject;
  }

  // Copy remaining user data
  Object.assign(values.value, {
    ...userData,
    // Keep our formatted city object
    city: values.value.city,
    name: userData.name || '',
    phoneNumber: userData.phoneNumber || '',
    dob: userData.dob || '',
    userType: userData.userType || '',
    // Add null coalescing for profession
    profession: userData.profession || '',
    emergencyContacts: userData.emergencyContacts || [],
    startAudioVideoRecordOnSos: userData.startAudioVideoRecordOnSos || false,
    streamAudioVideoOnSos: userData.streamAudioVideoOnSos || false,
    broadcastAudioOnSos: userData.broadcastAudioOnSos || false,
    referredBy: userData.referredBy || '',
  });

  lastCheckedReferralId.value = values.value.referredBy;
  // Fetch emergency contacts status
  try {
    const response = await api.get('/user/emergency-contacts-status');
    const contactsStatus = response.data;
    values.value.emergencyContacts = values.value.emergencyContacts.map(
      (contact) => {
        const status = contactsStatus.find(
          (c) => c.contactPhone === contact.contactPhone
        );
        return {
          ...contact,
          consentGiven: status ? status.consentGiven : false,
        };
      }
    );
  } catch (error) {
    console.error('Error fetching emergency contacts status:', error);
  }
};

onMounted(() => {
  loadUserData();
  // checkPermissions();
});

const hasEmergencyContacts = computed(
  () => values.value.emergencyContacts.length > 0
);

const isFormValid = computed(() => {
  // If referral ID exists and has an error, form is invalid
  if (values.value.referredBy && errors.value.referredBy) {
    return false;
  }

  return (
    !!values.value.name &&
    !!values.value.dob &&
    !!values.value.state &&
    !!values.value.city &&
    (hasEmergencyContacts.value ||
      values.value.emergencyContacts.length === 0) &&
    values.value.emergencyContacts.every(
      (contact: EmergencyContact) => contact.contactName && contact.contactPhone
    ) &&
    !errors.value.name &&
    !errors.value.dob &&
    !errors.value.state &&
    !errors.value.city &&
    !Object.keys(errors.value).some((key) => key.startsWith('emergencyContact'))
  );
});

const handleSubmit = async () => {
  if (isFormValid.value || values.value.emergencyContacts.length === 0) {
    validateAndSubmit(false);
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
  // Make sure all fields are properly updated in the store
  const updatedUserData = {
    ...data.user,
    dob: values.value.dob,
    state: values.value.state,
    pincode: values.value.pincode,
    profession: values.value.profession,
  };

  userStore.updateUser(updatedUserData);
  loadUserData(); // Reload user data from the store

  $q.notify({
    color: 'black',
    message: t('common.profileUpdateSuccess'),
    icon: 'check',
    position: 'top-right',
  });

  props.reloadComponents?.();
  emit('reloadComponents');
};

callbacks.onError = async (error: any): Promise<void> => {
  console.error('Error updating profile', error);
  $q.notify({
    color: 'negative',
    message: t('common.profileUpdateError'),
    icon: 'error',
    position: 'top-right',
  });
};

// Add a reactive reference to track the last checked referral ID
const lastCheckedReferralId = ref('');

// Type-safe city selection handler
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

// Update handleStateChange function to properly handle state changes
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
    // Force the SearchCity component to reset
    nextTick(() => {
      values.value.city = null;
    });
  }
};

const filterStates: QSelectFilterFn = (
  val: string,
  update: (fn: () => void) => void
) => {
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

// Update the watch function
watch(
  () => values.value.referredBy,
  async (newValue) => {
    // Clear error if input is empty
    if (!newValue) {
      delete errors.value.referredBy;
      return;
    }

    // Skip validation if the value hasn't changed since last check
    if (newValue === lastCheckedReferralId.value) {
      return;
    }

    try {
      const response = await api.get(`/user/validate-referral/${newValue}`);
      if (!response.data.exists) {
        errors.value.referredBy = [t('referralIdNotFound')];
      } else {
        delete errors.value.referredBy;
        lastCheckedReferralId.value = newValue;
      }
    } catch (error) {
      console.error('Error validating referral ID:', error);
      errors.value.referredBy = [t('referralIdValidationFailed')];
    }
  },
  { immediate: true }
);

// Add a computed property to check if referral ID is stored
const isReferralIdStored = computed(() => {
  return !!userStore.user.referredBy;
});
</script>

<style lang="scss" scoped>
.profile-page {
  // background: linear-gradient(135deg, $primary, darken($primary, 20%));
  min-height: 100% !important;
}

.profile-content {
  max-width: 600px;
  margin: 0 auto;
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

.next-button {
  width: 100%;
  border-radius: 10px;
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
</style>
