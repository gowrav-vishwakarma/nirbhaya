<template>
    <q-page class="row justify-center items-center">
      <q-card class="q-pa-md admin-login-card">
        <q-card-section class="q-pb-none">
          <div class="text-h6 text-center">Admin Login</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit.prevent="validateAndSubmit">
            <q-input
              filled
              v-model="values.email"
              type="email"
              label="Email"
              lazy-rules
              :rules="[
                (val) => (val && val.length > 0) || 'Please type something',
              ]"
              :error="!!errors.email"
              :error-message="errors.email ? errors.email.join('; ') : ''"
            />
            <q-input
              filled
              v-model="values.password"
              type="password"
              label="Password"
              lazy-rules
              :rules="[
                (val) => (val && val.length > 0) || 'Please type something',
              ]"
              :error="!!errors.password"
              :error-message="errors.password ? errors.password.join('; ') : ''"
            />
            <div class="q-mt-md">
              <q-btn label="Login" type="submit" color="primary" full-width />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-page>
  </template>
  
  <script setup>
  import { useUserStore } from 'src/stores/user-store';
  import { useAdminStore } from 'stores/admin-store';
  import { onBeforeMount } from 'vue';
  import { useRouter } from 'vue-router';
import { useForm } from 'src/qnatk/composibles/use-form';
  const adminStore = useAdminStore();
  const userStore = useUserStore();
  const router = useRouter();
  
  const { values, validateAndSubmit, callbacks, errors } = useForm(
    'admin-auth/login',
    {
      email: '',
      password: '',
      userType: 'admin',
    }
  );
  // callbacks.onError = (error) => {
  //   console.log('Error..?', error);
  // };
  callbacks.onSuccess = (data) => {
    if (userStore.isLoggedIn) {
      userStore.logout();
    }
    adminStore.login(data);
    router.push('/admin/dashboard');
  };
  
  onBeforeMount(() => {
    if (adminStore.isLoggedIn) {
      router.push('/admin/dashboard');
    }
  });
  </script>
  
  <style scoped lang="scss">
  .admin-login-card {
    max-width: 400px;
    width: 80%;
    margin: 0 auto;
  }
  </style>
  