<template>
  <div class="wb-apps-card-head-right">
    <!-- <router-link v-if="showMineLink" class="wb-apps-mine-entry" :to="{ name: 'myApps' }">
      我的应用
    </router-link> -->
    <a-input-search
      :model-value="modelValue"
      class="wb-apps-plaza-search"
      placeholder="搜索应用..."
      allow-clear
      @update:model-value="$emit('update:modelValue', $event)"
      @search="$emit('search')"
      @clear="$emit('search')"
      @change="$emit('search')"
    />
  </div>
</template>

<script setup lang="ts">

defineProps<{
  modelValue: string;
  showMineLink?: boolean;
}>();

defineEmits<{
  'update:modelValue': [value: string];
  search: [];
}>();
</script>

<style lang="scss" scoped>
.wb-apps-card-head-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.wb-apps-mine-entry {
  font-size: 14px;
  color: #64748b;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: rgb(var(--primary-6));
  }
}

.wb-apps-plaza-search {
  width: 220px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;

  &:focus-within {
    border-color: rgb(var(--primary-6));
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  :deep(.arco-input-wrapper) {
    background-color: #fff;
  }
}
</style>
