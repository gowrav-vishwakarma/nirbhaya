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
    <p>params: {{ paramValue }}</p>
    <p>query: {{ route.query }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router'; // Import useRoute
const route = useRoute(); // Get the current route

const paramValue = computed(() => route.params); // Replace 'yourParamName' with the actual parameter name

console.log(
  'deeplink example component: params',
  JSON.stringify(paramValue.value, null, 2)
);
console.log(
  'deeplink example component: query',
  JSON.stringify(route.query, null, 2)
);
// import { Todo, Meta } from './models';
</script>
