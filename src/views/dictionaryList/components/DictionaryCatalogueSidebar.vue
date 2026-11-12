<template>
  <div class="config-sidebar dict-catalogue-sidebar">
    <div class="sys-card dict-catalogue-card">
      <div class="card-body">
        <div class="dict-catalogue-header">
          <h3>字典目录</h3>
          <a-button class="btn-ghost-sm" size="small" @click="emit('add-catalogue')">
            <template #icon><icon-plus /></template>
          </a-button>
        </div>
        <div class="sg-list">
          <div
            v-for="item in catalogues"
            :key="item.id"
            :class="['sg-item', { active: activeId === item.id }]"
            @click="emit('select', item.id)"
          >
            <div class="sg-info">
              <div class="sg-name">{{ item.catalogue }}</div>
              <div v-if="item.catalogueCode" class="sg-desc">{{ item.catalogueCode }}</div>
            </div>
            <div class="sg-actions" @click.stop>
              <button
                type="button"
                class="sg-action-btn edit"
                title="编辑目录"
                @click="emit('edit-catalogue', item)"
              >
                <icon-settings />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconPlus, IconSettings } from '@arco-design/web-vue/es/icon'

export interface DictionaryCatalogue {
  id: string | number
  catalogue: string
  catalogueCode?: string
}

defineProps<{
  catalogues: DictionaryCatalogue[]
  activeId?: string | number
}>()

const emit = defineEmits<{
  select: [id: string | number]
  'add-catalogue': []
  'edit-catalogue': [item: DictionaryCatalogue]
}>()
</script>

<style lang="scss" scoped>
@use '@/styles/system-settings.scss';
@use '@/styles/textColor.scss' as textColor;

.dict-catalogue-sidebar {
  width: 240px;
  flex-shrink: 0;
  align-self: flex-start;
}

.dict-catalogue-card .card-body {
  padding: 12px;
}

.dict-catalogue-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;

  h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 700;
    color: #1e293b;
  }
}

.sg-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: calc(var(--person-layout-height) - 120px);
  overflow-y: auto;
}

.sg-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid transparent;

  &:hover {
    background: #f8fafc;
    border-color: #e2e8f0;

    .sg-actions {
      opacity: 1;
    }
  }

  &.active {
    background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%);
    border-color: #dbeafe;

    .sg-name {
      color: #1d4ed8;
    }

    .sg-desc {
      color: rgb(var(--primary-6));
    }
  }
}

.sg-info {
  flex: 1;
  min-width: 0;
}

.sg-name {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sg-desc {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sg-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s;
  flex-shrink: 0;
}

.sg-action-btn {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  font-size: 12px;
  padding: 0;

  &.edit:hover {
    background: #eff6ff;
    color: textColor.$ThemeTextColor;
  }
}
</style>
