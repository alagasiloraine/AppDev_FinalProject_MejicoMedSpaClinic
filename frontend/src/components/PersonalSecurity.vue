<template>
  <div class="security-container">
    <Navbar />
    <div class="content-wrapper">
      <div class="security-card">
        <div class="card-header">
          <div class="header-content">
            <div class="title-wrapper">
              <h1 class="security-title">Personal Security</h1>
              <div class="security-icon">
                <div class="icon-circle">
                  <LockIcon class="icon" />
                </div>
              </div>
            </div>
            <p class="security-subtitle">Manage your account security settings</p>
          </div>
        </div>

        <div class="security-sections">
          <!-- Email Section -->
          <section class="security-section">
            <div class="section-header">
              <div class="section-title-group">
                <MailIcon class="section-icon" />
                <h2 class="section-title">Email Address</h2>
              </div>
              <span class="section-badge verified">
                <CheckCircleIcon class="badge-icon" />
                Verified
              </span>
            </div>
            
            <div class="current-info" :class="{ 'shake-animation': emailError }">
              <div class="info-content">
                <span class="info-label">Current Email</span>
                <span class="info-value">{{ currentEmail }}</span>
              </div>
              <div class="info-status">
                <ShieldCheckIcon class="status-icon" />
              </div>
            </div>

            <transition name="slide-fade">
              <form @submit.prevent="handleEmailUpdate" v-if="showEmailForm" class="form-container">
                <div class="form-group">
                  <label for="newEmail">New Email Address</label>
                  <div class="input-wrapper">
                    <MailIcon class="input-icon" />
                    <input 
                      type="email" 
                      id="newEmail" 
                      v-model="newEmail" 
                      required
                      placeholder="Enter new email address"
                    >
                  </div>
                </div>
                <div class="form-group">
                  <label for="emailCurrentPassword">Current Password</label>
                  <div class="input-wrapper">
                    <KeyIcon class="input-icon" />
                    <input 
                      type="password"
                      id="emailCurrentPassword"
                      v-model="currentPassword"
                      required
                      placeholder="Enter current password"
                    >
                  </div>
                </div>
                <div class="form-group">
                  <label for="confirmEmail">Confirm New Email</label>
                  <div class="input-wrapper">
                    <CheckCircleIcon class="input-icon" />
                    <input 
                      type="email" 
                      id="confirmEmail" 
                      v-model="confirmEmail" 
                      required
                      placeholder="Confirm new email address"
                    >
                  </div>
                </div>

                <div class="button-group">
                  <button type="submit" class="primary-button">
                    <span class="button-content">
                      <SaveIcon class="button-icon" />
                      <span class="button-text">Save Changes</span>
                    </span>
                  </button>
                  <button type="button" class="secondary-button" @click="cancelEmailChange">
                    <span class="button-content">
                      <XIcon class="button-icon" />
                      <span class="button-text">Cancel</span>
                    </span>
                  </button>
                </div>
              </form>
            </transition>

            <transition name="slide-fade">
              <form @submit.prevent="verifyEmailChange" v-if="showVerificationForm" class="form-container">
                <div class="form-group">
                  <label for="verificationCode">Verification Code</label>
                  <div class="input-wrapper">
                    <ShieldCheckIcon class="input-icon" />
                    <input 
                      type="text" 
                      id="verificationCode" 
                      v-model="verificationCode" 
                      required
                      placeholder="Enter verification code"
                    >
                  </div>
                </div>
                <p class="verification-info">
                  A verification code has been sent to your new email address. Please enter it here to complete the email change process.
                </p>
                <div class="button-group">
                  <button type="submit" class="primary-button">
                    <span class="button-content">
                      <CheckCircleIcon class="button-icon" />
                      <span class="button-text">Verify</span>
                    </span>
                  </button>
                  <button type="button" class="secondary-button" @click="cancelVerification">
                    <span class="button-content">
                      <XIcon class="button-icon" />
                      <span class="button-text">Cancel</span>
                    </span>
                  </button>
                </div>
              </form>
            </transition>

            <button 
              v-if="!showEmailForm && !showVerificationForm"
              class="change-button"
              @click="showEmailForm = true"
            >
              <span class="button-content">
                <PencilIcon class="button-icon" />
                <span class="button-text">Change Email</span>
              </span>
            </button>
          </section>

          <!-- Password Section -->
          <section class="security-section">
            <div class="section-header">
              <div class="section-title-group">
                <KeyIcon class="section-icon" />
                <h2 class="section-title">Password</h2>
              </div>
              <span class="section-badge" :class="{ 'warning': passwordLastChanged > 90 }">
                <ClockIcon class="badge-icon" />
                Last changed {{ passwordLastChanged }} days ago
              </span>
            </div>

            <div class="password-status">
              <div class="status-indicator" :class="getPasswordAgeClass">
                <div class="indicator-icon">
                  <ShieldIcon class="icon" />
                </div>
                <div class="indicator-text">
                  <span class="status-label">Password Strength</span>
                  <span class="status-value">{{ getPasswordAgeStatus }}</span>
                </div>
              </div>
            </div>

            <transition name="slide-fade">
              <form @submit.prevent="handlePasswordUpdate" v-if="showPasswordForm" class="form-container">
                <div class="form-group">
                  <label for="currentPassword">Current Password</label>
                  <div class="input-wrapper">
                    <KeyIcon class="input-icon" />
                    <input 
                      :type="showCurrentPassword ? 'text' : 'password'"
                      id="currentPassword" 
                      v-model="currentPassword" 
                      required
                      placeholder="Enter current password"
                    >
                    <button 
                      type="button" 
                      class="password-toggle"
                      @click="showCurrentPassword = !showCurrentPassword"
                    >
                      <EyeIcon v-if="!showCurrentPassword" class="toggle-icon" />
                      <EyeOffIcon v-else class="toggle-icon" />
                    </button>
                  </div>
                </div>

                <div class="form-group">
                  <label for="newPassword">New Password</label>
                  <div class="input-wrapper">
                    <LockIcon class="input-icon" />
                    <input 
                      :type="showNewPassword ? 'text' : 'password'"
                      id="newPassword" 
                      v-model="newPassword" 
                      required
                      placeholder="Enter new password"
                    >
                    <button 
                      type="button" 
                      class="password-toggle"
                      @click="showNewPassword = !showNewPassword"
                    >
                      <EyeIcon v-if="!showNewPassword" class="toggle-icon" />
                      <EyeOffIcon v-else class="toggle-icon" />
                    </button>
                  </div>
                </div>

                <div class="form-group">
                  <label for="confirmPassword">Confirm New Password</label>
                  <div class="input-wrapper">
                    <CheckCircleIcon class="input-icon" />
                    <input 
                      :type="showConfirmPassword ? 'text' : 'password'"
                      id="confirmPassword" 
                      v-model="confirmPassword" 
                      required
                      placeholder="Confirm new password"
                    >
                    <button 
                      type="button" 
                      class="password-toggle"
                      @click="showConfirmPassword = !showConfirmPassword"
                    >
                      <EyeIcon v-if="!showConfirmPassword" class="toggle-icon" />
                      <EyeOffIcon v-else class="toggle-icon" />
                    </button>
                  </div>
                </div>

                <div class="password-strength-container">
                  <div class="strength-bar-container">
                    <div class="strength-bar" :style="{ width: passwordStrength + '%' }"></div>
                  </div>
                  <span class="strength-label" :class="passwordStrengthText.toLowerCase()">
                    {{ passwordStrengthText }}
                  </span>
                </div>

                <div class="password-requirements">
                  <h3>Password Requirements</h3>
                  <ul>
                    <li :class="{ valid: hasMinLength }">
                      <CheckCircleIcon class="check-icon" :class="{ valid: hasMinLength }" />
                      <span>Minimum 8 characters</span>
                    </li>
                    <li :class="{ valid: hasUpperCase }">
                      <CheckCircleIcon class="check-icon" :class="{ valid: hasUpperCase }" />
                      <span>One uppercase letter</span>
                    </li>
                    <li :class="{ valid: hasLowerCase }">
                      <CheckCircleIcon class="check-icon" :class="{ valid: hasLowerCase }" />
                      <span>One lowercase letter</span>
                    </li>
                    <li :class="{ valid: hasNumber }">
                      <CheckCircleIcon class="check-icon" :class="{ valid: hasNumber }" />
                      <span>One number</span>
                    </li>
                    <li :class="{ valid: hasSpecial }">
                      <CheckCircleIcon class="check-icon" :class="{ valid: hasSpecial }" />
                      <span>One special character</span>
                    </li>
                  </ul>
                </div>

                <div class="button-group">
                  <button type="submit" class="primary-button" :disabled="!isPasswordValid">
                    <span class="button-content">
                      <SaveIcon class="button-icon" />
                      <span class="button-text">Update Password</span>
                    </span>
                  </button>
                  <button type="button" class="secondary-button" @click="cancelPasswordChange">
                    <span class="button-content">
                      <XIcon class="button-icon" />
                      <span class="button-text">Cancel</span>
                    </span>
                  </button>
                </div>
              </form>
            </transition>

            <button 
              v-if="!showPasswordForm"
              class="change-button"
              @click="showPasswordForm = true"
            >
              <span class="button-content">
                <KeyIcon class="button-icon" />
                <span class="button-text">Change Password</span>
              </span>
            </button>
          </section>
        </div>
      </div>
    </div>
    <FooterComponent />
    
    <!-- Pop-up Notification -->
    <transition name="fade">
      <div v-if="showNotification" class="notification-overlay">
        <div class="notification-popup" role="alert">
          <div class="notification-content">
            <CheckCircleIcon class="notification-icon" aria-hidden="true" />
            <p class="notification-message">{{ notificationMessage }}</p>
          </div>
          <button @click="hideNotification" class="notification-close" aria-label="Close notification">
            <XIcon class="close-icon" aria-hidden="true" />
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  Lock as LockIcon,
  Mail as MailIcon,
  Key as KeyIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  CheckCircle as CheckCircleIcon,
  X as XIcon,
  Save as SaveIcon,
  Clock as ClockIcon,
  Shield as ShieldIcon,
  ShieldCheck as ShieldCheckIcon,
  Pencil as PencilIcon
} from 'lucide-vue-next'
import Navbar from './Navbar.vue'
import FooterComponent from './Footer.vue'
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore'
import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { sendEmail } from '../utils/email'
import { database } from '../firebase'

// Firebase instances
const auth = getAuth()

// Email state
const currentEmail = ref('')
const newEmail = ref('')
const confirmEmail = ref('')
const showEmailForm = ref(false)
const emailError = ref(false)
const currentPassword = ref('')
const verificationCode = ref('')
const showVerificationForm = ref(false)

// Password state
const newPassword = ref('')
const confirmPassword = ref('')
const showPasswordForm = ref(false)
const passwordLastChanged = ref(45)
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// Notification state
const showNotification = ref(false)
const notificationMessage = ref('')

// Fetch user data on mount
onMounted(async () => {
  if (auth.currentUser) {
    const userDoc = await getDoc(doc(database, 'users', auth.currentUser.uid))
    if (userDoc.exists()) {
      currentEmail.value = userDoc.data().email
    }
  }
})

// Password validation
const hasMinLength = computed(() => newPassword.value.length >= 8)
const hasUpperCase = computed(() => /[A-Z]/.test(newPassword.value))
const hasLowerCase = computed(() => /[a-z]/.test(newPassword.value))
const hasNumber = computed(() => /[0-9]/.test(newPassword.value))
const hasSpecial = computed(() => /[!@#$%^&*]/.test(newPassword.value))

const isPasswordValid = computed(() => 
  hasMinLength.value && hasUpperCase.value && hasLowerCase.value && 
  hasNumber.value && hasSpecial.value
)

// Function to show notification
const showPopupNotification = (message) => {
  notificationMessage.value = message
  showNotification.value = true
  setTimeout(() => {
    hideNotification()
  }, 3000) // Hide after 3 seconds
}

// Function to hide notification
const hideNotification = () => {
  showNotification.value = false
}

// Handle email update
const handleEmailUpdate = async () => {
  if (newEmail.value !== confirmEmail.value) {
    emailError.value = true
    showPopupNotification('Email addresses do not match. Please check and try again.')
    setTimeout(() => {
      emailError.value = false
    }, 500)
    return
  }

  try {
    // First verify current password
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      currentPassword.value
    )
    await reauthenticateWithCredential(auth.currentUser, credential)
    
    // Generate verification code
    const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    
    // Store the pending email change in Firestore
    await updateDoc(doc(database, 'users', auth.currentUser.uid), {
      pendingEmail: newEmail.value,
      emailVerificationCode: verificationCode,
      emailVerificationExpires: new Date(Date.now() + 3600000) // 1 hour expiry
    })

    await sendEmail({
      to: newEmail.value,
      subject: 'Email Change Verification',
      body: `Your verification code is: ${verificationCode}. This code will expire in 1 hour.`,
      verificationCode: verificationCode
    })
    
    showEmailForm.value = false
    showVerificationForm.value = true
    showPopupNotification('Verification code sent to your new email address.')
  } catch (error) {
    if (error.code === 'auth/requires-recent-login') {
      showPopupNotification('For security reasons, please log out and log back in before changing your email.')
    } else {
      showPopupNotification('Error initiating email change: ' + error.message)
    }
    console.error('Email change error:', error)
  }
}

const verifyEmailChange = async () => {
  try {
    const userDoc = await getDoc(doc(database, 'users', auth.currentUser.uid))
    const userData = userDoc.data()
    
    if (!userData.emailVerificationCode || 
        !userData.pendingEmail || 
        userData.emailVerificationCode !== verificationCode.value ||
        new Date() > new Date(userData.emailVerificationExpires)) {
      throw new Error('Invalid or expired verification code')
    }

    // Update email in Firestore
    await updateDoc(doc(database, 'users', auth.currentUser.uid), {
      email: userData.pendingEmail,
      pendingEmail: null,
      emailVerificationCode: null,
      emailVerificationExpires: null
    })

    currentEmail.value = userData.pendingEmail
    showVerificationForm.value = false
    showPopupNotification('Your email has been successfully updated!')
  } catch (error) {
    showPopupNotification('Error verifying email change: ' + error.message)
  }
}

// Handle password update
const handlePasswordUpdate = async () => {
  if (newPassword.value !== confirmPassword.value || !isPasswordValid.value) {
    showPopupNotification('Please ensure your password meets all requirements and matches the confirmation.')
    return
  }

  try {
    // Re-authenticate user before password change
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      currentPassword.value
    )
    await reauthenticateWithCredential(auth.currentUser, credential)
    
    // Update password
    await updatePassword(auth.currentUser, newPassword.value)
    
    showPasswordForm.value = false
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    showPopupNotification('Your password has been successfully updated!')
  } catch (error) {
    showPopupNotification('Error updating password: ' + error.message)
  }
}

// Computed properties
const passwordStrength = computed(() => {
  let strength = 0
  if (hasMinLength.value) strength += 20
  if (hasUpperCase.value) strength += 20
  if (hasLowerCase.value) strength += 20
  if (hasNumber.value) strength += 20
  if (hasSpecial.value) strength += 20
  return strength
})

const passwordStrengthText = computed(() => {
  if (passwordStrength.value < 40) return 'Weak'
  if (passwordStrength.value < 80) return 'Moderate'
  return 'Strong'
})

const getPasswordAgeClass = computed(() => {
  if (passwordLastChanged.value > 90) return 'warning'
  if (passwordLastChanged.value > 60) return 'moderate'
  return 'good'
})

const getPasswordAgeStatus = computed(() => {
  if (passwordLastChanged.value > 90) return 'Change Recommended'
  if (passwordLastChanged.value > 60) return 'Good'
  return 'Excellent'
})

// Cancel handlers
const cancelEmailChange = () => {
  showEmailForm.value = false
  newEmail.value = ''
  confirmEmail.value = ''
  currentPassword.value = ''
}

const cancelVerification = () => {
  showVerificationForm.value = false
  verificationCode.value = ''
}

const cancelPasswordChange = () => {
  showPasswordForm.value = false
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');

.security-container {
  font-family: 'Poppins', sans-serif;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ff 100%);
  position: relative;
}

.content-wrapper {
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: calc(100vh - 200px);
  margin-top: 90px;
}

.security-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 2rem;
  padding: 3rem;
  width: 100%;
  max-width: 1200px;
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  margin: 1rem auto;
}

.card-header {
  margin-bottom: 3rem;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.security-title {
  font-size: 30px;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.security-subtitle {
  color: #6b7280;
  font-size: 14px;
  margin-top: -10px;
}

.security-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-circle {
  width: 35px;
  height: 35px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2);
}

.icon {
  width: 18px;
  height: 18px;
  color: white;
}

.security-sections {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.security-section {
  background: white;
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.334);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-title-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-icon {
  width: 24px;
  height: 24px;
  color: #6366f1;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.section-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  background: #f3f4f6;
  color: #4b5563;
}

.section-badge.verified {
  background: #ecfdf5;
  color: #059669;
}

.section-badge.warning {
  background: #fff7ed;
  color: #c2410c;
}

.badge-icon {
  width: 16px;
  height: 16px;
}

.current-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 1rem;
  margin-bottom: 1.5rem;
  border: 1px solid #e5e7eb;
}

.info-content {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.info-value {
  font-size: 1rem;
  font-weight: 500;
  color: #1f2937;
}

.info-status {
  display: flex;
  align-items: center;
}

.status-icon {
  width: 20px;
  height: 20px;
  color: #059669;
}

.password-status {
  margin-bottom: 1.5rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
}

.status-indicator.good {
  background: #ecfdf5;
  border-color: #6ee7b7;
}

.status-indicator.moderate {
  background: #fffbeb;
  border-color: #fcd34d;
}

.status-indicator.warning {
  background: #fff7ed;
  border-color: #fb923c;
}

.indicator-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
}

.indicator-icon .icon {
  width: 20px;
  height: 20px;
  color: #6366f1;
}

.indicator-text {
  display: flex;
  flex-direction: column;
}

.status-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.status-value {
  font-size: 1rem;
  font-weight: 500;
  color: #1f2937;
}

.form-container {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #4b5563;
  font-weight: 500;
  font-size: 0.875rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  width: 20px;
  height: 20px;
  color: #9ca3af;
}

input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  font-size: 0.938rem;
  transition: all 0.2s ease;
  background: white;
}

input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.password-toggle {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #9ca3af;
}

.toggle-icon {
  width: 20px;
  height: 20px;
}

.password-strength-container {
  margin: 1.5rem 0;
}

.strength-bar-container {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.strength-bar {
  height: 100%;
  background: linear-gradient(to right, #ef4444, #f59e0b, #10b981);
  transition: width 0.3s ease;
}

.strength-label {
  font-size: 0.875rem;
  font-weight: 500;
}

.strength-label.weak { color: #ef4444; }
.strength-label.moderate { color: #f59e0b; }
.strength-label.strong { color: #10b981; }

.password-requirements {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.75rem;
  margin: 1.5rem 0;
  border: 1px solid #e5e7eb;
}

.password-requirements h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.password-requirements ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.password-requirements li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  color: #6b7280;
  transition: color 0.2s ease;
  font-size: 0.875rem;
}

.password-requirements li.valid {
  color: #10b981;
}

.check-icon {
  width: 16px;
  height: 16px;
  color: #d1d5db;
}

.check-icon.valid {
  color: #10b981;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.primary-button,
.secondary-button,
.change-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
}

.button-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.button-icon {
  width: 18px;
  height: 18px;
}

.primary-button {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2);
}

.primary-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 8px -1px rgba(99, 102, 241, 0.3);
}

.primary-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.secondary-button {
  background: white;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.secondary-button:hover {
  background: #f9fafb;
  transform: translateY(-2px);
}

.change-button {
  width: 100%;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2);
}

.change-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 8px -1px rgba(99, 102, 241, 0.3);
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.shake-animation {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}

.notification-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.notification-popup {
  background-color: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  max-width: 90%;
  width: 400px;
  text-align: center;
  position: relative;
}

.notification-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.notification-icon {
  width: 48px;
  height: 48px;
  color: #10b981;
  margin-bottom: 1rem;
}

.notification-message {
  font-size: 1rem;
  color: #1f2937;
  margin-bottom: 0;
}

.notification-close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.close-icon {
  width: 20px;
  height: 20px;
  color: #6b7280;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 1024px) {
  .security-sections {
    grid-template-columns: 1fr;
  }

  .security-card {
    padding: 2rem;
    margin: 1rem;
  }
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 1rem;
  }

  .security-card {
    padding: 1.5rem;
    border-radius: 1.5rem;
  }

  .title-wrapper {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .security-title {
    font-size: 2rem;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .button-group {
    flex-direction: column;
  }

  .primary-button,
  .secondary-button {
    width: 100%;
  }
}
</style>