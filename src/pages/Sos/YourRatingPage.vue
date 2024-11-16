<template>
  <q-page class="q-px-sm">
    <div class="rating-container">
      <h6 class="q-ma-none q-mt-sm q-mb-md color-primary" style="font-weight: 800;">
        {{ volunteers && volunteers.length > 0 ? 'Your Ratings' : 'No Rating History available.' }}
        <i class="far fa-star"></i>
      </h6>
      <div v-for="volunteer in volunteers" :key="volunteer.id" class="volunteer-section">
        <div class="volunteer-card">
          <img :src="volunteer.profileImage" alt="Profile" class="profile-image" />
          <div class="volunteer-info">
            <p>{{ volunteer.name }}</p>
          </div>
        </div>
        <div class="stars">
          <span v-for="star in 5" :key="star" class="star">
            <i :class="star <= volunteer.rating ? 'fas fa-star' : 'far fa-star'"></i>
          </span>
        </div>
        <div class="threat-name">
          SOS Event : {{ volunteer.threatName ? 'volunteer.threatName' : 'Emergency Alert' }}
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useUserStore } from 'src/stores/user-store';
import { api } from 'src/boot/axios';

const userStore = useUserStore();

interface Volunteer {
  id: number;
  name: string;
  profileImage: string;
  rating: number;
  threatName: string;
}

const volunteers = ref<Volunteer[]>([]);

const sosRatingHistory = ref();

const sosAcceptedUsers = async () => {
  const userId = userStore.user.id;

  const res = await api.get('/sos/feedback-list', {
    params: {
      userId: userId,
    },
  });

  sosRatingHistory.value = res.data;

  // Updated mapping to include referral ID
  volunteers.value = sosRatingHistory.value.map((event: any) => {
    console.log('event........', event);
    return {
      id: event.feedbackReceiverId,
      name: event.feedbackReceiver.referralId,
      profileImage: 'https://icons-for-free.com/iff/png/512/profile+profile+page+user+icon-1320186864367220794.png',
      rating: event.rating,
      threatName: event.sosEvent.threat
    };
  });
};

sosAcceptedUsers();
</script>

<style lang="scss" scoped>
.rating-container {
  max-width: 600px;
  justify-content: center;
  text-align: center;
  margin: auto;
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

.threat-name {
  font-size: 0.9rem;
  color: #666;
  margin-top: 0px;
  margin-bottom: 5px;
  // text-align: start;
  font-weight: 700;
}
</style>
