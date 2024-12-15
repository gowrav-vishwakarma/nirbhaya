<template>
  <div class="profile-stepper">
    <!-- Stepper Header -->
     <div style="padding: 20px; height: 20vh;">
       <h6 style="margin:0px; font-weight: 800;" class="q-mx-sm text-primary">Profile Details</h6>
       <div class="stepper-header q-px-sm" style="margin:0px;padding: 0px;">
         <div class="step-item" :class="{ 'active': currentStep === 1 }">
           <div class="step-label" 
                @click="() => setCurrentStep(1)" 
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
                @click="() => setCurrentStep(2)" 
                :class="{ 'active-label': currentStep === 2, 'inactive-label': currentStep !== 2 }">
             Emergency Cont.
           </div>
           <div class="step-label" 
                :class="{ 'active': currentStep === 2, 'inactive': currentStep !== 2 }" 
                style="width: 100px; height: 4px; margin: auto; border-radius: 20px; margin-top: 3px;">
           </div>
         </div>
   
         <div class="step-item" :class="{ 'active': currentStep === 3 }">
           <div class="step-label" 
                @click="() => setCurrentStep(3)" 
                :class="{ 'active-label': currentStep === 3, 'inactive-label': currentStep !== 3 }">
             Volunteer
           </div>
           <div class="step-label" 
                :class="{ 'active': currentStep === 3, 'inactive': currentStep !== 3 }" 
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
        @submit="handleSubmit"
      />

      <div v-if="currentStep === 3">
        Volunteer Content Here
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import ProfileDetailsStep from './steps/ProfileDetailsStep.vue'
import EmergencyContactsStep from './steps/EmergencyContactsStep.vue'

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

const setCurrentStep = (step: number) => {
  if (step === 1) {
    completedSteps.value = completedSteps.value.filter(s => s !== 1)
  }
  currentStep.value = step
}

const handleNextStep = () => {
  if (!completedSteps.value.includes(1)) {
    completedSteps.value.push(1)
  }
  currentStep.value = 2
}

const handlePreviousStep = () => {
  currentStep.value = 1
  completedSteps.value = completedSteps.value.filter(step => step !== 1)
}

const handleProfileUpdate = (data: any) => {
  Object.assign(userData, data)
}

const handleContactsUpdate = (contacts: Array<any>) => {
  emergencyContacts.value = contacts
}

const handleSubmit = async () => {
  try {
    console.log('Submitting data:', {
      profile: userData,
      emergencyContacts: emergencyContacts.value
    })
  } catch (error) {
    console.error('Error submitting data:', error)
  }
}
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
  color: rgba(212, 206, 206, 0.858); /* Gray color for completed step label */
  font-weight: 700;
}

.step-label.completed {
  background-color: #f9387bd5; /* Pink color for completed step line */
}

</style>
