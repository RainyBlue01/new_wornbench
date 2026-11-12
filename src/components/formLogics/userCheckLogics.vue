<template>
    <div class="userLogics" v-if="datas.condition !== 'NOT_NULL' && datas.condition !== 'IS_NULL'">
       
        <selectCheckPerson :deptList="deptList" :comDes="{ props: {} }" v-model="datas.default" />
    </div>
</template>

<script lang="ts" setup>
import { ref, defineExpose, inject } from 'vue'
const props = defineProps<{
    datas: object,
    deptList: any
}>()
const emit = defineEmits(['update:datas'])
const updateDatas = (val) => {
    console.log(val)
    // emit('update:datas', val)
}
defineExpose({ updateDatas })

</script>

<style lang="scss" scoped>
@use "styles/textColor.scss" as textColor;

.userLogics {
    margin-left: 10px;
    width: 100%;
}
</style>