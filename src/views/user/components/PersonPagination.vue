<template>
  <div class="person-pagination">
    <span class="person-pagination__count">共 {{ total }} 条</span>
    <div v-if="showPageSize" class="person-pagination__size">
      <a-select
        :model-value="pageSize"
        :options="pageSizeOptions"
        size="small"
        @change="onSizeChange"
      />
    </div>

    <a-pagination
      :total="total"
      :current="current"
      :page-size="pageSize"
      :show-total="false"
      :show-page-size="false"
      size="small"
      @change="onPageChange"
    />
    <div v-if="showJump" class="person-pagination__jump">
      <span>前往</span>
      <a-input-number
        v-model="jumpPage"
        class="person-pagination__jump-input"
        :min="1"
        :max="maxPage"
        size="small"
        hide-button
        @keydown.enter="goJump"
      />
      <span>页</span>
      <button type="button" @click="goJump">确定</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

const props = withDefaults(
  defineProps<{
    total: number;
    current: number;
    pageSize: number;
    showPageSize?: boolean;
    showJump?: boolean;
  }>(),
  {
    showPageSize: true,
    showJump: true,
  },
);

const emit = defineEmits<{
  change: [page: number];
  pageSizeChange: [size: number];
}>();

const pageSizeOptions = [
  { label: "10 条/页", value: 10 },
  { label: "20 条/页", value: 20 },
  { label: "50 条/页", value: 50 },
  { label: "100 条/页", value: 100 },
];

const jumpPage = ref(1);

const maxPage = computed(() =>
  Math.max(1, Math.ceil(props.total / props.pageSize) || 1),
);

watch(
  () => props.current,
  (v) => {
    jumpPage.value = v;
  },
  { immediate: true },
);

const onPageChange = (page: number) => {
  emit("change", page);
};

const onSizeChange = (size: number | string) => {
  emit("pageSizeChange", Number(size));
};

const goJump = () => {
  const p = Math.min(Math.max(1, jumpPage.value || 1), maxPage.value);
  emit("change", p);
};
</script>

<style lang="scss" scoped>
@use "@/styles/system-settings.scss";

.person-pagination__size {
  width: 104px;

  :deep(.arco-select-view) {
    border-radius: 6px;
    border-color: #e2e8f0;
    font-size: 12px;
    color: #64748b;
    background: #fff;
    min-height: 28px;
  }
}

.person-pagination__jump-input {
  width: 56px;
 border-radius: 8px;
  :deep(.arco-input-wrapper) {
    border-radius: 8px;
  }

  :deep(.arco-input) {
    font-size: 12px;
    border: none;
    text-align: center;
    color: #334155;
  }
}
</style>
