import { createApp } from 'vue';
import App from './App.vue';
import router from './routes/index';
import { auth } from './firebase';
import { isAdmin, getCurrentUser } from './services/authService';
import './assets/tailwind.css';
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

const app = createApp(App);
app.use(router);
app.use(Toast);

let appMounted = false;

// Wait for Firebase Auth to initialize
auth.onAuthStateChanged(async (user) => {
  if (user) {
    console.log(`User logged in: ${user.uid}`);
    // Check if the user's email is verified
    if (user.emailVerified) {
      // Check if the user is an admin
      if (await isAdmin()) {
        router.push('/admin-dashboard');
      } else {
        router.push('/home');
      }
    } else {
      // If email is not verified, redirect to a verification page
      router.push('/EmailVerification');
    }
  } else {
    // If no user is logged in, redirect to landing page
    router.push('/landing');
  }
  
  if (!appMounted) {
    app.mount('#app');
    appMounted = true;
  }
});