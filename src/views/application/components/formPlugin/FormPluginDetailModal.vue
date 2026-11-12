<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import type { FormPluginFunction, FormPluginItem } from './types'

const visible = defineModel<boolean>('visible', { required: true })
const props = defineProps<{
  plugin: FormPluginItem | null
}>()

const defaultFunctions: FormPluginFunction[] = [
  {
    name: 'getInfo',
    description: '获取插件绑定的数据信息',
    functionType: 'frontend',
    params: ['studentId: String'],
    returns: 'Object',
  },
  {
    name: 'validate',
    description: '校验插件数据合法性',
    functionType: 'backend',
    params: ['data: Object'],
    returns: 'Boolean',
  },
  {
    name: 'transform',
    description: '数据格式转换',
    functionType: 'frontend',
    params: ['input: Object', 'format: String'],
    returns: 'Object',
  },
]

const functions = computed<FormPluginFunction[]>(() => {
  const pluginFunctions = props.plugin?.functions
  if (!pluginFunctions?.length) return defaultFunctions
  return pluginFunctions.map((item, index) => ({
    ...item,
    functionType: item.functionType ?? (index === 1 ? 'backend' : 'frontend'),
  }))
})

const expandedFunctions = shallowRef<Set<string>>(new Set())

watch(
  () => [visible.value, props.plugin?.id] as const,
  ([isVisible]) => {
    if (!isVisible) {
      expandedFunctions.value = new Set()
      return
    }
    const list = functions.value
    expandedFunctions.value = new Set(
      [list[0]?.name, list.at(-1)?.name].filter((name): name is string => Boolean(name)),
    )
  },
  { immediate: true },
)

function isExpanded(name: string) {
  return expandedFunctions.value.has(name)
}

function toggleFunction(name: string) {
  const next = new Set(expandedFunctions.value)
  if (next.has(name)) next.delete(name)
  else next.add(name)
  expandedFunctions.value = next
}

function isBackend(item: FormPluginFunction) {
  return item.functionType === 'backend'
}
</script>

<template>
  <a-modal v-model:visible="visible" modal-class="form-plugin-detail-modal" :title="plugin?.name || '插件详情'"
    title-align="start" :width="560" :footer="false" :mask-closable="false" unmount-on-close>
    <div v-if="plugin" class="detail-body">
      <section class="detail-section">
        <p class="section-label">插件信息</p>
        <div class="plugin-info">
          <span>版本: {{ plugin.version }}</span>
          <span>包名: {{ plugin.packageName }}</span>
        </div>
      </section>

      <section class="detail-section detail-section--functions">
        <p class="section-label">导出函数（{{ functions.length }} 个）</p>
        <div class="function-list">
          <article v-for="item in functions" :key="item.name" class="function-item">
            <button type="button" class="function-header" :aria-expanded="isExpanded(item.name)"
              @click="toggleFunction(item.name)">
              <span class="function-dot" />
              <strong>{{ item.name }}</strong>
              <span class="function-type" :class="{ 'function-type--backend': isBackend(item) }">
                {{ isBackend(item) ? '后端' : '前端' }}
              </span>
              <span class="function-description">{{ item.description }}</span>
              <i class="fas fa-chevron-down function-arrow"
                :class="{ 'function-arrow--expanded': isExpanded(item.name) }" />
            </button>

            <div v-if="isExpanded(item.name)" class="function-detail">
              <p class="parameter-label">入参</p>
              <div v-if="item.params.length" class="parameter-list">
                <div v-for="param in item.params" :key="param" class="parameter-item">
                  <span class="parameter-icon" :class="{ 'parameter-icon--backend': isBackend(item) }">
                    <i class="fas fa-arrow-right" />
                  </span>
                  <code>{{ param }}</code>
                </div>
              </div>
              <p v-else class="empty-parameter">无</p>
              <div class="return-value">
                <span>返回</span>
                <code>{{ item.returns }}</code>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>

    <div class="modal-footer">
      <a-button type="primary" @click="visible = false">关闭</a-button>
    </div>
  </a-modal>
</template>

<style lang="scss">
.form-plugin-detail-modal {
  overflow: hidden;
  border-radius: 16px;

  .arco-modal-header {
    padding: 20px 24px 16px;
    border-bottom: 1px solid #f1f5f9;
  }

  .arco-modal-title {
    color: #1e293b;
    font-size: 15px;
    font-weight: 700;
  }

  .arco-modal-close-btn {
    display: grid;
    width: 28px;
    height: 28px;
    place-items: center;
    border-radius: 6px;
    background: #f8fafc;
    color: #64748b;
  }

  .arco-modal-close-btn:hover {
    background: #f1f5f9;
    color: #334155;
  }

  .arco-modal-body {
    padding: 20px 24px 0;
  }

  .detail-section {
    margin-bottom: 16px;
  }

  .detail-section--functions {
    margin-bottom: 20px;
  }

  .section-label {
    margin: 0 0 6px;
    color: #94a3b8;
    font-size: 12px;
  }

  .plugin-info {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 16px;
    padding: 12px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #f8fafc;
    color: #1e293b;
    font-size: 12px;
  }

  .function-list {
    display: grid;
    gap: 4px;
  }

  .function-item {
    overflow: hidden;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #fff;
  }

  .function-header {
    display: flex;
    width: 100%;
    align-items: center;
    gap: 8px;
    padding: 9px 12px;
    border: 0;
    background: #f8fafc;
    color: inherit;
    cursor: pointer;
    font-family: inherit;
    text-align: left;
  }

  .function-header:focus-visible {
    outline: 2px solid #93c5fd;
    outline-offset: -2px;
  }

  .function-dot {
    width: 6px;
    height: 6px;
    flex: 0 0 6px;
    border-radius: 50%;
    background: #22c55e;
  }

  .function-header strong {
    color: #1e293b;
    font-size: 13px;
    font-weight: 600;
  }

  .function-type {
    padding: 1px 5px;
    border-radius: 3px;
    background: #dbeafe;
    color: #2563eb;
    font-size: 11px;
    line-height: 17px;
  }

  .function-type--backend {
    background: #f3e8ff;
    color: #9333ea;
  }

  .function-description {
    min-width: 0;
    overflow: hidden;
    color: #94a3b8;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .function-arrow {
    margin-left: auto;
    color: #94a3b8;
    font-size: 10px;
    transition: transform 0.2s ease;
  }

  .function-arrow--expanded {
    transform: rotate(180deg);
  }

  .function-detail {
    padding: 10px 14px 14px;
    border-top: 1px solid #f1f5f9;
  }

  .parameter-label {
    margin: 0 0 6px;
    color: #94a3b8;
    font-size: 11px;
  }

  .parameter-list {
    display: grid;
    gap: 4px;
  }

  .parameter-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .parameter-icon {
    display: grid;
    width: 14px;
    height: 14px;
    place-items: center;
    border-radius: 4px;
    background: #dbeafe;
    color: #2563eb;
    font-size: 7px;
  }

  .parameter-icon--backend {
    background: #f3e8ff;
    color: #9333ea;
  }

  .parameter-item code,
  .return-value code {
    color: #475569;
    font-family: Consolas, Monaco, monospace;
    font-size: 12px;
  }

  .empty-parameter {
    margin: 0;
    color: #94a3b8;
    font-size: 12px;
  }

  .return-value {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 6px;
  }

  .return-value span {
    color: #94a3b8;
    font-size: 11px;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    margin: 0 -24px;
    padding: 14px 24px 0;
    border-top: 1px solid #f1f5f9;
  }

  .modal-footer .arco-btn {
    min-width: 64px;
    border-radius: 8px;
  }
}

@media (max-width: 600px) {
  .form-plugin-detail-modal .function-description {
    display: none;
  }
}
</style>
