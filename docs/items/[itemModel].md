# 模型数据

##  {{modelInfo.name[0]}}

<ItemModel :imgUrl="`/modelImg/${modelInfo.enName}/image.png`"></ItemModel>

## 别名

<ul>
  <li v-for="(item, index) in modelInfo.name" :key="index">
    {{ item }}
  </li>
</ul>

## 可用物品

<ItemList :itemList="modelInfo.item"></ItemList>

<script lang='ts' setup>
    import {ref} from 'vue'
    import { useData } from 'vitepress'
    import ItemModel from '../components/itemModel.vue'
    import ItemList from '../components/itemList.vue'
    const { params } = useData()
    // console.log(params)

// 动态加载 JSON
    // const data = await import(`/modelData/${params.value.name}.json`)

    const modelInfo = ref({
        name: [],
        enName: '',
        item: []
    })

    async function loadData() {
        const res = await import(`../modelData/${params.value.name}.json`)
        modelInfo.value.name = res.default.name
        modelInfo.value.enName = res.default.enName
        modelInfo.value.item = res.default.item
    }
    loadData()
</script>
