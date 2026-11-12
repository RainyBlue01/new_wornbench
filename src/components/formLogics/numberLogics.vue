<template>
    <div class="numberLogics">
        <a-input-number allow-clear
            v-if="datas.condition !== 'NOT_NULL' && datas.condition !== 'IS_NULL' && datas.condition !== 'BETWEEN'"
            controls-position="right" class="num" v-model="datas.value" placeholder="请设置字段" />
        <div class="numberLogics-body" v-if="datas.condition == 'BETWEEN'">
            <div class="numberLogics-body-item">
                <a-input-number v-model="datas.min" placeholder="请设置字段" />
            </div>

            <div class="tip">
                ~ </div>
            <div class="numberLogics-body-item">
                <a-input-number v-model="datas.max" placeholder="请设置字段" />
            </div>

        </div>
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

.numberLogics {
    margin-left: 10px;
    width: 100%;

    &-body {
        display: flex;
        align-items: center;

        .tip {
            margin: 0 10px;
        }

        &-item {
            width: calc(50% - 15px);
        }
    }
}
</style>
  