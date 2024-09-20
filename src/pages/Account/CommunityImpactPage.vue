<template>
  <div class="community-impact-page">
    <h5>{{ $t('communityImpact') }}</h5>
    <p>
      {{ $t('yourReferralId') }}:
      <b
        ><span class="text-primary text-weight-bold text-h4">{{
          userStore.user.referralId
        }}</span></b
      >
    </p>
    <p>
      {{ $t('peopleYouHaveEncouraged') }}: {{ impactInfo.peopleEncouraged }}
    </p>
    <p>{{ $t('locationsSecured') }}: {{ impactInfo.locationsSecured }}</p>
    <!-- Copy URL -->
    <p>
      Share your impact:
      <button @click="copyReferralLink">Copy Referral Link</button>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from 'src/boot/axios';
import { useUserStore } from 'src/stores/user-store';
import { copyToClipboard } from 'quasar'; // Import Quasar's copyToClipboard

const userStore = useUserStore();
const impactInfo = ref({
  referralId: '',
  peopleEncouraged: 0,
  locationsSecured: 0,
});

onMounted(async () => {
  await fetchImpactInfo();
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
  const url = `https://sosbharat.com/#/referrer=${userStore.user.referralId}`;
  copyToClipboard(url)
    .then(() => {
      alert('Referral link copied to clipboard!');
    })
    .catch((err) => {
      console.error('Failed to copy: ', err);
    });
};
</script>

<style scoped>
.community-impact-page {
  padding: 16px;
}
</style>
