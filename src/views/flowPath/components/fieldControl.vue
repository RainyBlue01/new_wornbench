<template>
    <div class="form-designer-prop-group fieldControl">
        <div class="form-designer-prop-section-title">当前节点可见内容</div>
        <div class="form-designer-perm-table-header">
            <div class="form-designer-perm-th-field">字段</div>
            <div class="form-designer-perm-th-action">
                <a-checkbox v-model="selectAlledit" :indeterminate="editIndeterminate" @change="alledit">写</a-checkbox>
            </div>
            <div class="form-designer-perm-th-action">
                <a-checkbox v-model="selectAllview" :indeterminate="viewIndeterminate" @change="allview">读</a-checkbox>
            </div>
            <div class="form-designer-perm-th-action">
                <a-checkbox v-model="selectAllpush" :indeterminate="pushIndeterminate" @change="allpush">推</a-checkbox>
            </div>
        </div>
        <div
            class="form-designer-perm-table-row"
            v-for="(item, index) in activeFlew.fieldControl"
            :key="index"
        >
            <div class="form-designer-perm-td-field">{{ item.title }}</div>
            <div class="form-designer-perm-td-action">
                <a-checkbox v-model="item.edit" @change="changeAllEdit" :disabled="item.disabled" />
            </div>
            <div class="form-designer-perm-td-action">
                <a-checkbox v-model="item.view" @change="changeAllView" />
            </div>
            <div class="form-designer-perm-td-action">
                <a-checkbox v-model="item.push" @change="changeAllPush" :disabled="item.disabled" />
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref, watch } from 'vue';

type FieldPermission = 'edit' | 'view' | 'push'
type FieldControlItem = {
    title?: string
    edit?: boolean
    view?: boolean
    push?: boolean
    disabled?: boolean
}

const props = defineProps<{
    activeFlew: any,
}>()

const selectAlledit = ref(false)
const selectAllview = ref(false)
const selectAllpush = ref(false)
const editIndeterminate = ref(false)
const viewIndeterminate = ref(false)
const pushIndeterminate = ref(false)

const getFields = () => (props.activeFlew?.fieldControl || []) as FieldControlItem[]
const getAvailableFields = (permission: FieldPermission) => {
    const fields = getFields()
    return permission === 'view' ? fields : fields.filter((item) => !item.disabled)
}

const setSelectState = (permission: FieldPermission, checked: boolean, indeterminate: boolean) => {
    if (permission === 'edit') {
        selectAlledit.value = checked
        editIndeterminate.value = indeterminate
    }
    if (permission === 'view') {
        selectAllview.value = checked
        viewIndeterminate.value = indeterminate
    }
    if (permission === 'push') {
        selectAllpush.value = checked
        pushIndeterminate.value = indeterminate
    }
}

const syncSelectState = (permission: FieldPermission) => {
    const fields = getAvailableFields(permission)
    const checkedCount = fields.filter((item) => item[permission] === true).length
    setSelectState(
        permission,
        fields.length > 0 && checkedCount === fields.length,
        checkedCount > 0 && checkedCount < fields.length,
    )
}

const syncAllSelectState = () => {
    syncSelectState('push')
    syncSelectState('view')
    syncSelectState('edit')
}

const alledit = (val: any) => {
    getAvailableFields('edit').forEach((item) => {
        item.edit = val
        if (val) {
            item.view = true
        }
    })
    syncSelectState('edit')
    syncSelectState('view')
}

const allview = (val: any) => {
    getAvailableFields('view').forEach((item) => {
        item.view = val
    })
    syncSelectState('view')
}

const allpush = (val: any) => {
    getAvailableFields('push').forEach((item) => {
        item.push = val
    })
    syncSelectState('push')
}

const changeAllPush = () => {
    syncSelectState('push')
}

const changeAllView = () => {
    syncSelectState('view')
}

const changeAllEdit = () => {
    getFields().forEach((item) => {
        if (item.edit === true) {
            item.view = true
        }
    })
    syncSelectState('edit')
    syncSelectState('view')
}

watch(
    [
        () => props.activeFlew?.id,
        () => props.activeFlew?.fieldControl,
    ],
    syncAllSelectState,
    {
        immediate: true,
        deep: true,
    },
)
</script>

<style lang="scss" scoped>
@use "@/styles/form-designer.scss";
</style>
