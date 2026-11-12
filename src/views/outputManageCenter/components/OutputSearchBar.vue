<template>
  <div class="dev-toolbar-actions dev-download-toolbar">
    <a-input
      :model-value="name"
      class="dev-search-input"
      placeholder="搜索文件名称..."
      allow-clear
      @update:model-value="emit('update:name', $event)"
      @change="emit('search')"
      @clear="emit('search')"
    />
    <a-select
      :model-value="states"
      class="dev-filter-select"
      placeholder="全部状态"
      allow-clear
      @update:model-value="emit('update:states', $event)"
      @change="emit('search')"
    >
      <a-option :value="0">成功</a-option>
      <a-option :value="1">失败</a-option>
      <a-option :value="2">处理中</a-option>
    </a-select>
    <button type="button" class="dev-reset-btn" @click="emit('reset')">
      <i class="fas fa-undo" aria-hidden="true" />
      重置
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  name: string
  states?: number
}>()

const emit = defineEmits<{
  'update:name': [value: string]
  'update:states': [value: number | undefined]
  search: []
  reset: []
}>()
</script>

