<template>
    <div class="register-container">
      <h2>Register for Mejico Clinic</h2>
      <form @submit.prevent="register">
        <input v-model="email" type="email" placeholder="Email" required>
        <input v-model="password" type="password" placeholder="Password" required>
        <button type="submit">Register</button>
      </form>
      <p>Already have an account? <router-link to="/login">Login</router-link></p>
      <p v-if="message" :class="{ 'text-green-500': !error, 'text-red-500': error }">{{ message }}</p>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
  import { auth } from '../firebase';
  import { registerUser } from '../services/api';
  
  export default {
    setup() {
      const email = ref('');
      const password = ref('');
      const message = ref('');
      const error = ref(false);
      const router = useRouter();
  
      const register = async () => {
        try {
          message.value = '';
          error.value = false;
          const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
          const user = userCredential.user;
          
          // Send verification email
          await sendEmailVerification(user);
          
          // Inform backend about the new user
          await registerUser({ email: user.email, uid: user.uid });
          
          message.value = 'Registration successful. Please check your email to verify your account.';
          setTimeout(() => router.push('/login'), 3000);
        } catch (err) {
          console.error('Registration error:', err);
          message.value = err.message || 'Registration failed. Please try again.';
          error.value = true;
        }
      };
  
      return { email, password, register, message, error };
    }
  };
  </script>
  
  <style scoped>
  .register-container {
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