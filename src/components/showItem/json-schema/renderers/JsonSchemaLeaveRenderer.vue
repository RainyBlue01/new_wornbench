<script setup lang="ts">
import JsonSchemaFieldRenderer from './JsonSchemaFieldRenderer.vue'

const props = defineProps<{
  title?: string
  leaveSummaryText?: string
  leaveFields: any[]
  leaveDurationField?: any
  leaveDurationText?: string
  model: Record<string, any>
  validationErrors: Record<string, string>
  isDisabled?: boolean
  isReadonly?: boolean
}>()

const emit = defineEmits<{
  (event: 'update-field', key: string, value: any): void
}>()
</script>

<template>
  <div class="q-json-schema__leave">
    <JsonSchemaFieldRenderer
      v-for="field in props.leaveFields"
      :key="field.key"
      :field="field"
      :model-value="props.model[field.key]"
      :error-message="props.validationErrors[field.key]"
      :is-disabled="props.isDisabled"
      :is-readonly="props.isReadonly"
      @update:model-value="emit('update-field', field.key, $event)"
    />

    <div v-if="props.leaveDurationField" class="q-json-schema__field">
      <div class="q-json-schema__label">
        <span>{{ props.leaveDurationField.title }}</span>
      </div>
      <a-input :model-value="props.leaveDurationText" readonly disabled />
    </div>
  </div>
</template>

<style scoped lang="scss">
.q-json-schema__leave {
  display: grid;
  gap: 12px;
}

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
</style>
