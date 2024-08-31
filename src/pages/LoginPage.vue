<template>
  <q-page class="row justify-center items-center container">
    <div class="image"></div>
    <div class="auth-container flex flex-center">
      <q-card class="q-pa-md admin-login-card">
        <q-card-section class="q-pb-none">
          <div class="text-h6 text-center">Login</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit.prevent="validateAndSubmit">
            <q-input
              filled
              v-model="values.mobileNumber"
              label="Mobile Number"
              lazy-rules
              :error="!!errors.mobileNumber"
              :error-message="errors.mobileNumber ? errors.mobileNumber.join('; ') : ''"
              :rules="[
                (val) => (val && val.length > 0) || 'Please enter your mobile number',
              ]"
            />

            <div v-if="!otpSent" class="q-mt-md">
              <q-btn label="Send OTP" @click="sendOTP" color="primary" full-width />
            </div>

            <q-input
              v-if="otpSent"
              filled
              v-model="values.otp"
              label="Enter OTP"
              lazy-rules
              :error="!!errors.otp"
              :error-message="errors.otp ? errors.otp.join('; ') : ''"
              :rules="[
                (val) => (val && val.length > 0) || 'Please enter the OTP',
              ]"
            />

            <div v-if="otpSent" class="q-mt-md">
              <q-btn label="Login" type="submit" color="primary" full-width />
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
import { useComposibleForm } from 'src/composables/use-composible-form';

const userStore = useUserStore();
const router = useRouter();
const otpSent = ref(false);

const { values, validateAndSubmit, callbacks, errors } = useComposibleForm(
  'auth/login',
  {
    mobileNumber: '',
    otp: '',
  }
);

const sendOTP = async () => {
  // Implement OTP sending logic here
  // For example:
  // await sendOTPToMobile(values.mobileNumber);
  otpSent.value = true;
};

callbacks.onSuccess = (user) => {
  userStore.setUser(user);
  router.push('/');
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
  /* Adjust based on your needs */
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
