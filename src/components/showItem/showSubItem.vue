<template>
    <a-form-item label="" :field="comDes.id" :hide-label="true">
        <component :is="comDes.component" 
                   :formConfs="formConfs"
                   :deptList="deptList" 
                   :showEdit="showEdit" 
                   :activeForm="activeForm" 
                   :comDes="comDes" />
    </a-form-item>
</template>

<script lang="ts" setup>
import { inject, watch } from 'vue'
import { executeFieldScript } from '@/utils/fieldScriptExecutor'

const props = defineProps<{
    comDes: any,
    comDesList: any,
    activeForm: any,
    deptList: any,
    showEdit: boolean,
    formConfs: any,
}>()

const provideState = inject("provideDesigner") as {
    filterData: (...args: any) => void;
}

const syncSubformValue = () => {
    if (props.showEdit) return

    // 子字段拥有独立的表单 field/rule，必须先同步自身值，
    // 否则界面已有值时 Arco Form 仍会按 undefined 执行必填校验。
    provideState?.filterData(props.comDes)

    const values: Record<string, any> = {}
    if (Array.isArray(props.comDesList.list)) {
        props.comDesList.list.forEach((row: any[]) => {
            row.forEach((field: { id: string; field?: string; props: { value: any } }) => {
                const fieldKey = field.id.split('.')[1] || field.field || field.id
                if (fieldKey) values[fieldKey] = field.props.value
            })
        })
    }
    props.comDesList.props.value = values
    provideState?.filterData(props.comDesList)
}

const handleChange = async (shouldRunInputMethod = true, value?: unknown, oldValue?: unknown) => {
    // 执行组件自定义方法
    if (shouldRunInputMethod && props.comDes.method && props.comDes.method.input) {
        try {
            await executeFieldScript(props.comDes.method.input, {
                field: props.comDes,
                formConfs: props.formConfs,
                value,
                oldValue,
                provideState,
            })
        } catch (error) {
            console.error('代码执行出错:', error);
        }
    }

    syncSubformValue()
}

// 监听 comDes.props.value 变化
watch(
    () => props.comDes?.props?.value,
    (newValue, oldValue) => {
        void handleChange(oldValue !== undefined, newValue, oldValue)
    },
    { deep: true, immediate: true },
)
</script>

<style lang="scss" scoped>
// 样式可以根据需要添加
</style>
