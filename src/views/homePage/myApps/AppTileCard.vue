<template>
  <div
    class="wb-app-tile"
    @click="$emit('click', item)"
    @contextmenu.prevent="$emit('contextmenu', $event, item, contextType)"
  >
    <div class="wb-app-tile__icon-wrap">
      <div class="wb-app-tile__icon">
        <AppIconImage :src="item.showIcon" :alt="appName" />
      </div>
      <span
        v-if="showMeta"
        class="wb-app-tile__status"
        :class="item.publishState === 1 ? 'is-published' : 'is-unpublished'"
        :title="item.publishState === 1 ? '已发布' : '未发布'"
      />
    </div>
    <a-tooltip v-if="appName.length > 12" :content="appName" position="top">
      <span class="wb-app-tile__name">{{ appName }}</span>
    </a-tooltip>
    <span v-else class="wb-app-tile__name">{{ appName }}</span>
    <span
      v-if="showMeta && categoryLabel"
      class="wb-app-tile__type"
      :class="categoryClass"
    >
      {{ categoryLabel }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import AppIconImage from '@/components/AppIconImage.vue';
import { getAppCategoryClass, getAppCategoryLabel } from './constants';

interface AppItem {
  id: string | number;
  appName: string;
  showIcon?: string;
  publishState?: number;
  category?: number;
  [key: string]: any;
}

const props = withDefaults(
  defineProps<{
    item: AppItem;
    contextType?: 'create' | 'manage';
    showMeta?: boolean;
  }>(),
  {
    showMeta: false,
  },
);

defineEmits<{
  click: [item: AppItem];
  contextmenu: [event: MouseEvent, item: AppItem, type: 'create' | 'manage'];
}>();

const categoryLabel = computed(() => getAppCategoryLabel(props.item.category));
const categoryClass = computed(() => getAppCategoryClass(props.item.category));
const appName = computed(() =>
  String(props.item.appName || props.item.name || props.item.title || '未命名应用'),
);
</script>

<style lang="scss" scoped>
.wb-app-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px 12px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.25s ease;
  background: transparent;
  border: 1px solid transparent;
  position: relative;

  &:hover {
    background: #f8fafc;
    transform: translateY(-3px);
    border-color: #f1f5f9;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  }

  &:hover &__icon-wrap .wb-app-tile__icon {
    transform: scale(1.08);
    //box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }

  &:hover &__name,
  &:hover :deep(.wb-app-tile__name) {
    color: #0f172a;
  }

  &:active {
    transform: translateY(0);
  }

  &__icon-wrap {
    position: relative;
    flex-shrink: 0;
    padding: 6px 6px 0 0;
    overflow: visible;
  }

  &__icon {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    overflow: hidden;
    position: relative;
    transition: all 0.3s;
    //box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 16px;
    }
  }

  &__status {
    position: absolute;
    top: 0;
    right: 0;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2px solid #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    z-index: 2;
    pointer-events: none;

    &.is-published {
      background: #22c55e;
    }

    &.is-unpublished {
      background: #cbd5e1;
    }
  }

  &__name {
    font-size: 13px;
    font-weight: 500;
    color: #475569;
    transition: color 0.25s ease;
    text-align: center;
    word-break: break-word;
    line-height: 1.4;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  &__type {
    font-size: 12px;
    font-weight: 500;
    line-height: 1.4;
    margin-top: 2px;
    padding: 2px 8px;
    border-radius: 6px;

    &.type-form {
      color: #3b82f6;
      background: #eff6ff;
    }

    &.type-flow {
      color: #9333ea;
      background: #f5f3ff;
    }

    &.type-report {
      color: #0891b2;
      background: #ecfeff;
    }
  }
}
</style>
