<script setup lang="ts">
import { computed, reactive, shallowRef, useTemplateRef, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconCloud, IconFile } from '@arco-design/web-vue/es/icon'
import { savePluginConfig, uploadPluginPackage } from '@/api/plugin'
import type { PluginFunctionResponse, PluginUploadResponse } from '../types'

const visible = defineModel<boolean>('visible', { required: true })
const emit = defineEmits<{ completed: [] }>()
const props = defineProps<{ fixedPluginType?: 'system' | 'app' }>()

const fileInput = useTemplateRef<HTMLInputElement>('fileInput')
const file = shallowRef<File | null>(null)
const step = shallowRef<1 | 2 | 3>(1)
const parsing = shallowRef(false)
const installing = shallowRef(false)
const isDragging = shallowRef(false)
const pluginType = shallowRef<'system' | 'app'>('system')
const parsedPlugin = shallowRef<PluginUploadResponse | null>(null)
const expandedExtension = shallowRef('')
const configMap = reactive<Record<string, unknown>>({})

const modalWidth = computed(() => step.value === 1 ? 720 : 720)
const extensions = computed(() => parsedPlugin.value?.extensions ?? [])
const fileSizeKb = computed(() => file.value ? Math.ceil(file.value.size / 1024) : 0)
const steps = [
  { num: 1, label: '上传文件' },
  { num: 2, label: '解析确认' },
  { num: 3, label: '安装完成' },
]

function reset() {
  file.value = null
  step.value = 1
  parsing.value = false
  parsedPlugin.value = null
  expandedExtension.value = ''
  installing.value = false
  isDragging.value = false
  pluginType.value = props.fixedPluginType ?? 'system'
  Object.keys(configMap).forEach(key => delete configMap[key])
  if (fileInput.value) fileInput.value.value = ''
}

function acceptFile(candidate?: File) {
  if (!candidate) return
  if (!candidate.name.toLowerCase().endsWith('.zip')) {
    Message.warning('仅支持上传 .zip 格式的插件包')
    return
  }
  if (candidate.size > 50 * 1024 * 1024) {
    Message.warning('插件包大小不能超过 50MB')
    return
  }
  file.value = candidate
  isDragging.value = false
}

function onFileChange(event: Event) {
  acceptFile((event.target as HTMLInputElement).files?.[0])
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  acceptFile(event.dataTransfer?.files?.[0])
}

function clearFile() {
  file.value = null
  if (fileInput.value) fileInput.value.value = ''
}

async function parsePackage() {
  if (!file.value || parsing.value) return
  parsing.value = true
  try {
    parsedPlugin.value = await uploadPluginPackage(file.value, pluginType.value)
    for (const item of parsedPlugin.value.configItems ?? []) {
      configMap[item.key] = item.value ?? (item.type === 'boolean' ? false : '')
    }
    const firstExtension = parsedPlugin.value.extensions?.[0]
    expandedExtension.value = firstExtension ? extensionKey(firstExtension, 0) : ''
    step.value = 2
  } finally {
    parsing.value = false
  }
}

async function confirmInstall() {
  const missing = parsedPlugin.value?.configItems?.find(item => item.required && (configMap[item.key] === '' || configMap[item.key] == null))
  if (missing) return Message.warning(`请填写${missing.label || missing.key}`)
  installing.value = true
  try {
    if (parsedPlugin.value?.configItems?.length) {
      await savePluginConfig({ pluginId: parsedPlugin.value.pluginId, configMap: { ...configMap } })
    }
    step.value = 3
    emit('completed')
  } finally {
    installing.value = false
  }
}

function finish() {
  visible.value = false
}

function extensionKey(item: PluginFunctionResponse, index: number) {
  return item.extensionCode ?? item.functionId ?? String(item.id ?? index)
}

function formatParameterSchema(value?: string) {
  if (!value) return '无'
  let parsed: unknown = value
  for (let index = 0; index < 2 && typeof parsed === 'string'; index += 1) {
    try {
      parsed = JSON.parse(parsed)
    } catch {
      break
    }
  }
  if (!Array.isArray(parsed)) return typeof parsed === 'string' ? parsed : JSON.stringify(parsed)
  if (!parsed.length) return '无'
  return parsed.map((item: Record<string, unknown>) => {
    const name = item.label ?? item.name ?? item.key ?? '参数'
    const type = item.type ?? 'Object'
    return `${String(name)}: ${String(type)}`
  }).join('\n')
}

watch(visible, isVisible => {
  if (isVisible) reset()
})
</script>

<template>
  <a-modal v-model:visible="visible" modal-class="plugin-upload-modal" :width="modalWidth" title-align="start"
    :mask-closable="false" :footer="false" unmount-on-close>
    <template #title>上传插件包</template>

    <div class="plugin-step-bar">
      <div v-for="(item, index) in steps" :key="item.num" class="plugin-step-bar__group">
        <div class="plugin-step-item" :class="{ active: step === item.num, done: step > item.num }">
          <span class="plugin-step-num">{{ step > item.num ? '✓' : item.num }}</span>
          <span>{{ item.label }}</span>
        </div>
        <div v-if="index < steps.length - 1" class="plugin-step-line" :class="{ done: step > item.num }" />
      </div>
    </div>

    <section v-if="step === 1" class="upload-step">
      <div class="step-scroll-content">
        <p class="step-hint">选择插件包文件，系统将自动解析并展示包内的配置及导出函数。</p>
        <div v-if="!file" class="upload-zone" :class="{ 'is-dragging': isDragging }" role="button" tabindex="0"
          @click="fileInput?.click()" @keydown.enter="fileInput?.click()" @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false" @drop.prevent="onDrop">
          <IconCloud class="upload-zone__icon" />
          <p class="upload-zone__title">点击上传或拖拽插件包到此处</p>
          <p class="upload-zone__sub">支持 .zip 格式，单个文件最大 50MB</p>
        </div>
        <div v-else class="upload-file-info">
          <IconFile class="upload-file-info__icon" />
          <span class="upload-file-info__name">{{ file.name }} ({{ fileSizeKb }} KB)</span>
          <a-button type="text" size="small" @click="clearFile">重新选择</a-button>
        </div>
        <input ref="fileInput" type="file" accept=".zip,application/zip" class="file-input-hidden"
          @change="onFileChange" />
      </div>
      <footer class="modal-actions">
        <a-button class="modal-btn modal-btn-ghost" @click="visible = false">取消</a-button>
        <a-button type="primary" class="modal-btn modal-btn-primary" :disabled="!file" :loading="parsing"
          @click="parsePackage">开始解析</a-button>
      </footer>
    </section>

    <section v-else-if="step === 2" class="review-step">
      <div class="step-scroll-content">
        <p class="step-hint">插件包 {{ file?.name }} 已解析完成，共将安装以下内容：</p>
        <div class="plugin-summary">
          <i class="fas fa-cube" />
          <div><strong>{{ parsedPlugin?.pluginName }}</strong><small>版本: v{{ parsedPlugin?.version }} · 包名: {{
              file?.name
              }}</small></div>
        </div>

        <div v-if="parsedPlugin?.configItems?.length" class="plugin-config-form">
          <h4 class="extension-title"><i class="fas fa-sliders" /> 插件配置</h4>
          <label v-for="item in parsedPlugin.configItems" :key="item.key" class="config-field">
            <span>{{ item.label || item.key }}<em v-if="item.required">*</em></span>
            <a-switch v-if="item.type === 'boolean'" v-model="configMap[item.key]" />
            <a-input-number v-else-if="item.type === 'number'" v-model="configMap[item.key]" />
            <a-input-password v-else-if="item.type === 'password'" v-model="configMap[item.key]" />
            <a-textarea v-else-if="item.type === 'textarea'" v-model="configMap[item.key]"
              :auto-size="{ minRows: 2, maxRows: 4 }" />
            <a-input v-else v-model="configMap[item.key]" />
          </label>
        </div>

        <h4 class="extension-title"><i class="fas fa-code" /> 导出函数 ({{ extensions.length }} 个)</h4>
        <div class="extension-list">
          <div v-for="(item, index) in extensions" :key="extensionKey(item, index)" class="extension-item">
            <button type="button" class="extension-head"
              @click="expandedExtension = expandedExtension === extensionKey(item, index) ? '' : extensionKey(item, index)">
              <span class="status-dot" />
              <strong>{{ item.extensionName || item.functionName || item.extensionCode }}</strong>
              <em>后端函数</em>
              <span class="extension-description">{{ item.extensionDescription || item.description }}</span>
              <i class="fas fa-chevron-down" :class="{ expanded: expandedExtension === extensionKey(item, index) }" />
            </button>
            <div v-if="expandedExtension === extensionKey(item, index)" class="extension-detail">
              <span>入参</span><code>{{ formatParameterSchema(item.inputParams) }}</code>
              <span>返回</span><code>{{ formatParameterSchema(item.outputParams) }}</code>
            </div>
          </div>
          <a-empty v-if="extensions.length === 0" description="插件包未声明导出函数" />
        </div>
      </div>
      <footer class="modal-actions">
        <a-button class="modal-btn modal-btn-ghost" @click="step = 1">上一步</a-button>
        <a-button class="modal-btn modal-btn-ghost" @click="visible = false">取消</a-button>
        <a-button type="primary" class="modal-btn modal-btn-primary" :loading="installing"
          @click="confirmInstall">确认安装</a-button>
      </footer>
    </section>

    <section v-else class="success-step">
      <div class="step-scroll-content success-content">
        <span class="success-icon"><i class="fas fa-check" /></span>
        <h3>安装完成</h3>
        <p>插件「{{ parsedPlugin?.pluginName }}」已安装并自动生效</p>
        <dl class="install-result">
          <dt>插件名称</dt>
          <dd>{{ parsedPlugin?.pluginName }}</dd>
          <dt>版本</dt>
          <dd>v{{ parsedPlugin?.version }}</dd>
          <dt>包名</dt>
          <dd>{{ file?.name }}</dd>
          <dt>类型</dt>
          <dd>{{ pluginType === 'system' ? '系统级插件' : '应用级插件' }}</dd>
          <dt>导出函数</dt>
          <dd>{{ extensions.length }} 个</dd>
          <dt>状态</dt>
          <dd class="enabled">已启用 · 自动生效</dd>
        </dl>
      </div>
      <footer class="modal-actions">
        <a-button class="modal-btn modal-btn-ghost" @click="step = 2">上一步</a-button>
        <a-button class="modal-btn modal-btn-ghost" @click="visible = false">关闭</a-button>
        <a-button type="primary" class="modal-btn modal-btn-primary" @click="finish">完成</a-button>
      </footer>
    </section>
  </a-modal>
</template>

<style lang="scss">
.plugin-upload-modal {
  overflow: hidden;
  border-radius: 16px;

  .arco-modal-header {
    padding: 20px 24px;
    border-bottom: 1px solid #edf1f7;
  }

  .arco-modal-title {
    color: #1e293b;
    font-size: 16px;
    font-weight: 600;
  }

  .arco-modal-body {
    display: flex;
    max-height: 620px;
    min-height: 360px;
    flex-direction: column;
    padding: 24px 24px 0;
    overflow: hidden;
  }
}

.plugin-upload-modal {
  .plugin-step-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 24px;
  }

  .plugin-step-bar__group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .plugin-step-item {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #94a3b8;
    font-size: 12px;
  }

  .plugin-step-item.active {
    color: rgb(var(--primary-6));
    font-weight: 600;
  }

  .plugin-step-item.done {
    color: #22c55e;
  }

  .plugin-step-num {
    display: flex;
    width: 22px;
    height: 22px;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: #f1f5f9;
    color: #94a3b8;
    font-size: 11px;
    font-weight: 600;
  }

  .plugin-step-item.active .plugin-step-num {
    background: #dbeafe;
    color: rgb(var(--primary-6));
  }

  .plugin-step-item.done .plugin-step-num {
    background: #f0fdf4;
    color: #22c55e;
  }

  .plugin-step-line {
    width: 24px;
    height: 1px;
    background: #e2e8f0;
  }

  .plugin-step-line.done {
    background: #22c55e;
  }

  .upload-step,
  .review-step,
  .success-step {
    display: flex;
    min-height: 0;
    flex: 1;
    flex-direction: column;
    overflow: hidden;
    padding: 0;
  }

  .step-scroll-content {
    min-height: 0;
    flex: 1;
    overflow-x: hidden;
    overflow-y: auto;
    padding-right: 4px;
    scrollbar-gutter: stable;
  }

  .step-hint {
    margin: 0 0 16px;
    color: #64748b;
    font-size: 13px;
  }

  .upload-zone {
    padding: 36px 24px;
    border: 2px dashed #cbd5e1;
    border-radius: 14px;
    background: #f8fafc;
    text-align: center;
    cursor: pointer;
    transition: all .2s;
  }

  .upload-zone:hover,
  .upload-zone.is-dragging {
    border-color: rgb(var(--primary-6));
    background: #eff6ff;
  }

  .upload-zone__icon {
    margin-bottom: 8px;
    color: #94a3b8;
    font-size: 32px;
  }

  .upload-zone__title {
    margin: 0;
    color: #64748b;
    font-size: 13px;
  }

  .upload-zone__sub {
    margin: 4px 0 0;
    color: #94a3b8;
    font-size: 12px;
  }

  .upload-file-info {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-radius: 10px;
    background: #f8fafc;
    color: #475569;
    font-size: 13px;
  }

  .upload-file-info__icon {
    flex: none;
    color: #22c55e;
    font-size: 18px;
  }

  .upload-file-info__name {
    min-width: 0;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .file-input-hidden {
    display: none;
  }

  .modal-actions {
    display: flex;
    flex: none;
    justify-content: flex-end;
    gap: 12px;
    margin: 0;
    padding: 16px 0 0;
    border: 0;
    background: #fff;
  }

  .modal-btn {
    height: auto !important;
    padding: 9px 18px !important;
    border: 0 !important;
    border-radius: 10px !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    transition: all .2s !important;
  }

  .modal-btn-ghost {
    border: 1px solid #e2e8f0 !important;
    background: #f8fafc !important;
    color: #64748b !important;
  }

  .modal-btn-ghost:hover {
    background: #f1f5f9 !important;
    color: #334155 !important;
  }

  .modal-btn-primary {
    background: linear-gradient(135deg, #3b82f6, #6366f1) !important;
    color: #fff !important;
    box-shadow: 0 4px 15px rgb(59 130 246 / 25%) !important;
  }

  .modal-btn-primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgb(59 130 246 / 35%) !important;
  }

  .plugin-summary {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px;
    border: 1px solid #9ce8b6;
    border-radius: 10px;
    background: #effdf4;
    color: #15803d;
  }

  .plugin-summary>i {
    font-size: 18px;
  }

  .plugin-summary div {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .plugin-summary small {
    color: #526477;
  }

  .extension-title {
    margin: 12px 0 8px;
    color: #334155;
    font-size: 14px;
  }

  .extension-title i {
    color: #3b82f6;
  }

  .extension-list {
    display: flex;
    flex: none;
    flex-direction: column;
    gap: 6px;
    overflow: visible;
  }

  .extension-item {
    overflow: hidden;
    border: 1px solid #dbe3ee;
    border-radius: 8px;
  }

  .extension-head {
    display: grid;
    width: 100%;
    min-height: 42px;
    align-items: center;
    grid-template-columns: 8px max-content max-content 1fr 16px;
    gap: 8px;
    padding: 0 12px;
    border: 0;
    background: #f8fafc;
    color: #334155;
    text-align: left;
    cursor: pointer;
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #22c55e;
  }

  .extension-head em {
    padding: 2px 6px;
    border-radius: 4px;
    background: #f3e8ff;
    color: #9333ea;
    font-size: 11px;
    font-style: normal;
  }

  .extension-description {
    overflow: hidden;
    color: #94a3b8;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .extension-head .fa-chevron-down {
    color: #94a3b8;
    font-size: 10px;
    transition: transform .2s;
  }

  .extension-head .expanded {
    transform: rotate(180deg);
  }

  .extension-detail {
    display: grid;
    grid-template-columns: 40px minmax(0, 1fr);
    gap: 8px;
    padding: 12px;
    color: #94a3b8;
    font-size: 12px;
  }

  .extension-detail code {
    overflow-wrap: anywhere;
    color: #334155;
    white-space: pre-wrap;
  }

  .plugin-config-form {
    margin-top: 12px;
  }

  .config-field {
    display: grid;
    grid-template-columns: 140px 1fr;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
    color: #475569;
    font-size: 13px;
  }

  .config-field em {
    margin-left: 3px;
    color: #f53f3f;
    font-style: normal;
  }

  .success-step {
    text-align: center;
  }

  .success-content {
    padding-top: 40px;
  }

  .success-icon {
    display: grid;
    width: 64px;
    height: 64px;
    margin: 0 auto 16px;
    place-items: center;
    border-radius: 50%;
    background: #d8fae5;
    color: #16a34a;
    font-size: 26px;
  }

  .success-step h3 {
    margin: 0 0 8px;
    color: #172033;
    font-size: 20px;
  }

  .success-content>p {
    margin: 0 0 16px;
    color: #8aa0ba;
  }

  .install-result {
    display: grid;
    grid-template-columns: 1fr 1fr;
    margin: 0;
    padding: 16px;
    border-radius: 10px;
    background: #f8fafc;
    font-size: 13px;
    text-align: left;
  }

  .install-result dt,
  .install-result dd {
    margin: 0;
    padding: 3px 0;
  }

  .install-result dt {
    color: #94a3b8;
  }

  .install-result dd {
    color: #334155;
    text-align: right;
  }

  .install-result .enabled {
    color: #16a34a;
    font-weight: 600;
  }
}
</style>
