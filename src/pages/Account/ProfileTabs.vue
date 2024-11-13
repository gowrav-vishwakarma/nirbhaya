<template>
  <div class="profile-container">
    <!-- Enhanced Profile Header -->
    <div class="profile-header">
      <div class="cover-image">
        <img src="https://img.freepik.com/premium-vector/line-drawing-children-holding-hands_904506-140.jpg?w=826"
          alt="Cover" class="cover-img">
        <div class="overlay"></div>
        <!-- <q-btn round flat color="dark" icon="edit" size="sm" class="edit-cover-btn" @click="handleCoverUpload" /> -->
      </div>
      <div class="profile-content" v-if="userStore.user.name">
        <div class="profile-main">
          <div class="profile-image-container">
            <div class="profile-image">
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS59s6qBOFlkS5LN4Z0U3G71nCWWg3SuHGVMw&s">
              <div class="online-status"></div>
            </div>
            <!-- <q-btn round color="primary" icon="edit" size="sm" class="edit-avatar-btn" @click="handleImageUpload" /> -->
          </div>

          <div class="profile-info-container">
            <div class="profile-text">
              <h2 class="profile-name q-ma-none text-capitalize">{{ userStore.user.name }}</h2>
            </div>

          </div>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div class="expansion-container">
        <q-list separator>
          <!-- Account Details -->
          <q-expansion-item v-ripple icon="person" label="My Profile" header-class="glass-effect"
            :default-opened="!userStore.user.name">
            <q-card>
              <ProfilePage />
            </q-card>
          </q-expansion-item>

          <!-- Volunteers Section -->
          <q-expansion-item v-if="userStore.user.name" icon="volunteer_activism" label="Volunteers">
            <q-card>
              <VolunteeringPage />
            </q-card>
          </q-expansion-item>

          <!-- Community Impact -->
          <q-expansion-item v-if="userStore.user.name" icon="people" label="Community Impact">

            <CommunityImpactPage />
          </q-expansion-item>

          <!-- Likes Section -->
          <!-- <q-expansion-item icon="favorite" label="Likes">
            <q-card>
              <q-card-section>
                <div class="text-h6">Posts You've Liked</div>
                <q-list bordered separator>
                  <q-item v-for="(post, index) in likedPosts" :key="index">
                    <q-item-section avatar>
                      <q-avatar>
                        <img :src="post.image">
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ post.title }}</q-item-label>
                      <q-item-label caption>{{ post.date }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-btn flat round color="red" icon="favorite" />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </q-expansion-item> -->
        </q-list>
      </div>

      <!-- Logout Button -->
      <div class="logout-section q-pb-md">
        <q-btn style="width: 90%; margin: auto" label="Logout" @click="logout" class="logout-btn" icon="logout" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import ProfilePage from './ProfilePage.vue'
import VolunteeringPage from './VolunteeringPage.vue';
import CommunityImpactPage from './CommunityImpactPage.vue';
import { useUserStore } from 'src/stores/user-store';
import { api } from 'src/boot/axios';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const userStore = useUserStore();

const router = useRouter()
const $q = useQuasar()

const activeTab = ref('account')
const userProfile = ref({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  location: 'New York',
  image: 'https://i.pravatar.cc/300?img=12',
  title: 'Senior Community Volunteer',
  posts: 128,
  followers: 1420,
  following: 890
})

const volunteerActivities = ref([
  {
    name: 'Food Distribution Drive',
    date: '2024-03-15',
    status: 'Completed'
  },
  {
    name: 'Community Teaching',
    date: '2024-03-20',
    status: 'Upcoming'
  },
  {
    name: 'Beach Cleanup',
    date: '2024-03-10',
    status: 'Completed'
  }
])

const likedPosts = ref([
  {
    title: 'Community Awareness Program',
    date: '2024-03-15',
    image: 'https://source.unsplash.com/100x100/?community'
  },
  {
    title: 'Women Safety Workshop',
    date: '2024-03-12',
    image: 'https://source.unsplash.com/100x100/?safety'
  }
])

const logout = async () => {
  try {
    await api.post('/auth/logout');
    userStore.logout(); // This will clear both in-memory and persisted state
    router.push('/login');
    $q.notify({
      color: 'positive',
      message: t('common.logoutSuccess'),
      icon: 'check',
    });
  } catch (error) {
    console.error('Error logging out', error);
    $q.notify({
      color: 'negative',
      message: t('common.logoutError'),
      icon: 'error',
    });
  }
};

const handleImageUpload = () => {
  // Add image upload logic here
}

const handleCoverUpload = () => {
  // Add cover image upload logic here
  $q.notify({
    message: 'Cover photo upload coming soon',
    color: 'info'
  })
}

onMounted(async () => {
  // Fetch user profile data here
})
</script>
<style lang="scss" scoped>
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
  height: 180px;
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
  overflow: hidden;
  transition: all 0.3s ease;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}

:deep(.q-expansion-item:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
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
  color: #666666 !important;
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
  background-color: #f8faff;
}

:deep(.q-badge) {
  padding: 4px 8px;
  font-size: 0.8em;
  font-weight: 500;
  border-radius: 6px;
}

:deep(.q-avatar) {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  background: #a8a8a8;
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
  background: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%);
  background-size: 800px 104px;
}

:deep(.q-btn) {
  transition: all 0.2s ease;
}

:deep(.q-btn:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
  min-height: 100px !important;
  padding: 15px 20px !important;
}

/* Adjust icon size to match text */
:deep(.q-expansion-item__header) .q-icon {
  width: 40px;
  height: 40px;
  padding: 10px;
  margin-right: 15px;
}

/* Additional specificity for icon containers */
:deep(.q-item__section--avatar)>.q-icon {
  color: #8b8888e8 !important;
}

/* Remove any primary color classes from the template */
</style>
