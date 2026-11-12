<template>
  <div class="timeLogics">
    <a-time-picker
      v-if="showSinglePicker"
      v-model="datas.value"
      :format="pickerConfig.format"
      :value-format="pickerConfig.valueFormat"
      allow-clear
    />
    <a-time-picker
      v-if="datas.condition === 'BETWEEN'"
      v-model="datas.value"
      :format="pickerConfig.format"
      :value-format="pickerConfig.valueFormat"
      allow-clear
      type="time-range"
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
</script>

<style lang="scss" scoped>
.timeLogics {
  margin-left: 10px;
  width: 100%;
}
</style>
