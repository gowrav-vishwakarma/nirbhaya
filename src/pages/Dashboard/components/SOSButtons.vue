<template>
  <div class="sos-buttons q-mb-lg" style="border: 1px solid white; border-radius: 10px; margin-top: 10px">
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

        <q-icon style="font-size: 15px; margin-right: 7px;" name="info" @click="showPopup = true" />
        <small>Press SOS to notify your emergency contacts.</small>
        <template v-slot:action> </template>
      </q-banner>

      <!-- <q-popup-proxy v-model="showPopup"> -->
      <q-dialog v-model="showPopup" persistent>
        <q-card style="max-width: 350px">
          <q-card-section>
            <div style="font-size: 20px; font-weight: 700; margin-bottom: 10px;">SOS Button Description:</div>
            <strong>SOS Button :</strong> Pressing the SOS button will send a
            notification to your added emergency contacts, alerting them of your
            SOS Event and location (if shared).<br />
            <strong>Important Note: </strong>This is a secondary SOS service.
            Please contact primary emergency services first, such as the police
            or official helpline numbers, for immediate assistance.<br />
            <strong>Disclaimer:</strong> We do not contact or alter any primary
            emergency services on your behalf. Our role is limited to notifying
            the emergency contacts you have added and based on your permission
            notifying nearby volunteers.
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat color="primary" @click="showPopup = false">
              Close
            </q-btn>
          </q-card-actions>
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
