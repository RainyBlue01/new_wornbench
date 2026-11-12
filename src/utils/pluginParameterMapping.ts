import type { PluginParameterItem } from '@/views/pluginCenter/types'

export type PluginDataType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date' | 'time' | 'any' | 'unknown'

export interface PluginFormFieldOption {
  id: string
  label: string
  componentType: string
  dataType: PluginDataType
}

const componentDataTypes: Record<string, PluginDataType> = {
  INPUT: 'string',
  TEXTAREA: 'string',
  EDITORS: 'string',
  RADIO: 'string',
  SELECT: 'string',
  PHONE: 'string',
  ID_CARD: 'string',
  EMAIL: 'string',
  URL: 'string',
  USER: 'string',
  DEPT: 'string',
  NUMBER: 'number',
  MONEY: 'number',
  RATE: 'number',
  SWITCH: 'boolean',
  CHECKBOX: 'array',
  SELECT_MULTIPLE: 'array',
  USER_MULTIPLE: 'array',
  DEPT_MULTIPLE: 'array',
  ATTACH: 'array',
  PICTURE: 'array',
  DATE: 'date',
  DATE_INTERVAL: 'array',
  TIME: 'time',
  TIME_INTERVAL: 'array',
  JSON_SCHEMA: 'object',
  ADDRESS: 'object',
  LOCATION: 'object',
  RELATION_DATA: 'object',
}

const componentAliases: Record<string, string> = {
  QINPUT: 'INPUT',
  QTEXTAREA: 'TEXTAREA',
  QEDITOR: 'EDITORS',
  QEDITORS: 'EDITORS',
  QRADIO: 'RADIO',
  QCHECKBOX: 'CHECKBOX',
  QSELECT: 'SELECT',
  QINPUTNUMBER: 'NUMBER',
  QDATEPICKER: 'DATE',
  QTIMEPICKER: 'TIME',
  QRADIOPERSONNEL: 'USER',
  QCHECKBOXPERSONNEL: 'USER_MULTIPLE',
  QRADIODEPT: 'DEPT',
  QCHECKBOXDEPT: 'DEPT_MULTIPLE',
}

const ignoredComponentTypes = new Set([
  'ROW', 'COL', 'TITLE', 'SPLIT_LINE', 'BUTTON_CONNECTOR', 'SUBFORM',
])

export function normalizePluginDataType(type?: string): PluginDataType {
  const value = String(type || '').trim().toLowerCase().replace(/\s+/g, '')
  if (!value || ['any', 'unknown', '*', '任意'].includes(value)) return 'any'
  if (['string', 'str', 'text', 'char', 'varchar', '字符串', '文本'].includes(value)) return 'string'
  if (['number', 'integer', 'int', 'long', 'short', 'double', 'float', 'decimal', 'bigdecimal', '数字', '整数', '小数'].includes(value)) return 'number'
  if (['boolean', 'bool', '布尔', '布尔值'].includes(value)) return 'boolean'
  if (['array', 'list', 'set', 'collection', '数组', '列表'].includes(value) || value.endsWith('[]')) return 'array'
  if (['object', 'map', 'json', 'jsonobject', '对象'].includes(value)) return 'object'
  if (['date', 'datetime', 'localdate', 'localdatetime', '日期', '日期时间'].includes(value)) return 'date'
  if (['time', 'localtime', '时间'].includes(value)) return 'time'
  return 'unknown'
}

function resolveComponentType(item: any): string {
  const declaredType = String(item?.type || item?.componentType || item?.props?.type || '').toUpperCase()
  if (componentDataTypes[declaredType] || ignoredComponentTypes.has(declaredType)) return declaredType

  const component = String(item?.component || '').replace(/[-_]/g, '').toUpperCase()
  return componentAliases[component] || declaredType
}

export function flattenPluginFormFields(
  list: any[],
  result: PluginFormFieldOption[] = [],
): PluginFormFieldOption[] {
  list.forEach((item) => {
    if (Array.isArray(item)) {
      flattenPluginFormFields(item, result)
      return
    }
    const componentType = resolveComponentType(item)
    const dataType = componentDataTypes[componentType]
    const id = String(item?.id || item?.props?.field || item?.field || '')

    // Only value-bearing components with an explicitly known type can be mapped.
    if (id && dataType && !ignoredComponentTypes.has(componentType)) {
      result.push({
        id,
        label: item?.title || item?.props?.label || item?.props?.placeholder || id,
        componentType,
        dataType,
      })
    }

    if (Array.isArray(item?.children)) flattenPluginFormFields(item.children, result)
    if (Array.isArray(item?.list)) flattenPluginFormFields(item.list, result)
  })
  return result
}

export function getCompatiblePluginFields(
  parameter: PluginParameterItem,
  fields: PluginFormFieldOption[],
): PluginFormFieldOption[] {
  const parameterType = normalizePluginDataType(parameter.type || (parameter as any).dataType)
  if (parameterType === 'any') return fields
  if (parameterType === 'unknown') return []
  return fields.filter(field => field.dataType === parameterType)
}

export function pluginParameterTypeLabel(type?: string): string {
  const normalized = normalizePluginDataType(type)
  return {
    string: '字符串',
    number: '数字',
    boolean: '布尔',
    array: '数组',
    object: '对象',
    date: '日期',
    time: '时间',
    any: '任意',
    unknown: '未知',
  }[normalized]
}
