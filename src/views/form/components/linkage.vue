<template>
  <a-modal v-model:visible="dialogVisible" title="联动条件" title-align="start" :render-to-body="true" unmount-on-close
    width="964px" :mask-closable="false" :align-center="true" class="linkage-modal" @cancel="handleClose">
    <div class="linkage-wrapper">
      <div class="linkage-section">
        <div class="linkage-section-title">联动表单</div>
        <a-select allow-clear placeholder="请选择联动的表单" v-model="form.sourceFormCode" style="width: 100%" allow-search
          @change="onFormChange">
          <a-option v-for="app in relationApps" :key="app.appId" :value="app.appId" :label="app.appName" />
        </a-select>
      </div>

      <div class="condition-match">
        <span>满足</span>
        <a-select v-model="form.mode" style="width: 120px">
          <a-option value="and" label="全部" />
          <a-option value="or" label="任一" />
        </a-select>
        <span>条件时：</span>
      </div>

      <div class="condition-list">
        <p v-if="!form.logicConditions.length" class="condition-empty">
          暂无逻辑规则，点击「新增逻辑规则」
        </p>
        <div v-for="(items, index) in form.logicConditions" :key="index" class="condition-item">
          <a-select v-model="items.relationField" placeholder="请选择字段名称" class="condition-field"
            :disabled="!form.sourceFormCode" @change="changeName($event, items)">
            <a-option v-for="item in sourceFieldList" :key="item.id" :label="item.title" :value="item.id" />
          </a-select>
          <a-select v-model="items.symbol" placeholder="请选择规则" class="condition-rule"
            v-if="items.rulesOption?.length > 0" @change="changeValue($event, items)">
            <a-option v-for="item in items.rulesOption" :key="item.value" :label="item.name" :value="item.value" />
          </a-select>
          <a-select v-model="items.field" filterable allow-create placeholder="请设置表单字段" class="condition-value"
            v-if="items.symbol && items.symbol !== 'NOT_NULL' && items.symbol !== 'IS_NULL'">
            <a-option v-for="itema in currentFormFields" :key="itema.id" :label="itema.title" :value="itema.id" />
          </a-select>
          <button type="button" class="condition-remove" title="删除" @click="deleteItem(index)">
            <icon-delete />
          </button>
        </div>
      </div>

      <button type="button" class="condition-add-btn" @click="addItem">
        <icon-plus />
        新增逻辑规则
      </button>

      <div class="linkage-trigger">
        <div class="linkage-section-title">触发</div>
        <div class="linkage-trigger-row">
          <span class="linkage-trigger-label">{{ activeForm.title || activeForm.props?.label || '当前字段' }}</span>
          <span class="linkage-trigger-text">显示</span>
          <div class="linkage-trigger-select">
            <a-select v-model="form.relationTrigger.sourceFieldCode" placeholder="请选择联动表单字段"
              :disabled="!form.sourceFormCode">
              <a-option v-for="item in sourceFieldList" :key="item.id" :label="item.title" :value="item.id" />
            </a-select>
          </div>

          <span class="linkage-trigger-text">值</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="condition-footer">
        <button type="button" class="modal-btn modal-btn-ghost" @click="handleClose">取消</button>
        <button type="button" class="modal-btn modal-btn-primary" @click="next">确定</button>
      </div>
    </template>
  </a-modal>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useRoute } from 'vue-router'
import { setDataForm, setDataFormList } from '@/data/data_form.js'
import { getFormById } from '@/utils/form'
import {
  fetchRelationApps,
  loadFormFieldBySelect,
  type RelationApp,
  type FieldMeta,
} from '@/utils/relationFormFields'

interface LogicCondition {
  field: string
  symbol: string
  relationField: string
  rulesOption: any[]
  inputType: string
  default: any[]
  valueShow?: string
  format?: string
  types?: string
  row?: any
}

const props = defineProps<{
  activeForm: any
  formConfs: any
}>()

const emit = defineEmits<{
  (e: 'addData', data: any): void
}>()

const route = useRoute()
const dialogVisible = ref(false)
const relationApps = ref<RelationApp[]>([])
const sourceFieldList = ref<FieldMeta[]>([])
const currentFormFields = ref<any[]>([])

const form = reactive({
  logicConditions: [] as LogicCondition[],
  mode: 'and',
  sourceFormCode: '',
  relationTrigger: {
    fieldCode: '',
    sourceFieldCode: '',
  },
})

const loadApps = async () => {
  const { flat } = await fetchRelationApps(route.query.id as string)
  relationApps.value = flat
}

const loadSourceFields = async (formId: string) => {
  if (!formId) {
    sourceFieldList.value = []
    return
  }
  const app = relationApps.value.find((item) => item.appId === formId)
  if (!app) {
    sourceFieldList.value = []
    return
  }
  const { fields } = await loadFormFieldBySelect(app.appId)
  sourceFieldList.value = fields
}

const restoreConditionRules = (items: LogicCondition) => {
  const field = sourceFieldList.value.find((item) => item.id === items.relationField)
  if (field) {
    setDataForm(items.relationField, items, sourceFieldList.value)
  }
}

const onFormChange = async (formId: string) => {
  form.relationTrigger.sourceFieldCode = ''
  form.logicConditions = []

  await loadSourceFields(formId)
}

const addItem = () => {
  form.logicConditions.push({
    field: '',
    symbol: '',
    relationField: '',
    rulesOption: [],
    inputType: '',
    default: [],
    valueShow: '',
  })
}

const deleteItem = (index: number) => {
  form.logicConditions.splice(index, 1)
}

const changeName = (val: string, item: LogicCondition) => {
  setDataForm(val, item, sourceFieldList.value)
  if (item.inputType === 'SELECT_MULTIPLE' || item.inputType === 'CHECKBOX') {
    item.rulesOption = [
      { type: 'in', value: 'IN', name: '等于其中之一' },
      { type: 'notIn', value: 'NOT_IN', name: '不等于其中之一 ' },
      { type: 'isNull', value: 'IS_NULL', name: '为空' },
      { type: 'notNull', value: 'NOT_NULL', name: '不为空' },
    ]
  }
}

const changeValue = (_val: string, items: LogicCondition) => {
  items.field = ''
}

const resetForm = () => {
  form.logicConditions = []
  form.mode = 'and'
  form.sourceFormCode = ''
  form.relationTrigger = { fieldCode: '', sourceFieldCode: '' }
  sourceFieldList.value = []
  currentFormFields.value = []
}

const handleClose = () => {
  resetForm()
  dialogVisible.value = false
}

const showItem = async () => {
  await loadApps()

  const linkage = props.activeForm.props.linkage || {}
  form.sourceFormCode = linkage.sourceFormCode || ''
  form.mode = linkage.mode || 'and'
  form.logicConditions = JSON.parse(JSON.stringify(linkage.logicConditions || []))
  form.relationTrigger = {
    fieldCode: linkage.relationTrigger?.fieldCode || props.activeForm.id,
    sourceFieldCode: linkage.relationTrigger?.sourceFieldCode || '',
  }

  if (form.sourceFormCode) {
    await loadSourceFields(form.sourceFormCode)
    form.logicConditions.forEach((item) => restoreConditionRules(item))
  }

  const formConfig = getFormById(route.query.id as string)
  currentFormFields.value = []
  setDataFormList(formConfig.formList, currentFormFields.value)

  dialogVisible.value = true
}

const next = () => {
  if (!form.sourceFormCode) {
    Message.error('请选择联动表单')
    return
  }
  if (!form.logicConditions.length) {
    Message.error('请添加条件')
    return
  }
  if (!form.relationTrigger.sourceFieldCode) {
    Message.error('请选择联动表单触发字段')
    return
  }

  emit('addData', {
    logicConditions: JSON.parse(JSON.stringify(form.logicConditions)),
    mode: form.mode,
    sourceFormCode: form.sourceFormCode,
    relationTrigger: {
      fieldCode: props.activeForm.id,
      sourceFieldCode: form.relationTrigger.sourceFieldCode,
    },
  })
  handleClose()
}

defineExpose({ showItem })
</script>

<style lang="scss" scoped>
@use '@/styles/condition-modal.scss' as conditionModal;

.linkage-modal {
  :deep(.arco-modal) {
    @include conditionModal.condition-modal-shell;
  }
}

.linkage-wrapper {
  @include conditionModal.condition-wrapper-styles;
}

.linkage-section {
  margin-bottom: 20px;
}

.linkage-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.condition-match {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
  color: #475569;
  font-size: 13px;
}

.linkage-trigger {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
}

.linkage-trigger-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.linkage-trigger-label {
  width: calc(50% - 60px);
  padding: 8px 12px;
  border-radius: 8px;
  line-height: 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #334155;
  font-size: 13px;
}

.linkage-trigger-text {
  color: #64748b;
  font-size: 13px;
  white-space: nowrap;
}

.linkage-trigger-select {
  width: calc(50% - 50px);
}

@include conditionModal.condition-footer-styles;
</style>
