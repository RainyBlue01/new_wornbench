<template>
    <div class="jobsListPicker">
        <div class="person-search">
            <a-input allow-clear v-model="searchKeyword" placeholder="搜索..." />
        </div>
        <div class="jobsList">
            <a-checkbox-group :style="{ width: '100%' }" v-model="data" @change="handleChange">
                <a-list :bordered="false" :scrollbar="{ type: 'track' }" :virtualListProps="{
                    height: 200,
                }" :data="filteredPostList">
                    <template #item="{ item, index }">
                        <a-list-item :key="index">
                            <a-checkbox :value="item.id"><i class="fas fa-briefcase" style="width:20px;text-align:center;color:#94a3b8;font-size:13px;margin-right:5px;"></i>{{ item.postName }}</a-checkbox>
                        </a-list-item>
                    </template>
                </a-list>
            </a-checkbox-group>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, inject, computed } from 'vue'
import { filterListByKeyword } from '@/utils/orgListFilter'

const props = defineProps({
    postList: { type: Array, default: [] },
});
const searchKeyword = ref('')
const data = ref([])
const provideState = inject("provideDesigner") as {
    setForms: (...args: any) => void;
};

const filteredPostList = computed(() =>
    filterListByKeyword(
        props.postList as Array<{ id: any; postName?: string }>,
        searchKeyword.value,
        (item) => item.postName || '',
    ),
)

const handleChange = () => {
    let postIds: { id: any; }[] = []
    props.postList.map((v: { id: any; }) => {
        data.value.map((v1: any) => {
            if (v.id == v1) {
                postIds.push(v)
            }
        })

    })
    provideState.setForms('postIds', postIds)
}
const updateItem = (val: any) => {
    data.value = []

    val.map((v: { id: any; }) => {
        data.value.push(v.id)
    })

}
const setData = (datas: any) => {
    data.value = datas
    handleChange()
}
defineExpose({
    updateItem, setData
})
</script>

<style lang="scss" scoped>
@use "@/styles/person-modal.scss" as personModal;

.jobsListPicker {
    width: 100%;
    display: flex;
    flex-direction: column;
}

.person-search {
    @include personModal.dsp-org-search;
    flex-shrink: 0;
}

.jobsList {
    width: 100%;
    height: 216px;
    overflow: hidden;
    @include personModal.dsp-org-panel;
    padding: 8px;
    box-sizing: border-box;

    :deep(.arco-list-wrapper),
    :deep(.arco-list-spin),
    :deep(.arco-spin-children),
    :deep(.arco-scrollbar) {
        height: 100%;
    }

    :deep(.arco-scrollbar-track-direction-vertical) {
        display: block !important;
    }
}
</style>
<style lang="scss">
.jobsList {
    .arco-list-item {
        border: 0 !important;
        padding: 5px 0 !important;
    }
}
</style>
