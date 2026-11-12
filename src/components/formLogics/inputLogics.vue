<template>
    <div class="inputLogics">
        <a-input class="input" allow-clear
            v-if="datas.condition !== 'NOT_NULL' && (datas.condition == 'NE' || datas.condition == 'EQ' || datas.condition == 'LIKE' || datas.condition == 'NOT_LIKE')"
            v-model="datas.value"></a-input>
            <a-select  v-model="datas.value" allow-clear v-if="datas.condition !== 'NOT_NULL' && datas.condition !== 'IS_NULL' && datas.condition !== 'NE' && datas.condition !== 'EQ' && datas.condition !== 'LIKE' && datas.condition !== 'NOT_LIKE'" multiple allow-create>
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

.inputLogics {
    margin-left: 10px;
    width: 100%;
}
</style>
  