<template>
    <a-rate v-bind="comDes.props" v-model="comDes.props.value">
    </a-rate>
</template>
<script lang="ts" setup>
import { uploadATTACH } from '@/api/application/index'
import { ref } from 'vue'
const props = defineProps<{
    comDes: any,
    formConfs: any,
}>()
</script>
<style lang="scss" scoped>
@use "styles/textColor.scss" as textColor;
</style>
  