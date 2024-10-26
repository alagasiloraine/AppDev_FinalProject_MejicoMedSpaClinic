<template>
  <div class="register-container">
    <button class="exit-button" @click="goToLandingPage">
      <ArrowLeft class="exit-icon" /> <!-- Icon component for the exit button -->
    </button>
    <div class="register-box">
      <div class="logo-header">
        <div class="logo-overlay"></div>
        <div class="logo-center">
          <img src="/src/images/mejico-MDSpa-logo-transparent2.png" alt="Mejico Medical MD Spa Clinic" class="logo-image" />
        </div>
      </div>
      <div class="register-content">
        <h2 class="register-title">Sign Up</h2>

        <form @submit.prevent="register" class="register-form">
          <div class="form-row">
            <div class="form-group">
              <label for="firstName" class="form-label">First Name</label>
              <div class="input-wrapper">
                <span class="input-icon">
                  <User class="icon" />
                </span>
                <input
                  id="firstName"
                  v-model="firstName"
                  type="text"
                  required
                  class="form-input"
                  placeholder="Enter your first name here"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="lastName" class="form-label">Last Name</label>
              <div class="input-wrapper">
                <span class="input-icon">
                  <User class="icon" />
                </span>
                <input
                  id="lastName"
                  v-model="lastName"
                  type="text"
                  required
                  class="form-input"
                  placeholder="Enter your last name here"
                />
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="username" class="form-label">Username</label>
              <div class="input-wrapper">
                <span class="input-icon">
                  <User class="icon" />
                </span>
                <input
                  id="username"
                  v-model="username"
                  type="text"
                  required
                  class="form-input"
                  placeholder="Enter your username here"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <div class="input-wrapper">
                <span class="input-icon">
                  <Mail class="icon" />
                </span>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  required
                  class="form-input"
                  placeholder="mejicomedspaclinic@email.com"
                />
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <div class="input-wrapper">
                <span class="input-icon">
                  <Lock class="icon" />
                </span>
                <input
                  id="password"
                  v-model="password"
                  type="password"
                  required
                  class="form-input"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="confirmPassword" class="form-label">Confirm Password</label>
              <div class="input-wrapper">
                <span class="input-icon">
                  <Lock class="icon" />
                </span>
                <input
                  id="confirmPassword"
                  v-model="confirmPassword"
                  type="password"
                  required
                  class="form-input"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button type="submit" class="submit-button">Sign Up</button>
          </div>
        </form>

        <div class="login-link">
          <p>Already have an account?
            <router-link to="/login" class="signin-link">Login</router-link>
          </p>
        </div>

          <!-- Email Verification Modal -->
          <EmailVerification v-if="showVerificationModal" @close="closeVerificationModal" />

          <!-- Pop-up Notification -->
          <transition name="fade">
            <div v-if="showPopup" class="popup-message" :class="{ error: error }">
              {{ message }}
            </div>
          </transition>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { auth } from '../firebase';
import { Mail, Lock, User, ArrowLeft } from 'lucide-vue-next';
import EmailVerification from './EmailVerification.vue';

export default {
  components: { Mail, Lock, User, ArrowLeft, EmailVerification },
  setup() {
    const firstName = ref('');
    const lastName = ref('');
    const username = ref('');
    const email = ref('');
    const password = ref('');
    const confirmPassword = ref('');
    const message = ref('');
    const error = ref(false);
    const showPopup = ref(false);
    const showVerificationModal = ref(false);
    const router = useRouter();

    const displayPopup = (msg, isError = false) => {
      message.value = msg;
      error.value = isError;
      showPopup.value = true;
      setTimeout(() => {
        showPopup.value = false;
      }, 3000);
    };

    const register = async () => {
      try {
        if (password.value !== confirmPassword.value) {
          displayPopup('Passwords do not match.', true);
          return;
        }

        message.value = '';
        error.value = false;

        const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
        const user = userCredential.user;

        await sendEmailVerification(user);

        const db = getFirestore();
        await setDoc(doc(db, 'authUsers', user.uid), {
          email: user.email,
          uid: user.uid,
          firstName: firstName.value,
          lastName: lastName.value,
          username: username.value,
          isVerified: false,
          registrationDate: new Date().toISOString(),
        });

        displayPopup('Registration successful. Please check your email to verify your account.', false);

        // Show verification modal after a short delay
        setTimeout(() => {
          showVerificationModal.value = true;
        }, 3000);
      } catch (err) {
        console.error('Registration error:', err);
        displayPopup(err.message || 'Registration failed. Please try again.', true);
      }
    };

    const closeVerificationModal = () => {
      showVerificationModal.value = false;
      router.push('/login');
    };

    // Function to navigate to the landing page
    const goToLandingPage = () => {
      router.push('/');
    };

    return {
      firstName,
      lastName,
      username,
      email,
      password,
      confirmPassword,
      register,
      message,
      error,
      showPopup,
      showVerificationModal,
      displayPopup,
      closeVerificationModal,
      goToLandingPage, // Export goToLandingPage for the exit button
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
