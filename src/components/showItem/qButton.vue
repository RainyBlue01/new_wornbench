<template>
    <a-button 
        v-bind="buttonProps"
        @click="handleClick"
    >
        {{ comDes.props.btnText }}
    </a-button>
</template>
  
<script lang="ts" setup>
import { computed, inject, type Ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { buttonConnector } from '@/api/form/index'
import {
    applyButtonOutput,
    buildButtonSubmitData,
    collectFormValues,
    normalizeBtnAction,
} from '@/utils/buttonAction'

const props = defineProps<{
    comDes: any,
    formConfs: any,
    showEdit?: boolean,
}>()

const provideState = inject<{
    filterData?: (field: any) => void
} | null>('provideDesigner', null)

const formModel = inject<Ref<Record<string, any>> | null>('formModel', null)

const LEGACY_STYLE_MAP: Record<number, string> = {
    1: 'primary',
    2: 'outline',
    3: 'text',
}

const buttonProps = computed(() => {
    const p = props.comDes.props || {}
    return {
        type: p.btnType || LEGACY_STYLE_MAP[p.btnStyle] || 'primary',
        shape: p.btnShape || 'square',
        status: p.btnStatus || 'normal',
        size: p.btnSize || 'medium',
        long: p.btnLong !== undefined ? !!p.btnLong : true,
    }
})

const handleClick = async () => {
    console.log(props.formConfs)
    if (props.showEdit) {
        Message.info('设计预览模式，按钮动作不会执行')
        return
    }

    const btnAction = normalizeBtnAction(props.comDes.props?.btnAction)

    if (!btnAction.connectorId || !btnAction.sceneId) {
        Message.warning('请先配置按钮动作')
        return
    }

    try {
        const formValues = formModel?.value ?? collectFormValues(props.formConfs?.formList ?? [])
        const submitData = buildButtonSubmitData(btnAction.input, formValues)

        const params: { formCode: string; submitData?: Record<string, any> } = {
            fieldCode:  props.comDes.id  || '',
            formId: props.formConfs?.id || '',
        }
        if (Object.keys(submitData).length > 0) {
            params.submitData = submitData
        }

        const res = await buttonConnector(params)

        if (res && typeof res === 'object') {
            applyButtonOutput(
                res.responseData,
                btnAction.output,
                btnAction.enableOutput,
                props.formConfs?.formList ?? [],
                provideState?.filterData,
            )
        }

        Message.success('按钮动作执行成功')
    } catch (error) {
        console.error('按钮动作执行失败:', error)
        Message.error('按钮动作执行失败，请重试')
    }
}

defineExpose({
    handleClick
})
</script>
  
<style lang="scss" scoped>
.arco-btn {
    transition: all 0.2s;
}
</style>
