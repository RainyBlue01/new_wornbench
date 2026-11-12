import { linkageComponentDataApi } from '@/api/original/index'
import type { FormLinkageConfig } from '@/types/linkageComponentData'
import { serializeFormConditionValue } from './formConditionValue'

const SINGLE_VALUE_TYPES = new Set([
  'INPUT',
  'TEXTAREA',
  'NUMBER',
  'DECIMAL',
  'DATE',
  'TIME',
  'PHONE',
  'EMAIL',
  'URL',
  'RATE',
  'SLIDER',
])

function walkFormList(formList: any[], visitor: (item: any) => void) {
  if (!Array.isArray(formList)) return
  formList.forEach((item) => {
    visitor(item)
    if (item.children) walkFormList(item.children, visitor)
    if (item.list) {
      item.list.forEach((row: any[]) => walkFormList(row, visitor))
    }
  })
}

function normalizeLegacyLinkage(dataLinkage: any): FormLinkageConfig | null {
  if (!dataLinkage?.sourceFormCode) return null
  return {
    enable: true,
    mode: dataLinkage.conditionType === 'or' ? 'or' : 'and',
    sourceFormCode: dataLinkage.sourceFormCode,
    logicConditions: (dataLinkage.conditionList || []).map((item: any) => ({
      field: item.curFieldCode,
      relationField: item.relationFieldCode,
      symbol: item.symbol,
      inputType: item.inputType,
    })),
    relationTrigger: dataLinkage.relationTrigger,
  }
}

export function getLinkageConfig(props: Record<string, any> | undefined): FormLinkageConfig | null {
  if (!props) return null
  if (props.linkage?.enable && props.linkage.sourceFormCode) {
    return props.linkage
  }
  return normalizeLegacyLinkage(props.dataLinkage)
}

function hasSubmitValue(value: any): boolean {
  if (value == null || value === '') return false
  if (Array.isArray(value)) return value.length > 0
  return true
}

export function buildLinkageSubmitData(
  logicConditions: FormLinkageConfig['logicConditions'],
  form: Record<string, any>,
) {
  const data: Record<string, any> = {}
  if (!Array.isArray(logicConditions)) return data

  logicConditions.forEach((item) => {
    if (!item?.field) return
    const value = form[item.field]
    if (hasSubmitValue(value)) {
      data[item.field] = serializeFormConditionValue(item.symbol, value)
    }
  })
  return data
}

function shouldRefreshLinkage(
  linkage: FormLinkageConfig,
  changedFieldId?: string,
) {
  if (!changedFieldId) return true
  const conditions = linkage.logicConditions || []
  if (!conditions.length) return true
  return conditions.some((item) => item.field === changedFieldId)
}

export function resolveLinkageValue(type: string, res: any) {
  if (res == null) return SINGLE_VALUE_TYPES.has(type) ? '' : []
  if (SINGLE_VALUE_TYPES.has(type)) {
    if (Array.isArray(res)) return res.length > 0 ? res[0] : ''
    return res
  }
  return Array.isArray(res) ? res : [res]
}

function applyLinkageValue(item: any, value: any, form: Record<string, any>) {
  item.props.defaultValue = value
  item.props.value = value
  if (item.id) {
    form[item.id] = value
  }
}

export async function loadLinkageValue(
  item: any,
  form: Record<string, any>,
  formId: string,
  _withTempProps = false,
  appId?: string | number,
) {
  const linkage = getLinkageConfig(item?.props)
  if (!linkage?.sourceFormCode || !linkage.relationTrigger?.sourceFieldCode || !item?.id) {
    return
  }

  const data = buildLinkageSubmitData(linkage.logicConditions, form)
  if (!Object.keys(data).length) {
    applyLinkageValue(item, resolveLinkageValue(item.type, null), form)
    return
  }

  const params = {
    ...(appId ? { appId } : {}),
    formId,
    field: String(item.id),
    data,
  }

  try {
    const res = await linkageComponentDataApi(params)
    applyLinkageValue(item, resolveLinkageValue(item.type, res), form)
  } catch {
    applyLinkageValue(item, resolveLinkageValue(item.type, null), form)
  }
}

export async function applyFormLinkage(
  formList: any[],
  form: Record<string, any>,
  formId: string,
  changedFieldId?: string,
  withTempProps = false,
  appId?: string | number,
) {
  if (!formId || !Array.isArray(formList)) return

  const tasks: Promise<void>[] = []

  walkFormList(formList, (item) => {
    if (item.showItem || !item.id || !item.props) return
    const linkage = getLinkageConfig(item.props)
    if (!linkage) return
    if (!shouldRefreshLinkage(linkage, changedFieldId)) return

    tasks.push(
      new Promise((resolve) => {
        setTimeout(() => {
          loadLinkageValue(item, form, formId, withTempProps, appId).finally(resolve)
        }, 200)
      }),
    )
  })

  await Promise.all(tasks)
}
