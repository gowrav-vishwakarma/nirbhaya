<template>
  <q-dialog ref="dialogRef" position="bottom" @hide="handleDialogHide" @click="checkSwipeToClose"
    @touchstart="handleTouchStart" @touchmove.prevent="handleTouchMove" @touchend="handleTouchEnd" persistent
    :maximized="false" transition-show="slide-up" transition-hide="slide-down">
    <q-card class="dialog-card" :style="{ '--swipe-progress': swipeProgress }" @touchstart="handleTouchStart"
      @touchmove="handleTouchMove" @touchend="handleTouchEnd" @click="checkSwipeToClose">
      <q-card-section class="row items-center q-pb-md">
        <div class="text-h6 q-mt-sm">
          {{ volunteers && volunteers.length > 0 ?
            'Rate Your Volunteer Heros!' : '' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup style="position: absolute; top: 5px; right: 5px;" />
      </q-card-section>
      <div v-if="volunteers.length == 0" style="text-align: center;">
        <q-img style="width: 60%; margin: auto;"
          src="https://cdn2.iconfinder.com/data/icons/business-1381/1000/accounts___account_user_profile_person_people_not_found_search_find_lost_blocked-512.png"></q-img>
        <p style="font-size: 14px; font-weight: 900; margin-top: 20px;">Volunteer Not Found For this Event !</p>
      </div>

      <q-card-section class="custom-scroll">
        <div class="rating-container">
          <!-- Skeleton loader - changed to show only 1 card -->
          <template v-if="loading">
            <div class="volunteer-section">
              <div class="volunteer-card">
                <q-skeleton type="circle" size="40px" class="q-mr-md" />
                <q-skeleton type="text" width="150px" />
              </div>

              <div class="threat-name q-pb-md">
                <q-skeleton type="text" width="200px" class="q-mb-sm" />
                <q-skeleton type="text" width="100px" height="15px" />
              </div>

              <div class="stars q-my-md">
                <q-skeleton type="text" width="150px" />
              </div>

              <q-skeleton type="rect" height="50px" class="q-mb-md" />
              <q-skeleton type="rect" height="36px" />
            </div>
          </template>

          <!-- Actual content -->
          <template v-else>
            <div v-for="volunteer in volunteers" :key="volunteer.id" class="volunteer-section">
              <div class="volunteer-card">
                <img :src="volunteer.profileImage" alt="Profile" class="profile-image" />
                <div class="volunteer-info">
                  <p>{{ volunteer.name }}</p>
                </div>
              </div>

              <div class="threat-name q-pb-md text-capitalize">
                SOS Event: {{ volunteer.threatName ? volunteer.threatName : 'Emergency Alert' }}
                <br />
                <p style="font-size: 10px; margin-top: -3px; font-weight: 700;">
                  {{ volunteer.createdAt }}
                </p>
              </div>

              <div class="stars">
                <span v-for="star in 5" :key="star" class="star"
                  @click="!volunteer.feedbackAdded && setRating(volunteer.id, star)">
                  <i :class="[
                    star <= volunteer.rating ? 'fas fa-star' : 'far fa-star',
                    { 'disabled-star': volunteer.feedbackAdded }
                  ]"></i>
                </span>
              </div>

              <template v-if="!volunteer.feedbackAdded">
                <textarea v-model="volunteer.feedback" placeholder="Leave your feedback here..."></textarea>
                <q-btn size="sm" class="rating-bg-color full-width" :loading="loading"
                  :disabled="!isRatingSet(volunteer) || loading" @click="submitFeedback(volunteer)">
                  <span style="font-weight: 900;">Submit Feedback</span>
                </q-btn>
              </template>

              <div v-else class="feedback-submitted text-center">
                <p class="submitted-text">
                  <i class="fas fa-check-circle"></i> Feedback submitted
                </p>
                <p class="feedback-text" v-if="volunteer.feedback">
                  "{{ volunteer.feedback }}"
                </p>
              </div>
            </div>
          </template>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useQuasar, useDialogPluginComponent } from 'quasar';
import { useUserStore } from 'src/stores/user-store';
import { api } from 'src/boot/axios';
import { useRouter } from 'vue-router';

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();
const $q = useQuasar();
const userStore = useUserStore();
const loading = ref(true);
const router = useRouter();

interface SosEvent {
  threat: string;
  createdAt: string;
  notifications: Array<{
    eventId: number;
    recipient: {
      id: number;
      referralId: string;
      receivedFeedbacks?: Array<{
        rating: number;
        feedbackText: string;
      }>;
    };
    feedbackAdded: boolean;
  }>;
}

interface Volunteer {
  id: number;
  name: string;
  profileImage: string;
  referralCode: string;
  rating: number;
  feedback: string;
  threatName: string;
  eventId: number;
  createdAt: string;
  feedbackAdded: boolean;
}

const props = defineProps<{
  eventId: string | number;
  source?: string;
}>();

const volunteers = ref<Volunteer[]>([]);
const sosAcceptedData = ref<SosEvent[]>([]);

const sosAcceptedUsers = async () => {
  try {
    loading.value = true;
    const userId = userStore.user.id;
    const res = await api.get('/sos/sos-accepted-users', {
      params: {
        userId: userId,
        eventId: props.eventId.toString()
      },
    });

    sosAcceptedData.value = res.data;

    volunteers.value = sosAcceptedData.value.flatMap((event: SosEvent) => {
      return event.notifications.map((notification) => {
        const receivedFeedback = notification.recipient.receivedFeedbacks?.[0];
        return {
          id: notification.recipient.id,
          name: notification.recipient.referralId,
          profileImage: 'https://icons-for-free.com/iff/png/512/profile+profile+page+user+icon-1320186864367220794.png',
          rating: receivedFeedback ? receivedFeedback.rating : 0,
          feedback: receivedFeedback ? receivedFeedback.feedbackText : '',
          eventId: notification.eventId,
          threatName: event.threat,
          createdAt: event.createdAt,
          feedbackAdded: notification.feedbackAdded,
          referralCode: ''
        };
      });
    });
  } catch (error) {
    console.error('Error fetching SOS accepted users:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to load volunteer data'
    });
  } finally {
    loading.value = false;
  }
};

const setRating = (volunteerId: number, star: number) => {
  const volunteer = volunteers.value.find(v => v.id === volunteerId);
  if (volunteer) {
    volunteer.rating = star;
  }
};

const submitFeedback = async (volunteerFeedBack: Volunteer) => {
  if (loading.value) return;

  try {
    loading.value = true;

    const feedBackData = {
      feedbackGiverId: userStore.user.id,
      feedbackReceiverId: volunteerFeedBack.id,
      rating: volunteerFeedBack.rating,
      eventId: volunteerFeedBack.eventId,
      feedbackText: volunteerFeedBack.feedback ? volunteerFeedBack.feedback : 'Good',
      status: 'Resolved'
    };

    const res = await api.post('/sos/feedback', { feedBackData });

    if (res) {
      await sosAcceptedUsers();

      $q.notify({
        type: 'positive',
        message: 'Feedback submitted successfully',
        position: 'top'
      });

      // onDialogOK();
    }
  } catch (error) {
    console.error('Error submitting feedback:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to submit feedback',
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};

const isRatingSet = (volunteer: Volunteer) => {
  return volunteer.rating > 0;
};

onMounted(() => {
  sosAcceptedUsers();
});

defineExpose({
  dialogRef,
  onDialogHide,
  onDialogOK
});

// Add these new refs for touch handling
const touchStartY = ref(0);
const touchEndY = ref(0);
const minSwipeDistance = 100;
const swipeProgress = ref(0);

const handleTouchStart = (event: TouchEvent) => {
  touchStartY.value = event.touches[0].clientY;
};

const handleTouchMove = (event: TouchEvent) => {
  event.preventDefault();
  touchEndY.value = event.touches[0].clientY;
  const progress = Math.min(Math.max((touchEndY.value - touchStartY.value) / minSwipeDistance, 0), 1);
  swipeProgress.value = progress;
};

const handleTouchEnd = () => {
  const swipeDistance = touchEndY.value - touchStartY.value;
  if (swipeDistance > minSwipeDistance && dialogRef.value) {
    dialogRef.value.hide();
  }
  swipeProgress.value = 0;
};

const checkSwipeToClose = (event: MouseEvent) => {
  event.stopPropagation();
};

const handleDialogHide = () => {
  onDialogHide();
  if (props.source === 'sosmode') {
    router.push('/');
  }
};
</script>

<style lang="scss" scoped>
:deep(body) {
  overscroll-behavior-y: contain;
  overflow: hidden;
  position: fixed;
  width: 100%;
  height: 100%;
}

.dialog-card {
  width: 100%;
  max-width: 600px;
  border-radius: 16px 16px 0 0;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  touch-action: none;
  overscroll-behavior-y: contain;

  &::before {
    content: '';
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 4px;
    background: #{rgba(#000, calc(0.1 + var(--swipe-progress, 0) * 0.3))};
    border-radius: 2px;
    z-index: 1;
    transition: background-color 0.1s ease;
  }
}

.volunteer-section {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.volunteer-card {
  display: flex;
  align-items: center;
  max-height: 50px;
  margin-bottom: 10px;
}

.profile-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
  /* border: 2px solid #007bff; */
}

.volunteer-info {
  text-align: left;
  flex-grow: 1;
  margin-top: 15px;
  font-size: 20px;
}

.codetext {
  font-size: 10px;

}

.stars {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
  margin-top: -20px;
}

.star {
  font-size: 1.5rem;
  cursor: pointer;
  color: #ffd700;
  transition: transform 0.2s;

  &.disabled-star {
    cursor: default;
  }
}

.star:not(.disabled-star):hover {
  transform: scale(1.2);
}

textarea {
  width: 100%;
  height: 50px;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  resize: none;
}

.rating-bg-color {
  background: linear-gradient(135deg, $primary, darken($primary, 10%));
  color: whitesmoke;
  padding-top: 8px;
  padding-bottom: 8px;
  width: 100%;
}

.color-primary {
  background: linear-gradient(95deg, $primary, darken($primary, 10%));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.threat-name {
  font-size: 0.9rem;
  color: #666;
  margin-top: -10px;
  margin-bottom: 5px;
  text-align: start;
  font-weight: 700;
}

.feedback-submitted {
  margin: 10px 0;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 5px;
}

.submitted-text {
  color: #28a745;
  font-weight: 600;
  margin-bottom: 5px;
}

.feedback-text {
  color: #666;
  font-style: italic;
  margin: 0;
}

.custom-scroll {
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
  height: 100%;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
    display: none;
  }
}

.rating-container {
  padding-bottom: env(safe-area-inset-bottom);
}

.volunteer-section {
  .q-skeleton {
    border-radius: 4px;

    &--circle {
      border-radius: 50%;
    }
  }
}
</style>
