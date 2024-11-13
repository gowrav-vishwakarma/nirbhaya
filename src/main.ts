import { createApp } from 'vue';
import { Quasar } from 'quasar';
import App from './App.vue';
import { FontAwesomeIcon } from './plugins/fontawesome';

const app = createApp(App);

app.component('font-awesome-icon', FontAwesomeIcon);
app.use(Quasar);
// ... other configurations
app.mount('#app');
