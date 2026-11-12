<template>
  <div class="category-tabs">
    <div 
      class="category-tab" 
      :class="{ active: isAll }" 
      @click="$emit('change', PLAZA_ALL)"
    >
      全部
    </div>
    <div 
      v-for="items in categories" 
      :key="items.id" 
      class="category-tab"
      :class="{ active: String(modelValue) === String(items.id) }"
      @click="$emit('change', items.id)"
    >
      {{ items.category }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const PLAZA_ALL = '__plaza_all__';

const props = defineProps<{
  modelValue: string | number;
  categories: Array<{ id: string | number; category: string }>;
}>();

const isAll = computed(() => String(props.modelValue) === PLAZA_ALL);

defineEmits<{
  change: [value: string | number];
}>();
</script>

<style lang="scss" scoped>
@use "@/styles/textColor.scss" as textColor;

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px 0px;
}

.category-tab {
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
  user-select: none;

  &:hover {
    color: textColor.$ThemeTextColor;
    background: #f8fafc;
  }

  &.active {
    color: rgb(var(--primary-6));
    background: #eff6ff;

    &:hover {
      background: #e0f2fe;
    }
  }
}
</style>
