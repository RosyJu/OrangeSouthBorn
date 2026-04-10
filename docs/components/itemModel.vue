<!-- ------------------------------template------------------------------ -->
<template>
    <div class="core">
        <div class="image">
            <img :src="imgUrl" alt="">
        </div>
    </div>
</template>



<!-- ------------------------------script------------------------------ -->
<script lang='ts' setup>

    const props = defineProps({
        imgUrl: String
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