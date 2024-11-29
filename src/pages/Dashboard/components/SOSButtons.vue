<template>
  <div class="sos-buttons q-mb-lg" style="border: 1px solid white; border-radius: 10px; margin-top: 20px">
    <q-btn round style="background-color: #e74c3c" class="sos-button q-my-lg glowing-border"
      @click="$emit('initiate-sos', true)">
      <div class="row items-center full-width">
        <span style="margin: auto; font-size: 40px; color: white">sos</span>
      </div>
    </q-btn>
    <!-- <div class="q-pr-md" style="margin-top: -30px">
      <q-btn @click="$emit('initiate-sos', false)" round style="
          height: 50px;
          width: 50px;
          color: white;
          background-color: orange;
          display: flex;
          float: right;
        ">
        <span style="font-weight: bolder"> sos </span>
      </q-btn>
    </div> -->
    <div>
      <q-banner dense class="transparent-banner">
        <q-icon style="font-size: 16px;" class="q-mr-sm " name="info" @click="showPopup = true" />
        <small>{{ $t('common.sosButtonNote_label') }}</small>
        <template v-slot:action> </template>
      </q-banner>

      <!-- <q-popup-proxy v-model="showPopup"> -->
      <q-dialog v-model="showPopup" persistent>
        <q-card style="max-width: 350px">
          <q-card-section>
            <div class="text-h6" style="margin-bottom: 15px;">
              {{ $t('common.sosButtonNote_descTitle') }}
            </div>
            <strong>{{ $t('common.sosButtonNote_H1') }} </strong>
            {{ $t('common.sosButtonNote_H1Desc') }} <br /><br />
            <strong>{{ $t('common.sosButtonNote_H2') }} </strong>{{ $t('common.sosButtonNote_H2Desc') }}<br /><br />
            <strong>{{ $t('common.sosButtonNote_H3') }} </strong>
            {{ $t('common.sosButtonNote_H3Desc') }}
            <q-card-actions align="right">
              <q-btn flat color="primary" @click="showPopup = false">
                {{ $t('common.close') }}
              </q-btn>
            </q-card-actions>
          </q-card-section>
        </q-card>
      </q-dialog>
      <!-- </q-popup-proxy> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const showPopup = ref(false); // Reactive variable to control popup visibility

defineEmits<{
  (e: 'initiate-sos', contactsOnly: boolean): void;
}>();
</script>

<style lang="scss" scoped>
.sos-buttons {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.sos-button {
  height: 200px;
  width: 200px;
  font-weight: bold;
}

.glowing-border {
  border: 5px solid #ffffff;
  margin: auto;
  margin-top: 20px;
  border-radius: 100%;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.5),
    0 0 40px rgba(255, 255, 255, 0.5);
}

.transparent-banner {
  background-color: transparent !important; // Added class for transparent background
  color: white;
  text-align: center;
}
</style>
