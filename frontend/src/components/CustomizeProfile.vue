<template>
  <Navbar />

  <div class="container">
    <div class="card">
      <div class="card flex-row">
        <!-- Sidebar with profile picture and name -->
        <div class="sidebar">
          <div class="profile">
            <div class="profile-img">
              <img v-if="profileImage" :src="profileImage" alt="Profile" class="profile-image" />
              <UserIcon v-else class="w-20 h-20 text-white" />
            </div>
            <label class="change-pic">
              Change Profile
              <input type="file" class="hidden" @change="handleImageUpload" accept="image/*" />
            </label>
            <h2 class="profile-name">{{ fullName }}</h2>
             <!-- Divider line -->
             <div class="divider-line"></div>

            <!-- Username display -->
            <p class="profile-username flex items-center">
              <User class="w-5 h-5 mr-2" /> 
              {{ form.username || "Your Username" }}
            </p>

            <p class="profile-username flex items-center">
                <MailIcon class="w-5 h-5 mr-2" /> 
                {{ userEmail }}
            </p>
          </div>
        </div>

        <!-- Main content area -->
        <div class="main-content">
          <h1 class="main-title">Profile Information</h1>
          <form @submit.prevent="submitForm" class="space-y-8">
            <!-- Personal Information -->
            <div class="form-grid">
              <!-- First Name Field -->
              <div class="space-y-2">
                <label for="firstName" class="form-label">First Name</label>
                <input v-model="form.firstName" type="text" id="firstName" class="form-input" />
              </div>

              <!-- Last Name Field -->
              <div class="space-y-2">
                <label for="lastName" class="form-label">Last Name</label>
                <input v-model="form.lastName" type="text" id="lastName" class="form-input" />
              </div>

              <!-- Username Field -->
              <div class="space-y-2">
                <label for="username" class="form-label">Username</label>
                <input v-model="form.username" type="text" id="username" class="form-input" />
              </div>

              <!-- Email Field -->
              <div class="space-y-2">
                <label for="email" class="form-label">Email</label>
                <input v-model="form.email" type="email" id="email" class="form-input" />
              </div>

              <!-- Modified Gender Field -->
              <div class="form-field">
                <label for="gender" class="form-label">Gender</label>
                <select v-model="form.gender" id="gender" class="form-select">
                  <option value="" disabled>Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <!-- Modified Phone Number Field -->
              <div class="form-field">
                <label for="phone" class="form-label">Phone Number</label>
                <div class="phone-input-container">
                  <div class="phone-prefix">
                    <img src="/src/images/philippines-flag.png" alt="Philippines Flag" class="flag-icon" />
                    <span class="country-code">+63</span>
                  </div>
                  <input 
                    v-model="form.phone" 
                    type="tel" 
                    id="phone" 
                    class="phone-input" 
                    placeholder="9XX XXX XXXX" 
                  />
                </div>
              </div>

            </div>

            <!-- Address Information -->
            <div class="address-section">
              <h3 class="address-title">Address</h3>
              <div class="address-grid">
                <div class="space-y-2">
                  <label for="houseStreet" class="form-label">House No./Street</label>
                  <input v-model="form.address.houseStreet" type="text" id="houseStreet" class="form-input" />
                </div>

                <div class="space-y-2">
                  <label for="province" class="form-label">Province</label>
                  <select v-model="form.address.province" @change="updateCities" id="province" class="form-input">
                    <option value="" disabled>Select Province</option>
                    <option v-for="(cities, province) in addressData" :key="province" :value="province">{{ province }}</option>
                  </select>
                </div>

                <div class="space-y-2">
                  <label for="city" class="form-label">City</label>
                  <select v-model="form.address.city" @change="updateBarangays" id="city" class="form-input">
                    <option value="" disabled>Select City</option>
                    <option v-for="city in cities" :key="city.name" :value="city.name">{{ city.name }}</option>
                  </select>
                </div>

                <div class="space-y-2">
                  <label for="barangay" class="form-label">Barangay</label>
                  <select v-model="form.address.barangay" id="barangay" class="form-input">
                    <option value="" disabled>Select Barangay</option>
                    <option v-for="barangay in barangays" :key="barangay" :value="barangay">{{ barangay }}</option>
                  </select>
                </div>

                <div class="space-y-2">
                  <label for="postalCode" class="form-label">Postal Code</label>
                  <input v-model="form.address.postalCode" type="text" id="postalCode" class="form-input" />
                </div>

                <div class="space-y-2">
                  <label for="country" class="form-label">Country</label>
                  <input v-model="form.address.country" type="text" id="country" class="form-input" />
                </div>
              </div>
            </div>

            <!-- Medical Information -->
            <div class="space-y-4">
              <h3 class="medical-title">Medical Information</h3>
              <div class="space-y-2">
                <label for="skinConditions" class="form-label">Skin Conditions</label>
                <textarea v-model="form.skinConditions" id="skinConditions" rows="3" class="form-textarea"></textarea>
              </div>
            </div>

            <!-- Treatment History (Read-only) -->
            <div class="space-y-4">
              <h3 class="medical-title flex items-center space-x-2">
                <!-- History Icon -->
                <HistoryIcon class="w-5 h-5 text-gray-700" />
                <span>Treatment History</span>
              </h3>
              
              <div class="treatment-history">
                <ul class="space-y-3">
                  <li v-for="(treatment, index) in treatmentHistory" :key="index" class="treatment-item">
                    <span class="treatment-date">{{ treatment.date }}:</span> {{ treatment.description }}
                  </li>
                </ul>
                <p v-if="treatmentHistory.length === 0" class="text-sm text-gray-500 italic">
                  No treatment history available.
                </p>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="flex justify-end">
              <button type="submit" class="submit-btn">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { firestore } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import Navbar from './Navbar.vue';
import { UserIcon,  History as HistoryIcon } from 'lucide-vue-next';
import { User, Mail as MailIcon } from 'lucide-vue-next';

// Address data for Oriental Mindoro
const addressData = {
  "Oriental Mindoro": [
          { name: "Puerto Galera", barangays: ["Aninuan", "Baclayan", "Balatero", "Dulangan", "Palangan", "Poblacion", "Sabang", "San Antonio", "San Isidro", "Santo Niño", "Sinandigan", "Tabinay", "Villaflor"], postalCode: "5203" },
          { name: "San Teodoro", barangays: ["Bigaan", "Calangatan", "Calsapa", "Ilag", "Lumangbayan", "Tacligan", "Poblacion", "Caagutayan"], postalCode: "5202" },
          { name: "Calapan City", barangays: ["Balingayan", "Balite", "Baruyan", "Batino", "Bayanan I", "Bayanan II", "Biga", "Bondoc", "Bucayao", "Buhuan", "Bulusan", "Calero", "Camansihan", "Camilmil", "Canubing I", "Canubing II", "Comunal", "Guinobatan", "Gulod", "Gutad", "Ibaba East", "Ibaba West", "Ilaya", "Lalud", "Lazareto", "Libis", "Lumangbayan", "Mahal Na Pangalan", "Maidlang", "Malad", "Malamig", "Managpi", "Masipit", "Nag-Iba I", "Nag-Iba II", "Navotas", "Pachoca", "Palhi", "Panggalaan", "Parang", "Patas", "Personas", "Putting Tubig", "San Antonio", "San Raphael (formerly Salong)", "San Vicente Central", "San Vicente East", "San Vicente North", "San Vicente South", "San Vicente West", "Sapul", "Silonay", "Sta. Cruz", "Sta. Isabel", "Sta. Maria Village", "Sta. Rita", "Sto. Niño (formerly Nacoco)", "Suqui", "Tawagan", "Tawiran", "Tibag", "Wawa"], postalCode: "5200" },
          { name: "Baco", barangays: [], postalCode: "5201" },
          { name: "Naujan", barangays: ["Adrialuna", "Andres Ylagan (Mag-asawang Tubig)", "Antipolo", "Apitong", "Arangin", "Aurora", "Bacungan", "Bagong Buhay", "Balite", "Bancuro", "Banuton", "Barcenaga", "Bayani", "Buhangin", "Caburo", "Concepcion", "Dao", "Del Pilar", "Estrella", "Evangelista", "Gamao", "General Esco", "Herrera", "Inarawan", "Kalinisan", "Laguna", "Mabini", "Magtibay", "Mahabang Parang", "Malabo", "Malaya", "Malinao", "Malvar", "Masagana", "Masaguing", "Melgar A", "Melgar B", "Metolza", "Montelago", "Montemayor", "Motoderazo", "Mulawin", "Nag-Iba I", "Nag-Iba II", "Pagkakaisa", "Paitan", "Paniquian", "Pinagsabangan I", "Pinagsabangan II", "Pinahan", "Poblacion I Barangay I)", "Poblacion II (Barangay II)", "Poblacion III Barangay III)", "Sampaguita", "San Agustin I", "San Agustin II", "San Andres", "San Antonio", "San Carlos", "San Isidro", "San Jose", "San Luis", "San Nicolas", "San Pedro", "Santa Cruz", "Santa Isabel", "Santa Maria", "Santiago", "Santo Nino", "Tagumpay", "Tigkan"], postalCode: "5204" },
          { name: "Victoria", barangays: ["Alcate", "Antonino (Mainao)", "Babangonan", "Bagong Buhay", "Bagong Silang", "Bambanin", "Bethel", "Canaan", "Concepcion", "Duongan", "Leido", "Loyal", "Mabini", "Macatoc", "Malabo", "Merit", "Ordovilla", "Pakyas", "Poblacion I", "Poblacion II", "Poblacion III", "Poblacion IV", "Sampaguita", "San Antonio", "San Cristobal", "San Gabriel", "San Gelacio", "San Isidro", "San Juan", "San Narciso", "Urdaneta", "Villa Cerveza"], postalCode: "5205" },
          { name: "Socorro", barangays: ["Batong Dalig", "Bayuin", "Bugtong Na Tuog", "Calocmoy", "Calubayan", "Catiningan", "Epiz (Bagsok)", "Happy Valley", "La Fortuna (Putol)", "Leuteboro I", "Leuteboro II", "Mabuhay I", "Mabuhay II", "Malugay", "Maria Concepcion", "Matungao", "Monteverde", "Pasi I", "Pasi II", "Santo Domingo (Lapog)", "Subaan", "Villareal (Daan)", "Zone I (Pob.)", "Zone II (Pob.)", "Zone III (Pob.)", "Zone IV (Pob.)"], postalCode: "5207" },
          { name: "Pola", barangays: ["Bacauan", "Bacungan", "Batuhan", "Bayanan", "Biga", "Buhay na Tubig", "Calubasanhon", "Calima", "Casiligan", "Malibago", "Maluanluan", "Matulatula", "Pahilahan", "Panikihan", "Zone I (Poblacion)", "Zone II (Poblacion)", "Pula", "Puting Cacao", "Tagbakin", "Tagumpay", "Tiguihan", "Campamento", "Misong"], postalCode: "5206" },
          { name: "Pinamalayan", barangays: ["Bangbang", "Banilad", "Barangay I (Pob.)", "Barangay II (Pob.)", "Barangay III (Pob.)", "Barangay IV (Pob.)", "Biga", "Cacawan", "Del", "Mariano", "Marfrancisco", "Mina de Oro", "Nabuslot", "Pag-asa", "Palayan", "Pambisan", "Papandayan", "Pasi", "Rizal", "San Jose", "San Rafael", "Santa Maria", "Tibog"], postalCode: "5208" },
        ],
};

const profileImage = ref(null);
const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  username: '',
  phone: '',
  gender: '', 
  address: {
    houseStreet: '',
    barangay: '',
    city: '',
    postalCode: '',
    province: '',
    country: 'Philippines',  // Set default country
  },
  skinConditions: '',
});

// Data for dynamic dropdowns
const cities = ref([]);
const barangays = ref([]);

// Function to update cities based on selected province
const updateCities = () => {
  const province = form.address.province;
  cities.value = addressData[province] || [];
  form.address.city = '';
  form.address.barangay = '';
  barangays.value = [];
};

// Function to update barangays and postal code based on selected city
const updateBarangays = () => {
  const city = cities.value.find(c => c.name === form.address.city);
  barangays.value = city ? city.barangays : [];
  form.address.postalCode = city ? city.postalCode : '';
};

const fullName = computed(() => {
  return `${form.firstName} ${form.lastName}`.trim() || 'Your Name';
});

const userEmail = computed(() => {
  return form.email || 'username@email.com';
});

// Mock treatment history data
const treatmentHistory = ref([
  { date: '2023-05-15', description: 'Initial consultation for acne treatment' },
  { date: '2023-06-01', description: 'Prescribed topical medication for acne' },
  { date: '2023-07-10', description: 'Follow-up appointment, adjusted medication dosage' },
  { date: '2023-08-20', description: 'Skin analysis and progress evaluation' },
  { date: '2023-09-05', description: 'Started laser therapy for acne scars' },
]);

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      profileImage.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const submitForm = () => {
  console.log('Form submitted:', form);
};

onMounted(() => {
  const auth = getAuth();
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userDocRef = doc(firestore, "authUsers", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          form.firstName = userData.firstName || '';
          form.lastName = userData.lastName || '';
          form.email = user.email || '';
          form.username = userData.username || '';
          if (userData.profileImage) {
            profileImage.value = userData.profileImage;
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
  });
});

watch(() => form.phone, (newValue) => {
  let cleaned = newValue.replace(/\D/g, '');
  cleaned = cleaned.slice(0, 10);
  if (cleaned.length > 6) {
    form.phone = `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  } else if (cleaned.length > 3) {
    form.phone = `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  } else {
    form.phone = cleaned;
  }
});

</script>

<style scoped>
/* Container and Background */
.container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  margin-top: 120px;
  width: 100%;
  margin-left: 15px;
}

.card {
  background: #ffffff;
  border-radius: 1.5rem;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.464);
  overflow: hidden;
  width: 100%;
  max-width: 90rem;
  display: flex;
  flex-direction: column;
}

.card.flex-row {
  flex-direction: row;
}

/* Sidebar */
.sidebar {
  background: linear-gradient(to bottom right, #4f46e5, #7c3aed);
  color: #ffffff;
  padding: 2rem;
  width: 33.3333%;
}

.profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 50px;
}

.profile-img {
  width: 10rem;
  height: 10rem;
  border-radius: 9999px;
  overflow: hidden;
  background: #6366f1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0.25rem solid #ffffff;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.1);
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 9999px;
}

.change-pic {
  background: #ffffff;
  color: #4f46e5;
  padding: 0.5rem 1.5rem;
  border-radius: 9999px;
  transition: background 0.3s;
  text-align: center;
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.change-pic:hover {
  background: #e0e7ff;
}

.profile-name {
  font-size: 1.875rem;
  font-weight: 700;
  text-align: center;
}

.profile-username {
  color: #c7d2fe;
  font-size: 17px; /* Adjusted font size */
}

/* Main Content */
.main-content {
  padding: 2rem;
  width: 66.6667%;
}

.main-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 2rem;
}

/* Updated form grid styles */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  align-items: start; /* Ensures consistent alignment */
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

@media (min-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
}

.form-input {
  margin-top: 0.25rem;
  width: 100%;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  padding: 0.5rem 1rem;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.05);
}

.form-input:focus {
  border-color: #4f46e5;
  outline: none;
  box-shadow: 0px 0px 4px rgba(79, 70, 229, 0.5);
}

.form-input.pl-20 {
  padding-left: 5rem;
}

/* Address Section */
.address-section {
  background: #f3f4f6;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: inset 0px 4px 10px rgba(0, 0, 0, 0.05);
}

.address-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.address-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .address-grid {
    grid-template-columns: 1fr 1fr;
  }
}

/* Medical Information */
.medical-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.form-textarea {
  margin-top: 0.25rem;
  width: 100%;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  padding: 0.5rem 1rem;
  resize: vertical;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.05);
}

.form-textarea:focus {
  border-color: #4f46e5;
  outline: none;
  box-shadow: 0px 0px 4px rgba(79, 70, 229, 0.5);
}

/* Treatment History */
.treatment-history {
  background: #ffffff;
  border-radius: 1rem;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  max-height: 15rem;
  overflow-y: auto;
}

.treatment-item {
  font-size: 0.875rem;
  color: #4b5563;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}
.treatment-item:last-child {
  border-bottom: none;
}

.treatment-date {
  font-weight: 500;
  color: #4f46e5;
}

/* Submit Button */
.submit-btn {
  background: linear-gradient(to right, #4f46e5, #7c3aed);
  color: #ffffff;
  padding: 0.75rem 2rem;
  border-radius: 9999px;
  transition: background 0.3s;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  display: inline-block;
  text-align: center;
}
.submit-btn:hover {
  background: linear-gradient(to right, #4338ca, #6b21a8);
}
.submit-btn:focus {
  outline: none;
  box-shadow: 0px 0px 4px rgba(79, 70, 229, 0.5);
}

/* Updated phone input styles */
.phone-input-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.phone-prefix {
  position: absolute;
  left: 0;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding-left: 0.75rem;
  pointer-events: none;
}

.flag-icon {
  width: 1.25rem;
  height: 0.875rem;
  object-fit: cover;
  border-radius: 2px;
}

.country-code {
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
}

.phone-input {
  width: 100%;
  padding: 0.625rem 1rem 0.625rem 4rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: #374151;
}

.phone-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 1px #4f46e5;
}

/* Divider line styling */
.divider-line {
  width: 80%;
  height: 1px;
  background-color: #c7d2fe;
  margin: 1rem 0;
}

/* Updated select styles */
.form-select {
  width: 100%;
  padding: 0.625rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background-color: white;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: #374151;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
}

</style>