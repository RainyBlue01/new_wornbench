<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import type { PluginFunctionItem, PluginItem } from '../types'

const dowUrl = (window as any).api?.dowUrl || ''
const visible = defineModel<boolean>('visible', { required: true })
const props = defineProps<{ plugin: PluginItem | null; loading?: boolean }>()
const expandedKeys = shallowRef<string[]>([])

const functions = computed(() => props.plugin?.functions ?? [])

function getFunctionKey(item: PluginFunctionItem) {
  return String(item.id || item.functionId)
}

function toggleFunction(item: PluginFunctionItem) {
  const key = getFunctionKey(item)
  expandedKeys.value = expandedKeys.value.includes(key)
    ? expandedKeys.value.filter(itemKey => itemKey !== key)
    : [...expandedKeys.value, key]
}

function getIconUrl(icon: string) {
  if (!icon || !dowUrl) return ''
  return dowUrl + icon + '&token=' + localStorage.getItem('wornbench_token')
}

watch(
  () => [visible.value, props.plugin?.id, ...functions.value.map(getFunctionKey)],
  () => {
    expandedKeys.value = visible.value ? functions.value.map(getFunctionKey) : []
  },
  { immediate: true },
)
</script>

<template>
  <a-drawer v-model:visible="visible" height="85vh" placement="bottom" unmount-on-close :footer="false"
    title="插件详情" class="plugin-detail-drawer">
    <a-spin :loading="loading" class="detail-loading">
      <div v-if="plugin" class="detail-content">
        <div class="detail-hero">
          <div class="detail-icon" :style="getIconUrl(plugin.icon) ? {} : { backgroundColor: plugin.color }">
            <img v-if="getIconUrl(plugin.icon)" :src="getIconUrl(plugin.icon)" alt="" />
            <i v-else class="fas fa-puzzle-piece" aria-hidden="true" />
          </div>
          <div class="detail-summary">
            <h3 class="detail-name">{{ plugin.name }}</h3>
            <p class="detail-meta">{{ plugin.id }} · v{{ plugin.version }}</p>
          </div>
        </div>

        <p v-if="plugin.description" class="detail-description">
          <span>插件功能描述：</span>{{ plugin.description }}
        </p>

        <section class="function-section">
          <h4 class="section-title">函数列表 ({{ functions.length }} 个)</h4>
          <div v-if="functions.length" class="function-list">
            <article v-for="item in functions" :key="getFunctionKey(item)" class="function-panel">
              <button type="button" class="function-header" :aria-expanded="expandedKeys.includes(getFunctionKey(item))"
                @click="toggleFunction(item)">
                <span class="status-dot" />
                <strong>{{ item.functionName || item.functionId }}</strong>
                <em>{{ item.functionType === 'frontend' ? '前端函数' : '后端函数' }}</em>
                <span class="function-description">{{ item.description || '暂无函数描述' }}</span>
                <i class="fas fa-chevron-down" :class="{ expanded: expandedKeys.includes(getFunctionKey(item)) }" />
              </button>

              <div v-if="expandedKeys.includes(getFunctionKey(item))" class="function-body">
                <div class="parameter-group">
                  <span class="parameter-label">入参</span>
                  <div v-if="item.inputParams.length" class="parameter-list">
                    <div v-for="(parameter, index) in item.inputParams" :key="`input-${parameter.name}-${index}`"
                      class="parameter-item">
                      <i class="fas fa-arrow-right" />
                      <code>{{ parameter.name }}: {{ parameter.type }}</code>
                      <small v-if="parameter.description">{{ parameter.description }}</small>
                    </div>
                  </div>
                  <span v-else class="parameter-empty">无</span>
                </div>
                <div class="parameter-group parameter-group--return">
                  <span class="parameter-label">返回</span>
                  <div v-if="item.outputParams.length" class="parameter-list">
                    <div v-for="(parameter, index) in item.outputParams" :key="`output-${parameter.name}-${index}`"
                      class="parameter-item parameter-item--return">
                      <code>{{ parameter.name ? `${parameter.name}: ` : '' }}{{ parameter.type }}</code>
                    </div>
                  </div>
                  <span v-else class="parameter-empty">无</span>
                </div>
              </div>
            </article>
          </div>
          <a-empty v-else description="暂无函数" />
        </section>
      </div>
    </a-spin>
  </a-drawer>
</template>

<style scoped lang="scss">
.detail-loading { display: block; width: 100%; min-height: 240px; }
.detail-content { width: 100%; color: #172033; }
.detail-hero { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.detail-icon { display: grid; width: 56px; height: 56px; flex: 0 0 56px; overflow: hidden; place-items: center; border-radius: 10px; color: #fff; font-size: 24px; }
.detail-icon img { width: 100%; height: 100%; object-fit: cover; }
.detail-summary { min-width: 0; }
.detail-name { margin: 0 0 4px; color: #1e293b; font-size: 16px; font-weight: 600; }
.detail-meta { overflow: hidden; margin: 0; color: #64748b; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.detail-description { margin: 0 0 26px; color: #475569; font-size: 13px; line-height: 21px; }
.detail-description span { margin-right: 4px; color: #64748b; }
.function-section { width: 100%; }
.section-title { margin: 0 0 12px; color: #475569; font-size: 13px; font-weight: 600; }
.function-list { display: flex; flex-direction: column; gap: 6px; }
.function-panel { overflow: hidden; border: 1px solid #dbe3ee; border-radius: 8px; background: #fff; }
.function-header { display: grid; width: 100%; min-height: 42px; align-items: center; grid-template-columns: 7px max-content max-content minmax(0, 1fr) 14px; gap: 8px; padding: 0 12px; border: 0; background: #f8fafc; color: #334155; text-align: left; cursor: pointer; }
.function-header:hover { background: #f3f7fb; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; }
.function-header strong { font-size: 13px; font-weight: 600; }
.function-header em { padding: 2px 6px; border-radius: 4px; background: #f3e8ff; color: #9333ea; font-size: 11px; font-style: normal; font-weight: 500; }
.function-description { overflow: hidden; color: #94a3b8; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.function-header > i { color: #94a3b8; font-size: 10px; transition: transform .2s ease; }
.function-header > i.expanded { transform: rotate(180deg); }
.function-body { padding: 14px 14px 16px; border-top: 1px solid #edf2f7; background: #fff; }
.parameter-group { display: grid; grid-template-columns: 46px 1fr; align-items: start; gap: 8px; }
.parameter-group + .parameter-group { margin-top: 10px; }
.parameter-label { color: #94a3b8; font-size: 12px; line-height: 22px; }
.parameter-list { display: flex; flex-direction: column; gap: 6px; }
.parameter-item { display: flex; min-height: 22px; align-items: center; gap: 7px; }
.parameter-item > i { display: grid; width: 16px; height: 16px; place-items: center; border-radius: 4px; background: #f3e8ff; color: #9333ea; font-size: 8px; }
.parameter-item code, .parameter-empty { color: #334155; font-family: Consolas, 'Courier New', monospace; font-size: 12px; }
.parameter-item small { color: #94a3b8; font-size: 11px; }
.parameter-item--return { padding-left: 0; }
.parameter-empty { line-height: 22px; }

:global(.plugin-detail-drawer.arco-drawer-container) { align-items: flex-end; }
:global(.plugin-detail-drawer .arco-drawer) { display: flex; flex-direction: column; overflow: hidden; border-radius: 16px 16px 0 0; box-shadow: 0 -8px 32px rgb(0 0 0 / 8%); }
:global(.plugin-detail-drawer .arco-drawer-header) { height: 76px; flex: none; padding: 0 24px; border-bottom: 1px solid #edf1f7; }
:global(.plugin-detail-drawer .arco-drawer-title) { color: #1e293b; font-size: 18px; font-weight: 600; }
:global(.plugin-detail-drawer .arco-drawer-close-btn) { display: grid; width: 28px; height: 28px; place-items: center; border-radius: 8px; background: #f8fafc; color: #64748b; }
:global(.plugin-detail-drawer .arco-drawer-close-btn:hover) { background: #f1f5f9; color: #334155; }
:global(.plugin-detail-drawer .arco-drawer-body) { min-height: 0; flex: 1; overflow-y: auto; padding: 24px; }
:global(.plugin-detail-drawer .arco-drawer-mask) { background-color: rgb(0 0 0 / 30%); backdrop-filter: blur(2px); }

@media (max-width: 720px) {
  .function-header { grid-template-columns: 7px minmax(0, max-content) max-content 1fr 14px; }
  .function-description { display: none; }
}
</style>
