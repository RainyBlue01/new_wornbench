<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  field: any
  modelValue: any
  errorMessage?: string
  isDisabled?: boolean
  isReadonly?: boolean
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: any): void
}>()

const updateValue = (value: any) => {
  emit('update:modelValue', value)
}

const pickerFormat = computed(() => {
  const format = props.field?.format
  if (!format || format === 'date' || format === 'dateRange' || format === 'textarea') {
    return 'YYYY-MM-DD'
  }
  return format
})
</script>

<template>
  <div class="q-json-schema__field">
    <div class="q-json-schema__label">
      <span>{{ props.field.title }}</span>
      <span v-if="props.field.required" class="q-json-schema__required">*</span>
    </div>
    <a-input
      v-if="props.field.component === 'input'"
      :model-value="props.modelValue == null ? '' : String(props.modelValue)"
      :placeholder="props.field.placeholder"
      :disabled="props.isDisabled"
      :readonly="props.isReadonly"
      :max-length="props.field.maxLength"
      allow-clear
      @update:model-value="updateValue"
    />
    <a-textarea
      v-else-if="props.field.component === 'textarea'"
      :model-value="props.modelValue == null ? '' : String(props.modelValue)"
      :placeholder="props.field.placeholder"
      :disabled="props.isDisabled"
      :readonly="props.isReadonly"
      :max-length="props.field.maxLength"
      :auto-size="{ minRows: 2, maxRows: 6 }"
      @update:model-value="updateValue"
    />
    <a-input-number
      v-else-if="props.field.component === 'number'"
      :model-value="typeof props.modelValue === 'number' ? props.modelValue : undefined"
      :placeholder="props.field.placeholder"
      :disabled="props.isDisabled"
      :readonly="props.isReadonly"
      :min="props.field.minimum"
      :max="props.field.maximum"
      @update:model-value="updateValue"
    />
    <a-switch
      v-else-if="props.field.component === 'switch'"
      :model-value="Boolean(props.modelValue)"
      :disabled="props.isDisabled || props.isReadonly"
      @update:model-value="updateValue"
    />
    <a-radio-group
      v-else-if="props.field.component === 'radio'"
      :model-value="props.modelValue"
      :disabled="props.isDisabled || props.isReadonly"
      :options="props.field.options"
      @update:model-value="updateValue"
    />
    <a-checkbox-group
      v-else-if="props.field.component === 'checkbox'"
      :model-value="Array.isArray(props.modelValue) ? props.modelValue : []"
      :disabled="props.isDisabled || props.isReadonly"
      :options="props.field.options"
      @update:model-value="updateValue"
    />
    <a-date-picker
      v-else-if="props.field.component === 'date'"
      :model-value="props.modelValue == null ? '' : String(props.modelValue)"
      :placeholder="props.field.placeholder"
      :disabled="props.isDisabled || props.isReadonly"
      :format="pickerFormat"
      value-format="YYYY-MM-DD"
      @update:model-value="updateValue"
    />
    <a-range-picker
      v-else-if="props.field.component === 'dateRange'"
      :model-value="Array.isArray(props.modelValue) ? props.modelValue : []"
      :placeholder="props.field.placeholder"
      :disabled="props.isDisabled || props.isReadonly"
      :format="pickerFormat"
      value-format="YYYY-MM-DD"
      @update:model-value="updateValue"
    />
    <a-select
      v-else
      :model-value="props.modelValue"
      :placeholder="props.field.placeholder"
      :disabled="props.isDisabled || props.isReadonly"
      :options="props.field.options"
      :multiple="props.field.multiple"
      allow-clear
      @update:model-value="updateValue"
    />
    <div v-if="props.errorMessage" class="q-json-schema__error">
      {{ props.errorMessage }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.q-json-schema__field {
  display: grid;
  gap: 6px;
}

.q-json-schema__label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #4e5969;
  font-size: 13px;
  line-height: 20px;
}

.q-json-schema__required,
.q-json-schema__error {
  color: #f53f3f;
}

.q-json-schema__error {
  font-size: 12px;
  line-height: 18px;
}
</style>
