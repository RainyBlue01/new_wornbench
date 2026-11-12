<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, shallowRef, watch } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { Parser } from 'expr-eval'
import { useRoute, useRouter } from 'vue-router'
import {
  addPluginFunction,
  deletePluginFunction,
  executePluginFunction,
  getPluginDetail,
  getPluginFunctionDetail,
  getPluginFunctionList,
  publishPlugin as publishPluginApi,
  updatePlugin as updatePluginApi,
  updatePluginFunction,
  updatePluginFunctionCode,
  type AddPluginFunctionPayload,
} from '@/api/plugin'
import type { PluginDetailResponse, PluginFunctionResponse } from '@/views/pluginCenter/types'
import PluginCodeEditor from './PluginCodeEditor.vue'
import PluginDesignerSidebar from './PluginDesignerSidebar.vue'
import PluginParameterDesign from './PluginParameterDesign.vue'
import PluginTestDebug from './PluginTestDebug.vue'

type DesignerTab = 'code' | 'params' | 'test'
type FunctionKind = 'frontend' | 'backend'

interface PluginFunction {
  id: string
  name: string
  description: string
  kind: FunctionKind
  language?: string
  implMode?: 'code' | 'package'
  entryFunc?: string
  packageFile?: string
  timeout?: number
}

interface FunctionParameter {
  name: string
  label?: string
  type: string
  required?: boolean
  description: string
}

interface FunctionForm {
  name: string
  description: string
  kind: FunctionKind
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
}

interface PluginSettingsForm {
  name: string
  description: string
  version: string
  status: number
}

const router = useRouter()
const route = useRoute()
const activeTab = shallowRef<DesignerTab>('code')
const selectedFunctionId = shallowRef('')
const running = shallowRef(false)
const publishModalVisible = shallowRef(false)
const publishing = shallowRef(false)
const testResultVisible = shallowRef(false)
const testResultText = shallowRef('')
const testResultStatus = shallowRef<'success' | 'error' | ''>('')
const testDuration = shallowRef(0)
const pluginDetail = shallowRef<PluginDetailResponse | null>(null)
const hydratingFunction = shallowRef(false)
let codeSaveTimer: number | undefined

const pluginName = computed(() => pluginDetail.value?.pluginName || String(route.query.name || ''))
const pluginId = computed(() => String(route.query.id || ''))

const functions = reactive<PluginFunction[]>([])

const commonParams = reactive<ParameterForm[]>([])

const inputParams = reactive<FunctionParameter[]>([])

const outputParams = reactive<FunctionParameter[]>([])

const codeContent = shallowRef('')
const publishForm = reactive({
  pluginName: '',
  description: '',
  version: '',
})

const currentFunction = computed(() => functions.find((item) => item.id === selectedFunctionId.value) || functions[0])
const isPublished = computed(() => pluginDetail.value?.publishStatus === 1)

function parseParameters(value?: string): FunctionParameter[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) return []
    return parsed.map((item: Record<string, unknown>) => ({
      name: String(item.name ?? item.paramName ?? item.key ?? ''),
      label: item.label ? String(item.label) : undefined,
      type: String(item.type ?? item.dataType ?? '文本'),
      required: Boolean(item.required),
      description: String(item.description ?? ''),
    }))
  } catch {
    return []
  }
}

function mapFunction(item: PluginFunctionResponse): PluginFunction {
  return {
    id: String(item.id ?? 0),
    name: item.functionName ?? item.functionId ?? '',
    description: item.description ?? '',
    kind: item.functionType === 'backend' ? 'backend' : 'frontend',
    language: item.language?.trim() || 'javascript',
    implMode: item.implMode === 'package' ? 'package' : 'code',
    entryFunc: item.entryFunc ?? '',
    packageFile: item.packageFile ?? '',
    timeout: item.timeout ?? 30,
  }
}

async function loadFunctionDetail(functionId: string) {
  if (!functionId) {
    inputParams.splice(0)
    outputParams.splice(0)
    codeContent.value = ''
    return
  }
  hydratingFunction.value = true
  try {
    const detail = await getPluginFunctionDetail(functionId)
    inputParams.splice(0, inputParams.length, ...parseParameters(detail.inputParams))
    outputParams.splice(0, outputParams.length, ...parseParameters(detail.outputParams))
    codeContent.value = detail.code ?? ''
  } finally {
    window.setTimeout(() => {
      hydratingFunction.value = false
    }, 0)
  }
}

async function loadDesigner() {
  pluginDetail.value = null
  functions.splice(0)
  selectedFunctionId.value = ''
  if (!pluginId.value) return
  const [detail, list] = await Promise.all([getPluginDetail(pluginId.value), getPluginFunctionList(pluginId.value)])
  pluginDetail.value = detail
  functions.splice(0, functions.length, ...list.map(mapFunction))
  selectedFunctionId.value = functions[0]?.id ?? ''
}

async function saveFunctionParameters() {
  const id = currentFunction.value?.id
  if (!id) return
  await updatePluginFunction({
    id,
    inputParams: JSON.stringify(inputParams),
    outputParams: JSON.stringify(outputParams),
  })
}

watch(pluginId, loadDesigner, { immediate: true })
watch(selectedFunctionId, (functionId) => {
  testResultVisible.value = false
  testResultText.value = ''
  testResultStatus.value = ''
  testDuration.value = 0
  loadFunctionDetail(functionId)
})
watch(codeContent, (code) => {
  if (hydratingFunction.value) return
  const id = currentFunction.value?.id
  if (!id) return
  window.clearTimeout(codeSaveTimer)
  codeSaveTimer = window.setTimeout(() => {
    updatePluginFunctionCode({ id, code, language: currentFunction.value?.language || 'javascript' })
  }, 700)
})

onBeforeUnmount(() => window.clearTimeout(codeSaveTimer))

function addFunctionLegacy(form?: FunctionForm) {
  const index = functions.length + 1
  const item: PluginFunction = {
    id: form?.name || `function${index}`,
    name: form?.name || `function${index}`,
    description: form?.description || '新建插件函数',
    kind: form?.kind || 'frontend',
  }
  functions.push(item)
  selectedFunctionId.value = item.id
  Message.success('函数创建成功')
}

function addParam(form?: ParameterForm) {
  const index = commonParams.length + 1
  commonParams.push({
    key: form?.key || `param${index}`,
    label: form?.label || `通用参数 ${index}`,
    value: form?.value || '',
  })
  Message.success('通用参数添加成功')
}

function uploadFunctionLegacy(form: FunctionForm) {
  const item: PluginFunction = {
    id: form.name,
    name: form.name,
    description: form.description,
    kind: form.kind,
  }
  functions.push(item)
  selectedFunctionId.value = item.id
  Message.success('函数上传成功并已导入')
}

async function addFunction(form: FunctionForm) {
  const payload: AddPluginFunctionPayload = {
    pluginId: pluginId.value,
    functionName: form.name,
    functionType: form.kind,
    description: form.description,
    implMode: form.implMode,
    language: form.language,
    entryFunc: form.entryFunc,
    packageFile: form.packageFile,
    timeout: form.timeout,
  }
  await addPluginFunction(payload)
  await loadDesigner()
  const created = functions.find((item) => item.name === form.name)
  if (created) selectedFunctionId.value = created.id
  Message.success('函数创建成功')
}

async function editFunction(form: FunctionForm & { id: string }) {
  const functionId = form.id
  await updatePluginFunction({
    id: functionId,
    functionName: form.name,
    description: form.description,
    functionType: form.kind,
    implMode: form.implMode,
    language: form.language,
    entryFunc: form.entryFunc,
    packageFile: form.packageFile,
    timeout: form.timeout,
  })
  await loadDesigner()
  if (functions.some(item => item.id === functionId)) {
    selectedFunctionId.value = functionId
  }
  Message.success('函数修改成功')
}

async function uploadFunction(form: FunctionForm) {
  await addFunction({ ...form, implMode: 'package' })
}

async function savePluginSettings(form: PluginSettingsForm) {
  await updatePluginApi({
    pluginId: pluginId.value,
    pluginName: form.name,
    description: form.description,
    version: form.version,
    status: form.status,
  })
  pluginDetail.value = await getPluginDetail(pluginId.value)
  Message.success('插件设置已保存')
}

function removeFunction(functionItem: PluginFunction) {
  Modal.confirm({
    title: '删除函数',
    content: `确定删除函数“${functionItem.name}”吗？删除后无法恢复。`,
    okButtonProps: { status: 'danger' },
    onOk: async () => {
      await deletePluginFunction(functionItem.id)
      await loadDesigner()
      Message.success('函数已删除')
    },
  })
}

function normalizeTestValues(values: Record<string, unknown>) {
  return Object.fromEntries(inputParams.map((parameter) => {
    const value = values[parameter.name]
    if (['json', '对象', 'object', '数组', 'array'].includes(parameter.type.toLowerCase()) && typeof value === 'string') {
      return [parameter.name, value.trim() ? JSON.parse(value) : undefined]
    }
    return [parameter.name, value]
  }))
}

async function executeFrontendFunction(values: Record<string, unknown>) {
  if (!codeContent.value.trim()) throw new Error('当前函数暂无可执行代码')

  const missingParameter = inputParams.find(item => item.required && (values[item.name] === undefined || values[item.name] === ''))
  if (missingParameter) throw new Error(`请填写必填参数：${missingParameter.label || missingParameter.name}`)

  const triggerConf = normalizeTestValues(values)
  const output: Record<string, unknown> = {}
  const resolveOutputName = (field: string) => outputParams.find(item => item.name === field || item.label === field)?.name || field
  const context = {
    triggerConf,
    setFieldVisible: () => undefined,
    setFieldValue: (field: string, value: unknown) => {
      output[resolveOutputName(field)] = value
    },
    setFieldError: (field: string, message: string) => {
      throw new Error(`${field}：${message}`)
    },
    utils: {
      callBackend: async () => {
        throw new Error('前端调试暂不支持调用后端函数')
      },
    },
  }

  const source = codeContent.value.replace(
    /^\s*import\s+\{\s*Parser\s*\}\s+from\s+['"]expr-eval['"];?\s*$/gm,
    '',
  )
  const hasDefaultExport = /export\s+default\s+/.test(source)
  const entryFunc = currentFunction.value?.entryFunc?.trim()
  const factoryBody = hasDefaultExport
    ? source.replace(/export\s+default\s+/, 'return ')
    : `${source}\nreturn typeof ${entryFunc || 'main'} === 'function' ? ${entryFunc || 'main'} : undefined;`
  const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor as new (
    ...args: string[]
  ) => (...args: unknown[]) => Promise<unknown>
  const executable = await new AsyncFunction('Parser', `"use strict";\n${factoryBody}`)(Parser)
  if (typeof executable !== 'function') throw new Error('未找到可执行的入口函数')

  const timeout = Math.max(1, currentFunction.value?.timeout || 30) * 1000
  const returned = await Promise.race([
    executable(context),
    new Promise((_, reject) => window.setTimeout(() => reject(new Error('函数执行超时')), timeout)),
  ])
  return returned === undefined ? output : returned
}

async function executeBackendFunction(values: Record<string, unknown>) {
  const functionId = currentFunction.value?.id
  if (!functionId) throw new Error('未获取到函数ID')

  const missingParameter = inputParams.find(item => item.required && (values[item.name] === undefined || values[item.name] === ''))
  if (missingParameter) throw new Error(`请填写必填参数：${missingParameter.label || missingParameter.name}`)

  const result = await executePluginFunction({
    functionId,
    inputParams: JSON.stringify(normalizeTestValues(values)),
  })
  if (result?.success === false) throw new Error(result.message || '后端函数执行失败')
  return result
}

async function runPlugin(values: Record<string, unknown>) {
  activeTab.value = 'test'
  running.value = true
  const startedAt = performance.now()
  let executionTime: number | undefined
  try {
    const result = currentFunction.value?.kind === 'backend'
      ? await executeBackendFunction(values)
      : await executeFrontendFunction(values)
    if (currentFunction.value?.kind === 'backend') {
      executionTime = result && typeof result === 'object' && 'executionTime' in result
        ? Number(result.executionTime)
        : undefined
      testResultText.value = JSON.stringify(
        result && typeof result === 'object' && 'data' in result ? result.data : result,
        null,
        2,
      )
    } else {
      testResultText.value = JSON.stringify(result ?? null, null, 2)
    }
    testResultStatus.value = 'success'
    Message.success('测试运行成功')
  } catch (error) {
    testResultText.value = JSON.stringify({ message: error instanceof Error ? error.message : String(error) }, null, 2)
    testResultStatus.value = 'error'
  } finally {
    testDuration.value = Number.isFinite(executionTime)
      ? Number(executionTime)
      : Math.round(performance.now() - startedAt)
    running.value = false
    testResultVisible.value = true
  }
}

async function addFunctionParameter(kind: 'input' | 'output', parameter: FunctionParameter) {
  const target = kind === 'input' ? inputParams : outputParams
  target.push({ ...parameter })
  await saveFunctionParameters()
  Message.success('参数添加成功')
}

async function editFunctionParameter(kind: 'input' | 'output', originalName: string, parameter: FunctionParameter) {
  const target = kind === 'input' ? inputParams : outputParams
  const index = target.findIndex((item) => item.name === originalName)
  if (index >= 0) target.splice(index, 1, { ...parameter })
  await saveFunctionParameters()
  Message.success('参数修改成功')
}

async function removeFunctionParameter(kind: 'input' | 'output', parameter: FunctionParameter) {
  const target = kind === 'input' ? inputParams : outputParams
  const index = target.findIndex((item) => item.name === parameter.name)
  if (index >= 0) target.splice(index, 1)
  await saveFunctionParameters()
  Message.success('参数已删除')
}

async function copyTestResult() {
  try {
    await navigator.clipboard.writeText(testResultText.value)
    Message.success('结果已复制到剪贴板')
  } catch {
    Message.warning('复制失败，请手动复制')
  }
}

function clearTestResult() {
  testResultVisible.value = false
  testResultText.value = ''
  testResultStatus.value = ''
  testDuration.value = 0
  Message.success('运行结果已清空')
}

function openPublishModal() {
  const detail = pluginDetail.value
  Object.assign(publishForm, {
    pluginName: detail?.pluginName || pluginName.value,
    description: detail?.description || '',
    version: detail?.version || '1.0.0',
  })
  publishModalVisible.value = true
}

async function publishPlugin(done: (closed: boolean) => void) {
  if (!publishForm.pluginName.trim()) {
    Message.warning('请输入插件名称')
    done(false)
    return
  }
  if (!publishForm.version.trim()) {
    Message.warning('请输入版本号')
    done(false)
    return
  }
  publishing.value = true
  try {
    await publishPluginApi({
      pluginId: pluginId.value,
      pluginName: publishForm.pluginName.trim(),
      description: publishForm.description.trim(),
      version: publishForm.version.trim(),
    })
    pluginDetail.value = await getPluginDetail(pluginId.value)
    Message.success('插件发布成功')
    done(true)
  } catch {
    done(false)
  } finally {
    publishing.value = false
  }
}
</script>

<template>
  <div class="designer-page">
    <header class="designer-header">
      <div class="header-title">
        <button type="button" class="back-button" @click="router.push({ name: 'pluginCenter' })">
          <i class="fas fa-arrow-left" aria-hidden="true" />
          返回插件中心
        </button>
        <span class="title-divider" />
        <i class="fas fa-puzzle-piece title-icon" aria-hidden="true" />
        <strong>插件设计器：{{ pluginName }}</strong>
      </div>
      <div class="header-actions">
        <button type="button" class="header-button header-button--primary"
          :class="{ 'header-button--published': isPublished }" @click="openPublishModal">
          <i class="fas" :class="isPublished ? 'fa-circle-check' : 'fa-rocket'" aria-hidden="true" />
          {{ isPublished ? '已发布' : '发布' }}
        </button>
      </div>
    </header>

    <div class="designer-body">
      <PluginDesignerSidebar v-model:selected-function-id="selectedFunctionId" :plugin-name="pluginName"
        :plugin-id="pluginId" :plugin-description="pluginDetail?.description || ''"
        :plugin-version="pluginDetail?.version || 'v1.0.0'" :plugin-status="pluginDetail?.status ?? 0"
        :functions="functions" @update-plugin="savePluginSettings" @create-function="addFunction"
        @edit-function="editFunction" @delete-function="removeFunction" @upload-function="uploadFunction"
        @create-parameter="addParam" />

      <main class="designer-workspace">
        <nav class="workspace-tabs">
          <button type="button" :class="{ active: activeTab === 'code' }" @click="activeTab = 'code'">
            <i class="fas fa-code" /> 代码编辑
          </button>
          <button type="button" :class="{ active: activeTab === 'params' }" @click="activeTab = 'params'">
            <i class="fas fa-sliders" /> 参数设计
          </button>
          <button type="button" :class="{ active: activeTab === 'test' }" @click="activeTab = 'test'">
            <i class="fas fa-vial" /> 测试调试
          </button>
        </nav>

        <a-empty v-if="!currentFunction" class="workspace-empty" description="暂无函数，请先添加函数" />

        <PluginCodeEditor v-else-if="activeTab === 'code'" v-model="codeContent"
          :filename="`${currentFunction?.name || 'index'}.js`"
          :function-kind="currentFunction?.kind === 'backend' ? '后端函数' : '前端函数'"
          :language="currentFunction?.language || 'javascript'" />

        <PluginParameterDesign v-else-if="activeTab === 'params'" :current-function="currentFunction"
          :input-params="inputParams" :output-params="outputParams" @add="addFunctionParameter"
          @edit="editFunctionParameter" @remove="removeFunctionParameter" />

        <PluginTestDebug v-else :function-kind="currentFunction.kind" :reset-key="currentFunction.id"
          :input-params="inputParams" :running="running" :result-visible="testResultVisible"
          :result-text="testResultText" :result-status="testResultStatus" :duration="testDuration" @run="runPlugin"
          @copy="copyTestResult" @clear="clearTestResult" />
      </main>
    </div>

    <a-modal v-model:visible="publishModalVisible" modal-class="plugin-publish-modal" :width="560"
      :mask-closable="false" ok-text="确认发布" cancel-text="取消" :ok-button-props="{ loading: publishing }"
      :cancel-button-props="{ disabled: publishing }" :on-before-ok="publishPlugin" title-align="start" align-center>
      <template #title>
        <span class="publish-modal-title"><i class="fas fa-rocket" />发布插件</span>
      </template>
      <a-form class="publish-form" :model="publishForm" layout="vertical">
        <a-form-item field="pluginName" label="插件名称" required>
          <a-input v-model="publishForm.pluginName" placeholder="请输入插件名称" />
        </a-form-item>
        <a-form-item field="description" label="插件描述">
          <a-textarea v-model="publishForm.description" placeholder="描述插件的用途和功能..."
            :auto-size="{ minRows: 2, maxRows: 4 }" />
        </a-form-item>
        <a-form-item field="version" label="版本号" required>
          <a-input v-model="publishForm.version" class="publish-version-input" placeholder="例如：1.0.0" />
        </a-form-item>
        <a-form-item label="包含函数" class="publish-functions-form-item">
          <div class="publish-functions">
            <div class="publish-functions__hint">
              <i class="fas fa-info-circle" />以下函数将随插件一起发布
            </div>
            <div v-if="functions.length" class="publish-functions__list">
              <div v-for="item in functions" :key="item.id" class="publish-function-item">
                <span class="publish-function-icon" :class="`publish-function-icon--${item.kind}`">
                  <i class="fas" :class="item.kind === 'backend' ? 'fa-server' : 'fa-desktop'" />
                </span>
                <span class="publish-function-copy">
                  <strong>{{ item.name }}</strong>
                  <small v-if="item.description">{{ item.description }}</small>
                </span>
                <em :class="`publish-function-kind--${item.kind}`">
                  {{ item.kind === 'backend' ? '后端' : '前端' }}
                </em>
              </div>
            </div>
            <a-empty v-else description="暂无函数" />
          </div>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped lang="scss">
.designer-page {
  --designer-border: #dce4ee;
  --designer-blue: #3478f6;
  min-width: 960px;
  min-height: 100vh;
  color: #172033;
  background: #eef3f8;
}

.designer-header {
  position: relative;
  z-index: 50;
  display: flex;
  height: 52px;
  border-bottom: 1px solid var(--designer-border);
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: #fff;
}

.header-title,
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-title strong {
  color: #1e293b;
  font-size: 15px;
  font-weight: 600;
}

.back-button,
.header-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding: 5px 10px;
  border-radius: 8px;
  background: #f8fafc;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  border: 1px solid #f1f5f9;
}

.back-button:hover,
.header-button:hover {
  background: #f8fafc;
  color: #334155;
}

.title-divider {
  display: none;
}

.title-icon {
  color: var(--designer-blue);
}

.header-button--primary {
  border-color: rgb(var(--primary-6));
  background: rgb(var(--primary-6));
  color: #fff;
}

.header-button--primary:hover {
  border-color: rgb(var(--primary-5));
  background: rgb(var(--primary-5));
  color: #fff;
}

.header-button--published {
  border-color: #22c55e;
  background: #22c55e;
}

.header-button--published:hover {
  border-color: #16a34a;
  background: #16a34a;
}

.designer-body {
  display: grid;
  height: calc(100vh - 52px);
  overflow: hidden;
  grid-template-columns: 260px minmax(0, 1fr);
}

.designer-workspace {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.workspace-empty {
  display: flex;
  min-height: 0;
  flex: 1;
  align-items: center;
  justify-content: center;
  background: #fff;
}

.workspace-tabs {
  display: flex;
  height: 52px;
  align-items: stretch;
  gap: 0;
  padding: 0 16px;
  border-bottom: 1px solid var(--designer-border);
  background: #fff;
}

.workspace-tabs button {
  height: 52px;
  padding: 0 16px;
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: #667991;
  font-size: 13px;
  cursor: pointer;
}

.workspace-tabs button.active {
  border-bottom-color: var(--designer-blue);
  color: var(--designer-blue);
  font-weight: 500;
}

.publish-modal-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.publish-modal-title i {
  color: #3b82f6;
}

.publish-form :deep(.arco-form-item) {
  margin-bottom: 16px;
}

.publish-form {
  min-height: 0;
  flex: 1;
  overflow: hidden;
  padding-right: 4px;
}

.publish-form :deep(.arco-form-item-label-col > label) {
  color: #475569;
  font-size: 12px;
  font-weight: 500;
}

.publish-form :deep(.arco-input-wrapper),
.publish-form :deep(.arco-textarea-wrapper) {
  border-color: #dbe4ef;
  border-radius: 8px;
  background: #f8fafc;
}

.publish-version-input {
  width: 120px;
}

.publish-functions-form-item {
  margin-bottom: 0 !important;
}

.publish-functions-form-item :deep(.arco-form-item-content) {
  width: 100%;
}

.publish-functions {
  width: 100%;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
}

.publish-functions__hint {
  padding: 10px 14px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;
  font-size: 12px;
}

.publish-functions__hint i {
  margin-right: 4px;
}

.publish-functions__list {
  max-height: 190px;
  overflow-y: auto;
  padding: 8px 0;
}

.publish-function-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
}

.publish-function-icon {
  display: grid;
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  place-items: center;
  border-radius: 6px;
  font-size: 10px;
}

.publish-function-icon--frontend {
  background: #dbeafe;
  color: #2563eb;
}

.publish-function-icon--backend {
  background: #f3e8ff;
  color: #9333ea;
}

.publish-function-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}

.publish-function-copy strong {
  color: #1e293b;
  font-size: 13px;
  font-weight: 500;
}

.publish-function-copy small {
  overflow: hidden;
  color: #64748b;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.publish-function-item em {
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-style: normal;
}

.publish-function-kind--frontend {
  background: #dcfce7;
  color: #16a34a;
}

.publish-function-kind--backend {
  background: #f3e8ff;
  color: #9333ea;
}

:global(.plugin-publish-modal) {
  display: inline-flex;
  max-height: calc(100vh - 120px);
  flex-direction: column;
  overflow: hidden;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgb(15 23 42 / 18%);
}

:global(.arco-modal-wrapper:has(.plugin-publish-modal)) {
  overflow: hidden;
}

:global(.plugin-publish-modal .arco-modal-header) {
  min-height: auto;
  padding: 22px 24px 10px;
  border-bottom: 0;
}

:global(.plugin-publish-modal .arco-modal-body) {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
  padding: 10px 24px 20px;
}

:global(.plugin-publish-modal .arco-modal-footer) {
  flex-shrink: 0;
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  background: #fff;
}
</style>
