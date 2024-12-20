<template>
  <div class="location-handler">
    <!-- Location Permission Dialog -->
    <q-dialog v-model="showLocationPrompt">
      <q-card>
        <q-card-section>
          <div class="text-h6">Enable Location</div>
        </q-card-section>

        <q-card-section>
          This app needs your location to provide better service.
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Later" v-close-popup />
          <q-btn
            color="primary"
            label="Enable"
            @click="requestLocation"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- iOS Settings Instructions -->
    <q-dialog v-model="showIOSInstructions">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">Location Access Required</div>
        </q-card-section>

        <q-card-section>
          <p class="q-mb-md">To enable location access on your iPhone:</p>
          <ol class="q-pl-md">
            <li>Open iPhone Settings</li>
            <li>Scroll down to this app's name</li>
            <li>Tap Location</li>
            <li>Select "While Using the App"</li>
            <li>Return to the app and refresh</li>
          </ol>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Got it" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'

export default defineComponent({
  name: 'LocationHandler',

  setup () {
    const $q = useQuasar()
    const showLocationPrompt = ref(false)
    const showIOSInstructions = ref(false)
    const locationStatus = ref('prompt')
    const isIOS = ref(false)
    const isStandalone = ref(false)

    // Check if the app is running on iOS
    const checkPlatform = () => {
      isIOS.value = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
      isStandalone.value = window.matchMedia('(display-mode: standalone)').matches
    }

    // Handle location permissions
    const checkLocationPermission = async () => {
      if ('permissions' in navigator) {
        try {
          const result = await navigator.permissions.query({ name: 'geolocation' })
          locationStatus.value = result.state

          result.onchange = () => {
            locationStatus.value = result.state
          }

          // Check if permission is granted or denied
          if (locationStatus.value === 'prompt') {
            showLocationPrompt.value = true
          } else if (locationStatus.value === 'denied' && isIOS.value && isStandalone.value) {
            showIOSInstructions.value = true
          }
        } catch (error) {
          console.error('Error checking location permission:', error)
        }
      }
    }

    const requestLocation = async () => {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          })
        })

        locationStatus.value = 'granted'
        $q.notify({
          type: 'black',
          message: 'Location access granted',
          position:'top-right'
        })

        // Here you can handle the position data
        console.log('Location:', position.coords)

      } catch (error) {
        console.error('Location error:', error)

        if (error.code === 1) { // PERMISSION_DENIED
          locationStatus.value = 'denied'
          if (isIOS.value && isStandalone.value) {
            showIOSInstructions.value = true
          }
        }

        $q.notify({
          type: 'negative',
          message: 'Location access denied',
          position:'top-right'
        })
      }
    }

    onMounted(() => {
      checkPlatform()
      checkLocationPermission()
    })

    return {
      showLocationPrompt,
      showIOSInstructions,
      requestLocation
    }
  }
})
</script>
