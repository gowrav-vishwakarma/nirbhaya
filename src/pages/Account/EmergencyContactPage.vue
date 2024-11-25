<template>
  <q-page>

    <q-card flat>
      <q-card-section>
        <!-- Emergency contacts -->
        <div>
          <!-- <div class="text-subtitle1 text-weight-bold q-mb-sm">
              {{ t('common.emergencyContacts') }}
              <q-icon :name="t('common.icons.help')" size="xs" class="q-ml-sm">
                <q-tooltip>{{ t('common.emergencyContactsHelp') }}</q-tooltip>
              </q-icon>
            </div> -->

          <!-- Button group for Add Emergency Contact and Emergency Contact Requests -->
          <div class="row q-col-gutter-sm q-mb-md">
            <div class="col-12">
              <q-btn-group class="full-width">
                <q-btn :disable="values.emergencyContacts.length == 3" @click="addEmergencyContact" color="primary"
                  :icon="t('common.icons.addCircle')" :label="t('common.addEmergencyContact')" no-caps
                  class="full-width" />
                <q-btn @click="openEmergencyContactRequests" color="secondary" :icon="t('common.icons.contacts')"
                  :label="t('common.emergencyContactRequests')" no-caps class="full-width" />
              </q-btn-group>
            </div>
          </div>

          <q-list bordered separator>
            <q-item v-for="(contact, index) in values.emergencyContacts" :key="index">
              <q-item-section>
                <q-input v-model="contact.contactName" :label="t('common.name')" dense outlined class="q-mb-sm" :rules="[
                  (val) => !!val || t('common.contactNameRequired'),
                ]" />
                <q-input v-model="contact.contactPhone" :label="t('common.mobileNumber')" dense outlined class="q-mb-sm"
                  type="tel" mask="##########" fill-mask :rules="[
                    (val) => !!val || t('common.contactNumberRequired'),
                    (val) => val.length === 10 || t('common.invalidPhoneNumberLength'),
                    (val) => /^[0-9]+$/.test(val) || t('common.onlyNumbersAllowed')
                  ]" @blur="validatePhoneNumber(contact.contactPhone, index)"
                  :error="!!errors[`emergencyContact${index}`]"
                  :error-message="errors[`emergencyContact${index}`]?.join('; ')" />
                <q-chip class="q-ma-none" :color="contact.consentGiven ? 'positive' : 'secondary'" text-color="white"
                  :icon="contact.consentGiven ? 'check_circle' : 'warning'" size="sm"
                  style="display: flex; justify-content: center; align-items: center; text-align: center;">
                  <span style="text-align: center">{{
                    contact.consentGiven
                      ? t('common.approved')
                      : t('common.pendingApproval')
                  }}</span>
                </q-chip>
              </q-item-section>
              <q-item-section side>
                <q-btn flat round color="negative" :icon="t('common.icons.delete')"
                  @click="removeEmergencyContact(index)" />
              </q-item-section>
            </q-item>
          </q-list>
          <p v-if="!hasEmergencyContacts" class="text-negative q-mt-sm">
            {{ t('common.atLeastOneEmergencyContactRequired') }}
          </p>

          <!-- Submit button -->
          <div class="row q-col-gutter-md q-mt-lg">
            <div class="col-12">
              <q-btn type="submit" :loading="isLoading" color="primary" class="full-width" :disable="!isFormValid"
                no-caps @click="handleSubmit">
                <b>{{ t('common.saveChanges') }}</b>
              </q-btn>
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
}
const dd = ref(false)

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

const addEmergencyContact = () => {
  if (values.value.emergencyContacts.length < 3) {
    values.value.emergencyContacts.push({
      contactName: '',
      contactPhone: '',
      relationship: '',
      isAppUser: false,
      priority: 0,
      consentGiven: false,
    });
  }
};

const removeEmergencyContact = (index: number) => {
  values.value.emergencyContacts.splice(index, 1);
};

const hasEmergencyContacts = computed(
  () => values.value.emergencyContacts.length > 0
);

const isFormValid = computed(() => {
  const hasValidContacts = values.value.emergencyContacts.length > 0;
  const allContactsHaveData = values.value.emergencyContacts.every(
    (contact: EmergencyContact) =>
      contact.contactName?.trim() &&
      contact.contactPhone?.trim() &&
      contact.contactPhone.length === 10
  );
  const noErrors = Object.keys(errors.value).length === 0;

  return hasValidContacts && allContactsHaveData && noErrors;
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

const handleSubmit = async () => {
  try {
    // Clear any existing errors
    errors.value = {};

    // Validate all phone numbers if there are emergency contacts
    if (values.value.emergencyContacts.length > 0) {
      const validationPromises = values.value.emergencyContacts.map((contact: EmergencyContact, index: number) =>
        validatePhoneNumber(contact.contactPhone, index)
      );

      const validationResults = await Promise.all(validationPromises);

      // Check if any validation failed
      if (validationResults.includes(false)) {
        $q.notify({
          color: 'negative',
          message: t('common.pleaseFixErrors'),
          icon: 'error',
        });
        return;
      }
    }

    // If we reach here, all validations passed
    await validateAndSubmit(false);

  } catch (error) {
    console.error('Error in handleSubmit:', error);
    $q.notify({
      color: 'negative',
      message: t('common.unexpectedError'),
      icon: 'error',
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

  $q.notify({
    color: 'positive',
    message: t('common.emergencyContactsUpdateSuccess'),
    icon: 'check',
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
.q-page {
  min-height: auto !important;
}

.q-card {
  height: 100%;
  max-width: 600px;
  margin: 0 auto;
}
</style>
