<template>
    <div class="formLogics">
        <inputLogics
            v-if="datas.inputType === 'INPUT' || datas.inputType === 'TIME_INTERVAL' || datas.inputType === 'DATE_INTERVAL' || datas.inputType === 'TEXTAREA' || datas.inputType === 'PHONE' || datas.inputType === 'ID_CARD' || datas.inputType === 'EMAIL' || datas.inputType === 'URL'"
            :datas="datas" />
        <radioLogics v-if="datas.inputType === 'RADIO' || datas.inputType === 'SELECT' || datas.inputType === 'SWITCH'" :datas="datas" />
        <checkboxLogics v-if="datas.inputType === 'CHECKBOX' || datas.inputType === 'SELECT_MULTIPLE'" :datas="datas" />
        <numberLogics v-if="datas.inputType === 'MONEY' || datas.inputType === 'RATE' || datas.inputType === 'NUMBER'"
            :datas="datas" />
        <dateLogics v-if="datas.inputType === 'DATE'" :datas="datas" />
        <timeLogics v-if="datas.inputType === 'TIME'" :datas="datas" />
        <addressLogics v-if="datas.inputType === 'ADDRESS' || datas.inputType === 'LOCATION'" :datas="datas" />
        <userLogics v-if="datas.inputType === 'USER'" :datas="datas" :deptList="deptList" />
        <userCheckLogics v-if="datas.inputType === 'USER_MULTIPLE'" :datas="datas" :deptList="deptList" />
        <deptLogics v-if="datas.inputType === 'DEPT'" :datas="datas" :deptList="deptList" />
        <deptCheckLogics v-if="datas.inputType === 'DEPT_MULTIPLE'" :datas="datas" :deptList="deptList" />
    </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
    datas: object,
    deptList: any,
}>()

</script>

<style lang="scss" scoped>
@use "styles/textColor.scss" as textColor;

.formLogics {
    width: calc(100% - 220px);
}
</style>
