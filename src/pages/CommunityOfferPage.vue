<template>
  <q-page>
    <q-banner class="bg-primary text-white">
      <h4>Be a Part of the New Bharat Revolution</h4>
      <h6>Your skills, your passion, our future</h6>
      <h6>
        This app is also made, promoted and funded by community, lets make many
        more projects like this.
      </h6>
    </q-banner>

    <q-card class="q-mt-md">
      <q-card-section>
        <p>
          India is on the cusp of a great transformation, and we need YOU to
          make it happen. Join our community of changemakers who are working
          together to build a safer, stronger, and more prosperous Bharat.
          Whether you're a student, professional, homemaker, or retiree, your
          unique skills and experiences are valuable in shaping our nation's
          future.
        </p>
      </q-card-section>

      <q-card-section>
        <form>
          <q-input
            filled
            v-model="inspiration"
            label="What inspires you about India's future?"
          />
          <q-select
            filled
            v-model="contribution"
            label="How do you see yourself contributing to a better Bharat?"
            :options="contributionOptions"
          />
          <q-input
            filled
            type="textarea"
            v-model="skills"
            label="What specific skills or experiences can you bring to our community?"
          />
          <q-select
            filled
            v-model="time"
            label="How much time can you dedicate to community activities per week?"
            :options="timeOptions"
          />
          <q-card-actions>
            <q-btn
              @click="joinMovement"
              label="Join the Movement"
              color="primary"
              class="q-mx-auto"
            />
          </q-card-actions>
          <q-banner class="q-mt-md">
            <p>
              Remember, every skill is valuable, and every contribution matters.
              Together, we can create a New Bharat that we're proud to call
              home. Join us in this exciting journey of transformation!
            </p>
            <p>
              Your information is safe with us and will only be used for
              community purposes.
            </p>
          </q-banner>
        </form>
      </q-card-section>
    </q-card>

    <q-card class="q-mt-md">
      <q-card-section>
        <h3>Testimonials</h3>
        <p>
          "Being part of this community has changed my life!" - Community Member
          1
        </p>
        <p>
          "I love contributing to something bigger than myself." - Community
          Member 2
        </p>
        <!-- Add more testimonials as needed -->
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserStore } from 'src/stores/user-store'; // Adjust the import based on your project structure
import { useRouter } from 'vue-router';
import { api } from 'src/boot/axios';

const router = useRouter();
const userStore = useUserStore();

onMounted(() => {
  if (userStore.user.hasJoinedCommunity) {
    router.push('/joined-community'); // Redirect to the different page if already joined
  }
});

const inspiration = ref('');
const contribution = ref('');
const skills = ref('');
const time = ref('');

const contributionOptions = [
  'Technology and Innovation',
  'Education and Skill Development',
  'Community Service and Social Work',
  'Arts, Culture, and Heritage Preservation',
  'Social Media and Digital Marketing',
  'Business and Entrepreneurship',
  'Health and Wellness',
  'Environmental Conservation',
  'Other (Please specify)',
];

const timeOptions = [
  'Less than 1 hour',
  '1-3 hours',
  '3-5 hours',
  '5+ hours',
  'Flexible, based on project needs',
];

// Logic for joining the movement
const joinMovement = async () => {
  try {
    await api.post('/auth/apply-community', {
      inspiration: inspiration.value,
      contribution: contribution.value,
      skills: skills.value,
      time: time.value,
    });
    userStore.updateUser({ hasJoinedCommunity: true }); // Update user store
    router.push('/joined-community'); // Redirect to joined community page
  } catch (error) {
    console.error('Error joining community:', error);
  }
};
</script>

<style scoped>
/* Add styles specific to the community page here */
</style>
