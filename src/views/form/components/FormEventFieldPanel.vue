<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { Message } from '@arco-design/web-vue'
import type { PluginFormFieldOption } from '@/utils/pluginParameterMapping'

const props = defineProps<{
  fields: PluginFormFieldOption[]
}>()

const emit = defineEmits<{
  close: []
  insert: [fieldId: string]
}>()

const searchText = shallowRef('')

const filteredFields = computed(() => {
  const keyword = searchText.value.trim().toLowerCase()
  if (!keyword) return props.fields
  return props.fields.filter(field =>
    [field.label, field.id, field.componentType, field.dataType]
      .some(value => String(value).toLowerCase().includes(keyword)),
  )
})

async function copyFieldId(fieldId: string) {
  try {
    await navigator.clipboard.writeText(fieldId)
    Message.success('字段 ID 已复制')
  } catch {
    Message.error('复制失败，请手动复制字段 ID')
  }
}
</script>

<template>
  <aside class="field-panel" aria-label="表单字段 ID">
    <header class="field-panel__header">
      <div>
        <h3>表单字段</h3>
        <p>共 {{ fields.length }} 个可用字段</p>
      </div>
      <button type="button" class="field-panel__close" aria-label="关闭字段列表" @click="emit('close')">
        <icon-close />
      </button>
    </header>

    <div class="field-panel__search">
      <a-input v-model="searchText" allow-clear placeholder="搜索字段名称或 ID">
        <template #prefix><icon-search /></template>
      </a-input>
    </div>

    <div class="field-panel__list">
      <article v-for="field in filteredFields" :key="field.id" class="field-card">
        <div class="field-card__heading">
          <strong :title="field.label">{{ field.label }}</strong>
          <span>{{ field.componentType }}</span>
        </div>
        <code class="field-card__id" :title="field.id">{{ field.id }}</code>
        <div class="field-card__actions">
          <button type="button" @click="copyFieldId(field.id)">
            <icon-copy /> 复制
          </button>
          <button type="button" class="field-card__insert" @click="emit('insert', field.id)">
            插入 ID
          </button>
        </div>
      </article>

      <div v-if="filteredFields.length === 0" class="field-panel__empty">
        <icon-search />
        <span>未找到匹配字段</span>
      </div>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.field-panel {
  display: flex;
  width: 320px;
  min-width: 280px;
  max-width: 34vw;
  flex: none;
  flex-direction: column;
  overflow: hidden;
  margin: 16px 0 16px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
}

.field-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 14px 10px;
}

.field-panel__header h3,
.field-panel__header p {
  margin: 0;
}

.field-panel__header h3 {
  color: #1e293b;
  font-size: 14px;
  font-weight: 600;
}

.field-panel__header p {
  margin-top: 2px;
  color: #94a3b8;
  font-size: 11px;
}

.field-panel__close {
  display: grid;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  place-items: center;
}

.field-panel__close:hover {
  background: #e2e8f0;
  color: #475569;
}

.field-panel__search {
  padding: 0 12px 10px;
}

.field-panel__list {
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  padding: 0 12px 12px;
}

.field-card {
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 8px;
  background: #fff;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.field-card:hover {
  border-color: #bfdbfe;
  box-shadow: 0 3px 10px rgb(15 23 42 / 5%);
}

.field-card__heading {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.field-card__heading strong {
  overflow: hidden;
  color: #334155;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.field-card__heading span {
  flex: none;
  padding: 1px 5px;
  border-radius: 4px;
  background: #eff6ff;
  color: #3b82f6;
  font-size: 9px;
}

.field-card__id {
  display: block;
  overflow: hidden;
  margin-top: 7px;
  color: #64748b;
  font-family: "Cascadia Code", Consolas, monospace;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.field-card__actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 8px;
}

.field-card__actions button {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 7px;
  border: 0;
  border-radius: 5px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 10px;
  cursor: pointer;
}

.field-card__actions button:hover {
  background: #e2e8f0;
  color: #334155;
}

.field-card__actions .field-card__insert {
  background: #eff6ff;
  color: #2563eb;
}

.field-card__actions .field-card__insert:hover {
  background: #dbeafe;
  color: #1d4ed8;
}

.field-panel__empty {
  display: grid;
  min-height: 160px;
  align-content: center;
  justify-items: center;
  gap: 8px;
  color: #94a3b8;
  font-size: 12px;
}

.field-panel__empty svg {
  font-size: 24px;
}

@media (max-width: 900px) {
  .field-panel {
    width: 280px;
    max-width: 44vw;
  }
}
</style>
