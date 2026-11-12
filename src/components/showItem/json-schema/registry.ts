import { markRaw } from 'vue'
import JsonSchemaBookingRenderer from './renderers/JsonSchemaBookingRenderer.vue'
import JsonSchemaGenericRenderer from './renderers/JsonSchemaGenericRenderer.vue'
import JsonSchemaLeaveRenderer from './renderers/JsonSchemaLeaveRenderer.vue'
import { jsonSchemaPresetRegistry } from './presets'

const parseDateValue = (value: any) => {
  if (!value) return Number.NaN
  if (value instanceof Date) return value.getTime()
  if (typeof value?.valueOf === 'function') {
    const timestamp = value.valueOf()
    if (typeof timestamp === 'number' && !Number.isNaN(timestamp)) return timestamp
  }
  const timestamp = Date.parse(String(value))
  return Number.isNaN(timestamp) ? Number.NaN : timestamp
}

const syncLeaveDuration = (model: Record<string, any>) => {
  if (!Array.isArray(model.leaveRange) || model.leaveRange.length !== 2) {
    if (Object.prototype.hasOwnProperty.call(model, 'leaveDuration')) {
      model.leaveDuration = 0
    }
    return
  }
  const start = parseDateValue(model.leaveRange[0])
  const end = parseDateValue(model.leaveRange[1])
  if (Number.isNaN(start) || Number.isNaN(end)) return
  const oneDay = 24 * 60 * 60 * 1000
  model.leaveDuration = Math.max(1, Math.floor((end - start) / oneDay) + 1)
}

export interface JsonSchemaRendererRuntimeContext {
  comDes: any
  schema: any
  uiSchema: any
  fields: any[]
  model: Record<string, any>
  validationErrors: Record<string, string>
  requiredFields: Set<string>
  isDisabled: boolean
  isReadonly: boolean
  businessFunctionConfig: any
}

interface JsonSchemaRendererMatcherContext {
  businessPreset: string
  schema: any
  uiSchema: any
  businessFunctionConfig: any
}

export interface JsonSchemaRendererDefinition {
  key: string
  component: any
  match: (context: JsonSchemaRendererMatcherContext) => boolean
  buildProps: (context: JsonSchemaRendererRuntimeContext) => Record<string, any>
  onModelSynced?: (context: JsonSchemaRendererRuntimeContext) => void
  onFieldUpdated?: (context: JsonSchemaRendererRuntimeContext, key: string, value: any) => void
}

export const jsonSchemaRendererRegistry: JsonSchemaRendererDefinition[] = [
  {
    key: 'booking',
    component: markRaw(JsonSchemaBookingRenderer),
    match: ({ businessPreset, schema, uiSchema, businessFunctionConfig }) =>
      businessPreset === 'booking'
      || uiSchema?.renderer === 'booking'
      || uiSchema?.layout?.renderer === 'booking'
      || schema?.xRenderer === 'booking'
      || Boolean(businessFunctionConfig?.bookingConfig),
    buildProps: ({ comDes, fields, model, validationErrors, requiredFields, isDisabled, isReadonly, businessFunctionConfig }) => {
      const bookingConfig = businessFunctionConfig?.bookingConfig || {}
      const bookingItems = Array.isArray(bookingConfig.items) ? bookingConfig.items : []
      const selectedBookingItem = bookingItems.find(
        (item: any) => item.id === model.bookingItemId || item.name === model.bookingItemName,
      ) || null

      const bookingSlots = (Array.isArray(selectedBookingItem?.timeSlots) ? selectedBookingItem.timeSlots : []).map((slot: any, index: number) => {
        if (typeof slot === 'string') {
          return {
            label: slot,
            value: slot,
            available: true,
            tip: selectedBookingItem?.maxPerSlot ? `剩余${selectedBookingItem.maxPerSlot}` : '',
          }
        }
        const current = Number(slot?.current ?? 0)
        const max = Number(slot?.max ?? selectedBookingItem?.maxPerSlot ?? 0)
        const available = max ? current < max : slot?.available !== false
        return {
          label: slot?.label || slot?.name || slot?.value || `时段${index + 1}`,
          value: slot?.value || slot?.label || slot?.name || `slot_${index}`,
          available,
          tip: max ? `剩余${Math.max(max - current, 0)}` : '',
        }
      })

      let bookingScopeText = ''
      if (bookingConfig.scopeType === 'fixedDate' && bookingConfig.fixedDate) {
        bookingScopeText = `预约范围：固定日期 ${bookingConfig.fixedDate}`
      } else if (bookingConfig.scopeType === 'futureDays' && bookingConfig.scopeDays) {
        bookingScopeText = `预约范围：未来 ${bookingConfig.scopeDays} 天`
      } else if (bookingConfig.scopeType === 'future') {
        bookingScopeText = '预约范围：未来所有时间'
      }

      return {
        title: comDes?.title,
        bookingScopeText,
        bookingItems,
        selectedBookingItem,
        bookingResultItemName: model.bookingItemName || selectedBookingItem?.name || '',
        bookingSlots,
        bookingExtraFields: fields.filter((field) => !new Set(['bookingItemId', 'bookingItemName', 'bookingDate', 'bookingSlot']).has(field.key)),
        model,
        validationErrors,
        isDisabled,
        isReadonly,
        bookingDateRequired: requiredFields.has('bookingDate'),
        bookingSlotRequired: requiredFields.has('bookingSlot'),
      }
    },
  },
  {
    key: 'leave',
    component: markRaw(JsonSchemaLeaveRenderer),
    match: ({ businessPreset, schema, uiSchema, businessFunctionConfig }) =>
      businessPreset === 'leave'
      || uiSchema?.renderer === 'leave'
      || uiSchema?.layout?.renderer === 'leave'
      || schema?.xRenderer === 'leave'
      || Boolean(businessFunctionConfig?.leaveConfig),
    buildProps: ({ comDes, fields, model, validationErrors, isDisabled, isReadonly, businessFunctionConfig }) => {
      const notice = businessFunctionConfig?.leaveConfig?.noticeText
      const leaveDurationText = `${Number(model.leaveDuration || 0)} 天`
      const leaveSummaryText = !Array.isArray(model.leaveRange) || model.leaveRange.length !== 2
        ? notice || '请选择请假时间并填写请假事由'
        : `已选择请假时间，共 ${leaveDurationText}`

      return {
        title: comDes?.title,
        leaveSummaryText,
        leaveFields: fields.filter((field) => field.key !== 'leaveDuration'),
        leaveDurationField: fields.find((field) => field.key === 'leaveDuration') || null,
        leaveDurationText,
        model,
        validationErrors,
        isDisabled,
        isReadonly,
      }
    },
    onModelSynced: ({ model }) => {
      syncLeaveDuration(model)
    },
    onFieldUpdated: ({ model }, key) => {
      if (key === 'leaveRange') {
        syncLeaveDuration(model)
      }
    },
  },
  {
    key: 'generic',
    component: markRaw(JsonSchemaGenericRenderer),
    match: () => true,
    buildProps: ({ fields, model, validationErrors, isDisabled, isReadonly }) => ({
      fields,
      model,
      validationErrors,
      isDisabled,
      isReadonly,
    }),
  },
]

export const resolveJsonSchemaRenderer = (context: JsonSchemaRendererMatcherContext) => {
  return jsonSchemaRendererRegistry.find((renderer) => renderer.match(context))
    || jsonSchemaRendererRegistry[jsonSchemaRendererRegistry.length - 1]
}

export const getJsonSchemaPreset = (presetName: string) => {
  return jsonSchemaPresetRegistry[presetName as keyof typeof jsonSchemaPresetRegistry] || null
}
