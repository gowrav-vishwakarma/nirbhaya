<template>
  <q-page class="q-px-sm">
    <div class="rating-container">
      <h6 class="q-ma-none q-mt-sm q-mb-md color-primary" style="font-weight: 800;">{{ volunteers &&
        volunteers.length > 0 ? 'Rate Your Volunteer Hero!' : 'No Record available at the moment.' }} <i
          class="far fa-star"></i>
      </h6>
      <div v-for="volunteer in volunteers" :key="volunteer.id" class="volunteer-section">
        <div class="volunteer-card">
          <img :src="volunteer.profileImage" alt="Profile" class="profile-image" />
          <div class="volunteer-info">
            <p>{{ volunteer.name }} </p>
            <!-- <p class="codetext"> {{ volunteer.referralCode }}</p> -->
          </div>
        </div>
        <div class="stars">
          <span v-for="star in 5" :key="star" class="star" @click="setRating(volunteer.id, star)">
            <i :class="star <= volunteer.rating ? 'fas fa-star' : 'far fa-star'"></i>
          </span>
        </div>
        <textarea v-model="volunteer.feedback" placeholder="Leave your feedback here..."></textarea>
        <q-btn size="sm" class="rating-bg-color" :disabled="!isRatingSet(volunteer)" @click="submitFeedback(volunteer)">
          <span class="" style="font-weight: 900;">
            Submit Feedback
          </span>
        </q-btn>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useUserForm } from 'src/composables/use-user-form';
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
  volunteers.value = sosAcceptedData.value.map((event: any) => {
    const notification = event.notifications[0];
    return {
      id: notification.recipient.id,
      name: notification.recipient.referralId,
      profileImage: 'https://icons-for-free.com/iff/png/512/profile+profile+page+user+icon-1320186864367220794.png', // Default image
      rating: 0,
      feedback: '',
      eventId: notification.eventId
    };
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

const submitFeedback = async (volunteerFeedBack) => {
  console.log('feedBack..........', volunteerFeedBack);

  const feedBackData = {
    feedbackGiverId: userStore.user.id,
    feedbackReceiverId: volunteerFeedBack.id,
    rating: volunteerFeedBack.rating,
    eventId: volunteerFeedBack.eventId,
    feedbackText: volunteerFeedBack.feedBack ? volunteerFeedBack.feedBack : 'Good',
    status: 'Resolved'
  }
  const res = await api.post('/sos/feedback', {
    feedBackData
  });
  if (res) {
    sosAcceptedUsers()
  }

}

const isRatingSet = (volunteer) => {
  return volunteer.rating > 0; // Check if the rating is greater than 0
}
</script>

<style lang="scss" scoped>
.rating-container {
  max-width: 600px;
  margin: 0 auto;
  margin-top: 10px;
  text-align: center;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #f9f9f9;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
}

.star:hover {
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
</style>
