import { createApp } from 'vue';
import App from './App.vue';
import router from './routes/index';
import { auth } from './firebase';
import { isAdmin } from './services/authService'; // Import the isAdmin function
import './assets/tailwind.css';
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

const app = createApp(App);
app.use(router);
app.use(Toast);

// Wait for Firebase Auth to initialize
auth.onAuthStateChanged(async (user) => {
  if (user) {
    console.log(`User logged in: ${user.uid}`);
    // Check if the user is an admin
    if (await isAdmin()) {
      router.push('/admin-dashboard');
    } else {
      router.push('/home');
    }
  } else {
    // If no user is logged in, redirect to login page
    router.push('/landing');
  }
  app.mount('#app'); // Mount the app after auth check
});