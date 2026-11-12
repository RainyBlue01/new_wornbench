<script setup lang="ts">
import { computed, shallowRef, useTemplateRef, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { upload } from '@/api/user'
import type {
  FormPluginFunction,
  FormPluginInstallPayload,
} from './types'

const props = defineProps<{
  appId: string
}>()

const emit = defineEmits<{
  install: [plugin: FormPluginInstallPayload]
}>()

const visible = defineModel<boolean>('visible', { default: false })
const fileInput = useTemplateRef<HTMLInputElement>('fileInput')
const step = shallowRef<1 | 2 | 3>(1)
const selectedFile = shallowRef<File | null>(null)
const parsing = shallowRef(false)
const dragging = shallowRef(false)
const expandedFunction = shallowRef('')
const packagePath = shallowRef('')
const installed = shallowRef(false)

const steps = [
  { num: 1, label: '上传文件' },
  { num: 2, label: '解析预览' },
  { num: 3, label: '安装完成' },
]

const parsedFunctions: FormPluginFunction[] = [
  {
    name: 'getInfo',
    description: '获取插件绑定的数据信息',
    functionType: 'frontend',
    params: ['studentId: String', 'type: String'],
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

const packageName = computed(() => selectedFile.value?.name || '')
const pluginName = computed(() => {
  const source = packageName.value.replace(/\.zip$/i, '').replace(/[-_]+/g, ' ').trim()
  if (!source) return '新插件'
  return source.replace(/\b[a-z]/g, (char) => char.toUpperCase())
})
const fileSize = computed(() => {
  const size = selectedFile.value?.size || 0
  return size < 1024 * 1024
    ? `${(size / 1024).toFixed(1)} KB`
    : `${(size / 1024 / 1024).toFixed(1)} MB`
})
const primaryText = computed(() => {
  if (step.value === 1) return '开始解析'
  if (step.value === 2) return '确认安装'
  return '完成'
})

function reset() {
  step.value = 1
  selectedFile.value = null
  parsing.value = false
  dragging.value = false
  expandedFunction.value = ''
  packagePath.value = ''
  installed.value = false
  if (fileInput.value) fileInput.value.value = ''
}

watch(visible, (nextVisible) => {
  if (nextVisible) reset()
})

function close() {
  visible.value = false
}

function chooseFile() {
  fileInput.value?.click()
}

function validateFile(file: File) {
  if (!/\.zip$/i.test(file.name)) {
    Message.warning('仅支持 .zip 格式的插件包')
    return false
  }
  if (file.size > 50 * 1024 * 1024) {
    Message.warning('插件包大小不能超过 50MB')
    return false
  }
  return true
}

function selectFile(file: File | null) {
  if (!file || !validateFile(file)) return
  selectedFile.value = file
  packagePath.value = ''
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  selectFile(input.files?.[0] || null)
}

function handleDrop(event: DragEvent) {
  dragging.value = false
  selectFile(event.dataTransfer?.files?.[0] || null)
}

function clearFile() {
  selectedFile.value = null
  if (fileInput.value) fileInput.value.value = ''
}

async function parsePackage() {
  const file = selectedFile.value
  if (!file) return
  parsing.value = true
  const uploadForm = new FormData()
  uploadForm.append(
    'fileProfile',
    new Blob(
      [JSON.stringify({ folder: 'formPluginPackage', appId: props.appId })],
      { type: 'application/json' },
    ),
  )
  uploadForm.append('file', file)

  try {
    const response = await upload(uploadForm)
    const result = response?.data ?? response?.path ?? response?.id ?? response
    packagePath.value = result ? String(result) : ''
    step.value = 2
  } catch {
    Message.error('插件包上传失败，请重新选择')
  } finally {
    parsing.value = false
  }
}

function installPlugin() {
  if (installed.value) {
    close()
    return
  }
  const now = new Date()
  const payload: FormPluginInstallPayload = {
    id: `form-plugin-${now.getTime()}`,
    name: pluginName.value,
    version: 'v1.0',
    packageName: packageName.value,
    packagePath: packagePath.value,
    enabled: true,
    bindField: '自动匹配',
    installedAt: now.toISOString().slice(0, 10),
    icon: 'plug',
    functions: parsedFunctions.map((item) => ({ ...item, params: [...item.params] })),
  }
  emit('install', payload)
  installed.value = true
  step.value = 3
}

function handlePrimary() {
  if (step.value === 1) {
    parsePackage()
    return
  }
  if (step.value === 2) {
    installPlugin()
    return
  }
  close()
}

function previous() {
  if (step.value === 2) step.value = 1
}

function toggleFunction(name: string) {
  expandedFunction.value = expandedFunction.value === name ? '' : name
}
</script>

<template>
  <a-modal
    v-model:visible="visible"
    modal-class="form-plugin-upload-modal"
    :width="720"
    title-align="start"
    :mask-closable="false"
    :esc-to-close="!parsing"
    :closable="!parsing"
    unmount-on-close
    @cancel="close"
  >
    <template #title>上传插件包</template>

    <div class="upload-body">
      <div class="step-bar">
        <div v-for="(item, index) in steps" :key="item.num" class="step-bar__group">
          <div
            class="step-item"
            :class="{ active: step === item.num, done: step > item.num }"
          >
            <span class="step-num">{{ item.num }}</span>
            <span>{{ item.label }}</span>
          </div>
          <div v-if="index < steps.length - 1" class="step-line" />
        </div>
      </div>

      <section v-if="step === 1" class="upload-step">
        <p class="step-description">选择插件包文件（.zip），系统将自动解析并展示包内的函数</p>
        <div
          v-if="!selectedFile"
          class="drop-zone"
          :class="{ 'drop-zone--active': dragging }"
          role="button"
          tabindex="0"
          @click="chooseFile"
          @keydown.enter="chooseFile"
          @dragover.prevent="dragging = true"
          @dragleave.prevent="dragging = false"
          @drop.prevent="handleDrop"
        >
          <i class="fas fa-archive drop-zone__icon" />
          <span class="drop-zone__title">点击上传或拖拽插件包到此处</span>
          <span class="drop-zone__hint">仅支持 .zip 格式，大小不超过 50MB</span>
        </div>
        <div v-else class="upload-file-info">
          <i class="fas fa-file-archive upload-file-info__icon" />
          <span>{{ packageName }}（{{ fileSize }}）</span>
          <a-button type="text" size="small" @click="clearFile">重新选择</a-button>
        </div>
        <input
          ref="fileInput"
          class="file-input"
          type="file"
          accept=".zip,application/zip"
          @change="handleFileChange"
        />
      </section>

      <section v-else-if="step === 2" class="upload-step">
        <p class="step-description">
          插件包 <strong>{{ packageName }}</strong> 已解析完成，共将安装以下内容：
        </p>
        <div class="package-card">
          <div class="package-card__title">
            <i class="fas fa-cube" />
            {{ pluginName }}
          </div>
          <p>版本: v1.0 · 包名: {{ packageName }}</p>
        </div>
        <div class="function-title">
          <i class="fas fa-code" />
          导出函数（{{ parsedFunctions.length }} 个）
        </div>
        <div class="function-list">
          <div v-for="item in parsedFunctions" :key="item.name" class="function-item">
            <button type="button" class="function-item__header" @click="toggleFunction(item.name)">
              <span class="function-dot" />
              <strong>{{ item.name }}</strong>
              <em>前端</em>
              <span>{{ item.description }}</span>
              <i
                class="fas fa-chevron-down function-arrow"
                :class="{ 'function-arrow--expanded': expandedFunction === item.name }"
              />
            </button>
            <div v-if="expandedFunction === item.name" class="function-detail">
              <small>入参</small>
              <div v-for="param in item.params" :key="param" class="function-param">
                <i class="fas fa-arrow-right" />
                <code>{{ param }}</code>
              </div>
              <p><small>返回</small><code>{{ item.returns }}</code></p>
            </div>
          </div>
        </div>
      </section>

      <section v-else class="success-step">
        <div class="success-icon"><i class="fas fa-check" /></div>
        <h3>安装完成</h3>
        <p>插件「{{ pluginName }}」已安装并自动生效</p>
        <dl class="install-summary">
          <div><dt>插件名称</dt><dd>{{ pluginName }}</dd></div>
          <div><dt>版本</dt><dd>v1.0</dd></div>
          <div><dt>包名</dt><dd><code>{{ packageName }}</code></dd></div>
          <div><dt>类型</dt><dd>前端插件</dd></div>
          <div><dt>导出函数</dt><dd>{{ parsedFunctions.length }} 个</dd></div>
          <div><dt>状态</dt><dd class="install-status">已启用 · 自动生效</dd></div>
        </dl>
      </section>
    </div>

    <template #footer>
      <div class="upload-footer">
        <a-button :disabled="parsing" @click="close">
          {{ step === 3 ? '关闭' : '取消' }}
        </a-button>
        <a-button v-if="step === 2" :disabled="parsing" @click="previous">上一步</a-button>
        <a-button
          type="primary"
          :loading="parsing"
          :disabled="step === 1 && !selectedFile"
          @click="handlePrimary"
        >
          {{ primaryText }}
        </a-button>
      </div>
    </template>
  </a-modal>
</template>

<style scoped lang="scss">
.upload-body {
  min-height: 320px;
}

.step-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
}

.step-bar__group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #94a3b8;
  font-size: 12px;
}

.step-item.active {
  color: rgb(var(--primary-6));
  font-weight: 600;
}

.step-item.done {
  color: #22c55e;
}

.step-num {
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

.step-item.active .step-num {
  background: #dbeafe;
  color: rgb(var(--primary-6));
}

.step-item.done .step-num {
  background: #f0fdf4;
  color: #22c55e;
}

.step-line {
  width: 24px;
  height: 1px;
  background: #e2e8f0;
}

.step-description {
  margin: 0 0 16px;
  color: #64748b;
  font-size: 13px;
}

.drop-zone {
  display: flex;
  width: 100%;
  box-sizing: border-box;
  align-items: center;
  flex-direction: column;
  padding: 36px 24px;
  border: 2px dashed #cbd5e1;
  border-radius: 14px;
  background: #f8fafc;
  color: inherit;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.drop-zone:hover,
.drop-zone--active {
  border-color: #3b82f6;
  background: #eff6ff;
}

.drop-zone__icon {
  margin-bottom: 8px;
  color: #94a3b8;
  font-size: 32px;
}

.drop-zone__title {
  color: #64748b;
  font-size: 14px;
}

.drop-zone__hint {
  margin-top: 4px;
  color: #94a3b8;
  font-size: 12px;
}

.file-input {
  display: none;
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
  color: #22c55e;
  font-size: 18px;
}

.package-card {
  margin-bottom: 12px;
  padding: 14px 16px;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  background: #f0fdf4;
}

.package-card__title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #166534;
  font-size: 14px;
  font-weight: 600;
}

.package-card__title i {
  color: #16a34a;
}

.package-card p {
  margin: 8px 0 0;
  color: #475569;
  font-size: 12px;
}

.function-title {
  margin-bottom: 8px;
  color: #1e293b;
  font-size: 13px;
  font-weight: 600;
}

.function-title i {
  margin-right: 4px;
  color: #3b82f6;
}

.function-list {
  display: grid;
  gap: 6px;
}

.function-item {
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.function-item__header {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border: 0;
  background: #f8fafc;
  color: #1e293b;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
}

.function-item__header strong {
  font-size: 13px;
}

.function-item__header em {
  padding: 1px 5px;
  border-radius: 3px;
  background: #dbeafe;
  color: #3b82f6;
  font-size: 10px;
  font-style: normal;
}

.function-item__header > span:not(.function-dot) {
  overflow: hidden;
  color: #94a3b8;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.function-dot {
  width: 6px;
  height: 6px;
  flex: 0 0 6px;
  border-radius: 50%;
  background: #22c55e;
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

.function-detail small {
  color: #94a3b8;
  font-size: 11px;
}

.function-param {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

.function-param i {
  display: grid;
  width: 16px;
  height: 16px;
  place-items: center;
  border-radius: 4px;
  background: #dbeafe;
  color: #3b82f6;
  font-size: 8px;
}

.function-detail code {
  color: #475569;
  font-size: 12px;
}

.function-detail p {
  display: flex;
  gap: 8px;
  margin: 8px 0 0;
}

.success-step {
  padding: 12px 0 0;
  text-align: center;
}

.success-icon {
  display: grid;
  width: 64px;
  height: 64px;
  margin: 0 auto;
  place-items: center;
  border-radius: 50%;
  background: #dcfce7;
  color: #16a34a;
  font-size: 28px;
}

.success-step h3 {
  margin: 16px 0 0;
  color: #1e293b;
  font-size: 18px;
}

.success-step > p {
  margin: 4px 0 0;
  color: #94a3b8;
  font-size: 14px;
}

.install-summary {
  margin: 16px 0 0;
  padding: 16px;
  border-radius: 10px;
  background: #f8fafc;
  font-size: 12px;
  text-align: left;
}

.install-summary div {
  display: flex;
  justify-content: space-between;
  min-height: 20px;
}

.install-summary dt {
  color: #94a3b8;
}

.install-summary dd {
  margin: 0;
  color: #1e293b;
  font-weight: 600;
}

.install-status {
  color: #16a34a !important;
}

.upload-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 !important;
}

@media (max-width: 720px) {
  .function-item__header > span:not(.function-dot) {
    display: none;
  }
}
</style>
