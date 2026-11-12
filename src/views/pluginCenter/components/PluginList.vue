<script setup lang="ts">
import type { PluginItem } from '../types'

const dowUrl = (window as any).api?.dowUrl || ''

defineProps<{
  plugins: PluginItem[]
  loading?: boolean
}>()

const emit = defineEmits<{
  toggle: [id: string, enabled: boolean]
  detail: [plugin: PluginItem]
  remove: [plugin: PluginItem]
}>()

function getIconUrl(icon: string) {
  if (!icon || !dowUrl) return ''
  return dowUrl + icon + '&token=' + localStorage.getItem('wornbench_token')
}
</script>

<template>
  <div class="plugin-list">
    <!-- 加载中骨架 -->
    <template v-if="loading">
      <div v-for="n in 3" :key="n" class="plugin-card plugin-card--skeleton">
        <div class="plugin-icon skeleton-block" />
        <div class="plugin-copy">
          <div class="skeleton-line skeleton-line--title" />
          <div class="skeleton-line skeleton-line--desc" />
          <div class="skeleton-line skeleton-line--meta" />
        </div>
      </div>
    </template>

    <!-- 空状态 -->
    <a-empty v-else-if="plugins.length === 0" class="plugin-empty" description="暂无插件" />

    <!-- 插件列表 -->
    <article v-for="plugin in plugins" :key="plugin.id" class="plugin-card"
      :class="{ 'plugin-card--disabled': !plugin.enabled }">
      <div class="plugin-icon" :style="getIconUrl(plugin.icon) ? {} : { backgroundColor: plugin.color }"
        aria-hidden="true">
        <img v-if="getIconUrl(plugin.icon)" :src="getIconUrl(plugin.icon)" alt="" />
        <i v-else class="fas fa-puzzle-piece" />
      </div>

      <div class="plugin-copy">
        <h3 class="plugin-name">{{ plugin.name }}</h3>
        <p class="plugin-description">{{ plugin.description }}</p>
        <div class="plugin-meta">
          <span><i class="fas fa-code" aria-hidden="true" /> {{ plugin.functionCount }}个函数</span>
          <span><i class="fas fa-code-branch" aria-hidden="true" /> v{{ plugin.version }}</span>
        </div>
      </div>

      <div class="plugin-controls">
        <a-switch :model-value="plugin.enabled" size="small"
          :aria-label="`${plugin.enabled ? '停用' : '启用'}${plugin.name}`"
          @change="emit('toggle', plugin.id, $event as boolean)" />
        <button type="button" class="action" @click="emit('detail', plugin)">
          <i class="fas fa-circle-info" aria-hidden="true" />
          详情
        </button>
        <button type="button" class="action action--danger" @click="emit('remove', plugin)">
          <i class="fas fa-trash" aria-hidden="true" />
          删除
        </button>
      </div>
    </article>
  </div>
</template>

<style scoped lang="scss">
.plugin-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.plugin-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
}

.plugin-card:hover {
  border-color: #bfdbfe;
  box-shadow: 0 4px 12px rgb(59 130 246 / 8%);
}

.plugin-card--disabled {
  opacity: 0.6;
}

/* Skeleton */
.plugin-card--skeleton {
  pointer-events: none;
}

.skeleton-block {
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

.skeleton-line {
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

.skeleton-line--title {
  width: 160px;
  height: 16px;
  margin-bottom: 6px;
}

.skeleton-line--desc {
  width: 280px;
  margin-bottom: 6px;
}

.skeleton-line--meta {
  width: 120px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

.plugin-empty {
  padding: 64px 0;
}

.plugin-icon {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 50%;
  color: #fff;
  font-size: 21px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25);
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.plugin-copy {
  flex: 1;
  min-width: 0;
}

.plugin-name {
  margin: 0;
  color: #1e293b;
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
}

.plugin-description {
  overflow: hidden;
  margin: 4px 0 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.plugin-meta {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  color: #64748b;
  font-size: 12px;
}

.plugin-meta span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.plugin-controls {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 6px;
  margin-left: 16px;
}

.action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 0;
  background: transparent;
  border-radius: 6px;
  color: #64748b;
  font-size: 13px;
  white-space: nowrap;
  cursor: pointer;
  transition: color 160ms ease;
}

.action:hover {
  background: #f8fafc;
  color: #334155;
}


.action--danger {
  color: #f04444;
}

.action--danger:hover {
  background: #fef2f2;
  color: #d91f2d;
}

@media (max-width: 900px) {
  .plugin-card {
    flex-wrap: wrap;
  }

  .plugin-icon {
    width: 44px;
    height: 44px;
  }

  .plugin-controls {
    width: 100%;
    justify-content: flex-end;
    margin: 6px 0 0;
  }
}

@media (max-width: 560px) {
  .plugin-card {
    padding: 15px;
  }

  .plugin-controls {
    justify-content: space-between;
    gap: 10px;
  }
}
</style>
