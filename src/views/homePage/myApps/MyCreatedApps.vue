<template>
  <section class="wb-apps-card wb-apps-card-mine">
    <header class="wb-apps-card-head">
      <div class="wb-apps-card-head-left">
        <h2 class="wb-apps-card-title">我创建的应用</h2>
        <p class="wb-apps-card-subtitle">管理您创建的所有应用，快速访问和发起流程</p>
      </div>
      <div class="wb-apps-card-head-right">
        <a-button type="primary" ghost class="wb-apps-create-btn wb-apps-create-btn--primary" @click="$emit('create', 1)">
          <template #icon><icon-plus /></template>
          创建普通表单
        </a-button>
        <a-button type="primary" ghost class="wb-apps-create-btn wb-apps-create-btn--purple" @click="$emit('create', 2)">
          <template #icon><icon-plus /></template>
          创建流程表单
        </a-button>
        <a-button type="primary" ghost class="wb-apps-create-btn wb-apps-create-btn--green" @click="$emit('create', 3)">
          <template #icon><icon-plus /></template>
          创建简单报表
        </a-button>
      </div>
    </header>
    <div class="content-area wb-apps-mine-body">
      <div class="appitem wb-apps-grid-wrap wb-apps-grid-wrap--tiles" v-show="apps.length > 0">
        <div class="my-create-body wb-mine-tile-grid wb-mine-tile-grid--max7">
          <AppTileCard
            v-for="item in apps"
            :key="item.id"
            :item="item"
            show-meta
            context-type="create"
            @click="$emit('click', item)"
          />
        </div>
      </div>
      <EmptyState v-show="apps.length == 0" text="暂无我创建的应用" />
    </div>
  </section>
</template>

<script setup lang="ts">
import AppTileCard from './AppTileCard.vue';
import EmptyState from './EmptyState.vue';

interface AppItem {
  id: string | number;
  appName: string;
  showIcon?: string;
  [key: string]: any;
}

defineProps<{
  apps: AppItem[];
  showCreateBtn?: boolean;
}>();

defineEmits<{
  create: [type?: number];
  click: [item: AppItem];
  contextmenu: [event: MouseEvent, item: AppItem, type: 'create'];
}>();
</script>

<style lang="scss" scoped>

.wb-apps-mine-body{
    background-color: #fff !important;
      border-radius: 20px !important;
}
.wb-apps-card {
  margin-bottom: 0;
  background: rgba(0,0,0,0) !important;
  box-shadow: none !important;
     
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.wb-apps-card-head {
  display: flex;
   padding: 24px 0px 20px !important;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 32px 20px;
  border-bottom: 0 !important;
}

.wb-apps-card-head-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.wb-apps-card-head-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.wb-apps-card-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px;
  line-height: 1.4;
}

.wb-apps-card-subtitle {
  font-size: 13px;
  font-weight: 400;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.wb-apps-create-btn {
  font-size: 13px;
  height: 36px;
  padding: 0 16px;
  border-radius: 10px;
  border: none;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &--primary {
    background: rgba(59, 130, 246, 0.08);
    color: rgb(var(--primary-6));

    &:hover {
      background: rgba(59, 130, 246, 0.15);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
       color: rgb(var(--primary-6));
    }
  }

  &--purple {
    background: rgba(139, 92, 246, 0.08);
    color: #8b5cf6;

    &:hover {
      background: rgba(139, 92, 246, 0.15);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);
       color: #8b5cf6;
    }
  }

  &--green {
    background: rgba(34, 197, 94, 0.08);
    color: #22c55e;

    &:hover {
      background: rgba(34, 197, 94, 0.15);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(34, 197, 94, 0.25);
        color: #22c55e;
    }
  }

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s ease, height 0.6s ease;
    pointer-events: none;
  }

  &:active::before {
    width: 300px;
    height: 300px;
  }
}

.content-area {
  width: 100%;
  display: flex;
  background-color: #fff;
  flex-direction: column;
  padding: 24px 32px 32px;
}

.appitem {
  min-height: 400px;
  max-height: calc(100vh - 340px);
  padding: 0;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 3px;
    transition: background 0.2s ease;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #cbd5e1;
  }

  @media screen and (max-width: 768px) {
    height: auto;
    min-height: 200px;
    max-height: 500px;
  }
}

.my-create-body {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 24px;
  padding: 16px 24px 20px;
  align-items: start;
}
</style>
