<script setup lang="ts">
import JsonSchemaFieldRenderer from './JsonSchemaFieldRenderer.vue'

const props = defineProps<{
  fields: any[]
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
  <div class="q-json-schema__generic">
    <JsonSchemaFieldRenderer
      v-for="field in props.fields"
      :key="field.key"
      :field="field"
      :model-value="props.model[field.key]"
      :error-message="props.validationErrors[field.key]"
      :is-disabled="props.isDisabled"
      :is-readonly="props.isReadonly"
      @update:model-value="emit('update-field', field.key, $event)"
    />
  </div>
</template>

<style scoped lang="scss">
.q-json-schema__generic {
  display: grid;
  gap: 12px;
}
</style>
