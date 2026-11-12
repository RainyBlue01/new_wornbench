<template>
    <div class="selectLogics">
        <a-select allow-clear v-model="datas.value" v-if="datas.condition !== 'NOT_NULL' && datas.condition !== 'IS_NULL'"
            :multiple="(datas.condition !== 'NE' && datas.condition !== 'EQ')" >
            <a-option v-for="(items1, index) in (datas.default || [])" :key="items1.value ?? items1.label ?? index" :label="items1.label" :value="items1.value">
            </a-option>
        </a-select>
    </div>
</template>
  
<script lang="ts" setup>
import { ref, defineExpose, inject } from 'vue'
const props = defineProps<{
    datas: object,
}>()

</script>
  
<style lang="scss" scoped>
@use "styles/textColor.scss" as textColor;

.selectLogics {
    margin-left: 10px;
    width: 100%;
}
</style>
  