<!-- ------------------------------template------------------------------ -->
<template>
    <div class="core">
        <div class="image">
            <img ref="imgRef" :src="isLoaded ? imgUrl : ''" alt="">
        </div>
    </div>
</template>



<!-- ------------------------------script------------------------------ -->
<script lang='ts' setup>
import { ref, onMounted, onUnmounted } from 'vue'

    const props = defineProps({
        imgUrl: String
    })

    const imgRef = ref<HTMLImageElement | null>(null)
    const isLoaded = ref(false)
    let observer: IntersectionObserver | null = null

    onMounted(() => {
        if (imgRef.value) {
            observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        isLoaded.value = true
                        if (observer && imgRef.value) {
                            observer.unobserve(imgRef.value)
                        }
                    }
                })
            }, {
                rootMargin: '100px'
            })

            observer.observe(imgRef.value)
        }
    })

    onUnmounted(() => {
        if (observer) {
            observer.disconnect()
        }
    })
</script>


<!-- ------------------------------style------------------------------ -->
<style lang='scss' scoped>
    div.core {
        width: 96px;
        height: 96px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 16px solid transparent;
        border-image-slice: 18;
        border-image-repeat: round;
        border-image-source: url(/border/default.png);
        div.image {
            width: 64px;
            height: 64px;
            display: flex;
            align-items: center;
            justify-content: center;
            img {
                width: 64px;
                height: 64px;
                object-fit: contain;
                image-rendering: pixelated;
            }
        }
    }

</style>