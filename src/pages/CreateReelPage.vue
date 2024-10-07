<template>
  <q-page class="create-reel-page">
    <div
      class="aspect-ratio-container"
      v-if="!isPlayingRecordedVideo && !isRecording"
    >
      <q-btn v-if="!showAllAspectRatios" @click="toggleAspectRatios">
        <div style="font-weight: bolder; color: whitesmoke">
          {{ aspectRatioLabel }}
        </div>
      </q-btn>
      <q-btn
        class="q-mx-xs"
        style="font-weight: bolder; color: whitesmoke"
        v-if="showAllAspectRatios"
        @click="setAspectRatio('9:16')"
        label="9:16"
      />
      <q-btn
        class="q-mx-xs"
        style="font-weight: bolder; color: whitesmoke"
        v-if="showAllAspectRatios"
        @click="setAspectRatio('1:1')"
        label="1:1"
      />
      <q-btn
        class="q-mx-xs"
        style="font-weight: bolder; color: whitesmoke"
        v-if="showAllAspectRatios"
        @click="setAspectRatio('full')"
        label="Full"
      />
    </div>
    <div class="video-container">
      <video
        v-if="isPlayingRecordedVideo"
        ref="videoPlayer"
        class="video-preview"
        :src="recordedVideoUrl"
      >
        <track kind="captions" />
      </video>
      <canvas
        v-else
        ref="canvasPreview"
        :width="videoWidth"
        :height="videoHeight"
        class="video-preview"
      ></canvas>
      <video
        ref="videoPreview"
        autoplay
        playsinline
        muted
        class="hidden-video"
      ></video>
      <div class="recording-overlay" v-if="isRecording">
        <q-circular-progress
          show-value
          class="text-white q-ma-md"
          :value="remainingTime"
          size="50px"
          :thickness="0.2"
          color="white"
          track-color="primary"
        >
          {{ remainingTime }}
        </q-circular-progress>
      </div>
      <!-- Play/Pause Button -->
      <q-btn
        round
        v-if="isPlayingRecordedVideo"
        @click="togglePlayback"
        class="play-pause-btn"
      >
        <q-icon :name="isVideoPlaying ? 'mdi-pause' : 'mdi-play'" />
      </q-btn>
    </div>

    <div class="button-container">
      <q-btn size="sm" color="black" @click="switchCamera" class="rotate-btn">
        <q-icon style="font-size: 26px" name="mdi-orbit-variant"></q-icon>
      </q-btn>
      <q-btn
        size="sm"
        v-if="!isRecording && !isPlayingRecordedVideo"
        color="red"
        @click="startRecording"
        class="record-btn"
      >
        <q-icon style="font-size: 20px" name="fiber_manual_record"></q-icon>
      </q-btn>
      <q-btn
        size="sm"
        v-else-if="isRecording"
        color="negative"
        @click="stopRecording"
        class="stop-btn"
      >
        <q-icon style="font-size: 23px" name="stop"></q-icon>
      </q-btn>
      <q-btn
        size="sm"
        v-if="isPlayingRecordedVideo"
        color="black"
        @click="retakeVideo"
        class="retake-btn"
      >
        <q-icon style="font-size: 23px" name="refresh"></q-icon>
      </q-btn>
      <q-btn
        size="sm"
        color="blue"
        style="background-color: blue"
        @click="uploadReel"
        class="upload-btn"
      >
        <q-icon
          style="transform: rotate(-15deg); font-size: 20px"
          name="mdi-send"
        ></q-icon>
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
import { dom } from 'quasar';
const { height, width, style } = dom;

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
const videoWidth = ref(
  Math.min(window.innerWidth, (window.innerHeight / 16) * 9)
);
const videoHeight = ref((videoWidth.value * 16) / 9);

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
  const containerWidth = width(document.body);
  const containerHeight = height(document.body);

  let newWidth, newHeight;

  switch (aspectRatio.value) {
    case '1:1':
      newWidth = newHeight = Math.min(containerWidth, containerHeight);
      break;
    case 'full':
      newWidth = containerWidth;
      newHeight = containerHeight;
      break;
    case '9:16':
    default:
      if (containerWidth / containerHeight > 9 / 16) {
        newHeight = containerHeight;
        newWidth = (newHeight * 9) / 16;
      } else {
        newWidth = containerWidth;
        newHeight = (newWidth * 16) / 9;
      }
      break;
  }

  videoWidth.value = newWidth;
  videoHeight.value = newHeight;

  if (canvasPreview.value) {
    style(canvasPreview.value, {
      width: `${newWidth}px`,
      height: `${newHeight}px`,
    });
  }
};

// Call updateVideoDimensions initially to set the default size
updateVideoDimensions();
resetTimer(); // Start the timer on component mount

const initializeCamera = async () => {
  isPlayingRecordedVideo.value = false;
  try {
    await checkPermissions();
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
    });
    location.value = position;
  } catch (error) {
    console.error('Error getting location:', error);
  }
  await startCamera();
};

onMounted(() => {
  initializeCamera();
  window.addEventListener('resize', updateVideoDimensions);
});

const startCamera = async () => {
  try {
    const constraints = {
      video: {
        facingMode: currentCamera.value,
        aspectRatio:
          aspectRatio.value === '9:16'
            ? 9 / 16
            : aspectRatio.value === '1:1'
            ? 1
            : undefined,
      },
      audio: true,
    };

    stream.value = await navigator.mediaDevices.getUserMedia(constraints);

    if (videoPreview.value) {
      videoPreview.value.srcObject = stream.value;
      await videoPreview.value.play();
      updateVideoDimensions(); // Call this after setting up the stream
      drawVideoFrame();
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

const updateLocation = async () => {
  try {
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
    });
    location.value = position;
  } catch (error) {
    console.error('Error updating location:', error);
  }
};

const startRecording = async () => {
  if (recordedVideoUrl.value) {
    URL.revokeObjectURL(recordedVideoUrl.value);
    recordedVideoUrl.value = null;
  }
  recordedChunks.value = [];

  await updateLocation(); // Update location before starting to record

  if (!canvasPreview.value) {
    console.error('Canvas preview is not available');
    return;
  }

  const mediaStream = canvasPreview.value.captureStream(30); // Capture at 30 fps
  if (stream.value) {
    const audioTrack = stream.value.getAudioTracks()[0];
    if (audioTrack) {
      mediaStream.addTrack(audioTrack);
    }
  }

  mediaRecorder.value = new MediaRecorder(mediaStream, {
    mimeType: 'video/webm; codecs=vp8,opus',
  });

  mediaRecorder.value.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunks.value.push(event.data);
    }
  };

  mediaRecorder.value.onstop = () => {
    const blob = new Blob(recordedChunks.value, { type: 'video/webm' });
    recordedVideoUrl.value = URL.createObjectURL(blob);
    isPlayingRecordedVideo.value = true;
    // Stop the camera preview
    if (stream.value) {
      stream.value.getTracks().forEach((track) => track.stop());
    }
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
    // Update location every 10 seconds during recording
    if (remainingTime.value % 10 === 0) {
      updateLocation();
    }
  }, 1000);
};

const stopRecording = () => {
  if (mediaRecorder.value) {
    mediaRecorder.value.stop();
    isRecording.value = false;
    // Stop the camera stream
    if (stream.value) {
      stream.value.getTracks().forEach((track) => track.stop());
    }
  }
};

const drawVideoFrame = () => {
  if (videoPreview.value && canvasPreview.value) {
    const ctx = canvasPreview.value.getContext('2d')!;

    // Clear the canvas before drawing the new frame
    ctx.clearRect(0, 0, videoWidth.value, videoHeight.value);

    // Calculate the scaling factors
    const scaleX = videoWidth.value / videoPreview.value.videoWidth;
    const scaleY = videoHeight.value / videoPreview.value.videoHeight;
    const scale = Math.max(scaleX, scaleY);

    // Calculate the centered position
    const x = (videoWidth.value - videoPreview.value.videoWidth * scale) / 2;
    const y = (videoHeight.value - videoPreview.value.videoHeight * scale) / 2;

    // Draw the video frame
    ctx.drawImage(
      videoPreview.value,
      x,
      y,
      videoPreview.value.videoWidth * scale,
      videoPreview.value.videoHeight * scale
    );

    // Draw location and timestamp
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, videoHeight.value - 60, videoWidth.value, 60);
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    if (location.value) {
      ctx.fillText(
        `Lat: ${location.value.coords.latitude.toFixed(
          6
        )}, Lon: ${location.value.coords.longitude.toFixed(6)}`,
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
  initializeCamera(); // Restart the camera
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

onUnmounted(() => {
  if (stream.value) {
    stream.value.getTracks().forEach((track) => track.stop());
  }
  window.removeEventListener('resize', updateVideoDimensions);
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
  position: absolute; // Position it absolutely
  top: 10px; // Adjust as needed
  left: 0; // Start from the left
  right: 0; // End at the right
  margin: 0 auto; // Center it horizontally
  text-align: center; // Center text inside the overlay
  z-index: 5; // Ensure it is above other elements
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
