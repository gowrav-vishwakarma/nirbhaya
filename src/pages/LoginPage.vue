<template>
  <q-page class="flex flex-center bg-primary">
    <q-card class="login-card q-pa-lg">
      <q-card-section class="text-center">
        <div class="text-h3 text-weight-bold text-primary q-mb-md">
          Shoutout
        </div>
        <div class="text-subtitle1 text-weight-medium text-grey-7 q-mb-lg">
          Community SOS
        </div>
        <div class="text-h5 text-weight-bold text-primary q-mb-md">
          {{ $t('common.login') }}
        </div>
        <LanguageSelector class="q-mb-md" />
      </q-card-section>

      <q-card-section v-if="isIosNotSafari">
        <q-banner class="bg-negative text-white" rounded>
          {{ $t('common.iosNotSafariWarning') }}
        </q-banner>
      </q-card-section>

      <q-card-section v-else>
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <q-input
            filled
            v-model="values.mobileNumber"
            :label="$t('common.mobileNumber')"
            :error="!!errors.mobileNumber"
            :error-message="errors.mobileNumber?.join('; ')"
            mask="##########"
            :disable="otpSent"
          >
            <template v-slot:prepend>
              <q-icon :name="$t('common.icons.phone')" color="primary" />
            </template>
          </q-input>

          <q-input
            v-if="otpSent"
            filled
            v-model="values.otp"
            :label="$t('common.enterOTP')"
            :error="!!errors.otp"
            :error-message="errors.otp?.join('; ')"
            mask="####"
          >
            <template v-slot:prepend>
              <q-icon :name="$t('common.icons.lock')" color="primary" />
            </template>
          </q-input>

          <q-btn
            :label="otpSent ? $t('common.login') : $t('common.sendOTP')"
            type="submit"
            color="primary"
            class="full-width q-py-sm"
            :loading="isLoading"
          />
        </q-form>
      </q-card-section>

      <q-card-section v-if="otpSent" class="text-center">
        <q-btn flat color="primary" @click="resendOTP" :disable="isLoading">
          {{ $t('common.resendOTP') }}
        </q-btn>
      </q-card-section>
      <q-card-section class="text-center">
        <q-btn flat @click="goToAboutUs" class="q-mb-md">
          {{ $t('common.aboutUs') }}
        </q-btn>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useUserStore } from 'stores/user-store';
import { useRouter } from 'vue-router';
import { useForm } from 'src/qnatk/composibles/use-form';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';
import LanguageSelector from 'src/components/LanguageSelector.vue';
import { Device } from '@capacitor/device';

const $q = useQuasar();
const userStore = useUserStore();
const router = useRouter();
const otpSent = ref(false);

const isIosNotSafari = computed(() => {
  return (
    $q.platform.is.ios && !$q.platform.is.safari && !$q.platform.is.nativeMobile
  );
});

onMounted(() => {
  const referrer = router.currentRoute.value.params.referrer;
  console.log('referrer', referrer);
  if (referrer) {
    userStore.setReferrer(referrer);
  }
});

const { values, errors, validateAndSubmit, updateUrl, callbacks } = useForm(
  api,
  'auth/sendOtp',
  {
    mobileNumber: '',
    otp: '',
    deviceId: '',
  }
);

const handleSubmit = async () => {
  const { identifier } = await Device.getId(); // Retrieve deviceId
  values.value.deviceId = identifier;

  validateAndSubmit(false); // Pass false to prevent form reset
};

callbacks.beforeSubmit = (formValues) => {
  const newErrors = {};

  if (!otpSent.value) {
    if (
      !formValues.mobileNumber ||
      formValues.mobileNumber.length !== 10 ||
      !/^\d+$/.test(formValues.mobileNumber)
    ) {
      newErrors.mobileNumber = ['Please enter a valid 10-digit mobile number'];
    }
  } else {
    if (
      !formValues.otp ||
      formValues.otp.length !== 4 ||
      !/^\d+$/.test(formValues.otp)
    ) {
      newErrors.otp = ['Please enter a valid 4-digit OTP'];
    }
  }

  if (Object.keys(newErrors).length > 0) {
    errors.value = newErrors;
    throw new Error('Validation failed');
  }

  return formValues;
};

callbacks.onSuccess = async (userData) => {
  if (!otpSent.value) {
    otpSent.value = true;
    updateUrl('/auth/login');
  } else {
    userStore.setUser(userData);
    await userStore.sendTokenIfAvailable(); // Send FCM token after user is set
    if (userData.name) {
      router.push('/sos');
    } else {
      router.push('/account');
    }
  }
};

callbacks.onError = (error) => {
  console.log('Error in login page', error);
  Notify.create({
    type: 'negative',
    message: otpSent.value
      ? 'Login failed. Please check your OTP and try again.'
      : 'Failed to send OTP. Please try again.',
  });
};

const isLoading = ref(false);

const resendOTP = async () => {
  isLoading.value = true;
  try {
    await api.post('auth/sendOtp', { mobileNumber: values.value.mobileNumber });
    Notify.create({
      type: 'positive',
      message: 'OTP resent successfully',
    });
  } catch (error) {
    console.error('Error resending OTP:', error);
    Notify.create({
      type: 'negative',
      message: 'Failed to resend OTP. Please try again.',
    });
  } finally {
    isLoading.value = false;
  }
};

const goToAboutUs = () => {
  router.push('/about-us'); // Navigate to About Us page
};
</script>

<style scoped lang="scss">
.login-card {
  max-width: 400px;
  width: 90%;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.q-page {
  background: linear-gradient(135deg, $primary, darken($primary, 20%));
}
</style>
