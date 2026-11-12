<template>
  <div class="person-panel dictionary-item-panel">
    <a-table
      row-key="id"
      :scroll="tableScroll"
      :pagination="false"
      :columns="columns"
      :data="records"
      :loading="loading"
      :bordered="false"
      class="person-table"
    >
      <template #serialNumber="{ rowIndex }">
        {{ (pagination.pageNum - 1) * pagination.pageSize + rowIndex + 1 }}
      </template>
      <template #dictItem="{ record }">
        <span class="person-name">{{ record.dictItem }}</span>
      </template>
      <template #dictValue="{ record }">
        <span class="person-cell-email">{{ record.dictValue }}</span>
      </template>
      <template #actions="{ record, rowIndex }">
        <div class="person-actions">
          <button
            type="button"
            class="sg-action-btn edit"
            title="修改"
            @click="emit('edit', record, rowIndex)"
          >
            <icon-edit />
          </button>
          <button
            type="button"
            class="sg-action-btn"
            :title="record.active == 0 ? '启用' : '停用'"
            @click="onToggleActive(record)"
          >
            <icon-poweroff />
          </button>
        </div>
      </template>
    </a-table>

    <PersonPagination
      :total="pagination.total"
      :current="pagination.pageNum"
      :page-size="pagination.pageSize"
      @change="emit('page-change', $event)"
      @page-size-change="emit('page-size-change', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { Modal } from '@arco-design/web-vue'
import { IconEdit, IconPoweroff } from '@arco-design/web-vue/es/icon'
import PersonPagination from '@/views/user/components/PersonPagination.vue'

export interface DictionaryItem {
  id: string | number
  dictItem: string
  dictValue: string
  active: number
}

defineProps<{
  records: DictionaryItem[]
  loading?: boolean
  pagination: { total: number; pageNum: number; pageSize: number }
}>()

const emit = defineEmits<{
  'page-change': [page: number]
  'page-size-change': [size: number]
  edit: [record: DictionaryItem, rowIndex: number]
  'toggle-active': [record: DictionaryItem]
}>()

const tableScroll = { maxHeight: 'var(--person-table-max-height)' }

const columns = [
  { title: '序号', width: 60, align: 'center', slotName: 'serialNumber' },
  { title: '名称', slotName: 'dictItem', width: 160 },
  { title: '值', slotName: 'dictValue' },
  { title: '管理', slotName: 'actions', width: 100, align: 'center' },
]

const onToggleActive = (record: DictionaryItem) => {
  const isEnable = record.active == 0
  Modal.confirm({
    title: '提示',
    simple: true,
    renderToBody: false,
    titleAlign: 'start',
    content: `确定要${isEnable ? '启用' : '停用'}该字典项吗？`,
    modalClass: 'person-modal-wrap',
    onOk: () => emit('toggle-active', record),
  })
}
</script>

<style lang="scss" scoped>
@use '@/styles/system-settings.scss';
</style>
