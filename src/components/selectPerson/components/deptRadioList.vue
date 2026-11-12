<template>
    <div class="deptListPicker">
        <div class="person-search">
            <a-input allow-clear v-model="searchKeyword" placeholder="搜索..." />
        </div>
        <div class="deptList">
            <a-empty v-if="filteredDeptList.length === 0" class="dept-empty" description="暂无部门数据" />
            <a-tree v-else :fieldNames="{
                key: 'id',
                title: 'label',
            }" blockNode v-model:selected-keys="selectedKeys" @select="checkItem" :data="filteredDeptList">
                <template #icon="node">
                    <i class="fas fa-building" style="width:20px;text-align:center;color:#94a3b8;font-size:13px;"></i>
                </template>
            </a-tree>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { getDeptByUser } from '@/api/common/index'
import { ref, computed } from 'vue'
import { filterTreeByLabel } from '@/utils/orgListFilter'

const props = defineProps({
    comDes: { type: Object, default: () => ({ props: {} }) },
    deptList: { type: Array, default: () => [] },
});
const searchKeyword = ref('')
const deptLists = ref<Array<{ id: any; label: string; children?: any[] }>>([])
const selectedKeys = ref([])
const deptIds = ref([])
const componentProps = computed(() => props.comDes?.props ?? {})
const hasDeptRange = computed(() =>
    Boolean(
        componentProps.value.currentUserSecondaryDept
        || componentProps.value.currentUserMainDept
        || componentProps.value.currentUserLowerDept
        || (componentProps.value.rangeType === 'CUSTOM'
            && Array.isArray(componentProps.value.range)
            && componentProps.value.range.length > 0),
    ),
)

const sourceDeptList = computed(() =>
    hasDeptRange.value ? deptLists.value : (props.deptList as any[]),
)

const filteredDeptList = computed(() =>
    filterTreeByLabel(sourceDeptList.value, searchKeyword.value),
)

const getData = (list: any) => {
    list.map((v: { id: any; children: any }) => {
        selectedKeys.value.map((v1: any) => {
            if (v.id == v1) {
                deptIds.value.push(v)
            }
        })
        if (v.children) {
            getData(v.children)
        }
    })
    return deptIds.value
}
const getList = () => {
    let userId = localStorage.getItem('wornbench_userId')
    const config = componentProps.value
    if (config.currentUserSecondaryDept || config.currentUserMainDept || config.currentUserLowerDept) {
        let parmas = {
            userId: userId,
            partTime: config.currentUserSecondaryDept ? 1 : 0,
            lower: config.currentUserLowerDept,
        }
        getDeptByUser(parmas).then(res => {
            deptLists.value = (Array.isArray(res) ? res : []).map((v => { return { id: v.id, label: v.deptName } }))
        })
    } else if (config.rangeType == 'CUSTOM' && Array.isArray(config.range) && config.range.length > 0) {
        deptLists.value = config.range.map((v: any) => ({
            id: v.id,
            label: v.label || v.deptName || v.name || '',
        }))
    }
}
getList()
const getDeptData = () => {
    return deptIds.value
}
const checkItem = () => {
    deptIds.value = []
    getData(sourceDeptList.value)
}
const updateItem = (data: any) => {
    selectedKeys.value = []
    data.map((v: { id: any; }) => {
        selectedKeys.value.push(v.id)
    })
}
const clearData = () => {
    selectedKeys.value = []
    deptIds.value = []
    searchKeyword.value = ''
}
const setData = (data: any) => {
    selectedKeys.value = data
    checkItem()
}
defineExpose({
    updateItem, setData, getDeptData, clearData
})
</script>

<style lang="scss" scoped>
@use "@/styles/person-modal.scss" as personModal;

.deptListPicker {
    width: 100%;
    display: flex;
    flex-direction: column;
}

.person-search {
    @include personModal.dsp-org-search;
    flex-shrink: 0;
}

.deptList {
    width: 100%;
    height: 248px;
    overflow-y: auto;
    @include personModal.dsp-org-panel;
    padding: 8px;
}

.dept-empty {
    margin-top: 56px;
}
</style>
