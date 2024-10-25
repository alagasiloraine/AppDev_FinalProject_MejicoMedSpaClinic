import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './tailwind.css';
import { auth } from './firebase'; // Make sure this import is present
import './assets/tailwind.css'
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
const app = createApp(App);

app.use(router);
app.use(Toast);
// Wait for Firebase Auth to initialize before mounting the app
auth.onAuthStateChanged(() => {
  app.mount('#app');
});