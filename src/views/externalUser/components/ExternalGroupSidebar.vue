<template>
  <div class="config-sidebar external-group-sidebar">
    <div class="sys-card external-group-card">
      <div class="card-body">
        <div class="external-group-header">
          <h3>分组</h3>
          <a-button class="btn-ghost-sm" size="small" @click="emit('add-group')">
            <template #icon><icon-plus /></template>
          </a-button>
        </div>
        <div class="external-group-list">
          <div
            v-for="g in groups"
            :key="g.id"
            :class="[
              'external-group-item',
              { active: String(activeGroupId) === String(g.id) },
            ]"
            @click="emit('select', g.id)"
          >
            <div class="external-group-info">
              <span class="external-group-name">
                {{ g.name }}
                <span v-if="String(g.id) === String(defaultGroupId)" class="group-tag">默认</span>
              </span>
            </div>
            <div
              v-if="String(g.id) !== String(defaultGroupId)"
              class="external-group-actions"
              @click.stop
            >
              <button
                type="button"
                class="sg-action-btn edit"
                title="编辑"
                @click="emit('edit-group', g)"
              >
                <icon-edit />
              </button>
              <button
                type="button"
                class="sg-action-btn"
                title="删除"
                @click="emit('delete-group', g)"
              >
                <icon-delete />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconPlus, IconEdit, IconDelete } from "@arco-design/web-vue/es/icon";
import type { ExternalGroup } from "../composables/useExternalPage";

defineProps<{
  groups: ExternalGroup[];
  activeGroupId: string | number;
  defaultGroupId: string | number;
}>();

const emit = defineEmits<{
  select: [id: string | number];
  "add-group": [];
  "edit-group": [group: ExternalGroup];
  "delete-group": [group: ExternalGroup];
}>();
</script>

<style lang="scss" scoped>
@use "@/styles/system-settings.scss";
@use "@/styles/textColor.scss" as textColor;

.external-group-sidebar {
  width: 240px;
  flex-shrink: 0;
  align-self: flex-start;
}

.external-group-card .card-body {
  padding: 12px;
}

.external-group-header {
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

.external-group-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: calc(var(--person-layout-height) - 120px);
  overflow-y: auto;
}

.external-group-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  margin-bottom: 2px;
  border: 1px solid transparent;
  font-size: 13px;
  color: #475569;

  &:hover {
    background: #f8fafc;
    border-color: #e2e8f0;
    color: #334155;

    .external-group-actions {
      opacity: 1;
    }
  }

  &.active {
    background: #eff6ff;
    border-color: #dbeafe;
    color: #2563eb;
    font-weight: 600;

    .group-tag {
      color: #60a5fa;
    }
  }
}

.external-group-info {
  flex: 1;
  display: flex;
  line-height:22px;
  align-items: center;
  min-width: 0;
}

.external-group-name {
  font-size: 13px;
  font-weight: inherit;
  color: inherit;
}

.group-tag {
  font-size: 11px;
  color: #94a3b8;
  margin-left: 6px;
  font-weight: 400;
}

.external-group-actions {
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

  &:hover {
    background: #fee2e2;
    color: #ef4444;
  }

  &.edit:hover {
    background: #eff6ff;
    color: textColor.$ThemeTextColor;
  }
}
</style>
