import { nextTick } from "vue"
import { setProps, getProps, setFormById, setRules, setExpressionValue, setFieldControl, setFormLogics } from "@/utils/form"
import { applySelectFormOptions } from "@/utils/formSelectOptions"
import { applyFormLinkage } from "@/utils/formLinkage"
import type { Ref } from 'vue'
import type { FormConfs, FlowInfo } from '@/types/form'

export function useDetailFormRuntime({ form, formConfs, flowInfo, rules, fieldControl, isDataLoading, formViewerRef }: {
  form: Ref<Record<string, any>>
  formConfs: Ref<FormConfs>
  flowInfo: Ref<FlowInfo>
  rules: Ref<Record<string, any>>
  fieldControl: Ref<any[]>
  isDataLoading: Ref<boolean>
  formViewerRef: Ref<any>
}) {


const getPropsItem = (id: string, propsItem: any) => {
    return getProps(id, formConfs.value.formList, propsItem)
}
const setPropsItem = (id: string, propsItem: any, data: any) => {
    setProps(id, formConfs.value.formList, propsItem, data)
}
const setRulesItem = (data: any) => {
    setRules(data, rules.value)
}
const getFieldComponentType = (field: any) => field?.type || field?.componentType || field?.inputType || ''

const getFieldValue = (field: any) => {
    if (field?.props && Object.prototype.hasOwnProperty.call(field.props, 'value')) {
        return field.props.value
    }
    if (Object.prototype.hasOwnProperty.call(field || {}, 'value')) {
        return field.value
    }
    if (Object.prototype.hasOwnProperty.call(field || {}, 'default')) {
        return field.default
    }
    return undefined
}

const isEmptyValueByComponentType = (type: string, fieldValue: any) => {
    if (fieldValue === null || fieldValue === undefined || fieldValue === '') return true
    if (Array.isArray(fieldValue)) return fieldValue.length === 0

    if (typeof fieldValue === 'object') {
        if (type === 'ADDRESS' || type === 'LOCATION') {
            return !fieldValue.prov && !fieldValue.city && !fieldValue.dist && !fieldValue.det && !fieldValue.address
        }

        if (type === 'DATE_INTERVAL' || type === 'TIME_INTERVAL') {
            return !fieldValue.start && !fieldValue.end && !fieldValue[0] && !fieldValue[1]
        }

        if (type === 'USER' || type === 'DEPT' || type === 'USER_MULTIPLE' || type === 'DEPT_MULTIPLE') {
            return !fieldValue.id && !fieldValue.value && !fieldValue.name && !fieldValue.label && !fieldValue.userId && !fieldValue.deptId
        }

        return Object.keys(fieldValue).length === 0
    }

    return false
}

const shouldClearFieldValidate = (field: any) => {
    const fieldValue = getFieldValue(field)
    const componentType = getFieldComponentType(field)
    return !isEmptyValueByComponentType(componentType, fieldValue)
}

const selectionComponentTypes = new Set(['USER', 'DEPT', 'USER_MULTIPLE', 'DEPT_MULTIPLE'])

const hasSelectionId = (item: any) => {
    return item?.id !== null && item?.id !== undefined && item?.id !== ''
}

const sanitizeSelectionValue = (type: string, fieldValue: any) => {
    if (!selectionComponentTypes.has(type)) return fieldValue

    if (Array.isArray(fieldValue)) {
        const sanitized = fieldValue.filter(hasSelectionId)
        return sanitized.length === fieldValue.length ? fieldValue : sanitized
    }

    if (fieldValue && typeof fieldValue === 'object' && !hasSelectionId(fieldValue)) {
        return null
    }

    return fieldValue
}

let isFilterDataRunning = false

const filterData = async (value: {
    list: any;
    title: string;
    type: string; id: string | number; props: { value: any; };
} | undefined) => {
    if (isFilterDataRunning) return
    isFilterDataRunning = true
    try {
        if (value) {
            const sanitizedValue = sanitizeSelectionValue(value.type, value.props.value)
            value.props.value = sanitizedValue
            form.value[value.id] = sanitizedValue
            setFormById(formConfs.value, flowInfo.value.appId)
            setExpressionValue(
                formConfs.value.formList,
                form.value,
                value,
                formConfs.value.id,
                false,
                !isDataLoading.value,
                flowInfo.value.appId,
            )
            await applySelectFormOptions(
                formConfs.value.formList,
                form.value,
                String(flowInfo.value.formId || formConfs.value.id),
                String(value.id),
            )
            await applyFormLinkage(
                formConfs.value.formList,
                form.value,
                String(flowInfo.value.formId || formConfs.value.id),
                String(value.id),
                false,
                flowInfo.value.appId,
            )
            nextTick(() => {
                if (value.list) {
                    value.list.forEach((item: any) => {
                        item.forEach((item2: any) => {
                            if (shouldClearFieldValidate(item2)) {
                                formViewerRef.value?.refChangeForm?.validateField(item2.id as string)
                            }
                        })
                    })
                } else {
                    formViewerRef.value?.refChangeForm?.validateField(value.id as string)
                }
            })
            if (value.type == "USER_MULTIPLE" || value.type == "DEPT_MULTIPLE" || value.type == "USER" || value.type == "DEPT") {
                let id = String(value.id).split('.')
                if (id.length > 1) {
                    rules.value[value.id] = value.props.value ? [] : [
                        { type: "object", required: true, message: value.title + "不能为空" },
                    ]
                    formViewerRef.value?.refChangeForm?.clearValidate()
                } else {
                    formViewerRef.value?.refChangeForm?.validateField(value.id)
                }

            }
        }
        setFieldControl(formConfs.value.formList, fieldControl.value, true)
        setFormLogics(formConfs.value.formList, formConfs.value.formLogics)
    } finally {
        isFilterDataRunning = false
    }
}
  return { getPropsItem, setPropsItem, setRulesItem, filterData }
}
