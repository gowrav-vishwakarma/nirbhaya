<template>
  <q-page class="create-reel-page">
    <div class="video-container">
      <template v-if="!isPlayingRecordedVideo">
        <video ref="videoPreview" autoplay playsinline class="video-preview" muted></video>
        <canvas ref="canvasPreview" width="1280" height="720" class="video-preview"></canvas>
        <video v-if="secondaryStream" ref="secondaryVideo" autoplay playsinline class="secondary-video"></video>
      </template>
      <video v-else ref="videoPlayer" class="recorded-video" controls :src="recordedVideoUrl"></video>
      <div class="recording-overlay" v-if="isRecording">
        <q-circular-progress show-value class="text-white q-ma-md" :value="remainingTime" size="50px" :thickness="0.2"
          color="white" track-color="primary">
          {{ remainingTime }}
        </q-circular-progress>
      </div>
    </div>
    <q-page-sticky position="bottom" :offset="[0, 18]">
      <div class="button-container">
        <q-btn size="sm" v-if="!isRecording && !isPlayingRecordedVideo" color="red" @click="startRecording"
          class="record-btn">
          <q-icon name="fiber_manual_record"></q-icon>
        </q-btn>
        <q-btn size="sm" v-else-if="isRecording" color="negative" @click="stopRecording" class="stop-btn">
          <q-icon name="stop"></q-icon>

        </q-btn>
        <q-btn size="sm" v-else-if="isPlayingRecordedVideo && isVideoReady" color="secondary" @click="playRecordedVideo"
          class="play-btn">
          <q-icon name="play_arrow"></q-icon>
        </q-btn>
        <q-btn size="sm" v-if="isPlayingRecordedVideo" color="warning" @click="retakeVideo" class="retake-btn">
          <q-icon name="refresh"></q-icon>

        </q-btn>
        <q-btn size="sm" color="secondary" @click="switchCamera" class="rotate-btn">
          <q-icon name="mdi-rotate-3d-variant"></q-icon>
        </q-btn>
        <q-btn size="sm" color="blue" style="background-color:blue;" @click="uploadReel" class="upload-btn">
          <q-icon name="mdi-send"></q-icon>
        </q-btn>
      </div>
    </q-page-sticky>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { api } from 'src/boot/axios';
import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
import { usePermissions } from 'src/composables/usePermissions';
import { Geolocation } from '@capacitor/geolocation';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const $q = useQuasar();
const router = useRouter();
const { checkPermissions, requestPermission, permissions } = usePermissions();

const isRecording = ref(false);
const mediaRecorder = ref<MediaRecorder | null>(null);
const recordedChunks = ref<Blob[]>([]);
const videoPreview = ref<HTMLVideoElement | null>(null);
const canvasPreview = ref<HTMLCanvasElement | null>(null);
const stream = ref<MediaStream | null>(null);
const currentCamera = ref('user');
const availableCameras = ref<MediaDeviceInfo[]>([]);
const secondaryStream = ref<MediaStream | null>(null);
const secondaryVideo = ref<HTMLVideoElement | null>(null);
const remainingTime = ref(60);
const location = ref<GeolocationPosition | null>(null);

const muxer = ref<Muxer | null>(null);
const videoEncoder = ref<VideoEncoder | null>(null);
const audioEncoder = ref<AudioEncoder | null>(null);

const videoPlayer = ref<HTMLVideoElement | null>(null);
const recordedVideoUrl = ref<string | null>(null);

const isReady = computed(
  () => stream.value !== null && location.value !== null
);

const isPlayingRecordedVideo = ref(false);
const isVideoReady = ref(false);

const checkAndRequestPermissions = async () => {
  await checkPermissions();

  const requiredPermissions = [
    'common.camera',
    'common.microphone',
    'common.location',
  ];
  const missingPermissions = requiredPermissions.filter(
    (perm) => !permissions.value.find((p) => p.name === perm && p.granted)
  );

  if (missingPermissions.length > 0) {
    for (const perm of missingPermissions) {
      const granted = await requestPermission(perm);
      if (!granted) {
        $q.notify({
          color: 'negative',
          message: `${t(perm)} ${t('common.permissionRequired')}`,
          icon: 'error',
        });
        router.push('/');
        return;
      }
    }
  }

  await getLocation();
  await setupMediaDevices();
};

const getLocation = async () => {
  try {
    location.value = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
    });
  } catch (error) {
    console.error('Error getting location:', error);
    $q.notify({
      color: 'negative',
      message: 'Failed to get location. Please try again.',
      icon: 'error',
    });
  }
};

const setupMediaDevices = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    availableCameras.value = devices.filter(
      (device) => device.kind === 'videoinput'
    );
    if (availableCameras.value.length > 0) {
      currentCamera.value = availableCameras.value[0].deviceId;
    }
    await startCamera();
  } catch (error) {
    console.error('Error setting up media devices:', error);
    $q.notify({
      color: 'negative',
      message: 'Failed to set up camera. Please try again.',
      icon: 'error',
    });
  }
};

const startCamera = async () => {
  try {
    stream.value = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: currentCamera.value },
      audio: true,
    });
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

const toggleSecondaryCamera = async () => {
  if (secondaryStream.value) {
    secondaryStream.value.getTracks().forEach((track) => track.stop());
    secondaryStream.value = null;
  } else {
    try {
      const unusedCamera = availableCameras.value.find(
        (camera) =>
          camera.deviceId !==
          stream.value?.getVideoTracks()[0].getSettings().deviceId
      );
      if (unusedCamera) {
        secondaryStream.value = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: unusedCamera.deviceId },
          audio: false,
        });
        if (secondaryVideo.value) {
          secondaryVideo.value.srcObject = secondaryStream.value;
        }
      }
    } catch (error) {
      console.error('Error starting secondary camera:', error);
      $q.notify({
        color: 'negative',
        message: 'Failed to start secondary camera.',
        icon: 'error',
      });
    }
  }
};

const getSupportedMimeType = (): { mimeType: string; needsMuxing: boolean } => {
  const types = [
    'video/mp4;codecs=avc1,mp4a.40.2',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp9,opus',
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return {
        mimeType: type,
        // needsMuxing: !type.startsWith('video/mp4'),
        needsMuxing: false,
      };
    }
  }

  throw new Error('No supported MIME type found');
};

const startRecording = async () => {
  // Discard old video if exists
  if (recordedVideoUrl.value) {
    URL.revokeObjectURL(recordedVideoUrl.value);
    recordedVideoUrl.value = null;
  }
  recordedChunks.value = [];

  const { mimeType, needsMuxing } = getSupportedMimeType();

  if (needsMuxing) {
    initializeMuxer();
  }

  const mediaStream = canvasPreview.value!.captureStream(30);
  const audioTrack = stream.value!.getAudioTracks()[0];
  mediaStream.addTrack(audioTrack);

  mediaRecorder.value = new MediaRecorder(mediaStream, { mimeType });

  mediaRecorder.value.ondataavailable = async (event) => {
    if (event.data.size > 0) {
      recordedChunks.value.push(event.data);
      if (needsMuxing) {
        const arrayBuffer = await event.data.arrayBuffer();
        muxer.value!.addVideoChunk(
          new EncodedVideoChunk({
            type: 'key',
            data: new Uint8Array(arrayBuffer),
            timestamp: event.timecode * 1000,
            duration: 1000000 / 30,
          })
        );
      }
    }
  };

  mediaRecorder.value.start(1000 / 30); // Start recording at 30 fps
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
    mediaRecorder.value.onstop = async () => {
      isRecording.value = false;
      let blob: Blob;

      if (muxer.value) {
        muxer.value.finalize();
        const { buffer } = muxer.value.target as ArrayBufferTarget;
        blob = new Blob([buffer], { type: 'video/mp4' });
      } else {
        blob = new Blob(recordedChunks.value, {
          type: mediaRecorder.value!.mimeType,
        });
      }

      recordedVideoUrl.value = URL.createObjectURL(blob);

      // Show the recorded video immediately
      isPlayingRecordedVideo.value = true;
      if (videoPlayer.value) {
        videoPlayer.value.src = recordedVideoUrl.value;
        videoPlayer.value.onloadedmetadata = () => {
          isVideoReady.value = true;
          videoPlayer.value!.play(); // Autoplay the video once it's ready
        };
      }
    };
  }
};

const initializeMuxer = () => {
  muxer.value = new Muxer({
    target: new ArrayBufferTarget(),
    video: {
      codec: 'avc',
      width: 1280,
      height: 720,
    },
    audio: {
      codec: 'aac',
      numberOfChannels: 2,
      sampleRate: 44100,
    },
    fastStart: 'in-memory',
  });
};

const uploadReel = async () => {
  if (!muxer.value && recordedChunks.value.length === 0) return;

  let blob: Blob;

  if (muxer.value) {
    const { buffer } = muxer.value.target as ArrayBufferTarget;
    blob = new Blob([buffer], { type: 'video/mp4' });
  } else {
    blob = new Blob(recordedChunks.value, {
      type: mediaRecorder.value!.mimeType,
    });
  }

  const formData = new FormData();
  formData.append('video', blob, 'incident.mp4');

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

  // Reset after upload
  muxer.value = null;
  recordedChunks.value = [];
};

const drawVideoFrame = () => {
  if (videoPreview.value && canvasPreview.value) {
    const ctx = canvasPreview.value.getContext('2d')!;
    ctx.drawImage(
      videoPreview.value,
      0,
      0,
      canvasPreview.value.width,
      canvasPreview.value.height
    );

    // Draw secondary video if available
    if (secondaryVideo.value && secondaryStream.value) {
      ctx.drawImage(secondaryVideo.value, 10, 10, 120, 90);
    }

    // Draw location and timestamp
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(
      0,
      canvasPreview.value.height - 60,
      canvasPreview.value.width,
      60
    );
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    if (location.value) {
      ctx.fillText(
        `Lat: ${location.value.coords.latitude.toFixed(
          6
        )}, Lon: ${location.value.coords.longitude.toFixed(6)}`,
        10,
        canvasPreview.value.height - 40
      );
    }
    ctx.fillText(
      new Date().toLocaleString(),
      10,
      canvasPreview.value.height - 20
    );

    requestAnimationFrame(drawVideoFrame);
  }
};

const playRecordedVideo = () => {
  if (videoPlayer.value && recordedVideoUrl.value) {
    videoPlayer.value.play().catch((error) => {
      console.error('Error playing video:', error);
      $q.notify({
        color: 'negative',
        message: 'Failed to play video. Please try again.',
        icon: 'error',
      });
    });
  }
};

const retakeVideo = () => {
  if (recordedVideoUrl.value) {
    URL.revokeObjectURL(recordedVideoUrl.value);
  }
  recordedVideoUrl.value = null;
  isPlayingRecordedVideo.value = false;
  isVideoReady.value = false;
  recordedChunks.value = [];

  // Restart the camera
  startCamera();
};

onMounted(() => {
  checkAndRequestPermissions();
});

onUnmounted(() => {
  if (stream.value) {
    stream.value.getTracks().forEach((track) => track.stop());
  }
  if (secondaryStream.value) {
    secondaryStream.value.getTracks().forEach((track) => track.stop());
  }
});
</script>

<style lang="scss" scoped>
.create-reel-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 70vh; // Adjusted to 70% of viewport height
  padding-top: 30px;
  // background: linear-gradient(to bottom, #f0f0f0, #ffffff);
}

.video-container {
  border-radius: 15px;

  position: relative;
  width: 100%;
  height: calc(80vh - 100px); // Adjusted to 70% of viewport height minus 100px margin
  overflow: hidden;
  // padding: 10px;
}

.video-preview,
.recorded-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recording-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
}

.button-container {
  display: flex;
  justify-content: space-around;
  width: 100%;
  padding: 10px;
}

.record-btn,
.stop-btn,
.play-btn,
.retake-btn,
.rotate-btn,
.upload-btn {
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 24px;
}

.rotate-btn {
  /* Add any specific styles for the rotate button if needed */
}

.upload-btn {
  /* Add any specific styles for the upload button if needed */
}
</style>
