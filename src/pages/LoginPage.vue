<template>
  <q-page class="flex flex-center">
    <!-- <q-card class="q-ma-none" flat> -->
    <!-- <q-img src="/public/sosLogo_512_512.png" style="height: 100px; width: 100px"></q-img> -->
    <!-- <q-card-section class="text-center">
        <div class="text-h3 text-weight-bold text-primary">Shoutout</div>
        <div class="text-subtitle1 text-weight-medium text-grey-7">
          Community SOS
        </div>
      </q-card-section> -->
    <!-- </q-card> -->
    <div class="login-card-main">
      <q-card class="login-card">
        <div class="flex justify-center">
          <q-img
            src="/sosLogo_512_512.png"
            style="height: 100px; width: 100px; margin-top: 30px"
          ></q-img>
        </div>
        <div
          class="text-subtitle1 text-weight-medium text-grey-7 q-mb-lg q-mt-md text-center"
        >
          Community SOS
        </div>

        <q-card-section class="text-center" style="margin: 0px; padding: 0px">
          <div
            class="text-h5 text-weight-bold text-primary"
            style="margin: 0px; padding: 0px; margin-top: -10px"
          >
            {{ t('common.login') }}
          </div>
          <!-- <div class="text-h3 text-weight-bold text-primary">Shoutout</div>
           <div class="text-subtitle1 text-weight-medium text-grey-7">
             Community SOS
           </div> -->
          <LanguageSelector class="q-mt-md q-px-md" />
        </q-card-section>

        <q-card-section v-if="isIosNotSafari">
          <q-banner class="bg-negative text-white" rounded>
            {{ t('common.iosNotSafariWarning') }}
          </q-banner>
        </q-card-section>
        <q-card-section v-else class="text-center">
          <q-form @submit="handleSubmit" class="">
            <q-input
              filled
              v-model="values.mobileNumber"
              :label="t('common.mobileNumber')"
              :error="!!errors.mobileNumber"
              :error-message="errors.mobileNumber?.join('; ')"
              mask="##########"
              :disable="otpSent"
              type="tel"
            >
              <template v-slot:prepend>
                <q-icon :name="t('common.icons.phone')" color="primary" />
              </template>
            </q-input>

            <q-input
              v-if="otpSent"
              filled
              v-model="values.otp"
              :label="t('common.enterOTP')"
              :error="!!errors.otp"
              :error-message="errors.otp?.join('; ')"
              mask="####"
              type="tel"
            >
              <template v-slot:prepend>
                <q-icon :name="t('common.icons.lock')" color="primary" />
              </template>
            </q-input>

            <div
              v-if="!otpSent"
              class="q-ma-none q-py-sm"
              style="text-align: start; margin-top: -20px"
            >
              <q-checkbox v-model="acceptedTerms" color="primary">
                <span style="font-size: 9px; font-weight: 700; color: dimgrey">
                  {{ t('common.acceptTerms') }}
                </span>
              </q-checkbox>
              <span
                style="font-size: 10px; margin: 3px; cursor: pointer"
                @click="goToTnc"
                class="text-capitalize text-primary"
              >
                Read
              </span>
            </div>

            <q-btn
              :label="otpSent ? t('common.login') : t('common.sendOTP')"
              type="submit"
              color="primary"
              class="full-width q-py-sm"
              :loading="isLoading"
              :disable="!isFormValid"
            />
          </q-form>
        </q-card-section>

        <div v-if="otpSent" class="text-center" style="margin-top: -10px">
          <q-btn
            flat
            color="primary"
            @click="resendOTP"
            :disable="isLoading || countdown > 0"
          >
            <span style="font-size: 13px">
              {{
                countdown > 0
                  ? `${t('common.resendOTP')} (${countdown}s)`
                  : t('common.resendOTP')
              }}
            </span>
          </q-btn>
        </div>
        <div class="text-center" style="margin-top: -10px">
          <q-btn flat @click="goToAboutUs" class="q-mb-md">
            <span style="font-size: 12px">
              {{ t('common.aboutUs') }}
            </span>
          </q-btn>
        </div>

        <!-- <div class="text-center">
           <q-btn flat @click="goToTnc" class="q-mb-md" style="margin-top: -35px;">
             <span style="font-size: 10px;" class="text-capitalize text-primary">
               {{ t('common.Tnc') }}
             </span>
           </q-btn>
         </div> -->
      </q-card>
      <div
        class="text-center text-subtitle1 versiontextcolor text-weight-thin"
        style="font-weight: 600"
      >
        <span style="font-size: 13px">App version : </span>
        <span style="font-size: 13px">{{ appVersion }}</span>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';
import { useUserStore } from 'stores/user-store';
import { useRouter } from 'vue-router';
import { useForm } from 'src/qnatk/composibles/use-form';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';
import LanguageSelector from 'src/components/LanguageSelector.vue';
import { Device } from '@capacitor/device';
import { useI18n } from 'vue-i18n';
import { version, iosVersion, androidVersion } from 'src/../package.json';

const { t } = useI18n();
const $q = useQuasar();
const userStore = useUserStore();
const router = useRouter();
const otpSent = ref(false);
const acceptedTerms = ref(false);
const countdown = ref(0);
const countdownTimer = ref<number | null>(null);

// Define appVersion
const appVersion = computed(() => {
  return $q.platform.is.ios
    ? iosVersion
    : $q.platform.is.android
    ? androidVersion
    : version;
});

const isIosNotSafari = computed(() => {
  return (
    $q.platform.is.ios && !$q.platform.is.safari && !$q.platform.is.nativeMobile
  );
});

onMounted(() => {
  const referrer = router.currentRoute.value.params.referrer;
  console.log('referrer', referrer);
  if (referrer) {
    userStore.setReferrer(referrer.toString());
  }
});

interface FormValues {
  mobileNumber: string;
  otp: string;
  deviceId: string;
}

interface FormErrors {
  mobileNumber?: string[];
  otp?: string[];
}

const { values, errors, validateAndSubmit, updateUrl, callbacks } =
  useForm<FormValues>(api, 'auth/sendOtp', {
    mobileNumber: '',
    otp: '',
    deviceId: '',
    platform: $q.platform.is,
  });

const isLoading = ref(false);

const handleSubmit = async () => {
  isLoading.value = true;
  try {
    const { identifier } = await Device.getId();
    values.value.deviceId = identifier;
    await validateAndSubmit(false);
  } catch (error) {
    console.error('Submit error:', error);
  }
};

callbacks.beforeSubmit = async (formValues: Record<string, unknown>) => {
  const typedFormValues = formValues as unknown as FormValues;
  const newErrors: Record<string, string[]> = {};

  if (!otpSent.value) {
    if (
      !typedFormValues.mobileNumber ||
      typedFormValues.mobileNumber.length !== 10 ||
      !/^\d+$/.test(typedFormValues.mobileNumber)
    ) {
      newErrors.mobileNumber = ['Please enter a valid 10-digit mobile number'];
    }
  } else {
    if (
      !typedFormValues.otp ||
      typedFormValues.otp.length !== 4 ||
      !/^\d+$/.test(typedFormValues.otp)
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
    startCountdown();
  } else {
    userStore.setUser(userData);
    await userStore.sendTokenIfAvailable();
    if (userData.name) {
      router.push('/sos');
    } else {
      router.push('/profile');
    }
  }
  isLoading.value = false;
};

callbacks.onError = async (error: any) => {
  console.log('Error in login page', error);
  isLoading.value = false;
  Notify.create({
    type: 'negative',
    message: otpSent.value
      ? 'Login failed. Please check your OTP and try again.'
      : 'Failed to send OTP. Please try again.',
  });
};

const startCountdown = () => {
  countdown.value = 30;
  countdownTimer.value = window.setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    } else {
      if (countdownTimer.value) {
        clearInterval(countdownTimer.value);
        countdownTimer.value = null;
      }
    }
  }, 1000);
};

const resendOTP = async () => {
  isLoading.value = true;
  try {
    await api.post('auth/sendOtp', {
      mobileNumber: values.value.mobileNumber,
      platform: $q.platform.is,
    });
    Notify.create({
      type: 'positive',
      message: 'OTP resent successfully',
    });
    startCountdown();
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
const goToTnc = () => {
  // Open SOS Bharat website in a new tab
  window.open('https://sosbharat.com/', '_blank');
};

const isFormValid = computed(() => {
  if (!otpSent.value) {
    // For initial OTP send: require both valid mobile number and accepted terms
    return (
      acceptedTerms.value &&
      values.value.mobileNumber?.length === 10 &&
      /^\d+$/.test(values.value.mobileNumber)
    );
  }
  // For OTP verification: only check OTP validity
  return values.value.otp?.length === 4 && /^\d+$/.test(values.value.otp);
});

onUnmounted(() => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value);
  }
});
</script>

<style scoped lang="scss">
.login-card {
  max-width: 400px;
  width: 90%;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  margin: auto;
}

.login-card-main {
  max-width: 400px;
  width: 100%;
}

.q-page {
  background: linear-gradient(135deg, $primary, darken($primary, 20%));
}

.versiontextcolor {
  color: rgb(206, 204, 204);
}
</style>
