<template>
    <a-range-picker v-bind="rangePickerProps" :defaultValue="[]" @change="inputItem" v-model="dates">

    </a-range-picker>
</template>
  
<script lang="ts" setup>
import { computed, ref, watchEffect } from 'vue'
const props = defineProps<{
    comDes: any,
    formConfs: any,
}>()
const dates = ref([])

const dateFormat = computed(() => props.comDes.props?.format || 'YYYY-MM-DD')
const normalizedDateFormat = computed(() => dateFormat.value.replace('yyyy', 'YYYY').replace('dd', 'DD'))

const rangeMode = computed(() => {
    if (normalizedDateFormat.value === 'YYYY') {
        return 'year'
    }
    if (normalizedDateFormat.value === 'YYYY-MM' || normalizedDateFormat.value === 'YYYY.MM') {
        return 'month'
    }
    return undefined
})

const rangePickerProps = computed(() => {
    const restProps = { ...(props.comDes.props || {}) }
    delete restProps.defaultValue
    delete restProps.mode
    delete restProps.showTime

    return {
        ...restProps,
        format: normalizedDateFormat.value,
        ...(rangeMode.value ? { mode: rangeMode.value } : {}),
        showTime: normalizedDateFormat.value.includes('HH'),
    }
})

watchEffect(() => {
    if (props.comDes.props?.defaultValue?.start && props.comDes.props?.defaultValue?.end) {
        dates.value = [props.comDes.props.defaultValue.start, props.comDes.props.defaultValue.end]
    } else {
        dates.value = []
    }
})

const inputItem = () => {
    if (Array.isArray(dates.value) && dates.value.length > 0) {
        props.comDes.props.defaultValue = {
            start: dates.value[0],
            end: dates.value[1]
        }
    } else {
        props.comDes.props.defaultValue = {
            start: '',
            end: ''
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
  
