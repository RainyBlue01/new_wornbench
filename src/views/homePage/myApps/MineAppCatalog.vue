<script setup lang="ts">
import { computed } from 'vue';
import CategoryTabs from './CategoryTabs.vue';
import EmptyState from './EmptyState.vue';
import PlazaBlock from './PlazaBlock.vue';

const ALL_CATEGORY = '__plaza_all__';
interface AppItem {
  id: string | number;
  appName: string;
  [key: string]: any;
}

interface CategoryItem {
  id: string | number;
  category: string;
  sortOrder?: number;
  accessAppList?: AppItem[];
}

const props = defineProps<{
  categories: CategoryItem[];
  modelValue: string | number;
  searchText: string;
  contextType: 'create' | 'manage';
  emptyText?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
  'app-click': [item: AppItem];
  contextmenu: [event: MouseEvent, item: AppItem, type: 'create' | 'manage'];
}>();

const availableCategories = computed<CategoryItem[]>(() => props.categories.slice());

const groups = computed(() => {
  const selectedId = String(props.modelValue);
  return availableCategories.value
    .filter((category) => selectedId === ALL_CATEGORY || String(category.id) === selectedId)
    .map((category) => ({
      id: category.id,
      title: category.category,
      items: (category.accessAppList || []).filter((app) =>
        String(app.appName || app.name || app.title || '')
          .toLocaleLowerCase()
          .includes(props.searchText.trim().toLocaleLowerCase()),
      ),
    }))
    .filter((group) => group.items.length > 0);
});

const forwardContextMenu = (event: MouseEvent, item: AppItem) => {
  emit('contextmenu', event, item, props.contextType);
};
</script>

<template>
  <section class="mine-catalog">
    <div v-if="availableCategories.length" class="mine-catalog__filters">
      <CategoryTabs
        :model-value="modelValue"
        :categories="availableCategories"
        @change="emit('update:modelValue', $event)"
      />
    </div>

    <div v-if="groups.length" class="mine-catalog__groups">
      <PlazaBlock
        v-for="(group, index) in groups"
        :key="group.id"
        :block-id="group.id"
        :title="group.title"
        :items="group.items"
        :tone-index="index"
        show-meta
        :context-type="contextType"
        @click="emit('app-click', $event)"
        @contextmenu="forwardContextMenu"
      />
    </div>
    <EmptyState v-else :text="emptyText || '暂无应用'" />
  </section>
</template>

<style scoped lang="scss">
.mine-catalog {
  min-height: 360px;
  padding: 0 28px 32px;
  background: #fff;
}

.mine-catalog__filters {
  padding: 4px 0 10px;
  border-bottom: 1px solid #f1f5f9;
}

.mine-catalog__groups {
  padding-top: 22px;
}

:deep(.wb-apps-plaza-block) {
  margin-bottom: 30px;
}

:deep(.my-create-body) {
  grid-template-columns: repeat(7, minmax(96px, 1fr));
  gap: 14px 20px;
  padding-top: 8px;
}

@media (max-width: 1100px) {
  :deep(.my-create-body) {
    grid-template-columns: repeat(5, minmax(96px, 1fr));
  }
}

@media (max-width: 720px) {
  .mine-catalog {
    padding-inline: 16px;
  }

  :deep(.my-create-body) {
    grid-template-columns: repeat(3, minmax(82px, 1fr));
  }
}
</style>
