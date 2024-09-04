<template>
  <q-page class="flex flex-center bg-grey-1">
    <q-card class="login-card q-pa-lg">
      <q-card-section class="text-center">
        <div class="text-h5 text-weight-bold text-primary q-mb-md">
          {{ $t('login') }}
        </div>
        <LanguageSelector class="q-mb-md" />
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <q-input
            filled
            v-model="values.mobileNumber"
            :label="$t('mobileNumber')"
            :error="!!errors.mobileNumber"
            :error-message="errors.mobileNumber?.join('; ')"
            mask="##########"
            :disable="otpSent"
          >
            <template v-slot:prepend>
              <q-icon :name="$t('icons.phone')" />
            </template>
          </q-input>

          <q-input
            v-if="otpSent"
            filled
            v-model="values.otp"
            :label="$t('enterOTP')"
            :error="!!errors.otp"
            :error-message="errors.otp?.join('; ')"
            mask="####"
          >
            <template v-slot:prepend>
              <q-icon :name="$t('icons.lock')" />
            </template>
          </q-input>

          <q-btn
            :label="otpSent ? $t('login') : $t('sendOTP')"
            type="submit"
            color="primary"
            class="full-width"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from 'stores/user-store';
import { useRouter } from 'vue-router';
import { useForm } from 'src/qnatk/composibles/use-form';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';
import LanguageSelector from 'src/components/LanguageSelector.vue';

const userStore = useUserStore();
const router = useRouter();
const otpSent = ref(false);

const { values, errors, validateAndSubmit, updateUrl, callbacks } = useForm(
  api,
  'auth/sendOtp',
  {
    mobileNumber: '',
    otp: '',
  }
);

const handleSubmit = () => {
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
      router.push('/dashboard');
    } else {
      router.push('/account');
    }
  }
};

callbacks.onError = (error) => {
  Notify.create({
    type: 'negative',
    message: otpSent.value
      ? 'Login failed. Please check your OTP and try again.'
      : 'Failed to send OTP. Please try again.',
  });
};
</script>

<style scoped lang="scss">
.login-card {
  max-width: 400px;
  width: 90%;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
