<template>
  <a-modal v-model:visible="visible" title="导入数据" title-align="start" :width="720" :mask-closable="false"
    unmount-on-close modal-class="original-import-modal" @cancel="handleCancel">
    <div class="import-body">
      <!-- 步骤条 -->
      <div class="step-bar">
        <div v-for="(step, index) in steps" :key="step.num" class="step-bar__group">
          <div class="step-item" :class="{
            active: currentStep === step.num,
            done: currentStep > step.num,
          }">
            <span class="step-num">{{ step.num }}</span>
            <span>{{ step.label }}</span>
          </div>
          <div v-if="index < steps.length - 1" class="step-line" />
        </div>
      </div>

      <!-- Step 1: 上传文件 -->
      <div v-show="currentStep === 1" class="import-step">
        <div v-if="!selectedFile" class="upload-zone" :class="{ 'is-dragging': isDragging }" role="button" tabindex="0"
          @click="triggerFileSelect" @keydown.enter="triggerFileSelect" @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false" @drop.prevent="onDrop">
          <icon-cloud class="upload-zone__icon" />
          <p class="upload-zone__title">点击上传或拖拽Excel文件到此处</p>
          <p class="upload-zone__sub">支持 .xlsx、.xls 格式，单个文件最大 10MB</p>
        </div>
        <div v-else class="upload-file-info">
          <icon-file class="upload-file-info__icon" />
          <span>{{ selectedFile.name }} ({{ fileSizeKb }} KB)</span>
          <a-button type="text" size="small" @click="clearFile">重新选择</a-button>
        </div>

        <p class="section-title">导入模式</p>
        <div class="mode-group">
          <div v-for="mode in importModes" :key="mode.value" class="mode-option"
            :class="{ selected: importMode === mode.value }" @click="selectImportMode(mode.value)">
            <div class="mode-title">{{ mode.title }}</div>
            <div class="mode-desc">{{ mode.desc }}</div>
          </div>
        </div>

        <div class="option-row">
          <!-- <div v-if="importMode === 'insert'" class="option-item">
            <a-checkbox v-model="triggerFlow">导入后触发表单流程</a-checkbox>
          </div> -->
          <div class="option-item">
            <a-checkbox v-model="enableValidation">导入触发数据校验</a-checkbox>
          </div>
        </div>
      </div>

      <!-- Step 2: 数据预览 -->
      <div v-show="currentStep === 2" class="import-step">
        <p class="preview-hint">
          共解析出 <strong>{{ excelRows.length }}</strong> 条数据，以下为前10条预览：
        </p>
        <div class="preview-table-wrap">
          <table class="preview-table">
            <thead>
              <tr>
                <th v-for="h in excelHeaders" :key="h">{{ h }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in previewRows" :key="idx">
                <td v-for="h in excelHeaders" :key="h">
                  {{ row[h] !== undefined && row[h] !== null ? row[h] : '' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Step 3: 字段映射 -->
      <div v-show="currentStep === 3" class="import-step">
        <p class="preview-hint">
          请将Excel列与系统字段进行对应映射，不需要的字段可选择「不导入」：
        </p>
        <div class="map-container">
          <div class="map-group-title">表单字段</div>
          <div v-for="field in formMapFields" :key="field.key" class="map-row">
            <div class="map-sys">
              <span class="map-group-tag map-tag-form">表单</span>
              {{ field.label }}
            </div>
            <icon-arrow-right class="map-arrow" />
            <a-select v-model="columnMapping[field.key]" class="map-select"
              :class="{ unmapped: columnMapping[field.key] === SKIP_VALUE }" placeholder="不导入">
              <a-option :value="SKIP_VALUE">不导入</a-option>
              <a-option v-for="h in excelHeaders" :key="h" :value="h">{{ h }}</a-option>
            </a-select>
          </div>
        </div>

        <div v-if="importMode !== 'insert'" class="update-condition-box">
          <p class="update-condition-title">
            <icon-filter />
            更新条件字段（选择用于匹配已有数据的字段，可多选）
          </p>
          <div class="update-condition-list">
            <a-checkbox v-for="field in formMapFields" :key="'cond-' + field.key"
              :model-value="updateConditionFields.includes(field.key)"
              @change="(checked) => toggleUpdateCondition(field.key, !!checked)">
              {{ field.label }}
            </a-checkbox>
          </div>
          <p v-if="updateConditionFields.length === 0" class="update-condition-tip error">
            请至少选择一个条件字段
          </p>
          <p v-else class="update-condition-tip ok">
            已选择 {{ updateConditionFields.length }} 个条件字段
          </p>
        </div>

        <div v-if="validationVisible" class="validation-result">
          <p class="validation-title">
            <icon-exclamation-circle-fill />
            数据校验结果
          </p>
          <p class="validation-summary">
            共{{ validationSummary.total }}条数据，
            <span class="validation-success">通过{{ validationSummary.valid }}条</span>，
            <span class="validation-failure">失败{{ validationSummary.invalid }}条</span>
          </p>
          <div class="validation-list">
            <div v-for="item in validationInvalidPreview" :key="item.rowIndex" class="validation-item">
              <strong>第{{ item.rowIndex }}行</strong>：{{ item.errors.join('；') }}
            </div>
            <div v-if="validationInvalidMore > 0" class="validation-more">
              还有{{ validationInvalidMore }}条错误...
            </div>
          </div>
        </div>
      </div>

      <!-- Step 4: 导入结果 -->
      <div v-show="currentStep === 4" class="import-step">
        <div class="import-progress">
          <div class="import-progress-bar" :style="{ width: progressPercent + '%' }" />
        </div>
        <div v-if="importing" class="importing-text">正在导入数据...</div>
        <div v-else class="result-area">
          <div class="result-card">
            <div class="result-icon green"><icon-plus-circle-fill /></div>
            <div>
              <div class="result-num">{{ result.inserted }}</div>
              <div class="result-label">新增数据</div>
            </div>
          </div>
          <div class="result-card">
            <div class="result-icon blue"><icon-edit /></div>
            <div>
              <div class="result-num">{{ result.updated }}</div>
              <div class="result-label">更新数据</div>
            </div>
          </div>
          <div class="result-card">
            <div class="result-icon orange"><icon-close-circle-fill /></div>
            <div>
              <div class="result-num">{{ result.skipped }}</div>
              <div class="result-label">跳过数据</div>
            </div>
          </div>
          <p class="result-total">
            导入已完成，共处理 <strong>{{ result.total }}</strong> 条数据。
          </p>
        </div>
      </div>
    </div>
    <!-- 底部按钮 -->
    <template #footer>
      <div class="import-footer">
        <a-button @click="handleCancel">取消</a-button>
        <a-button v-if="currentStep > 1 && currentStep < 4" @click="prevStep">上一步</a-button>
        <a-button v-if="currentStep < 4" :loading="parsing" :disabled="nextDisabled" @click="nextStep" type="primary">
          {{ nextButtonText }}
        </a-button>
        <a-button v-if="currentStep === 4" type="primary" @click="handleFinish">完成</a-button>
      </div>
    </template>


    <input ref="fileInputRef" type="file" accept=".xlsx,.xls" class="file-input-hidden" @change="onFileInputChange" />
  </a-modal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import {
  IconCloud,
  IconFile,
  IconArrowRight,
  IconFilter,
  IconExclamationCircleFill,
  IconPlusCircleFill,
  IconEdit,
  IconCloseCircleFill,
} from '@arco-design/web-vue/es/icon'
import { importOriginalData } from '@/api/original/index'
import { dowload } from '@/api/user'
import { blobDownload } from '@/utils/export'
import type { ImportMapField, ImportMode } from '@/types/originalImport'
import {
  SKIP_VALUE,
  buildInitialMapping,
  getMappedColumnMapping,
  parseExcelFile,
  validateExcelFile,
  validateImportRows,
} from '@/utils/originalImportExcel'

const props = defineProps<{
  appId: string
  formId: string
  appName?: string
  mapFields: ImportMapField[]
}>()

const emit = defineEmits<{ success: [] }>()

const steps = [
  { num: 1, label: '上传文件' },
  { num: 2, label: '数据预览' },
  { num: 3, label: '字段映射' },
  { num: 4, label: '导入结果' },
]

const importModes = [
  { value: 'insert' as ImportMode, title: '仅新增', desc: '直接新增导入数据' },
  { value: 'update' as ImportMode, title: '仅更新', desc: '按条件字段匹配更新，未匹配跳过' },
  { value: 'upsert' as ImportMode, title: '新增和更新', desc: '按条件字段匹配更新，未匹配新增' },
]

const visible = ref(false)
const currentStep = ref(1)
const importMode = ref<ImportMode>('insert')
const triggerFlow = ref(false)
const enableValidation = ref(true)
const selectedFile = ref<File | null>(null)
const isDragging = ref(false)
const parsing = ref(false)
const importing = ref(false)
const progressPercent = ref(0)

const excelHeaders = ref<string[]>([])
const excelRows = ref<Record<string, unknown>[]>([])
const columnMapping = ref<Record<string, string>>({})
const updateConditionFields = ref<string[]>([])
const validImportRows = ref<Record<string, unknown>[]>([])

const validationVisible = ref(false)
const validationSummary = ref({ total: 0, valid: 0, invalid: 0 })
const validationInvalidPreview = ref<{ rowIndex: number; errors: string[] }[]>([])
const validationInvalidMore = ref(0)

const result = ref({
  insertCount: 0,
  updateCount: 0,
  skipCount: 0,
  total: 0,
})

const fileInputRef = ref<HTMLInputElement>()

const formMapFields = computed(() =>
  props.mapFields.filter((f) => f.group === 'form'),
)

const previewRows = computed(() => excelRows.value.slice(0, 10))

const fileSizeKb = computed(() =>
  selectedFile.value ? (selectedFile.value.size / 1024).toFixed(1) : '0',
)

const nextButtonText = computed(() => {
  if (currentStep.value === 3) {
    if (validationVisible.value && validImportRows.value.length > 0) {
      return `仅导入通过的数据（${validImportRows.value.length}条）`
    }
    return '开始导入'
  }
  return '下一步'
})

const nextDisabled = computed(() => {
  if (currentStep.value === 1) return !selectedFile.value
  if (currentStep.value === 3 && validationVisible.value) {
    return validImportRows.value.length === 0
  }
  return false
})

const resetState = () => {
  currentStep.value = 1
  importMode.value = 'insert'
  triggerFlow.value = false
  enableValidation.value = true
  selectedFile.value = null
  isDragging.value = false
  excelHeaders.value = []
  excelRows.value = []
  columnMapping.value = {}
  updateConditionFields.value = []
  validImportRows.value = []
  validationVisible.value = false
  validationSummary.value = { total: 0, valid: 0, invalid: 0 }
  validationInvalidPreview.value = []
  validationInvalidMore.value = 0
  progressPercent.value = 0
  importing.value = false
  result.value = { insertCount: 0, updateCount: 0, skipCount: 0, total: 0 }
  if (fileInputRef.value) fileInputRef.value.value = ''
}

const open = () => {
  resetState()
  visible.value = true
}

const handleCancel = () => {
  visible.value = false
  resetState()
}

const handleFinish = () => {
  emit('success')
  handleCancel()
}

const selectImportMode = (mode: ImportMode) => {
  importMode.value = mode
  if (mode !== 'insert') {
    triggerFlow.value = false
  }
}

const triggerFileSelect = () => {
  fileInputRef.value?.click()
}

const clearFile = () => {
  selectedFile.value = null
  excelHeaders.value = []
  excelRows.value = []
  if (fileInputRef.value) fileInputRef.value.value = ''
}

const processFile = async (file: File) => {
  const err = validateExcelFile(file)
  if (err) {
    Message.error(err)
    return
  }
  parsing.value = true
  try {
    const { headers, rows } = await parseExcelFile(file)
    selectedFile.value = file
    excelHeaders.value = headers
    excelRows.value = rows
    columnMapping.value = buildInitialMapping(props.mapFields, headers)
    validationVisible.value = false
  } catch (e) {
    Message.error(e instanceof Error ? e.message : 'Excel解析失败')
    clearFile()
  } finally {
    parsing.value = false
  }
}

const onFileInputChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) processFile(file)
}

const onDrop = (e: DragEvent) => {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) processFile(file)
}

const toggleUpdateCondition = (key: string, checked: boolean) => {
  if (checked) {
    if (!updateConditionFields.value.includes(key)) {
      updateConditionFields.value.push(key)
    }
  } else {
    updateConditionFields.value = updateConditionFields.value.filter((k) => k !== key)
  }
}

const goToStep = (step: number) => {
  currentStep.value = step
}

const prevStep = () => {
  if (currentStep.value > 1) {
    validationVisible.value = false
    goToStep(currentStep.value - 1)
  }
}

const renderValidationResult = (validation: ReturnType<typeof validateImportRows>) => {
  const total = excelRows.value.length
  const valid = validation.validRows.length
  const invalid = validation.invalidRows.length
  validationSummary.value = { total, valid, invalid }
  validationInvalidPreview.value = validation.invalidRows.slice(0, 5)
  validationInvalidMore.value = Math.max(0, validation.invalidRows.length - 5)
  validImportRows.value = validation.validRows
  validationVisible.value = true
}

const nextStep = async () => {
  if (currentStep.value === 1) {
    if (!selectedFile.value) {
      Message.warning('请先上传Excel文件')
      return
    }
    goToStep(2)
    return
  }

  if (currentStep.value === 2) {
    goToStep(3)
    return
  }

  if (currentStep.value === 3) {
    const mapped = Object.values(columnMapping.value).filter((v) => v && v !== SKIP_VALUE)
    if (mapped.length === 0) {
      Message.warning('请至少映射一个字段')
      return
    }
    if (importMode.value !== 'insert' && updateConditionFields.value.length === 0) {
      Message.warning('请至少选择一个更新条件字段')
      return
    }

    if (validationVisible.value) {
      await doImport()
      return
    }

    if (!enableValidation.value) {
      validImportRows.value = [...excelRows.value]
      await doImport()
      return
    }

    const validation = validateImportRows(
      excelRows.value,
      columnMapping.value,
      props.mapFields,
    )
    if (validation.invalidRows.length === 0) {
      validImportRows.value = validation.validRows
      await doImport()
    } else {
      renderValidationResult(validation)
    }
  }
}

const doImport = async () => {
  if (!selectedFile.value || !props.appId || !props.formId) return

  goToStep(4)
  importing.value = true
  progressPercent.value = 10

  try {
    const mappedMapping = getMappedColumnMapping(columnMapping.value, props.mapFields)
    progressPercent.value = 40
    let importOriginal = {
      appId: props.appId,
      formId: props.formId,
      importMode: importMode.value,
      updateConditionFields:
        importMode.value !== 'insert' ? updateConditionFields.value : undefined,
      mapping: mappedMapping,
      triggerFlow: triggerFlow.value,
      triggerDataVerify: enableValidation.value,
    }
    const res = await importOriginalData({
      file: selectedFile.value,
      importOriginal: JSON.stringify(importOriginal)
    })

    progressPercent.value = 100
    console.log(res)
    const data = res as Record<string, any>
    if (data?.failDataPath) {
      const downloadRes = await dowload({ fileId: data.failDataPath })
      blobDownload(
        downloadRes,
        `${props.appName || '原始数据'}导入失败文档.xlsx`,
      )
      Message.warning('部分数据导入失败，已下载失败文档')
    } else {
      Message.success('导入成功')
    }

    result.value = {
      inserted: data?.inserted ?? data?.inserted ?? 0,
      skipped: data?.skipped ?? 0,
      updated: data?.updated ?? data?.updated ?? 0,
      total:
        data?.total ?? 0
    }
  } catch {
    // Message.error('导入失败')
    goToStep(3)
  } finally {
    importing.value = false
  }
}

defineExpose({ open })
</script>

<style lang="scss" scoped>
.import-body {
  min-height: 320px;
}

.step-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;

  &__group {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.step-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #94a3b8;

  &.active {
    color: rgb(var(--primary-6));
    font-weight: 600;
  }

  &.done {
    color: #22c55e;
  }
}

.step-num {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #94a3b8;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
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

.upload-zone {
  border: 2px dashed #cbd5e1;
  border-radius: 14px;
  padding: 36px 24px;
  text-align: center;
  cursor: pointer;
  background: #f8fafc;
  transition: all 0.2s;

  &:hover,
  &.is-dragging {
    border-color: rgb(var(--primary-6));
    background: #eff6ff;
  }

  &__icon {
    font-size: 32px;
    color: #94a3b8;
    margin-bottom: 8px;
  }

  &__title {
    font-size: 13px;
    color: #64748b;
    margin: 0;
  }

  &__sub {
    font-size: 12px;
    color: #94a3b8;
    margin: 4px 0 0;
  }
}

.upload-file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 10px;
  font-size: 13px;
  color: #475569;

  &__icon {
    color: #22c55e;
    font-size: 18px;
  }
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin: 20px 0 10px;
}

.mode-group {
  display: flex;
  gap: 12px;
}

.mode-option {
  flex: 1;
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;

  &:hover {
    border-color: #cbd5e1;
    background: #f8fafc;
  }

  &.selected {
    border-color: rgb(var(--primary-6));
    background: #eff6ff;
  }

  .mode-title {
    font-size: 13px;
    font-weight: 600;
    color: #334155;
    margin-bottom: 4px;
  }

  .mode-desc {
    font-size: 11px;
    color: #94a3b8;
  }
}

.option-row {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-top: 12px;
}

.preview-hint {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 12px;
}

.preview-table-wrap {
  overflow-x: auto;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.preview-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 12px;

  th {
    background: #f8fafc;
    padding: 8px 10px;
    border-bottom: 1px solid #e2e8f0;
    color: #64748b;
    font-weight: 600;
    text-align: left;
    white-space: nowrap;
  }

  td {
    padding: 8px 10px;
    border-bottom: 1px solid #f1f5f9;
    color: #334155;
  }
}

.map-container {
  max-height: 280px;
  overflow-y: auto;
  padding-right: 4px;
}

.map-group-title {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  margin: 12px 0 8px;
  padding-left: 4px;
}

.map-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    border-bottom: none;
  }
}

.map-sys {
  width: 140px;
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 500;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 6px;
}

.map-group-tag {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.map-tag-form {
  background: #f0fdf4;
  color: #16a34a;
}

.map-arrow {
  color: #cbd5e1;
  font-size: 12px;
  flex-shrink: 0;
}

.map-select {
  flex: 1;

  &.unmapped :deep(.arco-select-view) {
    border-color: #fbbf24;
    background: #fffbeb;
  }
}

.update-condition-box {
  margin-top: 16px;
  border: 1px solid #dbeafe;
  border-radius: 12px;
  background: #eff6ff;
  padding: 14px 16px;
}

.update-condition-title {
  font-size: 13px;
  font-weight: 600;
  color: #2563eb;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.update-condition-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.update-condition-tip {
  font-size: 11px;
  margin-top: 8px;

  &.error {
    color: #ef4444;
  }

  &.ok {
    color: rgb(var(--primary-6));
  }
}

.validation-result {
  margin-top: 16px;
  border: 1px solid #fecaca;
  border-radius: 12px;
  background: #fef2f2;
  padding: 14px 16px;
}

.validation-title {
  font-size: 13px;
  font-weight: 600;
  color: #ef4444;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.validation-summary {
  font-size: 12px;
  margin-bottom: 8px;
}

.validation-success {
  color: #16a34a;
}

.validation-failure {
  color: #ef4444;
}

.validation-list {
  max-height: 140px;
  overflow-y: auto;
}

.validation-item {
  font-size: 12px;
  color: #991b1b;
  margin-bottom: 4px;
}

.validation-more {
  font-size: 11px;
  color: #b91c1c;
}

.import-progress {
  width: 100%;
  height: 4px;
  background: #f1f5f9;
  border-radius: 2px;
  overflow: hidden;
  margin: 12px 0;
}

.import-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, rgb(var(--primary-6)), #6366f1);
  border-radius: 2px;
  transition: width 0.3s;
}

.importing-text {
  text-align: center;
  font-size: 13px;
  color: #64748b;
  padding: 24px 0;
}

.result-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 14px;
  background: #f8fafc;
  margin-bottom: 12px;
}

.result-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;

  &.green {
    background: #f0fdf4;
    color: #22c55e;
  }

  &.blue {
    background: #eff6ff;
    color: rgb(var(--primary-6));
  }

  &.orange {
    background: #fff7ed;
    color: #f97316;
  }
}

.result-num {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.result-label {
  font-size: 12px;
  color: #94a3b8;
}

.result-total {
  font-size: 13px;
  color: #64748b;
  text-align: center;
  margin-top: 16px;
}

.import-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 !important;
  margin-top: 24px;
  padding-top: 16px;
}

.modal-btn {
  padding: 9px 18px !important;
  border-radius: 10px !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  transition: all 0.2s !important;
  border: none !important;
  height: auto !important;

  &.modal-btn-ghost {
    background: #f8fafc !important;
    color: #64748b !important;
    border: 1px solid #e2e8f0 !important;

    &:hover {
      background: #f1f5f9 !important;
      color: #334155 !important;
    }
  }

  &.modal-btn-primary {
    background: linear-gradient(135deg, #3b82f6, #6366f1) !important;
    color: white !important;
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.25) !important;

    &:hover:not(:disabled) {
      transform: translateY(-1px) !important;
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35) !important;
    }

    &:disabled {
      opacity: 0.6 !important;
      cursor: not-allowed !important;
      transform: none !important;
    }
  }
}

.file-input-hidden {
  display: none;
}
</style>
