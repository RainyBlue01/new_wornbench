<template>
    <a-modal v-model:visible="visible" :footer="false" width="1120px" :mask-closable="true" title-align="start"
        :render-to-body="true" :modal-class="['form-designer-preview-modal', modalClass]" unmount-on-close
        @cancel="handleCancel">
        <template #title>
            <div class="form-designer-preview-modal__heading">
                <span class="form-designer-preview-modal__title">表单预览</span>
                <span class="form-designer-preview-badge">实时</span>
            </div>
        </template>

        <div class="form-designer-preview-body">
            <div class="form-designer-preview-device-tabs">
                <button type="button" class="form-designer-preview-device-tab"
                    :class="{ 'form-designer-preview-device-tab--active': previewDevice === 'pc' }"
                    @click="previewDevice = 'pc'">
                    电脑端
                </button>
                <button type="button" class="form-designer-preview-device-tab"
                    :class="{ 'form-designer-preview-device-tab--active': previewDevice === 'mobile' }"
                    @click="previewDevice = 'mobile'">
                    移动端
                </button>
            </div>

            <div class="form-designer-preview-container">
                <div v-if="localFormConfs.formList?.length" class="form-designer-preview-paper"
                    :class="{ 'form-designer-preview-paper--mobile': previewDevice === 'mobile' }" :style="paperStyle">
                    <!-- <div class="form-designer-preview-form-title">{{ formTitle }}</div> -->
                    <a-form :model="previewForm" ref="previewFormRef" :rules="rules"
                        :layout="localFormConfs.titleStyle !== 'hide' ? localFormConfs.titleStyle : 'vertical'"
                        class="form-designer-preview-form" v-bind="localFormConfs" :scroll-to-first-error="false">
                        <div v-for="(item, index) in localFormConfs.formList" :key="index">
                            <showItem :activeForm="{ id: '' }" :deptList="deptLists" v-if="!item.showItem"
                                :newIndex="index" :showEdit="false" :list="localFormConfs.formList" :comDes="item"
                                :formConfs="localFormConfs" />
                        </div>
                    </a-form>
                </div>
                <emptyBox v-else />
            </div>
        </div>
        <footer v-if="debugTrigger === 'submit'" class="form-designer-preview-debug-footer">
            <a-button class="form-designer-preview-submit" type="primary" :loading="submitDebugging"
                @click="handleDebugSubmit">
                提交
            </a-button>
        </footer>
    </a-modal>
</template>

<script setup lang="ts">
import { computed, nextTick, provide, ref, shallowRef } from 'vue'
import { Message } from '@arco-design/web-vue'
import showItem from '@/components/showItem/showItem.vue'
import emptyBox from '@/components/emptyBox/emptyBox.vue'
import { getDeptTree } from '@/api/common/index'
import { setProps, getProps, setFormById, setRules, setExpressionValue, setDefaultValue, setFieldControl, setFormLogics, setForm } from '@/utils/form'
import { applySelectFormOptions } from '@/utils/formSelectOptions'
import { applyFormLinkage } from '@/utils/formLinkage'
import { useFormEvents, type FormEventConfig } from '@/composables/useFormEvents'
import type { FormConfs } from '@/types/form'
import { useRoute } from 'vue-router'

const props = defineProps<{
    formConfs: FormConfs
    modalClass?: string
}>()
const route = useRoute()
const visible = ref(false)
const previewDevice = ref<'pc' | 'mobile'>('pc')
const previewForm = ref({})
const previewFormRef = ref()
const localFormConfs = ref<FormConfs>({})
const deptLists = ref([])
const rules = ref([])
const fieldControl = ref([])
const isDataLoading = shallowRef(false)
const submitDebugging = shallowRef(false)
const { executeFormEvents } = useFormEvents(
    previewForm,
    localFormConfs,
    { isDataLoading, rules },
)

const formTitle = computed(() => localFormConfs.value.name || '未命名表单')
const debugTrigger = computed(() =>
    localFormConfs.value.formEvents?.[0]?.trigger,
)

const paperStyle = computed(() => {
    const conf = localFormConfs.value
    if (previewDevice.value === 'mobile') {
        return { maxWidth: '375px', width: '100%' }
    }
    return {
        width: conf.widthType === 'fixed' ? `${conf.width}px` : `${conf.width}%`,
        maxWidth: '100%',
    }
})

const syncPreviewFormValues = (fields: any[]) => {
    if (!Array.isArray(fields)) return
    fields.forEach((field: any) => {
        const fieldId = field?.id
        if (fieldId !== undefined && fieldId !== null && fieldId !== '') {
            previewForm.value[String(fieldId)] = field?.props?.value
        }
        if (Array.isArray(field?.children)) syncPreviewFormValues(field.children)
        if (Array.isArray(field?.list)) {
            field.list.forEach((row: any) => {
                syncPreviewFormValues(Array.isArray(row) ? row : [row])
            })
        }
    })
}

getDeptTree().then(res => {
    deptLists.value = res
})

const openPreviewDrawer = async (debugEvent?: FormEventConfig) => {
    isDataLoading.value = true
    previewForm.value = {}
    previewDevice.value = 'pc'
    const config = JSON.parse(JSON.stringify(props.formConfs))

    if (!config.formList) {
        config.formList = []
    } else {
        config.formList = config.formList.map((item: any) => {
            const { '@class': _unused, ...rest } = item
            return rest
        })
    }

    localFormConfs.value = config
    localFormConfs.value.formEvents = debugEvent
        ? [{
            ...JSON.parse(JSON.stringify(debugEvent)),
            enabled: true,
            status: 'on',
        }]
        : []
    localFormConfs.value.useTempProps = true
    if (!localFormConfs.value.id) {
        localFormConfs.value.id = route.query.id as string
    }
    setForm(localFormConfs.value.formList)
    setDefaultValue(localFormConfs.value.formList, previewForm.value)

    if (Array.isArray(localFormConfs.value.formList)) {
        setRules(localFormConfs.value.formList, rules.value)
    }

    setFieldControl(localFormConfs.value.formList, fieldControl.value, false)
    setFormLogics(localFormConfs.value.formList, localFormConfs.value.formLogics)

    const formId = String(localFormConfs.value.id || route.query.id || '')
    if (formId && localFormConfs.value.formList?.length) {
        await applySelectFormOptions(
            localFormConfs.value.formList,
            previewForm.value,
            formId,
            undefined,
            true,
        )
        await applyFormLinkage(
            localFormConfs.value.formList,
            previewForm.value,
            formId,
            undefined,
            true,
            route.query.id,
        )
    }
    // filterData(null)
    visible.value = true
    await nextTick()
    isDataLoading.value = false
}

const handleDebugSubmit = async () => {
    if (submitDebugging.value) return
    submitDebugging.value = true
    try {
        syncPreviewFormValues(localFormConfs.value.formList)
        await nextTick()
        const validationErrors = await previewFormRef.value?.validate()
        if (validationErrors) return
        await executeFormEvents('submit')
        Message.success('代码执行成功')
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        Message.error(`代码执行异常：${message}`)
    } finally {
        submitDebugging.value = false
    }
}

const handleCancel = () => {
    visible.value = false
}

const getPropsItem = (id: string, propsItem: any) => {
    return getProps(id, localFormConfs.value.formList, propsItem)
}
const setPropsItem = (id: string, propsItem: any, data: any) => {
    setProps(id, localFormConfs.value.formList, propsItem, data)
}
const setRulesItem = (data: any) => {
    setRules(data, rules.value)
}
const filterData = async (value: {
    type: string; id: string | number; props: { value: any; };
} | undefined) => {
    if (value) {
        previewForm.value[value.id] = value.props.value
        await nextTick()
        setFormById(localFormConfs.value, route.query.id)
        setExpressionValue(localFormConfs.value.formList, previewForm.value, value, localFormConfs.value.id, true)
        if (value.type == "USER_MULTIPLE" || value.type == "DEPT_MULTIPLE" || value.type == "USER" || value.type == "DEPT") {
            const idParts = value.id.split('.')
            if (idParts.length > 1) {
                rules.value[value.id] = value.props.value ? [] : [
                    { type: "object", required: true, message: value.title + "不能为空" },
                ]
            }
        }
        await previewFormRef.value?.validateField(value.id)
    }
    setFieldControl(localFormConfs.value.formList, fieldControl.value, false)
    setFormLogics(localFormConfs.value.formList, localFormConfs.value.formLogics)
}

provide("provideDesigner", { setPropsItem, getPropsItem, filterData, setRulesItem });
provide("formModel", previewForm);

defineExpose({
    openPreviewDrawer
})
</script>

<style lang="scss">
.form-designer-preview-modal {
    width: min(1120px, calc(100vw - 32px)) !important;
    margin: 0 auto !important;

    &.arco-modal {
        display: flex;
        max-width: none;
        max-height: calc(100dvh - 32px);
        flex-direction: column;
        overflow: hidden;
        border-radius: 14px;
        box-shadow: 0 20px 48px rgba(15, 23, 42, 0.22);
    }

    .arco-modal-header {
        display: flex;
        height: 56px;
        min-height: 56px;
        align-items: center;
        justify-content: space-between;
        padding: 0 20px;
        border-bottom: 1px solid #f1f5f9;
        flex-shrink: 0;
    }

    .arco-modal-title {
        flex: 1;
    }

    .arco-modal-close-btn {
        width: 30px;
        height: 30px;
        border-radius: 7px;
        background: #f8fafc;
        color: #64748b;
        font-size: 16px;
        margin-left: 16px;

        &:hover {
            background: #f1f5f9;
            color: #334155;
        }
    }

    .arco-modal-body {
        display: flex;
        min-height: 0;
        flex: 1;
        flex-direction: column;
        overflow: hidden;
        padding: 0;
        max-height: calc(100dvh - 88px);
    }
}

.arco-modal-wrapper:has(.form-designer-preview-modal) {
    display: flex;
    overflow: hidden;
    align-items: center;
    justify-content: center;
    padding: 16px;
}

.form-designer-preview-body {
    min-height: 0;
    flex: 1;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 0 0 16px;
    scrollbar-gutter: stable;
}

.form-designer-preview-debug-footer {
    display: flex;
    flex: none;
    justify-content: flex-end;
    padding: 10px 20px;
    //border-top: 1px solid #f1f5f9;
    background: #fff;
}

.form-designer-preview-submit.arco-btn-primary {
    min-width: 72px;
    height: auto;
    padding: 8px 18px;
    border: 0;
    border-radius: 10px;
    background: linear-gradient(135deg, rgb(var(--primary-6)), #6366f1);
    box-shadow: none;
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    line-height: 20px;
    transition: opacity 0.2s, filter 0.2s;

    &:hover {
        background: linear-gradient(135deg, rgb(var(--primary-6)), #6366f1);
        box-shadow: none;
        filter: brightness(1.04);
    }

    &:active {
        filter: brightness(0.96);
    }

    &.arco-btn-loading,
    &[disabled] {
        cursor: wait;
        opacity: 0.65;
    }
}

.form-designer-preview-modal__heading {
    display: flex;
    align-items: center;
    gap: 8px;
}

.form-designer-preview-modal__title {
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
}

.form-designer-preview-badge {
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    background: #fef3c7;
    color: #d97706;
    font-weight: 500;
    line-height: 1.4;
}

.form-designer-preview-device-tabs {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-bottom: 12px;
}

.form-designer-preview-device-tab {
    padding: 5px 12px;
    border-radius: 7px;
    font-size: 13px;
    font-weight: 500;
    color: #64748b;
    cursor: pointer;
    border: 1px solid #e2e8f0;
    background: #fff;
    transition: all 0.2s;

    &:hover {
        border-color: #cbd5e1;
    }

    &--active {
        border-color: rgb(var(--primary-6));
        color: rgb(var(--primary-6));
        background: #eff6ff;
    }
}

.form-designer-preview-container {
    display: flex;
    justify-content: center;
}

.form-designer-preview-paper {
    margin: 0 auto;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 0px;
    box-sizing: border-box;
    transition: width 0.25s ease, max-width 0.25s ease;

    &--mobile {
        max-width: 375px;
    }
}

.form-designer-preview-form-title {
    font-size: 20px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 24px;
    line-height: 1.4;
}

.form-designer-preview-form {
    .box {
        margin-bottom: 0;
    }

    .arco-form-item {
        margin-bottom: 20px;
    }

    .arco-form-item-label-col>.arco-form-item-label {
        font-size: 14px;
        font-weight: 500;
        color: #374151;
        line-height: 1.5;
    }

    .arco-form-item-label-required-symbol {
        color: #ef4444;
        margin-left: 2px;
    }

    .field-hint {
        font-size: 12px;
        color: #94a3b8;
        margin-bottom: 6px;
        line-height: 1.5;
    }

    .arco-input-wrapper,
    .arco-textarea-wrapper,
    .arco-picker {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        transition: border-color 0.2s, background 0.2s;
        min-height: 28px !important;

        &:hover {
            border-color: #cbd5e1;
        }

        &.arco-input-focus,
        &.arco-select-view-focus,
        &.arco-picker-focused {
            border-color: rgb(var(--primary-6));
            background: #fff;
        }
    }

    .arco-input,
    .arco-textarea,
    .arco-picker-input input {
        font-size: 14px;
        color: #334155;
    }

    .arco-input::placeholder,
    .arco-textarea::placeholder {
        color: #94a3b8;
    }

    .arco-select-view-single {
        height: 31px !important;
    }

    .arco-upload-drag,
    .arco-upload-list-item {
        border: 2px dashed #e2e8f0;
        border-radius: 8px;
        background: #fff;
    }

    .arco-upload-drag {
        padding: 12px;
        color: #94a3b8;
        font-size: 13px;

        &:hover {
            border-color: rgb(var(--primary-6));
            color: rgb(var(--primary-6));
        }
    }

    .arco-radio-group,
    .arco-checkbox-group {
        display: flex;
        flex-wrap: wrap;
    }

    .arco-radio,
    .arco-checkbox {
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 13px;
        color: #475569;
        margin-right: 0;
        transition: all 0.2s;

        &:hover {
            border-color: rgb(var(--primary-6));
            background: #f8fafc;
        }
    }
}

.form-designer-preview-modal {
    .box {
        border: 0 !important;
    }
}

@media (max-width: 768px) {
    .form-designer-preview-modal {
        width: calc(100vw - 16px) !important;

        &.arco-modal {
            max-height: calc(100dvh - 16px);
            border-radius: 12px;
        }

        .arco-modal-body {
            max-height: calc(100dvh - 72px);
        }
    }

    .arco-modal-wrapper:has(.form-designer-preview-modal) {
        padding: 8px;
    }

    .form-designer-preview-body {
        padding: 12px;
    }

    .form-designer-preview-debug-footer {
        padding: 10px 12px;
    }
}
</style>
