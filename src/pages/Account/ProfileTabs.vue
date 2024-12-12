<template>
  <div class="profile-container" :key="reloadKey">
    <!-- Enhanced Profile Header -->
    <div class="profile-header">
      <div class="cover-image">
        <img src="https://img.freepik.com/premium-vector/line-drawing-children-holding-hands_904506-140.jpg?w=826"
          alt="Cover" class="cover-img" />
        <div class="overlay"></div>
        <!-- <q-btn round flat color="dark" icon="edit" size="sm" class="edit-cover-btn" @click="handleCoverUpload" /> -->
      </div>
      <div class="profile-content" v-if="userStore.user.name">
        <div class="profile-main">
          <div class="profile-image-container">
            <div class="profile-image">
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS59s6qBOFlkS5LN4Z0U3G71nCWWg3SuHGVMw&s" />
              <div class="online-status"></div>
            </div>
            <q-btn v-if="$q.screen.lg || $q.screen.xl || $q.screen.md" flat
              @click="router.push(`/my-posts/${userStore.user.id}`)" class="text-center my-posts-btn1">
              <span style="font-size: 13px">
                My Posts
              </span>
            </q-btn>
            <!-- <q-btn round color="primary" icon="edit" size="sm" class="edit-avatar-btn" @click="handleImageUpload" /> -->
          </div>

          <div class="profile-info-container">
            <div class="profile-text">
              <h2 class="profile-name q-ma-none text-capitalize">
                {{ userStore.user.name }}
              </h2>
            </div>
            <!-- My Posts -->
            <q-btn flat @click="router.push(`/my-posts/${userStore.user.id}`)" class="text-center my-posts-btn"
              v-if="$q.screen.sm || $q.screen.xs">
              <span style="font-size: 13px">
                My Posts
              </span>
            </q-btn>
          </div>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div class="expansion-container">
        <q-list separator>

          <!-- Account Details -->
          <q-expansion-item v-model="expandedItems.profile" group="profile-tabs" v-ripple icon="person"
            :label="t('common.myProfile')" header-class="glass-effect">
            <q-card>
              <ProfilePage :reload-components="reloadComponents" />
            </q-card>
          </q-expansion-item>

          <!-- EmergencyContactPage -->
          <q-expansion-item v-if="userStore.user.name" v-model="expandedItems.emergencyContact" group="profile-tabs"
            icon="mdi-human-greeting-proximity" :label="t('common.emergencyContact')">
            <EmergencyContactPage :reload-components="reloadComponents" />
          </q-expansion-item>

          <!-- Volunteers Section -->
          <q-expansion-item v-if="userStore.user.name" v-model="expandedItems.volunteers" group="profile-tabs"
            icon="volunteer_activism" :label="t('common.beVolunteers')">
            <q-card>
              <VolunteeringPage @reload-components="reloadComponents" />
            </q-card>
          </q-expansion-item>



          <!-- Community Impact -->
          <q-expansion-item v-if="userStore.user.name" v-model="expandedItems.community" group="profile-tabs"
            icon="people" :label="t('common.communityImpact')">
            <CommunityImpactPage :reload-components="reloadComponents" />
          </q-expansion-item>

          <!-- Feedback Impact -->
          <q-expansion-item v-if="userStore.user.name" v-model="expandedItems.feedback" group="profile-tabs"
            icon="fas fa-history" :label="t('common.sosHistory')">
            <SosHistoryPage :reload-components="reloadComponents" />
          </q-expansion-item>

          <!-- Feedback Impact -->
          <q-expansion-item v-if="userStore.user.name" v-model="expandedItems.settings" group="profile-tabs"
            icon="mdi-cog" :label="t('common.sosSetting')">
            <ProfileAppPermission :reload-components="reloadComponents" />
          </q-expansion-item>

          <!-- Feedback Impact -->
          <q-expansion-item v-if="userStore.user.name" v-model="expandedItems.business" group="profile-tabs"
            icon="mdi-google-my-business" label="Business">
            <BusinessInfo :reload-components="reloadComponents" />
          </q-expansion-item>

          <!-- Feedback Impact -->

          <!-- <q-expansion-item v-if="userStore.user.name" v-model="expandedItems.rating" group="profile-tabs"
            icon="fas fa-star" label="Your Rating">
            <YourRatingPage />
          </q-expansion-item> -->
        </q-list>
      </div>

      <!-- Logout Button -->
      <div class="logout-section q-pb-md">
        <q-btn style="width: 90%; margin: auto" label="Logout" @click="logout" class="logout-btn" icon="logout" />
      </div>
      <div class="text-center text-subtitle1 versiontextcolor text-weight-thin" style="font-weight: 600">
        <span style="font-size: 13px">App version : </span>
        <span style="font-size: 13px">{{ appVersion }}</span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, provide, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import ProfilePage from './ProfilePage.vue';
import VolunteeringPage from './VolunteeringPage.vue';
import { version, iosVersion, androidVersion } from 'src/../package.json';
// import SosRating from '../Sos/SosRating.vue';
// import YourRatingPage from '../Sos/YourRatingPage.vue';
import SosHistoryPage from '../Sos/SosHistoryPage.vue';
import CommunityImpactPage from './CommunityImpactPage.vue';
import ProfileAppPermission from './ProfileAppPermission.vue';
import EmergencyContactPage from './EmergencyContactPage.vue';
import BusinessInfo from './BusinessInfo.vue';
import { useUserStore } from 'src/stores/user-store';
import { api } from 'src/boot/axios';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const userStore = useUserStore();

const router = useRouter();
const $q = useQuasar();
const reloadKey = ref(0);
const reloadComponents = () => {
  console.log('reloadKey......', reloadKey);

  reloadKey.value++;
};

const appVersion = computed(() => {
  return $q.platform.is.ios
    ? iosVersion
    : $q.platform.is.android
    ? androidVersion
    : version;
});
const logout = async () => {
  try {
    await api.post('/auth/logout');
    userStore.logout(); // This will clear both in-memory and persisted state
    router.push('/login');

  } catch (error) {
    console.error('Error logging out', error);
  }
};

const expandedItems = ref({
  profile: !userStore.user?.name,
  volunteers: false,
  myPosts: false,
  community: false,
  feedback: false,
  rating: false,
  settings: false,
  emergencyContact: false,
  business: false
});
</script>
<style lang="scss" scoped>
.my-posts-btn {
  background: rgba(229, 185, 192, 0.15); // Light pink with transparency
  color: $primary;
  font-weight: 600;
  padding: 5px 25px;
  border-radius: 12px;
  transition: all 0.3s ease;
  border-radius: 20px;
  margin-top: -10px;
  // border: 1px solid rgba(255, 192, 203, 0.3);

  &:hover {
    background: rgba(255, 192, 203, 0.25);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 192, 203, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
}

.my-posts-btn1 {
  background: rgba(229, 185, 192, 0.15); // Light pink with transparency
  color: $primary;
  font-weight: 600;
  padding: 5px 25px;
  border-radius: 12px;
  transition: all 0.3s ease;
  border-radius: 20px;
  margin-top: 20px;
  margin-left: 25px;
  // border: 1px solid rgba(255, 192, 203, 0.3);

  &:hover {
    background: rgba(255, 192, 203, 0.25);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 192, 203, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
}

.profile-container {
  max-width: 100%;
  margin: 0 auto;
  background-color: white;
  min-height: 100vh;
}

.profile-header {
  position: relative;
  margin-bottom: 30px;
  background: #fff;
  /* border-radius: 16px; */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.cover-image {
  height: 210px;
  position: relative;
  overflow: hidden;
  width: 100%;
  /* border-radius: 0px 0px 0 0; */
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.1);
  transition: transform 0.3s ease;
}

.cover-img:hover {
  transform: scale(1.15);
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom,
      rgba(0, 0, 0, 0.2),
      rgba(0, 0, 0, 0.5));
  pointer-events: none;
}

.profile-content {
  padding: 0 40px 40px;
  margin-top: -80px;
  position: relative;
  z-index: 2;
}

.profile-main {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 30px;
  align-items: center;
}

.profile-image-container {
  position: relative;
}

.profile-image {
  width: 180px;
  height: 180px;
  border-radius: 24px;
  position: relative;
  border: 4px solid #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.profile-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.online-status {
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #22c55e;
  border: 3px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.edit-avatar-btn {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.profile-name {
  font-size: 32px;
  font-weight: 700;
  margin-top: -20px;
  /* margin: 0 0 4px; */
  color: #1a1a1a;
}

.profile-title {
  font-size: 16px;
  color: #666;
  margin: 0 0 8px;
}

.profile-location {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 14px;
}

.profile-stats {
  display: flex;
  align-items: center;
  gap: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: #e5e7eb;
}

.profile-actions {
  display: flex;
  gap: 12px;
  padding-top: 40px;
}

.edit-profile-btn,
.share-profile-btn {
  padding: 8px 24px;
  font-weight: 500;
  border-radius: 12px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .profile-main {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .profile-image-container {
    margin: 0 auto;
  }

  .profile-stats {
    justify-content: center;
  }

  .profile-actions {
    justify-content: center;
  }

  .profile-content {
    padding: 0 20px 30px;
  }
}

/* Add subtle animations */
.profile-image {
  transition: transform 0.3s ease;
}

.profile-image:hover {
  transform: scale(1.02);
}

.edit-profile-btn,
.share-profile-btn {
  transition: all 0.2s ease;
}

.edit-profile-btn:hover,
.share-profile-btn:hover {
  transform: translateY(-2px);
}

.main-content {
  /* width: 100%; */
  /* border: 1px solid red; */
  background-color: white;
}

.expansion-container {
  max-width: 100%;
  margin: 0 auto;
  width: 100%;
  margin-top: -30px;
  /* border: 1px solid red; */
}

:deep(.q-expansion-item) {
  margin-bottom: -2px;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:not(.q-expansion-item--expanded):hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

    .q-expansion-item__header {
      background: linear-gradient(145deg, #f8f9fa, #ffffff);
    }

    .q-icon {
      transform: scale(1.1);
    }
  }
}

:deep(.q-expansion-item--expanded) {
  margin: 16px 0;
  background: white;
  box-shadow: none !important;

  .q-expansion-item__header {
    background: linear-gradient(145deg, #f8f9fa, #ffffff);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);

    .q-icon {
      transform: rotate(180deg);
      color: $primary;
    }

    &:hover {
      transform: none;
      box-shadow: none;
    }
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.q-expansion-item--expanded) .q-expansion-item__content {
  animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

:deep(.q-card) {
  box-shadow: none;
  background: transparent;
  transition: all 0.3s ease;
}

:deep(.q-expansion-item__content) {
  background-color: #ffffff;
  padding: 0;
  transition: all 0.3s ease-in-out;
  height: auto !important;
  box-shadow: none !important;
}

:deep(.q-expansion-item__container) {
  background: white;
  /* border-radius: 12px; */
}

:deep(.q-item.q-expansion-item__header) {
  min-height: unset !important;
  padding: 15px 20px !important;
}

:deep(.q-expansion-item__header .q-item__section--avatar) {
  min-width: 52px;
  padding: 0;
  align-self: flex-start;
}

:deep(.q-expansion-item__header .q-icon) {
  width: 24px;
  height: 24px;
  margin-right: 15px;
}

:deep(.q-expansion-item__header:hover .q-icon) {
  color: inherit;
}

:deep(.q-expansion-item__header .q-item__label) {
  /* font-size: 30px !important; */
  font-weight: 600;
  letter-spacing: 0.3px;
  color: #333;
  padding: 10px 0;
}

:deep(.q-expansion-item__content) {
  background-color: #ffffff;
  padding: 0;
  transition: all 0.3s ease-in-out;
  height: auto !important;
}

:deep(.q-card) {
  box-shadow: none;
  border-top: 1px solid #eef0f5;
}

:deep(.q-item) {
  padding: 16px 24px;
  min-height: unset !important;
  height: auto;
  transition: background-color 0.2s ease;
}

:deep(.q-item:hover) {
  background-color: transparent;
}

:deep(.q-badge) {
  padding: 4px 8px;
  font-size: 0.8em;
  font-weight: 500;
  border-radius: 6px;
}

:deep(.q-avatar) {
  // box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 2px solid #fff;
}

.text-h6 {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #eef0f5;
}

:deep(.q-expansion-item__content) {
  transition: all 0.3s ease-in-out;
}

:deep(::-webkit-scrollbar) {
  width: 8px;
}

:deep(::-webkit-scrollbar-track) {
  background: #f1f1f1;
  border-radius: 4px;
}

:deep(::-webkit-scrollbar-thumb) {
  background: #c1c1c1;
  border-radius: 4px;
}

:deep(::-webkit-scrollbar-thumb:hover) {
  // background: #a8a8a8;
}

.gradient-border {
  position: relative;
  border: 2px solid transparent;
  background: linear-gradient(white, white) padding-box,
    linear-gradient(45deg, var(--q-primary), #764ba2) border-box;
  border-radius: 12px;
}

.glass-effect {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.7);
}

:deep(.q-separator) {
  height: 1px;
  background: linear-gradient(to right, transparent, #e0e0e0, transparent);
}

@keyframes shimmer {
  0% {
    background-position: -468px 0;
  }

  100% {
    background-position: 468px 0;
  }
}

.shimmer {
  animation: shimmer 1s linear infinite;
  background: linear-gradient(to right,
      #f6f7f8 0%,
      #edeef1 20%,
      #f6f7f8 40%,
      #f6f7f8 100%);
  background-size: 800px 104px;
}

:deep(.q-btn) {
  transition: all 0.2s ease;

  &:not(.q-expansion-item--expanded):hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
}

.logout-btn {
  margin-top: 40px;
  width: 200px;
  font-weight: 900;
  background: linear-gradient(135deg, $primary, darken($primary, 20%));
  padding: 7px;
  color: whitesmoke;
  border-radius: 10px;
}

.logout-section {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.edit-cover-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 2;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-cover-btn:hover {
  transform: scale(1.1);
  background: white;
}

/* Add these additional selectors for maximum specificity */
:deep(.q-expansion-item) .q-item__label,
:deep(.q-list) .q-expansion-item .q-item__label,
:deep(.q-item) .q-item__label {
  font-size: 13px !important;
  font-weight: 700;
  color: #615c5ce8 !important;
  white-space: normal;
  line-height: 1.4;
}

/* Adjust the header height and padding to accommodate larger text */
:deep(.q-expansion-item__header) {
  min-height: 60px !important;
  padding: 12px 20px !important;

  .q-item__label {
    font-size: 14px !important;
    font-weight: 600;
    color: #424242 !important;
  }

  .q-icon {
    width: 24px;
    height: 24px;
    padding: 0;
  }
}

/* Additional specificity for icon containers */
:deep(.q-item__section--avatar)>.q-icon {
  color: #8b8888e8 !important;
}

/* Remove any primary color classes from the template */

@keyframes expandContent {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.q-expansion-item--expanded .q-expansion-item__content) {
  animation: expandContent 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

:deep(.q-ripple) {
  display: none !important;
}

.versiontextcolor {
  color: rgb(206, 204, 204);
}
</style>
