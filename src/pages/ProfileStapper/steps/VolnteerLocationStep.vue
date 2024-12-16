<template>
  <div class="emergency-contacts-step">
    <h5 class="text-h6 q-mb-sm q-px-md q-mt-md q-ma-none">{{ t('common.volunteeringSettings') }}</h5>
    <p class="q-px-md q-ma-none q-mb-sm">{{ t('common.notificationLocationsHelp') }}</p>

    <q-card flat bordered class="q-mb-md">
              <!-- <q-card-section>
                <div class="text-subtitle1 text-weight-bold q-mb-sm">
                  {{ $t('common.availabilitySettings') }}
                </div>
              </q-card-section> -->
            </q-card>
    <div class="scrollable-inputs q-px-md">
      <q-btn
        v-if="locations.length < 10"
        icon="add"
        color="primary"
        class="full-width custom-radius q-mb-md"
        @click="showInputFields = !showInputFields"
        :label="t('common.addNotificationLocation')"
        style="border-radius: 10px !important;"
      />
      
      <div v-if="showInputFields" class="input-fields">
        <div class="custom-input">
          <label>{{ t('common.locationName') }}</label>
          <q-input
            v-model="newLocation.name"
            filled
            class="custom-radius"
            bg-color="pink-1"
            dense
            hide-bottom-space
          />
        </div>

        <div class="custom-input">
          <q-btn
            flat
            color="white"
            style="border-radius: 10px !important;"
            icon="my_location"
            class="full-width custom-radius bg-primary"
            @click="getCurrentLocationForNew"
            :loading="newLocationLoading"
          >
            {{ t('common.useCurrentLocation') }}
          </q-btn>
          <div v-if="newLocation.location?.coordinates[0]" class="text-caption q-mt-sm">
            {{ getLocationCoordinates(newLocation) }}
          </div>
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
              @click="addNewLocation"
              :disabled="!isNewLocationValid"
              :loading="isAddingLocation"
            />
          </div>
        </div>
      </div>
      <q-separator v-if="showInputFields" class="q-mt-md" />

      <div class="contact-cards q-mt-md" v-if="hasLocations">
        <q-card v-for="(location, index) in locations" :key="index" flat bordered class="contact-card q-mb-sm">
          <q-card-section class="row items-center" style="width: 100%;">
            <div class="col-auto">
              <q-avatar>
                <img src='https://static.vecteezy.com/system/resources/thumbnails/051/222/604/small/3d-pink-location-pin-on-map-icon-png.png' alt='/profile.png' />
              </q-avatar>
            </div>
            <div class="col q-pl-sm">
              <div class="text-subtitle2">{{ location.name }}</div>
              <div class="text-caption" v-if="isLocationValid(location)">
                {{ getLocationCoordinates(location) }}
              </div>
            </div>
            <div class="col-auto ">
                <div class="text-center">
                    <q-btn
                      flat  
                      dense
                      round
                      class="q-mb-0 text-blue q-mb-sm"
                      icon="mdi-directions"
                      :disable="!isLocationValid(location)"
                      @click="openGoogleMaps(location.location.coordinates)"
                    >
                      <q-tooltip>{{ t('common.viewOnMap') }}</q-tooltip>
                    </q-btn>
                </div>
                <div>
                    <q-btn
                      class="remove-btn"
                      flat
                      label="Remove"
                      style="border-radius: 10px !important;"
                      @click="removeLocation(index)"
                    />
                </div>
              
            </div>
          </q-card-section>
        </q-card>
      </div>

      <p v-if="!hasLocations" class="text-negative q-mt-sm">
        No location Added
      </p>
    </div>

    <div class="q-px-md button-container">
      <div class="row full-width q-col-gutter-sm">
        <div class="col-6">
          <q-btn
            label="Previous"
            color="grey"
            flat
            class="full-width custom-radius"
            @click="$emit('prev-step')"
            style="border-radius: 10px !important;"
          />
        </div>
        <div class="col-6">
          <q-btn
            label="Next"
            color="primary"
            class="full-width custom-radius"
            :disabled="!isFormValid"
            :loading="isLoading"
            @click="saveAndContinue"
            style="border-radius: 10px !important; height: 40px;"
          >
          <template v-slot:loading>
              <q-spinner-dots />
            </template>
            <i class="fa-solid fa-arrow-right-long q-ml-sm"></i>
          </q-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { Geolocation } from '@capacitor/geolocation'
import { useUserStore } from 'src/stores/user-store'
import { api } from 'src/boot/axios'
import { useRouter } from 'vue-router';

const { t } = useI18n()
const $q = useQuasar()
const userStore = useUserStore()
const router=useRouter()

interface Location {
  name: string
  location: {
    type: 'Point'
    coordinates: [number | null, number | null]
  }
  isBusinessLocation?: boolean
}

const locations = ref<Location[]>([])
const locationLoading = ref<boolean[]>([])
const showInputFields = ref(false)
const isLoading=ref(false)
const newLocation = ref<Location>({
  name: '',
  location: {
    type: 'Point',
    coordinates: [null, null]
  }
})
const newLocationLoading = ref(false)
const isAddingLocation = ref(false)

// Computed properties
const hasLocations = computed(() => locations.value.length > 0)
const isFormValid = computed(() => locations.value.every(isLocationValid))
const isNewLocationValid = computed(() => {
  return newLocation.value.name.trim() !== '' && 
         newLocation.value.location.coordinates[0] !== null && 
         newLocation.value.location.coordinates[1] !== null
})

// Helper functions
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
           Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

const isLocationValid = (location: Location) => {
  const [longitude, latitude] = location.location.coordinates
  return latitude !== null && longitude !== null && location.name.trim() !== ''
}

const getLocationCoordinates = (location: Location) => {
  const [longitude, latitude] = location.location.coordinates
  if (latitude && longitude) {
    return `${t('common.coordinates')}: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
  }
  return ''
}

// Actions
const addNotificationLocation = () => {
  if (locations.value.length < 10) {
    const newLocation = {
      name: '',
      location: {
        type: 'Point',
        coordinates: [null, null] as [number | null, number | null]
      }
    }
    locations.value.push(newLocation)
    locationLoading.value.push(false)
  }
}

const updateLocationCoordinates = async (index: number) => {
  locationLoading.value[index] = true
  try {
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000
    })

    const newLat = position.coords.latitude
    const newLon = position.coords.longitude

    // Check distance with existing locations
    const tooClose = locations.value.some((loc, idx) => {
      if (idx === index || !isLocationValid(loc)) return false

      const [existingLon, existingLat] = loc.location.coordinates
      if (!existingLat || !existingLon) return false

      const distance = calculateDistance(newLat, newLon, existingLat, existingLon)
      return distance < 500 // Less than 500 meters
    })

    if (tooClose) {
      locations.value[index].location.coordinates = [null, null]
      locations.value[index].name = ''

      $q.notify({
        color: 'negative',
        message: t('common.locationTooClose'),
        icon: 'error',
        position: 'top-right'
      })
      return
    }

    locations.value[index].location.coordinates = [position.coords.longitude, position.coords.latitude]

    // Update profile directly
    const response = await api.post('user/user-profile-update', {
      locations: locations.value
    })
    
    userStore.updateUser(response.data.user)

    $q.notify({
      color: 'black',
      message: t('common.locationUpdated'),
      icon: 'check',
      position: 'top-right'
    })
  } catch (error) {
    console.error('Error getting location', error)
    locations.value[index].location.coordinates = [null, null]
    
    $q.notify({
      color: 'negative',
      message: t('common.locationError'),
      icon: 'error',
      position: 'top-right'
    })
  } finally {
    locationLoading.value[index] = false
  }
}

const removeLocation = async (index: number) => {
  try {
    // Get existing business locations
    const existingBusinessLocations = userStore.user?.locations?.filter(loc => loc.isBusinessLocation) || []
    
    // Create updated locations array without the removed location
    const updatedNonBusinessLocations = [...locations.value]
    updatedNonBusinessLocations.splice(index, 1)
    
    // Combine with business locations
    const updatedLocations = [
      ...existingBusinessLocations,
      ...updatedNonBusinessLocations
    ]
    
    const response = await api.post('user/user-profile-update', {
      locations: updatedLocations
    })
    
    locations.value.splice(index, 1)
    locationLoading.value.splice(index, 1)
    userStore.updateUser(response.data.user)
  } catch (error) {
    console.error('Error removing location:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errorRemovingLocation'),
      icon: 'error',
      position: 'top-right'
    })
  }
}

const openGoogleMaps = (coordinates: [number | null, number | null]) => {
  if (coordinates[0] === null || coordinates[1] === null) return
  const [longitude, latitude] = coordinates
  const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
  window.open(url, '_blank')
}

const saveAndContinue = async () => {
  if (!isFormValid.value) {
    $q.notify({
      color: 'negative',
      message: t('common.pleaseSelectAllLocations'),
      icon: 'error',
      position: 'top-right'
    })
    return
  }

  try {
    isLoading.value = true
    
    // Get existing business locations
    const existingBusinessLocations = userStore.user?.locations?.filter(loc => loc.isBusinessLocation) || []
    
    // Combine with valid non-business locations
    const validLocations = [
      ...existingBusinessLocations,
      ...locations.value.filter(isLocationValid)
    ]
    
    const response = await api.post('user/user-profile-update', {
      ...userStore.user,
      locations: validLocations
    })
    
    userStore.updateUser(response.data.user)
    isLoading.value = false
    router.push('/account')
  } catch (error) {
    console.error('Error saving locations:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errorSavingLocations'),
      icon: 'error',
      position: 'top-right'
    })
  }
}

// Emits
const emit = defineEmits(['prev-step', 'next-step', 'location-updated'])

// Initialize locations from user store
const initializeLocations = () => {
  const userLocations = userStore.user?.locations || []
  // Filter out business locations for display
  locations.value = JSON.parse(JSON.stringify(
    userLocations.filter(loc => !loc.isBusinessLocation)
  ))
  locationLoading.value = new Array(locations.value.length).fill(false)
}

const getCurrentLocationForNew = async () => {
  newLocationLoading.value = true
  try {
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000
    })

    const newLat = position.coords.latitude
    const newLon = position.coords.longitude

    // Check distance with existing locations
    const tooClose = locations.value.some((loc) => {
      if (!isLocationValid(loc)) return false

      const [existingLon, existingLat] = loc.location.coordinates
      if (!existingLat || !existingLon) return false

      const distance = calculateDistance(newLat, newLon, existingLat, existingLon)
      return distance < 500 // Less than 500 meters
    })

    if (tooClose) {
      $q.notify({
        color: 'negative',
        message: t('common.locationTooClose'),
        icon: 'error',
        position: 'top-right'
      })
      return
    }

    newLocation.value.location.coordinates = [position.coords.longitude, position.coords.latitude]

    $q.notify({
      color: 'positive',
      message: t('common.locationUpdated'),
      icon: 'check',
      position: 'top-right'
    })
  } catch (error) {
    console.error('Error getting location', error)
    $q.notify({
      color: 'negative',
      message: t('common.locationError'),
      icon: 'error',
      position: 'top-right'
    })
  } finally {
    newLocationLoading.value = false
  }
}

const clearInputFields = () => {
  newLocation.value = {
    name: '',
    location: {
      type: 'Point',
      coordinates: [null, null]
    }
  }
  showInputFields.value = false
}

const addNewLocation = async () => {
  if (!isNewLocationValid.value) {
    $q.notify({
      color: 'negative',
      message: t('common.pleaseSelectLocation'),
      icon: 'error',
      position:'top-right'
    })
    return
  }

  isAddingLocation.value = true

  try {
    // Get existing business locations
    const existingBusinessLocations = userStore.user?.locations?.filter(loc => loc.isBusinessLocation) || []
    
    // Combine business locations with current locations and new location
    const updatedLocations = [
      ...existingBusinessLocations,
      ...locations.value,
      { ...newLocation.value, isBusinessLocation: false }
    ]
    
    const response = await api.post('user/user-profile-update', {
      locations: updatedLocations
    })
    
    locations.value.push({ ...newLocation.value, isBusinessLocation: false })
    locationLoading.value.push(false)
    userStore.updateUser(response.data.user)
    
    clearInputFields()
    
    $q.notify({
      color: 'positive',
      message: t('common.locationAdded'),
      icon: 'check'
    })
  } catch (error) {
    console.error('Error adding location:', error)
    $q.notify({
      color: 'negative',
      message: t('common.errorAddingLocation'),
      icon: 'error'
    })
  } finally {
    isAddingLocation.value = false
  }
}

// Initialize on mount
initializeLocations()
</script>

<style scoped>
.emergency-contacts-step {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  background-color: white;
}

.scrollable-inputs {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 80px;
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

.button-container {
  background-color: white;
  height: 60px;
  width: 100%;
  position: absolute;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

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
