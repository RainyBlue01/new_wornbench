<script setup lang="ts">
import { computed, reactive, watch } from 'vue'

interface TestParameter {
  name: string
  label?: string
  type: string
  required?: boolean
  description: string
}

const props = defineProps<{
  functionKind: 'frontend' | 'backend'
  resetKey: string
  inputParams: TestParameter[]
  running: boolean
  resultVisible: boolean
  resultText: string
  resultStatus: 'success' | 'error' | ''
  duration: number
}>()

const emit = defineEmits<{
  run: [values: Record<string, unknown>]
  copy: []
  clear: []
}>()

const parameterValues = reactive<Record<string, any>>({})
const parameterErrors = reactive<Record<string, string>>({})

const resultFieldCount = computed(() => {
  if (!props.resultVisible || !props.resultText) return 0
  try {
    const value = JSON.parse(props.resultText)
    return value && typeof value === 'object' && !Array.isArray(value) ? Object.keys(value).length : 1
  } catch {
    return 1
  }
})

function isNumberType(type: string) {
  return ['数字', 'number', 'integer', 'int', 'float', 'double'].includes(type.toLowerCase())
}

function isBooleanType(type: string) {
  return ['布尔', 'boolean', 'bool'].includes(type.toLowerCase())
}

function isJsonType(type: string) {
  return ['json', '对象', 'object', '数组', 'array'].includes(type.toLowerCase())
}

watch(
  () => props.inputParams,
  (parameters) => {
    const names = new Set(parameters.map(item => item.name))
    Object.keys(parameterValues).forEach((name) => {
      if (!names.has(name)) delete parameterValues[name]
    })
    Object.keys(parameterErrors).forEach((name) => {
      if (!names.has(name)) delete parameterErrors[name]
    })
    parameters.forEach((parameter) => {
      if (parameter.name in parameterValues) return
      parameterValues[parameter.name] = isBooleanType(parameter.type) ? false : undefined
    })
  },
  { immediate: true, deep: true },
)

watch(
  () => props.resetKey,
  () => {
    Object.keys(parameterValues).forEach(name => delete parameterValues[name])
    Object.keys(parameterErrors).forEach(name => delete parameterErrors[name])
    props.inputParams.forEach((parameter) => {
      parameterValues[parameter.name] = isBooleanType(parameter.type) ? false : undefined
    })
  },
)

function runTest() {
  let isValid = true
  props.inputParams.forEach((parameter) => {
    const value = parameterValues[parameter.name]
    const isEmpty = value === undefined
      || value === null
      || (typeof value === 'string' && !value.trim())
    if (parameter.required && isEmpty) {
      parameterErrors[parameter.name] = `请输入${parameter.label || parameter.name}`
      isValid = false
    } else {
      delete parameterErrors[parameter.name]
    }
  })
  if (!isValid) return

  emit('run', { ...parameterValues })
}

function clearParameterError(name: string) {
  if (parameterErrors[name]) delete parameterErrors[name]
}
</script>

<template>
  <section class="test-debug">
    <div class="test-config">
      <section class="test-card">
        <header class="test-card__header">
          <span class="card-icon"><i class="fas fa-sign-in-alt" /></span>
          <h2>请求参数</h2>
          <em>{{ inputParams.length }}</em>
        </header>

        <div v-if="inputParams.length" class="request-list">
          <div v-for="parameter in inputParams" :key="parameter.name" class="request-field">
            <label class="request-label">
              <code>{{ parameter.name }}</code>
              <span v-if="parameter.required">必填</span>
            </label>

            <a-input-number
              v-if="isNumberType(parameter.type)"
              v-model="parameterValues[parameter.name]"
              class="request-control"
              :error="Boolean(parameterErrors[parameter.name])"
              :placeholder="`请输入${parameter.label || parameter.name}`"
              @update:model-value="clearParameterError(parameter.name)"
            />
            <a-switch
              v-else-if="isBooleanType(parameter.type)"
              v-model="parameterValues[parameter.name]"
              class="request-switch"
              @update:model-value="clearParameterError(parameter.name)"
            />
            <a-textarea
              v-else-if="isJsonType(parameter.type)"
              v-model="parameterValues[parameter.name]"
              class="request-control"
              :error="Boolean(parameterErrors[parameter.name])"
              :auto-size="{ minRows: 3, maxRows: 6 }"
              :placeholder="`请输入${parameter.label || parameter.name} JSON`"
              @update:model-value="clearParameterError(parameter.name)"
            />
            <a-input
              v-else
              v-model="parameterValues[parameter.name]"
              class="request-control"
              :error="Boolean(parameterErrors[parameter.name])"
              :placeholder="`请输入${parameter.label || parameter.name}`"
              @update:model-value="clearParameterError(parameter.name)"
            />

            <small v-if="parameterErrors[parameter.name]" class="request-error">
              {{ parameterErrors[parameter.name] }}
            </small>
            <small v-else-if="parameter.description">{{ parameter.description }}</small>
          </div>
        </div>
        <a-empty v-else class="test-empty" description="暂无测试参数" />
      </section>

      <button type="button" class="run-test" :disabled="running" @click="runTest">
        <i class="fas" :class="running ? 'fa-spinner fa-spin' : 'fa-play'" />
        {{ running ? '运行中...' : '运行测试' }}
      </button>
    </div>

    <section class="result-panel">
      <header class="result-header">
        <div>
          <strong><i class="fas fa-terminal" />运行结果</strong>
          <span v-if="resultVisible" class="result-status" :class="`result-status--${resultStatus}`">
            <i class="fas" :class="resultStatus === 'error' ? 'fa-circle-xmark' : 'fa-circle-check'" />
            {{ resultStatus === 'error' ? '失败' : '成功' }}
          </span>
        </div>
        <code v-if="resultVisible">耗时 {{ duration }}ms</code>
      </header>

      <div class="result-body">
        <div v-if="resultVisible" class="result-code">
          <p>返回结果：</p>
          <pre>{{ resultText }}</pre>
        </div>
        <a-empty v-else class="test-empty test-empty--dark" description="暂无运行结果" />
      </div>

      <footer class="result-footer">
        <span>{{ resultVisible ? `JSON · ${resultFieldCount} 个字段` : '等待运行' }}</span>
        <div>
          <button type="button" :disabled="!resultVisible" @click="emit('copy')"><i class="fas fa-copy" /> 复制</button>
          <button type="button" :disabled="!resultVisible" @click="emit('clear')"><i class="fas fa-eraser" /> 清空</button>
        </div>
      </footer>
    </section>
  </section>
</template>

<style scoped lang="scss">
.test-debug {
  display: grid;
  min-height: 0;
  flex: 1;
  grid-template-columns: 380px minmax(0, 1fr);
  gap: 16px;
  padding: 16px;
  background: #f1f5f9;
}

.test-config {
  display: flex;
  min-height: 0;
  flex-direction: column;
  gap: 16px;
}

.test-card {
  flex-shrink: 0;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
}

.test-card__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.test-card__header h2 {
  margin: 0;
  color: #1e293b;
  font-size: 13px;
  font-weight: 600;
}

.test-card__header em {
  margin-left: auto;
  padding: 2px 8px;
  border-radius: 4px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 11px;
  font-style: normal;
}

.card-icon {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border-radius: 6px;
  background: #dbeafe;
  color: #2563eb;
  font-size: 12px;
}

.request-list {
  max-height: calc(100vh - 230px);
  overflow-y: auto;
  padding: 16px;
}

.request-field + .request-field {
  margin-top: 16px;
}

.request-label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.request-label code {
  padding: 2px 8px;
  border-radius: 4px;
  background: #dbeafe;
  color: #2563eb;
  font-family: Consolas, monospace;
  font-size: 12px;
}

.request-label span {
  color: #ef4444;
  font-size: 11px;
}

.request-control {
  width: 100%;
}

.request-control:deep(.arco-input-wrapper),
.request-control:deep(.arco-input-number),
.request-control:deep(.arco-textarea-wrapper) {
  border-color: #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
}

.request-switch {
  display: block;
}

.request-field small {
  display: block;
  margin-top: 6px;
  color: #64748b;
  font-size: 11px;
}

.request-field .request-error {
  color: #f53f3f;
}

.test-empty {
  padding: 32px 16px;
}

.test-empty--dark :deep(.arco-empty-description) {
  color: #64748b;
}

.run-test {
  display: inline-flex;
  width: 100%;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border: 0;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.run-test:disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.result-panel {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #334155;
  border-radius: 12px;
  background: #1e293b;
}

.result-header,
.result-footer {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #0f172a;
}

.result-header {
  border-bottom: 1px solid #334155;
}

.result-header > div,
.result-footer > div {
  display: flex;
  align-items: center;
  gap: 8px;
}

.result-header strong {
  color: #e2e8f0;
  font-size: 12px;
}

.result-header strong i {
  margin-right: 6px;
  color: #3b82f6;
}

.result-header > code {
  color: #64748b;
  font-family: Consolas, monospace;
  font-size: 11px;
}

.result-status {
  padding: 2px 8px;
  border: 1px solid rgb(22 163 74 / 25%);
  border-radius: 6px;
  background: rgb(22 163 74 / 13%);
  color: #4ade80;
  font-size: 10px;
}

.result-status--error {
  border-color: rgb(239 68 68 / 30%);
  background: rgb(239 68 68 / 12%);
  color: #f87171;
}

.result-body {
  min-height: 0;
  flex: 1;
  overflow: auto;
  padding: 16px;
}

.result-code {
  padding: 12px 16px;
  border: 1px solid #334155;
  border-radius: 8px;
  background: #0f172a;
}

.result-code p {
  margin: 0 0 8px;
  color: #64748b;
  font-size: 12px;
}

.result-code pre {
  margin: 0;
  color: #4ade80;
  font-family: Consolas, monospace;
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}

.result-status--error ~ * {
  color: #f87171;
}

.result-footer {
  border-top: 1px solid #334155;
  color: #64748b;
  font-size: 11px;
}

.result-footer button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border: 1px solid #334155;
  border-radius: 8px;
  background: #1e293b;
  color: #94a3b8;
  font-size: 12px;
  cursor: pointer;
}

.result-footer button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}
</style>
