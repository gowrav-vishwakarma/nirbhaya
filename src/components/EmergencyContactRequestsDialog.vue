<template>
  <q-dialog ref="dialogRef">
    <q-card class="q-dialog-plugin" style="width: 500px; max-width: 80vw">
      <q-card-section>
        <div class="text-h6">{{ $t('emergencyContacts') }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-list v-if="emergencyContacts.length > 0">
          <q-item v-for="contact in emergencyContacts" :key="contact.id">
            <q-item-section>
              <q-item-label>{{ contact.requesterName }}</q-item-label>
              <q-item-label caption>{{ contact.requesterPhone }}</q-item-label>
              <q-item-label caption>
                {{ contact.consentGiven ? $t('approved') : $t('pending') }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                v-if="!contact.consentGiven"
                flat
                color="positive"
                @click="approveContact(contact.id)"
                :label="$t('approve')"
              />
              <q-btn
                flat
                color="negative"
                @click="removeContact(contact.id)"
                :label="$t('remove')"
              />
            </q-item-section>
          </q-item>
        </q-list>
        <div v-else class="text-center q-pa-md">
          {{ $t('noEmergencyContacts') }}
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn color="primary" flat :label="$t('close')" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { api } from 'src/boot/axios';
import { useDialogPluginComponent } from 'quasar';

const { t } = useI18n();
const $q = useQuasar();

const { dialogRef } = useDialogPluginComponent();

const emergencyContacts = ref([]);

onMounted(async () => {
  await fetchEmergencyContacts();
});

const fetchEmergencyContacts = async () => {
  try {
    const response = await api.get('/auth/emergency-contacts');
    emergencyContacts.value = response.data;
  } catch (error) {
    console.error('Error fetching emergency contacts:', error);
    $q.notify({
      color: 'negative',
      message: t('errorFetchingContacts'),
      icon: 'error',
    });
  }
};

const approveContact = async (contactId: number) => {
  try {
    await api.post(`/auth/approve-emergency-contact/${contactId}`);
    await fetchEmergencyContacts();
    $q.notify({
      color: 'positive',
      message: t('contactApproved'),
      icon: 'check',
    });
  } catch (error) {
    console.error('Error approving contact:', error);
    $q.notify({
      color: 'negative',
      message: t('errorApprovingContact'),
      icon: 'error',
    });
  }
};

const removeContact = async (contactId: number) => {
  try {
    await api.post(`/auth/remove-emergency-contact/${contactId}`);
    emergencyContacts.value = emergencyContacts.value.filter(
      (contact) => contact.id !== contactId
    );
    $q.notify({
      color: 'positive',
      message: t('contactRemoved'),
      icon: 'check',
    });
  } catch (error) {
    console.error('Error removing contact:', error);
    $q.notify({
      color: 'negative',
      message: t('errorRemovingContact'),
      icon: 'error',
    });
  }
};
</script>
