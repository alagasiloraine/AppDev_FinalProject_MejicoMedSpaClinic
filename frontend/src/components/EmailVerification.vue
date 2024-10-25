<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Email Verification
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Please check your email and click the verification link to continue.
        </p>
      </div>
      <div class="mt-5">
        <button @click="resendVerificationEmail"
                class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Resend Verification Email
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { resendEmailVerification } from '../services/authService';

export default {
  setup() {
    const resendVerificationEmail = async () => {
      try {
        await resendEmailVerification();
        // Show success message to user
      } catch (error) {
        console.error('Error resending verification email:', error);
        // Handle error (e.g., show error message to user)
      }
    };

    return {
      resendVerificationEmail,
    };
  },
};
</script>