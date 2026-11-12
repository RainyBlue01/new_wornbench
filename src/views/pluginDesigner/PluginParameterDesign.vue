<script setup lang="ts">
import { computed, reactive, shallowRef } from 'vue'
import { Message } from '@arco-design/web-vue'

type ParameterKind = 'input' | 'output'
type ModalMode = 'create' | 'edit'

interface PluginFunction {
  name: string
  description: string
  kind: 'frontend' | 'backend'
  language?: string
}

interface FunctionParameter {
  name: string
  label?: string
  type: string
  required?: boolean
  description: string
}

const componentProps = defineProps<{
  currentFunction?: PluginFunction
  inputParams: FunctionParameter[]
  outputParams: FunctionParameter[]
}>()

const emit = defineEmits<{
  add: [kind: ParameterKind, parameter: FunctionParameter]
  edit: [kind: ParameterKind, originalName: string, parameter: FunctionParameter]
  remove: [kind: ParameterKind, parameter: FunctionParameter]
}>()

const formModalVisible = shallowRef(false)
const deleteModalVisible = shallowRef(false)
const modalMode = shallowRef<ModalMode>('create')
const activeKind = shallowRef<ParameterKind>('input')
const originalName = shallowRef('')
const deletingParameter = shallowRef<FunctionParameter | null>(null)

const parameterForm = reactive<FunctionParameter>({
  name: '',
  label: '',
  type: '文本',
  required: true,
  description: '',
})

const formModalTitle = computed(() => {
  const action = modalMode.value === 'create' ? '添加' : '修改'
  return `${action}${activeKind.value === 'input' ? '请求' : '返回'}参数`
})

const deleteModalTitle = computed(() => `删除${activeKind.value === 'input' ? '请求' : '返回'}参数`)
const languageLabel = computed(() => {
  const language = componentProps.currentFunction?.language?.trim().toLowerCase() || 'javascript'
  const labels: Record<string, string> = {
    javascript: 'JavaScript',
    js: 'JavaScript',
    nodejs: 'Node.js',
    node: 'Node.js',
    typescript: 'TypeScript',
    ts: 'TypeScript',
    java: 'Java',
    python: 'Python',
    py: 'Python',
    json: 'JSON',
  }
  return labels[language] || componentProps.currentFunction?.language || 'JavaScript'
})

function resetForm(kind: ParameterKind) {
  Object.assign(parameterForm, {
    name: '',
    label: '',
    type: '文本',
    required: kind === 'input',
    description: '',
  })
}

function openCreate(kind: ParameterKind) {
  activeKind.value = kind
  modalMode.value = 'create'
  originalName.value = ''
  resetForm(kind)
  formModalVisible.value = true
}

function openEdit(kind: ParameterKind, parameter: FunctionParameter) {
  activeKind.value = kind
  modalMode.value = 'edit'
  originalName.value = parameter.name
  Object.assign(parameterForm, parameter, {
    label: parameter.label || parameter.name,
    required: kind === 'input' ? Boolean(parameter.required) : false,
  })
  formModalVisible.value = true
}

function confirmForm(done: (closed: boolean) => void) {
  if (!parameterForm.name.trim()) {
    Message.warning('请输入参数ID')
    done(false)
    return
  }
  if (!parameterForm.label?.trim()) {
    Message.warning('请输入参数名称')
    done(false)
    return
  }
  const parameter: FunctionParameter = {
    ...parameterForm,
    name: parameterForm.name.trim(),
    label: parameterForm.label.trim(),
    required: activeKind.value === 'input' ? parameterForm.required : undefined,
  }
  if (modalMode.value === 'create') {
    emit('add', activeKind.value, parameter)
  } else {
    emit('edit', activeKind.value, originalName.value, parameter)
  }
  done(true)
}

function openDelete(kind: ParameterKind, parameter: FunctionParameter) {
  activeKind.value = kind
  deletingParameter.value = parameter
  deleteModalVisible.value = true
}

function confirmDelete(done: (closed: boolean) => void) {
  if (!deletingParameter.value) {
    done(false)
    return
  }
  emit('remove', activeKind.value, deletingParameter.value)
  deletingParameter.value = null
  done(true)
}
</script>

<template>
  <section class="parameter-design">
    <header class="function-summary">
      <div class="summary-main">
        <span class="summary-icon"><i class="fas fa-sliders-h" /></span>
        <div>
          <h2>函数参数声明</h2>
          <p>{{ currentFunction?.name }} · {{ currentFunction?.description }}</p>
        </div>
      </div>
      <div class="summary-tags">
        <span class="summary-tag summary-tag--blue">
          <i class="fas" :class="currentFunction?.kind === 'backend' ? 'fa-server' : 'fa-desktop'" />
          {{ currentFunction?.kind === 'backend' ? '后端函数' : '前端函数' }}
        </span>
        <span class="summary-tag">{{ languageLabel }}</span>
      </div>
    </header>

    <div class="parameter-content">
      <section class="parameter-section">
        <header class="parameter-section__header">
          <div class="section-title">
            <span class="section-mark section-mark--input" />
            <h3>请求参数（入参）</h3>
            <em>{{ inputParams.length }}</em>
          </div>
          <button type="button" class="add-parameter" @click="openCreate('input')">
            <i class="fas fa-plus" /> 添加参数
          </button>
        </header>
        <div class="parameter-table-wrap">
          <table class="parameter-table">
            <thead>
              <tr>
                <th class="name-column">参数名</th>
                <th class="type-column">类型</th>
                <th class="required-column">必填</th>
                <th>描述</th>
                <th class="action-column">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="parameter in inputParams" :key="parameter.name">
                <td class="parameter-name">{{ parameter.name }}</td>
                <td><span class="parameter-type">{{ parameter.type }}</span></td>
                <td><span v-if="parameter.required" class="required-label">必填</span><span v-else>-</span></td>
                <td class="parameter-description">{{ parameter.description }}</td>
                <td>
                  <div class="row-actions">
                    <button type="button" class="row-action" aria-label="编辑参数" @click="openEdit('input', parameter)">
                      <i class="fas fa-edit" />
                    </button>
                    <button type="button" class="row-action row-action--danger" aria-label="删除参数" @click="openDelete('input', parameter)">
                      <i class="fas fa-trash" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="parameter-section">
        <header class="parameter-section__header">
          <div class="section-title">
            <span class="section-mark section-mark--output" />
            <h3>返回参数（出参）</h3>
            <em>{{ outputParams.length }}</em>
          </div>
          <button type="button" class="add-parameter" @click="openCreate('output')">
            <i class="fas fa-plus" /> 添加参数
          </button>
        </header>
        <div class="parameter-table-wrap">
          <table class="parameter-table">
            <thead>
              <tr>
                <th class="name-column">参数名</th>
                <th class="type-column">类型</th>
                <th>描述</th>
                <th class="action-column">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="parameter in outputParams" :key="parameter.name">
                <td class="parameter-name">{{ parameter.name }}</td>
                <td><span class="parameter-type">{{ parameter.type }}</span></td>
                <td class="parameter-description">{{ parameter.description }}</td>
                <td>
                  <div class="row-actions">
                    <button type="button" class="row-action" aria-label="编辑参数" @click="openEdit('output', parameter)">
                      <i class="fas fa-edit" />
                    </button>
                    <button type="button" class="row-action row-action--danger" aria-label="删除参数" @click="openDelete('output', parameter)">
                      <i class="fas fa-trash" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <a-modal v-model:visible="formModalVisible" modal-class="plugin-parameter-modal" :title="formModalTitle"
      title-align="start" :width="520" :mask-closable="false"
      :ok-text="modalMode === 'create' ? '添加' : '保存'" cancel-text="取消" :on-before-ok="confirmForm">
      <a-form class="parameter-modal-form" :model="parameterForm" layout="vertical">
        <a-form-item field="name" label="参数ID" required>
          <a-input v-model="parameterForm.name" :placeholder="activeKind === 'input' ? 'studentId' : 'name'" />
        </a-form-item>
        <a-form-item field="label" label="参数名称" required>
          <a-input v-model="parameterForm.label" :placeholder="activeKind === 'input' ? '学号' : '学生姓名'" />
        </a-form-item>
        <a-form-item field="type" label="参数类型">
          <a-select v-model="parameterForm.type">
            <a-option>文本</a-option>
            <a-option>数字</a-option>
            <a-option>日期</a-option>
            <a-option>布尔</a-option>
            <a-option>JSON</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="description" label="描述">
          <a-input v-model="parameterForm.description"
            :placeholder="activeKind === 'input' ? '参数用途说明' : '返回参数用途说明'" />
        </a-form-item>
        <a-form-item v-if="activeKind === 'input'" field="required">
          <a-checkbox v-model="parameterForm.required">必填</a-checkbox>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="deleteModalVisible" modal-class="plugin-parameter-modal plugin-parameter-delete-modal"
      title-align="start" :width="420" :mask-closable="false" ok-text="确认删除" cancel-text="取消"
      :ok-button-props="{ status: 'danger' }" :on-before-ok="confirmDelete">
      <template #title>
        <span class="delete-modal-title"><i class="fas fa-exclamation-triangle" />{{ deleteModalTitle }}</span>
      </template>
      <div class="delete-warning">
        <span><i class="fas fa-exclamation" /></span>
        <div>
          <strong>警告：谨慎操作！</strong>
          <p>删除相关参数会影响插件功能，请谨慎操作！确认删除后，该参数相关的代码逻辑可能需要同步调整。</p>
        </div>
      </div>
      <div class="delete-target">
        <label>即将删除的参数</label>
        <div>{{ deletingParameter?.name }} · {{ deletingParameter?.label || deletingParameter?.description }}</div>
      </div>
    </a-modal>
  </section>
</template>

<style scoped lang="scss">
.parameter-design {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  overflow: auto;
  padding: 16px;
  background: #f1f5f9;
}

.function-summary,
.parameter-content {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
}

.function-summary {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: #f8fafc;
}

.summary-main,
.summary-tags,
.section-title,
.row-actions {
  display: flex;
  align-items: center;
}

.summary-main {
  gap: 12px;
}

.summary-icon {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border-radius: 8px;
  background: #dbeafe;
  color: #2563eb;
  font-size: 14px;
}

.summary-main h2 {
  margin: 0;
  color: #1e293b;
  font-size: 14px;
  font-weight: 600;
}

.summary-main p {
  margin: 2px 0 0;
  color: #64748b;
  font-size: 12px;
}

.summary-tags {
  gap: 8px;
}

.summary-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 11px;
  font-weight: 500;
}

.summary-tag--blue {
  background: #dbeafe;
  color: #2563eb;
}

.parameter-content {
  flex: 1;
  padding: 20px;
}

.parameter-section + .parameter-section {
  margin-top: 24px;
}

.parameter-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-title {
  gap: 8px;
}

.section-title h3 {
  margin: 0;
  color: #1e293b;
  font-size: 13px;
  font-weight: 600;
}

.section-title em {
  padding: 2px 8px;
  border-radius: 4px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 11px;
  font-style: normal;
}

.section-mark {
  width: 4px;
  height: 16px;
  border-radius: 2px;
}

.section-mark--input {
  background: #3b82f6;
}

.section-mark--output {
  background: #10b981;
}

.add-parameter {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border: 0;
  border-radius: 8px;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}

.parameter-table-wrap {
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.parameter-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.parameter-table th {
  padding: 10px 16px;
  background: #f8fafc;
  color: #475569;
  font-size: 12px;
  font-weight: 600;
  text-align: left;
}

.parameter-table td {
  padding: 12px 16px;
  border-top: 1px solid #f1f5f9;
}

.name-column {
  width: 120px;
}

.type-column,
.action-column {
  width: 80px;
}

.required-column {
  width: 60px;
}

.action-column {
  text-align: right !important;
}

.parameter-name {
  color: #1e293b;
  font-family: Consolas, monospace;
  font-weight: 500;
}

.parameter-type {
  padding: 2px 8px;
  border-radius: 4px;
  background: #dbeafe;
  color: #2563eb;
  font-size: 11px;
  font-weight: 500;
}

.required-label {
  color: #ef4444;
  font-size: 11px;
}

.parameter-description {
  color: #475569;
  font-size: 12px;
}

.row-actions {
  justify-content: flex-end;
  gap: 4px;
}

.row-action {
  width: 29px;
  height: 27px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  color: #64748b;
  font-size: 11px;
  cursor: pointer;
}

.row-action--danger {
  border-color: #fecaca;
  background: #fef2f2;
  color: #dc2626;
}

.delete-modal-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.delete-modal-title i {
  color: #f59e0b;
}

.delete-warning {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  border: 1px solid #fbbf24;
  border-radius: 10px;
  background: #fef3c7;
}

.delete-warning > span {
  display: grid;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 8px;
  background: #fbbf24;
  color: #fff;
  font-size: 14px;
}

.delete-warning strong {
  display: block;
  margin-bottom: 6px;
  color: #92400e;
  font-size: 14px;
}

.delete-warning p {
  margin: 0;
  color: #92400e;
  font-size: 13px;
  line-height: 1.6;
}

.delete-target label {
  display: block;
  margin-bottom: 6px;
  color: #475569;
  font-size: 12px;
  font-weight: 500;
}

.delete-target > div {
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  color: #1e293b;
  font-family: Consolas, monospace;
  font-size: 13px;
}
</style>

<style lang="scss">
.plugin-parameter-modal {
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
  }

  .arco-modal-body {
    padding: 10px 24px 0;
  }

  .parameter-modal-form .arco-form-item {
    margin-bottom: 16px;
  }

  .parameter-modal-form .arco-form-item-label-col > label {
    color: #475569;
    font-size: 12px;
    font-weight: 500;
  }

  .parameter-modal-form .arco-input-wrapper,
  .parameter-modal-form .arco-select-view {
    min-height: 38px;
    border-color: #e2e8f0;
    border-radius: 8px;
    background: #f8fafc;
  }

}

.plugin-parameter-delete-modal .arco-modal-body {
  padding-top: 14px;
}
</style>
