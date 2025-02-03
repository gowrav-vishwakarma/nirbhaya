<template>
  <q-page class="q-pa-xs">
    <q-card flat class="emergency-contacts-card">
      <q-card-section>
        <h5 class="text-h6 q-mb-sm q-ma-none">Emergency Contacts</h5>
        <p class="q-ma-none q-mb-sm">Your emergency contacts.</p>

        <div class="scrollable-inputs">
          <div class="q-mb-md q-mt-md">
            <q-btn-group spread flat rounded>
              <q-btn
                icon="add"
                color="primary"
                class="full-width custom-radius"
                @click="showInputFields = !showInputFields"
                :label="t('common.addEmergencyContact')"
                no-caps
                style="border-radius: 10px 0 0 10px !important"
              />
              <q-btn
                @click="openEmergencyContactRequests"
                color="secondary"
                class="full-width"
                :icon="t('common.icons.contacts')"
                :label="t('common.emergencyContactRequests')"
                style="border-radius: 0 10px 10px 0px !important"
                no-caps
              />
            </q-btn-group>
          </div>

          <!--
          -- added btn group
          <div class="row q-col-gutter-sm q-mb-md q-mt-xs">
            <div class="col-6">
              <q-btn
                icon="add"
                color="primary"
                class="full-width custom-radius"
                @click="showInputFields = !showInputFields"
                :label="t('common.addEmergencyContact')"
                style="border-radius: 10px !important"
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
                style="border-radius: 10px !important"
                no-caps
              />
            </div>
          </div> -->
          <div class="emergencycontact">
            <!-- Input Fields Section -->
            <div v-if="showInputFields" class="input-fields bg-light-grey">
              <div class="custom-input">
                <label>{{ t('common.name') }}</label>
                <q-input
                  v-model="newContact.contactName"
                  :rules="[
                    (val) => !!val || t('common.nameRequired'),
                    (val) =>
                      /^[a-zA-Z0-9\s]*$/.test(val) || t('common.nameRequired'),
                  ]"
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
                  :error="!!errors[`emergencyContact${newContactErrorIndex}`]"
                  :error-message="
                    errors[`emergencyContact${newContactErrorIndex}`]
                  "
                  filled
                  class="custom-radius"
                  bg-color="pink-1"
                  dense
                  type="tel"
                  mask="##########"
                  :rules="[
                    (val) =>
                      (val && val.length === 10) ||
                      t('common.invalidPhoneNumberLength'),
                  ]"
                  hide-bottom-space
                  @update:model-value="clearPhoneError"
                />
              </div>

              <div class="custom-input">
                <q-checkbox
                  v-model="newContact.is_primary"
                  label="Set as primary contact"
                />
              </div>

              <div class="row q-col-gutter-sm">
                <div class="col-6">
                  <q-btn
                    label="Cancel"
                    color="black"
                    style="border-radius: 10px !important"
                    class="full-width custom-radius"
                    @click="clearInputFields"
                  />
                </div>
                <div class="col-6">
                  <q-btn
                    label="Save"
                    color="primary"
                    style="border-radius: 10px !important"
                    class="full-width custom-radius"
                    @click="addEmergencyContact"
                    :loading="isAddingContact"
                  >
                    <template v-slot:loading>
                      <q-spinner />
                    </template>
                  </q-btn>
                </div>
              </div>
            </div>
            <q-separator v-if="showInputFields" class="q-mt-md" />
            <!-- Contact Cards -->
            <div class="contact-cards q-mt-md" v-if="hasEmergencyContacts">
              <q-card flat bordered class="q-mb-sm contact-card">
                <q-card-section
                  class=""
                  v-for="(contact, index) in values.emergencyContacts"
                  :key="index"
                >
                  <div class="row items-center">
                    <div class="col-auto">
                      <q-avatar>
                        <img src="/profile.png" alt="/profile.png" />
                      </q-avatar>
                    </div>
                    <div class="col">
                      <div class="text-subtitle2 row items-center">
                        {{ contact.contactName }}
                        <q-icon
                          v-if="contact.is_primary"
                          name="check_circle"
                          color="positive"
                          size="xs"
                          class="q-ml-sm"
                        >
                          <q-tooltip>Primary Contact</q-tooltip>
                        </q-icon>
                      </div>
                      <div class="text-caption">{{ contact.contactPhone }}</div>
                      <div>
                        Approval Status: ({{
                          contact.consentGiven ? 'Approved' : 'Pending'
                        }})
                      </div>
                    </div>
                    <div class="col-auto q-ml-auto">
                      <q-btn
                        class="remove-btn"
                        flat
                        label="Remove"
                        style="border-radius: 10px !important"
                        @click="removeEmergencyContact(index)"
                      />
                    </div>
                    <!-- New UX for Invite Section -->
                    <div
                      v-if="!contact.isVerified && contact.isCreatedByEmg"
                      class="invite-section q-mt-md"
                    >
                      <div
                        class="invite-content bg-grey-2 q-pa-md rounded-borders"
                      >
                        <p class="text-caption q-mb-md text-grey-8">
                          <!-- {{ contact.contactName }} hasn't registered on SOS
                          Bharat yet. Send them an invite so they can help you
                          when you need them. -->
                          {{
                            t('common.inviteMessage', {
                              name: contact.contactName,
                            })
                          }}
                        </p>
                        <!-- :label="t('common.inviteButtonLabel', { name: contact.contactName })" -->
                        <q-btn
                          icon="fab fa-whatsapp"
                          :label="
                            t('common.inviteButtonLabel', {
                              name: contact.contactName,
                            })
                          "
                          color="positive"
                          class="full-width"
                          style="border-radius: 10px !important"
                          @click="sendWhatsAppInvite(contact)"
                        >
                          <q-tooltip>Send invitation via WhatsApp </q-tooltip>
                        </q-btn>
                      </div>
                    </div>
                  </div>
                  <q-separator class="q-mt-md" />
                </q-card-section>
              </q-card>
            </div>
            <div
              v-else-if="!showInputFields"
              class="empty-state q-mt-md text-center"
            >
              <q-icon name="contacts" size="48px" color="grey-6" />
              <p class="text-negative q-mt-sm q-mb-none">
                {{ t('common.noEmergencyContacts') }}
              </p>
              <p class="text-grey-7 q-mt-sm text-caption">
                {{ t('common.emergencyContactsHelp') }}
              </p>
              <q-btn
                flat
                color="primary"
                :label="t('common.addEmergencyContact')"
                class="q-mt-sm"
                icon="add"
                @click="showInputFields = true"
              />
            </div>
          </div>
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
  is_primary?: boolean;
  isVerified?: boolean;
  isCreatedByEmg?: boolean;
}
const props = defineProps<{
  reloadComponents?: () => void;
}>();

const emit = defineEmits(['reloadComponents']);

// Define interface for form values
interface FormValues {
  emergencyContacts: EmergencyContact[];
}

const { t } = useI18n();
const $q = useQuasar();
const userStore = useUserStore();

const { values, errors, validateAndSubmit, callbacks } = useForm<FormValues>(
  api,
  'user/emergency-contacts-add',
  {
    emergencyContacts: [] as EmergencyContact[],
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (c: any) => c.contactPhone === contact.contactPhone
        );
        return {
          ...contact,
          consentGiven: status ? status.consentGiven : false,
          isVerified: status ? status.isVerified : false,
          isCreatedByEmg: status ? status.isCreatedByEmg : false,
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

const showInputFields = ref(false);
const newContact = ref({
  contactName: '',
  contactPhone: '',
  relationship: undefined,
  isAppUser: true,
  priority: 0,
  consentGiven: false,
  is_primary: false,
  isVerified: false,
  isCreatedByEmg: false,
});

const clearInputFields = () => {
  newContact.value = {
    contactName: '',
    contactPhone: '',
    relationship: undefined,
    isAppUser: true,
    priority: 0,
    consentGiven: false,
    is_primary: false,
    isVerified: false,
    isCreatedByEmg: false,
  };
  showInputFields.value = false;
};

const isAddingContact = ref(false);

const addEmergencyContact = async () => {
  if (newContact.value.contactName && newContact.value.contactPhone) {
    const isDuplicate = values.value.emergencyContacts.some(
      (contact) => contact.contactPhone === newContact.value.contactPhone
    );

    if (isDuplicate) {
      $q.notify({
        color: 'negative',
        message: t('common.phoneNumberAlreadyExists'),
        icon: 'error',
        position: 'top-right',
      });
      return;
    }

    // Validate phone number with contact name
    const isValid = await validatePhoneNumber(
      newContact.value.contactPhone,
      values.value.emergencyContacts.length,
      newContact.value.contactName
    );
    if (!isValid) {
      return;
    }

    try {
      isAddingContact.value = true; // Start loading

      // Add new contact to the list
      values.value.emergencyContacts.push({
        contactName: newContact.value.contactName,
        contactPhone: newContact.value.contactPhone,
        relationship: newContact.value.relationship,
        isAppUser: true,
        priority: 0,
        consentGiven: false,
        is_primary: newContact.value.is_primary,
        touched: true,
        isVerified: false,
        isCreatedByEmg: false,
      });

      // Save all contacts
      await validateAndSubmit(false);

      // Clear input fields and hide form
      clearInputFields();

      // Reload updated data
      await loadUserData();
    } catch (error) {
      console.error('Error adding emergency contact:', error);
      $q.notify({
        color: 'negative',
        message: t('common.errorAddingContact'),
        icon: 'error',
        position: 'top-right',
      });
    } finally {
      isAddingContact.value = false; // Stop loading
    }
  } else {
    $q.notify({
      color: 'negative',
      message: t('common.fillRequiredFields'),
      icon: 'error',
      position: 'top-right',
    });
  }
};

const removeEmergencyContact = async (index: number) => {
  // Add confirmation dialog
  $q.dialog({
    title: t('common.confirm'),
    message: t('common.confirmDeleteContact'),
    cancel: true,
    persistent: true,
    ok: {
      label: t('common.delete'),
      color: 'black',
    },
    cancel: {
      label: t('common.cancel'),
      color: 'grey',
    },
  }).onOk(async () => {
    try {
      const contactToDelete = values.value.emergencyContacts[index];
      const userId = userStore.user.id;

      // Call API to delete the contact
      await api.post('/user/emergency-contact', {
        userId: userId,
        contactPhone: contactToDelete.contactPhone,
      });

      // Remove from local state
      values.value.emergencyContacts.splice(index, 1);

      // Save changes immediately
      await validateAndSubmit(false);

      // Update store and reload data
      userStore.updateUser({
        ...userStore.user,
        emergencyContacts: values.value.emergencyContacts,
      });

      await loadUserData();

      // Show success notification
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

// const isFormValid = computed(() => {
//   const hasValidContacts = values.value.emergencyContacts.length > 0;

//   // Check if there are any non-empty contacts
//   const hasNonEmptyContacts = values.value.emergencyContacts.some(
//     (contact: EmergencyContact) =>
//       contact.contactName?.trim() || contact.contactPhone?.trim()
//   );

//   // Validate all non-empty contacts
//   const allContactsHaveData = values.value.emergencyContacts.every(
//     (contact: EmergencyContact) => {
//       // If the contact has any data, require both fields
//       if (contact.contactName?.trim() || contact.contactPhone?.trim()) {
//         return (
//           contact.contactName?.trim() &&
//           contact.contactPhone?.trim() &&
//           contact.contactPhone.length === 10
//         );
//       }
//       // Empty contacts are considered valid (they'll be filtered out on submit)
//       return true;
//     }
//   );

//   const noErrors = Object.keys(errors.value).length === 0;

//   // Form is valid if:
//   // 1. There is at least one contact
//   // 2. At least one contact has data
//   // 3. All contacts with any data are completely filled
//   // 4. There are no validation errors
//   return (
//     hasValidContacts && hasNonEmptyContacts && allContactsHaveData && noErrors
//   );
// });

const validatePhoneNumber = async (
  phoneNumber: string,
  index: number,
  contactName?: string
): Promise<boolean> => {
  const phoneRegex = /^\d{10}$/; // Regex to check for exactly 10 digits

  try {
    if (!phoneRegex.test(phoneNumber)) {
      errors.value[`emergencyContact${index}`] = t(
        'common.invalidPhoneNumberLength'
      );
      return false;
    }

    // First check if the number is user's own number
    if (phoneNumber === userStore.user.phoneNumber) {
      errors.value[`emergencyContact${index}`] = t('common.cantAddOwnNumber');
      return false;
    }

    // Validate phone number with API
    const response = await api.post('auth/validate-phone', {
      phoneNumber,
      createNew: true,
      name: contactName || '',
    });
    if (!response.data.isValid) {
      errors.value[`emergencyContact${index}`] = t(
        'common.userNotRegisteredInApp'
      );
      return false;
    } else {
      delete errors.value[`emergencyContact${index}`];
      return true;
    }
  } catch (error) {
    console.error('Error validating phone number:', error);
    errors.value[`emergencyContact${index}`] = t('common.phoneValidationError');
    return false;
  }
};

// const handleSubmit = async () => {
//   try {
//     // Mark all contacts as touched before submission
//     values.value.emergencyContacts.forEach((contact: EmergencyContact) => {
//       contact.touched = true;
//     });

//     // Clear any existing errors
//     errors.value = {};

//     // Filter out empty contacts before submission
//     values.value.emergencyContacts = values.value.emergencyContacts.filter(
//       (contact: EmergencyContact) =>
//         contact.contactName?.trim() || contact.contactPhone?.trim()
//     );

//     // Rest of the validation logic...
//     if (values.value.emergencyContacts.length > 0) {
//       const validationPromises = values.value.emergencyContacts.map(
//         (contact: EmergencyContact, index: number) =>
//           validatePhoneNumber(contact.contactPhone, index)
//       );

//       const validationResults = await Promise.all(validationPromises);

//       if (validationResults.includes(false)) {
//         return;
//       }
//     }

//     await validateAndSubmit(false);
//   } catch (error) {
//     console.error('Error in handleSubmit:', error);
//     $q.notify({
//       color: 'negative',
//       message: t('common.unexpectedError'),
//       icon: 'error',
//       position: 'top-right',
//     });
//   }
// };

callbacks.onSuccess = (data) => {
  console.log(data);
  // Update the store with new emergency contacts
  userStore.updateUser({
    ...userStore.user,
    emergencyContacts: values.value.emergencyContacts,
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
callbacks.onError = async (error: any): Promise<void> => {
  console.error('Error updating emergency contacts', error);
  $q.notify({
    color: 'negative',
    message: t('common.emergencyContactsUpdateError'),
    icon: 'error',
    position: 'top-right',
  });
};

const openEmergencyContactRequests = () => {
  $q.dialog({
    component: EmergencyContactRequestsDialog,
  });
};

const newContactErrorIndex = computed(() => {
  return values.value?.emergencyContacts?.length || 0;
});

// Add this new function to clear phone error when typing
const clearPhoneError = () => {
  if (errors.value[`emergencyContact${newContactErrorIndex.value}`]) {
    delete errors.value[`emergencyContact${newContactErrorIndex.value}`];
  }
};

const sendWhatsAppInvite = async (contact: EmergencyContact) => {
  try {
    contact.contactPhone = '8559846603';
    const text = t('common.whatsappInviteMessage', {
      sender_name: userStore.user.name,
    });
    const encodedText = encodeURIComponent(text);

    // Create both universal and app-specific URLs
    const universalUrl = `https://wa.me/91${contact.contactPhone}?text=${encodedText}`;
    const appUrl = `whatsapp://send?phone=91${contact.contactPhone}&text=${encodedText}`;

    const a = document.createElement('a');
    // Try to open WhatsApp app first
    const openApp = async () => {
      a.href = appUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    // Fallback to universal link after a short delay
    await openApp();
    setTimeout(() => {
      const fallbackLink = a;
      fallbackLink.href = universalUrl;
      fallbackLink.target = '_blank';
      fallbackLink.rel = 'noopener noreferrer';
      fallbackLink.style.display = 'none';
      document.body.appendChild(fallbackLink);
      fallbackLink.click();
      document.body.removeChild(fallbackLink);
    }, 500);
  } catch (error) {
    console.error('Error opening WhatsApp:', error);
    $q.notify({
      message: 'Unable to connect via WhatsApp',
      color: 'negative',
      position: 'top-right',
    });
  }
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
  padding-bottom: 16px;
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
  // display: flex;
  // align-items: center;
  // border-left: 3px solid transparent;
}

.contact-card:has(.q-icon[name='check_circle']) {
  border-left-color: var(--q-positive);
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

.q-page {
  min-height: unset !important;
  padding-bottom: 16px;
}

:deep(.q-page) {
  min-height: unset !important;
}

.bg-light-grey {
  padding: 12px;
  border-radius: 10px;
  background: #f9f9f9;
  border: 1px solid#ddd;
}
.empty-state {
  padding: 24px;
  border-radius: 10px;
  background: #f9f9f9;
  border: 1px dashed #ddd;
}

.invite-btn {
  font-size: 12px;
  text-transform: capitalize;
}

.invite-section {
  margin: 16px 0;

  .invite-content {
    border: 1px solid #e0e0e0;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }

  .q-btn {
    text-transform: none;
    font-weight: 500;
    letter-spacing: 0.5px;
  }
}

.rounded-borders {
  border-radius: 12px;
}
</style>
