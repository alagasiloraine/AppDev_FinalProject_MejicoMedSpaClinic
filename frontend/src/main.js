import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/tailwind.css'
import { auth } from './firebase'; // Make sure this import is present
import 'swiper/css/bundle'; // Import global CSS here

const app = createApp(App);

app.use(router);

// Wait for Firebase Auth to initialize before mounting the app
auth.onAuthStateChanged(() => {
  app.mount('#app');
});