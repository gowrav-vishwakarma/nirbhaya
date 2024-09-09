<template>
  <div>
    <LanguageSelector class="q-mb-md" />

    <q-form @submit.prevent="handleSubmit">
      <!-- Basic profile information -->
      <div class="q-mb-md">
        <h6 class="q-ma-none q-ml-xs">{{ $t('name') }}</h6>
        <q-input
          v-model="values.name"
          :label="$t('name')"
          outlined
          class="q-mt-sm"
          style="border-radius: 20px"
          :error="!!errors.name"
          :error-message="errors.name?.join('; ')"
          :rules="[(val) => !!val || $t('nameRequired')]"
        />
      </div>

      <div class="q-mb-md">
        <h6 class="q-ma-none q-ml-xs">{{ $t('mobileNumber') }}</h6>
        <q-input
          v-model="values.phoneNumber"
          :label="$t('mobileNumber')"
          outlined
          readonly
          disable
          class="q-mt-sm"
          style="border-radius: 20px"
        />
      </div>

      <div class="q-mb-md">
        <h6 class="q-ma-none q-ml-xs">{{ $t('city') }}</h6>
        <q-input
          v-model="values.city"
          :label="$t('city')"
          outlined
          class="q-mt-sm"
          style="border-radius: 20px"
          :error="!!errors.city"
          :error-message="errors.city?.join('; ')"
        />
      </div>

      <div class="q-mb-md">
        <h6 class="q-ma-none q-ml-xs">{{ $t('userType') }}</h6>
        <q-select
          v-model="values.userType"
          :options="userTypeOptions"
          :label="$t('userType')"
          outlined
          class="q-mt-sm"
          style="border-radius: 20px"
          :error="!!errors.userType"
          :error-message="errors.userType?.join('; ')"
        />
      </div>

      <div class="q-mb-md">
        <h6 class="q-ma-none q-ml-xs">{{ $t('profession') }}</h6>
        <q-select
          v-model="values.profession"
          :options="professionOptions"
          :label="$t('profession')"
          outlined
          class="q-mt-sm"
          style="border-radius: 20px"
          :error="!!errors.profession"
          :error-message="errors.profession?.join('; ')"
          map-options
          emit-value
          option-value="value"
          option-label="label"
        />
      </div>

      <!-- Emergency contacts -->
      <div class="q-mb-md">
        <div class="flex items-center">
          <h6 class="q-ma-none q-ml-xs">{{ $t('emergencyContacts') }}</h6>
          <q-icon :name="$t('icons.help')" size="xs" class="q-ml-sm">
            <q-tooltip>{{ $t('emergencyContactsHelp') }}</q-tooltip>
          </q-icon>
        </div>
        <div
          v-for="(contact, index) in values.emergencyContacts"
          :key="index"
          class="q-mt-sm"
        >
          <q-input
            v-model="contact.contactName"
            :label="$t('name')"
            outlined
            class="q-mb-sm"
            style="border-radius: 20px"
            :rules="[(val) => !!val || $t('contactNameRequired')]"
          />
          <q-input
            v-model="contact.contactPhone"
            :label="$t('mobileNumber')"
            outlined
            class="q-mb-sm"
            style="border-radius: 20px"
            :rules="[(val) => !!val || $t('contactNumberRequired')]"
            @blur="validatePhoneNumber(contact.contactPhone, index)"
            :error="!!errors[`emergencyContact${index}`]"
            :error-message="errors[`emergencyContact${index}`]?.join('; ')"
          />
          <q-btn
            flat
            round
            color="negative"
            :icon="$t('icons.delete')"
            @click="removeEmergencyContact(index)"
          />
        </div>
        <q-btn
          v-if="values.emergencyContacts.length < 3"
          @click="addEmergencyContact"
          class="q-mt-sm bg-primary text-white"
          :icon="$t('icons.addCircle')"
        >
          <span class="q-ml-xs">{{ $t('addEmergencyContact') }}</span>
        </q-btn>
        <p v-if="!hasEmergencyContacts" class="text-negative q-mt-sm">
          {{ $t('atLeastOneEmergencyContactRequired') }}
        </p>
      </div>

      <!-- Permissions section -->
      <div class="q-mb-md">
        <h6 class="q-ma-none q-ml-xs">{{ $t('appPermissions') }}</h6>
        <div
          v-for="(permission, index) in permissions"
          :key="index"
          class="q-mt-sm"
        >
          <div class="flex items-center justify-between">
            <span>{{ $t(permission.name) }}</span>
            <q-btn
              :label="$t(permission.granted ? 'granted' : 'requestPermission')"
              :color="permission.granted ? 'positive' : 'primary'"
              @click="requestPermission(permission.name)"
              :disable="permission.granted"
            />
          </div>
        </div>
      </div>

      <!-- New SOS Settings -->
      <div v-if="isNavigatorMediaSupported">
        <div class="q-mb-md">
          <h6 class="q-ma-none q-ml-xs">{{ $t('sosSettings') }}</h6>
          <q-toggle
            v-model="values.startAudioVideoRecordOnSos"
            :label="$t('startAudioVideoRecordOnSos')"
            class="q-mt-sm"
          />
          <q-toggle
            v-if="STREAM_SAVE"
            v-model="values.streamAudioVideoOnSos"
            :label="$t('streamAudioVideoOnSos')"
            class="q-mt-sm"
          />
          <q-toggle
            v-model="values.broadcastAudioOnSos"
            :label="$t('broadcastAudioOnSos')"
            class="q-mt-sm"
          />
        </div>
      </div>

      <!-- Submit button -->
      <q-btn
        type="submit"
        :loading="isLoading"
        style="width: 100%"
        class="bg-green text-white"
        :disable="!isFormValid"
      >
        <b class="q-ml-xs q-my-md">{{ $t('saveChanges') }}</b>
      </q-btn>
    </q-form>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { useUserStore } from 'src/stores/user-store';
import { api } from 'src/boot/axios';
import { useForm } from 'src/qnatk/composibles/use-form';
import LanguageSelector from 'src/components/LanguageSelector.vue';
import { Capacitor, Plugins } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Camera } from '@capacitor/camera';

const { t } = useI18n();
const $q = useQuasar();
const userStore = useUserStore();

const STREAM_SAVE = computed(() => process.env.STREAM_SAVE);

const userTypeOptions = ['Girl', 'Child', 'Elder Woman', 'Elder Man', 'Youth'];

const isNavigatorMediaSupported = computed(() => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
});

const professionOptions = [
  { label: t('hospital'), value: 'hospital' },
  { label: t('doctorGeneral'), value: 'doctorGeneral' },
  { label: t('doctorEmergency'), value: 'doctorEmergency' },
  { label: t('mechanic2Wheeler'), value: 'mechanic2Wheeler' },
  { label: t('mechanic4Wheeler'), value: 'mechanic4Wheeler' },
  { label: t('mechanicBoth'), value: 'mechanicBoth' },
  { label: t('nurse'), value: 'nurse' },
  { label: t('other'), value: 'other' },
];

const { values, errors, isLoading, validateAndSubmit, callbacks } = useForm(
  api,
  'auth/user-profile-update',
  {
    name: '',
    phoneNumber: '',
    city: '',
    userType: '',
    profession: '', // Add profession here
    emergencyContacts: [],
    startAudioVideoRecordOnSos: false,
    streamAudioVideoOnSos: false,
    broadcastAudioOnSos: false,
  }
);

const permissions = ref([
  { name: 'location', granted: false },
  { name: 'camera', granted: false },
  { name: 'microphone', granted: false },
]);

const loadUserData = () => {
  const userData = userStore.user;
  Object.assign(values.value, userData);
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
    (hasEmergencyContacts.value ||
      values.value.emergencyContacts.length === 0) && // Allow submission if no emergency contacts
    values.value.emergencyContacts.every(
      (contact) => contact.contactName && contact.contactPhone
    ) &&
    Object.keys(errors.value).length === 0
  );
});

const validatePhoneNumber = async (phoneNumber: string, index: number) => {
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
      message: t('pleaseFixErrors'),
      icon: 'error',
    });
  }
};

callbacks.beforeSubmit = (formValues) => {
  if (!formValues.name) {
    errors.value.name = [t('nameRequired')];
  }

  if (formValues.emergencyContacts.length > 0) {
    if (Object.keys(errors.value).length > 0) {
      throw new Error('Validation failed');
    }
  }

  return formValues;
};

callbacks.onSuccess = (data) => {
  userStore.updateUser(data.user);
  loadUserData(); // Reload user data from the store
  $q.notify({
    color: 'positive',
    message: t('profileUpdateSuccess'),
    icon: 'check',
  });
};

callbacks.onError = (error) => {
  console.error('Error updating profile', error);
  $q.notify({
    color: 'negative',
    message: t('profileUpdateError'),
    icon: 'error',
  });
};
</script>
