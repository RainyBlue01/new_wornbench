import { onBeforeUnmount, watch, type Ref } from 'vue'

export type FormEventTrigger = 'submit' | 'change'

export interface FormEventConfig {
  id: string
  name: string
  trigger: FormEventTrigger
  enabled: boolean
  triggerField?: string
  code?: string
}

interface UseFormEventsOptions {
  isDataLoading?: Ref<boolean>
  changeDelay?: number
  rules?: Ref<any>
}

export type FormRules = Record<string, any[]>

export interface FormEventApi {
  getField: (fieldId: string | number) => any | undefined
  showField: (fieldId: string | number) => boolean
  hideField: (fieldId: string | number) => boolean
  setFieldVisible: (fieldId: string | number, visible: boolean) => boolean
  getFieldRules: (fieldId: string | number) => any[]
  setFieldRules: (fieldId: string | number, nextRules: any | any[]) => any[]
  addFieldRule: (fieldId: string | number, rule: any) => any[]
  clearFieldRules: (fieldId: string | number) => void
  setFieldRequired: (fieldId: string | number, required: boolean, message?: string) => boolean
}

function snapshot(value: unknown) {
  try {
    return JSON.stringify(value)
  } catch {
    return ''
  }
}

function parseSnapshot(value: string | undefined): Record<string, any> {
  try {
    return JSON.parse(value || '{}')
  } catch {
    return {}
  }
}

function getEvents(
  formConfs: Ref<Record<string, any>>,
  trigger: FormEventTrigger,
  changedFieldIds: string[] = [],
) {
  const events = formConfs.value?.formEvents
  if (!Array.isArray(events)) return []
  return events.filter((event: FormEventConfig) =>
    event?.enabled !== false
    && event.trigger === trigger
    && Boolean(event.code?.trim())
    && (
      trigger !== 'change'
      || !event.triggerField
      || changedFieldIds.includes(String(event.triggerField))
    ),
  )
}

function syncFormDataToFields(formData: Record<string, any>, fields: any[]) {
  if (!Array.isArray(fields)) return
  fields.forEach((field) => {
    const fieldId = String(field?.id || field?.props?.field || '')
    if (fieldId && Object.prototype.hasOwnProperty.call(formData, fieldId)) {
      if (!field.props || typeof field.props !== 'object') field.props = {}
      field.props.value = formData[fieldId]
    }
    if (Array.isArray(field?.children)) syncFormDataToFields(formData, field.children)
    if (Array.isArray(field?.list)) {
      field.list.forEach((row: any) => {
        syncFormDataToFields(formData, Array.isArray(row) ? row : [row])
      })
    }
  })
}

function findField(fields: any[], fieldId: string): any | undefined {
  if (!Array.isArray(fields)) return undefined

  for (const field of fields) {
    const currentId = String(field?.id || field?.props?.field || '')
    if (currentId === fieldId) return field

    const childField = findField(field?.children, fieldId)
    if (childField) return childField

    if (Array.isArray(field?.list)) {
      for (const row of field.list) {
        const rowField = findField(Array.isArray(row) ? row : [row], fieldId)
        if (rowField) return rowField
      }
    }
  }

  return undefined
}

function normalizeRules(nextRules: any | any[]): any[] {
  if (nextRules === undefined || nextRules === null) return []
  return Array.isArray(nextRules) ? nextRules : [nextRules]
}

export function createFormEventApi(fields: any[] = [], rules: FormRules = {}): FormEventApi {
  const getField = (fieldId: string | number) => findField(fields, String(fieldId))
  const getFieldRules = (fieldId: string | number) => {
    const currentRules = rules[String(fieldId)]
    return Array.isArray(currentRules) ? currentRules : []
  }
  const setFieldVisible = (fieldId: string | number, visible: boolean) => {
    const field = getField(fieldId)
    if (!field) return false
    field.showItem = !visible
    return true
  }
  const setFieldRules = (fieldId: string | number, nextRules: any | any[]) => {
    const normalizedRules = normalizeRules(nextRules)
    rules[String(fieldId)] = normalizedRules
    return normalizedRules
  }

  return {
    getField,
    showField: fieldId => setFieldVisible(fieldId, true),
    hideField: fieldId => setFieldVisible(fieldId, false),
    setFieldVisible,
    getFieldRules,
    setFieldRules,
    addFieldRule(fieldId, rule) {
      return setFieldRules(fieldId, [...getFieldRules(fieldId), rule])
    },
    clearFieldRules(fieldId) {
      delete rules[String(fieldId)]
    },
    setFieldRequired(fieldId, required, message) {
      const field = getField(fieldId)
      if (!field) return false
      if (!field.props || typeof field.props !== 'object') field.props = {}
      field.props.required = required

      const fieldRules = getFieldRules(fieldId).map((rule) => {
        if (required || rule?.required !== true) return rule
        return { ...rule, required: false }
      })
      const requiredRule = fieldRules.find(rule => rule?.required === true)
      if (requiredRule && message) requiredRule.message = message
      if (required && !requiredRule) {
        fieldRules.unshift({ required: true, message: message || `${field.title || fieldId}不能为空` })
      }
      setFieldRules(fieldId, fieldRules)
      return true
    },
  }
}

/**
 * 直接执行表单事件代码。
 *
 * formData 和 fields 均传入原始响应式数据，脚本可直接修改：
 * formData[fieldId] = value
 * fields[index].props.value = value
 *
 * 返回值仅用于调试和错误反馈，不参与任何字段映射。
 */
export async function executeCodeFormEvent(
  event: FormEventConfig,
  formData: Record<string, any>,
  fields: any[] = [],
  rules: FormRules = {},
) {
  const code = String(event.code || '')
  if (!code.trim()) throw new Error('事件代码不能为空')

  const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor as new (
    ...args: string[]
  ) => (...args: unknown[]) => Promise<unknown>
  const formApi = createFormEventApi(fields, rules)
  const executable = new AsyncFunction(
    'formData',
    'fields',
    'rules',
    'formApi',
    `"use strict";\n${code}`,
  )
  const result = await executable(formData, fields, rules, formApi)
  syncFormDataToFields(formData, fields)

  if (
    result
    && typeof result === 'object'
    && !Array.isArray(result)
    && (result as Record<string, any>).error
  ) {
    throw new Error(String((result as Record<string, any>).error))
  }

  return result
}

export function useFormEvents(
  form: Ref<Record<string, any>>,
  formConfs: Ref<Record<string, any>>,
  options: UseFormEventsOptions = {},
) {
  let changeTimer: ReturnType<typeof setTimeout> | undefined
  let runningChangeEvents = false
  let lastSnapshot = snapshot(form.value)
  let lastValues = parseSnapshot(lastSnapshot)

  async function executeEvent(event: FormEventConfig) {
    return executeCodeFormEvent(
      event,
      form.value,
      formConfs.value?.formList,
      options.rules?.value,
    )
  }

  function syncSnapshot() {
    lastSnapshot = snapshot(form.value)
    lastValues = parseSnapshot(lastSnapshot)
  }

  async function executeFormEvents(
    trigger: FormEventTrigger,
    changedFieldIds: string[] = [],
  ) {
    const events = getEvents(formConfs, trigger, changedFieldIds)
    for (const event of events) await executeEvent(event)
    syncSnapshot()
  }

  watch(
    form,
    () => {
      if (options.isDataLoading?.value || runningChangeEvents) {
        syncSnapshot()
        return
      }

      const currentSnapshot = snapshot(form.value)
      if (currentSnapshot === lastSnapshot) return

      const currentValues = parseSnapshot(currentSnapshot)
      const changedFieldIds = Array.from(new Set([
        ...Object.keys(lastValues),
        ...Object.keys(currentValues),
      ])).filter(key => snapshot(lastValues[key]) !== snapshot(currentValues[key]))

      lastSnapshot = currentSnapshot
      lastValues = currentValues

      if (changeTimer) clearTimeout(changeTimer)
      changeTimer = setTimeout(async () => {
        const events = getEvents(formConfs, 'change', changedFieldIds)
        if (!events.length || options.isDataLoading?.value) return

        runningChangeEvents = true
        try {
          for (const event of events) await executeEvent(event)
          syncSnapshot()
        } catch (error) {
          console.error('表单事件执行失败：', error)
        } finally {
          runningChangeEvents = false
        }
      }, options.changeDelay ?? 300)
    },
    { deep: true },
  )

  watch(
    () => options.isDataLoading?.value,
    (loading) => {
      if (!loading) syncSnapshot()
    },
  )

  watch(
    () => formConfs.value?.formEvents,
    () => {
      if (changeTimer) clearTimeout(changeTimer)
      syncSnapshot()
    },
  )

  onBeforeUnmount(() => {
    if (changeTimer) clearTimeout(changeTimer)
  })

  return { executeFormEvents }
}
