<template>
    <a-time-picker v-bind="pickerProps" @change="inputItem" v-model="dates" />
</template>
  
<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

const props = defineProps<{
    comDes: any,
    formConfs: any,
}>()

const timeFormat = computed(() => props.comDes.props?.format || 'HH:mm:ss')

const pickerProps = computed(() => {
    const { 'value-format': _vf, valueFormat: _vf2, value: _value, defaultValue: _defaultValue, ...rest } = props.comDes.props || {}
    return rest
})

function parseTimeValue(val: any) {
    if (val == null || val === '') return undefined
    if (dayjs.isDayjs(val)) return val
    const parsed = dayjs(String(val), timeFormat.value, true)
    return parsed.isValid() ? parsed : undefined
}

function formatTimeValue(val: any) {
    if (val == null || val === '') return ''
    if (dayjs.isDayjs(val)) return val.format(timeFormat.value)
    return val
}

const dates = ref<any>()

function initDates() {
    if (props.comDes?.type === 'TIME_INTERVAL') {
        const defaultValue = props.comDes.props.defaultValue
        if (defaultValue?.start && defaultValue?.end) {
            dates.value = [parseTimeValue(defaultValue.start), parseTimeValue(defaultValue.end)]
        } else {
            dates.value = []
        }
        return
    }
    dates.value = parseTimeValue(props.comDes?.props?.defaultValue)
}

initDates()

watch(() => props.comDes.props.defaultValue, initDates, { deep: true })

const inputItem = () => {
    if (Array.isArray(dates.value)) {
        if (dates.value.length > 0) {
            props.comDes.props.defaultValue = {
                start: formatTimeValue(dates.value[0]),
                end: formatTimeValue(dates.value[1]),
            }
        }
        return
    }
    props.comDes.props.defaultValue = formatTimeValue(dates.value)
}
</script>
  
<style lang="scss" scoped>
@use "styles/textColor.scss" as textColor;

.input {
    width: 100%;
}
</style>
