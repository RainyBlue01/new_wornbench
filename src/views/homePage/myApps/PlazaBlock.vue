<template>
  <div class="wb-apps-plaza-block">
    <div class="wb-apps-plaza-sub">
      <span class="wb-apps-plaza-bar" :class="`wb-apps-plaza-bar--tone${toneIndex % 4}`" />
      <span class="wb-apps-plaza-subtitle">{{ title }}</span>
    </div>
    <div class="content-area wb-apps-plaza-body">
      <div class="appitem wb-apps-grid-wrap wb-apps-grid-wrap--tiles">
        <div class="my-create-body wb-mine-tile-grid wb-mine-tile-grid--max7">
          <AppTileCard
            v-for="item in items"
            :key="`${blockId}-${item.id}`"
            :item="item"
            :show-meta="showMeta"
            :context-type="contextType"
            @click="$emit('click', item)"
            @contextmenu="$emit('contextmenu', $event, item, contextType)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppTileCard from './AppTileCard.vue';

interface AppItem {
  id: string | number;
  appName: string;
  showIcon?: string;
  [key: string]: any;
}

defineProps<{
  title: string;
  items: AppItem[];
  toneIndex?: number;
  blockId?: string | number;
  showMeta?: boolean;
  contextType?: 'create' | 'manage';
}>();

defineEmits<{
  click: [item: AppItem];
  contextmenu: [event: MouseEvent, item: AppItem, type?: 'create' | 'manage'];
}>();
</script>

<style lang="scss" scoped>
.wb-apps-plaza-block {
  margin-bottom: 36px;

  &:last-child {
    margin-bottom: 0;
  }
}

.wb-apps-plaza-sub {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0;
}

.wb-apps-plaza-bar {
  width: 4px;
  height: 16px;
  border-radius: 2px;
  flex-shrink: 0;

  &--tone0 {
    background: linear-gradient(135deg, rgb(var(--primary-6)), #6366f1);
  }

  &--tone1 {
    background: linear-gradient(135deg, #10b981, #059669);
  }

  &--tone2 {
    background: linear-gradient(135deg, #f59e0b, #d97706);
  }

  &--tone3 {
    background: linear-gradient(135deg, #ec4899, #db2777);
  }
}

.wb-apps-plaza-subtitle {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  line-height: 1.4;
}

.content-area {
  width: 100%;
}

.appitem {
  padding: 0;
}

.my-create-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 16px;
  padding: 0;
  align-items: start;
}
</style>
