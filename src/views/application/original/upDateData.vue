<template>
    <div class="data">
        <a-modal v-if="displayMode === 'modal'" class="data" :width="'40%'" body-style="padding:0 !important"
            :visible="visible" title-align="start" :footer="!disable" @ok="handleOk" @cancel="handleCancel"
            unmountOnClose>
            <template #title>
                {{ disable ? '查看' : '修改' }}数据
            </template>
            <div class="upDateData upDateData--modal">
                <a-form :model="form" ref="refChangeForm" :rules="rules"
                    :layout="formConfs.titleStyle !== 'hide' ? formConfs.titleStyle : 'vertical'" class="forms"
                    v-bind="formConfs" :scroll-to-first-error="false">
                    <div v-for="(item, index) in formConfs.formList" :key="index">
                        <showItem :activeForm="{ id: '' }" :deptList="deptLists" :newIndex="index" :showEdit="false"
                            :list="formConfs.formList" :comDes="item" :formConfs="formConfs" />
                    </div>
                </a-form>
            </div>
        </a-modal>
        <a-drawer v-else class="data" :width="'40%'" body-style="padding:0 !important" :visible="visible"
            :footer="!disable" @ok="handleOk" @cancel="handleCancel" unmountOnClose>
            <template #title>
                {{ disable ? '查看' : '修改' }}数据
            </template>
            <div class="upDateData">
                <a-form :model="form" ref="refChangeForm" :rules="rules"
                    :layout="formConfs.titleStyle !== 'hide' ? formConfs.titleStyle : 'vertical'" class="forms"
                    v-bind="formConfs" :scroll-to-first-error="false">
                    <div v-for="(item, index) in formConfs.formList" :key="index">
                        <showItem :activeForm="{ id: '' }" :deptList="deptLists" :newIndex="index" :showEdit="false"
                            :list="formConfs.formList" :comDes="item" :formConfs="formConfs" />
                    </div>
                </a-form>
            </div>
        </a-drawer>
    </div>

</template>
<script setup lang="ts">
import { computed, nextTick, ref, provide } from "vue";
import {
    updateOriginalApi,
} from "@/api/original/index";
const props = withDefaults(defineProps<{
    deptLists?: any
    displayMode?: 'drawer' | 'modal'
}>(), {
    displayMode: 'drawer',
});
import { getFormById, setUpDateData, setProps, getProps, setFormById, setRules, submitFormData, setExpressionValue, setFormLogics } from '@/utils/form'
import { applySelectFormOptions } from '@/utils/formSelectOptions'
import { applyFormLinkage } from '@/utils/formLinkage'
import { useRoute } from 'vue-router'
const visible = ref(false)
const displayMode = computed(() => props.displayMode)
const route = useRoute()
const disable = ref(false)
const form = ref({})
const rules = ref({})
const refChangeForm = ref()
const isDataLoading = ref(false)
provide('isDataLoading', isDataLoading)
const emits = defineEmits(["init"]);
const formConfs = ref({ titleStyle: 'vertical' })
const datas = ref({})
const handleOk = () => {
    refChangeForm.value.validate((error: any) => {
        if (!error) {
            let params = {
                formData: form.value,
            }
            submitFormData(params, formConfs.value.formList)
            updateOriginalApi(datas.value.formId, datas.value.id, { dataValue: params.formData }).then(() => {
                emits("init");
                visible.value = false;
            }).catch(() => {
                // visible.value = false;
            })
        } else {

        }
    });

};
const handleCancel = () => {
    visible.value = false;
};
const appId = ref('')
const getCurrentAppId = () => String(appId.value || route.query.id || '')

const walkHasType = (list: any[], types: string[]): boolean => {
    if (!Array.isArray(list)) return false
    for (const item of list) {
        if (types.includes(item.type)) return true
        if (item.children && walkHasType(item.children, types)) return true
        if (item.list) {
            for (const row of item.list) {
                if (walkHasType(row, types)) return true
            }
        }
    }
    return false
}

const NON_TRIGGER_FIELD_TYPES = ['ROW', 'COL', 'TITLE', 'SPLIT_LINE', 'HR', 'EDITORS', 'BUTTON_CONNECTOR']

const syncFieldsViaFilterData = (list: any[]) => {
    if (!Array.isArray(list)) return
    list.forEach((field) => {
        if (field.showItem) return
        if (Array.isArray(field.children) && field.type !== 'SUBFORM') {
            syncFieldsViaFilterData(field.children)
        }
        if (Array.isArray(field.list)) {
            field.list.forEach((row: any[]) => syncFieldsViaFilterData(row))
        }
        if (!field.id || !field.props || NON_TRIGGER_FIELD_TYPES.includes(field.type)) return
        filterData({
            type: field.type,
            id: field.id,
            title: field.title,
            props: { value: field.props.value },
            list: field.list,
        })
    })
}

const loadFormDataViaFilter = async (formData: Record<string, any>, formId: any, disabled: boolean) => {
    isDataLoading.value = true
    try {
        await setUpDateData(formData, formConfs.value.formList, form.value, disabled, formId)
        const needAsyncWait = walkHasType(formConfs.value.formList, ['SUBFORM', 'RELATION_DATA', 'ROW', 'COL'])
        if (needAsyncWait) {
            await new Promise((resolve) => setTimeout(resolve, 1100))
        }
        syncFieldsViaFilterData(formConfs.value.formList)
        await applySelectFormOptions(
            formConfs.value.formList,
            form.value,
            String(formConfs.value.id || formId || ''),
        )
        await applyFormLinkage(
            formConfs.value.formList,
            form.value,
            String(formConfs.value.id || formId || ''),
            undefined,
            false,
            getCurrentAppId(),
        )
        filterData(undefined)
        await nextTick()
        refChangeForm.value?.clearValidate?.()
    } finally {
        isDataLoading.value = false
    }
}

const normalizeFormData = (dataValue: any) => {
    if (typeof dataValue !== 'string') return dataValue || {}
    try {
        return JSON.parse(dataValue)
    } catch {
        return {}
    }
}

const showItems = async (data: any, formId: any, disabled: any, id: any) => {
    visible.value = true;
    datas.value = data
    datas.value.formId = formId
    disable.value = disabled
    appId.value = id
    form.value = {}
    rules.value = {}
    formConfs.value = appId.value ? getFormById(appId.value) : getFormById(route.query.id)

    setRules(formConfs.value.formList, rules.value, true)
    await loadFormDataViaFilter(normalizeFormData(data.dataValue), formId, disabled)
    // let formList = JSON.parse(JSON.stringify(formConfs.value.formList))
    //     formConfs.value.formList = []


    // formConfs.value.formList = formList
}
defineExpose({
    showItems,
});
const getPropsItem = (id: string, propsItem: any) => {
    return getProps(id, formConfs.value.formList, propsItem)
}
const setPropsItem = (id: string, propsItem: any, data: any) => {
    setProps(id, formConfs.value.formList, propsItem, data)
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

const filterData = (value: {
    title?: string;
    type: string; id: string | number; props: { value: any; }; list?: any[];
} | undefined) => {
    if (value) {
        form.value[value.id] = value.props.value
        appId.value ? setFormById(formConfs.value, appId.value) : setFormById(formConfs.value, route.query.id)
        setExpressionValue(
            formConfs.value.formList,
            form.value,
            value,
            formConfs.value.id,
            false,
            !isDataLoading.value,
            getCurrentAppId(),
        )
        nextTick(() => {
            if (value.list) {
                value.list.forEach((item: any) => {
                    item.forEach((item2: any) => {
                        if (shouldClearFieldValidate(item2)) {
                            refChangeForm.value?.clearValidate?.(item2.id as string)
                        }
                    })
                })
            } else {
                refChangeForm.value?.clearValidate?.(value.id as string)
            }
        })
        if (value.type == "USER_MULTIPLE" || value.type == "DEPT_MULTIPLE" || value.type == "USER" || value.type == "DEPT") {
            let id = String(value.id).split('.')
            if (id.length > 1) {
                rules.value[value.id] = value.props.value ? [] : [
                    { type: "object", required: true, message: value.title + "不能为空" },
                ]
                refChangeForm.value?.clearValidate?.()
            } else {
                refChangeForm.value?.validateField?.(value.id)
            }

        }
    }
    setFormLogics(formConfs.value.formList, formConfs.value.formLogics)
}
const setRulesItem = (data: any) => {
    setRules(data, rules.value)
}
provide("provideDesigner", { setPropsItem, getPropsItem, filterData, setRulesItem });
</script>
<style lang="scss" scoped>
@use "@/styles/textColor.scss" as textColor;

.data::v-deep {
    .arco-drawer-body {
        padding: 0 !important;
    }


}

.upDateData {
    :deep(.box) {
        border: 0 !important;
        padding: 12px 24px !important;
    }
}
</style>
