<template>
    <div class="loading-spinner" v-if="isLoading">
        <q-spinner-oval color="amber" />
    </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue';

const props = defineProps({
    isLoading: {
        type: Boolean,
        required: true,
    },
});
</script>

<style scoped>
.loading-spinner {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 9999;
    /* Ensure it is above all other content */
}
</style>
