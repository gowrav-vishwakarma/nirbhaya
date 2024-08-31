<template>
  <q-page class="row justify-center items-center container">
    <div class="image"></div>
    <div class="auth-container flex flex-center">
      <q-card class="q-pa-md admin-login-card">
        <q-card-section class="q-pb-none">
          <div class="text-h6 text-center">Login</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit="handleSubmit">
            <q-input
              filled
              v-model="values.mobileNumber"
              label="Mobile Number"
              :error="!!errors.mobileNumber"
              :error-message="errors.mobileNumber?.join('; ')"
              mask="##########"
              :disable="otpSent"
            />

            <q-input
              v-if="otpSent"
              filled
              v-model="values.otp"
              label="Enter OTP"
              :error="!!errors.otp"
              :error-message="errors.otp?.join('; ')"
              mask="####"
            />

            <div class="q-mt-md">
              <q-btn :label="otpSent ? 'Login' : 'Send OTP'" type="submit" color="primary" full-width />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from 'stores/user-store';
import { useRouter } from 'vue-router';
import { useForm } from 'src/qnatk/composibles/use-form';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';

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
    if (!formValues.mobileNumber || formValues.mobileNumber.length !== 10 || !/^\d+$/.test(formValues.mobileNumber)) {
      newErrors.mobileNumber = ['Please enter a valid 10-digit mobile number'];
    }
  } else {
    if (!formValues.otp || formValues.otp.length !== 4 || !/^\d+$/.test(formValues.otp)) {
      newErrors.otp = ['Please enter a valid 4-digit OTP'];
    }
  }

  if (Object.keys(newErrors).length > 0) {
    errors.value = newErrors;
    throw new Error('Validation failed');
  }

  return formValues;
};

callbacks.onSuccess = (user) => {
  if (!otpSent.value) {
    otpSent.value = true;
    updateUrl('/auth/login');
  } else {
    userStore.setUser(user);
    router.push('/dashboard');
  }
};

callbacks.onError = (error) => {
  Notify.create({
    type: 'negative',
    message: otpSent.value ? 'Login failed. Please check your OTP and try again.' : 'Failed to send OTP. Please try again.',
  });
};
</script>

<style scoped lang="scss">
.admin-login-card {
  max-width: 400px;
  width: 80%;
  margin: 0 auto;
}
.container {
  position: relative;
  height: 100vh;
}
.image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  color: white;
  font-weight: 600;
  font-family: sans-serif;
  background-color: var(--midnight-blue-2);
  background-image: linear-gradient(#0707400c, transparent 40%),
    linear-gradient(transparent, #070740 95%),
    linear-gradient(transparent, transparent),
    url(https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhWXv_XZLA4D4Ptn67GnmCRU9S9raRiIIF2rCebk15P8z4RZfcb4ibNBVOnrRASRuWCKA&usqp=CAU);
  background-repeat: no-repeat;
  background-size: cover;
  z-index: 1;
}
.auth-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
