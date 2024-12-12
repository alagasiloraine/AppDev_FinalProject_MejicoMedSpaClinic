<template>
  <footer class="footer">
    <div class="footer-top">
      <span class="footer-text">Get connected with us on social networks:</span>
      <div class="social-icons">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
          <Facebook class="icon" />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
          <Twitter class="icon" />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
          <Instagram class="icon" />
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
          <Linkedin class="icon" />
        </a>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer">
          <Github class="icon" />
        </a>
      </div>
    </div>
    <div class="footer-middle">
      <div class="footer-grid">
        <div>
          <h3 class="footer-title">MEJICO MedSpa Clinic</h3>
          <p class="footer-description">
            Mejico MedSpa Clinic is committed to enhancing beauty and wellness through 
            state-of-the-art medical aesthetics and therapeutic treatments. We aim to 
            provide a serene and rejuvenating experience for our valued clients.
          </p>
        </div>
        <div>
          <h3 class="footer-title">SERVICES</h3>
          <ul class="footer-list">
            <li>Facial Treatments</li>
            <li>Body Treatments</li>
            <li>Massage Therapy</li>
            <li>Medical Aesthetics</li>
          </ul>
        </div>
        <div>
          <h3 class="footer-title">USEFUL LINKS</h3>
          <ul class="footer-list">
            <li>
              <router-link to="/about" class="footer-link">
                About
              </router-link>
            </li>
            <li>
              <router-link to="/clientappointment" class="footer-link">
                Appointments
              </router-link>
            </li>
            <li>
              <router-link to="/calendar" class="footer-link">
                View Calendar
              </router-link>
            </li>
            <li>
              <router-link to="/contact" class="footer-link">
                Contact Us
              </router-link>
            </li>
          </ul>
        </div>
        <div>
          <h3 class="footer-title">CONTACT</h3>
          <ul class="footer-contact">
            <li class="contact-item">
              <Mail class="icon-small" />
              mejicomdclinic@gmail.com
            </li>
            <li class="contact-item">
              <Phone class="icon-small" />
              + 0933 869 7119
            </li>
            <li class="contact-item">
              <MapPin class="icon-location" />
              Leuterio Street, San Vicente West,
              Calapan City, Oriental Mindoro, 
              Philippines
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      © {{ currentYear }} Mejico Medical Spa. All rights reserved.
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Facebook, Twitter, Instagram, Linkedin, Github, MapPin, Mail, Phone, Printer } from 'lucide-vue-next'

const currentYear = ref(new Date().getFullYear())
</script>

<style scoped>
.footer {
  width: 100%;
  background-color: #382d6e;
  color: white;
}

.footer-top,
.footer-middle,
.footer-bottom {
  background-color: #382d6e;
  max-width: 90%;
  margin: 0 auto;
}

.footer-top {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid white;
}

.footer-text {
  font-size: 0.875rem;
  margin-left: 15px;
}

.social-icons {
  display: flex;
  gap: 1rem;
  margin-right: 15px;
}

.icon {
  width: 1.75rem;
  height: 1.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #8573df;
  border-radius: 30%;
  padding: 0.3rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.4s ease, background-color 0.4s ease, box-shadow 0.4s ease;
}

.icon:hover {
  background-color: #6a56c1;
  transform: scale(1.1) translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.footer-middle {
  padding: 2rem;
  border-bottom: 1px solid white;
}

.footer-grid {
  max-width: 72rem;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 768px) {
  .footer-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.footer-title {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 1rem;
  padding-bottom: 0.3rem;
  display: inline-block;
  border-bottom: 2px solid rgba(133, 115, 223, 0.7);
  width: fit-content;
}

.footer-description,
.footer-list,
.footer-contact {
  font-size: 0.875rem;
}

.footer-list,
.footer-contact {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.footer-list li,
.footer-contact li {
  margin-bottom: 0.5rem;
}

.contact-item {
  display: flex;
  align-items: center;
}

.icon-small {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
}

.icon-location {
  width: 2.5rem;
  height: 1.5rem;
  margin-right: 0.5rem;
  margin-bottom: 35px;
}

.footer-bottom {
  text-align: center;
  padding: 1rem;
  font-size: 0.875rem;
}

.footer-link {
  color: white;
  text-decoration: none;
  transition: color 0.3s ease, transform 0.3s ease;
  display: inline-block;
}

.footer-link:hover {
  color: #8573df;
  transform: translateX(5px);
}
</style>