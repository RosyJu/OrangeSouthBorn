# 模型数据

##  {{modelInfo.name[0]}}

<ItemModel :imgUrl="`/modelImg/${modelInfo.enName}/image.png`"></ItemModel>

## 铁砧可用命名

<ul>
  <li v-for="(item, index) in modelInfo.name" :key="index">
    {{ item }}
  </li>
</ul>


## 可用物品

<ItemList :itemList="modelInfo.item"></ItemList>

<script lang='ts' setup>
    import {ref, onMounted} from 'vue'
    import { useData } from 'vitepress'
    import ItemModel from '../components/itemModel.vue'
    import ItemList from '../components/itemList.vue'
    const { params } = useData()

    const modelInfo = ref({
        name: [],
        enName: '',
        item: []
    })

    onMounted(async () => {
        if (params.value && params.value.itemModel) {
            const res = await import(`../modelData/${params.value.itemModel}.json`)
            modelInfo.value.name = res.default.name
            modelInfo.value.enName = res.default.enName
            modelInfo.value.item = res.default.item
        }
    })
</script>
