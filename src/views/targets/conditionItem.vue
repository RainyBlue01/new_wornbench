<template>
  <a-dropdown trigger="click">
    <div class="condition-tag">
      <span class="condition-label">{{ data.showLabel }}</span>
      <span class="condition-rule" v-if="data.symbol">{{ getSymbolLabel(data.symbol) }}</span>
      <icon-close class="close-icon" @click.stop="handleClose" />
    </div>
    <template #content>
      <a-doption @click="openFilter">修改</a-doption>
    </template>
  </a-dropdown>

  <a-modal
    v-model:visible="filterVisible"
    :title="filterTitle"
    width="680px"
    class="condition-filter-modal"
    title-align="left"
    @ok="confirmFilter"
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

interface ConditionData {
  column: string
  showLabel: string
  type: string
  symbol?: string
  value?: any
  props?: any
}

const props = defineProps<{
  data: ConditionData
  index: number
  deptList?: any
}>()

const emits = defineEmits<{
  deleteCondition: [index: number]
  updateFilter: [index: number, payload: { symbol: string; value: any; extra?: any }]
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
const getSymbolLabel = (s: string) => symbolLabelMap[s] || s

const handleClose = () => emits('deleteCondition', props.index)

// ---- 弹窗 ----
const filterVisible = ref(false)
const filterTitle = ref('修改过滤条件')
const filterForm = reactive<any>({
  condition: '',
  value: '',
  rulesOption: [],
  inputType: '',
  default: [],
  min: '',
  max: '',
})

const initRulesOption = () => {
  const fieldType = props.data.type || 'INPUT'
  const formDef = getDataForm(fieldType)
  if (formDef) {
    filterForm.rulesOption = JSON.parse(JSON.stringify(formDef.default))
    filterForm.inputType = fieldType
  }

  if (['RADIO', 'SELECT', 'CHECKBOX', 'SELECT_MULTIPLE'].includes(fieldType) && props.data.extra?.options) {
    filterForm.default = props.data.extra.options
  } else {
    filterForm.default = []
  }
}

const openFilter = () => {
  initRulesOption()
  if (props.data.symbol) {
    filterForm.condition = props.data.symbol
    filterForm.value = props.data.value ?? ''
    filterTitle.value = '修改过滤条件'
  } else {
    filterForm.condition = ''
    filterForm.value = ''
    filterTitle.value = '新增过滤条件'
  }
  filterVisible.value = true
}

const handleRuleChange = () => setFormValue(filterForm)

const confirmFilter = () => {
  if (!filterForm.condition) return
  let value = filterForm.value
  if (filterForm.condition === 'IS_NULL' || filterForm.condition === 'NOT_NULL') value = null
  emits('updateFilter', props.index, { symbol: filterForm.condition, value })
  filterVisible.value = false
}

defineExpose({ openFilter })
</script>

<style lang="scss" scoped>
@use '@/styles/filter-condition-form.scss';

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

