<template>
  <div class="login-container">
    <h2>Login to Mejico Clinic</h2>
    <form @submit.prevent="login">
      <input v-model="email" type="email" placeholder="Email" required>
      <input v-model="password" type="password" placeholder="Password" required>
      <button type="submit">Login</button>
    </form>
    <p>Don't have an account? <router-link to="/register">Register</router-link></p>
    <p v-if="message" :class="{ 'text-green-500': !error, 'text-red-500': error }">{{ message }}</p>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { loginUser } from '../services/api';

export default {
  setup() {
    const email = ref('');
    const password = ref('');
    const message = ref('');
    const error = ref(false);
    const router = useRouter();

    const login = async () => {
      try {
        message.value = '';
        error.value = false;
        const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
        const user = userCredential.user;
        
        if (!user.emailVerified) {
          message.value = 'Please verify your email before logging in.';
          error.value = true;
          return;
        }
        
        // Inform backend about the login
        await loginUser({ email: user.email, uid: user.uid });
        
        message.value = 'Login successful. Redirecting...';
        setTimeout(() => router.push('/'), 2000);
      } catch (err) {
        console.error('Login error:', err);
        message.value = err.message || 'Login failed. Please check your credentials.';
        error.value = true;
      }
    };

    return { email, password, login, message, error };
  }
};
</script>

<style scoped>
.login-container {
  max-width: 300px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

input, button {
  display: block;
  width: 100%;
  margin-bottom: 10px;
  padding: 5px;
}

button {
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
}

button:hover {
  opacity: 0.8;
}
</style>