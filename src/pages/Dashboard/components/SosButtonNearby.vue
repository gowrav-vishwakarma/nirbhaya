<template>
  <div class="sos-buttons q-mb-lg q-pb-md" style="border: 1px solid white; border-radius: 10px; margin-top: 30px">
    <!-- <q-btn round style="background-color: #e74c3c" class="sos-button q-my-lg glowing-border"
      @click="$emit('initiate-sos', true)">
      <div class="row items-center full-width">
        <span style="margin: auto; font-size: 40px; color: white">sos</span>
      </div>
    </q-btn> -->
    <div class="q-pr-md" style="margin-top: -30px">
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
    </div>
  </div>
</template>

<script setup lang="ts">
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
</style>
