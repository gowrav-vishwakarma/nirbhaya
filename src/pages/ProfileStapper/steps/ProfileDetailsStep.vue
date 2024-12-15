<template>
  <div class="profile-details-step">
    <h5 class="text-h5 q-mb-md q-px-md q-mt-md q-ma-none">Profile Details</h5>
    <div class="scrollable-inputs q-px-md">
      <q-form @submit="handleSubmit" class="q-gutter-md">
        <div class="custom-input">
          <label>Full Name</label>
          <q-input
            v-model="form.fullName"
            :rules="[val => !!val || 'Name is required']"
            filled
            class="custom-radius"
            bg-color="pink-1"
            dense
            hide-bottom-space
          />
        </div>

        <div class="custom-input">
          <label>Mobile Number</label>
          <q-input
            v-model="form.phone"
            :rules="[val => !!val || 'Phone number is required']"
            filled
            class="custom-radius"
            bg-color="pink-1"
            dense
            hide-bottom-space
          />
        </div>

        <div class="custom-input">
          <label>Date of Birth</label>
          <q-input
            v-model="form.dob"
            type="date"
            filled
            class="custom-radius"
            bg-color="pink-1"
            dense
          />
        </div>

        <div class="custom-input">
          <label>State</label>
          <q-input
            v-model="form.state"
            filled
            class="custom-radius"
            bg-color="pink-1"
            dense
          />
        </div>

        <div class="custom-input">
          <label>City</label>
          <q-input
            v-model="form.city"
            filled
            class="custom-radius"
            bg-color="pink-1"
            dense
          />
        </div>

        <div class="custom-input">
          <label>User Type</label>
          <q-select
            v-model="form.userType"
            :options="userTypes"
            filled
            class="custom-radius"
            bg-color="pink-1"
            dense
          />
        </div>

        <div class="custom-input">
          <label>Profession</label>
          <q-input
            v-model="form.profession"
            filled
            class="custom-radius"
            bg-color="pink-1"
            dense
          />
        </div>

        <div class="custom-input">
          <label>Referred By</label>
          <q-input
            v-model="form.referredBy"
            filled
            class="custom-radius"
            bg-color="pink-1"
            dense
          />
        </div>
      </q-form>
    </div>
    <div class="q-px-md button-container">
      <q-btn
        label="Next"
        type="submit"
        color="primary"
        class="next-button"
        @click="handleSubmit"
       
      >
      <i class="fa-solid fa-arrow-right-long q-ml-sm"></i>
    </q-btn>
    </div>
  </div>
</template>

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

<script lang="ts" setup>
import { defineProps, defineEmits, reactive } from 'vue'

const props = defineProps<{
  userData: {
    fullName: string;
    phone: string;
    dob: string;
    state: string;
    city: string;
    userType: string;
    profession: string;
    referredBy: string;
  }
}>()

const emit = defineEmits(['update-profile', 'next-step'])

const form = reactive({
  fullName: props.userData.fullName || '',
  phone: props.userData.phone || '',
  dob: props.userData.dob || '',
  state: props.userData.state || '',
  city: props.userData.city || '',
  userType: props.userData.userType || '',
  profession: props.userData.profession || '',
  referredBy: props.userData.referredBy || ''
})

const userTypes = ['Student', 'Professional', 'Homemaker', 'Other']

const handleSubmit = () => {
  emit('update-profile', { ...form })
  emit('next-step')
}
</script> 