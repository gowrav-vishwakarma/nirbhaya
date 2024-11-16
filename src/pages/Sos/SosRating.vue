<template>
  <q-page class="q-px-sm">
    <div class="rating-container">
      <div clss="bg-white" style="background-color: white; border-radius: 10px; padding: 6px; margin-top: 30px;">
        <h6 class="q-ma-none q-mt-sm q-mb-md color-primary" style="font-weight: 800;">{{ volunteers &&
          volunteers.length > 0 ? 'Rate Your Volunteer Hero!' : 'No Volunteer Found For this Event.' }} <i
            class="far fa-star"></i>
        </h6>
      </div>
      <div v-for="volunteer in volunteers" :key="volunteer.id" class="volunteer-section">
        <div class="volunteer-card">
          <img :src="volunteer.profileImage" alt="Profile" class="profile-image" />
          <div class="volunteer-info">
            <p>{{ volunteer.name }} </p>
            <!-- <p class="codetext"> {{ volunteer.referralCode }}</p> -->
          </div>
        </div>
        <div class="threat-name q-pb-md text-capitalize">
          SOS Event : {{ volunteer.threatName ? volunteer.threatName : 'Emergency Alert' }}
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
          <q-btn size="sm" class="rating-bg-color" :disabled="!isRatingSet(volunteer)"
            @click="submitFeedback(volunteer)">
            <span class="" style="font-weight: 900;">
              Submit Feedback
            </span>
          </q-btn>
        </template>

        <div v-else class="feedback-submitted">
          <p class="submitted-text">
            <i class="fas fa-check-circle"></i> Feedback submitted
          </p>
          <p class="feedback-text" v-if="volunteer.feedback">
            "{{ volunteer.feedback }}"
          </p>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
// import { useUserForm } from 'src/composables/use-user-form';
import { useUserStore } from 'src/stores/user-store';
import { api } from 'src/boot/axios';
import { useRoute } from 'vue-router';

const userStore = useUserStore();

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

const volunteers = ref<Volunteer[]>([]);

const sosAcceptedData = ref();

const route = useRoute();

const sosAcceptedUsers = async () => {
  const userId = userStore.user.id;
  const eventId = route.query.eventId;

  const res = await api.get('/sos/sos-accepted-users', {
    params: {
      userId: userId,
      eventId: eventId
    },
  });

  sosAcceptedData.value = res.data;

  // Parse the response data to populate the volunteers array
  volunteers.value = sosAcceptedData.value.flatMap((event: any) => {
    return event.notifications.map((notification: any) => {
      const receivedFeedback = notification.recipient.receivedFeedbacks?.[0];
      return {
        id: notification.recipient.id,
        name: notification.recipient.referralId,
        profileImage: 'https://icons-for-free.com/iff/png/512/profile+profile+page+user+icon-1320186864367220794.png', // Default image
        rating: receivedFeedback ? receivedFeedback.rating : 0,
        feedback: receivedFeedback ? receivedFeedback.feedbackText : '',
        eventId: notification.eventId,
        threatName: event.threat,
        createdAt: event.createdAt,
        feedbackAdded: notification.feedbackAdded
      };
    });
  });
};

sosAcceptedUsers();

function setRating(volunteerId: number, star: number) {
  const volunteer = volunteers.value.find(v => v.id === volunteerId);
  if (volunteer) {
    volunteer.rating = star;
    // volunteer.feedback = '';
  }
}

const submitFeedback = async (volunteerFeedBack: Volunteer) => {
  console.log('feedback..........', volunteerFeedBack);

  const feedBackData = {
    feedbackGiverId: userStore.user.id,
    feedbackReceiverId: volunteerFeedBack.id,
    rating: volunteerFeedBack.rating,
    eventId: volunteerFeedBack.eventId,
    feedbackText: volunteerFeedBack.feedback ? volunteerFeedBack.feedback : 'Good',
    status: 'Resolved'
  }
  const res = await api.post('/sos/feedback', {
    feedBackData
  });
  if (res) {
    sosAcceptedUsers()
  }

}

const isRatingSet = (volunteer: Volunteer) => {
  return volunteer.rating > 0; // Check if the rating is greater than 0
}
</script>

<style lang="scss" scoped>
.rating-container {
  max-width: 600px;
  justify-content: center;
  text-align: center;
  margin: auto;
  background-color: white;
  border-radius: 10px;
  padding-left: 5px;
  padding-right: 5px;
  padding-bottom: 5px;
  // margin: 0 auto;
  // margin-top: 10px;
  // text-align: center;
  // padding: 20px;
  // border: 1px solid #ccc;
  // border-radius: 10px;
  // background-color: #f9f9f9;
  // box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.volunteer-section {
  margin-bottom: 30px;
  padding: 10px;
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
</style>
