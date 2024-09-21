<template>
  <div class="community-impact-page">
    <h5>{{ $t('common.communityImpact') }}</h5>
    <p>
      {{ $t('common.yourReferralId') }}:
      <b
        ><span class="text-primary text-weight-bold text-h4">{{
          userStore.user.referralId
        }}</span></b
      >
    </p>
    <p>
      {{ $t('common.peopleYouHaveEncouraged') }}:
      {{ impactInfo.peopleEncouraged }}
    </p>
    <p>
      {{ $t('common.locationsSecured') }}: {{ impactInfo.locationsSecured }}
    </p>
    <!-- Copy URL -->
    <p>
      Share your impact:
      <button @click="copyReferralLink">Copy Referral Link</button>
    </p>

    <!-- Watermark and Overlay Configuration -->
    <div class="q-mt-md">
      <h6>Customize Video Overlay</h6>
      <q-input v-model="watermarkConfig.imageSrc" label="Watermark Image URL" />
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
    </div>

    <!-- Video Recording Section -->
    <div class="video-section q-mt-md">
      <q-btn @click="startRecording" color="primary" :disable="isRecording">
        {{ isRecording ? 'Recording...' : 'Record Video Message' }}
      </q-btn>
      <q-btn
        @click="stopRecording"
        color="negative"
        :disable="!isRecording"
        class="q-ml-sm"
      >
        Stop Recording
      </q-btn>
    </div>

    <div class="video-container q-mt-sm" style="position: relative">
      <video ref="videoPreview" style="max-width: 100%" autoplay muted></video>
      <canvas
        ref="overlayCanvas"
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%"
      ></canvas>
    </div>

    <canvas ref="canvas" style="display: none"></canvas>

    <div v-if="recordedVideoUrl" class="q-mt-md">
      <video :src="recordedVideoUrl" controls style="max-width: 100%"></video>
      <div class="q-mt-sm">
        <q-btn @click="discardVideo" color="negative" flat>Discard</q-btn>
        <q-btn @click="shareToWhatsApp" color="positive" class="q-ml-sm"
          >Share to WhatsApp</q-btn
        >
        <q-btn @click="downloadVideo" color="primary" class="q-ml-sm"
          >Download Video</q-btn
        >
      </div>
    </div>
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

const drawOverlay = () => {
  if (!overlayCanvas.value || !videoPreview.value) return;
  const ctx = overlayCanvas.value.getContext('2d');
  if (!ctx) return;

  overlayCanvas.value.width =
    videoPreview.value.videoWidth || videoPreview.value.clientWidth;
  overlayCanvas.value.height =
    videoPreview.value.videoHeight || videoPreview.value.clientHeight;

  ctx.clearRect(0, 0, overlayCanvas.value.width, overlayCanvas.value.height);

  // Draw image watermark
  if (watermarkConfig.value.imageSrc) {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(
        img,
        watermarkConfig.value.imageX,
        watermarkConfig.value.imageY,
        watermarkConfig.value.imageWidth,
        watermarkConfig.value.imageHeight
      );
    };
    img.src = watermarkConfig.value.imageSrc;
  }

  // Draw text overlay
  ctx.fillStyle = watermarkConfig.value.textColor;
  ctx.font = `${watermarkConfig.value.textSize}px Arial`;
  ctx.fillText(
    watermarkConfig.value.text,
    watermarkConfig.value.textX,
    watermarkConfig.value.textY
  );
};

watch(watermarkConfig.value, drawOverlay, { deep: true });

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    if (videoPreview.value) {
      videoPreview.value.srcObject = stream;
      videoPreview.value.onloadedmetadata = () => {
        drawOverlay();
      };
    }
    mediaRecorder.value = new MediaRecorder(stream);
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
    addWatermark();
  }
};

const addWatermark = () => {
  if (!videoPreview.value) return;

  const tempVideo = document.createElement('video');
  tempVideo.src = recordedVideoUrl.value;
  tempVideo.onloadedmetadata = () => {
    if (!canvas.value) return;
    const ctx = canvas.value.getContext('2d');
    if (!ctx) return;

    canvas.value.width = tempVideo.videoWidth;
    canvas.value.height = tempVideo.videoHeight;

    const stream = canvas.value.captureStream();
    const newMediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm',
    });
    const newChunks: Blob[] = [];

    newMediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        newChunks.push(e.data);
      }
    };

    newMediaRecorder.onstop = () => {
      const blob = new Blob(newChunks, { type: 'video/webm' });
      recordedVideoUrl.value = URL.createObjectURL(blob);
    };

    const drawFrame = () => {
      ctx.drawImage(tempVideo, 0, 0, canvas.value!.width, canvas.value!.height);

      // Apply watermark and overlay
      if (watermarkConfig.value.imageSrc) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(
            img,
            watermarkConfig.value.imageX,
            watermarkConfig.value.imageY,
            watermarkConfig.value.imageWidth,
            watermarkConfig.value.imageHeight
          );
        };
        img.src = watermarkConfig.value.imageSrc;
      }

      ctx.fillStyle = watermarkConfig.value.textColor;
      ctx.font = `${watermarkConfig.value.textSize}px Arial`;
      ctx.fillText(
        watermarkConfig.value.text,
        watermarkConfig.value.textX,
        watermarkConfig.value.textY
      );

      if (!tempVideo.paused && !tempVideo.ended) {
        requestAnimationFrame(drawFrame);
      } else {
        newMediaRecorder.stop();
      }
    };

    newMediaRecorder.start();
    tempVideo.play();
    drawFrame();
  };
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
  () => {
    if (videoPreview.value) {
      videoPreview.value.onloadedmetadata = drawOverlay;
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.community-impact-page {
  padding: 16px;
}
.video-container {
  position: relative;
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
}
</style>
