<template>
  <q-page>
    <q-card
      class="q-mt-lg"
      style="
        background-color: white;
        border-radius: 20px 20px 0 0;
        height: 85vh;
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        overflow-y: auto;
      "
    >
      <div class="row q-pa-md">
        <!-- Basic profile information -->
        <div class="col-12 q-mb-md">
          <h6 class="q-ma-none q-ml-xs">{{ $t('name') }}</h6>
          <q-input
            class="q-mt-sm"
            outlined
            v-model="profile.name"
            :label="$t('name')"
            style="border-radius: 20px"
          />
        </div>
        <div class="col-12 q-mb-md">
          <h6 class="q-ma-none q-ml-xs">{{ $t('mobileNumber') }}</h6>
          <q-input
            class="q-mt-sm"
            outlined
            v-model="profile.mobileNumber"
            :label="$t('mobileNumber')"
            style="border-radius: 20px"
          />
        </div>
        <div class="col-12 q-mb-md">
          <h6 class="q-ma-none q-ml-xs">{{ $t('city') }}</h6>
          <q-input
            class="q-mt-sm"
            outlined
            v-model="profile.city"
            :label="$t('city')"
            style="border-radius: 20px"
          />
        </div>

        <!-- Emergency contacts -->
        <div class="col-12 q-mb-md">
          <div class="flex items-center">
            <h6 class="q-ma-none q-ml-xs">{{ $t('emergencyContacts') }}</h6>
            <q-icon name="help" size="xs" class="q-ml-sm">
              <q-tooltip>{{ $t('emergencyContactsHelp') }}</q-tooltip>
            </q-icon>
          </div>
          <div
            v-for="(contact, index) in profile.emergencyContacts"
            :key="index"
            class="q-mt-sm"
          >
            <q-input
              outlined
              v-model="contact.name"
              :label="$t('name')"
              class="q-mb-sm"
              style="border-radius: 20px"
            />
            <q-input
              outlined
              v-model="contact.number"
              :label="$t('number')"
              class="q-mb-sm"
              style="border-radius: 20px"
            />
            <q-btn
              flat
              round
              color="negative"
              icon="delete"
              @click="removeEmergencyContact(index)"
            />
          </div>
          <q-btn
            v-if="profile.emergencyContacts.length < 3"
            @click="addEmergencyContact"
            class="q-mt-sm primaryBackGroundColor text-white"
            icon="add_circle"
          >
            <span class="q-ml-xs">{{ $t('addEmergencyContact') }}</span>
          </q-btn>
        </div>

        <!-- Location sharing options -->
        <div class="col-12 q-mb-md">
          <div class="flex items-center">
            <h6 class="q-ma-none q-ml-xs">
              {{ $t('volunteerLocationSharing') }}
            </h6>
            <q-icon name="help" size="xs" class="q-ml-sm">
              <q-tooltip>{{ $t('volunteerLocationSharingHelp') }}</q-tooltip>
            </q-icon>
          </div>
          <p class="text-caption q-mb-sm">
            {{ $t('volunteerLocationSharingDescription') }}
          </p>
          <q-option-group
            v-model="profile.locationSharingOption"
            :options="locationSharingOptions"
            color="primary"
          />
        </div>

        <!-- Notification locations -->
        <div class="col-12 q-mb-md">
          <div class="flex items-center">
            <h6 class="q-ma-none q-ml-xs">{{ $t('notificationLocations') }}</h6>
            <q-icon name="help" size="xs" class="q-ml-sm">
              <q-tooltip>{{ $t('notificationLocationsHelp') }}</q-tooltip>
            </q-icon>
          </div>
          <div
            v-for="(location, index) in profile.notificationLocations"
            :key="index"
            class="q-mt-sm"
          >
            <q-input
              outlined
              v-model="location.name"
              :label="$t('locationName')"
              class="q-mb-sm"
              style="border-radius: 20px"
            />
            <q-input
              outlined
              v-model="location.address"
              :label="$t('address')"
              class="q-mb-sm"
              style="border-radius: 20px"
            />
            <q-btn
              flat
              round
              color="negative"
              icon="delete"
              @click="removeNotificationLocation(index)"
            />
          </div>
          <q-btn
            v-if="profile.notificationLocations.length < 2"
            @click="addNotificationLocation"
            class="q-mt-sm primaryBackGroundColor text-white"
            icon="add_circle"
          >
            <span class="q-ml-xs">{{ $t('addNotificationLocation') }}</span>
          </q-btn>
        </div>

        <!-- Save button -->
        <div class="col-12 q-mt-lg">
          <q-btn
            @click="saveChanges"
            style="width: 100%"
            class="bg-green text-white"
          >
            <b class="q-ml-xs q-my-md">{{ $t('saveChanges') }}</b>
          </q-btn>
        </div>
      </div>
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const profile = ref({
  name: '',
  mobileNumber: '',
  city: '',
  emergencyContacts: [],
  locationSharingOption: 'none',
  notificationLocations: [],
});

const locationSharingOptions = computed(() => [
  { label: t('alwaysAvailable'), value: 'always' },
  { label: t('availableOnDemand'), value: 'onDemand' },
  { label: t('notAvailable'), value: 'none' },
]);

const addEmergencyContact = () => {
  if (profile.value.emergencyContacts.length < 3) {
    profile.value.emergencyContacts.push({ name: '', number: '' });
  }
};

const removeEmergencyContact = (index: number) => {
  profile.value.emergencyContacts.splice(index, 1);
};

const addNotificationLocation = () => {
  if (profile.value.notificationLocations.length < 2) {
    profile.value.notificationLocations.push({ name: '', address: '' });
  }
};

const removeNotificationLocation = (index: number) => {
  profile.value.notificationLocations.splice(index, 1);
};

const saveChanges = () => {
  // TODO: Implement API call to save profile changes
  console.log('Profile saved:', profile.value);
};
</script>

<style scoped>
/* Add any scoped styles here */
</style>
