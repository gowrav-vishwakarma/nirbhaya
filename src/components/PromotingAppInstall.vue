<template>
  <div>
    <q-card>
      <q-card-section v-if="!isInstalled">
        <div class="text-h6">Install App</div>
        <div class="text-body1 q-mt-md">
          {{ $t('common.addToHomeScreen') }}
        </div>
      </q-card-section>

      <!-- <q-card-section> deferredPrompt:{{ deferredPrompt }} </q-card-section>
      <q-card-section> isInstalled:{{ isInstalled ?? false }} </q-card-section>
      <q-card-actions>
        <q-btn @click="checkIfInstalled"> check If Installed </q-btn>
      </q-card-actions> -->
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

const $q = useQuasar();

const deferredPrompt = ref<Event | null>(null);
const isInstalled = ref<boolean>(false);
const { t, locale } = useI18n();

const checkIfInstalled = () => {
  // console.log(window.navigator);
  // console.log(window);
  // console.log(window.matchMedia('(display-mode: standalone)').matches);

  // Check if the platform is iOS
  const isIOS =
    /iPad|iPhone|iPod/.test(window.navigator.userAgent) &&
    !window.navigator.standalone;

  // Check if the platform is desktop
  const isDesktop = $q.platform.is.desktop;

  // Update installation status based on display mode, iOS check, and desktop check
  isInstalled.value =
    window.matchMedia('(display-mode: standalone)').matches ||
    isIOS ||
    (isDesktop && window.navigator.standalone);
};

// const dismiss = () => {
//   deferredPrompt.value = null;
// };

// const install = async () => {
//   if (deferredPrompt.value) {
//     deferredPrompt.value.prompt();
//     const choiceResult = await deferredPrompt.value.userChoice;
//     if (choiceResult.outcome === 'accepted') {
//       console.log('User accepted the A2HS prompt');
//     } else {
//       console.log('User dismissed the A2HS prompt');
//     }
//     deferredPrompt.value = null;
//   }
// };

onMounted(() => {
  checkIfInstalled();
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    console.log('before install prompt', e);
    e.preventDefault();
    deferredPrompt.value = e;
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt.value = null;
    console.log('app installed');
    isInstalled.value = true;
  });
});
</script>
