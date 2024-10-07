<template>
  <q-page class="create-reel-page">
    <div class="aspect-ratio-container" v-if="!isPlayingRecordedVideo">
      <q-btn v-if="!showAllAspectRatios" @click="toggleAspectRatios">
        <div style="font-weight: bolder; color: whitesmoke;">
          {{ aspectRatioLabel }}
        </div>
      </q-btn>
      <q-btn class="q-mx-xs" style="font-weight: bolder; color: whitesmoke;" v-if="showAllAspectRatios"
        @click="setAspectRatio('9:16')" label="9:16" />
      <q-btn class="q-mx-xs" style="font-weight: bolder; color: whitesmoke;" v-if="showAllAspectRatios"
        @click="setAspectRatio('1:1')" label="1:1" />
      <q-btn class="q-mx-xs" style="font-weight: bolder; color: whitesmoke;" v-if="showAllAspectRatios"
        @click="setAspectRatio('full')" label="Full" />
    </div>
    <div class="video-container">
      <video v-if="!isRecording && isPlayingRecordedVideo" ref="videoPlayer" class="video-preview"
        :src="recordedVideoUrl">
        <track kind="captions" />
      </video>
      <canvas v-else ref="canvasPreview" :width="videoWidth" :height="videoHeight" class="video-preview"></canvas>
      <video ref="videoPreview" autoplay playsinline muted class="hidden-video"></video>
      <div class="recording-overlay" v-if="isRecording">
        <q-circular-progress show-value class="text-white q-ma-md" :value="remainingTime" size="50px" :thickness="0.2"
          color="white" track-color="primary">
          {{ remainingTime }}
        </q-circular-progress>
      </div>
      <!-- Play/Pause Button -->
      <q-btn round v-if="isPlayingRecordedVideo" @click="togglePlayback" class="play-pause-btn">
        <q-icon :name="isVideoPlaying ? 'mdi-pause' : 'mdi-play'" />
      </q-btn>
    </div>

    <div class="button-container">
      <q-btn size="sm" color="black" @click="switchCamera" class="rotate-btn">
        <q-icon style="font-size: 26px;" name="mdi-orbit-variant"></q-icon>
      </q-btn>
      <q-btn size="sm" v-if="!isRecording && !isPlayingRecordedVideo" color="red" @click="startRecording"
        class="record-btn">
        <q-icon style="font-size: 20px;" name="fiber_manual_record"></q-icon>
      </q-btn>
      <q-btn size="sm" v-else-if="isRecording" color="negative" @click="stopRecording" class="stop-btn">
        <q-icon style="font-size: 23px;" name="stop"></q-icon>
      </q-btn>
      <q-btn size="sm" v-if="isPlayingRecordedVideo" color="black" @click="retakeVideo" class="retake-btn">
        <q-icon style="font-size: 23px;" name="refresh"></q-icon>
      </q-btn>
      <q-btn size="sm" color="blue" style="background-color:blue;" @click="uploadReel" class="upload-btn">
        <q-icon style="transform: rotate(-15deg); font-size: 20px;" name="mdi-send"></q-icon>
      </q-btn>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { api } from 'src/boot/axios';
import { usePermissions } from 'src/composables/usePermissions';
import { Geolocation } from '@capacitor/geolocation';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const $q = useQuasar();
const router = useRouter();
const { checkPermissions } = usePermissions();

const isRecording = ref(false);
const mediaRecorder = ref<MediaRecorder | null>(null);
const recordedChunks = ref<Blob[]>([]);
const videoPreview = ref<HTMLVideoElement | null>(null);
const canvasPreview = ref<HTMLCanvasElement | null>(null);
const stream = ref<MediaStream | null>(null);
const currentCamera = ref('user');
const remainingTime = ref(60);
const location = ref<GeolocationPosition | null>(null);

const videoPlayer = ref<HTMLVideoElement | null>(null);
const recordedVideoUrl = ref<string | null>(null);

const isPlayingRecordedVideo = ref(false);

// Set video dimensions for 1:16 aspect ratio
const videoWidth = ref(Math.min(window.innerWidth, window.innerHeight / 16 * 9));
const videoHeight = ref(videoWidth.value * 16 / 9);

const aspectRatio = ref('9:16'); // Default aspect ratio

const showAllAspectRatios = ref(false);
const aspectRatioLabel = ref('9:16'); // Default label
let timer: ReturnType<typeof setTimeout> | null = null;

const isVideoPlaying = ref(false); // Track if the video is playing

const setAspectRatio = (ratio: string) => {
  aspectRatio.value = ratio;
  aspectRatioLabel.value = ratio; // Update the label to the selected ratio
  updateVideoDimensions();
  resetTimer(); // Reset the timer when an aspect ratio is selected
  showAllAspectRatios.value = false; // Hide the other buttons after selection
};

const toggleAspectRatios = () => {
  showAllAspectRatios.value = !showAllAspectRatios.value;
  resetTimer(); // Reset the timer when toggling
};

const resetTimer = () => {
  if (timer) {
    clearTimeout(timer);
  }
  timer = setTimeout(() => {
    showAllAspectRatios.value = false; // Hide the buttons after 5 seconds
  }, 5000);
};

const updateVideoDimensions = () => {
  switch (aspectRatio.value) {
    case '1:1':
      videoWidth.value = Math.min(window.innerWidth, window.innerHeight);
      videoHeight.value = videoWidth.value; // Square
      break;
    case 'full':
      videoWidth.value = window.innerWidth;
      videoHeight.value = window.innerHeight; // Full screen
      break;
    case '9:16':
    default:
      videoWidth.value = Math.min(window.innerWidth, window.innerHeight / 16 * 9);
      videoHeight.value = videoWidth.value * 16 / 9; // 9:16 aspect ratio
      break;
  }
};

// Call updateVideoDimensions initially to set the default size
updateVideoDimensions();
resetTimer(); // Start the timer on component mount

const startCamera = async () => {
  try {
    const constraints = {
      video: {
        facingMode: currentCamera.value,
        width: { ideal: videoWidth.value },
        height: { ideal: videoHeight.value },
      },
      audio: true,
    };

    stream.value = await navigator.mediaDevices.getUserMedia(constraints);

    if (videoPreview.value) {
      videoPreview.value.srcObject = stream.value;
      videoPreview.value.onloadedmetadata = () => {
        videoPreview.value!.play();
        drawVideoFrame();
      };
    }
  } catch (error) {
    console.error('Error starting camera:', error);
    $q.notify({
      color: 'negative',
      message: 'Failed to start camera. Please check your permissions.',
      icon: 'error',
    });
  }
};

const switchCamera = async () => {
  currentCamera.value = currentCamera.value === 'user' ? 'environment' : 'user';
  if (stream.value) {
    stream.value.getTracks().forEach((track) => track.stop());
  }
  await startCamera();
};

const startRecording = async () => {
  if (recordedVideoUrl.value) {
    URL.revokeObjectURL(recordedVideoUrl.value);
    recordedVideoUrl.value = null;
  }
  recordedChunks.value = [];

  const mediaStream = canvasPreview.value!.captureStream(30);
  const audioTrack = stream.value!.getAudioTracks()[0];
  mediaStream.addTrack(audioTrack);

  mediaRecorder.value = new MediaRecorder(mediaStream, {
    mimeType: 'video/webm; codecs=vp8,opus',
  });

  mediaRecorder.value.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunks.value.push(event.data);
    }
  };

  mediaRecorder.value.onstop = () => {
    isRecording.value = false;
    const blob = new Blob(recordedChunks.value, { type: 'video/webm' });
    recordedVideoUrl.value = URL.createObjectURL(blob);
    isPlayingRecordedVideo.value = true;
  };

  mediaRecorder.value.start(1000 / 30);
  isRecording.value = true;
  remainingTime.value = 60;

  const countdownInterval = setInterval(() => {
    remainingTime.value--;
    if (remainingTime.value <= 0) {
      clearInterval(countdownInterval);
      stopRecording();
    }
  }, 1000);
};

const stopRecording = () => {
  if (mediaRecorder.value) {
    mediaRecorder.value.stop();
  }
};

const drawVideoFrame = () => {
  if (videoPreview.value && canvasPreview.value && !isPlayingRecordedVideo.value) {
    const ctx = canvasPreview.value.getContext('2d')!;
    const aspectRatio = 9 / 16;
    let drawWidth = videoPreview.value.videoWidth;
    let drawHeight = videoPreview.value.videoWidth / aspectRatio;
    let offsetX = 0;
    let offsetY = (videoPreview.value.videoHeight - drawHeight) / 2;

    if (drawHeight > videoPreview.value.videoHeight) {
      drawHeight = videoPreview.value.videoHeight;
      drawWidth = videoPreview.value.videoHeight * aspectRatio;
      offsetX = (videoPreview.value.videoWidth - drawWidth) / 2;
      offsetY = 0;
    }

    ctx.drawImage(
      videoPreview.value,
      offsetX, offsetY, drawWidth, drawHeight,
      0, 0, videoWidth.value, videoHeight.value
    );

    // Draw location and timestamp
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, videoHeight.value - 60, videoWidth.value, 60);
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    if (location.value) {
      ctx.fillText(
        `Lat: ${location.value.coords.latitude.toFixed(6)}, Lon: ${location.value.coords.longitude.toFixed(6)}`,
        10,
        videoHeight.value - 40
      );
    }
    ctx.fillText(new Date().toLocaleString(), 10, videoHeight.value - 20);

    requestAnimationFrame(drawVideoFrame);
  }
};

const retakeVideo = () => {
  if (recordedVideoUrl.value) {
    URL.revokeObjectURL(recordedVideoUrl.value);
  }
  recordedVideoUrl.value = null;
  isPlayingRecordedVideo.value = false;
  recordedChunks.value = [];
  startCamera();
};

const uploadReel = async () => {
  if (recordedChunks.value.length === 0) return;

  const blob = new Blob(recordedChunks.value, { type: 'video/webm' });
  const formData = new FormData();
  formData.append('video', blob, 'incident.webm');

  try {
    await api.post('/incidents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    $q.notify({
      color: 'positive',
      message: 'Incident reel uploaded successfully',
      icon: 'check',
    });
    router.push('/incident-reels');
  } catch (error) {
    console.error('Error uploading incident reel:', error);
    $q.notify({
      color: 'negative',
      message: 'Failed to upload incident reel. Please try again.',
      icon: 'error',
    });
  }

  recordedChunks.value = [];
};

const togglePlayback = () => {
  if (videoPlayer.value) {
    if (isVideoPlaying.value) {
      videoPlayer.value.pause();
    } else {
      videoPlayer.value.play().catch((error) => {
        console.error('Error playing video:', error);
        $q.notify({
          color: 'negative',
          message: 'Failed to play video. Please try again.',
          icon: 'error',
        });
      });
    }
    isVideoPlaying.value = !isVideoPlaying.value; // Toggle the playing state
  }
};

onMounted(() => {
  checkPermissions().then(() => {
    Geolocation.getCurrentPosition({ enableHighAccuracy: true })
      .then((position) => {
        location.value = position;
        startCamera();
      })
      .catch((error) => {
        console.error('Error getting location:', error);
        startCamera();
      });
  });
});

onUnmounted(() => {
  if (stream.value) {
    stream.value.getTracks().forEach((track) => track.stop());
  }
});
</script>

<style lang="scss" scoped>
.create-reel-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: space-between; // Space out the content
}

.aspect-ratio-container {
  display: flex;
  justify-content: center;
  margin-top: 10px; // Set margin from the top
  position: absolute; // Position it absolutely
  top: 10px; // Always 10px from the top
  width: 100%; // Full width to center buttons
  z-index: 111;
}

.video-container {
  position: relative;
  width: v-bind(videoWidth + 'px');
  height: v-bind(videoHeight + 'px');
  overflow: hidden;
  flex-grow: 1; // Allow this to grow and take available space
  display: flex; // Use flexbox to center the video
  justify-content: center; // Center horizontally
  align-items: center; // Center vertically
}

.button-container {
  display: flex;
  justify-content: space-around;
  width: 85%;
  padding: 5px;
  background-color: rgba(0, 0, 0, 0.7); // Semi-transparent background
  border-radius: 10px; // Rounded corners for the button container
  margin-bottom: 20px; // Space from the bottom
  position: absolute; // Position it absolutely
  bottom: 0; // Always at the bottom
  left: 50%; // Center horizontally
  transform: translateX(-50%); // Adjust for centering
}

.video-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hidden-video {
  position: absolute;
  top: -9999px;
  left: -9999px;
}

.recording-overlay {
  position: absolute;
  top: 10px;
  right: 10px;
}

.record-btn,
.stop-btn,
.play-btn,
.retake-btn,
.rotate-btn,
.upload-btn {
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 24px;
}

.play-pause-btn {
  position: absolute; // Position it absolutely
  color: whitesmoke;
  top: 50%; // Center vertically
  left: 50%; // Center horizontally
  transform: translate(-50%, -50%); // Adjust for centering
  z-index: 10; // Ensure it is above other elements
  background-color: rgba(0, 0, 0, 0.705);
  height: 70px;
  width: 70px;
  font-size: large;

}
</style>
