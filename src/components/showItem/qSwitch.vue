<template>
    <a-switch v-bind="comDes.props" v-model="comDes.props.value">
        <template #checked>
            {{ comDes.props.on }}
        </template>
        <template #unchecked>
            {{ comDes.props.off }}
        </template>
    </a-switch>
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
  