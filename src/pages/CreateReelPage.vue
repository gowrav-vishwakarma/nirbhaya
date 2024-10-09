<template>
  <q-page class="create-reel-page">
    <FullScreenLoader :isLoading="isUploading" />
    <!-- Add Back Button -->
    <q-btn size="sm" flat class="back-button" @click="goBack">
      <q-icon
        class="back-icon"
        name="mdi-arrow-left"
        :class="{ animate: backIconAnimation }"
      />
    </q-btn>
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
      <div
        class="pointer-overlay"
        v-if="!isPlayingRecordedVideo"
        @touchstart="handlePointerStart"
        @touchmove="handlePointerMove"
        @touchend="handlePointerEnd"
      ></div>
      <div class="zoom-slider-container" v-if="!isPlayingRecordedVideo">
        <q-slider
          v-model="zoomLevel"
          :min="1"
          :max="maxZoom"
          :step="0.1"
          vertical
          @change="handleZoom"
        />
      </div>
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
// import { useI18n } from 'vue-i18n';
import { dom } from 'quasar';
import FullScreenLoader from 'src/components/FullScreenLoader.vue'; // Import the loader component
const { height, width, style } = dom;

// const { t } = useI18n();
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

// New refs
const zoomLevel = ref(1);
const maxZoom = ref(1);
const pointerPosition = ref({ x: 0, y: 0 });
const isPointerVisible = ref(false);
let pointerTimeout: number | null = null;

const canvasRect = ref<DOMRect | null>(null);

const backIconAnimation = ref(false);
const blinkAnimation = ref(false);

const isUploading = ref(false); // New loading state

const startIconAnimation = () => {
  // Blink the icon for the first 3 seconds, only twice
  blinkAnimation.value = true;
  setTimeout(() => {
    blinkAnimation.value = false; // Stop blinking after 3 seconds
    backIconAnimation.value = true; // Start moving the icon
  }, 5000);

  // Move the icon every 5 seconds after the initial 3 seconds
  setInterval(() => {
    if (backIconAnimation.value) {
      backIconAnimation.value = false; // Reset to trigger animation
      setTimeout(() => {
        backIconAnimation.value = true; // Start moving again
      }, 100); // Short delay to allow the animation to reset
    }
  }, 5000); // Change every 5 seconds
};

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
    // Start camera immediately
    startCamera();
    // Fetch location in parallel
    updateLocation();
  } catch (error) {
    console.error('Error initializing camera:', error);
  }
};

onMounted(() => {
  initializeCamera();
  window.addEventListener('resize', () => {
    updateVideoDimensions();
    updateCanvasRect();
  });
  startIconAnimation(); // Start the animation when the component is mounted
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
    await initializePreview();
  } catch (error) {
    console.error('Error starting camera:', error);
    $q.notify({
      color: 'negative',
      message: 'Failed to start camera. Please check your permissions.',
      icon: 'error',
    });
  }
};

const initializePreview = async () => {
  if (videoPreview.value && stream.value) {
    videoPreview.value.srcObject = stream.value;
    await videoPreview.value.play();
    updateVideoDimensions();
    drawVideoFrame();
    initializeZoom();
    updateCanvasRect();
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
    // Set location to null if there's an error
    location.value = null;
  }
};

const startRecording = async () => {
  if (recordedVideoUrl.value) {
    URL.revokeObjectURL(recordedVideoUrl.value);
    recordedVideoUrl.value = null;
  }
  recordedChunks.value = [];

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

  // Start updating location in parallel
  updateLocation();

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
    const ctx = canvasPreview.value.getContext('2d');

    // Clear the canvas before drawing the new frame
    ctx.clearRect(0, 0, videoWidth.value, videoHeight.value);

    // Calculate the scaling factors
    const scaleX = videoWidth.value / videoPreview.value.videoWidth;
    const scaleY = videoHeight.value / videoPreview.value.videoHeight;
    const scale = Math.max(scaleX, scaleY);

    // Calculate the centered position
    const x = (videoWidth.value - videoPreview.value.videoWidth * scale) / 2;
    const y = (videoHeight.value - videoPreview.value.videoHeight * scale) / 2;

    // Save the current context state
    ctx.save();

    // Flip the image horizontally if using the front-facing camera
    if (currentCamera.value === 'user') {
      ctx.scale(-1, 1);
      ctx.translate(-videoWidth.value, 0);
    }

    // Draw the video frame
    ctx.drawImage(
      videoPreview.value,
      x,
      y,
      videoPreview.value.videoWidth * scale,
      videoPreview.value.videoHeight * scale
    );

    // Restore the context state
    ctx.restore();

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
    } else {
      ctx.fillText('Location unavailable', 10, videoHeight.value - 40);
    }
    ctx.fillText(new Date().toLocaleString(), 10, videoHeight.value - 20);

    // Draw pointer if visible
    if (isPointerVisible.value) {
      ctx.beginPath();
      ctx.arc(
        pointerPosition.value.x,
        pointerPosition.value.y,
        10,
        0,
        2 * Math.PI
      );
      ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.fill();
    }

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
  // if (recordedChunks.value.length === 0) return;

  const blob = new Blob(recordedChunks.value, { type: 'video/webm' });
  const fileName = `incident_${Date.now()}.webm`;

  try {
    isUploading.value = true; // Set loading state to true

    // Get presigned URL
    const {
      data: { presignedUrl },
    } = await api.get('/incidents/get-presigned-url', {
      params: {
        fileName,
        contentType: 'video/webm',
      },
    });

    // Upload video to presigned URL
    await fetch(presignedUrl, {
      method: 'PUT',
      body: blob,
      headers: {
        'Content-Type': 'video/webm',
        'x-amz-acl': 'public-read',
      },
    });

    // Create incident record
    const formData = {
      videoUrl: presignedUrl.split('?')[0],
    };

    // Include location data if available
    if (location.value) {
      formData.latitude = location.value.coords.latitude.toString();
      formData.longitude = location.value.coords.longitude.toString();
    }

    await api.post('/incidents/upload', formData);

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
  } finally {
    isUploading.value = false; // Reset loading state
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

const handleZoom = () => {
  if (videoPreview.value && stream.value) {
    const track = stream.value.getVideoTracks()[0];
    const capabilities = track.getCapabilities();

    if ('zoom' in capabilities) {
      track
        .applyConstraints({ advanced: [{ zoom: zoomLevel.value }] })
        .catch((error) => {
          console.error('Error applying zoom:', error);
        });
    } else {
      // Digital zoom implementation
      const scale = zoomLevel.value;
      const translateX = (videoWidth.value * (1 - scale)) / 2;
      const translateY = (videoHeight.value * (1 - scale)) / 2;
      if (canvasPreview.value) {
        canvasPreview.value.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
      }
    }
  }
};

const initializeZoom = () => {
  if (stream.value) {
    const track = stream.value.getVideoTracks()[0];
    const capabilities = track.getCapabilities();
    if ('zoom' in capabilities) {
      maxZoom.value = capabilities.zoom.max || 1;
    } else {
      maxZoom.value = 3; // Set a default max digital zoom
    }
    zoomLevel.value = 1; // Reset zoom level
  }
};

const handlePointerStart = (event: TouchEvent) => {
  if (!canvasRect.value) return;
  const touch = event.touches[0];
  const x = touch.clientX - canvasRect.value.left;
  const y = touch.clientY - canvasRect.value.top;
  if (
    x >= 0 &&
    x <= canvasRect.value.width &&
    y >= 0 &&
    y <= canvasRect.value.height
  ) {
    pointerPosition.value = { x, y };
    isPointerVisible.value = true;
    if (pointerTimeout) clearTimeout(pointerTimeout);
    pointerTimeout = setTimeout(() => {
      isPointerVisible.value = false;
    }, 3000);
  }
};

const handlePointerMove = (event: TouchEvent) => {
  if (!canvasRect.value || !isPointerVisible.value) return;
  const touch = event.touches[0];
  const x = touch.clientX - canvasRect.value.left;
  const y = touch.clientY - canvasRect.value.top;
  if (
    x >= 0 &&
    x <= canvasRect.value.width &&
    y >= 0 &&
    y <= canvasRect.value.height
  ) {
    pointerPosition.value = { x, y };
  }
};

const handlePointerEnd = () => {
  if (pointerTimeout) clearTimeout(pointerTimeout);
  pointerTimeout = setTimeout(() => {
    isPointerVisible.value = false;
  }, 3000);
};

const updateCanvasRect = () => {
  if (canvasPreview.value) {
    canvasRect.value = canvasPreview.value.getBoundingClientRect();
  }
};

onUnmounted(() => {
  if (stream.value) {
    stream.value.getTracks().forEach((track) => track.stop());
  }
  window.removeEventListener('resize', updateVideoDimensions);
  if (pointerTimeout) clearTimeout(pointerTimeout);
});

// Function to handle back navigation
const goBack = () => {
  console.log('Back button clicked'); // Debugging log
  router.push('/incident-reels'); // Go back to the previous page
};
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
  width: 70%; // Full width to center buttons
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

.pointer-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  /* Lower z-index to allow interaction with buttons */
}

.button-container {
  /* ... other styles ... */
  z-index: 3;
  /* Higher z-index to ensure buttons are clickable */
}

.zoom-slider-container {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  height: 150px;
  z-index: 10;
}

.back-button {
  position: absolute;
  top: 25px;
  left: 10px;
  z-index: 4;
  background-color: rgba(0, 0, 0, 0.705);
  border-radius: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: whitesmoke;
}

.back-icon {
  animation: blink 0.5s ease forwards; // Blink animation for 2 times

  &.animate {
    animation: moveIcon 1s ease forwards; // Apply the animation when class is added
  }

  @keyframes blink {
    0%,
    100% {
      opacity: 1; // Fully visible
    }

    50% {
      opacity: 0; // Invisible
    }
  }

  @keyframes moveIcon {
    0% {
      transform: translateX(0); // Start position
    }

    50% {
      transform: translateX(-10px); // Move left
    }

    100% {
      transform: translateX(0); // Return to start position
    }
  }
}
</style>
