<template>
    <div class="title" :style="comDes.props.fontSize == 'H1' ? 'font-size:32px' : comDes.props.fontSize == 'H2' ? 'font-size:24px' : comDes.props.fontSize == 'H3' ? 'font-size:18px' : comDes.props.fontSize == 'H4' ? 'font-size:16px' : comDes.props.fontSize == 'H5' ? 'font-size:14px' : 'font-size:12px'">
        {{ comDes.title }}
    </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
const props = defineProps<{
    comDes: any,
    formConfs: any,
}>()
</script>
<style lang="scss" scoped>
@use "styles/textColor.scss" as textColor;

.title {
    font-size: 36px;
    font-weight: 500;
    margin-bottom: 10px;
}
</style>
  