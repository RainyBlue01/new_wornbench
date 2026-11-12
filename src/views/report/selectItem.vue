<template>
  <a-dropdown trigger="click" :popup-max-height="false">
    <div class="field-tag" :style="data.tag ? 'opacity: 0.5' : ''" draggable="true">
      <span>{{ data.showLabel || data.label }}</span>
      <icon-close class="close-icon" @click.stop="handleClose" />
    </div>
    <template #content>
      <a-doption @click="showRenameModal">修改名称</a-doption>
      <a-doption v-if="!isSubformType" @click="toggleDetailOnly">
        <div class="menu-option">
          <span>仅详情显示</span>
          <icon-check v-if="data.tag" class="check-icon" />
        </div>
      </a-doption>
      <a-dropdown trigger="hover" position="rt" :popup-translate="[4, 0]">
        <a-doption>
          <div class="menu-option">
            <span>对齐方式</span>
            <icon-right class="arrow-icon" />
          </div>
        </a-doption>
        <template #content>
          <a-doption v-for="item in alignOptions" :key="item.value" @click="changeAlign(item.value)">
            <div class="menu-option">
              <span>{{ item.label }}</span>
              <icon-check v-if="data.align === item.value" class="check-icon" />
            </div>
          </a-doption>
        </template>
      </a-dropdown>
      <a-doption v-if="isSubformType" @click="showChildrenConfig">子表单配置</a-doption>
      <a-doption v-if="hasFormatConfig && !isSubformType" @click="showFormatConfig">数据格式</a-doption>
      <a-doption v-if="!isSubformType && data.type !== 'ATTACHMENT' && data.type !== 'SIGNATURE' && !data.flow"
        @click="showWarningConfig">
        字段预警
      </a-doption>
    </template>
  </a-dropdown>

  <!-- 修改名称弹窗 -->
  <a-modal v-model:visible="renameVisible" title="修改名称" :width="480" @ok="confirmRename" @cancel="renameVisible = false"
    :mask-closable="false">
    <a-form :model="renameForm" layout="vertical">
      <a-form-item label="显示字段名称" :rules="[{ required: true, message: '请输入显示字段名称' }]">
        <a-input v-model="renameForm.showLabel" placeholder="请输入显示字段名称" allow-clear />
      </a-form-item>
    </a-form>
  </a-modal>

  <!-- 数据格式弹窗 -->
  <a-modal v-model:visible="formatVisible" title="修改数据格式" :width="480" @ok="confirmFormat"
    @cancel="formatVisible = false" :mask-closable="false">
    <a-form :model="formatForm" layout="vertical">
      <!-- 数字格式 -->
      <template v-if="formatKind === 'number'">
        <a-form-item label="显示格式">
          <a-radio-group v-model="formatForm.percent">
            <a-radio :value="false">数值</a-radio>
            <a-radio :value="true">百分比</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="显示设置">
          <a-checkbox v-model="formatForm.thousandth">千分符</a-checkbox>
          <div class="scale-row">
            <a-checkbox v-model="formatForm.scale">小数位数</a-checkbox>
            <a-input-number v-show="formatForm.scale" v-model="formatForm.num" :min="1" :max="5" :step="1"
              style="width: 100px; margin-left: 10px" />
          </div>
        </a-form-item>
      </template>
      <!-- 日期格式 -->
      <template v-if="formatKind === 'dateTime'">
        <a-form-item label="显示格式">
          <a-select v-model="formatForm.dateType" placeholder="请选择显示格式">
            <a-option v-for="item in timeOptions" :key="item.value" :value="item.value" :label="item.label" />
          </a-select>
        </a-form-item>
      </template>
      <!-- 地址格式 -->
      <template v-if="formatKind === 'address'">
        <a-form-item label="显示格式">
          <a-space>
            <a-checkbox v-model="formatForm.province">省份</a-checkbox>
            <a-checkbox v-model="formatForm.city">市</a-checkbox>
            <a-checkbox v-model="formatForm.county">区县</a-checkbox>
            <a-checkbox v-model="formatForm.detail">详细</a-checkbox>
          </a-space>
        </a-form-item>
      </template>
    </a-form>
  </a-modal>

  <!-- 字段预警弹窗 -->
  <a-modal v-model:visible="warningVisible" title="字段预警" title-align="start" width="680px"
    class="condition-filter-modal" @ok="confirmWarning" @cancel="warningVisible = false" :mask-closable="false">
    <div class="condition-wrapper warning-wrapper">
      <div class="condition-list" v-if="warningPlans.length > 0">
        <div class="condition-item warning-plan-item" v-for="(item, idx) in warningPlans" :key="idx">
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
          <a-select v-if="warningForm.rulesOption.length > 0" v-model="warningForm.condition" allow-clear
            placeholder="等于" class="condition-rule" @change="handleWarningRuleChange">
            <a-option v-for="item in warningForm.rulesOption" :key="item.value" :label="item.name"
              :value="item.value" />
          </a-select>
          <formLogics v-if="warningForm.condition" :key="warningFormLogicsKey" :deptList="deptList" :datas="warningForm"
            class="condition-value" />
          <a-color-picker v-if="warningForm.condition" v-model="warningForm.color" size="small"
            class="warning-color-picker" />
        </div>
      </div>
    </div>
  </a-modal>

  <!-- 子表单配置弹窗 -->
  <a-modal v-model:visible="childrenVisible" title="子表单配置" :width="680" @ok="confirmChildren"
    @cancel="childrenVisible = false" :mask-closable="false">
    <div class="children-config">
      <div class="children-left">
        <template v-if="data.nodeInfo">
          <div v-for="(key, idx) in ['operator', 'status', 'duration']" :key="idx"
            :class="['children-tab', { active: childrenTab === key }]" @click="childrenTab = key">{{
              data.extra?.[key]?.showLabel || nodeTabItems[idx] }}</div>
        </template>
        <template v-else-if="data.extra && data.extra.children">
          <div v-for="(item, idx) in data.extra.children" :key="idx"
            :class="['children-tab', { active: childrenTab === idx }]" @click="childrenTab = idx">{{ item.showLabel }}
          </div>
        </template>
      </div>
      <div class="children-right">
        <a-form :model="currentChildForm" layout="vertical">
          <a-form-item label="显示字段名称">
            <a-input v-model="currentChildForm.showLabel" placeholder="请输入显示字段名称" allow-clear />
          </a-form-item>
          <a-form-item label="对齐方式">
            <a-select v-model="currentChildForm.align" placeholder="请选择" allow-clear>
              <a-option v-for="item in alignOptions" :key="item.value" :value="item.value" :label="item.label" />
            </a-select>
          </a-form-item>
        </a-form>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { IconClose, IconCheck, IconRight, IconEdit, IconDelete, IconPlus } from '@arco-design/web-vue/es/icon'
import { Message } from '@arco-design/web-vue'
import { getDataForm, setFormValue } from '@/data/data_form.js'
import formLogics from '@/components/formLogics/formLogics.vue'
import {
  buildWarningValueNames,
  formatWarningPlanValue,
  hydrateWarningFormDefault,
} from '@/utils/warningValueDisplay'
import { getReportFieldFormatKind } from '@/utils/reportFieldFormat'

interface FieldData {
  showLabel: string
  column?: string
  type?: string
  tag?: boolean
  align?: string
  flow?: boolean
  format?: {
    number?: any
    dateTime?: any
    address?: any
  }
  nodeInfo?: any
  values?: any[]
  warningPlans?: any[]
  extra?: any
  props?: any
}

const props = defineProps<{
  data: FieldData
  index: number
  deptList?: any
}>()

const emits = defineEmits<{
  deleteItem: [index: number]
  editName: [payload: { showLabel: string }]
  editAlign: [align: string]
  editTag: [tag: boolean]
  editType: [form: any, data: FieldData]
  editChild: [form: any]
  editWarningPlans: [plans: any[]]
  init: []
}>()

const alignOptions = [
  { label: '左', value: 'left' },
  { label: '中', value: 'center' },
  { label: '右', value: 'right' },
]

const timeOptions = [
  { label: '2011/12/01 00:00:00', value: 0 },
  { label: '2011/12/01', value: 1 },
  { label: '2011-12-01 00:00:00', value: 2 },
  { label: '2011-12-01', value: 3 },
  { label: '2011年12月01日 00:00:00', value: 4 },
  { label: '2011年12月01日 星期四', value: 5 },
  { label: '2011年12月', value: 6 },
  { label: '12月01日', value: 7 },
  { label: '星期四', value: 8 },
]

const nodeTabItems = ['节点负责人', '节点状态', '节点耗时']

const isSubformType = computed(() =>
  props.data.nodeInfo || props.data.type === 'SUBFORM' || props.data.type === 'RELATION_DATA'
)

const formatKind = computed(() => getReportFieldFormatKind(props.data))
const hasFormatConfig = computed(() => formatKind.value !== null)

// ---- 关闭/删除 ----
const handleClose = () => {
  emits('deleteItem', props.index)
}

// ---- 仅详情显示 ----
const toggleDetailOnly = () => {
  emits('editTag', !props.data.tag)
}

// ---- 对齐方式 ----
const changeAlign = (value: string) => {
  const newAlign = props.data.align === value ? '' : value
  emits('editAlign', newAlign)
}

// ---- 修改名称 ----
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

// ---- 数据格式 ----
const formatVisible = ref(false)
const formatForm = reactive({
  percent: false,
  thousandth: false,
  scale: false,
  num: 0,
  dateType: 0,
  province: false,
  city: false,
  county: false,
  detail: false,
})

const resetFormatForm = () => {
  Object.assign(formatForm, {
    percent: false,
    thousandth: false,
    scale: false,
    num: 0,
    dateType: 0,
    province: false,
    city: false,
    county: false,
    detail: false,
  })
}

const showFormatConfig = () => {
  resetFormatForm()

  if (formatKind.value === 'number') {
    const number = props.data.format?.number || {}
    formatForm.percent = number.percent ?? false
    formatForm.thousandth = number.thousandth ?? false
    formatForm.scale = number.scale ?? false
    formatForm.num = number.decimal ?? number.num ?? 0
  } else if (formatKind.value === 'dateTime') {
    const dateTime = props.data.format?.dateTime
    formatForm.dateType = typeof dateTime === 'number' ? dateTime : dateTime?.type ?? 0
  } else if (formatKind.value === 'address') {
    const addr = props.data.format?.address || {}
    formatForm.province = addr.province ?? false
    formatForm.city = addr.city ?? false
    formatForm.county = addr.county ?? false
    formatForm.detail = addr.detail ?? false
  }
  formatVisible.value = true
}

const confirmFormat = () => {
  emits('editType', JSON.parse(JSON.stringify(formatForm)), props.data)
  formatVisible.value = false
}

// ---- 字段预警 ----
const warningVisible = ref(false)
const warningEditing = ref(false)
const warningEditIndex = ref(-1)
const warningPlans = ref<any[]>([])
const warningFormLogicsKey = ref(0)

const symbolLabelMap: Record<string, string> = {
  EQ: '等于', NE: '不等于', IN: '等于其中之一', NOT_IN: '不等于其中之一',
  LIKE: '包含', NOT_LIKE: '不包含', IS_NULL: '为空', NOT_NULL: '不为空',
  GT: '大于', GE: '大于等于', LT: '小于', LE: '小于等于',
  BETWEEN: '范围', DYNAMIC_BETWEEN: '前',
}

const getSymbolLabel = (symbol: string) => symbolLabelMap[symbol] || symbol

const formatWarningValue = (item: any) =>
  formatWarningPlanValue(item, props.data.type || 'INPUT', {
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
  const fieldType = props.data.type || 'INPUT'
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

  const fieldType = props.data.type || 'INPUT'

  if (item.symbol === 'BETWEEN' && Array.isArray(item.value)) {
    if (['NUMBER', 'RATE', 'MONEY'].includes(fieldType)) {
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

const deleteWarningItem = (idx: number) => {
  warningPlans.value.splice(idx, 1)
}

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

  if (['NUMBER', 'RATE', 'MONEY'].includes(fieldType) && warningForm.condition === 'BETWEEN') {
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

    if (warningEditIndex.value >= 0) {
      warningPlans.value.splice(warningEditIndex.value, 1, plan)
    } else {
      warningPlans.value.push(plan)
    }
  }

  emits('editWarningPlans', JSON.parse(JSON.stringify(warningPlans.value)))
  warningVisible.value = false
}

// ---- 子表单配置 ----
const childrenVisible = ref(false)
const childrenTab = ref<string | number>(0)
const childrenForm = ref<Record<string, { showLabel: string; align: string }>>({})

const currentChildForm = computed({
  get: () => {
    const key = props.data.nodeInfo
      ? (['operator', 'status', 'duration'][typeof childrenTab.value === 'number' ? childrenTab.value : ['operator', 'status', 'duration'].indexOf(childrenTab.value)] ?? 'operator')
      : String(childrenTab.value)
    if (!childrenForm.value[key]) {
      childrenForm.value[key] = { showLabel: '', align: '' }
    }
    return childrenForm.value[key]
  },
  set: (val) => {
    const key = props.data.nodeInfo
      ? (['operator', 'status', 'duration'][typeof childrenTab.value === 'number' ? childrenTab.value : ['operator', 'status', 'duration'].indexOf(childrenTab.value)] ?? 'operator')
      : String(childrenTab.value)
    // 合并更新，保留未修改的字段
    if (childrenForm.value[key]) {
      childrenForm.value[key] = {
        ...childrenForm.value[key],
        ...val
      }
    } else {
      childrenForm.value[key] = { showLabel: '', align: '', ...val }
    }
  }
})

const showChildrenConfig = () => {
  childrenTab.value = 'operator'
  childrenForm.value = {}

  if (props.data.nodeInfo) {
    // 流程节点数据
    const nodeData = props.data.extra || {}
    childrenForm.value = {
      operator: { showLabel: nodeData.operator?.showLabel || '节点负责人', align: nodeData.operator?.align || '' },
      status: { showLabel: nodeData.status?.showLabel || '节点状态', align: nodeData.status?.align || '' },
      duration: { showLabel: nodeData.duration?.showLabel || '节点耗时', align: nodeData.duration?.align || '' },
    }
  } else if (props.data.extra && props.data.extra.children) {
    // 子表单/关联数据
    childrenTab.value = 0
    props.data.extra.children.forEach((child: any, idx: number) => {
      childrenForm.value[String(idx)] = {
        showLabel: child.showLabel || '',
        align: child.align || ''
      }
    })
  }

  childrenVisible.value = true
}

const confirmChildren = () => {
  if (props.data.nodeInfo) {
    // 流程节点
    emits('editChild', {
      operator: childrenForm.value.operator,
      status: childrenForm.value.status,
      duration: childrenForm.value.duration
    })
  } else {
    // 子表单/关联数据 - 更新 children 数组
    if (props.data.extra && props.data.extra.children) {
      const updatedChildren = props.data.extra.children.map((child: any, idx: number) => {
        const form = childrenForm.value[String(idx)]
        return {
          ...child,
          // 使用 ?? 替代 ||，确保空字符串 '' 能够正确保存
          showLabel: form?.showLabel ?? child.showLabel,
          align: form?.align ?? '' // 清除对齐方式后保存为空字符串，避免回退到原值
        }
      })
      emits('editChild', {
        ...props.data.extra,
        children: updatedChildren
      })
    }
  }
  childrenVisible.value = false
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
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #dbeafe;
  }

  .close-icon {
    font-size: 10px;
    color: #3b82f6;
    cursor: pointer;
    margin-left: 2px;

    &:hover {
      color: #ef4444;
    }
  }
}

.menu-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 120px;

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

.children-config {
  display: flex;
  min-height: 200px;

  .children-left {
    width: 176px;
    border: 1px solid #e5e5e5;
    border-radius: 4px;
    flex-shrink: 0;

    .children-tab {
      height: 42px;
      line-height: 42px;
      padding: 0 12px;
      cursor: pointer;
      font-size: 14px;
      transition: color 0.2s;

      &:hover {
        color: rgb(var(--primary-6));
      }

      &.active {
        color: rgb(var(--primary-6));
        background: rgb(var(--primary-1));
      }
    }
  }

  .children-right {
    flex: 1;
    margin-left: 24px;
  }
}
</style>
