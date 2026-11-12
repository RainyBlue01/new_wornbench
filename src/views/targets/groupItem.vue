<template>
  <a-dropdown trigger="click" :popup-max-height="false">
    <div class="field-tag" :style="data.tag ? 'opacity: 0.5' : ''" draggable="true">
      <span>{{ data.showLabel }}</span>
      <icon-close class="close-icon" @click.stop="handleClose" />
    </div>
    <template #content>
      <a-doption @click="showRenameModal">修改名称</a-doption>
      <a-doption v-if="data.type === 'TIMESTAMP'" @click="showFormatModal">数据格式</a-doption>
    </template>
  </a-dropdown>

  <!-- 修改名称弹窗 -->
  <a-modal
    v-model:visible="renameVisible"
    title="修改名称"
    :width="480"
    @ok="confirmRename"
    @cancel="renameVisible = false"
    :mask-closable="false"
  >
    <a-form :model="renameForm" layout="vertical">
      <a-form-item label="显示名称" :rules="[{ required: true, message: '请输入显示名称' }]">
        <a-input v-model="renameForm.showLabel" placeholder="请输入显示名称" allow-clear />
      </a-form-item>
    </a-form>
  </a-modal>

  <!-- 数据格式弹窗（时间字段） -->
  <a-modal
    v-model:visible="formatVisible"
    title="数据格式"
    :width="480"
    @ok="confirmFormat"
    @cancel="formatVisible = false"
    :mask-closable="false"
  >
    <a-form :model="formatForm" layout="vertical">
      <a-form-item label="显示格式">
        <a-select v-model="formatForm.dateType" placeholder="请选择显示格式">
          <a-option v-for="item in timeOptions" :key="item.value" :value="item.value" :label="item.label" />
        </a-select>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { IconClose } from '@arco-design/web-vue/es/icon'

interface GroupFieldData {
  showLabel: string
  column?: string
  type?: string
  tag?: boolean
  extra?: {
    format?: number
  }
}

const props = defineProps<{
  data: GroupFieldData
  index: number
}>()

const emits = defineEmits<{
  deleteItem: [index: number]
  editName: [payload: { showLabel: string }]
  editType: [payload: { dateType: number }]
}>()

const handleClose = () => {
  emits('deleteItem', props.index)
}

// ---- 修改名称 ----
const renameVisible = ref(false)
const renameForm = reactive({ showLabel: '' })

const showRenameModal = () => {
  renameForm.showLabel = props.data.showLabel
  renameVisible.value = true
}

const confirmRename = () => {
  if (!renameForm.showLabel.trim()) return
  emits('editName', { showLabel: renameForm.showLabel })
  renameVisible.value = false
}

// ---- 数据格式（TIMESTAMP）----
const formatVisible = ref(false)
const formatForm = reactive({ dateType: 3 })

const timeOptions = [
  { label: '2011/12/01 00:00:00', value: 0 },
  { label: '2011/12/01', value: 1 },
  { label: '2011-12-01 00:00:00', value: 2 },
  { label: '2011-12-01', value: 3 },
  { label: '2011年12月01日 00:00:00', value: 4 },
  { label: '2011年12月01日 星期四', value: 5 },
  { label: '2011年12月', value: 6 },
  { label: '12月01日', value: 7 },
  { label: '星期四', value: 8 },
]

const showFormatModal = () => {
  formatForm.dateType = props.data.extra?.format ?? 3
  formatVisible.value = true
}

const confirmFormat = () => {
  emits('editType', { dateType: formatForm.dateType })
  formatVisible.value = false
}
</script>

<style lang="scss" scoped>
.field-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background: #eff6ff;
  color: #3b82f6;
  border: 1px solid #dbeafe;
  cursor: move;
  transition: all 0.2s;

  &:hover {
    background: #dbeafe;
  }

  .close-icon {
    font-size: 10px;
    color: #3b82f6;
    cursor: pointer;

    &:hover {
      color: #ef4444;
    }
  }
}
</style>

