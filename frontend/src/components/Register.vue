<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="first-name" class="sr-only">First Name</label>
            <input id="first-name" name="first-name" type="text" required
                   class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                   placeholder="First Name" v-model="firstName">
          </div>
          <div>
            <label for="last-name" class="sr-only">Last Name</label>
            <input id="last-name" name="last-name" type="text" required
                   class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                   placeholder="Last Name" v-model="lastName">
          </div>
          <div>
            <label for="email-address" class="sr-only">Email address</label>
            <input id="email-address" name="email" type="email" autocomplete="email" required
                   class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                   placeholder="Email address" v-model="email">
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input id="password" name="password" type="password" autocomplete="new-password" required
                   class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                   placeholder="Password" v-model="password">
          </div>
        </div>

        <div>
          <button type="submit"
                  class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Register
          </button>
        </div>

        <!-- Error message display -->
        <div v-if="error" class="text-red-600 text-center">
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { register } from '../services/authService';

export default {
  setup() {
    const email = ref('');
    const password = ref('');
    const firstName = ref('');
    const lastName = ref('');
    const error = ref(null); // To hold error messages
    const router = useRouter();

    const handleRegister = async () => {
  error.value = null; // Reset error message
  try {
    await register(email.value, password.value, firstName.value, lastName.value);
    // Display message or notification to the user
    alert('Registration successful! Please check your email to verify your account.');
    router.push('/login'); // Redirect to login after registration
  } catch (registrationError) {
    error.value = registrationError.message; // Set error message
    console.error('Registration error:', registrationError);
  }
};


    return {
      email,
      password,
      firstName,
      lastName,
      error,
      handleRegister,
    };
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');

.register-container {
  font-family: 'Poppins', sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.register-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/src/images/mejicobgimage.jpg');
  background-size: cover;
  background-position: center;
  filter: blur(3px); 
  z-index: -1;
}

.exit-button {
  position: absolute;
  top: 20px;
  left: 20px;
  background-color: #4a399c;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  animation: heartbeat 1.5s infinite;
}

.exit-icon {
  height: 20px;
  width: 20px;
  color: #ffffff;
}

/* Heartbeat animation */
@keyframes heartbeat {
  0%, 100% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.1);
  }
  50% {
    transform: scale(1);
  }
  75% {
    transform: scale(1.1);
  }
}

.exit-button:hover {
  background-color: #372a75;
}

.register-box {
  max-width: 700px; /* Increased width */
  width: 100%;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.logo-header {
  position: relative;
  height: 112px;
  background: linear-gradient(to right, #9b5de5, #00f5d4);
  padding: 8px;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}

.logo-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
}

.logo-center {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-image {
  max-height: 115px;
  max-width: 100%;
  object-fit: contain;
  margin-top: 5px;
}

.register-content {
  padding: 32px;
}

.register-title {
  font-size: 24px;
  font-weight: 800;
  color: #6457a6;
  text-align: center;
  margin-bottom: 24px;
}

.register-form {
  display: grid;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.form-group {
  position: relative;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #4a4a4a;
  margin-bottom: 8px;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  top: 50%;
  left: 12px;
  transform: translateY(-50%);
  pointer-events: none;
}

.icon {
  height: 20px;
  width: 20px;
  color: #b0b0b0;
}

.form-input {
  width: 100%;
  padding: 12px 40px;
  border: 1px solid #d1d1d1;
  border-radius: 8px;
  font-size: 14px; /* Adjust input font size */
  transition: border-color 0.3s;
}

.form-input::placeholder {
  color: #a0a0a0;
  font-size: 14px; /* Adjust placeholder font size */
}

.form-input:focus {
  border-color: #02bea5;
  box-shadow: 0 0 0 3px rgba(0, 245, 212, 0.2);
}

.submit-button {
  width: 100%;
  background: #4a399c;
  color: #fff;
  font-weight: 700;
  padding: 12px 16px;
  border-radius: 8px;
  outline: none;
  border: none;
  cursor: pointer;
  transition: background 0.3s;
  margin-top: 20px;
}

.submit-button:hover {
  background: #372a75;
}

.login-link {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: #707070;
}

.signin-link {
  font-weight: 500;
  color: #06b69f;
  text-decoration: none;
  transition: color 0.2s;
}

.signin-link:hover {
  color: #008a8a;
}

/* Pop-up Notification */
.popup-message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #4caf50; /* Default background color */
  color: #fff;
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: opacity 0.5s ease;
  z-index: 1000;
}

.popup-message.error {
  background-color: #f44336; /* Error background color */
}
</style>
