<template>
  <q-dialog ref="dialogRef" maximized>
    <q-card
      class="q-dialog-plugin"
      style="width: 100%; max-height: 70vh; margin: 30vh auto 0"
    >
      <q-card-section class="q-pb-sm">
        <div class="row items-center justify-between">
          <div class="text-h6">{{ $t('common.youAsEmergencyContacts') }}</div>
          <q-btn flat round icon="close" color="grey-7" v-close-popup size="sm">
            <q-tooltip>{{ $t('common.close') }}</q-tooltip>
          </q-btn>
        </div>
      </q-card-section>

      <q-card-section
        class="q-pt-none scroll"
        style="max-height: calc(70vh - 110px)"
        v-if="emergencyContacts.length > 0"
      >
        <q-list v-for="contact in emergencyContacts" :key="contact.id">
          <q-item>
            <q-item-section style="width: 80%">
              <q-item-label class="text-weight-medium text-body1">
                {{ contact.requesterName }}
              </q-item-label>
              <q-item-label caption>
                <q-icon name="phone" size="xs" class="q-mr-xs" />
                {{ contact.requesterPhone }}
              </q-item-label>
              <q-item-label caption>
                <q-badge :color="contact.consentGiven ? 'green' : 'secondary'">
                  {{
                    contact.consentGiven
                      ? $t('common.approved')
                      : $t('common.pending')
                  }}
                </q-badge>
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <div class="row q-gutter-sm">
                <q-btn
                  flat
                  round
                  color="positive"
                  icon="check"
                  size="sm"
                  @click="approveContact(contact.id)"
                  :disable="contact.consentGiven"
                  v-if="!contact.consentGiven"
                >
                  <q-tooltip>{{ $t('common.approve') }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="negative"
                  icon="delete"
                  size="sm"
                  @click="removeContact(contact.id)"
                >
                  <q-tooltip>{{ $t('common.remove') }}</q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </q-item>
          <q-separator></q-separator>
        </q-list>
      </q-card-section>
      <div v-else class="text-center q-pa-md">
        <div class="empty-state q-mt-md text-center">
          <q-icon name="contacts" size="48px" color="grey-6" />
          <p class="text-negative q-mt-sm q-mb-none">
            {{ t('common.youNotInEmergencyContacts') }}
          </p>
          <p class="text-grey-8 q-mt-sm q-mb-none text-body2">
            {{ t('common.encourageAddEmergencyContact') }}
          </p>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
// import { useQuasar } from 'quasar';
// import { useI18n } from 'vue-i18n';
import { api } from 'src/boot/axios';
import { useDialogPluginComponent } from 'quasar';

// const { t } = useI18n();
// const $q = useQuasar();

const { dialogRef } = useDialogPluginComponent();

const emergencyContacts = ref([]);
// const counts = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 11];

onMounted(async () => {
  await fetchEmergencyContacts();
});

const fetchEmergencyContacts = async () => {
  try {
    const response = await api.get('/user/emergency-contacts');
    emergencyContacts.value = response.data;
  } catch (error) {
    console.error('Error fetching emergency contacts:', error);
    // $q.notify({
    //   color: 'negative',
    //   message: t('common.errorFetchingContacts'),
    //   icon: 'error',
    // });
  }
};

const approveContact = async (contactId: number) => {
  try {
    await api.post(`/user/approve-emergency-contact/${contactId}`);
    await fetchEmergencyContacts();
    // $q.notify({
    //   color: 'positive',
    //   message: t('common.contactApproved'),
    //   icon: 'check',
    // });
  } catch (error) {
    console.error('Error approving contact:', error);
    // $q.notify({
    //   color: 'negative',
    //   message: t('common.errorApprovingContact'),
    //   icon: 'error',
    // });
  }
};

const removeContact = async (contactId: number) => {
  try {
    await api.post(`/user/remove-emergency-contact/${contactId}`);
    emergencyContacts.value = emergencyContacts.value.filter(
      (contact) => contact.id !== contactId
    );
    // $q.notify({
    //   color: 'positive',
    //   message: t('common.contactRemoved'),
    //   icon: 'check',
    // });
  } catch (error) {
    console.error('Error removing contact:', error);
    // $q.notify({
    //   color: 'negative',
    //   message: t('common.errorRemovingContact'),
    //   icon: 'error',
    // });
  }
};
</script>
<style lang="scss" scoped>
.empty-state {
  padding: 24px;
  border-radius: 10px;
  background: #f9f9f9;
  border: 1px dashed #ddd;
}
</style>
