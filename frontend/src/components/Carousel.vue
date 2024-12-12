<template>
  <section class="collection">
    <div class="header">
      <h2>WHY CHOOSE US?<span class="underline"></span></h2>
    </div>
    <swiper
      :modules="modules"
      :loop="true"
      :loopedSlides="3"
      :centered-slides="true"
      :slides-per-view="2.5"
      :space-between="30"
      :width="getContainerWidth()"
      :effect="'coverflow'"
      :coverflowEffect="{
        rotate: 0,
        stretch: 0,
        depth: 100,
        modifier: 2,
        slideShadows: true
      }"
      :breakpoints="{
        320: {
          slidesPerView: 1,
          spaceBetween: 20
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 20
        },
        1024: {
          slidesPerView: 2.5,
          spaceBetween: 20
        }
      }"
      :autoplay="autoplayConfig"
      :pagination="{
        clickable: true,
      }"
      @swiper="onSwiper"
      class="mySwiper"
    >
      <swiper-slide v-for="(image, index) in images" :key="index" class="content">
        <div class="slide-content" :class="{ 'expanded': expandedSlides[index] }">
          <div class="image-container">
            <img :src="image.src" :alt="image.title">
          </div>
          <div class="text-content">
            <h3>{{ image.title }}</h3>
            <div class="description-container" :class="{ 'scrollable': expandedSlides[index] }">
              <p>{{ image.description }}</p>
            </div>
            <button class="btn" @click="toggleExpand(index)">
              {{ expandedSlides[index] ? 'Read less' : 'Read more' }}
            </button>
          </div>
        </div>
      </swiper-slide>
    </swiper>
  </section>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, Pagination, EffectCoverflow } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

export default {
  name: 'SwiperCollection',
  components: {
    Swiper,
    SwiperSlide,
  },
  setup() {
    const swiperInstance = ref(null);
    const autoplayConfig = ref({
      delay: 3000,
      disableOnInteraction: true,
      pauseOnMouseEnter: true,
    });
    const expandedSlides = reactive({});
    const modules = [Autoplay, Pagination, EffectCoverflow];
    const slidesPerView = ref(2.5); // Initialize with default value

    const onSwiper = (swiper) => {
      swiperInstance.value = swiper;
    };

    const toggleExpand = (index) => {
      expandedSlides[index] = !expandedSlides[index];
      if (expandedSlides[index]) {
        swiperInstance.value?.autoplay?.stop();
        swiperInstance.value.allowTouchMove = false;
      } else {
        swiperInstance.value?.autoplay?.start();
        swiperInstance.value.allowTouchMove = true;
      }
      swiperInstance.value?.update();
    };

    const updateSlidesPerView = () => {
      //Removed previous logic, breakpoints handle responsiveness now.
    };

    const getContainerWidth = () => {
      return typeof window !== 'undefined' ? window.innerWidth + 200 : 1200;
    };

    onMounted(() => {
      // updateSlidesPerView(); //No longer needed due to breakpoints
      window.addEventListener('resize', updateSlidesPerView);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', updateSlidesPerView);
    });

    return {
      modules,
      swiperInstance,
      autoplayConfig,
      onSwiper,
      expandedSlides,
      toggleExpand,
      slidesPerView,
      getContainerWidth,
    };
  },
  data() {
    return {
      images: [
        { src: '/src/images/Expertise_in_Medical_Spa_Services.png', title: 'Expertise in Medical Spa Services', description: 'At Mejico MD Medical Spa, we blend medical precision with spa luxury, offering services supervised by certified specialists and licensed practitioners. Our team is dedicated to achieving safe, effective, and transformative results for every client. We continuously update our knowledge and skills to bring you the latest and most effective treatments in the medical spa industry.' },
        { src: '/src/images/treatmentplans.png', title: 'Customized Treatment Plans', description: 'Every individual is unique, and so are their skincare and wellness needs. We offer personalized consultations to design custom treatment plans that address your specific goals, ensuring results that feel and look natural. Our experts take the time to understand your concerns, lifestyle, and desired outcomes to create a tailored approach that works best for you.' },
        { src: '/src/images/safehygienic.png', title: 'Safe and Hygienic Environment', description: 'Your safety and comfort are our top priorities. We maintain strict cleanliness and sterilization protocols to ensure a safe, relaxing, and hygienic environment where you can unwind with peace of mind. Our state-of-the-art facility is equipped with the latest technology and adheres to the highest standards of safety and hygiene in the industry.' },
        { src: '/src/images/holisticwellness.png', title: 'Holistic Approach to Wellness', description: 'Beyond beauty, we focus on holistic health, promoting overall well-being through a combination of medical and therapeutic services. Our treatments not only enhance your appearance but also foster relaxation, inner peace, and vitality. We believe in nurturing the connection between physical appearance and mental well-being for a truly transformative experience.' },
        { src: '/src/images/customercare.png', title: 'Exceptional Customer Care', description: 'We pride ourselves on our warm, welcoming atmosphere and attentive service. From the moment you arrive to the completion of your treatment, our team is dedicated to making your experience seamless and enjoyable. We listen to your concerns, answer your questions, and ensure you feel comfortable and confident throughout your journey with us.' },
        { src: '/src/images/location&schedule.png', title: 'Convenient Location and Flexible Scheduling', description: 'Located in a prime, accessible area, Mejico MD Medical Spa offers flexible scheduling options to fit your busy lifestyle. We strive to make quality care convenient and available to all who seek it. Our extended hours and efficient booking system ensure that you can receive the care you need at a time that works best for you.' },
      ],
    };
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500&display=swap');

.collection {
  background-color: #ffffff;
  padding: 2rem 0;
  text-align: center;
}

.header h2 {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #382d6e;
  margin-top: 15px;
  position: relative;
  display: inline-block;
}

.header h2 .underline {
  display: block;
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 3px;
  background-color: #6656b3;
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

.mySwiper {
  width: calc(100% + 200px);
  margin-left: -100px;
  padding: 0;
  overflow: visible;
}

:deep(.swiper-wrapper) {
  overflow: visible;
  width: 100%;
}

:deep(.swiper-slide) {
  opacity: 1 !important;
}

.content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide-content {
  background-color: #382d6e;
  border: 0.2rem solid rgba(255, 255, 255, 0.1);
  border-radius: 0.7rem;
  overflow: hidden;
  text-align: center;
  padding: 1rem;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.slide-content.expanded {
  position: relative;
  z-index: 10;
}

.image-container {
  width: 100%;
  height: 250px;
  overflow: hidden;
  border-bottom: 0.3rem solid #7964e4;
  border-radius: 0.6rem 0.6rem 0 0;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.text-content {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;
  padding-top: 1rem;
  flex-grow: 1;
  overflow: hidden;
}

.text-content h3 {
  font-size: 18px;
  font-weight: 500;
  margin: 0.8rem 0;
  color: #ffffff;
}

.description-container {
  max-height: 80px;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.description-container.scrollable {
  max-height: 200px;
  overflow-y: auto;
}

.text-content p {
  font-size: 12px;
  font-weight: 400;
  color: #b5b5b5;
  text-align: left;
  margin-bottom: 1rem;
  padding-right: 10px;
}

.btn {
  background-color: #7964e4;
  padding: 0.5rem 1rem;
  border: none;
  color: white;
  font-size: 0.9rem;
  border-radius: 0.5rem;
  margin-top: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn:hover {
  background-color: #5d4db0;
}

:deep(.swiper-pagination) {
  position: relative;
  margin-top: 1rem;
}

:deep(.swiper-pagination-bullet) {
  background-color: #5e4db5;
  opacity: 1;
}

:deep(.swiper-pagination-bullet-active) {
  background-color: #5d4db0;
}

.description-container::-webkit-scrollbar {
  width: 4px;
}

.description-container::-webkit-scrollbar-track {
  background: transparent;
}

.description-container::-webkit-scrollbar-thumb {
  background-color: rgba(121, 100, 228, 0.5);
  border-radius: 20px;
}

.description-container::-webkit-scrollbar-thumb:hover {
  background-color: rgba(121, 100, 228, 0.8);
}

@media (max-width: 1024px) {
  .mySwiper {
    padding: 0 30px;
  }
}

@media (max-width: 768px) {
  .mySwiper {
    padding: 0 20px;
  }
}
</style>

