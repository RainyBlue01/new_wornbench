<script setup lang="ts">
import type { FormPluginItem } from './types'

defineProps<{
  plugins: FormPluginItem[]
}>()

const emit = defineEmits<{
  toggle: [plugin: FormPluginItem, enabled: boolean]
  detail: [plugin: FormPluginItem]
  uninstall: [plugin: FormPluginItem]
}>()

const iconClass = {
  bolt: 'fas fa-bolt',
  calculator: 'fas fa-calculator',
  'check-circle': 'fas fa-check-circle',
  plug: 'fas fa-plug',
}

function getPackageType(packageName: string) {
  return packageName.split('.').pop()?.toUpperCase() || 'ZIP'
}
</script>

<template>
  <div v-if="plugins.length" class="plugin-list">
    <article v-for="plugin in plugins" :key="plugin.id" class="plugin-row">
      <div class="plugin-main">
        <div class="plugin-icon" :class="`plugin-icon--${plugin.icon}`">
          <i :class="iconClass[plugin.icon]" />
        </div>
        <div class="plugin-copy">
          <div class="plugin-heading">
            <strong>{{ plugin.name }}</strong>
            <span class="status" :class="{ 'status--off': !plugin.enabled }">
              {{ plugin.enabled ? '已启用' : '已停用' }}
            </span>
            <span class="version">{{ plugin.version }}</span>
          </div>
          <div class="plugin-meta">
            <span>字段：<b>{{ plugin.bindField }}</b></span>
            <span class="package-type">{{ getPackageType(plugin.packageName) }}</span>
            <span class="package-name">{{ plugin.packageName }}</span>
          </div>
        </div>
      </div>

      <div class="plugin-actions">
        <a-switch
          size="small"
          :model-value="plugin.enabled"
          :aria-label="`${plugin.enabled ? '停用' : '启用'}${plugin.name}`"
          @change="emit('toggle', plugin, Boolean($event))"
        />
        <button class="action-btn" type="button" @click="emit('detail', plugin)">
          <i class="fas fa-code" />详情
        </button>
        <button class="action-btn action-btn--danger" type="button" @click="emit('uninstall', plugin)">
          <i class="fas fa-trash-alt" />卸载
        </button>
      </div>
    </article>
  </div>
  <a-empty v-else description="当前表单暂无已安装插件" />
</template>

<style scoped lang="scss">
.plugin-list {
  display: grid;
  gap: 8px;
}

.plugin-row {
  display: flex;
  box-sizing: border-box;
  min-height: 68px;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    border-color: #bfdbfe;
    box-shadow: 0 4px 14px rgba(37, 99, 235, 0.06);
  }
}

.plugin-main,
.plugin-heading,
.plugin-meta,
.plugin-actions {
  display: flex;
  align-items: center;
}

.plugin-main {
  min-width: 0;
  gap: 10px;
}

.plugin-icon {
  display: grid;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  place-items: center;
  border-radius: 8px;
  background: #dbeafe;
  color: #2563eb;

  &--bolt {
    background: #fef3c7;
    color: #d97706;
  }

  &--calculator {
    background: #ede9fe;
    color: #7c3aed;
  }
}

.plugin-copy {
  min-width: 0;
}

.plugin-heading {
  flex-wrap: wrap;
  gap: 6px;

  strong {
    color: #1e293b;
    font-size: 14px;
    font-weight: 600;
  }
}

.status {
  padding: 1px 8px;
  border-radius: 10px;
  background: #dcfce7;
  color: #16a34a;
  font-size: 11px;

  &--off {
    background: #f1f5f9;
    color: #94a3b8;
  }
}

.version {
  color: #94a3b8;
  font-size: 11px;
}

.plugin-meta {
  gap: 12px;
  margin-top: 4px;
  color: #94a3b8;
  font-size: 12px;

  b {
    color: #475569;
    font-weight: 500;
  }
}

.package-type {
  padding: 1px 5px;
  border-radius: 3px;
  background: #ede9fe;
  color: #7c3aed;
  font-size: 10px;
}

.package-name {
  overflow: hidden;
  color: #3b82f6;
  font-family: Consolas, monospace;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.plugin-actions {
  flex: 0 0 auto;
  gap: 10px;
  margin-left: 12px;

  :deep(.arco-switch-small) {
    width: 36px;
    min-width: 36px;
  }
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: #64748b;
  font: inherit;
  font-size: 11px;
  cursor: pointer;

  &:hover {
    background: #f1f5f9;
    color: #334155;
  }

  &--danger {
    color: #94a3b8;

    &:hover {
      background: #fef2f2;
      color: #ef4444;
    }
  }
}

@media (max-width: 720px) {
  .plugin-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 14px;
  }

  .plugin-actions {
    width: 100%;
    justify-content: flex-end;
    margin-left: 0;
  }
}
</style>
