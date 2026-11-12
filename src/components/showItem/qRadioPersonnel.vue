<template>
      <selectRadioPerson :formConfs="formConfs" :comDes="comDes" :deptList="deptList" :placeholder="comDes.props.placeholder" v-model="selectedUsers" />
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
    comDes: any,
    showEdit: any,
    deptList:any,
    formConfs: any,
}>()

const normalizeSelection = (value: unknown): any[] => {
    if (Array.isArray(value)) return value
    if (typeof value !== 'string' || value.trim() === '') return []

    try {
        const parsed = JSON.parse(value)
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

if (!Array.isArray(props.comDes.props.value)) {
    props.comDes.props.value = normalizeSelection(props.comDes.props.value)
}

const selectedUsers = computed<any[]>({
    get: () => normalizeSelection(props.comDes.props.value),
    set: (value) => {
        props.comDes.props.value = Array.isArray(value) ? value : []
    },
})
</script>

<style lang="scss" scoped>
@use "styles/textColor.scss" as textColor;

.input {
    width: 100%;
}
</style>
