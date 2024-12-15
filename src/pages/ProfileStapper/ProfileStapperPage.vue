<template>
  <div class="profile-stepper">
    <!-- Back Button Container -->
    <div class="back-button-container" style=" margin:0px;padding: 0px;" >
      <q-btn flat  icon="arrow_back" size="sm" class="btn-cless"  />
    </div>

    <!-- Stepper Header -->
    <div class="stepper-header" style="margin:0px;padding: 0px;" >
      <div class="step-item" :class="{ 'active': currentStep === 1 }">
        <!-- <div class="step-number">1</div> -->
        <div class="step-label" 
             @click="openProfileDialog" 
             :class="{ 'active-label': currentStep === 1, 'inactive-label': currentStep !== 1 }">
          Profile Details
        </div>
        <div class="step-label" 
             :class="{ 'active': currentStep === 1, 'inactive': currentStep !== 1 }" 
             style="width: 100px; height: 3px; margin: auto; border-radius: 10px;">
        </div>
      </div>
      <!-- <div class="step-connector"></div> -->
      <div class="step-item" :class="{ 'active': currentStep === 2 }">
        <!-- <div class="step-number">2</div> -->
        <div class="step-label" 
             @click="openContactsDialog" 
             :class="{ 'active-label': currentStep === 2, 'inactive-label': currentStep !== 2 }">
          Emergency Cont.
        </div>
        <div class="step-label" 
             :class="{ 'active': currentStep === 2, 'inactive': currentStep !== 2 }" 
             style="width: 100px; height: 3px; margin: auto; border-radius: 10px;">
        </div>
      </div>

      <!-- <div class="step-connector"></div> -->
      <div class="step-item" :class="{ 'active': currentStep === 3 }">
        <!-- <div class="step-number">2</div> -->
        <div class="step-label" 
             @click="openContactsDialog" 
             :class="{ 'active-label': currentStep === 3, 'inactive-label': currentStep !== 3 }">
          Volunteer
        </div>
        <div class="step-label" 
             :class="{ 'active': currentStep === 3, 'inactive': currentStep !== 3 }" 
             style="width: 100px; height: 3px; margin: auto; border-radius: 10px;">
        </div>
      </div>
    </div>  

    <!-- Dialog for Profile Details -->
    <q-dialog v-model="profileDialog" position="bottom" class="transparent-backdrop" style="border-radius: 30px !important;">
      <q-card class="bottom-dialog" style="border-radius: 20px 20px 0 0 !important;">
        <ProfileDetailsStep 
          :userData="userData"
          @update-profile="handleProfileUpdate"
          @next-step="handleNextStep"
        />    
      </q-card>
    </q-dialog>
    <!-- Dialog for Emergency Contacts -->
    <q-dialog v-model="contactsDialog" position="bottom" class="transparent-backdrop">
      <q-card class="bottom-dialog">
        <q-card-section class="dialog-content">
          <EmergencyContactsStep 
            :contacts="emergencyContacts"
            @update-contacts="handleContactsUpdate"
            @previous-step="handlePreviousStep"
            @submit="handleSubmit"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import ProfileDetailsStep from './steps/ProfileDetailsStep.vue'
import EmergencyContactsStep from './steps/EmergencyContactsStep.vue'

const profileDialog = ref(false)
const contactsDialog = ref(false)
const currentStep = ref(1)

const userData = reactive({
  fullName: '',
  email: '',
  phone: '',
  address: '',
  bloodGroup: ''
})
const emergencyContacts = ref([])

onMounted(() => {
  profileDialog.value = true
})

const openProfileDialog = () => {
  contactsDialog.value = false
  currentStep.value = 1
  profileDialog.value = true
}

const openContactsDialog = () => {
  profileDialog.value = false
  currentStep.value = 2
  contactsDialog.value = true
}

const handleNextStep = () => {
  profileDialog.value = false
  setTimeout(() => {
    contactsDialog.value = true
  }, 300)
  currentStep.value = 2
}

const handlePreviousStep = () => {
  contactsDialog.value = false
  setTimeout(() => {
    profileDialog.value = true
  }, 300)
  currentStep.value = 1
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
    contactsDialog.value = false
  } catch (error) {
    console.error('Error submitting data:', error)
  }
}
</script>

<style>
.profile-stepper {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f8f2f2;
  min-height: 100vh;
  padding-top: 140px;
}

.back-button-container {
  position: absolute;
  top:    0px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 800px;
  background-color: #f8f2f200;
  z-index: 3002;
  }
.btn-cless{
  height: 25px;   
  width: 50px;
  border-radius: 20px;
  font-weight: 900;
  /* background-color: #aca5a585; */
  color: #db1b5d;
  margin: 10px;
}

.stepper-header {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 800px;
  background-color: #f8f2f2;
  z-index: 3001;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
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
  background-color: #eee;
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
  height: 2px;
  background-color: #eee;
  margin: 0 16px;
  margin-bottom: 32px;
}

/* Dialog styles */
.bottom-dialog {
  width: 100%;
  height: 85vh !important;
  border-radius: 20px 20px 0 0;
  position: relative;
  z-index: 2500;
  display: flex;
  flex-direction: column;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);

}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid #eee;
}

.dialog-content {
  height: 100%;
  overflow-y: auto;
  padding: 20px;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .profile-stepper {
    padding-top: 120px;
  }
  
  .back-button-container {
    padding: 15px;
  }

  .stepper-header {
    top: 40px;
    padding: 15px;
  }
  
  .bottom-dialog {
    height: 85vh !important;
  }
  
  .dialog-content {
    height: 80vh !important;
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
  color:  #db1b5d; /* Color for active step label */
  font-weight: 800;

}

.inactive-label { 
  color: gray; /* Color for inactive step label */
  font-weight: 800;

}

.step-label.active {
  background-color:  #db1b5d; /* Color for active lower div */
  font-weight: 800;
}

.step-label.inactive {
  background-color: gray; /* Color for inactive lower div */
}

</style>
