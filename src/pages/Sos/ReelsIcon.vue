<template>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <!-- Main rounded rectangle -->
        <path
            d="M3 6C3 4.34315 4.34315 3 6 3H18C19.6569 3 21 4.34315 21 6V18C21 19.6569 19.6569 21 18 21H6C4.34315 21 3 19.6569 3 18V6Z"
            fill="none" stroke="currentColor" stroke-width="2" />

        <!-- Diagonal lines representing film strip -->
        <path d="M16.5 4L7.5 20" stroke="currentColor" stroke-width="1.5" />
        <path d="M13.5 4L4.5 20" stroke="currentColor" stroke-width="1.5" />
        <path d="M19.5 4L10.5 20" stroke="currentColor" stroke-width="1.5" />

        <!-- Small play triangle -->
        <path d="M10 9.5L15 12L10 14.5V9.5Z" fill="currentColor" />
    </svg>
</template>

<script>
export default {
    name: 'ReelsIcon'
}
</script>
