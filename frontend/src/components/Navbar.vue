<template>
  <header>
    <div class="logo">
      <img src="/src/images/mejico-MDSpa-logo-ntext.png" alt="Mejico Medical Spa Logo" />
      <span class="clinic-name">Mejico MedSpa Clinic</span>
    </div>
    <nav>
      <router-link to="/home" class="nav-item" active-class="active">Home</router-link>
      <router-link to="/about" class="nav-item" active-class="active">About</router-link>
      <div class="nav-item dropdown">
      <button
        class="dropdown-toggle"
        @click="toggleDropdown"
        :class="{ active: isServicesActive }"
      >
        Services
        <ChevronDown
          :class="{ 'rotate-180': isDropdownOpen }"
          class="inline-block w-4 h-4 ml-1 transition-transform duration-200"
        />
      </button>
        <transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-1"
        >
          <div v-if="isDropdownOpen" class="dropdown-menu">
            <router-link to="/appointment" class="dropdown-item" active-class="active">
              <Calendar size="16" class="icon" /> Appointments
            </router-link>
            <router-link to="/calendar" class="dropdown-item" active-class="active">
              <ClipboardList size="16" class="icon" /> View Calendar
            </router-link>
            <router-link to="/offers" class="dropdown-item" active-class="active">
              <Tag size="16" class="icon" /> Offers
            </router-link>
          </div>  
        </transition>
      </div>
      <router-link to="/contact" class="nav-item" active-class="active">Contact Us</router-link>
      
      <!-- Enhanced User Profile Dropdown -->
      <div class="nav-item user-profile-dropdown" @click="toggleUserDropdown" v-click-outside="closeUserDropdown">
        <div class="profile-trigger">
          <div class="avatar-container">
            <img 
              v-if="profileImage" 
              :src="profileImage" 
              alt="Profile" 
              class="profile-avatar"
            />
            <UserCircle2 v-else class="default-avatar" />
          </div>
        </div>
        
        <!-- Enhanced Dropdown Menu -->
        <div v-if="userDropdownOpen" class="user-dropdown-menu">
          <!-- User Info Section -->
          <div class="user-info">
            <div class="avatar-container large">
              <img 
                v-if="profileImage" 
                :src="profileImage" 
                alt="Profile" 
                class="profile-avatar"
              />
              <UserCircle2 v-else class="default-avatar" />
            </div>
            <div class="user-details">
              <span class="user-name purple-username">{{ username || 'Guest User' }}</span>
              <span class="user-email">{{ email || 'No email set' }}</span>
            </div>
          </div>
          
          <!-- Menu Items -->
          <div class="dropdown-items">
            <router-link 
              to="/customizeprofile" 
              class="dropdown-item" 
              :class="{ 'active-link': $route.path === '/customizeprofile' }"
            >
              <UserCog2 class="item-icon" />
              <span>Customize Profile</span>
              </router-link>
              <router-link to="/profile/security" class="dropdown-item">
                <Shield class="item-icon" />
                <span>Personal Security</span>
              </router-link>
              <button @click="logout" class="dropdown-item">
              <LogOut class="item-icon" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  </header>

  <!-- Logout notification -->
  <div v-if="logoutMessage" class="logout-notification">
    {{ logoutMessage }}
  </div>

</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { firestore } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import { ChevronDown, UserCircle2, UserCog2, Shield, LogOut } from 'lucide-vue-next'
import { Calendar, ClipboardList, Tag } from 'lucide-vue-next';
import { useRouter } from 'vue-router'

// State
const isDropdownOpen = ref(false)
const userDropdownOpen = ref(false)
const username = ref('')
const fullName = ref('')
const email = ref('')
const profileImage = ref('')
const router = useRouter() // Initialize router
const logoutMessage = ref('') // New reactive variable for logout message

// Computed property to check if "Services" routes are active
const isServicesActive = computed(() => {
  return ['/appointment', '/offers'].includes(router.currentRoute.value.path)
})

// Click Outside Directive
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  },
}

// Methods
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const toggleUserDropdown = () => {
  userDropdownOpen.value = !userDropdownOpen.value
}

const closeUserDropdown = () => {
  userDropdownOpen.value = false
}

const logout = async () => {
  logoutMessage.value = 'Logging out, please wait...'
  setTimeout(async () => {
    const auth = getAuth()
    try {
      await auth.signOut()
      username.value = ''
      fullName.value = ''
      email.value = ''
      profileImage.value = ''
      userDropdownOpen.value = false
      logoutMessage.value = '' // Clear message before redirect

      // Redirect to the landing page
      await router.push('/')
    } catch (error) {
      console.error("Error logging out:", error)
      logoutMessage.value = '' // Clear message if an error occurs
    }
  }, 5000) // 5-second delay
}

// Lifecycle
onMounted(() => {
  const auth = getAuth()
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userDocRef = doc(firestore, "authUsers", user.uid)
        const userDoc = await getDoc(userDocRef)
        if (userDoc.exists()) {
          username.value = userDoc.data().username
          fullName.value = userDoc.data().fullName
          email.value = user.email
          profileImage.value = userDoc.data().profileImage || ''
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    } else {
      username.value = ''
      fullName.value = ''
      email.value = ''
      profileImage.value = ''
    }
  })
})
</script>

<style scoped>
/* Navbar styles */
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  padding: 15px 30px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.logo {
  display: flex;
  align-items: center;
}

.logo img {
  height: 70px;
}

.clinic-name {
  font-size: 24px;
  color: #3d2f81;
  margin-left: 15px;
  font-weight: 600;
}

nav {
  display: flex;
  align-items: center;
}

.nav-item {
  color: #333;
  margin-left: 15px; /* Adjusted from 20px to 15px */
  text-decoration: none;
  font-weight: 500;
  position: relative;
}

.nav-item:nth-child(4) { /* Assuming Contact Us is the 4th nav-item */
  margin-left: 5px; /* Smaller margin for Contact Us only */
}

.nav-item:nth-child(2) { /* Assuming Contact Us is the 4th nav-item */
  margin-left: 25px; /* Smaller margin for Contact Us only */
}

.username-link {
  color: #6a4fb3 !important;
  font-weight: 600;
  cursor: pointer;
}

.nav-item.active {
  color: #6a4fb3;
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #6a4fb3;
}

.nav-item:hover {
  color: #6a4fb3;
}

.dropdown {
  position: relative;
}

.dropdown-toggle {
  display: flex;
  align-items: center;
  color: #333;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.2s, color 0.2s;
}

.dropdown-toggle:hover {
  color: #6a4fb3;
  background-color: rgba(106, 79, 179, 0.1);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 5px);
  left: 50%;
  transform: translateX(-50%);
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  min-width: 180px;
  z-index: 1000;
}

.dropdown-item {
  padding: 12px 20px;
  color: #333;
  text-decoration: none;
  display: block;
  transition: background-color 0.2s, color 0.2s;
}

.dropdown-item:hover {
  background-color: #f0f0f0;
  color: #6a4fb3;
}

/* Enhanced User Profile Dropdown Styles */
.user-profile-dropdown {
  position: relative;
  margin-left: 20px;
}

.profile-trigger {
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.profile-trigger:hover {
  background-color: #f0f0f0;
}

.avatar-container {
  width: 40px; /* Increased size */
  height: 40px; /* Increased size */
  border-radius: 50%;
  overflow: hidden;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #6a4fb3; /* Purple border */
}

.profile-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-container.large {
  width: 60px;
  height: 60px;
}

.default-avatar {
  width: 100%;
  height: 100%;
  color: #666;
}

.user-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 280px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 0;
  overflow: hidden;
}

.user-info {
  padding: 20px;
  background: linear-gradient(to bottom, #f8f9fa, #ffffff);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #eee;
}

.user-details {
  text-align: center;
}

.user-name {
  display: block;
  font-weight: 600;
  color: #1a1a1a;
  font-size: 1.1em;
  margin-bottom: 4px;
}

.user-email {
  display: block;
  color: #666;
  font-size: 0.9em;
}

.dropdown-items {
  padding: 8px 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: #1a1a1a;
  text-decoration: none;
  transition: background-color 0.2s;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  font-size: 0.95em;
}

.dropdown-item:hover {
  background-color: #6a4fb3;
  color: #fff;
}

.item-icon {
  width: 18px;
  height: 18px;
  margin-right: 12px;
  color: #666;
}

.icon {
  margin-right: 8px;
  vertical-align: middle;
  color: #6a4fb3;
}

.dropdown-item:hover .icon {
  color: #ffffff;
}

.dropdown-item:hover .item-icon {
  color: #ffffff;
}

.purple-username {
  color: #6a4fb3;
}

.active-link {
  background-color: #6a4fb3;
  color: white;
}

.active-link .item-icon {
  color: white;
}

.logout-notification {
  position: fixed;
  top: 70px;
  right: 20px;
  background-color: #6a4fb3;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  font-weight: bold;
}

</style>
