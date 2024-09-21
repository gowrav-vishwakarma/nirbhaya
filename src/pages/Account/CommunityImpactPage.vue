<template>
  <div class="community-impact-page q-pa-md">
    <h4 class="text-h4 q-mb-md">{{ $t('common.communityImpact') }}</h4>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">{{ $t('common.yourReferralId') }}</div>
        <div class="text-h3 text-primary q-mt-sm">
          {{ userStore.user.referralId }}
        </div>
      </q-card-section>
    </q-card>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6">
            <div class="text-subtitle1">
              {{ $t('common.peopleYouHaveEncouraged') }}
            </div>
            <div class="text-h5">{{ impactInfo.peopleEncouraged }}</div>
          </div>
          <div class="col-12 col-sm-6">
            <div class="text-subtitle1">
              {{ $t('common.locationsSecured') }}
            </div>
            <div class="text-h5">{{ impactInfo.locationsSecured }}</div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6 q-mb-sm">Share your impact</div>
        <q-btn
          color="primary"
          icon="content_copy"
          label="Copy Referral Link"
          @click="copyReferralLink"
        />
      </q-card-section>
    </q-card>

    <q-card>
      <q-card-section>
        <div class="text-h6 q-mb-md">Record and Share Your Message</div>
        <div class="video-section q-mb-md">
          <q-btn-group>
            <q-btn
              size="sm"
              @click="startRecording"
              color="primary"
              :disable="isRecording || recordedVideoUrl !== ''"
              icon="videocam"
              :label="isRecording ? 'Recording...' : 'Record Video Message'"
            />
            <q-btn
              size="sm"
              @click="stopRecording"
              color="negative"
              :disable="!isRecording"
              icon="stop"
              label="Stop Recording"
            />
          </q-btn-group>
        </div>

        <div class="video-container q-mt-sm" style="position: relative">
          <video
            ref="videoPreview"
            style="display: none"
            autoplay
            muted
          ></video>
          <canvas
            ref="overlayCanvas"
            :style="{
              display: isRecording ? 'block' : 'none',
              width: '100%',
              height: 'auto',
            }"
          ></canvas>
        </div>

        <canvas ref="canvas" style="display: none"></canvas>

        <div v-if="recordedVideoUrl" class="q-mt-md">
          <video
            :src="recordedVideoUrl"
            controls
            style="max-width: 100%"
          ></video>
          <div class="q-mt-sm">
            <q-btn-group size="sm">
              <q-btn
                @click="discardVideo"
                color="negative"
                size="sm"
                flat
                icon="delete"
                label="Discard"
              />
              <q-btn
                @click="shareToWhatsApp"
                color="positive"
                class="q-ml-sm"
                size="sm"
                icon="share"
                flat
                label="Share to WhatsApp"
              />
              <q-btn
                @click="downloadVideo"
                color="primary"
                class="q-ml-sm"
                size="sm"
                icon="download"
                flat
                label="Download Video"
              />
            </q-btn-group>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-dialog v-model="showWatermarkConfig">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Customize Video Overlay</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input
            v-model="watermarkConfig.imageSrc"
            label="Watermark Image URL"
          />
          <div class="row q-gutter-sm">
            <q-input
              v-model.number="watermarkConfig.imageX"
              type="number"
              label="X"
              style="width: 80px"
            />
            <q-input
              v-model.number="watermarkConfig.imageY"
              type="number"
              label="Y"
              style="width: 80px"
            />
            <q-input
              v-model.number="watermarkConfig.imageWidth"
              type="number"
              label="Width"
              style="width: 80px"
            />
            <q-input
              v-model.number="watermarkConfig.imageHeight"
              type="number"
              label="Height"
              style="width: 80px"
            />
          </div>
          <q-input v-model="watermarkConfig.text" label="Overlay Text" />
          <q-input v-model="watermarkConfig.textColor" label="Text Color" />
          <div class="row q-gutter-sm">
            <q-input
              v-model.number="watermarkConfig.textX"
              type="number"
              label="X"
              style="width: 80px"
            />
            <q-input
              v-model.number="watermarkConfig.textY"
              type="number"
              label="Y"
              style="width: 80px"
            />
          </div>
          <q-input
            v-model.number="watermarkConfig.textSize"
            type="number"
            label="Text Size"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { api } from 'src/boot/axios';
import { useUserStore } from 'src/stores/user-store';
import { copyToClipboard, openURL } from 'quasar';

const userStore = useUserStore();
const impactInfo = ref({
  referralId: '',
  peopleEncouraged: 0,
  locationsSecured: 0,
});

const videoPreview = ref<HTMLVideoElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const mediaRecorder = ref<MediaRecorder | null>(null);
const recordedChunks = ref<Blob[]>([]);
const isRecording = ref(false);
const recordedVideoUrl = ref('');

const overlayCanvas = ref<HTMLCanvasElement | null>(null);
const watermarkConfig = ref({
  imageSrc: '',
  imageX: 10,
  imageY: 10,
  imageWidth: 100,
  imageHeight: 100,
  text: '#SOSBharat',
  textColor: '#ffffff',
  textX: 20,
  textY: 40,
  textSize: 24,
});

const showWatermarkConfig = ref(false);
const canvasStream = ref<MediaStream | null>(null);

const drawOverlay = () => {
  if (!overlayCanvas.value || !videoPreview.value) return;
  const ctx = overlayCanvas.value.getContext('2d');
  if (!ctx) return;

  ctx.drawImage(
    videoPreview.value,
    0,
    0,
    overlayCanvas.value.width,
    overlayCanvas.value.height
  );

  // Draw text overlay
  ctx.fillStyle = watermarkConfig.value.textColor;
  ctx.font = `${watermarkConfig.value.textSize}px Arial`;
  ctx.fillText(
    watermarkConfig.value.text,
    watermarkConfig.value.textX,
    watermarkConfig.value.textY
  );

  // Draw image watermark if needed
  if (watermarkConfig.value.imageSrc) {
    // ... (existing image watermark code)
  }

  if (isRecording.value) {
    requestAnimationFrame(drawOverlay);
  }
};

watch(watermarkConfig, drawOverlay, { deep: true });

const startRecording = async () => {
  try {
    // Reset recorded video and chunks
    recordedVideoUrl.value = '';
    recordedChunks.value = [];

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    if (videoPreview.value) {
      videoPreview.value.srcObject = stream;
      videoPreview.value.onloadedmetadata = () => {
        if (overlayCanvas.value) {
          overlayCanvas.value.width = videoPreview.value!.videoWidth;
          overlayCanvas.value.height = videoPreview.value!.videoHeight;
        }
        drawOverlay();
      };
      await videoPreview.value.play();
    }

    if (!overlayCanvas.value) return;

    canvasStream.value = overlayCanvas.value.captureStream(30);
    const audioTrack = stream.getAudioTracks()[0];
    canvasStream.value.addTrack(audioTrack);

    mediaRecorder.value = new MediaRecorder(canvasStream.value);

    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.value.push(event.data);
      }
    };

    mediaRecorder.value.onstop = () => {
      const blob = new Blob(recordedChunks.value, { type: 'video/webm' });
      recordedVideoUrl.value = URL.createObjectURL(blob);
    };

    mediaRecorder.value.start();
    isRecording.value = true;
    drawOverlay();
  } catch (error) {
    console.error('Error accessing camera:', error);
  }
};

const stopRecording = () => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop();
    isRecording.value = false;
    const tracks = videoPreview.value?.srcObject as MediaStream;
    tracks?.getTracks().forEach((track) => track.stop());
    canvasStream.value?.getTracks().forEach((track) => track.stop());
  }
};

const discardVideo = () => {
  recordedVideoUrl.value = '';
  recordedChunks.value = [];
};

const shareToWhatsApp = () => {
  const message = encodeURIComponent(
    `Check out my impact with SOSBharat! ${window.location.origin}/#/login/${userStore.user.referralId}`
  );
  const whatsappUrl = `https://wa.me/?text=${message}`;
  openURL(whatsappUrl);
};

const downloadVideo = () => {
  if (recordedVideoUrl.value) {
    const a = document.createElement('a');
    a.href = recordedVideoUrl.value;
    a.download = 'recorded_video.webm';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};

onUnmounted(() => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop();
  }
});

const fetchImpactInfo = async () => {
  try {
    const response = await api.get('/leaderboard/referral-info');
    impactInfo.value = response.data;
  } catch (error) {
    console.error('Error fetching impact info', error);
  }
};

const copyReferralLink = () => {
  const url = `https://sosbharat.com/#/login/${userStore.user.referralId}`;
  copyToClipboard(url)
    .then(() => {
      alert('Referral link copied to clipboard!');
    })
    .catch((err) => {
      console.error('Failed to copy: ', err);
    });
};

onMounted(() => {
  fetchImpactInfo();
});

watch(
  videoPreview,
  (newValue) => {
    if (newValue) {
      newValue.onloadedmetadata = () => {
        if (overlayCanvas.value) {
          overlayCanvas.value.width = newValue.videoWidth;
          overlayCanvas.value.height = newValue.videoHeight;
        }
        drawOverlay();
      };
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.community-impact-page {
  max-width: 800px;
  margin: 0 auto;
}
.video-container {
  position: relative;
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
}
</style>
