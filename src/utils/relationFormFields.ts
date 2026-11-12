import { getSourceShareApps } from '@/api/homePage/index'
import { getAppForm } from '@/api/common/index'
import { setDataFormList } from '@/data/data_form.js'

export interface RelationApp {
  appId: string
  appName: string
  formId: string
  category: number
}

export interface FieldMeta {
  custom?: boolean
  id: string
  fieldCode: string
  title: string
  type: string
  default?: any
  props?: any
}

export interface GroupedRelationApps {
  current: RelationApp[]
  groups: { label: string; apps: RelationApp[] }[]
  flat: RelationApp[]
}

const COMPATIBLE_OPTION_FIELD_TYPES = [
  'INPUT', 'TEXTAREA', 'NUMBER', 'MONEY', 'RADIO', 'SELECT',
  'PHONE', 'EMAIL', 'ID_CARD', 'URL', 'DATE', 'TIME',
]

function appendSystemFields(fields: FieldMeta[], category: number) {
  fields.push(
    { custom: false, id: 'id', fieldCode: 'id', title: '主键', type: 'INPUT', default: '' },
    { custom: false, id: 'create_user', fieldCode: 'create_user', title: '创建人', type: 'INPUT', default: '' },
    {
      custom: false, id: 'create_time', fieldCode: 'create_time', title: '创建时间', type: 'DATE',
      props: { format: 'yyyy-MM-dd HH:mm:ss' }, default: '',
    },
    { custom: false, id: 'update_user', fieldCode: 'update_user', title: '修改人', type: 'INPUT', default: '' },
    {
      custom: false, id: 'update_time', fieldCode: 'update_time', title: '修改时间', type: 'DATE',
      props: { format: 'yyyy-MM-dd HH:mm:ss' }, default: '',
    },
    { custom: false, id: 'submit_ip', fieldCode: 'submit_ip', title: '提交ip', type: 'INPUT', default: '' },
    {
      custom: false, id: 'input_source', fieldCode: 'input_source', title: '数据来源', type: 'SELECT',
      props: { options: [{ value: 1, label: '填写' }, { value: 2, label: '导入' }] },
    },
  )
  if (category === 2) {
    fields.push(
      { custom: false, id: 'instance_id', fieldCode: 'instance_id', title: '流程实例id', type: 'INPUT', default: '' },
      {
        custom: false, id: 'instance_state', fieldCode: 'instance_state', title: '流程状态', type: 'SELECT',
        props: { options: [{ value: 0, label: '已完成' }, { value: 1, label: '运行中' }] },
      },
    )
  }
}

export async function fetchRelationApps(currentAppId?: string): Promise<GroupedRelationApps> {
  let res: any[] = []
  if (currentAppId) {
    try {
      const shareData = await getSourceShareApps(currentAppId)
      res = shareData || []
    } catch {
      res = []
    }
  }

  const flat: RelationApp[] = (res || [])
    .filter((v: any) => v.category !== 3)
    .map((v: any) => ({
      appId: String(v.appId || v.sourceAppId),
      appName: v.appName,
      formId: String(v.formId),
      category: v.category,
    }))

  const current: RelationApp[] = []
  const otherMap = new Map<string, RelationApp[]>()

  flat.forEach((app) => {
    if (currentAppId && app.appId === String(currentAppId)) {
      current.push(app)
    } else {
      const key = app.appName
      if (!otherMap.has(key)) otherMap.set(key, [])
      otherMap.get(key)!.push(app)
    }
  })

  const groups = res

  return { current, groups, flat }
}

export async function loadFormFieldMeta(appId: string): Promise<{ fields: FieldMeta[]; category: number }> {
  const res = await getAppForm(appId)
  const formConfig = JSON.parse(res.formConfig)
  const fields: FieldMeta[] = []
  setDataFormList(formConfig.formList, fields)
  appendSystemFields(fields, formConfig.category)
  return { fields, category: formConfig.category }
}

export async function loadFormFieldBySelect(appId: string): Promise<{ fields: FieldMeta[]; category: number }> {
  const res = await getAppForm(appId)
  const formConfig = JSON.parse(res.formConfig)
  const fields: FieldMeta[] = []
  setDataFormList(formConfig.formList, fields)
  // appendSystemFields(fields, formConfig.category)
  return { fields, category: formConfig.category }
}

export function fieldsToSelectOptions(fields: FieldMeta[]) {
  return fields.map((v) => ({ label: v.title, value: JSON.stringify(v) }))
}

export function parseFieldOption(value: string): FieldMeta {
  return JSON.parse(value)
}

export function getCompatibleSourceFields(fields: FieldMeta[]) {
  return fields.filter((f) => COMPATIBLE_OPTION_FIELD_TYPES.includes(f.type))
}

export function getSortFieldOptions(fields: FieldMeta[]) {
  const base = [
    { label: '创建时间', value: 'create_time' },
    { label: '修改时间', value: 'update_time' },
  ]
  const business = fields
    .filter((f) => ['INPUT', 'TEXTAREA', 'NUMBER', 'DATE', 'TIME', 'MONEY'].includes(f.type))
    .map((f) => ({ label: f.title, value: f.id }))
  return [...base, ...business]
}
