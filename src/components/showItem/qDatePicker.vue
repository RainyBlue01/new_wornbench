<template>
    <component
        :is="pickerComponent"
        v-bind="pickerProps"
        v-model="comDes.props.value"
        @change="inputItem"
    />
</template>
  
<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps<{
    comDes: any,
    formConfs: any,
}>()

const dateFormat = computed(() => props.comDes.props?.format || 'YYYY-MM-DD')
const normalizedDateFormat = computed(() => dateFormat.value.replace('yyyy', 'YYYY').replace('dd', 'DD'))

const pickerComponent = computed(() => {
    if (normalizedDateFormat.value === 'YYYY') {
        return 'a-year-picker'
    }
    if (normalizedDateFormat.value === 'YYYY-MM' || normalizedDateFormat.value === 'YYYY.MM') {
        return 'a-month-picker'
    }
    return 'a-date-picker'
})

const pickerProps = computed(() => {
    const restProps = { ...(props.comDes.props || {}) }
    delete restProps.value
    delete restProps.showTime
    restProps.format = normalizedDateFormat.value

    if (pickerComponent.value !== 'a-date-picker') {
        return restProps
    }

    return {
        ...restProps,
        showTime: normalizedDateFormat.value.includes('HH'),
    }
})

const inputItem = () => {
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
.input{
    width: 100%;
}
</style>
  
