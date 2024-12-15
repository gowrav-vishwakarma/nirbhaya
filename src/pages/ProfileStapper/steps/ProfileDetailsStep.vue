<template>
  <div class="profile-details-step">
    <h5 class="text-h5 q-mb-md q-px-md q-mt-md q-ma-none">Profile Details</h5>
    <div class="scrollable-inputs q-px-md">
      <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
        <div class="custom-input">
          <label>{{ t('common.name') }}</label>
          <q-input
            v-model="values.fullName"
            :rules="[val => !!val || t('common.nameRequired')]"
            :error="!!errors.fullName"
            :error-message="errors.fullName?.join('; ')"
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
            v-model="values.phone"
            :rules="[val => !!val || t('common.phoneRequired')]"
            :error="!!errors.phone"
            :error-message="errors.phone?.join('; ')"
            filled
            class="custom-radius"
            bg-color="pink-1"
            dense
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
            hide-bottom-space
          />
        </div>
      </q-form>
    </div>
    <div class="q-px-md button-container">
      <q-btn
        :label="t('common.next')"
        type="submit"
        color="primary"
        class="next-button"
        :disable="!isFormValid"
        :loading="isLoading"
        @click="handleSubmit" 
      >
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
import type { QSelectFilterFn } from 'quasar'

const $q = useQuasar()
const { t } = useI18n()

interface City {
  officename: string
  statename: string
  pincode: string
  city?: string
}

interface FormValues {
  fullName: string
  phone: string
  dob: string
  state: string
  city: City | null
  userType: string
  profession: string
  referredBy: string
  pincode: string
}

const props = defineProps<{
  userData: FormValues
}>()

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

const { values, errors, isLoading, validateAndSubmit, callbacks } = useForm<FormValues>(
  api,
  'user/profile-details-update',
  {
    fullName: props.userData.fullName || '',
    phone: props.userData.phone || '',
    dob: props.userData.dob || '',
    state: props.userData.state || '',
    city: null,
    userType: props.userData.userType || '',
    profession: props.userData.profession || '',
    referredBy: props.userData.referredBy || '',
    pincode: ''
  }
)

const isFormValid = computed(() => {
  return (
    !!values.value.fullName &&
    !!values.value.phone &&
    !!values.value.dob &&
    !!values.value.state &&
    !!values.value.city &&
    !!values.value.userType &&
    Object.keys(errors.value).length === 0
  )
})

callbacks.beforeSubmit = (data) => {
  const processedData = {
    ...data,
    dob: data.dob || '',
    state: data.state || '',
    pincode: data.pincode || ''
  }

  if (data.city && typeof data.city === 'object') {
    const cityData = data.city as City
    processedData.state = cityData.statename
    processedData.pincode = cityData.pincode
    processedData.city = cityData.officename
  }

  return processedData
}

const handleSubmit = async () => {
  if (isFormValid.value) {
    await validateAndSubmit(false)
    emit('update-profile', { ...values.value })
    emit('next-step')
  } else {
    $q.notify({
      color: 'negative',
      message: t('common.pleaseFixErrors'),
      icon: 'error',
      position: 'top-right',
    })
  }
}

callbacks.onSuccess = () => {
  $q.notify({
    color: 'positive',
    message: t('common.profileUpdateSuccess'),
    icon: 'check',
    position: 'top-right',
  })
}

callbacks.onError = (error: any) => {
  console.error('Error updating profile details:', error)
  $q.notify({
    color: 'negative',
    message: t('common.profileUpdateError'),
    icon: 'error',
    position: 'top-right',
  })
}

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

watch(
  () => values.value.referredBy,
  async (newValue) => {
    if (!newValue) {
      delete errors.value.referredBy;
      return;
    }

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
  }
);

onMounted(() => {
  // Initialize city object if data exists
  if (props.userData.city && props.userData.state) {
    values.value.city = {
      officename: props.userData.city.officename,
      statename: props.userData.state,
      pincode: props.userData.pincode,
    }
  }
})
</script>

<style scoped>
.profile-details-step {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.scrollable-inputs {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 80px;
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

.button-container {
  background-color: white;
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
</style>

