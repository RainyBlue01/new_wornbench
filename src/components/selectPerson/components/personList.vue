<template>
    <div class="personPicker">
        <div class="person-search">
            <a-input allow-clear @change="getUser" v-model="name" placeholder="搜索..."></a-input>
        </div>
        <div ref="splitContainer" class="personList" :class="{ 'is-resizing': isResizing }">
            <div class="left" :style="{ width: `${leftPanelWidth}px` }">
                <div class="col-head">部门</div>
                <div class="left-body">
                     <a-tree checkable :fieldNames="{
                         key: 'id',
                         title: 'label',
                     }" blockNode v-model:checked-keys="selectedKeys" v-model:expanded-keys="expandedKeys"
                         @check="handleDeptCheck" :data="deptList">
                    </a-tree>
                </div>
            </div>
            <div class="split-resizer" role="separator" aria-orientation="vertical"
                aria-label="拖动调整部门和成员区域宽度" @pointerdown="startResize"></div>
            <div class="right">
                <div class="col-head">成员</div>
                <div class="allSelect">
                    <div class="allSelect-left">
                        <a-checkbox :model-value="checkedAll" :indeterminate="indeterminate"
                            @change="handleChangeAll">全选
                        </a-checkbox>
                    </div>
                    <div class="allSelect-right">
                        已选（ {{ data.length }} / {{ AllUser.length }} ）
                    </div>
                </div>
                <div class="right-body">
                    <a-checkbox-group :style="{ width: '100%' }" v-model="data" @change="handleChange">
                        <a-list :bordered="false" :virtualListProps="{
                            height: 220,
                        }" :data="userlist">
                            <template #item="{ item, index }">
                                <a-list-item :key="index">
                                    <a-checkbox :value="item.id">
                                        <div class="iconName" :class="[getAvatarColor(index)]" v-if="item.nickname">
                                            {{ item.nickname.substring(0, 1) }}
                                        </div>
                                        {{ item.nickname }}
                                    </a-checkbox>
                                </a-list-item>
                            </template>
                        </a-list>
                    </a-checkbox-group>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, inject, watch, useTemplateRef } from 'vue'
import { userComponentList } from '@/api/common/index'
import { useHorizontalSplit } from '../composables/useHorizontalSplit'

const splitContainerRef = useTemplateRef<HTMLElement>('splitContainer')
const { leftPanelWidth, isResizing, startResize } = useHorizontalSplit(splitContainerRef)
const props = defineProps({
    deptList: { type: Array, default: [] },
    users: { type: Array, default: [] },
    showUser: { type: Boolean, default: false },
});
const userlist = ref([])
const name = ref('')
const AllUser = ref([])
const selectedKeys = ref([])
const expandedKeys = ref([])
const indeterminate = ref(false)
const checkedAll = ref(false)
const data = ref([])
watch(
    () => props.users,
    (newVal) => {
        data.value = Array.isArray(newVal)
            ? [...new Set(newVal.map((item: any) => item?.id).filter((id: any) => id !== undefined && id !== null))]
            : []
    },
    { immediate: true }
);
const getUser = () => {
    let params = {
        nickname: name.value,
        userType: 1,
        deptIds: selectedKeys.value.length > 0 ? selectedKeys.value.join(',') : ''
    }
    userComponentList(params).then(res => {
        res.map(v => {
            v.id = v.id ? v.id : v.userId
        })
        userlist.value = res ? res : []
        if (AllUser.value.length == 0) {
            AllUser.value = JSON.parse(JSON.stringify(userlist.value))
        }
        handleChange(data.value)
    })
}
getUser()
const handleChangeAll = (value: any) => {
    indeterminate.value = false;
    data.value = []
    if (value) {
        checkedAll.value = true;
        userlist.value.map(v => {
            data.value.push(v.id)
        })

    } else {
        checkedAll.value = false;
    }
    if (props.showUser) {
        const roleIds = getData()
        provideState.setForms('userIds', roleIds)
    }
}
const handleDeptCheck = () => {
    name.value = ''
    getUser()
}
const provideState = inject("provideDesigner") as {
    setForms: (...args: any) => void;
};
const handleChange = (values: any) => {
    if (values.length === userlist.value.length && userlist.value.length > 0) {
        checkedAll.value = true
        indeterminate.value = false;
    } else if (values.length === 0 || userlist.value.length === 0) {
        checkedAll.value = false
        indeterminate.value = false;
    } else if (values.length > userlist.value.length && userlist.value.length > 0) {
        checkedAll.value = true
        indeterminate.value = false;
    } else {
        checkedAll.value = false
        indeterminate.value = true;
    }
    if (props.showUser) {
        const roleIds = getData()
        provideState.setForms('userIds', roleIds)
    }
}
const getData = () => {
    let datas = []
    if (Array.isArray(AllUser.value) && Array.isArray(data.value)) {
        data.value.map(v => {
            AllUser.value.map(v1 => {
                if (v1.id == v || v1.userId == v) {
                    datas.push(v1)
                }
            })
        })
    }
    return datas
}
const clearData = () => {
    checkedAll.value = false
    indeterminate.value = false
    name.value = ''
    selectedKeys.value = []
    expandedKeys.value = []
    data.value = []
}
const updateItem = (val: any) => {
    data.value = []

    val.map((v: { id: any; }) => {
        data.value.push(v.id)
    })
    handleChange(data.value)
}
const setData = (datas: any) => {
    data.value = datas
    const roleIds = getData()
    provideState.setForms('userIds', roleIds)
}
const getAvatarColor = (index: number) => {
    const colors = ['gradient-red', 'gradient-blue', 'gradient-green'];
    return colors[index % 3];
};
defineExpose({
    getData, clearData, updateItem, setData
})
</script>

<style lang="scss" scoped>
@use "@/styles/person-modal.scss" as personModal;

.personList ::v-deep {
    .arco-list-item {
        border: 0;
    }
}

.person-search {
    @include personModal.dsp-org-search;
}

.personList {
    @include personModal.dsp-org-split-headed;
    min-height: 300px;

    .left {
        display: flex;
        flex-direction: column;
        width: 180px;
        flex-shrink: 0;
        background: #f8fafc;

        .left-body {
            @include personModal.dsp-org-dept-checktree;
            flex: 1;
            min-height: 0;
            max-height: 250px;
            overflow-y: auto;
            padding: 8px;
        }
    }

    .split-resizer {
        position: relative;
        width: 7px;
        flex-shrink: 0;
        cursor: col-resize;
        touch-action: none;
        background: #f8fafc;

        &::after {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 3px;
            width: 1px;
            content: "";
            background: #e2e8f0;
            transition: background-color 0.2s;
        }

        &:hover::after {
            background: #165dff;
        }
    }

    &.is-resizing .split-resizer::after {
        background: #165dff;
    }

    .right {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;

        .allSelect {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin: 10px 12px 8px;
        }

        .right-body {
            @include personModal.dsp-org-panel;
            flex: 1;
            min-height: 0;
            overflow-y: auto;
            padding: 0 12px 8px;
        }
    }
}

.iconName {
    display: inline-flex;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    margin-right: 5px;
    font-weight: 600;
}

.gradient-blue {
    color: #2563eb;
    background: #dbeafe;
}

.gradient-green {
    color: #16a34a;
    background: #dcfce7;
}

.gradient-red {
    color: #d97706;
    background: #fef3c7;
}
</style>
<style lang="scss">
.personList {
    .arco-list-item {
        border: 0 !important;
        padding: 5px 0 !important;
    }
}
</style>
