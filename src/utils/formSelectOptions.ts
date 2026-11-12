import { selectComponentDataApi } from '@/api/original/index'
import type { SelectComponentDataItem } from '@/types/selectComponentData'
import { serializeFormConditionValue } from './formConditionValue'

export interface SelectOption {
  label: string
  value: string | number
}

export function isOtherFormDataSource(props: Record<string, any> | undefined) {
  return Number(props?.dataSourceType) === 2
}

function extractDisplayValue(raw: any): string {
  if (raw == null || raw === '') return ''
  if (typeof raw === 'object') {
    if (raw.label != null) return String(raw.label)
    if (raw.nickname != null) return String(raw.nickname)
    if (raw.deptName != null) return String(raw.deptName)
    if (raw.start != null && raw.end != null) return `${raw.start}-${raw.end}`
    if (Array.isArray(raw)) {
      return raw.map((item) => extractDisplayValue(item)).filter(Boolean).join(',')
    }
    return JSON.stringify(raw)
  }
  return String(raw)
}

function resolveFormFieldValue(formValue: any, inputType?: string): any {
  if (formValue == null || formValue === '') return formValue
  if (inputType === 'RADIO' || inputType === 'SELECT' || inputType === 'SWITCH') {
    if (typeof formValue === 'object' && formValue.value != null) return formValue.value
  }
  if (inputType === 'CHECKBOX' || inputType === 'SELECT_MULTIPLE') {
    if (Array.isArray(formValue)) {
      return formValue.map((v) => (typeof v === 'object' && v?.value != null ? v.value : v))
    }
  }
  if (inputType === 'USER' && typeof formValue === 'object') return formValue.id ?? formValue
  if (inputType === 'DEPT' && typeof formValue === 'object') return formValue.id ?? formValue
  if (inputType === 'DATE_INTERVAL' || inputType === 'TIME_INTERVAL') {
    if (typeof formValue === 'object') return formValue
  }
  return formValue
}

export function buildSelectFilterConditions(conditionList: any[], form: Record<string, any>) {
  const conditions: any[] = []
  if (!Array.isArray(conditionList)) return conditions

  conditionList.forEach((item) => {
    if (!item.relationField || !item.symbol) return
    if (item.symbol !== 'IS_NULL' && item.symbol !== 'NOT_NULL' && !item.field) return

    const formVal = item.field ? form[item.field] : undefined
    if (item.symbol !== 'IS_NULL' && item.symbol !== 'NOT_NULL' && (formVal == null || formVal === '')) {
      return
    }

    conditions.push({
      field: item.relationField,
      symbol: item.symbol,
      value: item.symbol === 'IS_NULL' || item.symbol === 'NOT_NULL'
        ? undefined
        : serializeFormConditionValue(item.symbol, resolveFormFieldValue(formVal, item.inputType)),
      extra: {},
    })
  })
  return conditions
}

function mapSelectComponentRecords(
  records: SelectComponentDataItem[],
  displayFieldKey: string,
  sortField: string,
  sortOrder: string,
): SelectOption[] {
  const sorted = [...records]

  const seen = new Set<string>()
  const options: SelectOption[] = []

  sorted.forEach((record) => {
    const label = extractDisplayValue(record[displayFieldKey])
    if (!label) return
    const value = record.id
    const key = String(value)
    if (seen.has(key)) return
    seen.add(key)
    options.push({ label, value })
  })

  return options
}

export async function loadSelectFormOptions(
  comDes: any,
  _form: Record<string, any>,
  currentFormId?: string,
  withTempProps = false,
): Promise<SelectOption[]> {
  const props = comDes?.props
  if (!props || !isOtherFormDataSource(props)) return props?.options || []

  const formId = currentFormId ? String(currentFormId) : ''
  const field = comDes?.id ? String(comDes.id) : ''
  if (!formId || !field) return []

  const displayFieldKey = props.sourceFieldCode || field

  try {
    const params: any = { formId, field }
    if (props.conditionList?.length) {
      const data: Record<string, any> = {}
      props.conditionList.forEach((item: any) => {
        if (item.field) {
          data[item.field] = serializeFormConditionValue(item.symbol, _form[item.field] ?? '')
        }
      })
      params.data = data
    }
    if (withTempProps) {
      try {
        params.tempProps = JSON.parse(JSON.stringify(props))
      } catch {
        params.tempProps = { ...props }
      }
    }
    const records = await selectComponentDataApi(params)
    if (!Array.isArray(records) || records.length === 0) return []

    return mapSelectComponentRecords(
      records,
      displayFieldKey,
      props.sortField || 'create_time',
      props.sortOrder || 'desc',
    )
  } catch {
    return []
  }
}

/** 刷新下拉组件选项并写回 props.options */
export async function refreshSelectComponentOptions(
  comDes: any,
  formConfs: any,
): Promise<SelectOption[]> {
  if (!isOtherFormDataSource(comDes?.props)) return comDes?.props?.options || []
  if (!comDes?.props?.sourceFormCode || !comDes?.props?.sourceFieldCode) {
    return comDes?.props?.options || []
  }

  const form = buildFormSnapshot(formConfs?.formList || [])
  const options = await loadSelectFormOptions(
    comDes,
    form,
    formConfs?.id ? String(formConfs.id) : undefined,
    !!formConfs?.useTempProps,
  )
  if (comDes?.props) {
    comDes.props.options = options
  }
  return options
}

function walkFormList(formList: any[], visitor: (item: any) => void) {
  if (!Array.isArray(formList)) return
  formList.forEach((item) => {
    visitor(item)
    if (item.children) walkFormList(item.children, visitor)
    if (item.list) item.list.forEach((row: any[]) => walkFormList(row, visitor))
  })
}

export function buildFormSnapshot(formList: any[], form: Record<string, any> = {}) {
  const result = { ...form }
  walkFormList(formList, (item) => {
    if (item.id && item.props?.value !== undefined && item.props?.value !== '') {
      result[item.id] = item.props.value
    }
  })
  return result
}

export async function applySelectFormOptions(
  formList: any[],
  form: Record<string, any>,
  currentFormId: string,
  changedFieldId?: string,
  withTempProps = false,
) {
  const tasks: Promise<void>[] = []
  walkFormList(formList, (item) => {
    if (item.type !== 'SELECT' && item.type !== 'SELECT_MULTIPLE') return
    if (!isOtherFormDataSource(item.props)) return
    if (!currentFormId || !item.id) return

    const conds = item.props.conditionList || []
    const shouldLoad = !changedFieldId
      || !conds.length
      || conds.some((c: any) => c.field === changedFieldId)

    if (!shouldLoad) return

    tasks.push(
      loadSelectFormOptions(item, form, currentFormId, withTempProps).then((opts) => {
        item.props.options = opts
      }),
    )
  })
  await Promise.all(tasks)
}
