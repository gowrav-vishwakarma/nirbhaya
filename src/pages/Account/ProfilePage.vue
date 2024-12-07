<template>
  <q-page class="profile-page">
    <div class="profile-content">
      <q-card flat class="profile-card">
        <q-card-section>
          <!-- <div class="text-h6 text-weight-bold q-mb-md">
            {{ $t('common.profileSettings') }}
          </div> -->
          <LanguageSelector class="q-mb-lg" />

          <q-form @submit.prevent="handleSubmit">
            <!-- Basic profile information -->
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6 q-py-none">
                <q-input class="" v-model="values.name" :label="$t('common.name')" outlined dense :error="!!errors.name"
                  :error-message="errors.name?.join('; ')" :rules="[(val) => !!val || $t('common.nameRequired')]" />
              </div>
              <div class="col-12 col-sm-6 q-py-none">
                <q-input class="q-pb-md" v-model="values.phoneNumber" :label="$t('common.mobileNumber')" outlined dense
                  readonly disable />
              </div>
              <div class="col-12 col-sm-6 q-py-none">
                <q-input class="q-pb-md" outlined dense v-model="values.dob" :label="$t('common.dob')" mask="date"
                  :rules="['date']">
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="values.dob">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Close" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-sm-6 q-py-none">
                <q-select class="q-pb-md" v-model="values.state" :options="stateOptions" :label="$t('common.state')"
                  outlined dense clearable use-input input-debounce="0" @filter="filterStates" :error="!!errors.state"
                  :error-message="errors.state?.join('; ')" @update:model-value="handleStateChange" />
              </div>
              <div class="col-12 col-sm-6 q-py-none">
                <SearchCity v-model="values.city" :error="errors.city?.join('; ')" :selected-state="values.state || ''"
                  @update:modelValue="handleCitySelection" :disabled="!values.state" :key="values.state" />
              </div>
              <div class="col-12 col-sm-6 q-py-none">
                <q-select v-model="values.userType" :options="userTypeOptions" :label="$t('common.userType')" outlined
                  dense :error="!!errors.userType" :error-message="errors.userType?.join('; ')" />
              </div>
              <div class="col-12 q-py-none">
                <q-select v-model="values.profession" :options="professionOptions" :label="$t('common.profession')"
                  outlined dense :error="!!errors.profession" :error-message="errors.profession?.join('; ')" map-options
                  emit-value option-value="value" option-label="label" />
              </div>
              <div class="col-12 q-py-none">
                <q-input v-model="values.referredBy" :label="$t('common.referredBy')" outlined dense
                  :disable="isReferralIdStored" :readonly="isReferralIdStored" :error="!!errors.referredBy"
                  :error-message="errors.referredBy?.join('; ')" />
              </div>
            </div>

            <!-- Emergency contacts -->
            <!-- <div class="q-mt-lg"> -->
            <!-- <div class="text-subtitle1 text-weight-bold q-mb-sm">
                {{ $t('common.emergencyContacts') }}
                <q-icon :name="$t('common.icons.help')" size="xs" class="q-ml-sm">
                  <q-tooltip>{{
                    $t('common.emergencyContactsHelp')
                    }}</q-tooltip>
                </q-icon>
              </div> -->

            <!-- Button group for Add Emergency Contact and Emergency Contact Requests -->
            <!-- <div class="row q-col-gutter-sm q-mb-md">
                <div class="col-12">
                  <q-btn-group class="full-width">
                    <q-btn v-if="values.emergencyContacts.length < 3" @click="addEmergencyContact" color="primary"
                      :icon="$t('common.icons.addCircle')" :label="$t('common.addEmergencyContact')" no-caps
                      class="full-width" />
                    <q-btn @click="openEmergencyContactRequests" color="secondary" :icon="$t('common.icons.contacts')"
                      :label="$t('common.emergencyContactRequests')" no-caps class="full-width" />
                  </q-btn-group>
                </div>
              </div> -->

            <!-- <q-list bordered separator> -->
            <!-- <q-item v-for="(contact, index) in values.emergencyContacts" :key="index">
                  <q-item-section>
                    <q-input v-model="contact.contactName" :label="$t('common.name')" dense outlined class="q-mb-sm"
                      :rules="[
                        (val) => !!val || $t('common.contactNameRequired'),
                      ]" />
                    <q-input v-model="contact.contactPhone" :label="$t('common.mobileNumber')" dense outlined
                      class="q-mb-sm" :rules="[
                        (val) => !!val || $t('common.contactNumberRequired'),
                      ]" @blur="validatePhoneNumber(contact.contactPhone, index)"
                      :error="!!errors[`emergencyContact${index}`]" :error-message="errors[`emergencyContact${index}`]?.join('; ')
                        " />
                    <q-chip :color="contact.consentGiven ? 'positive' : 'warning'" text-color="white"
                      :icon="contact.consentGiven ? 'check_circle' : 'warning'" size="sm">
                      {{
                        contact.consentGiven
                          ? $t('common.approved')
                          : $t('common.pendingApproval')
                      }}
                    </q-chip>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn flat round color="negative" :icon="$t('common.icons.delete')"
                      @click="removeEmergencyContact(index)" />
                  </q-item-section>
                </q-item> -->
            <!-- </q-list> -->
            <!-- <p v-if="!hasEmergencyContacts" class="text-negative q-mt-sm">
                {{ $t('common.atLeastOneEmergencyContactRequired') }}
              </p> -->
            <!-- </div> -->

            <!-- SOS Settings -->
            <!-- <div v-if="isNavigatorMediaSupported" class="q-mt-lg">
              <div class="text-subtitle1 text-weight-bold q-mb-sm">
                {{ $t('common.sosSettings') }}
              </div>
              <q-list bordered>
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{
                      $t('common.startAudioVideoRecordOnSos')
                    }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-toggle v-model="values.startAudioVideoRecordOnSos" />
                  </q-item-section>
                </q-item>
                <q-item v-if="STREAM_SAVE" tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{
                      $t('common.streamAudioVideoOnSos')
                    }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-toggle v-model="values.streamAudioVideoOnSos" />
                  </q-item-section>
                </q-item>
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{
                      $t('common.broadcastAudioOnSos')
                    }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-toggle v-model="values.broadcastAudioOnSos" color="grey" :disable="true" />
                  </q-item-section>
                </q-item>
              </q-list>
            </div> -->

            <!-- Submit button -->
            <div class="row q-col-gutter-md q-mt-none" style="margin-top: -15px;">
              <div class="col-12">
                <q-btn type="submit" :loading="isLoading" color="primary" class="full-width" :disable="!isFormValid"
                  no-caps>
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
import { Capacitor, Plugins } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Camera } from '@capacitor/camera';
import EmergencyContactRequestsDialog from 'components/EmergencyContactRequestsDialog.vue';
import SearchCity from 'src/components/SearchCity.vue';
import type { QSelectFilterFn } from 'quasar';
import type { City } from 'src/types/city';

const { t } = useI18n();
const $q = useQuasar();
const userStore = useUserStore();

// const STREAM_SAVE = computed(() => process.env.STREAM_SAVE);

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
  'West Bengal'
];

const stateOptions = ref([...originalStateOptions]);

const isNavigatorMediaSupported = computed(() => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
});

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
  }
);
callbacks.beforeSubmit = (data: FormValues) => {
  console.log('data before processing...', data);
  const processedData = {
    ...data,
    dob: data.dob || '',
    state: data.state || '',
    pincode: data.pincode || '',
    referredBy: errors.value.referredBy ? '' : data.referredBy
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
      pincode: userData.pincode
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
    referredBy: userData.referredBy || ''
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

const addEmergencyContact = () => {
  if (values.value.emergencyContacts.length < 3) {
    values.value.emergencyContacts.push({
      contactName: '',
      contactPhone: '',
      relationship: '',
      isAppUser: false,
      priority: 0,
      consentGiven: false,
    });
  }
};

const removeEmergencyContact = (index: number) => {
  values.value.emergencyContacts.splice(index, 1);
};



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
    !Object.keys(errors.value).some(key =>
      key.startsWith('emergencyContact')
    )
  );
});

const validatePhoneNumber = async (phoneNumber: string, index: number): Promise<void> => {
  try {
    const response = await api.post('auth/validate-phone', { phoneNumber });
    if (!response.data.isValid) {
      errors.value[`emergencyContact${index}`] = [t('phoneNumberNotInSystem')];
    } else {
      delete errors.value[`emergencyContact${index}`];
    }
  } catch (error) {
    console.error('Error validating phone number:', error);
    errors.value[`emergencyContact${index}`] = [t('phoneValidationError')];
  }
};

const handleSubmit = async () => {
  // Validate phone numbers only if emergency contacts are present
  // if (values.value.emergencyContacts.length > 0) {
  //   for (let i = 0; i < values.value.emergencyContacts.length; i++) {
  //     await validatePhoneNumber(
  //       values.value.emergencyContacts[i].contactPhone,
  //       i
  //     );
  //   }
  // }

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
    profession: values.value.profession
  };

  userStore.updateUser(updatedUserData);
  loadUserData(); // Reload user data from the store

  $q.notify({
    color: 'black',
    message: t('common.profileUpdateSuccess'),
    icon: 'check',
    position: 'top-right',
  });
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

const openEmergencyContactRequests = () => {
  $q.dialog({
    component: EmergencyContactRequestsDialog,
  });
};

// Add a reactive reference to track the last checked referral ID
const lastCheckedReferralId = ref('');

const dateOptions = (date: string) => {
  const today = new Date();
  const selectedDate = new Date(date);
  return selectedDate <= today;
};

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
      const response = await api.get(
        `/user/validate-referral/${newValue}`
      );
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
</style>
