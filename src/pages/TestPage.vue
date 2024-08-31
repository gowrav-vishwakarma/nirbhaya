<template>
  <div>
    <h1>hello test</h1>

  </div>
</template>

<script lang="ts" setup>
import { useUserForm } from 'src/composables/use-user-form';

const {
  values,
  validateAndSubmit,
  errors,
  callbacks,
  isLoading,
} = useUserForm('auth/user-emergency-contect-add', {
  number: 2323232323
})

validateAndSubmit()
</script>

<style scoped></style>
