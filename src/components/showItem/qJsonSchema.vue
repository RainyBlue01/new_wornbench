<script lang="ts" setup>
import { computed, inject, reactive, shallowRef, watch, type Ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import request from '@/utils/request'
import { buttonConnector } from '@/api/form'
import { calculate } from '@/components/expression/formula'
import {
  applyButtonOutput,
  buildButtonSubmitData,
  collectFormValues,
  normalizeBtnAction,
} from '@/utils/buttonAction'
import { validateJsonSchemaModel } from '@/utils/jsonSchemaValidate'
import {
  getJsonSchemaPreset,
  resolveJsonSchemaRenderer,
  type JsonSchemaRendererRuntimeContext,
} from './json-schema/registry'

const props = defineProps<{
  comDes: any
  showEdit?: boolean
  formConfs?: any
}>()

const provideState = inject<{
  filterData?: (field?: any) => void
} | null>('provideDesigner', null)
const formModel = inject<Ref<Record<string, any>> | null>('formModel', null)

interface ModuleRuntimeState {
  visible: boolean
  opened: boolean
  refreshedAt: number
}

interface RuntimeEvent {
  type: string
  moduleId?: string
  field?: string
}

interface LogicRuleRuntime {
  id: string
  when: any
  effects: any[]
  otherwiseEffects: any[]
}

const model = reactive<Record<string, any>>({})
const validationErrors = reactive<Record<string, string>>({})
const fieldStateMap = reactive<Record<string, { visible?: boolean; required?: boolean; disabled?: boolean }>>({})
const moduleStateMap = reactive<Record<string, ModuleRuntimeState>>({})
const requestLoading = shallowRef(false)
const isInternalValueSync = shallowRef(false)
const modalVisible = shallowRef(false)
const lastRuntimeEvent = shallowRef<RuntimeEvent | null>(null)

const schema = computed(() => props.comDes?.props?.schema || {})
const uiSchema = computed(() => props.comDes?.props?.uiSchema || {})
const validationConfig = computed(() => props.comDes?.props?.validationConfig || {})
const logicConfig = computed(() => props.comDes?.props?.logicConfig || {})
const requestConfig = computed(() => props.comDes?.props?.requestConfig || {})
const businessFunctionConfig = computed(() => props.comDes?.props?.businessFunctionConfig || {})
const containerConfig = computed(() => props.comDes?.props?.containerConfig || {})
const moduleConfig = computed(() => props.comDes?.props?.moduleConfig || {})
const dataBridgeConfig = computed(() => props.comDes?.props?.dataBridgeConfig || {})
const requiredFields = computed(() => new Set(Array.isArray(schema.value.required) ? schema.value.required : []))
const isDisabled = computed(() => Boolean(props.comDes?.props?.disabled || props.formConfs?.disabled))
const isReadonly = computed(() => Boolean(props.comDes?.props?.readonly))
const businessPreset = computed(() => props.comDes?.props?.businessPreset || '')

const normalizedContainer = computed(() => ({
  type: containerConfig.value?.type || 'inline',
  title: containerConfig.value?.title || props.comDes?.title || '业务组件配置',
  width: Number(containerConfig.value?.width || 720),
  triggerMode: containerConfig.value?.triggerMode || 'button',
  triggerText: containerConfig.value?.triggerText || '打开表单',
  openEvents: Array.isArray(containerConfig.value?.openEvents) ? containerConfig.value.openEvents : ['manual'],
  closeOnSubmit: containerConfig.value?.closeOnSubmit !== false,
  destroyOnClose: Boolean(containerConfig.value?.destroyOnClose),
}))

const normalizedModules = computed(() => {
  const modules = Array.isArray(moduleConfig.value?.modules) ? moduleConfig.value.modules : []
  if (modules.length) return modules
  if (normalizedContainer.value.type === 'modal') {
    return [
      {
        id: 'editor',
        type: 'form',
        title: props.comDes?.title || '编辑表单',
        container: 'modal',
      },
    ]
  }
  return [
    {
      id: 'default',
      type: 'form',
      title: props.comDes?.title || '表单',
      container: 'inline',
    },
  ]
})

const currentModalModuleId = computed(() => {
  const modalModule = normalizedModules.value.find((item: any) => item.container === 'modal')
  return modalModule?.id || 'editor'
})

const getFormValues = () => formModel?.value ?? collectFormValues(props.formConfs?.formList ?? [])
const cloneValue = <T>(value: T): T => JSON.parse(JSON.stringify(value))

const serializeValue = (value: any) => {
  try {
    return JSON.stringify(value ?? {})
  } catch {
    return ''
  }
}

const ensureModuleState = (moduleId: string, visible = true) => {
  if (!moduleId) return
  if (!moduleStateMap[moduleId]) {
    moduleStateMap[moduleId] = {
      visible,
      opened: false,
      refreshedAt: 0,
    }
    return
  }
  if (visible !== undefined) {
    moduleStateMap[moduleId].visible = visible
  }
}

const initModuleStates = () => {
  Object.keys(moduleStateMap).forEach((key) => {
    delete moduleStateMap[key]
  })
  normalizedModules.value.forEach((item: any) => {
    ensureModuleState(item.id, item.visible !== false)
  })
}

const buildModelSnapshot = () => baseFields.value.reduce((result: Record<string, any>, field) => {
  result[field.key] = model[field.key]
  return result
}, {})

const isSameValue = (left: any, right: any) => serializeValue(left) === serializeValue(right)

const syncComponentValue = () => {
  const nextValue = buildModelSnapshot()
  if (isSameValue(props.comDes?.props?.value, nextValue)) return
  isInternalValueSync.value = true
  props.comDes.props.value = nextValue
  queueMicrotask(() => {
    isInternalValueSync.value = false
  })
}

const getDefaultValue = (fieldSchema: any) => {
  if (fieldSchema?.default !== undefined) return fieldSchema.default
  if (fieldSchema?.type === 'boolean') return false
  if (fieldSchema?.type === 'array') return []
  if (fieldSchema?.type === 'object') return {}
  return ''
}

const inferComponent = (fieldSchema: any, fieldUi: any) => {
  if (fieldUi?.component) return fieldUi.component
  if (fieldSchema?.enum && fieldSchema?.type === 'array') return 'checkbox'
  if (fieldSchema?.enum) return 'select'
  if (fieldSchema?.type === 'number' || fieldSchema?.type === 'integer') return 'number'
  if (fieldSchema?.type === 'boolean') return 'switch'
  if (fieldSchema?.format === 'date') return 'date'
  if (fieldSchema?.format === 'dateRange') return 'dateRange'
  if (fieldSchema?.format === 'textarea') return 'textarea'
  return 'input'
}

const normalizeOptions = (fieldSchema: any, fieldUi: any) => {
  const enumValues = Array.isArray(fieldSchema?.enum) ? fieldSchema.enum : []
  const enumNames = Array.isArray(fieldSchema?.enumNames) ? fieldSchema.enumNames : []
  if (enumValues.length) {
    return enumValues.map((value: any, index: number) => ({
      label: enumNames[index] || String(value),
      value,
    }))
  }
  return Array.isArray(fieldUi?.options) ? fieldUi.options : []
}

const ensureArray = <T>(value: T | T[] | undefined | null): T[] => {
  if (Array.isArray(value)) return value
  return value === undefined || value === null ? [] : [value]
}

const normalizeReactionTarget = (target: any, source: { fieldKey?: string; moduleId?: string }) => {
  if (!target || target === 'self') return source.fieldKey || source.moduleId || ''
  return target
}

const normalizeEffectType = (type: string) => {
  const map: Record<string, string> = {
    visible: 'show',
    hidden: 'hide',
    require: 'setRequired',
    unrequire: 'setRequired',
    clearValue: 'setValue',
  }
  return map[type] || type
}

const resolveReactionWhen = (reaction: any) => {
  if (!reaction) return null
  if (reaction.when || reaction.condition || reaction.conditions) {
    return reaction.when || reaction.condition || reaction.conditions
  }
  if (Array.isArray(reaction.dependencies) && reaction.dependencies.length) {
    return {
      match: 'any',
      conditions: reaction.dependencies.map((field: string) => ({
        field,
        operator: 'changed',
      })),
    }
  }
  return null
}

const buildFieldStateEffects = (state: Record<string, any> = {}, target: string) => {
  const effects: any[] = []
  if (!target) return effects
  if (state.visible === true) effects.push({ type: 'show', target })
  if (state.visible === false) effects.push({ type: 'hide', target })
  if (state.hidden === true) effects.push({ type: 'hide', target })
  if (state.hidden === false) effects.push({ type: 'show', target })
  if (state.display === true) effects.push({ type: 'show', target })
  if (state.display === false) effects.push({ type: 'hide', target })
  if (state.required !== undefined) effects.push({ type: 'setRequired', target, value: state.required })
  if (state.disabled === true) effects.push({ type: 'disable', target })
  if (state.disabled === false) effects.push({ type: 'enable', target })
  if (state.value !== undefined) effects.push({ type: 'setValue', target, value: state.value })
  return effects
}

const buildModuleStateEffects = (state: Record<string, any> = {}, targetModule: string) => {
  const effects: any[] = []
  if (!targetModule) return effects
  if (state.visible === true || state.opened === true) effects.push({ type: 'openModule', targetModule })
  if (state.visible === false || state.opened === false) effects.push({ type: 'closeModule', targetModule })
  return effects
}

const normalizeReactionEffects = (
  effects: any,
  source: { fieldKey?: string; moduleId?: string },
  sourceType: 'field' | 'module',
) => {
  return ensureArray(effects)
    .map((effect: any) => {
      if (!effect?.type) return null
      const type = normalizeEffectType(effect.type)
      const normalizedTarget = normalizeReactionTarget(
        effect.target || effect.targetField || effect.field || effect.targetModule,
        source,
      )
      const normalizedEffect = {
        ...effect,
        type,
      }
      if (sourceType === 'module' && ['openModule', 'closeModule', 'toggleModule', 'refreshModule'].includes(type)) {
        normalizedEffect.targetModule = normalizedTarget
      } else {
        normalizedEffect.target = normalizedTarget
      }
      if (type === 'setRequired' && effect.type === 'unrequire' && normalizedEffect.value === undefined) {
        normalizedEffect.value = false
      }
      if (type === 'setValue' && effect.type === 'clearValue' && normalizedEffect.value === undefined) {
        normalizedEffect.value = ''
      }
      return normalizedEffect
    })
    .filter(Boolean)
}

const baseFields = computed(() => {
  const properties = schema.value?.properties || {}
  return Object.entries(properties).map(([key, fieldSchema]: [string, any]) => {
    const fieldUi = uiSchema.value?.[key] || {}
    return {
      key,
      title: fieldSchema.title || key,
      required: requiredFields.value.has(key),
      component: inferComponent(fieldSchema, fieldUi),
      placeholder: fieldUi.placeholder || fieldSchema.description || '',
      maxLength: fieldSchema.maxLength,
      minLength: fieldSchema.minLength,
      minimum: fieldSchema.minimum,
      maximum: fieldSchema.maximum,
      pattern: fieldSchema.pattern,
      format: fieldUi.format || fieldSchema.format,
      multiple: fieldUi.multiple || fieldSchema?.type === 'array',
      options: normalizeOptions(fieldSchema, fieldUi),
      defaultValue: getDefaultValue(fieldSchema),
      schema: fieldSchema,
      ui: fieldUi,
    }
  })
})

const normalizedLogicRules = computed<LogicRuleRuntime[]>(() => {
  const directRules = ensureArray(logicConfig.value?.rules).map((rule: any, index: number) => ({
    id: rule?.id || `logic-rule-${index}`,
    when: rule?.when || rule?.condition || rule?.conditions || null,
    effects: ensureArray(rule?.effects),
    otherwiseEffects: ensureArray(rule?.otherwiseEffects || rule?.elseEffects || rule?.otherwise?.effects || rule?.otherwise),
  }))

  const fieldReactionRules = baseFields.value.flatMap((field) => {
    const reactions = ensureArray(field.schema?.['x-reactions'] || field.ui?.['x-reactions'] || field.ui?.reactions)
    return reactions.map((reaction: any, index: number) => {
      const target = field.key
      const fulfillStateEffects = buildFieldStateEffects(reaction?.fulfill?.state || {}, target)
      const otherwiseStateEffects = buildFieldStateEffects(reaction?.otherwise?.state || {}, target)
      return {
        id: reaction?.id || `${field.key}-reaction-${index}`,
        when: resolveReactionWhen(reaction),
        effects: [
          ...fulfillStateEffects,
          ...normalizeReactionEffects(reaction?.effects || reaction?.fulfill?.run || reaction?.fulfill?.effects, { fieldKey: target }, 'field'),
        ],
        otherwiseEffects: [
          ...otherwiseStateEffects,
          ...normalizeReactionEffects(reaction?.otherwise?.run || reaction?.otherwise?.effects, { fieldKey: target }, 'field'),
        ],
      }
    })
  })

  const moduleReactionRules = normalizedModules.value.flatMap((module: any, index: number) => {
    const reactions = ensureArray(module?.['x-reactions'] || module?.reactions)
    return reactions.map((reaction: any, reactionIndex: number) => {
      const targetModule = module.id || `module_${index}`
      const fulfillStateEffects = buildModuleStateEffects(reaction?.fulfill?.state || {}, targetModule)
      const otherwiseStateEffects = buildModuleStateEffects(reaction?.otherwise?.state || {}, targetModule)
      return {
        id: reaction?.id || `${targetModule}-reaction-${reactionIndex}`,
        when: resolveReactionWhen(reaction),
        effects: [
          ...fulfillStateEffects,
          ...normalizeReactionEffects(reaction?.effects || reaction?.fulfill?.run || reaction?.fulfill?.effects, { moduleId: targetModule }, 'module'),
        ],
        otherwiseEffects: [
          ...otherwiseStateEffects,
          ...normalizeReactionEffects(reaction?.otherwise?.run || reaction?.otherwise?.effects, { moduleId: targetModule }, 'module'),
        ],
      }
    })
  })

  return [...directRules, ...fieldReactionRules, ...moduleReactionRules]
})

const fields = computed(() => {
  return baseFields.value
    .map((field) => {
      const state = fieldStateMap[field.key] || {}
      return {
        ...field,
        required: state.required ?? field.required,
        disabled: state.disabled ?? false,
        visible: state.visible !== false,
      }
    })
    .filter((field) => field.visible !== false)
})

const rendererContext = computed<JsonSchemaRendererRuntimeContext>(() => ({
  comDes: props.comDes,
  schema: schema.value,
  uiSchema: uiSchema.value,
  fields: fields.value,
  model,
  validationErrors,
  requiredFields: requiredFields.value,
  isDisabled: isDisabled.value,
  isReadonly: isReadonly.value,
  businessFunctionConfig: businessFunctionConfig.value,
}))

const activeRenderer = computed(() => resolveJsonSchemaRenderer({
  businessPreset: businessPreset.value,
  schema: schema.value,
  uiSchema: uiSchema.value,
  businessFunctionConfig: businessFunctionConfig.value,
}))

const rendererProps = computed(() => activeRenderer.value.buildProps(rendererContext.value))

const setByPath = (target: Record<string, any>, path: string, value: any) => {
  if (!path) return
  const keys = path.split('.').filter(Boolean)
  const lastKey = keys.pop()
  if (!lastKey) return
  const parent = keys.reduce((obj, key) => {
    if (!obj[key] || typeof obj[key] !== 'object') obj[key] = {}
    return obj[key]
  }, target)
  parent[lastKey] = value
}

const getByPath = (source: any, path?: string) => {
  if (!path) return source
  return path.split('.').filter(Boolean).reduce((value, key) => value?.[key], source)
}

const compileTemplate = (template: any, extra: Record<string, any> = {}): any => {
  if (Array.isArray(template)) return template.map((item) => compileTemplate(item, extra))
  if (template && typeof template === 'object') {
    return Object.keys(template).reduce((result: Record<string, any>, key) => {
      result[key] = compileTemplate(template[key], extra)
      return result
    }, {})
  }
  if (typeof template !== 'string') return template

  return template.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, expression) => {
    const expr = String(expression).trim()
    const context = {
      model,
      form: getFormValues(),
      value: props.comDes?.props?.value,
      ...extra,
    }
    const value = getByPath(context, expr)
    return value === undefined || value === null ? '' : String(value)
  })
}

const findFormField = (fieldCode: string) => {
  if (!fieldCode) return null
  const walk = (list: any[]): any => {
    if (!Array.isArray(list)) return null
    for (const item of list) {
      if (item.id === fieldCode) return item
      const child = walk(item.children)
      if (child) return child
      if (item.type === 'SUBFORM' && Array.isArray(item.list)) {
        for (const row of item.list) {
          const rowChild = walk(row)
          if (rowChild) return rowChild
        }
      }
    }
    return null
  }
  return walk(props.formConfs?.formList ?? [])
}

const setFieldValue = (fieldCode: string, value: any) => {
  const innerField = [...baseFields.value, ...fields.value].find((field) => field.key === fieldCode)
  if (innerField) {
    model[fieldCode] = value
    syncComponentValue()
    return
  }

  const target = findFormField(fieldCode)
  if (target?.props) {
    target.props.value = value
    provideState?.filterData?.(target)
  }
}

const syncBridgeMappings = (mappings: any[] = [], sourceData: Record<string, any> = model) => {
  if (!Array.isArray(mappings)) return
  mappings.forEach((mapping) => {
    const sourceKey = mapping.source || mapping.sourceField
    const targetKey = mapping.target || mapping.targetField
    if (!sourceKey || !targetKey) return
    const value = getByPath(sourceData, sourceKey)
    if (value !== undefined) {
      setFieldValue(targetKey, value)
    }
  })
}

const runDataBridges = (trigger: string, moduleId?: string) => {
  const bridges = Array.isArray(dataBridgeConfig.value?.bridges) ? dataBridgeConfig.value.bridges : []
  bridges.forEach((bridge: any) => {
    const bridgeTriggers = Array.isArray(bridge.triggerEvents) ? bridge.triggerEvents : [bridge.trigger || 'confirm']
    if (!bridgeTriggers.includes(trigger)) return
    if (bridge.sourceId && moduleId && bridge.sourceId !== moduleId) return
    syncBridgeMappings(bridge.mappings || bridge.outputMappings || [], model)
  })
  syncComponentValue()
}

const applyMappings = (response: any, mappings: any[] = []) => {
  if (!Array.isArray(mappings) || !mappings.length) return
  mappings.forEach((mapping) => {
    const value = getByPath(response, mapping.source || mapping.sourcePath)
    if (value === undefined) return
    if (mapping.targetType === 'component' || mapping.scope === 'component') {
      setByPath(props.comDes.props, mapping.target || mapping.targetPath, value)
      return
    }
    setFieldValue(mapping.target || mapping.field || mapping.fieldCode, value)
  })
  syncComponentValue()
  provideState?.filterData?.(undefined)
}

const syncModel = (valueSource?: Record<string, any>) => {
  const source = valueSource && typeof valueSource === 'object'
    ? valueSource
    : props.comDes?.props?.value && typeof props.comDes.props.value === 'object'
      ? props.comDes.props.value
      : props.comDes?.props?.defaultValue || {}
  Object.keys(model).forEach((key) => delete model[key])
  baseFields.value.forEach((field) => {
    model[field.key] = source[field.key] !== undefined ? source[field.key] : field.defaultValue
  })
  initModuleStates()
  applyLogicRules()
  activeRenderer.value.onModelSynced?.(rendererContext.value)
  syncComponentValue()
  Object.keys(validationErrors).forEach((key) => {
    delete validationErrors[key]
  })
}

const validateAll = () => {
  const result = validateJsonSchemaModel(schema.value, model)
  Object.keys(validationErrors).forEach((key) => delete validationErrors[key])
  Object.entries(result.fieldErrors).forEach(([key, message]) => {
    validationErrors[key] = message
  })

  const requiredValid = baseFields.value.every((field) => {
    if (!field.required && fieldStateMap[field.key]?.required !== true) return true
    const currentField = [...baseFields.value, ...fields.value].find((item) => item.key === field.key)
    if (!currentField?.required) return true
    const value = model[field.key]
    const empty = value === undefined || value === null || value === '' || (Array.isArray(value) && !value.length)
    if (empty) {
      validationErrors[field.key] = validationConfig.value.requiredMessage || `${field.title}不能为空`
      return false
    }
    return true
  })

  return result.valid && requiredValid
}

const normalizeCompareValue = (value: any) => Array.isArray(value) ? value : [value]
const isEmptyRuntimeValue = (value: any) => (
  value === undefined
  || value === null
  || value === ''
  || (Array.isArray(value) && value.length === 0)
)

const evaluateRuleWhen = (when: any, changedKey?: string, runtimeEvent?: RuntimeEvent | null) => {
  if (Array.isArray(when)) {
    return when.every((item) => evaluateRuleWhen(item, changedKey, runtimeEvent))
  }
  if (when?.all && Array.isArray(when.all)) {
    return when.all.every((item: any) => evaluateRuleWhen(item, changedKey, runtimeEvent))
  }
  if (when?.any && Array.isArray(when.any)) {
    return when.any.some((item: any) => evaluateRuleWhen(item, changedKey, runtimeEvent))
  }
  if (Array.isArray(when?.conditions)) {
    const matchMode = when.match === 'any' ? 'any' : 'all'
    return matchMode === 'any'
      ? when.conditions.some((item: any) => evaluateRuleWhen(item, changedKey, runtimeEvent))
      : when.conditions.every((item: any) => evaluateRuleWhen(item, changedKey, runtimeEvent))
  }
  if (when?.field) {
    const currentValue = getByPath(model, when.field)
    switch (when.operator) {
      case 'eq':
        return currentValue === when.value
      case 'neq':
        return currentValue !== when.value
      case 'gt':
        return Number(currentValue) > Number(when.value)
      case 'gte':
        return Number(currentValue) >= Number(when.value)
      case 'lt':
        return Number(currentValue) < Number(when.value)
      case 'lte':
        return Number(currentValue) <= Number(when.value)
      case 'contains':
        return normalizeCompareValue(currentValue).includes(when.value)
      case 'notContains':
        return !normalizeCompareValue(currentValue).includes(when.value)
      case 'in':
        return normalizeCompareValue(when.value).includes(currentValue)
      case 'notIn':
        return !normalizeCompareValue(when.value).includes(currentValue)
      case 'matches':
        return typeof currentValue === 'string' && new RegExp(when.value).test(currentValue)
      case 'empty':
        return isEmptyRuntimeValue(currentValue)
      case 'notEmpty':
        return !isEmptyRuntimeValue(currentValue)
      case 'changed':
        return changedKey === when.field
      default:
        return false
    }
  }

  if (when?.event || when?.module || when?.type) {
    if (!runtimeEvent) return false
    if ((when.event || when.type) && (when.event || when.type) !== runtimeEvent.type) return false
    if (when.module && when.module !== runtimeEvent.moduleId) return false
    if (when.field && when.field !== runtimeEvent.field) return false
    return true
  }

  return false
}

const resetFieldStates = () => {
  Object.keys(fieldStateMap).forEach((key) => {
    delete fieldStateMap[key]
  })
}

const emitRuntimeEvent = (type: string, moduleId?: string, field?: string) => {
  lastRuntimeEvent.value = { type, moduleId, field }
  applyLogicRules(field, lastRuntimeEvent.value)
}

const openModule = (moduleId: string) => {
  ensureModuleState(moduleId, true)
  if (moduleStateMap[moduleId].opened && moduleStateMap[moduleId].visible) {
    if (normalizedContainer.value.type === 'modal' && moduleId === currentModalModuleId.value) {
      modalVisible.value = true
    }
    return
  }
  moduleStateMap[moduleId].opened = true
  moduleStateMap[moduleId].visible = true
  if (normalizedContainer.value.type === 'modal' && moduleId === currentModalModuleId.value) {
    modalVisible.value = true
  }
  emitRuntimeEvent('open', moduleId)
}

const closeModule = (moduleId: string) => {
  ensureModuleState(moduleId, false)
  if (!moduleStateMap[moduleId].opened && moduleStateMap[moduleId].visible === false) {
    if (normalizedContainer.value.type === 'modal' && moduleId === currentModalModuleId.value) {
      modalVisible.value = false
    }
    return
  }
  moduleStateMap[moduleId].opened = false
  moduleStateMap[moduleId].visible = false
  if (normalizedContainer.value.type === 'modal' && moduleId === currentModalModuleId.value) {
    modalVisible.value = false
  }
  emitRuntimeEvent('close', moduleId)
}

const toggleModule = (moduleId: string) => {
  ensureModuleState(moduleId, true)
  if (moduleStateMap[moduleId].opened) {
    closeModule(moduleId)
    return
  }
  openModule(moduleId)
}

const applyLogicEffect = (effect: any) => {
  if (!effect?.type) return
  const effectType = normalizeEffectType(effect.type)
  const normalizedEffect = effectType === effect.type
    ? effect
    : {
        ...effect,
        type: effectType,
        value: effectType === 'setRequired' && effect.type === 'unrequire' && effect.value === undefined
          ? false
          : effectType === 'setValue' && effect.type === 'clearValue' && effect.value === undefined
            ? ''
            : effect.value,
      }

  if (['show', 'hide', 'setRequired', 'enable', 'disable', 'setValue'].includes(normalizedEffect.type)) {
    if (!normalizedEffect.target) return
    if (!fieldStateMap[normalizedEffect.target]) {
      fieldStateMap[normalizedEffect.target] = {}
    }
    switch (normalizedEffect.type) {
      case 'show':
        fieldStateMap[normalizedEffect.target].visible = true
        break
      case 'hide':
        fieldStateMap[normalizedEffect.target].visible = false
        break
      case 'setRequired':
        fieldStateMap[normalizedEffect.target].required = Boolean(normalizedEffect.value)
        break
      case 'enable':
        fieldStateMap[normalizedEffect.target].disabled = false
        break
      case 'disable':
        fieldStateMap[normalizedEffect.target].disabled = true
        break
      case 'setValue':
        if (normalizedEffect.sourceField) {
          model[normalizedEffect.target] = getByPath(model, normalizedEffect.sourceField)
        } else if (normalizedEffect.value !== undefined) {
          model[normalizedEffect.target] = normalizedEffect.value
        }
        break
      default:
        break
    }
    return
  }

  const targetModule = normalizedEffect.target || normalizedEffect.targetModule
  switch (normalizedEffect.type) {
    case 'openModule':
      if (targetModule) openModule(targetModule)
      break
    case 'closeModule':
      if (targetModule) closeModule(targetModule)
      break
    case 'toggleModule':
      if (targetModule) toggleModule(targetModule)
      break
    case 'refreshModule':
      if (targetModule) {
        ensureModuleState(targetModule, true)
        moduleStateMap[targetModule].refreshedAt = Date.now()
        emitRuntimeEvent('refresh', targetModule)
      }
      break
    case 'resetModule':
      syncModel(props.comDes?.props?.defaultValue || {})
      break
    case 'validateModule':
      validateAll()
      break
    case 'submitModule':
      runDataBridges('confirm', targetModule || currentModalModuleId.value)
      break
    case 'syncModuleValue':
      syncBridgeMappings(normalizedEffect.mappings || [])
      break
    case 'emitEvent':
      emitRuntimeEvent(normalizedEffect.event || 'manual', targetModule)
      break
    default:
      break
  }
}

const applyLogicRules = (changedKey?: string, runtimeEvent: RuntimeEvent | null = lastRuntimeEvent.value) => {
  resetFieldStates()
  normalizedLogicRules.value.forEach((rule) => {
    const matched = evaluateRuleWhen(rule.when, changedKey, runtimeEvent)
    const effects = matched ? rule.effects : rule.otherwiseEffects
    effects.forEach((effect: any) => applyLogicEffect(effect))
  })
}

const shouldRun = (config: any, trigger: string, changedKey?: string) => {
  if (!config?.enable) return false
  const triggers = Array.isArray(config.triggerEvents)
    ? config.triggerEvents
    : [config.trigger || 'manual']
  if (!triggers.includes(trigger)) return false
  if (trigger === 'change' && Array.isArray(config.watchFields) && config.watchFields.length) {
    return !!changedKey && config.watchFields.includes(changedKey)
  }
  return true
}

const runRequest = async (trigger: string, changedKey?: string) => {
  const config = requestConfig.value
  if (props.showEdit || !shouldRun(config, trigger, changedKey) || !config.url) return

  requestLoading.value = true
  try {
    const method = String(config.method || 'post').toLowerCase()
    const url = compileTemplate(config.url, { trigger, changedKey })
    const params = compileTemplate(config.params || {}, { trigger, changedKey })
    const data = compileTemplate(config.body || config.data || {}, { trigger, changedKey })
    const headers = compileTemplate(config.headers || {}, { trigger, changedKey })
    const response = await (request as any).request({ method, url, params, data, headers })
    const payload = config.responsePath ? getByPath(response, config.responsePath) : response
    applyMappings(payload, config.outputMappings)
    if (config.successMessage) Message.success(config.successMessage)
  } catch (error) {
    console.error('JSON Schema request failed:', error)
    Message.error(config.errorMessage || 'JSON Schema request failed')
  } finally {
    requestLoading.value = false
  }
}

const runConnectorAction = async (actionConfig: any) => {
  const action = normalizeBtnAction(actionConfig)
  if (!action.connectorId || !action.sceneId) return

  const submitData = buildButtonSubmitData(action.input, getFormValues())
  const res = await buttonConnector({
    fieldCode: props.comDes?.id || '',
    formId: props.formConfs?.id || '',
    submitData,
  })
  if (res && typeof res === 'object') {
    applyButtonOutput(
      (res as any).responseData,
      action.output,
      action.enableOutput,
      props.formConfs?.formList ?? [],
      provideState?.filterData,
    )
  }
}

const runBusinessFunctions = async (trigger: string, changedKey?: string) => {
  const config = businessFunctionConfig.value
  if (props.showEdit || !config?.enable) return
  const actions = Array.isArray(config.functions) ? config.functions : []

  for (const action of actions) {
    if (!shouldRun(action, trigger, changedKey)) continue
    try {
      if (action.type === 'connector') {
        await runConnectorAction(action.actionConfig || action)
        continue
      }
      const result = await calculate(action.expression || action.value || '')
      if (action.targetField) {
        setFieldValue(action.targetField, result)
      }
      applyMappings({ result }, action.outputMappings)
    } catch (error) {
      console.error('JSON Schema business function failed:', error)
      Message.error(action.errorMessage || 'JSON Schema business function failed')
    }
  }
}

const updateField = (key: string, value: any) => {
  model[key] = value
  emitRuntimeEvent('change', currentModalModuleId.value, key)
  activeRenderer.value.onFieldUpdated?.(rendererContext.value, key, value)
  syncComponentValue()
  if (validationErrors[key]) {
    delete validationErrors[key]
  }
  runRequest('change', key)
  runBusinessFunctions('change', key)
}

const confirmBooking = (payload: { item?: any; bookingDate?: string; bookingSlot?: string }) => {
  const item = payload?.item
  updateField('bookingItemId', item?.id || item?.name || '')
  updateField('bookingItemName', item?.name || '')
  updateField('bookingDate', payload?.bookingDate || '')
  if (item?.bookingType === 'date') {
    updateField('bookingSlot', '')
    return
  }
  updateField('bookingSlot', payload?.bookingSlot || '')
}

const applyBusinessPreset = (presetName: string) => {
  const preset = getJsonSchemaPreset(presetName)
  if (!preset) return
  props.comDes.props.schema = cloneValue(preset.schema)
  props.comDes.props.uiSchema = cloneValue(preset.uiSchema)
  props.comDes.props.validationConfig = cloneValue(preset.validationConfig)
  props.comDes.props.logicConfig = cloneValue(preset.logicConfig || { rules: [] })
  props.comDes.props.requestConfig = cloneValue(preset.requestConfig)
  props.comDes.props.businessFunctionConfig = cloneValue(preset.businessFunctionConfig)
  props.comDes.props.containerConfig = cloneValue(preset.containerConfig || { type: 'inline' })
  props.comDes.props.moduleConfig = cloneValue(preset.moduleConfig || { mode: 'single', modules: [] })
  props.comDes.props.dataBridgeConfig = cloneValue(preset.dataBridgeConfig || { bridges: [] })
  props.comDes.props.defaultValue = cloneValue(preset.defaultValue)
  props.comDes.props.value = cloneValue(preset.defaultValue)
  props.comDes.props.__businessPresetApplied = presetName
  provideState?.filterData?.(props.comDes)
}

const openContainer = () => {
  if (isDisabled.value || props.showEdit) return
  openModule(currentModalModuleId.value)
}

const handleModalBeforeOk = () => {
  const valid = validateAll()
  if (!valid) {
    Message.error(validationConfig.value.requiredMessage || '请完善表单信息')
    return false
  }
  runDataBridges('confirm', currentModalModuleId.value)
  emitRuntimeEvent('confirm', currentModalModuleId.value)
  if (normalizedContainer.value.closeOnSubmit) {
    closeModule(currentModalModuleId.value)
  }
  return true
}

watch(
  () => props.comDes?.props?.businessPreset,
  (preset, previousPreset) => {
    if (!props.comDes?.props || !preset || preset === 'custom') return
    const hasConfiguredSchema = Object.keys(props.comDes.props.schema?.properties || {}).length > 0
    if (previousPreset !== undefined && previousPreset !== preset) {
      applyBusinessPreset(preset)
      return
    }
    if (!props.comDes.props.__businessPresetApplied && !hasConfiguredSchema) {
      applyBusinessPreset(preset)
    }
  },
  { immediate: true },
)

watch(
  () => [
    props.comDes?.id,
    props.comDes?.props?.schema,
    props.comDes?.props?.uiSchema,
    props.comDes?.props?.logicConfig,
    props.comDes?.props?.defaultValue,
    props.comDes?.props?.moduleConfig,
  ],
  syncModel,
  { immediate: true, deep: true },
)

watch(
  () => props.comDes?.props?.value,
  (value) => {
    if (isInternalValueSync.value) return
    if (isSameValue(value, buildModelSnapshot())) return
    syncModel(value)
  },
  { deep: true },
)

watch(
  () => props.comDes?.id,
  () => {
    runRequest('mounted')
    runBusinessFunctions('mounted')
  },
  { immediate: true },
)

watch(
  () => modalVisible.value,
  (visible) => {
    const moduleId = currentModalModuleId.value
    ensureModuleState(moduleId, visible)
    moduleStateMap[moduleId].opened = visible
    if (visible) {
      emitRuntimeEvent('open', moduleId)
      runDataBridges('open', moduleId)
    } else {
      emitRuntimeEvent('close', moduleId)
    }
  },
)

defineExpose({
  validate: validateAll,
  runRequest: () => runRequest('manual'),
  runBusinessFunctions: () => runBusinessFunctions('manual'),
  openModule,
  closeModule,
})

const stopDesignerSelect = (event: MouseEvent) => {
  if (!props.showEdit) return
  event.stopPropagation()
}
</script>

<template>
  <div class="q-json-schema" @click="stopDesignerSelect">
    <template v-if="normalizedContainer.type === 'modal'">
      <div class="q-json-schema__modal-entry">
        <a-button
          type="outline"
          size="small"
          :disabled="isDisabled"
          @click="openContainer"
        >
          {{ normalizedContainer.triggerText }}
        </a-button>
      </div>

      <a-modal
        v-model:visible="modalVisible"
        :title="normalizedContainer.title"
        :width="normalizedContainer.width"
        :unmount-on-close="normalizedContainer.destroyOnClose"
        title-align="start"
        @before-ok="handleModalBeforeOk"
      >
        <component
          :is="activeRenderer.component"
          v-if="fields.length"
          v-bind="rendererProps"
          @update-field="updateField"
          @confirm-booking="confirmBooking"
        />
      </a-modal>
    </template>

    <template v-else>
      <component
        :is="activeRenderer.component"
        v-if="fields.length"
        v-bind="rendererProps"
        @update-field="updateField"
        @confirm-booking="confirmBooking"
      />
    </template>

    <div
      v-if="fields.length && requestConfig.enable && requestConfig.showManualButton"
      class="q-json-schema__actions"
    >
      <a-button
        type="outline"
        size="small"
        :loading="requestLoading"
        @click="runRequest('manual')"
      >
        {{ requestConfig.buttonText || '请求后台' }}
      </a-button>
    </div>

    <a-empty v-if="!fields.length" description="请配置 JSON Schema" />
  </div>
</template>

<style scoped lang="scss">
.q-json-schema {
  display: grid;
  gap: 12px;
  width: 100%;
}

.q-json-schema__modal-entry,
.q-json-schema__actions {
  display: flex;
  justify-content: flex-start;
}
</style>
