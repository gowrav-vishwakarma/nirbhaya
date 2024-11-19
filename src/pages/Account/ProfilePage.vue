<template>
  <q-page class="profile-page">
    <div class="profile-content">
      <q-card flat class="profile-card">
        <q-card-section>
          <!-- <div class="text-h6 text-weight-bold q-mb-md">
            {{ $t('common.profileSettings') }}
          </div> -->
          <LanguageSelector class="q-mb-md" />

          <q-form @submit.prevent="handleSubmit">
            <!-- Basic profile information -->
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6 q-py-sm">
                <q-input class="" v-model="values.name" :label="$t('common.name')" outlined dense :error="!!errors.name"
                  :error-message="errors.name?.join('; ')" :rules="[(val) => !!val || $t('common.nameRequired')]" />
              </div>
              <div class="col-12 col-sm-6 q-py-sm">
                <q-input v-model="values.phoneNumber" :label="$t('common.mobileNumber')" outlined dense readonly
                  disable />
              </div>
              <div class="col-12 col-sm-6 q-py-sm">
                <q-input outlined dense v-model="values.dob" mask="date" :rules="['date']">
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
              <div class="col-12 col-sm-6 q-py-sm">
                <q-select v-model="values.state" :options="stateOptions" :label="$t('common.state')" outlined dense
                  clearable use-input input-debounce="0" @filter="filterStates" :error="!!errors.state"
                  :error-message="errors.state?.join('; ')" @update:model-value="handleStateChange" />
              </div>
              <div class="col-12 col-sm-6 q-py-sm">
                <SearchCity v-model="values.city" :error="errors.city?.join('; ')" :selected-state="values.state || ''"
                  @update:modelValue="handleCitySelection" :disabled="!values.state" :key="values.state" />
              </div>
              <div class="col-12 col-sm-6 q-py-sm">
                <q-select v-model="values.userType" :options="userTypeOptions" :label="$t('common.userType')" outlined
                  dense :error="!!errors.userType" :error-message="errors.userType?.join('; ')" />
              </div>
              <div class="col-12 q-py-sm">
                <q-select v-model="values.profession" :options="professionOptions" :label="$t('common.profession')"
                  outlined dense :error="!!errors.profession" :error-message="errors.profession?.join('; ')" map-options
                  emit-value option-value="value" option-label="label" />
              </div>
              <div class="col-12 q-py-sm">
                <q-input v-model="values.referredBy" :label="$t('common.referredBy')" outlined dense
                  @blur="validateReferralId" :error="!!errors.referredBy"
                  :error-message="errors.referredBy?.join('; ')" />
              </div>
            </div>

            <!-- Emergency contacts -->
            <div class="q-mt-lg">
              <div class="text-subtitle1 text-weight-bold q-mb-sm">
                {{ $t('common.emergencyContacts') }}
                <q-icon :name="$t('common.icons.help')" size="xs" class="q-ml-sm">
                  <q-tooltip>{{
                    $t('common.emergencyContactsHelp')
                  }}</q-tooltip>
                </q-icon>
              </div>

              <!-- Button group for Add Emergency Contact and Emergency Contact Requests -->
              <div class="row q-col-gutter-sm q-mb-md">
                <div class="col-12">
                  <q-btn-group class="full-width">
                    <q-btn v-if="values.emergencyContacts.length < 3" @click="addEmergencyContact" color="primary"
                      :icon="$t('common.icons.addCircle')" :label="$t('common.addEmergencyContact')" no-caps
                      class="full-width" />
                    <q-btn @click="openEmergencyContactRequests" color="secondary" :icon="$t('common.icons.contacts')"
                      :label="$t('common.emergencyContactRequests')" no-caps class="full-width" />
                  </q-btn-group>
                </div>
              </div>

              <q-list bordered separator>
                <q-item v-for="(contact, index) in values.emergencyContacts" :key="index">
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
                </q-item>
              </q-list>
              <p v-if="!hasEmergencyContacts" class="text-negative q-mt-sm">
                {{ $t('common.atLeastOneEmergencyContactRequired') }}
              </p>
            </div>

            <!-- Permissions section -->
            <div class="q-mt-lg">
              <div class="text-subtitle1 text-weight-bold q-mb-sm">
                {{ $t('common.appPermissions') }}
              </div>
              <q-list bordered>
                <q-item v-for="(permission, index) in permissions" :key="index">
                  <q-item-section>
                    <q-item-label>{{ $t(permission.name) }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn :color="permission.granted ? 'positive' : 'primary'"
                      @click="requestPermission(permission.name)" :disable="permission.granted" dense no-caps>
                      <span class="q-px-md">
                        {{
                          $t(
                            permission.granted
                              ? 'common.granted'
                              : 'common.requestPermission'
                          )
                        }}
                      </span>
                    </q-btn>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <!-- SOS Settings -->
            <div v-if="isNavigatorMediaSupported" class="q-mt-lg">
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
            </div>

            <!-- Submit button -->
            <div class="row q-col-gutter-md q-mt-lg">
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
import { onMounted, ref, computed, nextTick } from 'vue';
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

const STREAM_SAVE = computed(() => process.env.STREAM_SAVE);

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
  if (data.city && typeof data.city === 'object') {
    const cityData = data.city as City;
    data.state = cityData.statename;
    data.pincode = cityData.pincode;
    data.city = cityData.officename;
  }
  console.log('data after processing...', data);
  return data;
};

const permissions = ref([
  { name: 'common.location', granted: false },
  { name: 'common.camera', granted: false },
  // { name: 'common.microphone', granted: false },
]);

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
    name: userData.name,
    phoneNumber: userData.phoneNumber,
    dob: userData.dob,
    userType: userData.userType,
    profession: userData.profession,
    emergencyContacts: userData.emergencyContacts || [],
    startAudioVideoRecordOnSos: userData.startAudioVideoRecordOnSos || false,
    streamAudioVideoOnSos: userData.streamAudioVideoOnSos || false,
    broadcastAudioOnSos: userData.broadcastAudioOnSos || false,
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
  checkPermissions();
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
          console.log('Location permission result:', result);
          break;
        case 'camera':
        case 'microphone':
          result = await navigator.mediaDevices.getUserMedia({
            video: permissionName === 'camera',
            audio: permissionName === 'microphone',
          });
          console.log(
            'Media (camera and microphone) permission result:',
            result
          );
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
      message: t('common.permissionGranted', { permission: t(permissionName) }),
      icon: 'check',
    });
  } catch (error) {
    console.error(`Error requesting ${permissionName} permission:`, error);
    $q.notify({
      color: 'negative',
      message: t('common.permissionDenied', { permission: t(permissionName) }),
      icon: 'error',
    });
  }
};

const checkPermissions = async () => {
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
};

const hasEmergencyContacts = computed(
  () => values.value.emergencyContacts.length > 0
);

const isFormValid = computed(() => {
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
    Object.keys(errors.value).length === 0
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
  if (values.value.emergencyContacts.length > 0) {
    for (let i = 0; i < values.value.emergencyContacts.length; i++) {
      await validatePhoneNumber(
        values.value.emergencyContacts[i].contactPhone,
        i
      );
    }
  }

  if (isFormValid.value || values.value.emergencyContacts.length === 0) {
    validateAndSubmit(false);
  } else {
    $q.notify({
      color: 'negative',
      message: t('common.pleaseFixErrors'),
      icon: 'error',
    });
  }
};

callbacks.onSuccess = (data) => {
  userStore.updateUser(data.user);
  loadUserData(); // Reload user data from the store
  $q.notify({
    color: 'positive',
    message: t('common.profileUpdateSuccess'),
    icon: 'check',
  });
};

callbacks.onError = async (error: any): Promise<void> => {
  console.error('Error updating profile', error);
  $q.notify({
    color: 'negative',
    message: t('common.profileUpdateError'),
    icon: 'error',
  });
};

const openEmergencyContactRequests = () => {
  $q.dialog({
    component: EmergencyContactRequestsDialog,
  });
};

// Add a new method to validate the referral ID
const validateReferralId = async () => {
  console.log('values.referredBy', values.value.referredBy);
  if (
    !values.value.referredBy ||
    values.value.referredBy === lastCheckedReferralId.value
  ) {
    return;
  }

  try {
    const response = await api.get(
      `/user/validate-referral/${values.value.referredBy}`
    );
    if (!response.data.exists) {
      errors.value.referredBy = [t('referralIdNotFound')];
      values.value.referredBy = lastCheckedReferralId.value;
    } else {
      delete errors.value.referredBy;
      lastCheckedReferralId.value = values.value.referredBy; // Track the last checked ID to avoid redundant API calls
    }
  } catch (error) {
    console.error('Error validating referral ID:', error);
    errors.value.referredBy = [t('referralIdValidationFailed')];
    values.value.referredBy = lastCheckedReferralId.value;
  }
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

// Update handleStateChange function
const handleStateChange = (newState: string | null) => {
  if (!newState) {
    // If state is cleared, also clear city and pincode
    values.value.state = null;
    values.value.city = null;
    values.value.pincode = '';
    errors.value.state = ['State Required'];
    errors.value.city = ['City Required'];
  } else {
    // State is selected, clear city and pincode
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
</script>

<style lang="scss" scoped>
.profile-page {
  // background: linear-gradient(135deg, $primary, darken($primary, 20%));
  min-height: 100vh;
}

.profile-content {
  max-width: 600px;
  margin: 0 auto;
}
</style>
