<template>

    <div class="deptListPicker">

        <div class="person-search">

            <a-input allow-clear v-model="searchKeyword" placeholder="搜索..." />

        </div>

        <div class="deptList">

            <a-tree :fieldNames="{

                key: 'id',

                title: 'label',

            }" blockNode :checkable="true" :check-strictly="true" v-model:checked-keys="checkedKeys" @check="checkItem"
                :data="filteredDeptList" :virtual-list-props="{ height: 200 }">

                <template #icon="node">

                    <i class="fas fa-building" style="width:20px;text-align:center;color:#94a3b8;font-size:13px;"></i>

                </template>

            </a-tree>

        </div>

    </div>

</template>



<script lang="ts" setup>

import { ref, inject, computed } from 'vue'

import { filterTreeByLabel } from '@/utils/orgListFilter'



const props = defineProps({

    deptList: { type: Array, default: [] },

});

const provideState = inject("provideDesigner") as {

    setForms: (...args: any) => void;

};

const searchKeyword = ref('')

const checkedKeys = ref([])

const deptIds = ref([])



const filteredDeptList = computed(() =>

    filterTreeByLabel(props.deptList as Array<{ label?: string; children?: any[] }>, searchKeyword.value),

)



const getData = (list: any) => {

    list.map((v: { id: any; children: any }) => {

        checkedKeys.value.map((v1: any) => {

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

const getDeptData = () => {

    return deptIds.value

}

const checkItem = () => {

    deptIds.value = []

    getData(props.deptList)

    provideState.setForms('deptIds', deptIds.value)

}

const updateItem = (data: any) => {

    checkedKeys.value = []

    data.map((v: { id: any; }) => {

        checkedKeys.value.push(v.id)

    })

}

const clearData = () => {

    checkedKeys.value = []

    deptIds.value = []

    searchKeyword.value = ''

}

const setData = (data: any) => {

    checkedKeys.value = data

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

    height: 216px;

    overflow: hidden;

    //@include personModal.dsp-org-panel;

    padding: 8px;
    box-sizing: border-box;

    margin-top: 0;

    :deep(.arco-tree),
    :deep(.arco-tree-list),
    :deep(.arco-virtual-list) {
        height: 100%;
    }







    :deep(.arco-tree-node-title) {

        border-radius: 6px;

        transition: background 0.15s;

    }



    :deep(.arco-tree-node-title:hover) {

        background: #f8fafc;

    }



    :deep(.arco-tree-node-selected .arco-tree-node-title) {

        background: #eff6ff;

        color: #2563eb;

    }

}
</style>
