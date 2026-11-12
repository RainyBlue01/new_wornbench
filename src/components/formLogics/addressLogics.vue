<template>
    <div class="selectLogics">
        <a-row :gutter="10" v-if="datas.condition !== 'NOT_NULL' && datas.condition !== 'IS_NULL'">
            <a-col :span="8">
                <a-select placeholder="请选择省" allow-clear @change="changeProvince" v-model="datas.value[0]"
                    :options="area"></a-select>
            </a-col>
            <a-col :span="8">
                <a-select placeholder="请选择市" allow-clear @change="changeCity" v-model="datas.value[1]"
                    :options="city"></a-select>
            </a-col>
            <a-col :span="8" v-show="datas.default !== 1">
                <a-select placeholder="请选择区" allow-clear v-model="datas.value[2]" :options="District"></a-select>
            </a-col>
        </a-row>
    </div>
</template>
  
<script lang="ts" setup>
import { pca, pcaa } from 'area-data'; // v5 或更高版本
import { ref, defineExpose, inject } from 'vue'
const area = ref([])
const selectedProvince = ref('')
const selectedCity = ref('')
const selectedDistrict = ref('')
const dat = pcaa[86]
area.value = Object.keys(dat).map(key => ({ value: key, label: dat[key] }))
const city = ref([])
const District = ref([])
const props = defineProps<{
    datas: object,
}>()
const changeProvince = () => {
    if (props.datas.value[0]) {
        const Province = pcaa[props.datas.value[0]]
        city.value = Object.keys(Province).map(key => ({ value: key, label: Province[key] }))
    } else {
        city.value = []

    }
    District.value = []
    props.datas.value[1] = ''
    props.datas.value[2] = ''
}
const changeCity = () => {
    if (props.datas.value[1]) {
        const Province = pcaa[props.datas.value[1]]
        District.value = Object.keys(Province).map(key => ({ value: key, label: Province[key] }))
    } else {
        District.value = []
    }

    props.datas.value[2] = ''
}
</script>
  
<style lang="scss" scoped>
@use "styles/textColor.scss" as textColor;

.selectLogics {
    margin-left: 10px;
    width: 100%;
}
</style>
  