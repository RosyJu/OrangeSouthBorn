<!-- ------------------------------template------------------------------ -->
<template>
    <div class="box">
        <itemModel v-for="item in itemList" :imgUrl="`/items/${item}.png`"></itemModel>
    </div>
</template>


<!-- ------------------------------script------------------------------ -->
<script lang='ts' setup>

import itemModel from '../components/itemModel.vue'

const props = defineProps({
    itemList: Array
})



// const newItemList = reactive()

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