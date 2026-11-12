export const INPUT_VALUE_TYPES = [
  { label: '字段', value: 0 },
  { label: '自定义', value: 1 },
] as const

export interface BtnActionInputItem {
  name: string
  type: number
  fieldCode?: string
  defaultValue?: string
  isSubForm?: boolean
  children?: BtnActionInputItem[]
  parentName?: string
}

export interface BtnActionOutputItem {
  name: string
  fieldCode?: string
  isSubForm?: boolean
  children?: BtnActionOutputItem[]
  parentName?: string
}

export interface BtnActionModel {
  connectorId: number | string
  connectorName: string
  sceneId: number | string
  sceneName: string
  input: BtnActionInputItem[]
  output: BtnActionOutputItem[]
  enableOutput: boolean
}

export const DEFAULT_BTN_ACTION: BtnActionModel = {
  connectorId: '',
  connectorName: '',
  sceneId: '',
  sceneName: '',
  input: [],
  output: [],
  enableOutput: false,
}

export function normalizeBtnAction(btnAction: unknown): BtnActionModel {
  if (!btnAction || typeof btnAction !== 'object') {
    return { ...DEFAULT_BTN_ACTION }
  }
  const action = btnAction as Partial<BtnActionModel>
  return {
    connectorId: action.connectorId ?? '',
    connectorName: action.connectorName ?? '',
    sceneId: action.sceneId ?? '',
    sceneName: action.sceneName ?? '',
    input: Array.isArray(action.input) ? action.input : [],
    output: Array.isArray(action.output) ? action.output : [],
    enableOutput: !!action.enableOutput,
  }
}

function getSubformFieldKey(fieldCode: string): string {
  return fieldCode.includes('.') ? fieldCode.split('.').pop()! : fieldCode
}

export function resolveInputItemValue(
  item: BtnActionInputItem,
  formValues: Record<string, any>,
): any {
  if (item.type === 1) {
    return item.defaultValue
  }
  if (!item.fieldCode) return undefined
  return formValues[item.fieldCode]
}

function buildSubformSubmitData(
  children: BtnActionInputItem[],
  subformValue: any,
): any {
  if (!children?.length) return undefined

  if (Array.isArray(subformValue)) {
    return subformValue.map((row) => {
      const rowData: Record<string, any> = {}
      children.forEach((child) => {
        if (!child.name) return
        if (child.type === 1) {
          rowData[child.name] = child.defaultValue
          return
        }
        if (!child.fieldCode) return
        const key = getSubformFieldKey(child.fieldCode)
        const val = row?.[key] ?? row?.[child.fieldCode]
        if (val !== undefined) rowData[child.name] = val
      })
      return rowData
    })
  }

  const rowData: Record<string, any> = {}
  children.forEach((child) => {
    if (!child.name) return
    if (child.type === 1) {
      rowData[child.name] = child.defaultValue
      return
    }
    if (!child.fieldCode) return
    const key = getSubformFieldKey(child.fieldCode)
    const val = subformValue?.[key] ?? subformValue?.[child.fieldCode]
    if (val !== undefined) rowData[child.name] = val
  })
  return rowData
}

function hasMeaningfulValue(val: any): boolean {
  if (val === undefined || val === null || val === '') return false
  if (Array.isArray(val)) return val.length > 0
  if (typeof val === 'object') return Object.keys(val).length > 0
  return true
}

export function buildButtonSubmitData(
  input: BtnActionInputItem[],
  formValues: Record<string, any>,
): Record<string, any> {
  const submitData: Record<string, any> = {}
  if (!Array.isArray(input)) return submitData

  input.forEach((item) => {
    console.log(item)
    if (!item.fieldCode || item.parentName) return

    if (item.children?.length) {
      const subformValue =
        item.type === 0 && item.fieldCode ? formValues[item.fieldCode] : undefined
      const nested = buildSubformSubmitData(item.children, subformValue)
      if (hasMeaningfulValue(nested)) {
        submitData[item.fieldCode] = nested
      }
      return
    }

    const val = resolveInputItemValue(item, formValues)
    if (hasMeaningfulValue(val)) {
      submitData[item.fieldCode] = val
    }
  })

  return submitData
}

export function findFormField(formList: any[], fieldCode: string): any | null {
  let found: any = null

  const walk = (list: any[]) => {
    for (const item of list) {
      if (found) return
      if (item.id === fieldCode) {
        found = item
        return
      }
      if (item.children?.length) walk(item.children)
      if (item.type === 'SUBFORM' && Array.isArray(item.list)) {
        for (const row of item.list) {
          if (Array.isArray(row)) walk(row)
          if (found) return
        }
      }
    }
  }

  walk(formList)
  return found
}

function applySubformOutput(
  responseValue: any,
  outputItem: BtnActionOutputItem,
  formList: any[],
  filterData?: (field: any) => void,
) {
  if (!outputItem.fieldCode || !outputItem.children?.length) return

  const subformField = findFormField(formList, outputItem.fieldCode)
  if (!subformField) return

  const rows = Array.isArray(responseValue) ? responseValue : [responseValue]

  if (subformField.list?.length && Array.isArray(subformField.list)) {
    rows.forEach((row, rowIndex) => {
      const formRow = subformField.list[rowIndex]
      if (!Array.isArray(formRow)) return
      outputItem.children!.forEach((child) => {
        if (!child.fieldCode || !child.name) return
        const val = row[child.name]
        if (val === undefined) return
        const key = getSubformFieldKey(child.fieldCode)
        const target = formRow.find(
          (f: any) => f.id === child.fieldCode || getSubformFieldKey(f.id) === key,
        )
        if (target?.props) {
          target.props.value = val
          filterData?.(target)
        }
      })
    })
    filterData?.(subformField)
    return
  }

  if (subformField.props) {
    const valueObj: Record<string, any> = { ...(subformField.props.value || {}) }
    const row = rows[0] || {}
    outputItem.children.forEach((child) => {
      if (!child.fieldCode || !child.name) return
      const val = row[child.name]
      if (val === undefined) return
      valueObj[getSubformFieldKey(child.fieldCode)] = val
    })
    subformField.props.value = valueObj
    filterData?.(subformField)
  }
}

export function applyButtonOutput(
  response: Record<string, any>,
  output: BtnActionOutputItem[],
  enableOutput: boolean,
  formList: any[],
  filterData?: (field: any) => void,
) {
  if (!enableOutput || !response || typeof response !== 'object' || !Array.isArray(output)) {
    return
  }

  output.forEach((item) => {
    if (!item.name || item.parentName) return

    const val = response[item.name]
    if (val === undefined) return

    if (item.children?.length) {
      applySubformOutput(val, item, formList, filterData)
      return
    }

    if (!item.fieldCode) return
    const target = findFormField(formList, item.fieldCode)
    if (target?.props) {
      target.props.value = val
      filterData?.(target)
    }
  })

  filterData?.(undefined)
}

export function collectFormValues(formList: any[]): Record<string, any> {
  const result: Record<string, any> = {}

  const walk = (list: any[]) => {
    list.forEach((item) => {
      if (item.id && item.props && 'value' in item.props) {
        if (item.type === 'SUBFORM') {
          if (item.list?.length) {
            result[item.id] = item.list.map((row: any[]) => {
              const rowObj: Record<string, any> = {}
              if (Array.isArray(row)) {
                row.forEach((field: any) => {
                  const key = getSubformFieldKey(field.id)
                  if (key) rowObj[key] = field.props?.value
                })
              }
              return rowObj
            })
          } else if (item.props.value) {
            result[item.id] = item.props.value
          }
        } else {
          result[item.id] = item.props.value
        }
      }
      if (item.children?.length) walk(item.children)
    })
  }

  walk(formList)
  return result
}
