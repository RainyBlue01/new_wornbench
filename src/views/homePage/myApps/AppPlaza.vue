<template>
  <section class="wb-apps-card wb-apps-card-plaza">
    <!-- FAB 浮动按钮 -->
    <!-- <FabButton
      v-if="showFab"
      :visible="true"
      :show-menu="showFabMenu"
      :inner="mode !== 'mine'"
      @toggle="$emit('toggle-fab')"
      @create-form="$emit('create-form')"
      @create-flow="$emit('create-flow')"
      @create-report="$emit('create-report')"
    /> -->

    <header class="wb-apps-card-head">
      <h2 class="wb-apps-card-title">应用广场</h2>
      <SearchBar
        :model-value="searchText"
        :show-mine-link="mode === 'plaza'"
        @update:model-value="$emit('update:searchText', $event)"
        @search="$emit('search')"
      />
    </header>

    <template v-if="categories.length > 0">
      <div class="wb-apps-segment">
        <CategoryTabs
          :model-value="categoryId"
          :categories="categories"
          @change="$emit('category-change', $event)"
        />
      </div>

      <!-- 全部：按分类分块展示 -->
      <template v-if="isAll">
        <template v-for="(group, gi) in allGroups" :key="group.id">
          <PlazaBlock
            :title="group.title"
            :items="group.items"
            :tone-index="gi"
            @click="$emit('app-click', $event)"
          />
        </template>
        <EmptyState v-if="!allGroups.length" text="暂无内容" />
      </template>

      <!-- 单分类 -->
      <template v-else>
        <PlazaBlock
          :title="categoryLabel"
          :items="singleItems"
          @click="$emit('app-click', $event)"
        />
      </template>
    </template>

    <EmptyState v-else text="暂无应用" />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import FabButton from './FabButton.vue';
import SearchBar from './SearchBar.vue';
import CategoryTabs from './CategoryTabs.vue';
import PlazaBlock from './PlazaBlock.vue';
import EmptyState from './EmptyState.vue';

const PLAZA_ALL = '__plaza_all__';

interface Category {
  id: string | number;
  category: string;
  accessAppList?: any[];
}

interface AppItem {
  id: string | number;
  appName: string;
  showIcon?: string;
  [key: string]: any;
}

const props = defineProps<{
  mode: 'full' | 'plaza' | 'mine';
  categories: Category[];
  categoryId: string | number;
  searchText: string;
  showFab: boolean;
  showFabMenu: boolean;
  plazaLoaded: boolean;
}>();

const emit = defineEmits<{
  'update:searchText': [text: string];
  search: [];
  'category-change': [id: string | number];
  'toggle-fab': [];
  'create-form': [];
  'create-flow': [];
  'create-report': [];
  'app-click': [item: AppItem];
}>();

const isAll = computed(() => String(props.categoryId) === PLAZA_ALL);

const allGroups = computed(() => {
  if (!isAll.value) return [];
  return props.categories
    .map((row, idx) => ({
      id: row.id,
      title: row.category,
      items: Array.isArray(row.accessAppList) ? row.accessAppList : [],
    }))
    .filter((g) => g.items.length > 0);
});

const singleItems = computed(() => {
  if (isAll.value) return [];
  const selected = props.categories.find(
    (item) => String(item.id) === String(props.categoryId),
  );
  return selected && Array.isArray(selected.accessAppList) ? selected.accessAppList : [];
});

const categoryLabel = computed(() => {
  if (isAll.value) return '';
  const row = props.categories.find((x) => String(x.id) === String(props.categoryId));
  return row ? (row as any).category : '';
});
</script>

<style lang="scss" scoped>
.wb-apps-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.wb-apps-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
}

.wb-apps-card-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin: 0;
  line-height: 1.4;
}

.wb-apps-segment {
  padding: 0 20px;
}
.wb-apps-plaza-block{
   padding: 0 20px;
}

</style>
