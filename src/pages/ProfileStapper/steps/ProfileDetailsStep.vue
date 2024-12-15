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
          <q-input
            v-model="values.state"
            :error="!!errors.state"
            :error-message="errors.state?.join('; ')"
            filled
            class="custom-radius"
            bg-color="pink-1"
            dense
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
            :error="!!errors.userType"
            :error-message="errors.userType?.join('; ')"
            filled
            class="custom-radius"
            bg-color="pink-1"
            dense
            hide-bottom-space
          />
        </div>

        <div class="custom-input">
          <label>{{ t('common.profession') }}</label>
          <q-input
            v-model="values.profession"
            :error="!!errors.profession"
            :error-message="errors.profession?.join('; ')"
            filled
            class="custom-radius"
            bg-color="pink-1"
            dense
            hide-bottom-space
          />
        </div>

        <div class="custom-input">
          <label>{{ t('common.referredBy') }}</label>
          <q-input
            v-model="values.referredBy"
            :error="!!errors.referredBy"
            :error-message="errors.referredBy?.join('; ')"
            filled
            class="custom-radius"
            bg-color="pink-1"
            dense
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
import { onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { api } from 'src/boot/axios'
import { useForm } from 'src/qnatk/composibles/use-form'
import SearchCity from 'src/components/SearchCity.vue'

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

const userTypes = ['Student', 'Professional', 'Homemaker', 'Other']

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

const handleCitySelection = (selectedCity: City | null) => {
  if (!selectedCity) {
    values.value.city = null
    values.value.pincode = ''
    errors.value.city = ['City Required']
  } else {
    values.value.state = selectedCity.statename
    values.value.pincode = selectedCity.pincode
    values.value.city = selectedCity
    delete errors.value.city
  }
}

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

