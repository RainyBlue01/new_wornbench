<template>
    <a-select v-bind="comDes.props" allow-clear allow-search :loading="loading" @change="inputItem"
        :placeholder="comDes.title" v-model="comDes.props.value" />
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue'
import {
    refreshSelectComponentOptions,
    isOtherFormDataSource,
} from '@/utils/formSelectOptions'

const props = defineProps<{
    comDes: any,
    formConfs: any,
}>()

const loading = ref(false)

const fetchOptions = async () => {
    if (!isOtherFormDataSource(props.comDes.props)) return
    if (!props.comDes.props.sourceFormCode || !props.comDes.props.sourceFieldCode) return

    loading.value = true
    try {
        await refreshSelectComponentOptions(props.comDes, props.formConfs)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchOptions()
})

watch(
    () => [
        props.comDes.props?.dataSourceType,
        props.comDes.props?.sourceFormCode,
        props.comDes.props?.sourceFieldCode,
        props.comDes.props?.sourceAppId,
        props.comDes.props?.sortField,
        props.comDes.props?.sortOrder,
        props.comDes.props?.conditionType,
        JSON.stringify(props.comDes.props?.conditionList),
    ],
    () => {
        fetchOptions()
    },
)

const inputItem = () => {
    if (props.comDes.method?.input) {
        try {
            // eval(props.comDes.method.input);
        } catch (error) {
            console.error('代码执行出错:', error)
        }
    }
}
</script>

<style lang="scss" scoped>
@use "styles/textColor.scss" as textColor;

.input {
    width: 100%;
}
</style>
