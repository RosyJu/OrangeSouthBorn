<!-- ------------------------------template------------------------------ -->
<template>
    <div class="box">
        <itemModel v-for="model in modelList" :key="model" :imgUrl="`/modelImg/${model}/image.png`"
            @click="router.go(`/items/${model}`)" style="cursor: pointer;"></itemModel>
    </div>
</template>


<!-- ------------------------------script------------------------------ -->
<script lang='ts' setup>

import itemModel from '../components/itemModel.vue'
import { reactive } from 'vue';
import modelInfo from '../public/item/modelInfo.json';
import { useRouter } from 'vitepress'

// 获取路由实例
const router = useRouter()


const modelList = reactive(modelInfo)

</script>


<!-- ------------------------------style------------------------------ -->
<style lang='scss' scoped>
div.box {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 12px;
}
</style>