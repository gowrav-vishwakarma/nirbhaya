<template>
  <q-dialog
    ref="dialogRef"
    position="bottom"
    @hide="handleDialogHide"
    @click="checkSwipeToClose"
    @touchstart="handleTouchStart"
    @touchmove.prevent="handleTouchMove"
    @touchend="handleTouchEnd"
    persistent
    :maximized="false"
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="dialog-card" :style="{ '--swipe-progress': swipeProgress }">
      <q-card-section>
        <div class="text-h5 q-mt-sm q-mb-xs">{{ $t('common.installApp') }}</div>
        <div class="row items-center">
          <div class="col-3" style="height: 80px">
            <q-img
              src="/sosLogo_512_512.png"
              style="height: 80px; width: 80px"
            ></q-img>
          </div>
          <div class="col-9 q-pl-md text-body1">
            <p class="q-ma-none" style="font-weight: 600">
              {{ $t('common.addToHomeScreen') }}
            </p>
          </div>
        </div>
        <div
          v-if="$q.platform.is.safari || $q.platform.is.mac"
          class="text-subtitle2"
        >
          <ol>
            <li>Open your app in Safari.</li>
            <li>
              Tap the Share button at the bottom of the screen (a box with an
              arrow pointing up).
            </li>
            <li>Scroll down and select "Add to Home Screen".</li>
            <li>Confirm by tapping "Add" in the top-right corner.</li>
          </ol>
        </div>
        <div
          v-else-if="$q.platform.is.chrome || $q.platform.is.android"
          class="text-subtitle2"
        >
          <ul>
            <li>Open your app in Chrome.</li>
            <li>Tap the three-dot menu in the top-right corner.</li>
            <li>Select "Add to Home screen". Confirm by tapping "Add".</li>
          </ul>
        </div>
        <div v-else>
          <ol>
            <li>
              - On Android: Tap <strong>Menu</strong> and select
              <strong>Add to Home screen</strong>.
            </li>
            <li>
              - On iOS: Tap <strong>Share</strong> and select
              <strong>Add to Home Screen</strong>.
            </li>
          </ol>
        </div>
      </q-card-section>
      <q-card-actions class="custom-scroll">
        <q-btn color="primary" class="col" @click="install">
          <span style="font-weight: 700">
            {{ $t('common.install') }}
          </span>
        </q-btn>
        <q-btn v-close-popup color="grey" flat class="col" @click="dismiss">
          <span style="font-weight: 700"> Skip </span>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar, useDialogPluginComponent } from 'quasar';
import { useI18n } from 'vue-i18n';

const { dialogRef, onDialogHide } = useDialogPluginComponent();
const $q = useQuasar();
const showInstallPrompt = ref(false);
const deferredPrompt = ref<any>(null);
const isInstalled = ref<boolean>(false);
const { t } = useI18n();

// Add these new refs for touch handling
const touchStartY = ref(0);
const touchEndY = ref(0);
const minSwipeDistance = 100;
const swipeProgress = ref(0);

const handleTouchStart = (event: TouchEvent) => {
  touchStartY.value = event.touches[0].clientY;
};

const handleTouchMove = (event: TouchEvent) => {
  event.preventDefault();
  touchEndY.value = event.touches[0].clientY;
  const progress = Math.min(
    Math.max((touchEndY.value - touchStartY.value) / minSwipeDistance, 0),
    1
  );
  swipeProgress.value = progress;
};

const handleTouchEnd = () => {
  const swipeDistance = touchEndY.value - touchStartY.value;
  if (swipeDistance > minSwipeDistance && dialogRef.value) {
    dialogRef.value.hide();
  }
  swipeProgress.value = 0;
};

const checkSwipeToClose = (event: MouseEvent) => {
  event.stopPropagation();
};

const handleDialogHide = () => {
  onDialogHide();
};

const checkIfInstalled = () => {
  // Check if the platform is iOS
  const isIOS =
    /iPad|iPhone|iPod/.test(window.navigator.userAgent) &&
    !('standalone' in window.navigator);

  // Check if the platform is desktop
  const isDesktop = $q.platform.is.desktop;

  // Update installation status based on display mode and iOS check
  isInstalled.value =
    window.matchMedia('(display-mode: standalone)').matches ||
    isIOS ||
    (isDesktop && window.matchMedia('(display-mode: standalone)').matches);
};

const dismiss = () => {
  showInstallPrompt.value = false;
  deferredPrompt.value = null;
};

const install = async () => {
  if (deferredPrompt.value) {
    deferredPrompt.value.prompt();
    const choiceResult = await deferredPrompt.value.userChoice;
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the A2HS prompt');
      showInstallPrompt.value = false;
    } else {
      console.log('User dismissed the A2HS prompt');
    }
    deferredPrompt.value = null;
  }
};

onMounted(() => {
  checkIfInstalled();

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    console.log('before install prompt', e);
    e.preventDefault();
    deferredPrompt.value = e;
    if (!isInstalled.value) {
      showInstallPrompt.value = true;
    }
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt.value = null;
    showInstallPrompt.value = false;
    isInstalled.value = true;
    console.log('app installed');
  });
});

const checkAndShowPrompt = () => {
  if (deferredPrompt.value && !isInstalled.value) {
    showInstallPrompt.value = true;
  }
};

defineExpose({
  checkAndShowPrompt,
  dialogRef,
});
</script>

<style lang="scss" scoped>
.dialog-card {
  width: 100%;
  max-width: 600px;
  border-radius: 16px 16px 0 0;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  touch-action: none;
  overscroll-behavior-y: contain;

  &::before {
    content: '';
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 4px;
    background: #{rgba(#000, calc(0.1 + var(--swipe-progress, 0) * 0.3))};
    border-radius: 2px;
    z-index: 1;
    transition: background-color 0.1s ease;
  }
}

.custom-scroll {
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
  height: 100%;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
    display: none;
  }
}
</style>
