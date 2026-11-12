<template>
      <selectCheckDept :formConfs="formConfs" :comDes="comDes" :deptList="deptList" :placeholder="comDes.props.placeholder" v-model="comDes.props.value" />
</template>

<script lang="ts" setup>
const props = defineProps<{
    comDes: any,
    showEdit: any,
    deptList:any,
    formConfs: any,
}>()
</script>

<style lang="scss" scoped>
@use "styles/textColor.scss" as textColor;

.input {
    width: 100%;
}
</style>