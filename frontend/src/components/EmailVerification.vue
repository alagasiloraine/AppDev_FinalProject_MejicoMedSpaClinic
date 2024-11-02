<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <h2>Email Verification</h2>
      <p v-if="verificationSent">A verification email has been sent to your email address. Please check your inbox and follow the instructions to verify your account.</p>
      <p v-else>If you haven't received a verification email, click the button below to resend it.</p>
      <button @click="resendVerificationEmail" :disabled="verificationSent">
        {{ verificationSent ? 'Email Sent' : 'Resend Verification Email' }}
      </button>
      <p v-if="message" :class="{ 'text-green-500': !error, 'text-red-500': error }">{{ message }}</p>
      <button @click="$emit('close')" class="close-button">Close</button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebase';

export default {
  emits: ['close'],
  setup(props, { emit }) {
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
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  max-width: 400px;
  width: 90%;
}

button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  margin: 8px 0;
  cursor: pointer;
  border-radius: 5px;
}

.close-button {
  margin-top: 20px;
  background: #d9534f;
  color: white;
}
</style>
