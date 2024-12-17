<template>
  <div>
    <p>DeepLink</p>
    <ul>
      <!-- <li v-for="todo in todos" :key="todo.id" @click="increment">
        {{ todo.id }} - {{ todo.content }}
      </li> -->
    </ul>
    <p></p>
    <p>Active: {{ active ? 'yes' : 'no' }}</p>
    <p>Clicks on todos: {{ paramValue }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router'; // Import useRoute
const route = useRoute(); // Get the current route

const paramValue = computed(() => route.params); // Replace 'yourParamName' with the actual parameter name

console.log(
  'deeplink example component',
  JSON.stringify(paramValue.value, null, 2)
); // Convert to JSON string
// import { Todo, Meta } from './models';
</script>
