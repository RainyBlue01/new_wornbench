<template>
  <div class="dev-table-wrap dev-download-table">
    <a-table
      :columns="columns"
      :scroll="scroll"
      :data="tableData"
      :loading="loading"
      :pagination="false"
      row-key="id"
      :bordered="false"
    >
      <template #index="{ rowIndex }">
        <span class="dev-cell-index">{{ rowIndex + 1 }}</span>
      </template>
      <template #states="{ record }">
        <a-tooltip v-if="getStatusClass(record) === 'fail' && record.error" :content="String(record.error)">
          <span class="status-tag fail">{{ getStatusLabel(record) }}</span>
        </a-tooltip>
        <span v-else class="status-tag" :class="getStatusClass(record)">
          {{ getStatusLabel(record) }}
        </span>
      </template>
      <template #operations="{ record }">
        <div class="dev-actions">
          <template v-if="isProcessing(record)">
            <button type="button" class="action-btn disabled" disabled>
              <i class="fas fa-download" aria-hidden="true" /> 下载
            </button>
            <button type="button" class="action-btn disabled" disabled>
              <i class="fas fa-eye" aria-hidden="true" /> 预览
            </button>
          </template>
          <template v-else-if="record.states === 0">
            <button
              type="button"
              class="action-btn download"
              :class="{ disabled: downloadLoading }"
              :disabled="downloadLoading"
              @click="emit('download-item', record)"
            >
              <i class="fas fa-download" aria-hidden="true" /> 下载
            </button>
            <button
              v-if="record.fileIds"
              type="button"
              class="action-btn preview"
              @click="emit('preview', record)"
            >
              <i class="fas fa-eye" aria-hidden="true" /> 预览
            </button>
            <button
              v-if="showButton(record.name)"
              type="button"
              class="action-btn download"
              :class="{ disabled: downloadLoading }"
              :disabled="downloadLoading"
              @click="emit('download', record)"
            >
              <i class="fas fa-print" aria-hidden="true" /> 打印
            </button>
         
          </template>
          <template v-else>
            <button type="button" class="action-btn delete" @click="emit('delete', record)">
              <i class="fas fa-trash" aria-hidden="true" /> 删除
            </button>
            <!-- <button type="button" class="action-btn retry" @click="emit('retry', record)">
              <i class="fas fa-redo" aria-hidden="true" /> 重试
            </button> -->
          </template>
        </div>
      </template>
    </a-table>
  <div class="dev-pagination">
    <PersonPagination
      :total="pagination.total"
      :current="pagination.current"
      :page-size="pagination.pageSize"
      :show-page-size="false"
      :show-jump="false"
      @change="emit('page-change', $event)"
    />
  </div>
   </div>
</template>

<script setup lang="ts">
import PersonPagination from '@/views/user/components/PersonPagination.vue'

interface FileRecord {
  states: number
  fileIds?: string | null
  name?: string | null
}

defineProps<{
  columns: Record<string, unknown>[]
  tableData: Record<string, unknown>[]
  loading: boolean
  downloadLoading: boolean
  pagination: {
    total: number
    current: number
    pageSize: number
  }
  showButton: (name: string | null) => boolean
}>()

const emit = defineEmits<{
  'download-item': [record: Record<string, unknown>]
  preview: [record: Record<string, unknown>]
  download: [record: Record<string, unknown>]
  delete: [record: Record<string, unknown>]
  retry: [record: Record<string, unknown>]
  'page-change': [page: number]
}>()
const scroll =  {
    maxHeight: '800px',
  }
const isProcessing = (record: FileRecord) =>
  record.states === 0 && !record.fileIds

const getStatusClass = (record: FileRecord) => {
  if (isProcessing(record)) return 'processing'
  return record.states === 0 ? 'success' : 'fail'
}

const getStatusLabel = (record: FileRecord) => {
  if (isProcessing(record)) return '处理中'
  return record.states === 0 ? '成功' : '失败'
}
</script>

