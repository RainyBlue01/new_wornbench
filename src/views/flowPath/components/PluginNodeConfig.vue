<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import {
  deletePluginNodeConfig,
  getEnabledPluginList,
  getPluginExtensionList,
  getPluginNodeConfig,
} from '@/api/plugin'
import type { PluginDetailResponse, PluginFunctionResponse, PluginParameterItem } from '@/views/pluginCenter/types'
import { flattenPluginFormFields, getCompatiblePluginFields } from '@/utils/pluginParameterMapping'

interface MappingDraft {
  pluginId: string
  pluginName: string
  pluginIcon: string
  extensionCode: string
  extensionName: string
  extensionDescription: string
  inputParams: PluginParameterItem[]
  outputParams: PluginParameterItem[]
  inputMappings: Record<string, string>
  outputMappings: Record<string, string>
  inputMappingEnabled: boolean
  outputMappingEnabled: boolean
  executionMode: 'sync' | 'async'
  failureAction: 'continue' | 'block' | 'fail'
}

const props = defineProps<{
  activeNode: Record<string, any>
  formList: any[]
}>()
const route = useRoute()
const appId = computed(() => String(route.query.id || ''))

const visible = ref(false)
const step = ref(1)
const loadingPlugins = ref(false)
const loadingFunctions = ref(false)
const keyword = ref('')
const plugins = ref<PluginDetailResponse[]>([])
const functions = ref<PluginFunctionResponse[]>([])
const draft = reactive<MappingDraft>({
  pluginId: '',
  pluginName: '',
  pluginIcon: '',
  extensionCode: '',
  extensionName: '',
  extensionDescription: '',
  inputParams: [],
  outputParams: [],
  inputMappings: {},
  outputMappings: {},
  inputMappingEnabled: true,
  outputMappingEnabled: true,
  executionMode: 'sync',
  failureAction: 'block',
})

const dowUrl = (window as any).api?.dowUrl || ''
const iconUrl = (icon?: string) => icon && dowUrl
  ? `${dowUrl}${icon}&token=${localStorage.getItem('wornbench_token')}`
  : ''

const formFields = computed(() => flattenPluginFormFields(Array.isArray(props.formList) ? props.formList : []))
const compatibleFields = (parameter: PluginParameterItem) => getCompatiblePluginFields(parameter, formFields.value)
const parameterKey = (item: PluginParameterItem, index: number) => item.key || item.name || `param_${index}`

// Keep Select popups inside this modal. The flow designer has document/canvas
// click handlers; a popup teleported to body is otherwise treated as an
// outside click and is closed immediately after it opens.
const modalSelectTriggerProps = {
  autoFitPosition: true,
  popupStyle: { zIndex: 20 },
}

function parseParams(value?: string): PluginParameterItem[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed)
      ? parsed.map((item, index) => {
        const key = item.key || item.name || item.paramName || item.fieldName || `param_${index}`
        return {
          ...item,
          key,
          name: key,
          type: item.type || item.dataType || 'string',
        }
      })
      : []
  } catch {
    return []
  }
}

const filteredPlugins = computed(() => {
  const value = keyword.value.trim().toLowerCase()
  return value
    ? plugins.value.filter(item => `${item.pluginName || ''}${item.description || ''}`.toLowerCase().includes(value))
    : plugins.value
})

async function loadPlugins() {
  loadingPlugins.value = true
  try {
    plugins.value = await getEnabledPluginList() || []
  } finally {
    loadingPlugins.value = false
  }
}

async function open() {
  Object.assign(draft, {
    pluginId: props.activeNode.pluginId || '',
    pluginName: props.activeNode.pluginName || '',
    pluginIcon: props.activeNode.pluginIcon || '',
    extensionCode: props.activeNode.extensionCode || props.activeNode.functionId || props.activeNode.extensioncode || '',
    extensionName: props.activeNode.extensionName || props.activeNode.functionName || '',
    extensionDescription: props.activeNode.extensionDescription || props.activeNode.functionDesc || '',
    inputParams: JSON.parse(JSON.stringify(props.activeNode.inputParams || [])),
    outputParams: JSON.parse(JSON.stringify(props.activeNode.outputParams || [])),
    inputMappings: { ...(props.activeNode.inputMappings || {}) },
    outputMappings: { ...(props.activeNode.outputMappings || {}) },
    inputMappingEnabled: props.activeNode.inputMappingEnabled !== false,
    outputMappingEnabled: props.activeNode.outputMappingEnabled !== false,
    executionMode: props.activeNode.executionMode || 'sync',
    failureAction: props.activeNode.failureAction || 'block',
  })
  keyword.value = ''
  step.value = 1
  visible.value = true
  await loadPlugins()
  const nodeId = String(props.activeNode.id || props.activeNode.nodeId || '')
  if (nodeId && draft.pluginId) {
    try {
      const saved = await getPluginNodeConfig(nodeId, appId.value)
      if (saved) {
        Object.assign(draft, {
          pluginId: saved.pluginId || draft.pluginId,
          pluginName: saved.pluginName || draft.pluginName,
          extensionCode: saved.extensionCode || draft.extensionCode,
          extensionName: saved.extensionName || draft.extensionName,
          failureAction: saved.failureAction || draft.failureAction,
          inputParams: (saved.inputParams || []).map(item => ({ name: item.name, type: item.type, required: item.required })),
          outputParams: (saved.outputParams || []).map(item => ({ name: item.name, type: item.type, required: item.required })),
          inputMappings: Object.fromEntries((saved.inputParams || []).map(item => [item.name, item.map])),
          outputMappings: Object.fromEntries((saved.outputParams || []).map(item => [item.name, item.map])),
        })
      }
    } catch {
      // 新节点尚无持久化配置时继续使用画布中的本地数据。
    }
  }
  if (draft.pluginId) await loadFunctions(draft.pluginId)
}

async function loadFunctions(pluginId: string) {
  loadingFunctions.value = true
  try {
    functions.value = await getPluginExtensionList(pluginId) || []
    const selectedFunction = functions.value.find(item =>
      String(item.extensionCode || item.id || item.functionId || '') === draft.extensionCode,
    )
    if (selectedFunction) {
      draft.extensionDescription = selectedFunction.extensionDescription || selectedFunction.description || draft.extensionDescription
    }
  } finally {
    loadingFunctions.value = false
  }
}

async function selectPlugin(item: PluginDetailResponse) {
  const id = String(item.pluginId || item.id || '')
  if (!id) return
  Object.assign(draft, {
    pluginId: id,
    pluginName: item.pluginName || '',
    pluginIcon: item.icon || '',
    extensionCode: '',
    extensionName: '',
    extensionDescription: '',
    inputParams: [],
    outputParams: [],
    inputMappings: {},
    outputMappings: {},
    inputMappingEnabled: true,
    outputMappingEnabled: true,
  })
  await loadFunctions(id)
}

function selectFunction(item: PluginFunctionResponse) {
  Object.assign(draft, {
    extensionCode: String(item.extensionCode || item.id || item.functionId || ''),
    extensionName: item.extensionName || item.functionName || '',
    extensionDescription: item.extensionDescription || item.description || '',
    inputParams: parseParams(item.inputParams),
    outputParams: parseParams(item.outputParams),
    inputMappings: {},
    outputMappings: {},
    inputMappingEnabled: parseParams(item.inputParams).length > 0,
    outputMappingEnabled: parseParams(item.outputParams).length > 0,
  })
}

function next() {
  if (step.value === 1 && !draft.pluginId) return Message.warning('请选择插件')
  if (step.value === 2 && !draft.extensionCode) return Message.warning('请选择函数')
  step.value += 1
}

async function save() {
  const missingInput = draft.inputMappingEnabled
    ? draft.inputParams.find((item, index) => item.required && !draft.inputMappings[parameterKey(item, index)])
    : undefined
  if (missingInput) return Message.warning(`请配置必填入参“${missingInput.description || missingInput.name}”`)
  const nodeId = String(props.activeNode.id || props.activeNode.nodeId || '')
  if (!nodeId) return Message.warning('当前节点缺少节点ID，无法保存配置')
  Object.assign(props.activeNode, JSON.parse(JSON.stringify(draft)))
  props.activeNode['@class'] = 'com.joyou.module.plugin.behavior.PluginNode'
  delete props.activeNode.functionId
  delete props.activeNode.functionName
  delete props.activeNode.functionDesc
  delete props.activeNode.functionLanguage
  delete props.activeNode.functionType
  delete props.activeNode.extensioncode
  visible.value = false
  Message.success('插件节点配置已暂存，请保存流程后生效')
}

async function clearConfig() {
  const nodeId = String(props.activeNode.id || props.activeNode.nodeId || '')
  if (!nodeId) return
  try {
    await deletePluginNodeConfig(nodeId, appId.value)
    Object.assign(props.activeNode, {
      pluginId: '', pluginName: '', pluginIcon: '', extensionCode: '', extensionName: '',
      extensionDescription: '', inputParams: [], outputParams: [], inputMappings: {}, outputMappings: {},
    })
    Message.success('插件节点配置已删除')
  } catch {
    // 请求错误由全局拦截器提示。
  }
}
</script>

<template>
  <div class="plugin-node-settings">
    <div class="settings-title">插件配置</div>
    <div class="property-group">
      <div v-if="activeNode.pluginId" class="plugin-summary">
        <span class="plugin-summary__icon">
          <img v-if="iconUrl(activeNode.pluginIcon)" :src="iconUrl(activeNode.pluginIcon)" alt="" />
          <i v-else class="fas fa-plug" />
        </span>
        <span><b>{{ activeNode.pluginName }}</b><small>{{ activeNode.extensionName || activeNode.functionName }}</small></span>
      </div>
      <div v-else class="plugin-empty">
        <i class="fas fa-plug" />
        <span>尚未配置插件，点击下方按钮进行配置</span>
      </div>
    </div>
    <div class="property-group">
      <a-button class="config-plugin-button" long @click="open"><i class="fas fa-cog" /> 配置插件</a-button>
      <a-button v-if="activeNode.pluginId" class="delete-plugin-button" long status="danger" @click="clearConfig">
        <i class="fas fa-trash" /> 删除配置
      </a-button>
    </div>
    <div class="property-group failure-setting">
      <span class="failure-label">插件节点执行失败</span>
      <a-select v-model="activeNode.failureAction" class="failure-select">
        <a-option value="continue">继续流程（支持管理员手动重试）</a-option>
        <a-option value="block">阻塞流程，流程不失败（需要管理员手动重试）</a-option>
        <a-option value="fail">流程失败，需要流程发起者重新发起流程</a-option>
      </a-select>
      <small class="settings-hint">插件执行失败时的处理方式</small>
    </div>

    <a-modal v-model:visible="visible" modal-class="plugin-node-modal" :width="640" :mask-closable="false"
      title-align="start" :unmount-on-close="true">
      <template #title>
        <span class="plugin-modal-title"><i class="fas fa-plug" />配置插件节点</span>
      </template>
      <div class="step-bar">
        <template v-for="item in 3" :key="item">
          <div class="step-item" :class="{ active: step === item, done: step > item }">
            <span>{{ step > item ? '✓' : item }}</span>
            <b>{{ ['选择插件', '选择函数', '配置参数'][item - 1] }}</b>
          </div>
          <i v-if="item < 3" :class="{ done: step > item }" />
        </template>
      </div>

      <div v-if="step === 1" class="modal-step">
        <label class="modal-field-label">选择插件<span>*</span></label>
        <a-input v-model="keyword" allow-clear placeholder="搜索插件名称..." />
        <div class="option-list">
          <a-spin v-if="loadingPlugins" />
          <button v-for="item in filteredPlugins" v-else :key="String(item.pluginId || item.id)" type="button"
            class="option-row" :class="{ selected: String(item.pluginId || item.id) === draft.pluginId }"
            @click="selectPlugin(item)">
            <span class="option-icon"><img v-if="iconUrl(item.icon)" :src="iconUrl(item.icon)" alt="" /><i v-else
                class="fas fa-plug" /></span>
            <span><b>{{ item.pluginName }}</b><small>{{ item.description }}</small></span>
            <i class="option-check">{{ String(item.pluginId || item.id) === draft.pluginId ? '✓' : '' }}</i>
          </button>
          <a-empty v-if="!loadingPlugins && filteredPlugins.length === 0" description="暂无已发布插件" />
        </div>
      </div>

      <div v-else-if="step === 2" class="modal-step">
        <label class="modal-field-label">选择函数<span>*</span></label>
        <div class="selected-plugin"><i class="fas fa-plug" />{{ draft.pluginName }}</div>
        <div class="option-list">
          <a-spin v-if="loadingFunctions" />
          <button v-for="item in functions" v-else :key="String(item.extensionCode || item.id || item.functionId)" type="button"
            class="option-row" :class="{ selected: String(item.extensionCode || item.id || item.functionId) === draft.extensionCode }"
            @click="selectFunction(item)">
            <span>
              <!-- <i
                :class="item.functionType === 'backend' ? 'fas fa-server' : 'fas fa-desktop'" /> -->
            </span>
            <span><b>{{ item.extensionName || item.functionName }}</b><small>{{ item.extensionDescription || item.description }}</small></span>
            <i class="option-check">{{ String(item.extensionCode || item.id || item.functionId) === draft.extensionCode ? '✓' : '' }}</i>
          </button>
          <a-empty v-if="!loadingFunctions && functions.length === 0" description="该插件暂无函数" />
        </div>
      </div>

      <div v-else class="modal-step mapping-step">
        <section class="mapping-section">
          <div class="mapping-heading">
            <h4>入参配置</h4>
            <a-switch v-model="draft.inputMappingEnabled" size="small" />
          </div>
          <div v-for="(item, index) in draft.inputParams" v-show="draft.inputMappingEnabled"
            :key="`in-${parameterKey(item, index)}`" class="mapping-row">
            <span><b>{{ item.label || item.description }}<em v-if="item.required">*</em></b><small>{{ item.type
            }}</small></span>
            <a-select v-model="draft.inputMappings[parameterKey(item, index)]" allow-clear placeholder="请选择表单字段"
              popup-container=".plugin-node-modal" :trigger-props="modalSelectTriggerProps">
              <a-option v-for="field in compatibleFields(item)" :key="field.id" :value="field.id">{{ field.label
              }}</a-option>
            </a-select>
          </div>
          <a-empty v-if="draft.inputMappingEnabled && draft.inputParams.length === 0" description="该函数无需入参" />
        </section>
        <section class="mapping-section">
          <div class="mapping-heading">
            <h4>出参映射</h4>
            <a-switch v-model="draft.outputMappingEnabled" size="small" />
          </div>
          <div v-for="(item, index) in draft.outputParams" v-show="draft.outputMappingEnabled"
            :key="`out-${parameterKey(item, index)}`" class="mapping-row">
            <span><b>{{ item.label || item.description }}</b><small>{{ item.type }}</small></span>
            <a-select v-model="draft.outputMappings[parameterKey(item, index)]" allow-clear placeholder="请选择表单字段"
              popup-container=".plugin-node-modal" :trigger-props="modalSelectTriggerProps">
              <a-option v-for="field in compatibleFields(item)" :key="field.id" :value="field.id">{{ field.label
              }}</a-option>
            </a-select>
          </div>
          <a-empty v-if="draft.outputMappingEnabled && draft.outputParams.length === 0" description="该函数无出参" />
        </section>
      </div>

      <template #footer>
        <a-button v-if="step > 1" @click="step -= 1">上一步</a-button>
        <a-button v-if="step < 3" @click="visible = false">取消</a-button>
        <a-button v-if="step < 3" type="primary" @click="next">下一步</a-button>
        <a-button v-else type="primary" @click="save">保存</a-button>
      </template>
    </a-modal>
  </div>
</template>

<style scoped lang="scss">
.plugin-node-settings {
  display: block;
  width: 100%;
  overflow: visible;
}

.settings-title {
  display: block;
  margin: 0 0 12px;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: .5px;
}

.property-group {
  margin-bottom: 20px;
}

.plugin-summary {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  background: #f0fdf4;
}

.plugin-summary__icon {
  width: 32px !important;
  height: 32px !important;
}

.plugin-summary__icon,
.option-icon,
.function-icon {
  display: grid;
  width: 36px;
  height: 36px;
  flex: none;
  overflow: hidden;
  border-radius: 8px;
  background: #dcfce7;
  color: #16a34a;
  place-items: center;
}

.plugin-summary__icon img,
.option-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.option-icon {
  border-radius: 50%;
}

.plugin-summary span:nth-child(2),
.option-row>span:nth-child(2) {
  display: grid;
  min-width: 0;
  gap: 4px;
  flex: 1;
  text-align: left;
}

.plugin-summary b {
  color: #334155;
  font-size: 13px;
  font-weight: 600;
  line-height: 20px;
}

.plugin-summary small,
.option-row small {
  overflow: hidden;
  color: #94a3b8;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.plugin-empty {
  display: grid;
  padding: 16px;
  border: 1px dashed #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  color: #94a3b8;
  font-size: 12px;
  text-align: center;
  place-content: center;
  place-items: center;
}

.plugin-empty i {
  margin-bottom: 6px;
  color: #cbd5e1;
  font-size: 20px;
}

.config-plugin-button {
  height: 34px;
  border: 1px dashed #bfdbfe !important;
  border-radius: 8px !important;
  background: #eff6ff !important;
  color: #3b82f6 !important;
  font-size: 13px;
}

.config-plugin-button:hover {
  background: #dbeafe !important;
}

.config-plugin-button i {
  margin-right: 5px;
}

.delete-plugin-button { margin-top: 8px; border-radius: 8px !important; }

.failure-setting {
  display: block;
  width: 100%;
  overflow: visible;
}

.failure-label {
  display: block;
  margin-bottom: 6px;
  color: #475569;
  font-size: 12px;
  font-weight: 500;
}

.failure-select {
  width: 100%;
}

.failure-select :deep(.arco-select-view) {
  min-height: 34px;
  border-radius: 8px;
  background: #fff;
  font-size: 13px;
}

.settings-hint {
  display: block;
  margin-top: 6px;
  color: #94a3b8;
  font-size: 11px;
  line-height: 16px;
}

.plugin-modal-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #1e293b;
  font-size: 16px;
  font-weight: 600;
}

.plugin-modal-title i {
  color: #3b82f6;
}

.step-bar {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 8px;
  margin: 0 -24px 20px;
  padding: 16px 24px;
  border-bottom: 1px solid #f1f5f9;
}

.step-item {
  display: grid;
  width: 68px;
  justify-items: center;
  gap: 6px;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 400;
}

.step-item span {
  display: grid;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 600;
  place-items: center;
}

.step-item b {
  font-weight: inherit;
  white-space: nowrap;
}

.step-item.active {
  color: #3b82f6;
  font-weight: 600;
}

.step-item.active span {
  background: #dbeafe;
  color: #3b82f6;
}

.step-item.done {
  color: #22c55e;
}

.step-item.done span {
  background: #f0fdf4;
  color: #22c55e;
}

.step-bar>i {
  width: 24px;
  height: 1px;
  margin-top: 12px;
  background: #e2e8f0;
}

.step-bar>i.done {
  background: #22c55e;
}

.modal-field-label {
  display: block;
  margin-bottom: 8px;
  color: #475569;
  font-size: 13px;
  font-weight: 600;
}

.modal-field-label span {
  margin-left: 2px;
  color: #ef4444;
}

.modal-step {
  min-height: 340px;
}

.modal-step>.arco-input-wrapper {
  height: 40px;
  margin-bottom: 12px;
  border-radius: 10px;
  background: #f8fafc;
}

.option-list {
  display: grid;
  max-height: 340px;
  overflow: auto;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.option-row {
  display: flex;
  min-height: 64px;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: 0;
  border-bottom: 1px solid #edf2f7;
  background: #fff;
  cursor: pointer;
}

.option-row:hover {
  background: #f8fafc;
}

.option-row.selected {
  box-shadow: inset 3px 0 #3b82f6;
  background: #eff6ff;
}

.option-check {
  display: grid;
  width: 20px;
  height: 20px;
  flex: none;
  border: 1px solid #dbe4ef;
  border-radius: 50%;
  color: #fff;
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
  place-items: center;
}

.option-row.selected .option-check {
  border-color: #3b82f6;
  background: #3b82f6;
}

.selected-plugin {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #f0fdf4;
  color: #166534;
  font-size: 13px;
  font-weight: 600;
}

.function-icon {
  background: #f3e8ff;
  color: #9333ea;
}

.mapping-step {
  display: grid;
  gap: 0;
  max-height: 440px;
  overflow: auto;
  padding-right: 4px;
}

.mapping-section {
  padding: 0;
}

.mapping-heading {
  display: flex;
  min-height: 54px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eef2f7;
}

.mapping-heading h4 {
  margin: 0;
  color: #334155;
  font-size: 14px;
  font-weight: 600;
}

.mapping-row {
  display: grid;
  min-height: 58px;
  grid-template-columns: 230px 1fr;
  align-items: center;
  gap: 16px;
  border-bottom: 1px solid #eef2f7;
}

.mapping-row>span {
  display: grid;
  gap: 2px;
}

.mapping-row b {
  color: #334155;
  font-size: 13px;
  font-weight: 500;
}

.mapping-row em {
  margin-left: 2px;
  color: #f53f3f;
  font-style: normal;
}

.mapping-row small {
  color: #94a3b8;
  font-size: 11px;
}

:global(.plugin-node-modal.arco-modal) {
  overflow: hidden;
  border-radius: 16px;
}

:global(.plugin-node-modal .arco-modal-header) {
  height: auto;
  padding: 24px 24px 0;
  border-bottom: 0;
}

:global(.plugin-node-modal .arco-modal-body) {
  max-height: 60vh;
  padding: 0 24px 20px;
  overflow-y: auto;
}

:global(.plugin-node-modal .arco-modal-footer) {
  padding: 16px 24px;
  border-top: 1px solid #f1f5f9;
}

:global(.plugin-node-modal .arco-modal-close-btn) {
  top: 17px;
  right: 18px;
  border-radius: 8px;
  background: #f8fafc;
}

:global(.plugin-node-modal .arco-btn) {
  border-radius: 8px;
}
</style>
