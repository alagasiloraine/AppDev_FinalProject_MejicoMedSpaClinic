<template>
  <div class="container">
    <Navbar />

    <div class="card">
      <div class="card flex-row">
        <!-- Enhanced Sidebar with profile picture and name -->
        <div class="sidebar">
          <div class="profile">
            <div class="profile-img-container">
              <img v-if="profileImage" :src="profileImage" alt="Profile" class="profile-image" />
              <UserIcon v-else class="w-20 h-20 text-white" />
              <label class="change-pic" title="Change Profile Picture">
                <PencilIcon class="w-5 h-5" />
                <input type="file" class="hidden" @change="handleImageUpload" accept="image/*" />
              </label>
            </div>
            <h2 class="profile-name">{{ fullName }}</h2>
            <div class="divider-line"></div>
            <div class="profile-info">
              <p class="profile-detail">
                <User class="w-5 h-5 mr-2" />
                <span>{{ form.username || "Your Username" }}</span>
              </p>
              <p class="profile-detail">
                <MailIcon class="w-5 h-5 mr-2" />
                <span>{{ userEmail }}</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Main content area -->
        <div class="main-content">
          <h1 class="main-title">Profile Information</h1>
          <form @submit.prevent="submitForm" class="space-y-8">
            <!-- Personal Information -->
            <div class="info-section">
              <h2 class="section-title">Personal Information</h2>
              <div class="form-grid">
                <div class="form-field">
                  <label for="firstName" class="form-label">First Name</label>
                  <input v-model="form.firstName" type="text" id="firstName" class="form-input" />
                </div>
                <div class="form-field">
                  <label for="lastName" class="form-label">Last Name</label>
                  <input v-model="form.lastName" type="text" id="lastName" class="form-input" />
                </div>
                <div class="form-field">
                  <label for="username" class="form-label">Username</label>
                  <input v-model="form.username" type="text" id="username" class="form-input" />
                </div>
                <div class="form-field">
                  <label for="email" class="form-label">Email</label>
                  <input v-model="form.email" type="email" id="email" class="form-input" />
                </div>
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
                  <div class="form-select-container">
                    <div class="phone-prefix">
                      <img src="/src/images/philippines-flag.png" alt="Philippines Flag" class="flag-icon" />
                      <span class="country-code">+63</span>
                    </div>
                    <input v-model="form.phone" type="tel" id="phone" class="form-select pl-16"
                      placeholder="9XX XXX XXXX" />
                  </div>
                </div>

                <!-- Date of Birth Field -->
                <div class="form-field">
                  <label for="dateOfBirth" class="form-label">Date of Birth</label>
                  <input v-model="form.dateOfBirth" type="date" id="dateOfBirth" class="form-select" :max="currentDate"
                    @change="calculateAge" />
                </div>

                <!-- Age Field (Read-only) -->
                <div class="form-field">
                  <label for="age" class="form-label">Age</label>
                  <input :value="form.age" type="text" id="age" class="form-select" readonly
                    :placeholder="form.dateOfBirth ? '' : 'Will be calculated from Date of Birth'" />
                </div>
              </div>
            </div>

            <!-- Address Information -->
            <div class="info-section">
              <h2 class="section-title">Address</h2>
              <div class="form-grid">
                <div class="form-field">
                  <label for="houseStreet" class="form-label">House No./Street</label>
                  <input v-model="form.address.houseStreet" type="text" id="houseStreet" class="form-input" />
                </div>
                <div class="form-field">
                  <label for="province" class="form-label">Province</label>
                  <select v-model="form.address.province" @change="updateCities" id="province" class="form-select">
                    <option value="" disabled>Select Province</option>
                    <option v-for="(cities, province) in addressData" :key="province" :value="province">{{ province }}
                    </option>
                  </select>
                </div>
                <div class="form-field">
                  <label for="city" class="form-label">City</label>
                  <select v-model="form.address.city" @change="updateBarangays" id="city" class="form-select">
                    <option value="" disabled>Select City</option>
                    <option v-for="city in cities" :key="city.name" :value="city.name">{{ city.name }}</option>
                  </select>
                </div>
                <div class="form-field">
                  <label for="barangay" class="form-label">Barangay</label>
                  <select v-model="form.address.barangay" id="barangay" class="form-select">
                    <option value="" disabled>Select Barangay</option>
                    <option v-for="barangay in barangays" :key="barangay" :value="barangay">{{ barangay }}</option>
                  </select>
                </div>
                <div class="form-field">
                  <label for="postalCode" class="form-label">Postal Code</label>
                  <input v-model="form.address.postalCode" type="text" id="postalCode" class="form-input" />
                </div>
                <div class="form-field">
                  <label for="country" class="form-label">Country</label>
                  <input v-model="form.address.country" type="text" id="country" class="form-input" />
                </div>
              </div>
            </div>

            <!-- Medical Information -->
            <div class="info-section">
              <h2 class="section-title">Medical Information</h2>
              <div class="form-grid">
                <div class="form-field">
                  <label class="form-label">Do you have allergies?</label>
                  <div class="radio-group">
                    <label class="radio-label">
                      <input type="radio" v-model="form.medical.hasAllergies" :value="true" name="allergies">
                      Yes
                    </label>
                    <label class="radio-label">
                      <input type="radio" v-model="form.medical.hasAllergies" :value="false" name="allergies">
                      No
                    </label>
                  </div>
                </div>
                <div v-if="form.medical.hasAllergies" class="form-field">
                  <label for="allergies" class="form-label">Specify your allergies</label>
                  <input v-model="form.medical.allergies" type="text" id="allergies" class="form-input" />
                </div>
                <div class="form-field">
                  <label class="form-label">Do you have current medications?</label>
                  <div class="radio-group">
                    <label class="radio-label">
                      <input type="radio" v-model="form.medical.hasMedications" :value="true" name="medications">
                      Yes
                    </label>
                    <label class="radio-label">
                      <input type="radio" v-model="form.medical.hasMedications" :value="false" name="medications">
                      No
                    </label>
                  </div>
                </div>
                <div class="form-field">
                  <label class="form-label">Do you have chronic conditions?</label>
                  <div class="radio-group">
                    <label class="radio-label">
                      <input type="radio" v-model="form.medical.hasChronicConditions" :value="true"
                        name="chronicConditions">
                      Yes
                    </label>
                    <label class="radio-label">
                      <input type="radio" v-model="form.medical.hasChronicConditions" :value="false"
                        name="chronicConditions">
                      No
                    </label>
                  </div>
                </div>
                <div v-if="form.medical.hasChronicConditions" class="form-field">
                  <label for="chronicConditions" class="form-label">Specify your chronic conditions</label>
                  <input v-model="form.medical.chronicConditions" type="text" id="chronicConditions"
                    class="form-input" />
                </div>
                <div class="form-field">
                  <label class="form-label">Previous surgeries or procedures?</label>
                  <div class="radio-group">
                    <label class="radio-label">
                      <input type="radio" v-model="form.medical.hasSurgeries" :value="true" name="surgeries">
                      Yes
                    </label>
                    <label class="radio-label">
                      <input type="radio" v-model="form.medical.hasSurgeries" :value="false" name="surgeries">
                      No
                    </label>
                  </div>
                </div>
                <div class="form-field col-span-2">
                  <label for="skinConditions" class="form-label">Skin Conditions</label>
                  <textarea v-model="form.medical.skinConditions" id="skinConditions" rows="3"
                    class="form-textarea"></textarea>
                </div>
              </div>
            </div>

            <div class="info-section">
              <h2 class="section-title flex items-center">
                <HistoryIcon class="w-5 h-5 mr-2" />
                Treatment History
              </h2>
              <div class="treatment-history">
                <ul v-if="approvedAppointments.length > 0" class="space-y-3">
                  <li v-for="appointment in approvedAppointments" :key="appointment.id" class="treatment-item">
                    <div class="flex justify-between items-start">
                      <div>
                        <span class="font-semibold">{{ formatDate(appointment.date) }} at {{ appointment.time }}</span>
                        <p class="text-sm text-gray-600">Service: {{ appointment.serviceName }}</p>
                        <p class="text-sm text-gray-600">Treatment: {{ appointment.treatmentName }}</p>
                        <p v-if="appointment.productName" class="text-sm text-gray-600">Product: {{
                          appointment.productName }}</p>
                      </div>
                    </div>
                  </li>
                </ul>
                <p v-else class="text-sm text-gray-500 italic">
                  No approved appointments available.
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

  <!-- Popup Notification -->
  <Transition name="fade">
    <div v-if="showPopup" class="popup-overlay">
      <div class="popup-content" :class="{ error: popupError }">
        <div class="popup-icon-container">
          <Transition name="icon-change" mode="out-in">
            <CheckIcon v-if="popupSaved" class="popup-icon check" />
            <LoaderIcon v-else class="popup-icon loader" />
          </Transition>
        </div>
        <p>{{ popupMessage }}</p>
      </div>
    </div>
  </Transition>

  <FooterComponent />
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { database } from '../firebase';
import Navbar from './Navbar.vue';
import FooterComponent from './Footer.vue';
import { UserIcon, HistoryIcon, MailIcon, PencilIcon } from 'lucide-vue-next';
import { User } from 'lucide-vue-next';
import { CheckIcon, LoaderIcon } from 'lucide-vue-next';

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
    {
      name: "Pola", barangays: ["Bacauan", "Bacungan", "Batuhan", "Bayanan", "Biga", "Buhay na Tubig", "Calubasanhon", "Calima", "Casiligan", "Malibago", "Maluanluan",
        "Matulatula", "Pahilahan", "Panikihan", "Zone I (Poblacion)", "Zone II (Poblacion)", "Pula", "Puting Cacao", "Tagbakin", "Tagumpay", "Tiguihan", "Campamento", "Misong"], postalCode: "5206"
    },
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
  dateOfBirth: '',
  age: '',
  address: {
    houseStreet: '',
    barangay: '',
    city: '',
    postalCode: '',
    province: '',
    country: 'Philippines',
  },
  medical: {
    hasAllergies: false,
    allergies: '',
    hasMedications: false,
    hasChronicConditions: false,
    chronicConditions: '',
    hasSurgeries: false,
    skinConditions: '',
  },
});

// Data for dynamic dropdowns
const cities = ref([]);
const barangays = ref([]);

// Popup notification
const showPopup = ref(false);
const popupMessage = ref('');
const popupError = ref(false);
const popupSaved = ref(false);

// Function to update cities based on selected province
const updateCities = () => {
  const province = form.address.province;
  cities.value = addressData[province] || [];
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
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      displayPopup('Image size should be less than 5MB', true);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      profileImage.value = e.target.result;
    };
    reader.onerror = (e) => {
      displayPopup('Error reading file', true);
    };
    reader.readAsDataURL(file);
  }
};

const displayPopup = (message, isError = false, duration = 3000) => {
  popupMessage.value = message;
  popupError.value = isError;
  showPopup.value = true;
  popupSaved.value = false;

  if (!isError) {
    setTimeout(() => {
      popupSaved.value = true;
    }, 1000);
  }

  setTimeout(() => {
    showPopup.value = false;
    popupSaved.value = false;
  }, duration);
};

const validateForm = () => {
  if (!form.firstName || !form.lastName || !form.email) {
    displayPopup('Please fill in all required fields', true);
    return false;
  }
  // Add more validation as needed
  return true;
};

const submitForm = async () => {
  if (!validateForm()) return;

  displayPopup('Saving...', false);
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    try {
      const userDocRef = doc(database, "users", user.uid);
      await setDoc(userDocRef,
        {
          firstName: form.firstName,
          lastName: form.lastName,
          username: form.username,
          phone: form.phone,
          gender: form.gender,
          dateOfBirth: form.dateOfBirth,
          age: form.age,
          address: form.address,
          medical: form.medical,
          profileImage: profileImage.value
        },
        { merge: true }
      );
      displayPopup('Successfully saved!', false);
    } catch (error) {
      console.error("Error saving user data:", error);
      displayPopup('Error saving data. Please try again.', true);
    }
  } else {
    console.error("No authenticated user found");
    displayPopup('Error: No authenticated user found.', true);
  }
};
const approvedAppointments = ref([]);

// Function to fetch approved appointments
const fetchApprovedAppointments = async (userId) => {
  try {
    const appointmentsRef = collection(database, 'appointments');
    const q = query(
      appointmentsRef,
      where('userId', '==', userId),
      where('status', '==', 'approved')
    );
    const querySnapshot = await getDocs(q);

    const appointments = [];
    for (const doc of querySnapshot.docs) {
      const appointmentData = doc.data();

      // Fetch service details
      const serviceDoc = await getDoc(doc(database, 'services', appointmentData.serviceId));
      const serviceName = serviceDoc.exists() ? serviceDoc.data().name : 'Unknown Service';

      // Fetch treatment details
      const treatmentDoc = await getDoc(doc(database, 'treatments', appointmentData.treatmentId));
      const treatmentName = treatmentDoc.exists() ? treatmentDoc.data().name : 'Unknown Treatment';

      appointments.push({
        id: doc.id,
        date: appointmentData.date.toDate(),
        time: appointmentData.time,
        serviceName,
        treatmentName,
        productName: appointmentData.productName || null,
      });
    }

    approvedAppointments.value = appointments.sort((a, b) => b.date - a.date);
  } catch (error) {
    console.error("Error fetching approved appointments:", error);
  }
};

// Function to format date
const formatDate = (date) => {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};
onMounted(() => {
  const auth = getAuth();
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userDocRef = doc(database, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          form.firstName = userData.firstName || '';
          form.lastName = userData.lastName || '';
          form.email = user.email || '';
          form.username = userData.username || '';
          form.phone = userData.phone || '';
          form.gender = userData.gender || '';
          form.dateOfBirth = userData.dateOfBirth || '';
          form.age = userData.age || '';
          form.medical = userData.medical || form.medical;
          if (userData.profileImage) {
            profileImage.value = userData.profileImage;
          }

          // Handle address data initialization
          if (userData.address) {
            form.address = { ...form.address, ...userData.address };
            if (form.address.province) {
              updateCities();
              if (form.address.city) {
                updateBarangays();
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
      await fetchApprovedAppointments(user.uid);
    }
  });
});

// Current date for max attribute of date input
const currentDate = computed(() => {
  return new Date().toISOString().split('T')[0];
});

// Function to calculate age
const calculateAge = () => {
  if (form.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(form.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    form.age = age.toString();
  } else {
    form.age = '';
  }
};

// Watch for changes in dateOfBirth and recalculate age
watch(() => form.dateOfBirth, calculateAge);

// Existing phone number formatting logic
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
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');

.container {
  font-family: 'Poppins', sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  margin-top: 120px;
  width: 100%;
  margin-left: 15px;
  margin-bottom: 50px;
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
  background: #6656b3;
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

.profile-img-container {
  position: relative;
  width: 10rem;
  height: 10rem;
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 9999px;
  border: 0.25rem solid #ffffff;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.1);
}

.change-pic {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #ffffff;
  color: #6656b3;
  padding: 0.5rem;
  border-radius: 9999px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.change-pic:hover {
  background-color: #e0e7ff;
}

.profile-name {
  font-size: 1.875rem;
  font-weight: 700;
  text-align: center;
}

.profile-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.profile-detail {
  display: flex;
  align-items: center;
  font-size: 1rem;
  color: #e1e5f7;
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

/* Info Sections */
.info-section {
  background: #f3f4f6;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: inset 0px 4px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  color: #1f2937;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #6656b3;
  box-shadow: 0 0 0 3px rgba(102, 86, 179, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 6rem;
}

/* Radio Group */
.radio-group {
  display: flex;
  gap: 1rem;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #4b5563;
  cursor: pointer;
}

/* Submit Button */
.submit-btn {
  background-color: #6656b3;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover {
  background-color: #5a4ca0;
}

/* Treatment History */
.treatment-history {
  background: #ffffff;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
}

.treatment-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.treatment-date {
  font-weight: 600;
  color: #6656b3;
}

/* Popup Notification */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup-content {
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 20rem;
}

.popup-content.error {
  background-color: #fee2e2;
  color: #ef4444;
}

.popup-icon-container {
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1rem;
  background-color: #6656b3;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup-icon {
  width: 2rem;
  height: 2rem;
  color: #ffffff;
}

.popup-icon.loader {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* Icon change transition */
.icon-change-enter-active,
.icon-change-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.icon-change-enter-from,
.icon-change-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* Fade Animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .card.flex-row {
    flex-direction: column;
  }

  .sidebar,
  .main-content {
    width: 100%;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .container {
    padding: 0.5rem;
  }

  .card {
    border-radius: 0;
  }

  .main-title {
    font-size: 2rem;
  }

  .profile-name {
    font-size: 1.5rem;
  }
}

/* Additional styles for new fields if needed */
.form-select-container {
  position: relative;
}

.phone-prefix {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 0.25rem;
  pointer-events: none;
}

.flag-icon {
  width: 1.25rem;
  height: 0.875rem;
  object-fit: cover;
  border-radius: 2px;
}

.country-code {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-select.pl-16 {
  padding-left: 4rem;
}
</style>