<template>
  <div class="table">

    <!-- 未配置筛选条件时的空状态 -->
    <div v-if="!option?.filter?.id" class="empty-state-wrapper">
      <emptyBox embedded desc="暂未配置筛选条件，请先配置" />
    </div>

    <div :class="form.inputType == 'NUMBER' ? 'area' : 'div'" :style="'overflow:auto;height:' + (height) + 'px'" v-else>
      <div class="info">
        <div class="info-name">
          {{ option?.filter?.label }}
        </div>
        <a-dropdown trigger="click" @select="handleCommand">
          <span class="el-dropdown-link"> {{ form.symbolName }}<icon-down /> </span>
          <template #content>
            <a-doption v-for="item in rulesOption" :key="item.value" :value="item.value">
              {{ item.name }}
            </a-doption>
          </template>
        </a-dropdown>
      </div>

      <!-- 使用 formLogics 组件统一处理各种类型的输入 -->
      <div class="wan" v-if="show && form.symbol">
        <formLogics :deptList="deptList" style="width: 100%;" :datas="form" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { getDataForm, setDataFormList } from '@/data/data_form.js'
import { getAppForm } from '@/api/common'
import formLogics from '@/components/formLogics/formLogics.vue'
import emptyBox from '@/components/emptyBox/emptyBox.vue'
import { emptyReportConditionValue } from '@/utils/reportConditions'
import { resolveReportFilterTemporalConfig } from '@/utils/reportFilterTemporal'

const formFieldCache = new Map<string, Promise<any[]>>()

const loadFormFields = (appId: string) => {
  if (!formFieldCache.has(appId)) {
    formFieldCache.set(appId, getAppForm(appId).then((res: any) => {
      const formConfig = typeof res?.formConfig === 'string'
        ? JSON.parse(res.formConfig)
        : res?.formConfig
      const fields: any[] = []
      setDataFormList(formConfig?.formList || [], fields)
      return fields
    }).catch((error: unknown) => {
      formFieldCache.delete(appId)
      throw error
    }))
  }
  return formFieldCache.get(appId)!
}

const hasConfiguredTemporalFormat = (filter: any) => Boolean(
  filter?.props?.format
  || filter?.props?.['value-format']
  || filter?.props?.valueFormat
  || (typeof filter?.format === 'string' && filter.format)
  || filter?.extra?.format
)

interface Props {
  option: any
  height: number
  name: string
  id: number | string
  cacheComponents: any[]
  deptList?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  option: () => ({}),
  height: 200,
  id: 0,
  name: '',
  cacheComponents: () => [],
  deptList: () => []
})

const emit = defineEmits(['getSelectList'])

const rulesOption = ref<any[]>([])
const show = ref(true)

const form = reactive({
  symbol: '',
  condition: '',
  value: '' as any,
  inputType: '' as any,
  types: '',
  symbolName: '',
  max: '' as any,
  min: '' as any,
  row: {},
  column: '',
  format: '',
  componentType: '',
  default: [] as any[],
  xsArea: ''
})

let temporalFormatRequestId = 0

const hydrateLegacyTemporalFormat = async () => {
  const filter = props.option?.filter
  const fieldType = String(filter?.type || '').toUpperCase()
  if (!['DATE', 'TIME'].includes(fieldType)) return

  const column = String(filter?.column || filter?.field || filter?.id || '')
  if (['create_time', 'update_time'].includes(column) || hasConfiguredTemporalFormat(filter)) {
    form.format = resolveReportFilterTemporalConfig(filter).format
    return
  }

  const appId = String(props.option?.appId || '')
  if (!appId) return

  const requestId = ++temporalFormatRequestId
  const sourceFieldId = column.replace(/_(start|end)$/, '')
  try {
    const fields = await loadFormFields(appId)
    if (requestId !== temporalFormatRequestId) return
    const currentFilter = props.option?.filter
    const currentColumn = String(currentFilter?.column || currentFilter?.field || currentFilter?.id || '')
    if (currentColumn !== column || String(props.option?.appId || '') !== appId) return

    const sourceField = fields.find((item: any) => String(item?.id || item?.column || '') === sourceFieldId)
    if (!sourceField) return
    form.format = resolveReportFilterTemporalConfig({
      ...filter,
      props: sourceField.props,
    }).format
  } catch (error) {
    console.warn('Failed to restore legacy report filter date format:', error)
  }
}

const initRulesOption = () => {
  if (!props.option?.filter?.type) return

  const fieldType = props.option.filter.type
  const formDef = getDataForm(fieldType)

  if (formDef) {
    rulesOption.value = JSON.parse(JSON.stringify(formDef.default))
    form.inputType = fieldType
    form.symbolName = formDef.default[0]?.name
    form.symbol = formDef.default[0]?.value
    form.condition = formDef.default[0]?.value
    form.types = fieldType
    form.column = props.option.filter.column || props.option.filter.field || props.option.filter.id || ''
    form.format = resolveReportFilterTemporalConfig(props.option.filter).format
    form.componentType = fieldType
    void hydrateLegacyTemporalFormat()
  }

  // 地址/定位：将"属于/不属于"改成"包含/不包含"
  if (fieldType === 'ADDRESS' || fieldType === 'LOCATION') {
    rulesOption.value.forEach((v1: any) => {
      if (v1.name === '属于') {
        v1.name = '包含'
        v1.value = 'LIKE'
      } else if (v1.name === '不属于') {
        v1.name = '不包含'
        v1.value = 'NOT_LIKE'
      }
    })
    form.symbolName = rulesOption.value[0]?.name || form.symbolName
    form.symbol = rulesOption.value[0]?.value || form.symbol
  }

  // SELECT 类型：标记多选规则
  if (fieldType === 'SELECT') {
    rulesOption.value.forEach((v: any) => {
      if (v.name === '等于其中之一' || v.name === '不等于其中之一') {
        v.showItem = true
      }
    })
  }

  // 多选类型：自定义规则选项
  if (fieldType === 'SELECT_MULTIPLE' || fieldType === 'CHECKBOX') {
    rulesOption.value = [
      { type: 'in', value: 'IN', name: '等于其中之一' },
      { type: 'notIn', value: 'NOT_IN', name: '不等于其中之一' },
      { type: 'isNull', value: 'IS_NULL', name: '为空' },
      { type: 'notNull', value: 'NOT_NULL', name: '不为空' },
    ]
  }
  console.log(props.option.filter)
  if (['RADIO', 'SELECT'].includes(fieldType) && props.option.filter.extra?.options) {
    form.default = props.option.filter.extra.options
  } else if (['CHECKBOX', 'SELECT_MULTIPLE'].includes(fieldType) && props.option.filter.extra?.options) {
    form.default = props.option.filter.extra.options
  } else if (['DEPT_MULTIPLE', 'USER_MULTIPLE', 'DEPT', 'USER'].includes(fieldType)) {
    form.default = props.option.filter.extra.options
  } else {
    form.default = props.option.filter.extra || []
  }
  // 设置默认值
  // form.default = []
}

const setNumber = () => {
  initRulesOption()
}

// 组件挂载时初始化规则选项
onMounted(() => {
  initRulesOption()
})

const setItem = () => {
  if (!props.option?.filter) return
  if (!form.symbol) return
  let value = form.value
  let extra: any = { format: form.format }

  // 数值类型：BETWEEN 规则使用 min/max
  if (['MONEY', 'RATE', 'NUMBER', 'DOUBLE', 'LONG'].includes(form.inputType) && form.symbol === 'BETWEEN') {
    value = form.min === '' || form.max === '' ? [] : [Number(form.min), Number(form.max)]
  }

  // 人员/部门：单值
  if (['USER', 'DEPT'].includes(form.componentType)) {
    if (form.symbol === 'EQ' || form.symbol === 'NE') {
      if (form.default && form.default[0]?.id) {
        value = form.default[0].id
      }
    } else if (form.symbol === 'IN' || form.symbol === 'NOT_IN') {
      if (Array.isArray(form.default)) {
        value = form.default.map((v: any) => v.id)
      }
    }
  }

  // 人员/部门：多选
  if (['USER_MULTIPLE', 'DEPT_MULTIPLE'].includes(form.componentType)) {
    if (Array.isArray(form.default)) {
      value = form.default.map((v: any) => v.id)
    }
  }

  // 空值判断：值为 null
  if (form.symbol === 'IS_NULL' || form.symbol === 'NOT_NULL') {
    value = null
  }

  // 地址/定位：LIKE / NOT_LIKE 时把详细地址拼进去
  if ((form.inputType === 'ADDRESS' || form.inputType === 'LOCATION') &&
    (form.symbol === 'LIKE' || form.symbol === 'NOT_LIKE')) {
    if (Array.isArray(form.value) && form.xsArea) {
      value = [...form.value, form.xsArea]
    }
  }

  const params: any = {
    id: props.option.filter.id,
    label: props.option.filter.label,
    fieldName: props.option.filter.column,
    type: props.option.filter.type,
    componentType: form.componentType,
    pid: props.id,
    symbol: form.symbol === 'NOT_NULL' ? 'IS_NOT_NULL' : form.symbol,
    value: value,
    extra: extra
  }
  emit('getSelectList', params, props.option?.moduleConfigId, props.id)
}

const reset = () => {
  show.value = false
  form.xsArea = ''
  // 对应 data_form.js 的 setFormValue 逻辑：部分类型需要数组
  if (form.inputType == 7 || form.inputType == 16 || form.inputType == 4 || form.inputType == 5 || form.symbol == 'IN' || form.symbol == 'NOT_IN' || form.symbol == 'BETWEEN') {
    form.value = [] as any
  } else {
    form.value = '' as any
  }
  setTimeout(() => {
    show.value = true
  }, 0)
}

const handleCommand = (command: any) => {
  if (form.symbol === command) return
  isChangingCondition = true
  form.min = ''
  form.max = ''
  form.xsArea = ''
  show.value = false
  rulesOption.value.forEach((v: any) => {
    if (v.value === command) {
      form.symbolName = v.name
    }
  })
  setTimeout(() => {
    show.value = true
  }, 100)
  form.symbol = command
  form.condition = command
  form.value = emptyReportConditionValue(command, form.inputType)
  if (['USER', 'DEPT', 'USER_MULTIPLE', 'DEPT_MULTIPLE'].includes(form.inputType)) {
    form.default = []
  }
  isChangingCondition = false
  setItem()
}

let isChangingCondition = false
watch(() => form.value, () => {
  if (!isChangingCondition) setItem()
}, { deep: true, flush: 'sync' })
watch(() => [form.min, form.max], () => {
  if (!isChangingCondition && form.symbol === 'BETWEEN' && ['MONEY', 'RATE', 'NUMBER', 'DOUBLE', 'LONG'].includes(form.inputType)) {
    setItem()
  }
}, { flush: 'sync' })
watch(() => props.option, () => {
  console.log('props.option', props.option)
  initRulesOption()
}, { deep: true })
watch(() => form.default, (newVal, oldVal) => {
  if (!isChangingCondition && ['USER_MULTIPLE', 'DEPT_MULTIPLE', 'USER', 'DEPT'].includes(form.componentType) && Array.isArray(form.default) && (form.default.length > 0 || (oldVal && oldVal.length >= 0 && (!newVal || newVal.length === 0)))) {

    setItem()
  }
}, { deep: true, flush: 'sync' })

watch(() => props.cacheComponents, () => {
  setNumber()
})
</script>

<style lang="scss" scoped>
.el-dropdown-link {
  cursor: pointer;
}

::v-deep {
  .inputLogics {
    margin-left: 0 !important;
  }

  .selectLogics {
    margin-left: 0 !important;
  }

  .dateLogics {
    margin-left: 0 !important;
  }

  .userLogics {
    margin-left: 0 !important;
  }

  .numberLogics {
    margin-left: 0 !important;
  }

  .timeLogics {
    margin-left: 0 !important;
  }
}

.table {
  z-index: 10000;

  .title {
    font-size: 20px;
    color: #191919;
    margin-bottom: 16px;
    position: relative;
    z-index: 1998;
  }

  .div {
    position: relative;
    z-index: 1998;
  }

  .pagination {
    margin-top: 10px;
    text-align: right;
  }
}

.item {
  width: 100%;
}

:deep(input::-webkit-outer-spin-button),
:deep(input::-webkit-inner-spin-button) {
  -webkit-appearance: none !important;
}

:deep(input[type="number"]) {
  -moz-appearance: textfield;
}



.info {
  display: flex;
  margin-bottom: 10px;

  &-name {
    margin-right: 10px;
  }
}

.tip-box {
  min-height: 40px;
  border: 1px solid #DCDFE6;
  border-radius: 5px;
  padding: 5px;
  background-color: #fff;
  color: #606266;
  margin-top: 5px;
  position: relative;
  z-index: 10000000000000;

  .tag {
    margin: 5px;
  }

  .setTip {
    line-height: 30px;
    padding: 0 15px;
  }

}

.area-box {
  width: 100%;
}

.bottom-box {
  margin-top: 10px;
}

.empty-state-wrapper {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 8px;
  min-height: 100px;
}
</style>
