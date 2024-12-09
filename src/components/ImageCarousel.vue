<template>
    <div class="carousel-wrapper" v-if="isVisible">
        <!-- Close button -->
        <button class="carousel-close" @click="closeCarousel">
            <i class="material-icons">close</i>
        </button>

        <!-- Image counter -->
        <div class="carousel-counter">
            {{ currentIndex + 1 }} / {{ totalImages }}
        </div>

        <div class="carousel-inner" :style="carouselStyle">
            <div v-for="(url, index) in imageUrls" :key="index" class="carousel-slide"
                :class="{ active: currentIndex === index }" v-intersection="onCarouselImageIntersection(index)"
                ref="carouselImages">
                <img :src="url" :alt="`Image ${index + 1}`" class="carousel-image" @click.stop />
            </div>
        </div>

        <div class="custom-carousel" ref="carousel" @touchstart="handleTouchStart" @touchmove="handleTouchMove"
            @touchend="handleTouchEnd">
            <!-- Navigation Arrows -->
            <button class="carousel-arrow prev" @click.stop="prevSlide" v-show="currentIndex > 0">
                <i class="material-icons">chevron_left</i>
            </button>
            <button class="carousel-arrow next" @click.stop="nextSlide" v-show="!isLastSlide">
                <i class="material-icons">chevron_right</i>
            </button>

            <!-- Dots Navigation -->
            <div class="carousel-dots">
                <button v-for="index in totalImages" :key="index" class="dot"
                    :class="{ active: currentIndex === index - 1 }" @click.stop="goToSlide(index - 1)">
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
    imageUrls: string[];
    isVisible: boolean;
    initialIndex?: number;
}>();

const emit = defineEmits<{
    (e: 'update:isVisible', value: boolean): void;
    (e: 'slideChange', index: number): void;
}>();

const currentIndex = ref(props.initialIndex || 0);
const isTransitioning = ref(false);
const touchStart = ref(0);
const carousel = ref<HTMLElement | null>(null);

const totalImages = computed(() => props.imageUrls.length);
const isLastSlide = computed(() => currentIndex.value === totalImages.value - 1);

const carouselStyle = computed(() => ({
    transform: `translate3d(-${currentIndex.value * 100}%, 0, 0)`,
    willChange: 'transform'
}));

const closeCarousel = () => {
    emit('update:isVisible', false);
};

const goToSlide = (index: number) => {
    if (isTransitioning.value || !carousel.value) return;
    isTransitioning.value = true;
    currentIndex.value = index;
    emit('slideChange', index);

    setTimeout(() => {
        isTransitioning.value = false;
    }, 300);
};

const prevSlide = () => {
    if (currentIndex.value > 0) {
        goToSlide(currentIndex.value - 1);
    }
};

const nextSlide = () => {
    if (currentIndex.value < totalImages.value - 1) {
        goToSlide(currentIndex.value + 1);
    }
};

// Touch handling methods
const handleTouchStart = (event: TouchEvent) => {
    touchStart.value = event.touches[0].clientX;
};

const handleTouchMove = (event: TouchEvent) => {
    if (!touchStart.value || !carousel.value) return;
    event.preventDefault();
};

const handleTouchEnd = (event: TouchEvent) => {
    if (!touchStart.value || !carousel.value) return;
    const touchEnd = event.changedTouches[0].clientX;
    const diff = touchStart.value - touchEnd;

    if (Math.abs(diff) > 50) {
        if (diff > 0) {
            nextSlide();
        } else {
            prevSlide();
        }
    }
    touchStart.value = 0;
};

const onCarouselImageIntersection = (index: number) => ({
    handler: (entry?: IntersectionObserverEntry) => {
        if (entry?.isIntersecting) {
            emit('slideChange', index);
        }
        return true;
    },
    cfg: {
        threshold: [0.5]
    }
});

// Keyboard navigation
const handleKeydown = (event: KeyboardEvent) => {
    if (!props.isVisible) return;

    switch (event.key) {
        case 'ArrowLeft':
            prevSlide();
            break;
        case 'ArrowRight':
            nextSlide();
            break;
        case 'Escape':
            closeCarousel();
            break;
    }
};

onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
});
</script>

<style lang="scss" scoped>
// Copy all the carousel-related styles from CommentsDialog.vue
// (carousel-wrapper, carousel-inner, carousel-slide, carousel-image, etc.)</style>
