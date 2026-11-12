<script setup lang="ts">
import { reactive, shallowRef } from 'vue'
import { Message } from '@arco-design/web-vue'
import { upload } from '@/api/user'

interface SidebarFunction {
  id: string
  name: string
  description: string
  kind: 'frontend' | 'backend'
  language?: string
  implMode?: 'code' | 'package'
  entryFunc?: string
  packageFile?: string
  timeout?: number
}

interface FunctionForm {
  name: string
  description: string
  kind: 'frontend' | 'backend'
  timeout?: number
  implMode?: 'code' | 'package'
  entryFunc?: string
  packageFile?: string
  language?: string
}

interface ParameterForm {
  key: string
  label: string
  value: string
  type?: string
  required?: boolean
}

interface PluginSettingsForm {
  name: string
  description: string
  version: string
  status: number
}

const props = defineProps<{
  pluginName: string
  pluginId: string
  pluginDescription: string
  pluginVersion: string
  pluginStatus: number
  functions: SidebarFunction[]
}>()

const selectedFunctionId = defineModel<string>('selectedFunctionId', { required: true })

const emit = defineEmits<{
  createFunction: [form: FunctionForm]
  editFunction: [form: FunctionForm & { id: string }]
  deleteFunction: [item: SidebarFunction]
  uploadFunction: [form: FunctionForm]
  createParameter: [form: ParameterForm]
  updatePlugin: [form: PluginSettingsForm]
}>()

const selectedParameterKey = shallowRef('')
const functionModalVisible = shallowRef(false)
const editingFunctionId = shallowRef('')
const functionStep = shallowRef<1 | 2>(1)
const implementationMode = shallowRef<'code' | 'package'>('code')
const entryFunction = shallowRef('')
const packageFile = shallowRef<File | null>(null)
const packageFilePath = shallowRef('')
const packageUploading = shallowRef(false)
const parameterModalVisible = shallowRef(false)
const uploadModalVisible = shallowRef(false)
const uploadedFile = shallowRef<File | null>(null)
const pluginSettingsVisible = shallowRef(false)

const functionForm = reactive<FunctionForm>({
  name: '',
  description: '',
  kind: 'frontend',
  language: 'javascript',
  timeout: 30,
})

const parameterForm = reactive<ParameterForm>({
  key: '',
  label: '',
  value: '',
  type: '文本',
  required: false,
})

const pluginSettingsForm = reactive<PluginSettingsForm>({
  name: '',
  description: '',
  version: '',
  status: 0,
})

function openPluginSettings() {
  Object.assign(pluginSettingsForm, {
    name: props.pluginName,
    description: props.pluginDescription,
    version: props.pluginVersion,
    status: props.pluginStatus,
  })
  pluginSettingsVisible.value = true
}

function savePluginSettings(done: (closed: boolean) => void) {
  if (!pluginSettingsForm.name.trim()) {
    Message.warning('请输入插件名称')
    done(false)
    return
  }
  if (!pluginSettingsForm.version.trim()) {
    Message.warning('请输入版本号')
    done(false)
    return
  }
  emit('updatePlugin', {
    ...pluginSettingsForm,
    name: pluginSettingsForm.name.trim(),
    description: pluginSettingsForm.description.trim(),
    version: pluginSettingsForm.version.trim(),
  })
  done(true)
}

function openFunctionModal() {
  editingFunctionId.value = ''
  Object.assign(functionForm, {
    name: '',
    description: '',
    kind: 'frontend',
    language: 'javascript',
    timeout: 30,
  })
  functionStep.value = 1
  implementationMode.value = 'code'
  entryFunction.value = ''
  packageFile.value = null
  packageFilePath.value = ''
  packageUploading.value = false
  functionModalVisible.value = true
}

function openEditFunctionModal(item: SidebarFunction) {
  editingFunctionId.value = item.id
  Object.assign(functionForm, {
    name: item.name,
    description: item.description,
    kind: item.kind,
    timeout: item.timeout ?? 30,
    language: item.language || 'javascript',
  })
  functionStep.value = 1
  implementationMode.value = item.implMode === 'package' ? 'package' : 'code'
  entryFunction.value = item.entryFunc ?? ''
  packageFile.value = null
  packageFilePath.value = item.packageFile ?? ''
  packageUploading.value = false
  functionModalVisible.value = true
}

function nextFunctionStep() {
  if (!functionForm.name.trim()) {
    Message.warning('请输入函数名称')
    return
  }
  functionStep.value = 2
}

function createFunction() {
  if (!entryFunction.value.trim()) {
    Message.warning('请输入入口函数/方法名')
    return
  }
  if (implementationMode.value === 'package' && packageUploading.value) {
    Message.warning('文件正在上传，请稍候')
    return
  }
  if (implementationMode.value === 'package' && !packageFilePath.value) {
    Message.warning('请选择上传包文件')
    return
  }
  const form = {
    ...functionForm,
    name: functionForm.name.trim(),
    implMode: implementationMode.value,
    entryFunc: entryFunction.value.trim(),
    packageFile: packageFilePath.value,
  }
  if (editingFunctionId.value) {
    emit('editFunction', { ...form, id: editingFunctionId.value })
  } else {
    emit('createFunction', form)
  }
  functionModalVisible.value = false
}

async function handlePackageSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] || null
  if (!file) return
  if (!/\.(zip|jar)$/i.test(file.name) || file.size > 50 * 1024 * 1024) {
    Message.warning('仅支持不超过 50MB 的 .zip 或 .jar 文件')
    input.value = ''
    return
  }
  packageFile.value = file
  packageFilePath.value = ''
  packageUploading.value = true
  const uploadForm = new FormData()
  uploadForm.append(
    'fileProfile',
    new Blob([JSON.stringify({ folder: 'pluginPackage' })], { type: 'application/json' }),
  )
  uploadForm.append('file', file)

  try {
    const response = await upload(uploadForm)
    const filePath = response?.data ?? response?.path ?? response?.id ?? response
    if (!filePath) throw new Error('上传接口未返回文件路径')
    packageFilePath.value = String(filePath)
    Message.success('文件上传成功')
  } catch {
    packageFile.value = null
    packageFilePath.value = ''
    input.value = ''
    Message.error('文件上传失败，请重新选择')
  } finally {
    packageUploading.value = false
  }
}

function openParameterModal() {
  Object.assign(parameterForm, { key: '', label: '', value: '', type: '文本', required: false })
  parameterModalVisible.value = true
}

function confirmCreateParameter(done: (closed: boolean) => void) {
  if (!parameterForm.key.trim()) {
    Message.warning('请输入参数ID')
    done(false)
    return
  }
  if (!parameterForm.label.trim()) {
    Message.warning('请输入参数名称')
    done(false)
    return
  }
  emit('createParameter', { ...parameterForm, key: parameterForm.key.trim() })
  done(true)
}

function openUploadModal() {
  uploadedFile.value = null
  uploadModalVisible.value = true
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] || null
  if (!file) return
  if (!/\.(js|py|json)$/i.test(file.name)) {
    Message.warning('仅支持 .js、.py、.json 格式')
    input.value = ''
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    Message.warning('文件大小不能超过 2MB')
    input.value = ''
    return
  }
  uploadedFile.value = file
}

function clearUploadedFile() {
  uploadedFile.value = null
}

function formatFileSize(size: number) {
  return size < 1024 ? `${size} B` : `${(size / 1024).toFixed(1)} KB`
}

function confirmUpload(done: (closed: boolean) => void) {
  if (!uploadedFile.value) {
    Message.warning('请选择函数文件')
    done(false)
    return
  }
  const name = uploadedFile.value.name.replace(/\.[^.]+$/, '')
  emit('uploadFunction', { name, description: '上传的插件函数', kind: 'frontend' })
  done(true)
}

function selectParameter(key: string) {
  selectedParameterKey.value = key
  Message.info(`已选择通用参数：${key}`)
}
</script>

<template>
  <aside class="plugin-sidebar">
    <section class="sidebar-section">
      <header class="section-title">
        <span>插件属性</span>
        <button type="button" class="icon-button" title="插件设置" @click="openPluginSettings">
          <i class="fas fa-cog" />
        </button>
      </header>
      <div class="plugin-card">
        <strong>{{ pluginName }}</strong>
        <small>{{ pluginId }}</small>
        <div>
          <span class="tag tag--gray">{{ pluginVersion }}</span>
          <span class="tag tag--blue">自定义</span>
        </div>
      </div>
    </section>

    <section class="sidebar-section">
      <header class="section-title">
        <span>函数列表</span>
        <div class="title-actions">
          <button type="button" class="icon-button" title="添加函数" @click="openFunctionModal">
            <i class="fas fa-plus" />
          </button>
        </div>
      </header>

      <a-empty v-if="functions.length === 0" class="function-empty" description="暂无函数" />

      <button v-for="item in functions" :key="item.id" type="button" class="sidebar-item"
        :class="{ 'sidebar-item--active': selectedFunctionId === item.id }" @click="selectedFunctionId = item.id">
        <span class="item-icon" :class="`item-icon--${item.kind}`">
          <i class="fas" :class="item.kind === 'frontend' ? 'fa-desktop' : 'fa-server'" />
        </span>
        <span class="item-copy">
          <strong>{{ item.name }}</strong>
          <small>{{ item.description }}</small>
        </span>
        <span class="tag" :class="item.kind === 'frontend' ? 'tag--green' : 'tag--purple'">
          {{ item.kind === 'frontend' ? '前端' : '后端' }}
        </span>
        <span class="function-edit" role="button" tabindex="0" title="编辑函数"
          @click.stop="openEditFunctionModal(item)" @keydown.enter.stop="openEditFunctionModal(item)">
          <i class="fas fa-pen" />
        </span>
        <span class="function-delete" role="button" tabindex="0" title="删除函数" @click.stop="emit('deleteFunction', item)"
          @keydown.enter.stop="emit('deleteFunction', item)">
          <i class="fas fa-trash" />
        </span>
      </button>

    </section>

    <div class="sidebar-footer">
      <button type="button" class="footer-add-button" @click="openFunctionModal">
        <i class="fas fa-plus" /> 添加函数
      </button>
    </div>

    <a-modal
      v-model:visible="pluginSettingsVisible"
      modal-class="plugin-designer-modal"
      title="插件设置"
      title-align="start"
      :width="520"
      :mask-closable="false"
      ok-text="保存"
      cancel-text="取消"
      :on-before-ok="savePluginSettings"
    >
      <a-form class="designer-modal-form" :model="pluginSettingsForm" layout="vertical">
        <a-form-item field="name" label="插件名称" required>
          <a-input v-model="pluginSettingsForm.name" placeholder="请输入插件名称" />
        </a-form-item>
        <a-form-item field="description" label="插件功能描述">
          <a-textarea
            v-model="pluginSettingsForm.description"
            placeholder="请输入插件功能描述"
            :auto-size="{ minRows: 3, maxRows: 5 }"
          />
        </a-form-item>
        <a-form-item field="version" label="版本号" required>
          <a-input v-model="pluginSettingsForm.version" placeholder="例如：v1.0.0" />
        </a-form-item>
        <a-form-item field="status" label="启用状态">
          <a-switch
            :model-value="pluginSettingsForm.status === 1"
            checked-text="启用"
            unchecked-text="禁用"
            @update:model-value="pluginSettingsForm.status = $event ? 1 : 0"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="functionModalVisible" modal-class="plugin-designer-modal add-function-modal"
      title-align="start" :width="640" :mask-closable="false" align-center>
      <template #title>
        <span class="add-function-title">
          <i class="fas" :class="editingFunctionId ? 'fa-pen-to-square' : 'fa-plus-circle'" />
          {{ editingFunctionId ? '编辑函数' : '添加函数' }}
        </span>
      </template>

      <div class="step-progress">
        <div class="step-item" :class="{ active: functionStep === 1, done: functionStep === 2 }">
          <span>{{ functionStep === 2 ? '✓' : '1' }}</span><strong>基本信息</strong>
        </div>
        <i :class="{ active: functionStep === 2 }" />
        <div class="step-item" :class="{ active: functionStep === 2 }">
          <span>2</span><strong>实现方式</strong>
        </div>
      </div>

      <a-form v-if="functionStep === 1" class="designer-modal-form" :model="functionForm" layout="vertical">
        <a-form-item field="name" label="函数名称" required>
          <a-input v-model="functionForm.name" placeholder="例如：查询学生信息" />
        </a-form-item>
        <a-form-item field="description" label="业务描述">
          <a-textarea v-model="functionForm.description" placeholder="描述该函数的业务用途和使用场景..."
            :auto-size="{ minRows: 3, maxRows: 5 }" />
        </a-form-item>
        <a-form-item field="kind" label="函数类型" required>
          <a-radio-group v-model="functionForm.kind" class="function-type-group">
            <a-radio value="frontend">
              <span class="function-type-card">
                <strong><i class="fas fa-desktop function-type-card__frontend" /> 前端函数</strong>
                <small>浏览器端执行，用于表单字段联动、弹窗、实时校验等交互场景</small>
              </span>
            </a-radio>
            <a-radio value="backend">
              <span class="function-type-card">
                <strong><i class="fas fa-server function-type-card__backend" /> 后端函数</strong>
                <small>服务器端执行，支持多种编程语言，用于API调用、数据处理、通知推送等</small>
              </span>
            </a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>

      <a-form v-else class="designer-modal-form" :model="functionForm" layout="vertical">
        <a-form-item label="实现方式" required>
          <a-radio-group v-model="implementationMode" class="function-type-group">
            <a-radio value="code">
              <span class="function-type-card">
                <strong><i class="fas fa-code function-type-card__frontend" /> 在线编写</strong>
                <small>在代码编辑器中直接编写函数代码，实时调试</small>
              </span>
            </a-radio>
            <a-radio value="package">
              <span class="function-type-card">
                <strong><i class="fas fa-upload implementation-upload" /> 上传包</strong>
                <small>上传已编译的语言包或源码包，平台自动构建</small>
              </span>
            </a-radio>
          </a-radio-group>
        </a-form-item>

        <div class="language-tip"><i class="fas fa-info-circle" />支持 <strong>JavaScript、Nodejs、Java</strong> 开发语言</div>

        <a-form-item field="language" label="开发语言">
          <a-select v-model="functionForm.language">
            <a-option value="javascript">JavaScript</a-option>
            <a-option value="nodejs">Nodejs</a-option>
            <a-option value="java">Java</a-option>
          </a-select>
        </a-form-item>

        <a-form-item label="入口函数/方法名" required>
          <a-input v-model="entryFunction" placeholder="例如：main" />
          <template #extra>
            <div>函数执行时默认调用的入口名称</div>
          </template>
        </a-form-item>
        <a-form-item v-if="implementationMode === 'package'" class="package-upload-form-item" label="上传包文件">
          <label class="package-upload-zone">
            <span><i class="fas fa-cloud-upload-alt" /></span>
            <strong>{{ packageUploading ? '文件上传中...' : packageFile?.name || (packageFilePath ? '已上传函数包' : '拖拽文件到此处上传') }}</strong>
            <small>{{ packageFile ? formatFileSize(packageFile.size) : '支持 .zip 或 .jar 格式，单个文件不超过 50MB' }}</small>
            <em><i class="fas" :class="packageUploading ? 'fa-spinner fa-spin' : 'fa-folder-open'" />
              {{ packageUploading ? '上传中' : packageFilePath ? '重新选择' : '选择文件' }}</em>
            <input type="file" accept=".zip,.jar" :disabled="packageUploading" @change="handlePackageSelect" />
          </label>
        </a-form-item>
        <a-form-item field="timeout" label="超时时长" required>
          <div class="timeout-control">
            <a-input-number v-model="functionForm.timeout" :min="1" :max="300" />
            <span>秒（1-300）</span>
          </div>
        </a-form-item>
      </a-form>

      <template #footer>
        <div class="add-function-footer">
          <button v-if="functionStep === 2" type="button" class="modal-action modal-action--ghost"
            @click="functionStep = 1">上一步</button>
          <button type="button" class="modal-action modal-action--ghost"
            @click="functionModalVisible = false">取消</button>
          <button v-if="functionStep === 1" type="button" class="modal-action modal-action--primary"
            @click="nextFunctionStep">下一步</button>
          <button v-else type="button" class="modal-action modal-action--primary" @click="createFunction">
            {{ editingFunctionId ? '保存修改' : '创建函数' }}
          </button>
        </div>
      </template>
    </a-modal>

    <a-modal v-model:visible="parameterModalVisible" modal-class="plugin-designer-modal" title="添加通用参数"
      title-align="start" :width="520" :mask-closable="false" ok-text="添加" cancel-text="取消"
      :on-before-ok="confirmCreateParameter">
      <a-form class="designer-modal-form" :model="parameterForm" layout="vertical">
        <a-form-item field="key" label="参数ID" required>
          <a-input v-model="parameterForm.key" placeholder="例如 apiBaseUrl" />
        </a-form-item>
        <a-form-item field="label" label="参数名称">
          <a-input v-model="parameterForm.label" placeholder="请输入参数名称" />
        </a-form-item>
        <a-form-item field="type" label="参数类型">
          <a-select v-model="parameterForm.type">
            <a-option>文本</a-option>
            <a-option>数字</a-option>
            <a-option>密码</a-option>
            <a-option>URL</a-option>
            <a-option>JSON</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="value" label="默认值">
          <a-input v-model="parameterForm.value" placeholder="请输入默认值" />
        </a-form-item>
        <a-form-item field="required">
          <a-checkbox v-model="parameterForm.required">必填</a-checkbox>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="uploadModalVisible" modal-class="plugin-designer-modal plugin-designer-upload-modal"
      title="上传函数" title-align="start" :width="520" :mask-closable="false" ok-text="上传并导入" cancel-text="取消"
      :ok-button-props="{ disabled: !uploadedFile }" :on-before-ok="confirmUpload">
      <label class="upload-zone">
        <span class="upload-icon"><i class="fas fa-cloud-upload-alt" /></span>
        <strong>拖拽文件到此处上传</strong>
        <small>支持 .js、.py、.json 格式，单个文件不超过 2MB</small>
        <span class="select-file"><i class="fas fa-folder-open" /> 选择文件</span>
        <input type="file" accept=".js,.py,.json" @change="handleFileChange" />
      </label>
      <div v-if="uploadedFile" class="upload-preview">
        <span class="upload-preview__icon"><i class="fas fa-file-code" /></span>
        <span class="upload-preview__copy">
          <strong>{{ uploadedFile.name }}</strong>
          <small>{{ formatFileSize(uploadedFile.size) }}</small>
        </span>
        <button type="button" aria-label="移除文件" @click="clearUploadedFile"><i class="fas fa-times" /></button>
      </div>
    </a-modal>
  </aside>
</template>

<style scoped lang="scss">
.plugin-sidebar {
  width: 260px;
  flex-shrink: 0;
  overflow-y: auto;
  border-right: 1px solid #e2e8f0;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
}

.sidebar-section {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
}

.sidebar-section:nth-of-type(2) {
  border-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.title-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.icon-button {
  display: inline-grid;
  min-width: 28px;
  height: 25px;
  place-items: center;
  padding: 3px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  color: #64748b;
  font-size: 11px;
  cursor: pointer;
}

.icon-button:hover {
  background: #f1f5f9;
  color: #334155;
}

.plugin-card {
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
}

.plugin-card strong,
.plugin-card small {
  display: block;
}

.plugin-card strong {
  margin-bottom: 4px;
  color: #1e293b;
  font-size: 13px;
  font-weight: 600;
}

.plugin-card small {
  overflow: hidden;
  margin-bottom: 8px;
  color: #94a3b8;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.plugin-card>div {
  display: flex;
  gap: 6px;
}

.sidebar-item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
  margin-bottom: 2px;
  padding: 8px 12px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #475569;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.function-empty {
  padding: 24px 8px;
}

.function-empty :deep(.arco-empty-image) {
  height: 48px;
}

.sidebar-item:hover {
  background: #e2e8f0;
}

.sidebar-item--active {
  background: #dbeafe;
  color: #2563eb;
}

.item-icon {
  display: grid;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 6px;
  font-size: 11px;
}

.item-icon--frontend {
  background: #dbeafe;
  color: #2563eb;
}

.item-icon--backend {
  background: #f3e8ff;
  color: #9333ea;
}

.item-icon--config {
  background: #f1f5f9;
  color: #64748b;
}

.item-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}

.item-copy strong {
  overflow: hidden;
  font-size: 13px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-copy small {
  overflow: hidden;
  color: #94a3b8;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.function-edit,
.function-delete {
  display: none;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 6px;
}

.function-edit {
  color: #2563eb;
}

.function-delete {
  color: #ef4444;
}

.sidebar-item:hover .function-edit,
.sidebar-item:hover .function-delete,
.function-edit:focus-visible,
.function-delete:focus-visible {
  display: grid;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 500;
}

.tag--gray {
  background: #f1f5f9;
  color: #64748b;
}

.tag--blue {
  background: #dbeafe;
  color: #2563eb;
}

.tag--green {
  background: #dcfce7;
  color: #16a34a;
}

.tag--purple {
  background: #f3e8ff;
  color: #9333ea;
}

.add-item-button {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 6px;
  padding: 8px;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  background: transparent;
  color: #64748b;
  font-size: 12px;
  cursor: pointer;
}

.add-item-button:hover {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #3b82f6;
}

.sidebar-footer {
  margin-top: auto;
  padding: 12px 16px;
  text-align: center;
}

.footer-add-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #3b82f6;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.footer-add-button:hover {
  background: #eff6ff;
}

.function-type-group {
  display: grid;
  width: 100%;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.add-function-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.add-function-title i {
  color: #3b82f6;
}

.step-progress {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 0;
  margin: 0 0 24px;
  padding: 0 20px;
}

.step-progress>i {
  width: 80px;
  height: 2px;
  flex-shrink: 0;
  margin: 15px 8px 0;
  background: #e2e8f0;
}

.step-progress>i.active {
  background: #22c55e;
}

.step-item {
  display: flex;
  align-items: center;
  flex-direction: column;
  position: relative;
  gap: 6px;
  color: #64748b;
}

.step-item span {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border-radius: 50%;
  background: #e2e8f0;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
}

.step-item strong {
  font-size: 12px;
  font-weight: 500;
}

.step-item.active,
.step-item.done {
  color: #2563eb;
}

.step-item.active span {
  background: #3b82f6;
  color: #fff;
}

.step-item.done,
.step-item.done strong {
  color: #22c55e;
}

.step-item.done span {
  background: #22c55e;
  color: #fff;
}

.language-tip {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding: 12px 16px;
  border: 1px solid #dbeafe;
  border-radius: 10px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 12px;
}

.implementation-upload {
  color: #f97316;
}

.field-hint {
  display: block;
  margin-top: 6px;
  color: #94a3b8;
  font-size: 11px;
}

.timeout-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.timeout-control :deep(.arco-input-number) {
  width: 100px;
}

.timeout-control span {
  color: #64748b;
  font-size: 12px;
}

.package-upload-zone {
  display: flex;
  box-sizing: border-box;
  width: 100% !important;
  max-width: 100%;
  height: 210px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 24px 18px;
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  cursor: pointer;
}

.package-upload-form-item {
  width: 100%;
}

.package-upload-form-item :deep(.arco-form-item-wrapper-col),
.package-upload-form-item :deep(.arco-form-item-content),
.package-upload-form-item :deep(.arco-form-item-content-flex) {
  width: 100%;
}

.package-upload-zone>span {
  display: grid;
  width: 48px;
  height: 48px;
  margin-bottom: 10px;
  place-items: center;
  border-radius: 10px;
  background: #dbeafe;
  color: #2563eb;
  font-size: 20px;
}

.package-upload-zone strong {
  margin-bottom: 6px;
  color: #1e293b;
  font-size: 13px;
}

.package-upload-zone small {
  margin-bottom: 12px;
  color: #64748b;
  font-size: 11px;
}

.package-upload-zone em {
  padding: 8px 16px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: #fff;
  font-size: 12px;
  font-style: normal;
}

.package-upload-zone input {
  display: none;
}

.add-function-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modal-action {
  padding: 8px 16px;
  border: 0;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.modal-action--ghost {
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;
}

.modal-action--primary {
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: #fff;
}

.function-type-group :deep(.arco-radio) {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  margin: 0;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
}

.function-type-group :deep(.arco-radio-checked) {
  border-color: rgb(var(--primary-6));
  background: #eff6ff;
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.08);
}

.function-type-group :deep(.arco-radio-label) {
  min-width: 0;
  padding-left: 8px;
}

.function-type-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.function-type-card strong {
  color: #1e293b;
  font-size: 13px;
  font-weight: 600;
}

.function-type-card small {
  color: #64748b;
  font-size: 11px;
  line-height: 1.5;
}

.function-type-card__frontend {
  color: #3b82f6;
}

.function-type-card__backend {
  color: #9333ea;
}

.upload-zone {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 32px;
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.18s ease, background 0.18s ease;
}

.upload-zone:hover {
  border-color: #93c5fd;
  background: #eff6ff;
}

.upload-icon {
  display: grid;
  width: 56px;
  height: 56px;
  margin-bottom: 12px;
  place-items: center;
  border-radius: 12px;
  background: #dbeafe;
  color: #2563eb;
  font-size: 24px;
}

.upload-zone strong {
  margin-bottom: 8px;
  color: #1e293b;
  font-size: 14px;
}

.upload-zone small {
  margin-bottom: 16px;
  color: #64748b;
  font-size: 12px;
}

.select-file {
  padding: 8px 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: #fff;
  font-size: 13px;
}

.upload-zone input {
  display: none;
}

.upload-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
}

.upload-preview__icon {
  display: grid;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 8px;
  background: #dbeafe;
  color: #2563eb;
  font-size: 16px;
}

.upload-preview__copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 3px;
}

.upload-preview__copy strong {
  overflow: hidden;
  color: #1e293b;
  font-size: 13px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.upload-preview__copy small {
  color: #64748b;
  font-size: 12px;
}

.upload-preview>button {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  color: #64748b;
  cursor: pointer;
}
</style>

<style lang="scss">
.plugin-designer-modal {
  overflow: hidden;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.16);



  .arco-modal-header {
    min-height: auto;
    padding: 22px 24px 10px;
    border-bottom: 0;
  }

  .arco-modal-title {
    color: #1e293b;
    font-size: 16px;
    font-weight: 600;
  }

  .arco-modal-close-btn {
    top: 18px;
    right: 20px;
    width: 30px;
    height: 30px;
    border-radius: 8px;
    background: #f8fafc;
    color: #64748b;

    &:hover {
      background: #f1f5f9;
      color: #334155;
    }
  }

  .arco-modal-body {
    padding: 10px 24px 0;
  }

  .designer-modal-form .arco-form-item {
    margin-bottom: 16px;
  }

  .designer-modal-form .arco-form-item-label-col>label {
    color: #475569;
    font-size: 12px;
    font-weight: 500;
  }

  .designer-modal-form .arco-input-wrapper,
  .designer-modal-form .arco-input-number,
  .designer-modal-form .arco-select-view {
    min-height: 38px;
    border-color: #e2e8f0;
    border-radius: 8px;
    background: #f8fafc;
  }

  .designer-modal-form .arco-input-wrapper:hover,
  .designer-modal-form .arco-input-number:hover,
  .designer-modal-form .arco-select-view:hover {
    border-color: #bfdbfe;
    background: #fff;
  }

}

.add-function-modal .arco-modal-body {
  flex: none;
  overflow: visible;
  padding: 0 24px;
}

.add-function-modal.arco-modal {
  display: flex;
  max-height: calc(100vh - 80px);
  flex-direction: column;
  top: auto !important;
  margin: 0;
  vertical-align: initial;
}

.add-function-modal .arco-modal-header {
  flex-shrink: 0;
  margin-bottom: 20px;
  padding: 24px 24px 0;
}

.add-function-modal .arco-modal-footer {
  flex-shrink: 0;
  padding: 20px 24px;
  border-top: 0 !important;
  background: #fff;
}

.arco-modal-wrapper:has(.add-function-modal) {
  display: flex !important;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  overflow: hidden !important;
  padding: 40px 20px;
  text-align: left;
  white-space: normal;
}

.arco-modal-wrapper:has(.add-function-modal)::after {
  display: none !important;
}

@media (max-height: 720px) {
  .add-function-modal .arco-modal-body {
    min-height: 0;
    flex: 1;
    overflow-y: auto;
  }
}

.plugin-designer-upload-modal .arco-modal-body {
  padding-top: 14px;
}
</style>
