<template>
  <a-dropdown trigger="click">
    <div class="condition-tag">
      <span class="condition-label">{{ data.showLabel }}</span>
      <span class="condition-rule" v-if="data.condition">{{ getSymbolLabel(data.condition) }}</span>
      <icon-close class="close-icon" @click.stop="handleClose" />
    </div>
    <template #content>
      <a-doption @click="openFilter">修改</a-doption>
    </template>
  </a-dropdown>

  <!-- 过滤条件编辑弹窗 -->
  <a-modal
    v-model:visible="filterVisible"
    :title="filterTitle"
    width="680px"
    class="condition-filter-modal"
    @ok="confirmFilter"
    title-align="left"
    @cancel="filterVisible = false"
    :mask-closable="false"
  >
    <div class="condition-wrapper">
      <div class="condition-list">
        <div class="condition-item">
          <div class="condition-field condition-field--readonly">{{ data.showLabel }}</div>
          <a-select
            v-if="filterForm.rulesOption.length > 0"
            v-model="filterForm.condition"
            allow-clear
            placeholder="等于"
            class="condition-rule"
            @change="handleRuleChange"
          >
            <a-option
              v-for="item in filterForm.rulesOption"
              :key="item.value"
              :label="item.name"
              :value="item.value"
            />
          </a-select>
          <formLogics
            v-if="filterForm.condition"
            :deptList="deptList"
            :datas="filterForm"
            class="condition-value"
          />
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { IconClose } from '@arco-design/web-vue/es/icon'
import { getDataForm, setFormValue } from '@/data/data_form.js'
import formLogics from '@/components/formLogics/formLogics.vue'
import { resolveReportFilterTemporalConfig } from '@/utils/reportFilterTemporal'

interface ConditionData {
  id?: string
  column: string
  showLabel: string
  label?: string
  type: string
  condition?: string
  value?: any
  rulesOption?: any[]
  inputType?: string
  default?: any
  props?: any
  min?: any
  max?: any
}

const props = defineProps<{
  data: ConditionData
  index: number
  deptList?: any
  formList?: any[]
}>()

const emits = defineEmits<{
  deleteCondition: [index: number]
  updateFilter: [index: number, payload: { condition: string; value: any; extra?: any }]
}>()

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
  DYNAMIC_BETWEEN: '动态范围',
}

const getSymbolLabel = (symbol: string) => {
  return symbolLabelMap[symbol] || symbol
}

const handleClose = () => {
  emits('deleteCondition', props.index)
}

// ---- 过滤条件弹窗 ----
const filterVisible = ref(false)
const filterTitle = ref('修改过滤条件')
const filterForm = reactive<{
  condition: string
  value: any
  rulesOption: any[]
  inputType: string
  default: any
  min: any
  max: any
  column: string
  extra?: any
  format?: string
}>({
  condition: '',
  value: '',
  rulesOption: [],
  inputType: '',
  default: [],
  min: '',
  max: '',
  column: '',
})

const initRulesOption = () => {
  const fieldType = props.data.type
  const formDef = getDataForm(fieldType)
  if (formDef) {
    filterForm.rulesOption = JSON.parse(JSON.stringify(formDef.default))
    filterForm.inputType = fieldType
    filterForm.extra = props.data.extra
    filterForm.column = props.data.column || props.data.id || ''
  }

  if (fieldType === 'ADDRESS' || fieldType === 'LOCATION') {
    filterForm.rulesOption.forEach((v: any) => {
      if (v.name === '属于') {
        v.name = '包含'
        v.value = 'LIKE'
      } else if (v.name === '不属于') {
        v.name = '不包含'
        v.value = 'NOT_LIKE'
      }
    })
  }

  if (fieldType === 'SELECT') {
    filterForm.rulesOption.forEach((v: any) => {
      if (v.name === '等于其中之一' || v.name === '不等于其中之一') {
        v.showItem = true
      }
    })
  }

  if (fieldType === 'SELECT_MULTIPLE' || fieldType === 'CHECKBOX') {
    filterForm.rulesOption = [
      { type: 'in', value: 'IN', name: '等于其中之一' },
      { type: 'notIn', value: 'NOT_IN', name: '不等于其中之一' },
      { type: 'isNull', value: 'IS_NULL', name: '为空' },
      { type: 'notNull', value: 'NOT_NULL', name: '不为空' },
    ]
  }

  if (['RADIO', 'SELECT'].includes(fieldType) && props.data.extra?.options) {

    filterForm.default = props.data.extra.options
  } else if (['CHECKBOX', 'SELECT_MULTIPLE'].includes(fieldType) && props.data.extra?.options) {
    filterForm.default = props.data.extra.options
  } else if (['DEPT_MULTIPLE', 'USER_MULTIPLE','USER','DEPT'].includes(fieldType)) {
    filterForm.default = []
  } else  {
    filterForm.default = props.data.extra || []
  }

  if (fieldType === 'DATE' || fieldType === 'TIME') {
    filterForm.format = resolveReportFilterTemporalConfig(props.data).format
  }
}

const openFilter = () => {
  initRulesOption()

  if (props.data.condition) {
    filterForm.condition = props.data.condition
    filterForm.value = props.data.value ?? ''
    filterForm.min = props.data.min ?? ''
    filterForm.max = props.data.max ?? ''
    filterTitle.value = '修改过滤条件'
  } else {
    filterForm.condition = ''
    filterForm.value = ''
    filterForm.min = ''
    filterForm.max = ''
    filterTitle.value = '新增过滤条件'
  }

  filterVisible.value = true
}

const handleRuleChange = () => {
  setFormValue(filterForm)
}

const confirmFilter = () => {
  if (!filterForm.condition) {
    return
  }

  let value = filterForm.value
  let extra: any = {}

  if (
    ['MONEY', 'RATE', 'NUMBER'].includes(props.data.type) &&
    filterForm.condition === 'BETWEEN'
  ) {
    value = [filterForm.min, filterForm.max]
  }

  if (['USER', 'DEPT'].includes(props.data.type)) {
    if (filterForm.condition === 'EQ' || filterForm.condition === 'NE') {
      if (filterForm.default && filterForm.default[0]?.id) {
        value = filterForm.default[0].id
      }
    } else if (filterForm.condition === 'IN' || filterForm.condition === 'NOT_IN') {
      if (Array.isArray(filterForm.default)) {
        value = filterForm.default.map((v: any) => v.id)
      }
    }
  }

  if (['USER_MULTIPLE', 'DEPT_MULTIPLE'].includes(props.data.type)) {
    if (Array.isArray(filterForm.default)) {
      value = filterForm.default.map((v: any) => v.id)
    }
  }

  if (filterForm.condition === 'IS_NULL' || filterForm.condition === 'NOT_NULL') {
    value = null
  }

  emits('updateFilter', props.index, {
    condition: filterForm.condition,
    value: value,
    extra: filterForm.extra,
  })

  filterVisible.value = false
}

defineExpose({ openFilter })
</script>

<style lang="scss" scoped>
@use '@/styles/filter-condition-form.scss';
@use "styles/textColor.scss" as textColor;

.condition-tag {
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

  .condition-label {
    white-space: nowrap;
  }

  .condition-rule {
    font-size: 11px;
    color: #64748b;
    background: rgba(59, 130, 246, 0.12);
    padding: 1px 6px;
    border-radius: 3px;
    white-space: nowrap;
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
</style>
