<template>
  <q-page>
    <q-card flat>
      <q-card-section>
        <div>
          <!-- Button group for Add Emergency Contact and Emergency Contact Requests -->
          <div class="row q-col-gutter-sm q-mb-md">
            <div class="col-12">
              <q-btn-group class="full-width">
                <q-btn
                  @click="addEmergencyContact"
                  color="primary"
                  :icon="t('common.icons.addCircle')"
                  :label="t('common.addEmergencyContact')"
                  no-caps
                  class="full-width"
                />
                <q-btn
                  @click="openEmergencyContactRequests"
                  color="secondary"
                  :icon="t('common.icons.contacts')"
                  :label="t('common.emergencyContactRequests')"
                  no-caps
                  class="full-width"
                />
              </q-btn-group>
            </div>
          </div>

          <q-list bordered separator>
            <q-item
              v-for="(contact, index) in values.emergencyContacts"
              :key="index"
            >
              <q-item-section>
                <q-input
                  v-model="contact.contactName"
                  :label="t('common.name')"
                  dense
                  outlined
                  class="q-mb-sm"
                  :rules="[(val) => !!val || t('common.contactNameRequired')]"
                />
                <q-input
                  v-model="contact.contactPhone"
                  :label="t('common.mobileNumber')"
                  dense
                  outlined
                  class="q-mb-sm"
                  type="tel"
                  mask="##########"
                  fill-mask
                  :rules="[
                    (val) => !!val || t('common.contactNumberRequired'),
                    (val) =>
                      val.length === 10 || t('common.invalidPhoneNumberLength'),
                    (val) =>
                      /^[0-9]+$/.test(val) || t('common.onlyNumbersAllowed'),
                  ]"
                  @blur="validatePhoneNumber(contact.contactPhone, index)"
                  :error="!!errors[`emergencyContact${index}`]"
                  :error-message="
                    errors[`emergencyContact${index}`]?.join('; ')
                  "
                />
                <q-chip
                  class="q-ma-none"
                  :color="contact.consentGiven ? 'positive' : 'secondary'"
                  text-color="white"
                  :icon="contact.consentGiven ? 'check_circle' : 'warning'"
                  size="sm"
                  style="
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    width: 120px;
                  "
                >
                  <span style="text-align: center">{{
                    contact.consentGiven
                      ? t('common.approved')
                      : t('common.pendingApproval')
                  }}</span>
                </q-chip>
              </q-item-section>

              <q-item-section side>
                <div class="column q-gutter-y-sm">
                  <q-btn
                    flat
                    round
                    color="primary"
                    :icon="'save'"
                    @click="saveContact(index)"
                    :loading="contact.isSaving"
                    :disable="!isContactValid(contact)"
                  >
                    <q-tooltip>
                      {{ t('common.saveContact') }}
                    </q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    color="negative"
                    :icon="t('common.icons.delete')"
                    @click="removeEmergencyContact(index)"
                  >
                    <q-tooltip>
                      {{ t('common.delete') }}
                    </q-tooltip>
                  </q-btn>
                </div>
              </q-item-section>
            </q-item>
          </q-list>

          <p v-if="!hasEmergencyContacts" class="text-negative q-mt-sm">
            {{ t('common.atLeastOneEmergencyContactRequired') }}
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
  isSaving?: boolean;
}

// Define interface for form values
interface FormValues {
  emergencyContacts: EmergencyContact[];
}

const { t } = useI18n();
const $q = useQuasar();
const userStore = useUserStore();

const { values, errors, isLoading } = useForm<FormValues>(
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
          (c: any) => c.contactPhone === contact.contactPhone
        );
        return {
          ...contact,
          consentGiven: status ? status.consentGiven : false,
          isSaving: false,
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

const isContactValid = (contact: EmergencyContact): boolean => {
  return !!(
    contact.contactName?.trim() &&
    contact.contactPhone?.trim() &&
    contact.contactPhone.length === 10 &&
    !errors.value[
      `emergencyContact${values.value.emergencyContacts.indexOf(contact)}`
    ]
  );
};

const saveContact = async (index: number) => {
  const contact = values.value.emergencyContacts[index];

  try {
    contact.isSaving = true;

    // Validate phone number
    const isPhoneValid = await validatePhoneNumber(contact.contactPhone, index);
    if (!isPhoneValid) {
      return;
    }

    // Use the existing API endpoint with single contact
    const response = await api.post('user/emergency-contacts-add', {
      emergencyContacts: [contact],
    });

    // Update the store with the new contact
    const updatedContacts = [...values.value.emergencyContacts];
    updatedContacts[index] = {
      ...contact,
      ...response.data?.emergencyContacts?.[0],
    };

    userStore.updateUser({
      ...userStore.user,
      emergencyContacts: updatedContacts,
    });

    // Refresh contact status
    loadUserData();

    $q.notify({
      color: 'positive',
      message: t('common.emergencyContactsUpdateSuccess'),
      icon: 'check',
    });
  } catch (error) {
    console.error('Error saving contact:', error);
    $q.notify({
      color: 'negative',
      message: t('common.emergencyContactsUpdateError'),
      icon: 'error',
    });
  } finally {
    contact.isSaving = false;
  }
};

const addEmergencyContact = () => {
  const hasEmptyContact = values.value.emergencyContacts.some(
    (contact) => !contact.contactName || !contact.contactPhone
  );

  if (!hasEmptyContact) {
    values.value.emergencyContacts.push({
      contactName: '',
      contactPhone: '',
      relationship: '',
      isAppUser: false,
      priority: 0,
      consentGiven: false,
      isSaving: false,
    });
  } else {
    $q.notify({
      color: 'warning',
      message: t('common.pleaseCompleteExistingContact'),
      icon: 'warning',
    });
  }
};

const removeEmergencyContact = (index: number) => {
  values.value.emergencyContacts.splice(index, 1);
};

const hasEmergencyContacts = computed(
  () => values.value.emergencyContacts.length > 0
);

const validatePhoneNumber = async (
  phoneNumber: string,
  index: number
): Promise<boolean> => {
  try {
    // First check if the number is user's own number
    if (phoneNumber === userStore.user.phoneNumber) {
      errors.value[`emergencyContact${index}`] = [t('common.cantAddOwnNumber')];
      return false;
    }

    // Rest of the existing validation
    const response = await api.post('auth/validate-phone', { phoneNumber });
    if (!response.data.isValid) {
      errors.value[`emergencyContact${index}`] = [
        t('common.phoneNumberNotInSystem'),
      ];
      return false;
    } else {
      delete errors.value[`emergencyContact${index}`];
      return true;
    }
  } catch (error) {
    console.error('Error validating phone number:', error);
    errors.value[`emergencyContact${index}`] = [
      t('common.phoneValidationError'),
    ];
    return false;
  }
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
