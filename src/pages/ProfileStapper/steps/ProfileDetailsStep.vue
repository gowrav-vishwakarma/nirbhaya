<template>
  <div class="profile-details-step">
    <h5 class="text-h5 q-mb-md q-px-md q-mt-md q-ma-none">Profile Details</h5>
    <div class="scrollable-inputs q-px-md">
      <q-form @submit="handleSubmit" class="q-gutter-md">
        <q-input
          v-model="form.fullName"
          label="Full Name"
          :rules="[val => !!val || 'Name is required']"
          outlined
        />
        
        <q-input  
          v-model="form.email"
          label="Email"
          type="email"
          :rules="[
            val => !!val || 'Email is required',
            val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Invalid email format'
          ]"
          outlined
        />

        <q-input
          v-model="form.phone"
          label="Phone Number"
          :rules="[val => !!val || 'Phone number is required']"
          outlined
        />

        <q-input
          v-model="form.address"
          label="Address"
          type="textarea"
          outlined
        />

        <q-select
          v-model="form.bloodGroup"
          :options="bloodGroups"
          label="Blood Group"
          outlined
        />
      </q-form>
    </div>
    <div class="q-px-md" style="background-color: white; height: 80px; width: 100%; position: relative;">
      <q-btn
        label="Next"
        type="submit"
        color="primary"
        class="next-button"
        @click="handleSubmit"
        style="width: 90%; position: absolute; bottom: 20px;"
      />
    </div>
  </div>
</template>

<style scoped>
.profile-details-step {
  display: flex;
  flex-direction: column;
  height: 100%; /* Set height to 100% of the parent */
  position: relative; /* Add relative positioning to the parent */
}
  
.scrollable-inputs {
  flex: 1; /* Take up remaining space */
  overflow-y: auto; /* Allow scrolling */
  padding-bottom: 60px; /* Add padding to prevent inputs from being hidden behind the button */
}

/* Custom scrollbar styles */
.scrollable-inputs::-webkit-scrollbar {
  width: 3px; /* Width of the scrollbar */
}

.scrollable-inputs::-webkit-scrollbar-track {
  background: #f1f1f1; /* Background of the scrollbar track */
}

.scrollable-inputs::-webkit-scrollbar-thumb {
  background: #888; /* Color of the scrollbar thumb */
  border-radius: 10px; /* Rounded corners for the thumb */
}

.scrollable-inputs::-webkit-scrollbar-thumb:hover {
  background: #555; /* Color of the thumb on hover */
}

.next-button {
  width: 80vw; /* 80% of the viewport width */
  position: absolute; /* Change to absolute */
  bottom: 20px; /* Set 20px from the bottom */
  left: 50%; /* Center the button horizontally */
  transform: translateX(-50%); /* Adjust for centering */
}
</style>

<script lang="ts" setup>
import { defineProps, defineEmits, reactive } from 'vue'

const props = defineProps<{
  userData: {
    fullName: string;
    email: string;
    phone: string;
    address: string;  
    bloodGroup: string | null;
  }
}>()

const emit = defineEmits(['update-profile', 'next-step'])

const form = reactive({
  fullName: props.userData.fullName || '',
  email: props.userData.email || '',
  phone: props.userData.phone || '',
  address: props.userData.address || '',
  bloodGroup: props.userData.bloodGroup || null
})

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const handleSubmit = () => {
  emit('update-profile', { ...form })
  emit('next-step')
}
</script> 