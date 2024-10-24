<template>
    <div class="email-verification-container">
      <h2>Email Verification</h2>
      <p v-if="verificationSent">A verification email has been sent to your email address. Please check your inbox and follow the instructions to verify your account.</p>
      <p v-else>If you haven't received a verification email, click the button below to resend it.</p>
      <button @click="resendVerificationEmail" :disabled="verificationSent">
        {{ verificationSent ? 'Email Sent' : 'Resend Verification Email' }}
      </button>
      <p v-if="message" :class="{ 'text-green-500': !error, 'text-red-500': error }">{{ message }}</p>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  import { sendEmailVerification } from 'firebase/auth';
  import { auth } from '../firebase';
  
  export default {
    setup() {
      const verificationSent = ref(false);
      const message = ref('');
      const error = ref(false);
  
      const resendVerificationEmail = async () => {
        try {
          const user = auth.currentUser;
          if (user) {
            await sendEmailVerification(user);
            verificationSent.value = true;
            message.value = 'Verification email sent successfully.';
            error.value = false;
          } else {
            throw new Error('No user is currently signed in.');
          }
        } catch (err) {
          console.error('Error sending verification email:', err);
          message.value = err.message || 'Failed to send verification email. Please try again.';
          error.value = true;
        }
      };
  
      return { verificationSent, resendVerificationEmail, message, error };
    }
  };
  </script>
  
  <style scoped>
  .email-verification-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    text-align: center;
  }
  
  button {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 10px 20px;
    margin-top: 20px;
    cursor: pointer;
    border-radius: 5px;
  }
  
  button:hover {
    opacity: 0.8;
  }
  
  button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  </style>