<template>
    <a-input-number :precision="comDes.props.precision" :placeholder="comDes.props.placeholder"
        :disabled="comDes.props.disabled" :readonly="comDes.props.readonly"
        :max-length="comDes.props.showWordLimit ? comDes.props.maxLength : 10000"
        :show-word-limit="comDes.props.showWordLimit" :allowClear="comDes.props.allowClear" @change="inputItem"
        :default-value="normalizedDefaultValue" :model-value="normalizedValue"
        @update:model-value="updateValue"></a-input-number>
</template>

<script lang="ts" setup>
import axios from 'axios'
import { computed } from 'vue'
const props = defineProps<{
    comDes: any,
    formConfs: any,
}>()
const normalizeNumber = (value: unknown): number | undefined => {
    if (value === null || value === undefined || value === '') return undefined
    if (typeof value === 'string' && value.trim() === '') return undefined

    const numberValue = Number(value)
    return Number.isFinite(numberValue) ? numberValue : undefined
}
const normalizedValue = computed(() => normalizeNumber(props.comDes.props.value))
const normalizedDefaultValue = computed(() => normalizeNumber(props.comDes.props.defaultValue))
const updateValue = (value: number | undefined) => {
    props.comDes.props.value = value ?? ''
}
const inputItem = () => {
    let val = props.comDes.value
    if (props.comDes.method.input) {
        try {
            // eval(props.comDes.method.input);
        } catch (error) {
            console.error('代码执行出错:', error);
        }
    }

}
</script>

<style lang="scss" scoped>
@use "styles/textColor.scss" as textColor;

.input {
    width: 100%;
}
</style>
