<template>
    <div class="app">
        <HomeBanner variant="subpage" :showDesc="true" breadcrumb-parent="应用管理"
            :breadcrumb-current="appdes.appName || '应用详情'" back-label="返回应用管理" :back-to="{ name: 'myApps' }"
            :show-subpage-hero="false">
            <template #nav-center>
                <div class="app-nav-center">
                    <AppFormNav v-if="route.query.id" inline role="manage" :active-key="activeNavKey"
                        :category="appdes.category" :appdes="appdes" @nav-change="onNavChange"
                        @open-manage="openAppManage" @design-app="clearFormData" />
                </div>
            </template>
        </HomeBanner>
        <updateApp ref="updateAppRef" :appdes="appdes" :dept-lists="deptLists" />
        <publishTask ref="publishTaskRef" :appdes="appdes" />
        <FormPluginPanel v-if="activeNavKey === 'plugin' && formConfs.category !== 3"
            :app-id="String(route.query.id || '')" />
        <OriginalDataPanel v-if="activeNavKey === 'rawdata' && formConfs.category !== 3" embedded :appdes="appdes"
            :active="activeNavKey === 'rawdata'" @nav-change="onNavChange" />

        <DataWritePanel v-if="activeNavKey === 'datawrite' && formConfs.category !== 3" embedded :appdes="appdes"
            :active="activeNavKey === 'datawrite'" />

        <WebhookPanel v-if="activeNavKey === 'webhook' && formConfs.category !== 3" embedded :appdes="appdes"
            :active="activeNavKey === 'webhook'" />

        <div v-if="formConfs.category !== 3" v-show="activeNavKey === 'form'" class="app-body"
            :style="{ overflow: !formConfs.id || !formConfs.formList ? 'hidden' : '' }">
            <div v-if="formConfs.id && formConfs.formList" class="center-body"
                :style="{ width: formConfs.widthType == 'fixed' ? formConfs.width + 'px' : formConfs.width + '%', }">
                <appInfoCard :appdes="appdes" v-if="appdes.appName" :draft-id="draftId"
                    :show-publish-task="canPublishTask" @publish-task="openPublishTask" />
                <a-form :model="form" ref="refChangeForm" :rules="rules"
                    :layout="formConfs.titleStyle !== 'hide' ? formConfs.titleStyle : 'vertical'" class="forms"
                    v-bind="formConfs" :scroll-to-first-error="false">
                    <div v-for="(item, index) in formConfs.formList" :key="index">
                        <showItem :activeForm="{ id: '' }" :deptList="deptLists" v-if="!item.showItem" :newIndex="index"
                            :showEdit="false" :list="formConfs.formList" :form="form" :comDes="item"
                            :formConfs="formConfs" />
                    </div>
                </a-form>
                <div class="bottom" v-if="formConfs.subEnable || formConfs.draftBox">
                    <div class="bottom-body"
                        :style="{ width: formConfs.widthType == 'fixed' ? formConfs.width + 'px' : formConfs.width + '%', }">
                        <a-button :loading="draftLoading" @click="submitForm(true)" v-if="formConfs.draftBox"
                            class="btn-draft">
                            <icon-save />
                            保存草稿
                        </a-button>
                        <a-button v-if="formConfs.subEnable" :loading="submitLoading" type="primary" @click="submitForm(false)" class="sub submit">
                            <icon-check />
                            {{ formConfs.subText || '提交表单' }}
                        </a-button>
                    </div>

                </div>
            </div>
            <emptyBox v-show="!formConfs.id || !formConfs.formList" />
        </div>
        <div v-else class="category">
            <ReportPreviewGrid v-if="formConfs.reportId && formConfs.formList" :layout="formConfs.formList"
                :report-id="formConfs.reportId" :dept-list="deptLists" :canvas-size="formConfs.canvasSize || 100" />
            <emptyBox v-show="!formConfs.reportId || !formConfs.formList" />
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, provide, watch, nextTick, onActivated, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import HomeBanner from '@/components/banner/homeBanner.vue';
import AppFormNav from './components/AppFormNav.vue';
import publishTask from './publishTask/index.vue';
import OriginalDataPanel from './components/OriginalDataPanel.vue';
import DataWritePanel from './components/DataWritePanel.vue';
import WebhookPanel from './components/WebhookPanel.vue';
import FormPluginPanel from './components/formPlugin/FormPluginPanel.vue';
import ReportPreviewGrid from './components/ReportPreviewGrid.vue';
import updateApp from './updateApp/index.vue';
import appInfoCard from './appInfoCard.vue';
import {
    getPersistedAppNav,
    setPersistedAppNav,
    type AppNavKey,
} from './composables/useAppFormNav';
import { getManagerAppDes } from '@/api/homePage/index';
import { getDesignApp, submitData, draftData, getDraftData } from '@/api/form/index'
import field from '@/utils/field'
import { Message } from "@arco-design/web-vue";
import { getDeptTree } from '@/api/common/index'
import { setProps, getProps, setFormById, setRules, submitFormData, setUpDateData, setForm, setExpressionValue, setDefaultValue, setFieldControl, setFormLogics, resetFormRuntimeData } from '@/utils/form'
import { applySelectFormOptions } from '@/utils/formSelectOptions'
import { applyFormLinkage } from '@/utils/formLinkage'
import { flowsToTree } from '@/utils/flowPath'
import { getAppIconUrl } from '@/utils/appIcon'
import { useFormEvents } from '@/composables/useFormEvents'
import type { Appdes, FormConfs } from '@/types/form'

// 数据加载状态锁
const isDataLoading = ref(false)
provide('isDataLoading', isDataLoading)
const publishTaskRef = ref<InstanceType<typeof publishTask> | null>(null)
const route = useRoute()
const activeNavKey = ref<AppNavKey>('form')

const syncActiveNavFromStorage = (appId?: string | null) => {
    if (appId) {
        activeNavKey.value = getPersistedAppNav(appId)
    }
}

watch(
    () => route.query.id,
    (id) => {
        syncActiveNavFromStorage(id as string | undefined)
    },
    { immediate: true },
)

onActivated(() => {
    syncActiveNavFromStorage(route.query.id as string | undefined)
})

const onNavChange = (key: AppNavKey) => {
    activeNavKey.value = key
    setPersistedAppNav(route.query.id as string, key)
}
const openPublishTask = () => {
    if (!appdes.value?.id) {
        Message.warning('应用信息未加载')
        return
    }
    publishTaskRef.value?.show()
}

const canPublishTask = computed(() => {
    const cat = appdes.value?.category
    return cat === 1 || cat === 2
})
const updateAppRef = ref<InstanceType<typeof updateApp> | null>(null)

const openAppManage = () => {
    updateAppRef.value?.showItem()
}

const clearFormData = () => {
    resetFormRuntimeData(formConfs.value.formList)
    form.value = {}
}

const submitLoading = ref(false)
const draftLoading = ref(false)
const router = useRouter()
const rules = ref([])
const appdes = ref<Appdes>({ showPart: false })

const INLINE_ONLY_NAV_KEYS: AppNavKey[] = ['plugin', 'rawdata', 'datawrite', 'webhook'];

watch(
    () => appdes.value.category,
    (category) => {
        if (category === 3 && INLINE_ONLY_NAV_KEYS.includes(activeNavKey.value)) {
            activeNavKey.value = 'form'
        }
    },
)
const formConfs = ref<FormConfs>({})
const deptLists = ref([])
const form = ref({})
const { executeFormEvents } = useFormEvents(form, formConfs, { isDataLoading, rules })
const refChangeForm = ref()
const getPropsItem = (id: string, propsItem: any) => {
    return getProps(id, formConfs.value.formList, propsItem)
}
const setPropsItem = (id: string, propsItem: any, data: any) => {
    setProps(id, formConfs.value.formList, propsItem, data)

}
const setRulesItem = (data: any) => {
    setRules(data, rules.value)
}

const submitForm = async (isDraft: boolean) => {
    if (submitLoading.value || draftLoading.value) {
        Message.warning(submitLoading.value ? '正在提交表单，请稍后再试' : '正在保存草稿，请稍后再试')
        return
    }

    const loading = isDraft ? draftLoading : submitLoading
    loading.value = true
    try {
        if (!isDraft) {
            if (!refChangeForm.value?.validate) {
                Message.warning('表单未就绪，请稍后再试')
                return
            }
            await executeFormEvents('submit')
            const errors = await refChangeForm.value.validate()
            if (errors) return
        }

        const params: { formData: any; draftId?: string } = {
            formData: JSON.parse(JSON.stringify(form.value)),
        }
        submitFormData(params, formConfs.value.formList)

        if (isDraft) {
            params.formData = JSON.stringify(params.formData)
            await draftData(params, route.query.id)
            Message.success('保存草稿成功')
        } else {
            if (draftId.value) {
                params.draftId = draftId.value
            }
            await submitData(params, route.query.id)
            Message.success('提交成功')
        }

        form.value = {}
        formConfs.value = {}
        getAppForm()
    } catch {
        // 保持现有错误提示策略，接口错误由 API 层统一处理。
    } finally {
        loading.value = false
    }
}
getDeptTree().then(res => {
    deptLists.value = res
})
const getAppDes = () => {
    getManagerAppDes(route.query.id).then(res => {
        appdes.value = {
            ...res,
            id: route.query.id as string,
            showIcon: getAppIconUrl(res.icon),
        }
        getAppForm()
    })
}
const fieldControl = ref([])
const draftId = ref('')
const getAppForm = () => {
    if (!route.query.id) {
        return
    }
    getDesignApp(route.query.id).then(res => {
        if (appdes.value.category !== 3) {
            formConfs.value = res.formConfig ? JSON.parse(res.formConfig) : { id: '', formList: [] }
            let processConfig = res.processConfig ? JSON.parse(res.processConfig) : { sequenceFlows: [], nodes: [] }
            processConfig.nodes.map((v: { type: string; fieldControl: any[]; }) => {
                if (v.type == 'START') {
                    fieldControl.value = JSON.parse(JSON.stringify(v.fieldControl))
                }
            })
            flowsToTree(processConfig, route.query.id)
            formConfs.value.name = appdes.value.appName
            formConfs.value.category = appdes.value.category
            formConfs.value.id = appdes.value.formId
            formConfs.value.processId = appdes.value.processId

            // 防御性处理：确保 formList 始终是数组
            if (!formConfs.value.formList) {
                formConfs.value.formList = []
            } else {
                // 过滤掉 formList 中每个对象的 @class 属性，防止 Vue 渲染报错
                formConfs.value.formList = formConfs.value.formList.map((item: any) => {
                    const { '@class': _unused, ...rest } = item
                    return rest
                })
            }

            setForm(formConfs.value.formList)
            if (Array.isArray(formConfs.value.formList)) {
                setRules(formConfs.value.formList, rules.value)
            }
            setFormById(formConfs.value, route.query.id)
            setTimeout(() => {
                refChangeForm.value.clearValidate()
            }, 100);
        } else {
            formConfs.value = res.reportConfig ? JSON.parse(res.reportConfig) : { id: '', formList: [] }

            // 防御性处理：确保 formList 始终是数组
            if (!formConfs.value.formList) {
                formConfs.value.formList = []
            } else {
                // 过滤掉 formList 中每个对象的 @class 属性，防止 Vue 渲染报错
                formConfs.value.formList = formConfs.value.formList.map((item: any) => {
                    const { '@class': _unused, ...rest } = item
                    return rest
                })
            }

            formConfs.value.reportId = appdes.value.reportId
            formConfs.value.name = appdes.value.appName
            formConfs.value.category = appdes.value.category
            setFormById(formConfs.value, route.query.id)
        }
    }).then(() => {
        if (appdes.value.category !== 3 && route.query.id && route.query.id != 'undefined') {
            getDraftData(route.query.id).then(async (res1) => {
                if (res1.id) {
                    let formData = JSON.parse(res1.formData)
                    draftId.value = res1.id
                    await loadFormDataViaFilter(formData)
                } else {
                    draftId.value = ''
                    await loadDefaultViaFilter()
                }
            })
        }
    })
}

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
        })
    })
}

const getCurrentAppId = () => String(appdes.value.id || route.query.id || '')

const loadFormDataViaFilter = async (formData: Record<string, any>) => {
    isDataLoading.value = true
    try {
        await setUpDateData(formData, formConfs.value.formList, {}, false, appdes.value.formId)
        const needAsyncWait = walkHasType(formConfs.value.formList, ['SUBFORM', 'RELATION_DATA', 'ROW', 'COL'])
        if (needAsyncWait) {
            await new Promise((resolve) => setTimeout(resolve, 1100))
        }
        syncFieldsViaFilterData(formConfs.value.formList)
        await applySelectFormOptions(
            formConfs.value.formList,
            form.value,
            String(appdes.value.formId),
        )
        await applyFormLinkage(
            formConfs.value.formList,
            form.value,
            String(appdes.value.formId),
            undefined,
            false,
            getCurrentAppId(),
        )
        filterData(undefined)
    } finally {
        isDataLoading.value = false
    }
}

const loadDefaultViaFilter = async () => {
    isDataLoading.value = true
    try {
        setDefaultValue(formConfs.value.formList, {})
        await new Promise((resolve) => setTimeout(resolve, 200))
        syncFieldsViaFilterData(formConfs.value.formList)
        await applySelectFormOptions(
            formConfs.value.formList,
            form.value,
            String(appdes.value.formId),
        )
        await applyFormLinkage(
            formConfs.value.formList,
            form.value,
            String(appdes.value.formId),
            undefined,
            false,
            getCurrentAppId(),
        )
        filterData(undefined)
    } finally {
        isDataLoading.value = false
    }
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
    type: string; id: string | number; title?: string; props: { value: any; }; list?: any[];
} | undefined) => {
    if (value) {
        form.value[value.id] = value.props.value
        setFormById(formConfs.value, route.query.id)
        setExpressionValue(
            formConfs.value.formList,
            form.value,
            value,
            formConfs.value.id,
            false,
            !isDataLoading.value,
            getCurrentAppId(),
        )

        // 修复：值更新后清除该字段的校验状态，解决单选框选中后仍提示必填的问题
        // 修复：值更新后清除该字段的校验状态，解决单选框选中后仍提示必填的问题
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
                refChangeForm.value.clearValidate()
            } else {
                refChangeForm.value.validateField(value.id)
            }
        }
    }
    setFieldControl(formConfs.value.formList, fieldControl.value, false)
    setFormLogics(formConfs.value.formList, formConfs.value.formLogics)
}
getAppDes()
provide("provideDesigner", { setPropsItem, getPropsItem, filterData, setRulesItem });
provide('formModel', form);

provide("provideServer", { getAppDes });
</script>
<style lang="scss" scoped>
@use "../../styles/textColor.scss" as textColor;

.app::v-deep {
    .box {
        border: 0;
        padding: 12px 0;
    }
}

.app {
    background: #f1f5f9;
    height: 100vh;
    min-height: 0;
    overflow: hidden;
}

.app-body {
    display: flex;
    padding: 24px 16px 61px; // 底部留白，避免被固定栏遮挡
    height: calc(100vh - 162px);
    flex-direction: column;
    overflow-y: auto;
}

.center-body {
    margin: 0 auto;
    width: 100%;
    flex: 1;
    padding-bottom: 24px;

    .app-info-card {
        margin-bottom: 16px;
    }

    .forms {
        background-color: #fff;
        border-radius: 16px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
        padding: 12px 24px;
        transition: all 0.3s;
        width: calc(100% - 48px);

        &:hover {
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
        }
    }

    .bottom {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: white;
        border-top: 1px solid #e2e8f0;
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
        z-index: 100;
        padding: 12px 16px;
        width: calc(100% - 32px);



        &-body {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            margin: 0 auto;
            gap: 12px;
        }

        .btn-draft {
            padding: 10px 24px;
            background: transparent;
            color: #64748b;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            line-height: 1;
            height: auto;
            display: flex;
            align-items: center;
            gap: 6px;

            &:hover {
                background: #f1f5f9;
                color: #334155;
                transform: translateY(-1px);
            }

            &:active {
                transform: translateY(0) scale(0.98);
            }
        }

        .submit {
            padding: 10px 24px;
            background: linear-gradient(135deg, rgb(var(--primary-6)), #6366f1);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.25);
            line-height: 1;
            height: auto;
            position: relative;
            overflow: hidden;
            display: flex;
            align-items: center;
            gap: 6px;

            &::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                transition: left 0.6s ease;
                pointer-events: none;
            }

            &:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);


            }


        }

        // :deep(.arco-btn-primary) {
        //     @extend .submit;
        // }

        // :deep(.arco-btn-outline) {
        //     @extend .btn-draft;
        // }
    }
}

.empty-box {
    width: 100%;
    min-height: calc(100vh - 102px);
}

.category {
    // padding: 20px;
    height: calc(100vh - 80px);
    overflow-y: auto;
}

.app-banner {
    background-color: #fff;
    padding: 12px 16px;
    box-shadow: 0px 3px 6px 1px rgba(0, 0, 0, 0.06);

    .app-banner-body {
        margin: 0 auto;
    }
}
</style>
