<template>
  <div class="profile-stepper" style="padding-top: env(safe-area-inset-top);padding-bottom: env(safe-area-inset-bottom);">
    <div v-if='isShowBackButton' class="q-ma-none q-pa-none">
      <q-btn flat color="primary" style="border-radius:20px" to="/account">
        <q-icon name="mdi-keyboard-backspace"></q-icon>
      </q-btn>
    </div>
    <!-- Stepper Header -->
     <div :style="{padding: '20px', height: '20v', marginTop:isShowBackButton?'-20px':'0px'}">
       <h6 style="margin:0px; font-weight: 800;" class="q-mx-sm text-primary">Profile Details</h6>
       <div class="stepper-header q-px-sm" style="margin:0px;padding: 0px;">
         <div class="step-item" :class="{ 'active': currentStep === 1 }">
           <div class="step-label" 
                :class="{
                  'active-label': currentStep === 1,
                  'completed-label': completedSteps.includes(1),
                  'inactive-label': currentStep !== 1 && !completedSteps.includes(1)
                }">
             Profile Details
           </div>
           <div class="step-label" 
                :class="{
                  'active': currentStep === 1,
                  'completed': completedSteps.includes(1),
                  'inactive': currentStep !== 1 && !completedSteps.includes(1)
                }" 
                style="width: 100px; height: 4px; margin: auto; border-radius: 20px; margin-top: 3px;">
           </div>
         </div>
   
         <div class="step-item" :class="{ 'active': currentStep === 2 }">
           <div class="step-label" 
                :class="{
                  'active-label': currentStep === 2,
                  'completed-label': completedSteps.includes(2),
                  'inactive-label': currentStep !== 2 && !completedSteps.includes(2)
                }">
             Emergency Cont.
           </div>
           <div class="step-label" 
                :class="{
                  'active': currentStep === 2,
                  'completed': completedSteps.includes(2),
                  'inactive': currentStep !== 2 && !completedSteps.includes(2)
                }" 
                style="width: 100px; height: 4px; margin: auto; border-radius: 20px; margin-top: 3px;">
           </div>
         </div>
   
         <div class="step-item" :class="{ 'active': currentStep === 3 }">
           <div class="step-label" 
                :class="{
                  'active-label': currentStep === 3,
                  'completed-label': completedSteps.includes(3),
                  'inactive-label': currentStep !== 3 && !completedSteps.includes(3)
                }">
             Volunteer
           </div>
           <div class="step-label" 
                :class="{
                  'active': currentStep === 3,
                  'completed': completedSteps.includes(3),
                  'inactive': currentStep !== 3 && !completedSteps.includes(3)
                }" 
                style="width: 100px; height: 4px; margin: auto; border-radius: 20px; margin-top: 3px;">
           </div>
         </div>
       </div>
     </div>

    <!-- Content Section -->
    <div class="bottom-dialog" style=" border-radius: 20px 20px 0 0 !important;">
      <ProfileDetailsStep 
        v-if="currentStep === 1"
        :userData="userData"
        @update-profile="handleProfileUpdate"
        @next-step="handleNextStep"
      />    

      <EmergencyContactsStep 
        v-if="currentStep === 2"
        :contacts="emergencyContacts"
        @update-contacts="handleContactsUpdate"
        @previous-step="handlePreviousStep"
        @next-step="handleNextStep"
      />

      <VolunteerLocationStep
        v-if="currentStep === 3"
        @location-updated="handleLocationUpdate"
        @prev-step="handlePreviousStep"
        @next-step="handleSubmit"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import ProfileDetailsStep from './steps/ProfileDetailsStep.vue'
import EmergencyContactsStep from './steps/EmergencyContactsStep.vue'
import VolunteerLocationStep from './steps/VolnteerLocationStep.vue'

const $q = useQuasar()
const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const currentStep = ref(1)
const completedSteps = ref<number[]>([])

const userData = reactive({
  fullName: '',
  email: '',
  phone: '',
  address: '',
  bloodGroup: ''
})
const emergencyContacts = ref([])

const volunteerLocation = ref({
  name: '',
  latitude: null,
  longitude: null
})

const setCurrentStep = (step: number) => {
  const maxAllowedStep = Math.max(...completedSteps.value, 1) + 1
  if (step <= maxAllowedStep) {
    currentStep.value = step
  }
}

const handleNextStep = () => {
  if (currentStep.value === 1) {
    if (!completedSteps.value.includes(1)) {
      completedSteps.value.push(1)
    }
    currentStep.value = 2
  } else if (currentStep.value === 2) {
    if (!completedSteps.value.includes(2)) {
      completedSteps.value.push(2)
    }
    currentStep.value = 3
  } else if (currentStep.value === 3) {
    if (!completedSteps.value.includes(3)) {
      completedSteps.value.push(3)
    }
    router.push('/volunteer')
  }
}

const handlePreviousStep = () => {
  if (currentStep.value === 2) {
    currentStep.value = 1
  } else if (currentStep.value === 3) {
    currentStep.value = 2
  }
}

const handleProfileUpdate = (data: any) => {
  Object.assign(userData, data)
}

const handleContactsUpdate = (contacts: Array<any>) => {
  emergencyContacts.value = contacts
}

const handleLocationUpdate = (locationData: any) => {
  volunteerLocation.value = locationData
}

const handleSubmit = async () => {
  try {
    const submitData = {
      profile: userData,
      emergencyContacts: emergencyContacts.value,
      volunteerLocation: volunteerLocation.value
    }

    console.log('Submitting data:', submitData)

    await api.post('user/complete-profile', submitData)

    $q.notify({
      color: 'positive',
      message: t('common.profileCompleted'),
      icon: 'check'
    })

    router.push('/dashboard')
  } catch (error) {
    console.error('Error submitting data:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errorSavingProfile'),
      icon: 'error'
    })
  }
}

watch([userData, emergencyContacts, volunteerLocation], ([newUserData, newContacts, newLocation]) => {
  if (Object.values(newUserData).every(value => !!value)) {
    if (!completedSteps.value.includes(1)) {
      completedSteps.value.push(1)
    }
  }

  if (newContacts.length > 0) {
    if (!completedSteps.value.includes(2)) {
      completedSteps.value.push(2)
    }
  }

  if (newLocation.latitude && newLocation.longitude) {
    if (!completedSteps.value.includes(3)) {
      completedSteps.value.push(3)
    }
  }
})

const isShowBackButton=ref(false)

onMounted(() => {
  const stepFromQuery = Number(route.query.stap)
  console.log('stepFromQuery....',route.query);
  
  if (stepFromQuery && stepFromQuery >= 1 && stepFromQuery <= 3) {
 isShowBackButton.value=true
    currentStep.value = stepFromQuery
  }
})
</script>

<style>
.profile-stepper {
  max-width: 800px;
  margin: 0 auto;
  background-color: #f8f8f8;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
}

.back-button-container {
  position: absolute;
  top:    0px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 800px;
  background-color: #f8f8f8;
  z-index: 3002;
  }
.btn-cless{
  height: 25px;   
  width: 50px;
  border-radius: 20px;
  font-weight: 800;
  background-color: #f8f8f8;
  color: #db1b5d;
  margin: 10px;
}

.stepper-header {
  width: 100%;
  max-width: 800px;
  background-color: #f8f8f8;
  z-index: 3001;
  /* padding: 20px; */
  display: flex;
  align-items: center;
  margin-top: 10px !important;
  justify-content: space-between;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #666;
  cursor: pointer;
  transition: color 0.3s ease;
}

.step-item:hover {
  color: #1976d2;
}

.step-item.active {
  color: #1976d2;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  /* background-color: #fbf8f8; */
  background-color:  rgba(212, 206, 206, 0.858);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  transition: background-color 0.3s ease;
}

.step-item.active .step-number {
  background-color: #1976d2;
  color: white;
}

.step-connector {
  width: 100px;
  height: 3px;
  background-color: #eee;
  margin: 0 16px;
  margin-bottom: 32px;
}

/* Dialog styles */
.bottom-dialog {
  width: 100%;
  flex: 1;
  border-radius: 20px 20px 0 0;
  position: relative;
  z-index: 2500;
  display: flex;
  flex-direction: column;
  box-shadow: 0 12px 12px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid #eee;
}

.dialog-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .back-button-container {
    padding: 15px;
  }

  .stepper-header {
    top: 30px;
    padding: 15px;
  }
  
  .bottom-dialog {
    border-radius: 20px 20px 0 0 !important;
  }
}

/* Add this at the end of your style section */
.transparent-backdrop .q-dialog__backdrop {
  background: transparent !important;
}

:deep(.q-dialog) {
  align-items: flex-end !important;
  z-index: 2500 !important;
}

:deep(.q-dialog__backdrop) {
  z-index: 2400 !important;
}

:deep(.q-card-section) {
  height: 100%;
  padding: 0;
}

:deep(.q-dialog__inner) {
  max-height: 75vh !important;
}

.active-label {
  color:  #f9387bd5;/* Color for active step label */
  font-weight: 700;

}

.inactive-label { 
  color: rgba(212, 206, 206, 0.858); /* Color for inactive step label */
  font-weight: 700;

}

.step-label.active {
  background-color:  #f9387bd5; /* Color for active lower div */
  font-weight: 700;
}

.step-label.inactive {
  background-color:  rgba(212, 206, 206, 0.858); /* Color for inactive lower div */
}

.completed-label {
  color: #f9387bd5 !important; /* Use your theme color for completed steps */
  font-weight: 700;
}

.step-label.completed {
  background-color: #f9387bd5 !important; /* Use your theme color for completed steps */
}

.step-item:last-child .step-label.active {
  color: #f9387bd5;
  font-weight: 700;
}

.step-item:last-child .step-label.completed {
  background-color: #f9387bd5;
}

/* Add animation for step transitions */
.step-enter-active,
.step-leave-active {
  transition: opacity 0.3s ease;
}

.step-enter-from,
.step-leave-to {
  opacity: 0;
}

/* Add transition for smooth state changes */
.step-label {
  transition: all 0.3s ease;
}

</style>
