<template>
    <a-textarea v-bind="comDes.props" :max-length="textareaMaxLength"
        :show-word-limit="Boolean(comDes.props.showWordLimit)" v-model="comDes.props.value"
        @input="changeItem"></a-textarea>
</template>
  
<script lang="ts" setup>
import { computed } from 'vue'
const props = defineProps<{
    comDes: any,
    formConfs: any,
}>()
const textareaMaxLength = computed(() => {
    if (!props.comDes?.props?.showWordLimit) return undefined
    const maxLength = Number(props.comDes.props.maxLength)
    return Number.isFinite(maxLength) && maxLength > 0 ? maxLength : undefined
})

const changeItem = () => {

}
</script>
  
<style lang="scss" scoped>
@use "styles/textColor.scss" as textColor;
</style>
  
