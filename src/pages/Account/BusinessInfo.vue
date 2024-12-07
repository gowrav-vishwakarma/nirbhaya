<template>
  <div class="business-info-container">
    <q-form @submit="handleSubmit" ref="formRef">
      <div class="text-h6 q-mb-md">Business Information</div>
      <div>
        <q-input v-model="businessData.businessName" label="Business Name"
          :rules="[val => !!val || 'Business name is required']" outlined dense />

        <q-input v-model="businessData.whatsappNumber" label="WhatsApp Number" type="number" :rules="[
          val => !!val || 'WhatsApp number is required',
          val => String(val).length === 10 || 'Phone number must be 10 digits'
        ]" @input="validatePhoneNumber" maxlength="10" prefix="+91" outlined dense class="q-mt-xs" />

        <q-input v-model="businessData.locationName" label="Business Location Name"
          :rules="[val => !!val || 'Location name is required']" outlined dense class="q-mt-sm"
          placeholder="e.g., Shop No. 123, Building Name" />

        <div class="location-section q-mt-xs">
          <q-btn class="full-width" :loading="isLoadingLocation" @click="getCurrentLocation" icon="my_location"
            label="Get Current Location" color="primary" flat />


          <div v-if="businessData.latitude && businessData.longitude" class="coordinates-display q-mt-xs">
            <div class="text-subtitle2">Current Location:</div>
            <div class="text-caption">
              Latitude: {{ businessData.latitude.toFixed(6) }}
            </div>
            <div class="text-caption">
              Longitude: {{ businessData.longitude.toFixed(6) }}
            </div>
          </div>
        </div>



        <div class="row q-col-gutter-md q-mt-md" style="margin-top: -15px;">
          <div class="col-12 q-mt-md">
            <q-btn type="submit" :loading="loading" color="primary" class="full-width" :disable="!isFormValid" no-caps>
              <b>{{ t('common.saveChanges') }}</b>
            </q-btn>
          </div>
        </div>
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useQuasar } from 'quasar';
import { Geolocation } from '@capacitor/geolocation';
import { useI18n } from 'vue-i18n';

const $q = useQuasar();
const formRef = ref();
const loading = ref(false);
const isLoadingLocation = ref(false);

interface BusinessData {
  businessName: string;
  whatsappNumber: number | null;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
}

const businessData = reactive<BusinessData>({
  businessName: '',
  whatsappNumber: null,
  locationName: '',
  latitude: null,
  longitude: null
});

const validatePhoneNumber = (value: number | string) => {
  if (value) {
    const phoneStr = String(value).replace(/\D/g, ''); // Remove non-digits
    if (phoneStr.length > 10) {
      // Truncate to 10 digits and update the model
      businessData.whatsappNumber = Number(phoneStr.slice(0, 10));
      // Show warning notification
      $q.notify({
        type: 'warning',
        message: 'Phone number should be 10 digits',
        position: 'top',
        timeout: 2000
      });
    } else {
      businessData.whatsappNumber = Number(phoneStr);
    }
  } else {
    businessData.whatsappNumber = null;
  }
};

const getCurrentLocation = async () => {
  try {
    isLoadingLocation.value = true;

    // Request location permissions
    const permissionStatus = await Geolocation.checkPermissions();
    if (permissionStatus.location !== 'granted') {
      await Geolocation.requestPermissions();
    }

    // Get current position
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    });

    if (position) {
      const { latitude, longitude } = position.coords;

      // Update business data with coordinates
      businessData.latitude = latitude;
      businessData.longitude = longitude;

      $q.notify({
        type: 'positive',
        color: 'black',
        message: 'Location Fatched',
        position: 'top-right'
      });
    }
  } catch (error) {
    console.error('Location error:', error);
    $q.notify({
      type: 'negative',
      message: error instanceof Error
        ? error.message
        : 'Failed to get location. Please try again.',
      position: 'top-right'
    });
  } finally {
    isLoadingLocation.value = false;
  }
};

const handleSubmit = async () => {
  const isValid = await formRef.value.validate();
  if (!isValid) return;

  if (!businessData.latitude || !businessData.longitude) {
    return;
  }

  try {
    loading.value = true;
    // Add your API call here to save the business information
    console.log('Saving business data:', businessData);
    // await api.saveBusinessInfo(businessData);

    $q.notify({
      type: 'positive',
      color: 'black',
      message: 'Business information saved successfully',
      position: 'top-right'
    });
  } catch (error) {
    console.error('Error saving business info:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to save business information',
      position: 'top-right'
    });
  } finally {
    loading.value = false;
  }
};

const { t } = useI18n();

const isFormValid = computed(() => {
  return businessData.businessName &&
    businessData.whatsappNumber &&
    String(businessData.whatsappNumber).length === 10 &&
    businessData.locationName &&
    businessData.latitude &&
    businessData.longitude;
});
</script>

<style scoped>
.business-info-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
}

.location-section {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 12px;
}

.coordinates-display {
  background: #f5f5f5;
  padding: 8px 12px;
  border-radius: 4px;
}

/* Hide number input spinners */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
}

/* Prevent copy-paste of more than 10 digits */
input[type=number] {
  max-width: 100%;
}
</style>
