<template>
  <q-page>
    <q-card flat class="emergency-contacts-card">
      <q-card-section>
        <h5 class="text-h6 q-mb-sm q-ma-none">Emergency Contacts</h5>
        <p class="q-ma-none q-mb-sm">Add Your emergency contacts below.</p>

        <div class="scrollable-inputs">
          <!-- Button group for Add Emergency Contact and Emergency Contact Requests -->
          <div class="row q-col-gutter-sm q-mb-md q-mt-xs">
            <div class="col-6">
              <q-btn
                icon="add"
                color="primary"
                class="full-width custom-radius"
                @click="showInputFields = !showInputFields"
                :label="t('common.addEmergencyContact')"
                style="border-radius: 10px !important;"
                no-caps
              />
            </div>
            <div class="col-6">
              <q-btn 
                @click="openEmergencyContactRequests" 
                color="secondary" 
                class="full-width custom-radius"
                :icon="t('common.icons.contacts')"
                :label="t('common.emergencyContactRequests')" 
                style="border-radius: 10px !important;"
                no-caps 
              />
            </div>
          </div>
          
          <!-- Input Fields Section -->
          <div v-if="showInputFields" class="input-fields">
            <div class="custom-input">
              <label>{{ t('common.name') }}</label>
              <q-input
                v-model="newContact.contactName"
                :rules="[val => !!val || t('common.nameRequired')]"
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
                v-model="newContact.contactPhone"
                :rules="[
                  val => !!val || t('common.phoneRequired'),
                  val => val.length === 10 || t('common.invalidPhoneNumberLength')
                ]"
                filled
                class="custom-radius"
                bg-color="pink-1"
                dense
                type="tel"
                mask="##########"
                hide-bottom-space
              />
            </div>

            <div class="row q-col-gutter-sm"> 
              <div class="col-6">
                <q-btn
                  label="Cancel"
                  color="black"
                  style="border-radius: 10px !important;"
                  class="full-width custom-radius"
                  @click="clearInputFields"
                />
              </div>
              <div class="col-6">
                <q-btn
                  label="Add"
                  color="primary"
                  style="border-radius: 10px !important;"
                  class="full-width custom-radius"
                  @click="addEmergencyContact"
                />
              </div>
            </div>
          </div>
          <q-separator v-if="showInputFields" class="q-mt-md" />

          <!-- Contact Cards -->
          <div class="contact-cards q-mt-md" v-if="hasEmergencyContacts">
            <q-card v-for="(contact, index) in values.emergencyContacts" :key="index" flat bordered class="contact-card q-mb-sm">
              <q-card-section class="row items-center" style="width: 100%;">
                <div class="col-auto">
                  <q-avatar>
                    <img src='/profile.png' alt='/profile.png' />
                  </q-avatar>
                </div>
                <div class="col">
                  <div class="text-subtitle2">{{ contact.contactName }}</div>
                  <div class="text-caption">{{ contact.contactPhone }}</div>
                  <div>Approval Status: ({{ contact.consentGiven ? 'Approved' : 'Pending' }})</div>
                </div>
                <div class="col-auto q-ml-auto">
                  <q-btn
                    class="remove-btn"
                    flat
                    label="Remove"
                    style="border-radius: 10px !important;"
                    @click="removeEmergencyContact(index)"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>
          <p v-else class="text-negative q-mt-sm">
            {{ t('common.noEmergencyContacts') }}
          </p>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { useUserStore } from 'src/stores/user-store';
import { api } from 'src/boot/axios';
import { useForm } from 'src/qnatk/composibles/use-form';
import EmergencyContactRequestsDialog from 'components/EmergencyContactRequestsDialog.vue';

// Define interface for emergency contact
interface EmergencyContact {
  contactName: string;
  contactPhone: string;
  relationship: string;
  isAppUser: boolean;
  priority: number;
  consentGiven: boolean;
  touched?: boolean;
}
const props = defineProps<{
  reloadComponents?: () => void
}>();

const emit = defineEmits(['reloadComponents']);

// Define interface for form values
interface FormValues {
  emergencyContacts: EmergencyContact[];
}

const { t } = useI18n();
const $q = useQuasar();
const userStore = useUserStore();

const { values, errors, isLoading, validateAndSubmit, callbacks } = useForm<FormValues>(
  api,
  'user/emergency-contacts-add',
  {
    emergencyContacts: [] as EmergencyContact[]
  }
);

const loadUserData = async () => {
  const userData = userStore.user;

  // Copy emergency contacts data
  values.value.emergencyContacts = userData.emergencyContacts || [];

  // Fetch emergency contacts status
  try {
    const response = await api.get('/user/emergency-contacts-status');
    const contactsStatus = response.data;
    values.value.emergencyContacts = values.value.emergencyContacts.map(
      (contact: EmergencyContact) => {
        const status = contactsStatus.find(
          (c: any) => c.contactPhone === contact.contactPhone
        );
        return {
          ...contact,
          consentGiven: status ? status.consentGiven : false,
        };
      }
    );
  } catch (error) {
    console.error('Error fetching emergency contacts status:', error);
  }
};

onMounted(() => {
  loadUserData();
});

const showInputFields = ref(false)
const newContact = ref({
  contactName: '',
  contactPhone: '',
  relationship: undefined,
  isAppUser: true,
  priority: 0,
  consentGiven: false
})

const clearInputFields = () => {
  newContact.value = {
    contactName: '',
    contactPhone: '',
    relationship: undefined,
    isAppUser: true,
    priority: 0,
    consentGiven: false
  }
  showInputFields.value = false
}

const addEmergencyContact = async () => {
  if (newContact.value.contactName && newContact.value.contactPhone) {
    const isDuplicate = values.value.emergencyContacts.some(
      contact => contact.contactPhone === newContact.value.contactPhone
    )

    if (isDuplicate) {
      $q.notify({
        color: 'negative',
        message: t('common.phoneNumberAlreadyExists'),
        icon: 'error',
        position: 'top-right'
      })
      return
    }

    // Validate phone number
    const isValid = await validatePhoneNumber(newContact.value.contactPhone, values.value.emergencyContacts.length)
    if (!isValid) {
      return
    }

    try {
      // Add new contact to the list
      values.value.emergencyContacts.push({ 
        contactName: newContact.value.contactName,
        contactPhone: newContact.value.contactPhone,
        relationship: newContact.value.relationship,
        isAppUser: true,
        priority: 0,
        consentGiven: false,
        touched: true
      })

      // Save all contacts
      await validateAndSubmit(false)

      // Clear input fields and hide form
      clearInputFields()
      
      // Reload updated data
      await loadUserData()

     
    } catch (error) {
      console.error('Error adding emergency contact:', error)
      $q.notify({
        color: 'negative',
        message: t('common.errorAddingContact'),
        icon: 'error',
        position: 'top-right'
      })
    }
  } else {
    $q.notify({
      color: 'negative', 
      message: t('common.fillRequiredFields'),
      icon: 'error',
      position: 'top-right'
    })
  }
}

const removeEmergencyContact = async (index: number) => {
  // Add confirmation dialog
  $q.dialog({
    title: t('common.confirm'),
    message: t('common.confirmDeleteContact'),
    cancel: true,
    persistent: true,
    ok: {
      label: t('common.delete'),
      color: 'black'
    },
    cancel: {
      label: t('common.cancel'),
      color: 'grey'
    }
  }).onOk(async () => {
    try {
      const contactToDelete = values.value.emergencyContacts[index];
      const userId = userStore.user.id;

      // Call API to delete the contact
      await api.post('/user/emergency-contact', {
        userId: userId,
        contactPhone: contactToDelete.contactPhone
      });

      // Remove from local state
      values.value.emergencyContacts.splice(index, 1);

      // Save changes immediately
      await validateAndSubmit(false);

      // Update store and reload data
      userStore.updateUser({
        ...userStore.user,
        emergencyContacts: values.value.emergencyContacts
      });

      await loadUserData();

      // Show success notification
      $q.notify({
        color: 'positive',
        message: t('common.contactDeletedSuccess'),
        icon: 'check',
        position: 'top-right',
      });

    } catch (error) {
      console.error('Error deleting emergency contact:', error);
      $q.notify({
        color: 'negative',
        message: t('common.emergencyContactDeleteError'),
        icon: 'error',
        position: 'top-right',
      });
    }
  });
};

const hasEmergencyContacts = computed(
  () => values.value.emergencyContacts.length > 0
);

const isFormValid = computed(() => {
  const hasValidContacts = values.value.emergencyContacts.length > 0;

  // Check if there are any non-empty contacts
  const hasNonEmptyContacts = values.value.emergencyContacts.some(
    (contact: EmergencyContact) =>
      contact.contactName?.trim() || contact.contactPhone?.trim()
  );

  // Validate all non-empty contacts
  const allContactsHaveData = values.value.emergencyContacts.every(
    (contact: EmergencyContact) => {
      // If the contact has any data, require both fields
      if (contact.contactName?.trim() || contact.contactPhone?.trim()) {
        return contact.contactName?.trim() &&
          contact.contactPhone?.trim() &&
          contact.contactPhone.length === 10;
      }
      // Empty contacts are considered valid (they'll be filtered out on submit)
      return true;
    }
  );

  const noErrors = Object.keys(errors.value).length === 0;

  // Form is valid if:
  // 1. There is at least one contact
  // 2. At least one contact has data
  // 3. All contacts with any data are completely filled
  // 4. There are no validation errors
  return hasValidContacts && hasNonEmptyContacts && allContactsHaveData && noErrors;
});

const validatePhoneNumber = async (phoneNumber: string, index: number): Promise<boolean> => {
  try {
    // First check if the number is user's own number
    if (phoneNumber === userStore.user.phoneNumber) {
      errors.value[`emergencyContact${index}`] = [t('common.cantAddOwnNumber')];
      return false;
    }

    // Rest of the existing validation
    const response = await api.post('auth/validate-phone', { phoneNumber });
    if (!response.data.isValid) {
      errors.value[`emergencyContact${index}`] = [t('common.phoneNumberNotInSystem')];
      return false;
    } else {
      delete errors.value[`emergencyContact${index}`];
      return true;
    }
  } catch (error) {
    console.error('Error validating phone number:', error);
    errors.value[`emergencyContact${index}`] = [t('common.phoneValidationError')];
    return false;
  }
};

const handlePhoneBlur = async (contact: EmergencyContact, index: number) => {
  contact.touched = true;
  if (contact.contactPhone) {
    await validatePhoneNumber(contact.contactPhone, index);
  }
};

const handleSubmit = async () => {
  try {
    // Mark all contacts as touched before submission
    values.value.emergencyContacts.forEach((contact: EmergencyContact) => {
      contact.touched = true;
    });

    // Clear any existing errors
    errors.value = {};

    // Filter out empty contacts before submission
    values.value.emergencyContacts = values.value.emergencyContacts.filter(
      (contact: EmergencyContact) => contact.contactName?.trim() || contact.contactPhone?.trim()
    );

    // Rest of the validation logic...
    if (values.value.emergencyContacts.length > 0) {
      const validationPromises = values.value.emergencyContacts.map(
        (contact: EmergencyContact, index: number) =>
          validatePhoneNumber(contact.contactPhone, index)
      );

      const validationResults = await Promise.all(validationPromises);

      if (validationResults.includes(false)) {

        return;
      }
    }

    await validateAndSubmit(false);

  } catch (error) {
    console.error('Error in handleSubmit:', error);
    $q.notify({
      color: 'negative',
      message: t('common.unexpectedError'),
      icon: 'error',
      position: 'top-right',
    });
  }
};

callbacks.onSuccess = (data) => {
  // Update the store with new emergency contacts
  userStore.updateUser({
    ...userStore.user,
    emergencyContacts: values.value.emergencyContacts
  });

  loadUserData(); // Reload user data
  props.reloadComponents?.();
  emit('reloadComponents');

  $q.notify({
    color: 'black',
    message: 'Emergency Contacts Updated Successfully',
    icon: 'check',
    position: 'top-right',
  });
};

callbacks.onError = async (error: any): Promise<void> => {
  console.error('Error updating emergency contacts', error);
  $q.notify({
    color: 'negative',
    message: t('common.emergencyContactsUpdateError'),
    icon: 'error',
  });
};

const openEmergencyContactRequests = () => {
  $q.dialog({
    component: EmergencyContactRequestsDialog,
  });
};
</script>

<style lang="scss" scoped>
.emergency-contacts-card {
  height: auto;
  max-width: 600px;
  margin: 0 auto;
  background-color: white;
}

.scrollable-inputs {
  overflow-y: auto;
  padding-bottom: 20px;
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

/* Custom border radius */
:deep(.custom-radius) .q-field__control {
  border-radius: 10px !important;
  height: 45px;
}

:deep(.custom-radius) .q-field__marginal {
  height: 56px;
  border-radius: 20px;
}

:deep(.custom-radius) .q-field__native,
:deep(.custom-radius) .q-field__input {
  border-radius: 20px;
}

.contact-card {
  border-radius: 10px;
  display: flex;
  align-items: center;
}

.remove-btn {
  background-color: black;
  align-self: flex-end;
  border-radius: 10px;
  margin-left: 10px;
  color: white;
  font-size: 12px;
  text-transform: capitalize;
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
</style>
