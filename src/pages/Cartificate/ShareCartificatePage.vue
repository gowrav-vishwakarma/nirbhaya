<template>
  <q-page class="certificate-page">
    <link href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap" rel="stylesheet">
    <div class="container">
      <!-- Certificate Preview -->
      <div ref="stageContainer" class="canvas-container">
        <div ref="konvaContainer">
        </div>
      </div>

      <!-- Controls -->
      <div class="controls q-mt-md">
        <div class=" flex justify-center">
          <q-btn color="primary" style="margin: auto; width: 100%; border-radius: 10px !important;"
            @click="downloadCertificate">
            <i style="font-size: 14px; font-weight: 900;" class="fas fa-long-arrow-alt-down"></i>
            <span style="font-size: 12px; font-weight: 900; margin-left: 10px; ">Download</span>
          </q-btn>
          <!-- <q-btn color="secondary" icon="share" label="Share" @click="shareCertificate" /> -->
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useQuasar } from 'quasar'
import Konva from 'konva'
import { useUserStore } from 'src/stores/user-store';

const $q = useQuasar()
const konvaContainer = ref<HTMLDivElement | null>(null)
const stage = ref<Konva.Stage | null>(null)
const layer = ref<Konva.Layer | null>(null)
const store = useUserStore()
const userName = computed(() => store.user?.name || '')
const referralId = computed(() => store.user?.referralId || '')

// Update stage configuration to use a more suitable aspect ratio
const stageSize = {
  width: 1200,
  height: 847  // Updated to maintain aspect ratio of typical A4 size
}

onMounted(() => {
  // Add temp container
  const tempContainer = document.createElement('div')
  tempContainer.id = 'temp-container'
  tempContainer.style.display = 'none'
  document.body.appendChild(tempContainer)

  initStage()
  window.addEventListener('resize', initStage)
})

const initStage = () => {
  // Get the viewport width
  const viewportWidth = Math.min(window.innerWidth - 32, 1200) // 32px for padding
  const viewportHeight = (viewportWidth * 847) / 1200 // maintain aspect ratio

  // Update stage size
  if (!stage.value) {
    stage.value = new Konva.Stage({
      container: konvaContainer.value as HTMLDivElement,
      width: viewportWidth,
      height: viewportHeight,
    })
    layer.value = new Konva.Layer()
    stage.value.add(layer.value)
  } else {
    stage.value.width(viewportWidth)
    stage.value.height(viewportHeight)
  }

  // Load and scale image
  const image = new Image()
  image.src = '/Sos-Bharat-Cartificate.jpg'
  image.onload = () => {
    layer.value?.destroyChildren()

    // Add background image
    const konvaImage = new Konva.Image({
      image: image,
      width: viewportWidth,
      height: viewportHeight,
      x: 0,
      y: 0
    })
    layer.value?.add(konvaImage)

    // Name text with enhanced styling
    const text = new Konva.Text({
      text: userName.value.split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' '),
      x: viewportWidth / 2,
      y: viewportHeight * 0.55, // Adjusted position
      fontSize: viewportWidth * 0.045, // Font size scaled to viewport width
      fontFamily: 'Pacifico', // Updated font family to Pacifico
      fill: 'black', // Darker, richer color
      align: 'center',
      width: viewportWidth * 0.8,
      offsetX: viewportWidth * 0.4,
      // fontStyle: 'bold',
      shadowColor: 'rgba(0,0,0,0.1)',
      shadowBlur: 2,
      shadowOffset: { x: 1, y: 1 },
    })
    layer.value?.add(text)

    // Stylish container for referral ID
    const referralBg = new Konva.Group({
      x: viewportWidth / 2,
      y: viewportHeight * 0.65,
    })

    // Decorative line before referral ID
    const leftLine = new Konva.Line({
      points: [-100, 125, -20, 125],
      stroke: '#95a5a6',
      strokeWidth: 1,
      opacity: 0.6,
    })

    // Decorative line after referral ID
    const rightLine = new Konva.Line({
      points: [20, 125, 100, 125],
      stroke: '#95a5a6',
      strokeWidth: 1,
      opacity: 0.6,
    })

    // Referral ID text with enhanced styling
    const referralText = new Konva.Text({
      text: `#${referralId.value}`,
      x: 0, y: viewportHeight * 0.13, // Position relative to viewport height
      fontSize: viewportWidth * 0.025, // Font size scaled to viewport width
      fontFamily: 'Montserrat, sans-serif',
      fill: 'black',
      align: 'center',
      width: viewportWidth * 0.4,
      offsetX: viewportWidth * 0.2,
      // fontStyle: 'bold',
      letterSpacing: 1,
    })

    referralBg.add(leftLine)
    referralBg.add(rightLine)
    referralBg.add(referralText)
    layer.value?.add(referralBg)

    layer.value?.batchDraw()
  }
}

onUnmounted(() => {
  const tempContainer = document.getElementById('temp-container')
  if (tempContainer) {
    document.body.removeChild(tempContainer)
  }
  window.removeEventListener('resize', initStage)
})

const downloadCertificate = () => {
  if (!stage.value) return

  // Create a temporary stage with original dimensions for high quality export
  const tempStage = new Konva.Stage({
    container: 'temp-container',
    width: 1200,  // Original width
    height: 847   // Original height
  })

  const tempLayer = new Konva.Layer()
  tempStage.add(tempLayer)

  // Load high resolution image
  const image = new Image()
  image.src = '/Sos-Bharat-Cartificate.jpg'

  image.onload = () => {
    // Add image at full resolution
    const konvaImage = new Konva.Image({
      image: image,
      width: 1200,
      height: 847,
      x: 0,
      y: 0
    })
    tempLayer.add(konvaImage)

    // High-res name text
    const text = new Konva.Text({
      text: userName.value.split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' '),
      x: 600,
      y: 860 * 0.53, // Adjusted position
      fontSize: 60, // Larger font size
      fontFamily: 'Pacifico', // Updated font family to Pacifico
      fill: 'black',
      align: 'center',
      width: 960,
      offsetX: 480,
      // fontStyle: 'bold',
      shadowColor: 'rgba(0,0,0,0.1)',
      shadowBlur: 2,
      shadowOffset: { x: 1, y: 1 },
    })
    tempLayer.add(text)

    // High-res referral ID group
    const referralGroup = new Konva.Group({
      x: 600,
      y: 847 * 0.65,
    })

    // Decorative lines
    const leftLine = new Konva.Line({
      points: [-200, 125, -40, 125],
      stroke: '#95a5a6',
      strokeWidth: 2,
      opacity: 0.6,
    })

    const rightLine = new Konva.Line({
      points: [40, 125, 200, 125],
      stroke: '#95a5a6',
      strokeWidth: 2,
      opacity: 0.6,
    })

    // High-res referral text
    const referralText = new Konva.Text({
      text: `#${referralId.value}`,
      x: 0,
      y: 110,
      fontSize: 32,
      fontFamily: 'Montserrat, sans-serif',
      fill: 'black',
      align: 'center',
      width: 400,
      offsetX: 200,
      // fontStyle: 'bold',
      letterSpacing: 2,
    })

    referralGroup.add(leftLine)
    referralGroup.add(rightLine)
    referralGroup.add(referralText)
    tempLayer.add(referralGroup)

    // Draw everything
    tempLayer.draw()

    // Get high quality data URL
    const dataURL = tempStage.toDataURL({
      pixelRatio: 2, // Higher pixel ratio for better quality
      mimeType: 'image/jpeg',
      quality: 1 // Maximum quality
    })

    // Create download link
    const link = document.createElement('a')
    link.download = `Sos-Bharat-certificate-${userName.value}.jpg`
    link.href = dataURL
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Clean up
    tempStage.destroy()

    // $q.notify({
    //   message: 'Certificate downloaded successfully!',
    //   color: 'positive'
    // })
  }
}

const shareCertificate = async () => {
  if (!stage.value) return

  try {
    const dataURL = stage.value.toDataURL()
    const blob = await (await fetch(dataURL)).blob()

    if (navigator.share) {
      await navigator.share({
        title: 'Nirbhaya Certificate',
        files: [new File([blob], 'certificate.png', { type: 'image/png' })]
      })
    } else {
      // Fallback for browsers that don't support file sharing
      downloadCertificate()
      // $q.notify({
      //   message: 'Sharing not supported on this device. Certificate downloaded instead.',
      //   color: 'warning'
      // })
    }
  } catch (error) {
    console.error('Error sharing:', error)
    $q.notify({
      message: 'Unable to share certificate',
      color: 'negative',
      position:'top-right'
    })
  }
}

// Add a watcher for userName changes
watch(userName, (newName) => {
  console.log('Name changed to:', newName)
  if (layer.value) {
    const text = layer.value.findOne('Text')
    if (text) {
      text.text(newName)
      layer.value.batchDraw()
    }
  }
})

// Add a watcher for referralId changes
watch(referralId, (newId) => {
  console.log('Referral ID changed to:', newId)
  if (layer.value) {
    const referralText = layer.value.findOne('Text[text*="Referral ID"]')
    if (referralText) {
      referralText.text(`Referral ID: ${newId}`)
      layer.value.batchDraw()
    }
  }
})
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Montserrat:wght@400;700&display=swap');

.certificate-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  background: #f5f5f5;
  padding: 1px;
  background: linear-gradient(135deg, $primary, darken($primary, 20%));

}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.canvas-container {
  width: 100%;
  margin: 0 auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  background: white;
  /* border: 1px solid red; */
  /* margin-top: -100px; */
}

#konvaContainer {
  width: 100% !important;
  display: flex;
  justify-content: center;
}

.controls {
  width: 100%;
  /* margin: 20px auto; */
  padding-left: 16px;
  padding-right: 16px;
  margin-bottom: 20px;
}

/* Mobile specific adjustments */
@media (max-width: 600px) {
  .certificate-page {
    padding: 15px;
  }

  .canvas-container {
    border-radius: 4px;
    margin-top: 0px;
  }

  .controls {
    padding: 0 8px;
  }

  /* Ensure Konva stage fits mobile viewport */
  .konvajs-content {
    width: 100% !important;
  }

  .konvajs-content canvas {
    width: 100% !important;
    height: auto !important;
  }
}
</style>
