<template>
  <div class="container">
    <Navbar />
    
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-background"></div>
      <div class="hero-content">
        <h1 class="hero-title">Contact Us<span class="underline"></span></h1>
        <p class="hero-description">
          Mejico Medical Spa is ready to provide the right solution according to your needs
        </p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <div class="content-wrapper">
        <div class="contact-card">
          <!-- Get in touch Section -->
          <div class="get-in-touch">
            <div class="get-in-touch-content">
              <h2>Get in touch</h2>
              <p>We’re here to help you feel and look your best! For appointments, inquiries, 
                or any assistance, reach out to us through the details below. Our dedicated 
                team is ready to support your wellness journey at Mejico MedSpa Clinic</p>

              <div class="contact-info">
                <div class="contact-item">
                  <div class="icon-background">
                    <MapPinIcon class="icon" />
                  </div>
                  <div>
                    <h3>Location</h3>
                    <p>Leuterio Street, San Vicente West, Calapan City, <br> Oriental Mindoro, Philippines</p>
                  </div>
                </div>

                <div class="contact-item">
                  <div class="icon-background">
                    <MailIcon class="icon" />
                  </div>
                  <div>
                    <h3>Email Us</h3>
                    <p>mejicomdclinic@gmail.com</p>
                  </div>
                </div>

                <div class="contact-item">
                  <div class="icon-background">
                    <PhoneIcon class="icon" />
                  </div>
                  <div>
                    <h3>Call Us</h3>
                    <p>Phone: + 0933 869 7119</p>
                  </div>
                </div>
              </div>

              <div class="social-media">
                <h3>Follow our social media</h3>
                <div class="social-icons">
                  <a href="#" class="social-icon"><FacebookIcon /></a>
                  <a href="#" class="social-icon"><InstagramIcon /></a>
                  <a href="#" class="social-icon"><TwitterIcon /></a>
                  <a href="#" class="social-icon"><YoutubeIcon /></a>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Form -->
          <div class="contact-form">
            <h2>Send us a message</h2>
            <form @submit.prevent="submitForm">
              <div class="form-row">
                <div>
                  <label for="name">Name</label>
                  <input id="name" v-model="form.name" type="text" placeholder="Enter your name here" />
                </div>
                <div>
                  <label for="email">Email</label>
                  <input id="email" v-model="form.email" type="email" placeholder="Enter your name email" />
                </div>
              </div>
              
              <div>
                <label for="subject">Subject</label>
                <input id="subject" v-model="form.subject" type="text" placeholder="Enter your subject here" />
              </div>
              <div>
                <label for="message">Message</label>
                <textarea id="message" v-model="form.message" rows="6" placeholder="Enter your message here"></textarea>
              </div>

              <button type="submit">Send</button>
            </form>
          </div>
        </div>
        <div class="map-container">
          <div class="map-section">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3880.9868879585392!2d121.1649781749137!3d13.413138686944338!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33bcef49f520c8fb%3A0x67679060c7efb6ff!2sLeuterio%2C%20Calapan%2C%20Oriental%20Mindoro!5e0!3m2!1sen!2sph!4v1730622626202!5m2!1sen!2sph"
              width="100%"
              height="100%"
              style="border:0;"
              allowfullscreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
    </div>

    <FooterComponent />
  </div>
</template>

<script setup>
import Navbar from './Navbar.vue';
import FooterComponent from './Footer.vue';
import { ref } from 'vue';
import {
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  YoutubeIcon
} from 'lucide-vue-next';

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
});

const submitForm = () => {
  console.log('Form submitted:', form.value);
  form.value = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');

.container {
  font-family: 'Poppins', sans-serif;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 100%;
  margin-top: 80px;
}

.hero-section {
  position: relative;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  font-weight: bold;
}

.hero-background {
  background-image: url('/placeholder.svg?height=800&width=1920');
  background-size: cover;
  background-position: center;
  position: absolute;
  inset: 0;
}

.hero-background::before {
  content: "";
  position: absolute;
  inset: 0;
  background-color: #382d6e;
}

.hero-content {
  position: relative;
  z-index: 10;
}

.hero-title {
  font-size: 3rem;
  color: #ffffff;
  font-weight: 700;
  position: relative;
  display: inline-block;
  margin-top: 15px;
  margin-bottom: 2rem;
}

.underline {
  display: block;
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 3px;
  background-color: #ffffff;
  animation: snakeLine 3s ease-in-out infinite;
  margin-bottom: 5px;
}

@keyframes snakeLine {
  0% { width: 0; transform: translateX(0); }
  25% { width: 20%; transform: translateX(-5%); }
  50% { width: 100%; transform: translateX(0); }
  75% { width: 50%; transform: translateX(5%); }
  100% { width: 100%; transform: translateX(0); }
}

.hero-description {
  font-size: 14px;
  color: #f0f0f0;
  opacity: 0.85;
  line-height: 1.6;
  margin-top: 1rem;
  max-width: 600px;
  margin-bottom: 40px;
  margin-top: -5px;
}

.main-content {
  background-color: white;
  padding: 4rem 0;
}

.content-wrapper {
  max-width: 90%;
  margin: 0 auto;
  padding: 0 1rem;
}

.contact-card {
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  margin-top: -8rem;
  position: relative;
  z-index: 20;
  display: flex;
  overflow: hidden;
}

.get-in-touch {
  flex: 1;
  background: linear-gradient(135deg, rgba(102, 86, 179, 0.08) 0%, rgba(102, 86, 179, 0.12) 100%);
  position: relative;
  display: flex;
  flex-direction: column;
}

.get-in-touch::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(102, 86, 179, 0.03);
  backdrop-filter: blur(10px);
}

.get-in-touch-content {
  position: relative;
  z-index: 1;
  padding: 2rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.contact-form {
  flex: 1;
  padding: 2rem;
  background: white;
}

.get-in-touch h2,
.contact-form h2 {
  font-size: 30px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 1.5rem;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 2rem;
  flex-grow: 1;
}

.contact-item {
  display: flex;
  align-items: start;
}

.icon-background {
  background-color: #6656b3;
  border-radius: 50%;
  padding: 0.5rem;
  margin-right: 1rem;
}

.icon {
  color: white;
  width: 1.25rem;
  height: 1.25rem;
}

.contact-item h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.contact-item p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.social-media {
  margin-top: auto;
}

.social-media h3 {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
}

.social-icons {
  display: flex;
  gap: 1rem;
}

.social-icon {
  width: 2rem;
  height: 2rem;
  background-color: #6656b3;
  color: white;
  padding: 0.4rem;
  border-radius: 50%;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.social-icon:hover {
  background-color: #524690;
}

.contact-form form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.contact-form label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4a5568;
}

input,
textarea {
  width: 100%;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}

input:focus,
textarea:focus {
  border-color: #6656b3;
  outline: none;
  box-shadow: 0 0 0 2px rgba(21, 101, 192, 0.2);
}

textarea {
  min-height: 120px;
}

button {
  background-color: #6656b3;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  border: none;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #524690;
}

.map-container {
  margin-top: 5rem;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.226);
}

.map-section {
  height: 400px;
  width: 100%;
}

@media (max-width: 768px) {
  .contact-card {
    flex-direction: column;
  }

  .get-in-touch,
  .contact-form {
    width: 100%;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>