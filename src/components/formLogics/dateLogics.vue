<template>
  <div class="dateLogics">
    <component
      :is="singlePickerComponent"
      v-if="showSinglePicker"
      v-bind="singlePickerProps"
      v-model="datas.value"
    />
    <a-range-picker
      v-if="datas.condition === 'BETWEEN'"
      v-bind="rangePickerProps"
      v-model="datas.value"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { resolveReportFilterTemporalConfig } from '@/utils/reportFilterTemporal'

const props = defineProps<{
  datas: Record<string, any>
}>()

const pickerConfig = computed(() => resolveReportFilterTemporalConfig(props.datas))

const showSinglePicker = computed(() =>
  !['NOT_NULL', 'IS_NULL'].includes(props.datas.condition) &&
  ['GE', 'LE', 'NE', 'EQ', 'GT', 'LT'].includes(props.datas.condition)
)

const singlePickerComponent = computed(() => {
  if (pickerConfig.value.mode === 'year') return 'a-year-picker'
  if (pickerConfig.value.mode === 'month') return 'a-month-picker'
  return 'a-date-picker'
})

const singlePickerProps = computed(() => ({
  allowClear: true,
  format: pickerConfig.value.format,
  valueFormat: pickerConfig.value.valueFormat,
  showTime: pickerConfig.value.mode === 'date' && pickerConfig.value.showTime,
  style: { width: '100%' },
}))

const rangePickerProps = computed(() => ({
  allowClear: true,
  format: pickerConfig.value.format,
  valueFormat: pickerConfig.value.valueFormat,
  mode: pickerConfig.value.mode,
  showTime: pickerConfig.value.mode === 'date' && pickerConfig.value.showTime,
  style: { width: '100%' },
}))
</script>

<style lang="scss" scoped>
.dateLogics {
  margin-left: 10px;
  width: 100%;
}
</style>
