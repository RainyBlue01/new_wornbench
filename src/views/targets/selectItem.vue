<template>
  <a-dropdown trigger="click" :popup-max-height="false">
    <div class="field-tag" :style="data.tag ? 'opacity: 0.5' : ''" draggable="true">
      <span>{{ data.showLabel }}</span>
      <icon-close class="close-icon" @click.stop="handleClose" />
    </div>
    <template #content>
      <a-doption @click="showRenameModal">修改名称</a-doption>

      <a-dropdown v-if="hasFunction" trigger="hover" position="rt" :popup-translate="[4, 0]">
        <a-doption>
          <div class="menu-option">
            <span>汇总方式</span>
            <icon-right class="arrow-icon" />
          </div>
        </a-doption>
        <template #content>
          <a-doption v-for="item in functionOptions" :key="item.value" @click="changeFunction(item.value)"
            v-show="isNumberType || item.value === 'COUNT'">
            <div class="menu-option">
              <span>{{ item.label }}</span>
              <icon-check v-if="data.function === item.value" class="check-icon" />
            </div>
          </a-doption>
        </template>
      </a-dropdown>

      <a-doption v-if="hasNumberFormat" @click="showNumberFormat">数据格式</a-doption>

      <a-doption @click="showWarningConfig">字段预警</a-doption>
    </template>
  </a-dropdown>

  <!-- 修改名称 -->
  <a-modal v-model:visible="renameVisible" title="修改名称" :width="480" @ok="confirmRename" @cancel="renameVisible = false"
    :mask-closable="false">
    <a-form :model="renameForm" layout="vertical">
      <a-form-item label="显示名称" :rules="[{ required: true, message: '请输入显示名称' }]">
        <a-input v-model="renameForm.showLabel" placeholder="请输入显示名称" allow-clear />
      </a-form-item>
    </a-form>
  </a-modal>

  <!-- 数字格式 -->
  <a-modal v-model:visible="numberVisible" title="数据格式" :width="480" @ok="confirmNumberFormat"
    @cancel="numberVisible = false" :mask-closable="false">
    <a-form :model="numberForm" layout="vertical">
      <a-form-item label="显示格式">
        <a-radio-group v-model="numberForm.percent">
          <a-radio :value="false">数值</a-radio>
          <a-radio :value="true">百分比</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="显示设置">
        <div class="box">
          <a-checkbox v-model="numberForm.thousandth">千分符</a-checkbox>
          <div class="scale-row">
            <a-checkbox v-model="numberForm.scale">小数位数</a-checkbox>
            <a-input-number v-show="numberForm.scale" v-model="numberForm.num" :min="0" :max="6" :step="1"
              style="width: 100px; margin-left: 10px" />
          </div>
        </div>

      </a-form-item>
      <a-form-item label="单位">
        <a-input v-model="numberForm.unit" placeholder="例如：元、%、台" allow-clear />
      </a-form-item>
    </a-form>
  </a-modal>

  <!-- 字段预警 -->
  <a-modal
    v-model:visible="warningVisible"
    title="字段预警"
    title-align="start"
    width="680px"
    class="condition-filter-modal"
    @ok="confirmWarning"
    @cancel="warningVisible = false"
    :mask-closable="false"
  >
    <div class="condition-wrapper warning-wrapper">
      <div class="condition-list" v-if="warningPlans.length > 0">
        <div
          class="condition-item warning-plan-item"
          v-for="(item, idx) in warningPlans"
          :key="idx"
        >
          <div class="warning-plan-desc">
            {{ data.showLabel }} {{ getSymbolLabel(item.symbol) }}
            <template v-if="item.symbol !== 'IS_NULL' && item.symbol !== 'NOT_NULL'">
              {{ formatWarningValue(item) }}
            </template>
            显示
          </div>
          <div class="warning-color-dot" :style="{ backgroundColor: item.color }"></div>
          <div class="warning-plan-actions">
            <button type="button" class="condition-action-btn" title="编辑" @click="editWarningItem(idx)">
              <icon-edit />
            </button>
            <button type="button" class="condition-remove" title="删除" @click="deleteWarningItem(idx)">
              <icon-delete />
            </button>
          </div>
        </div>
      </div>

      <button type="button" class="condition-add-btn" v-if="!warningEditing" @click="startAddWarning">
        <icon-plus />
        新增方案
      </button>

      <div class="condition-list" v-if="warningEditing">
        <p class="warning-form-tip">{{ data.showLabel }}的字段内容的颜色显示方案</p>
        <div class="condition-item">
          <div class="condition-field condition-field--readonly">{{ data.showLabel }}</div>
          <a-select
            v-if="warningForm.rulesOption.length > 0"
            v-model="warningForm.condition"
            allow-clear
            placeholder="等于"
            class="condition-rule"
            @change="handleWarningRuleChange"
          >
            <a-option
              v-for="item in warningForm.rulesOption"
              :key="item.value"
              :label="item.name"
              :value="item.value"
            />
          </a-select>
          <formLogics
            v-if="warningForm.condition"
            :key="warningFormLogicsKey"
            :deptList="deptList"
            :datas="warningForm"
            class="condition-value"
          />
          <a-color-picker
            v-if="warningForm.condition"
            v-model="warningForm.color"
            size="small"
            class="warning-color-picker"
          />
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconClose, IconRight, IconCheck, IconEdit, IconDelete, IconPlus } from '@arco-design/web-vue/es/icon'
import { getDataForm, setFormValue } from '@/data/data_form.js'
import formLogics from '@/components/formLogics/formLogics.vue'
import {
  buildWarningValueNames,
  formatWarningPlanValue,
  hydrateWarningFormDefault,
} from '@/utils/warningValueDisplay'
import { isReportNumberFieldType } from '@/utils/reportFieldFormat'

interface TargetField {
  showLabel: string
  column: string
  type: string
  function?: string
  tag?: boolean
  warningPlans?: any[]
  format?: any
  props?: any
  extra?: any
}

const props = defineProps<{
  data: TargetField
  index: number
  deptList?: any
}>()

const emits = defineEmits<{
  deleteItem: [index: number]
  editName: [payload: { showLabel: string }]
  editFunction: [func: string]
  editFormat: [format: any]
  editWarningPlans: [plans: any[]]
}>()

const handleClose = () => emits('deleteItem', props.index)

// ---- rename ----
const renameVisible = ref(false)
const renameForm = reactive({ showLabel: '' })
const showRenameModal = () => {
  renameForm.showLabel = props.data.showLabel
  renameVisible.value = true
}
const confirmRename = () => {
  if (!renameForm.showLabel.trim()) return
  emits('editName', { showLabel: renameForm.showLabel })
  renameVisible.value = false
}

// ---- 汇总方式 ----
const hasFunction = computed(() => typeof props.data.function !== 'undefined')
const isNumberType = computed(() => isReportNumberFieldType(props.data.type))
const functionOptions = [
  { value: 'COUNT', label: '计数' },
  { value: 'SUM', label: '求和' },
  { value: 'AVG', label: '求平均值' },
  { value: 'MAX', label: '求最大值' },
  { value: 'MIN', label: '求最小值' },
]
const changeFunction = (v: string) => {
  emits('editFunction', v)
}

// ---- 数字格式 ----
const hasNumberFormat = computed(() => isNumberType.value)
const numberVisible = ref(false)
const numberForm = reactive({
  percent: false,
  thousandth: false,
  scale: false,
  num: 0,
  unit: '',
})
const showNumberFormat = () => {
  const n = props.data.format?.number || {}
  numberForm.percent = n.percent ?? false
  numberForm.thousandth = n.thousandth ?? false
  numberForm.scale = n.scale ?? false
  numberForm.num = n.decimal ?? n.num ?? 0
  numberForm.unit = n.unit ?? ''
  numberVisible.value = true
}
const confirmNumberFormat = () => {
  const payload: any = {
    percent: numberForm.percent,
    thousandth: numberForm.thousandth,
    scale: numberForm.scale,
    decimal: numberForm.scale ? numberForm.num : 0,
    unit: numberForm.unit,
  }
  emits('editFormat', payload)
  numberVisible.value = false
}

// ---- 字段预警（复用报表的实现）----
const warningVisible = ref(false)
const warningEditing = ref(false)
const warningEditIndex = ref(-1)
const warningPlans = ref<any[]>([])
const warningFormLogicsKey = ref(0)

const symbolLabelMap: Record<string, string> = {
  EQ: '等于',
  NE: '不等于',
  IN: '等于其中之一',
  NOT_IN: '不等于其中之一',
  LIKE: '包含',
  NOT_LIKE: '不包含',
  IS_NULL: '为空',
  NOT_NULL: '不为空',
  GT: '大于',
  GE: '大于等于',
  LT: '小于',
  LE: '小于等于',
  BETWEEN: '范围',
  DYNAMIC_BETWEEN: '前',
}
const getSymbolLabel = (s: string) => symbolLabelMap[s] || s
const formatWarningValue = (item: any) =>
  formatWarningPlanValue(item, props.data.type || 'NUMBER', {
    extraOptions: props.data.extra?.options || [],
    deptList: props.deptList || [],
  })

const warningForm = reactive<{
  condition: string
  value: any
  rulesOption: any[]
  inputType: string
  default: any
  min: any
  max: any
  color: string
  format?: string
}>({
  condition: '',
  value: '',
  rulesOption: [],
  inputType: '',
  default: [],
  min: '',
  max: '',
  color: '#ff4444',
})

const initWarningRules = () => {
  const fieldType = props.data.type || 'NUMBER'
  const formDef = getDataForm(fieldType)
  if (formDef) {
    warningForm.rulesOption = JSON.parse(JSON.stringify(formDef.default))
    warningForm.inputType = fieldType
  }

  if (fieldType === 'ADDRESS' || fieldType === 'LOCATION') {
    warningForm.rulesOption.forEach((v: any) => {
      if (v.name === '属于') { v.name = '包含'; v.value = 'LIKE' }
      else if (v.name === '不属于') { v.name = '不包含'; v.value = 'NOT_LIKE' }
    })
  }

  if (fieldType === 'SELECT') {
    warningForm.rulesOption.forEach((v: any) => {
      if (v.name === '等于其中之一' || v.name === '不等于其中之一') {
        v.showItem = true
      }
    })
  }

  if (fieldType === 'SELECT_MULTIPLE' || fieldType === 'CHECKBOX') {
    warningForm.rulesOption = [
      { type: 'in', value: 'IN', name: '等于其中之一' },
      { type: 'notIn', value: 'NOT_IN', name: '不等于其中之一' },
      { type: 'isNull', value: 'IS_NULL', name: '为空' },
      { type: 'notNull', value: 'NOT_NULL', name: '不为空' },
    ]
  }

  if (['RADIO', 'SELECT'].includes(fieldType) && props.data.extra?.options) {
    warningForm.default = props.data.extra.options
  } else if (['CHECKBOX', 'SELECT_MULTIPLE'].includes(fieldType) && props.data.extra?.options) {
    warningForm.default = props.data.extra.options
  } else if (['DEPT_MULTIPLE', 'USER_MULTIPLE', 'USER', 'DEPT'].includes(fieldType)) {
    warningForm.default = []
  } else if (fieldType === 'ADDRESS') {
    warningForm.default = props.data.props?.level ?? props.data.extra?.level
  } else {
    warningForm.default = props.data.extra || []
  }

  if (props.data.props?.format) {
    warningForm.format = props.data.props.format
  }
}

const resetWarningForm = () => {
  warningForm.condition = ''
  warningForm.value = ''
  warningForm.min = ''
  warningForm.max = ''
  warningForm.color = '#ff4444'
  warningEditing.value = false
  warningEditIndex.value = -1
}

const showWarningConfig = () => {
  warningPlans.value = JSON.parse(JSON.stringify(props.data.warningPlans || []))
  resetWarningForm()
  initWarningRules()
  warningVisible.value = true
}

const startAddWarning = () => {
  resetWarningForm()
  initWarningRules()
  warningEditing.value = true
}

const applyWarningPersonDefault = async (
  fieldType: string,
  symbol: string,
  value: any,
  valueNames: string | string[] | undefined,
) => {
  const restored = await hydrateWarningFormDefault(
    fieldType,
    value,
    valueNames,
    props.deptList || [],
  )
  if (['USER', 'DEPT'].includes(fieldType)) {
    if (symbol === 'EQ' || symbol === 'NE') {
      warningForm.default = restored.slice(0, 1)
      warningForm.value = ''
    } else if (symbol === 'IN' || symbol === 'NOT_IN') {
      warningForm.default = restored
      warningForm.value = []
    }
    return
  }
  if (['USER_MULTIPLE', 'DEPT_MULTIPLE'].includes(fieldType)) {
    warningForm.default = restored
    warningForm.value = []
  }
}

const editWarningItem = async (idx: number) => {
  const item = warningPlans.value[idx]
  initWarningRules()
  warningForm.condition = item.symbol
  warningForm.color = item.color || '#ff4444'
  if (item.format) {
    warningForm.format = item.format
  }

  const fieldType = props.data.type || 'NUMBER'

  if (item.symbol === 'BETWEEN' && Array.isArray(item.value)) {
    if (['NUMBER', 'RATE', 'MONEY', 'DOUBLE'].includes(fieldType)) {
      warningForm.min = item.value[0]
      warningForm.max = item.value[1]
      warningForm.value = ''
    } else {
      warningForm.value = item.value
      warningForm.min = ''
      warningForm.max = ''
    }
  } else if (['USER', 'DEPT', 'USER_MULTIPLE', 'DEPT_MULTIPLE'].includes(fieldType)) {
    await applyWarningPersonDefault(fieldType, item.symbol, item.value, item.valueNames)
  } else if (['CHECKBOX', 'SELECT_MULTIPLE'].includes(fieldType) && (item.symbol === 'IN' || item.symbol === 'NOT_IN')) {
    warningForm.value = Array.isArray(item.value) ? [...item.value] : []
  } else {
    warningForm.value = item.value ?? ''
  }

  warningEditIndex.value = idx
  warningEditing.value = true
  warningFormLogicsKey.value += 1
}

const deleteWarningItem = (idx: number) => warningPlans.value.splice(idx, 1)

const handleWarningRuleChange = () => {
  if (['USER', 'USER_MULTIPLE', 'DEPT', 'DEPT_MULTIPLE'].includes(warningForm.inputType)) {
    if (['IN', 'NOT_IN'].includes(warningForm.condition) || ['USER_MULTIPLE', 'DEPT_MULTIPLE'].includes(warningForm.inputType)) {
      warningForm.value = []
    } else {
      warningForm.value = ''
    }
    return
  }
  setFormValue(warningForm)
}

const buildWarningPlan = () => {
  if (!warningForm.condition) {
    Message.warning('请选择规则')
    return null
  }
  let value: any = warningForm.value
  const fieldType = props.data.type || 'INPUT'
  if (['NUMBER', 'RATE', 'MONEY', 'DOUBLE'].includes(fieldType) && warningForm.condition === 'BETWEEN') {
    value = [warningForm.min, warningForm.max]
  }

  if (['DATE', 'TIME'].includes(fieldType) && warningForm.condition === 'BETWEEN') {
    value = Array.isArray(warningForm.value) ? warningForm.value : [warningForm.min, warningForm.max]
  }

  if (warningForm.condition === 'IS_NULL' || warningForm.condition === 'NOT_NULL') {
    value = null
  } else if (['USER', 'DEPT'].includes(fieldType)) {
    if (warningForm.condition === 'EQ' || warningForm.condition === 'NE') {
      if (warningForm.default?.[0]?.id) value = warningForm.default[0].id
    } else if (warningForm.condition === 'IN' || warningForm.condition === 'NOT_IN') {
      if (Array.isArray(warningForm.default)) value = warningForm.default.map((v: any) => v.id)
    }
  } else if (['USER_MULTIPLE', 'DEPT_MULTIPLE'].includes(fieldType)) {
    if (Array.isArray(warningForm.default)) value = warningForm.default.map((v: any) => v.id)
  }

  const plan: any = {
    field: props.data.column,
    symbol: warningForm.condition,
    value: value != null ? JSON.parse(JSON.stringify(value)) : null,
    color: warningForm.color,
  }

  const valueNames = buildWarningValueNames(
    fieldType,
    value,
    warningForm.default,
    props.data.extra?.options || [],
  )
  if (valueNames !== undefined) {
    plan.valueNames = valueNames
  }

  if (warningForm.format) {
    plan.format = warningForm.format
  }

  return plan
}

const confirmWarning = () => {
  if (warningEditing.value) {
    const plan = buildWarningPlan()
    if (!plan) return
    if (warningEditIndex.value >= 0) warningPlans.value.splice(warningEditIndex.value, 1, plan)
    else warningPlans.value.push(plan)
  }
  emits('editWarningPlans', JSON.parse(JSON.stringify(warningPlans.value)))
  warningVisible.value = false
}
</script>

<style lang="scss" scoped>
@use '@/styles/filter-condition-form.scss';

.field-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background: #eff6ff;
  color: #3b82f6;
  border: 1px solid #dbeafe;
  cursor: move;
  transition: all 0.2s;

  &:hover {
    background: #dbeafe;
  }

  .close-icon {
    font-size: 10px;
    color: #3b82f6;
    cursor: pointer;

    &:hover {
      color: #ef4444;
    }
  }
}

.menu-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 140px;

  .check-icon {
    font-size: 14px;
    color: rgb(var(--primary-6));
    margin-left: 8px;
  }

  .arrow-icon {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.4);
    margin-left: 8px;
  }
}

.scale-row {
  display: flex;
  align-items: center;
  margin-top: 8px;
}
</style>
