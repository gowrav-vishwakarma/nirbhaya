<template>
  <div>
    <q-dialog v-model="isOpen" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            {{
              isDeletionRequested ? 'Cancel Account Deletion' : 'Delete Account'
            }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-sm">
          <template v-if="isDeletionRequested">
            <div class="text-body1 q-mb-md">
              Your account is scheduled for deletion on
              {{ formattedDeletionDate }}.
            </div>
            <div class="text-body2 q-mb-md">
              Would you like to cancel the deletion request and keep your
              account active?
            </div>
          </template>
          <template v-else>
            <div class="text-subtitle1 text-negative q-mb-md">
              Warning: This action cannot be undone!
            </div>
            <div class="text-body2 q-mb-md">
              By proceeding with account deletion:
              <ul>
                <li>Your account will be deactivated immediately</li>
                <li>
                  All your information will be permanently deleted after 90 days
                </li>
                <li>You won't be able to recover any data after deletion</li>
              </ul>
            </div>
            <q-input
              v-model="reason"
              type="textarea"
              label="Please tell us why you're leaving *"
              :rules="[(val) => !!val || 'Please provide a reason']"
              filled
              autogrow
            />
          </template>
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            flat
            :label="isDeletionRequested ? 'Keep My Account' : 'Delete Account'"
            :color="isDeletionRequested ? 'primary' : 'negative'"
            :loading="isProcessing"
            :disable="!isDeletionRequested && !reason"
            @click="
              isDeletionRequested ? cancelDeletion() : initiateAccountDeletion()
            "
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { useRouter } from 'vue-router';
import { useUserStore } from 'src/stores/user-store';
import { date } from 'quasar';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const $q = useQuasar();
const router = useRouter();
const userStore = useUserStore();

const reason = ref('');
const isProcessing = ref(false);

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const isDeletionRequested = computed(
  () => userStore.user.status === 'delete_requested'
);

const formattedDeletionDate = computed(() => {
  return date.formatDate(
    new Date(
      new Date(userStore.user.deletionRequestedAt).getTime() +
        90 * 24 * 60 * 60 * 1000
    ),
    'MMMM D, YYYY'
  );
});

const initiateAccountDeletion = async () => {
  if (!reason.value) return;

  try {
    isProcessing.value = true;
    await api.post('/user/delete-account', { reason: reason.value });

    $q.notify({
      type: 'positive',
      message:
        'Account deletion process initiated. Your account will be permanently deleted after 90 days.',
      position: 'top',
    });

    // Logout the user after successful deletion initiation
    userStore.logout();
    router.push('/login');
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to initiate account deletion. Please try again.',
      position: 'top',
    });
  } finally {
    isProcessing.value = false;
    isOpen.value = false;
  }
};

const cancelDeletion = async () => {
  try {
    isProcessing.value = true;
    const response = await api.post('/user/cancel-deletion');

    userStore.updateUser({
      status: 'active',
      deletionRequestedAt: undefined,
      scheduledDeletionAt: undefined,
    });

    $q.notify({
      type: 'positive',
      message: 'Account deletion cancelled. Your account is now active again.',
      position: 'top',
    });

    isOpen.value = false;
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to cancel account deletion. Please try again.',
      position: 'top',
    });
  } finally {
    isProcessing.value = false;
  }
};
</script>

<style lang="scss" scoped>
.text-h6 {
  color: #333;
  font-weight: 600;
}

.text-subtitle1 {
  font-weight: 500;
}

ul {
  margin-top: 8px;
  padding-left: 20px;
}

li {
  margin-bottom: 4px;
  color: #666;
}
</style>
