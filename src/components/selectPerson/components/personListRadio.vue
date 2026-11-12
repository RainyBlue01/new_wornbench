<template>
    <div class="personPicker">
        <div class="person-search">
            <a-input allow-clear @change="getUser" v-model="name" placeholder="搜索..."></a-input>
        </div>
        <div ref="splitContainer" class="personList" :class="{ 'is-resizing': isResizing }">
            <div class="left" :style="{ width: `${leftPanelWidth}px` }">
                <div class="col-head">部门</div>
                <div class="left-body">
                     <a-tree v-if="deptLists.length > 0" checkable :fieldNames="{
                         key: 'id',
                         title: 'label',
                     }" blockNode v-model:checked-keys="selectedKeys" v-model:expanded-keys="expandedKeys"
                         @check="handleDeptCheck" :data="deptLists">
                    </a-tree>
                     <a-tree v-else checkable :fieldNames="{
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
                <div class="right-body">
                    <a-radio-group :style="{ width: '100%' }" v-model="data" @change="handleChange">
                        <a-list :bordered="false" :virtualListProps="{
                            height: 250,
                        }" :data="userlist">
                            <template #item="{ item, index }">
                                <a-list-item :key="index">
                                    <a-radio :value="item.id"> <div class="iconName"  :class="[getAvatarColor(index)]" v-if="item.nickname">
                                      {{ item.nickname.substring(0, 1) }}
                                    </div>{{ item.nickname }}</a-radio>
                                </a-list-item>
                            </template>
                        </a-list>
                    </a-radio-group>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch, useTemplateRef } from 'vue'
import { userComponentList as getUserList, getDeptByUser } from '@/api/common/index'
import { useHorizontalSplit } from '../composables/useHorizontalSplit'

const splitContainerRef = useTemplateRef<HTMLElement>('splitContainer')
const { leftPanelWidth, isResizing, startResize } = useHorizontalSplit(splitContainerRef)

const props = defineProps({
    formConfs: { type: Object, default: () => { } },
    comDes: { type: Object, default: () => { } },
    deptList: { type: Array, default: [] },
    users: { type: Array, default: [] },
    deptIds: { type: Array, default: [] },
});
const userlist = ref([])
const deptLists = ref([])
const name = ref('')
const AllUser = ref([])
const selectedKeys = ref([])
const expandedKeys = ref([])
const indeterminate = ref(false)
const checkedAll = ref(false)
const data = ref('')
watch(
    () => props.users,
    (newVal) => {
        if (Array.isArray(newVal) && newVal.length > 0) {
            data.value = newVal[0]?.id ?? ''
        } else {
            data.value = ''
        }
    },
    { immediate: true }
);

const getUser = () => {
    if (props.comDes) {
     let deptIds = Array.isArray(props.deptIds) ? [...props.deptIds] : []
       
        if (props.comDes.props.rangeType == 'CUSTOM' && props.comDes.props.range.length > 0 && !props.comDes.props.currentUserDept) {
            props.comDes.props.range.map(v => {
                deptIds.push(v.id)
            })
        }
        let params = {
            nickname: name.value,
            deptIds: selectedKeys.value.length > 0 ? selectedKeys.value.join(',') : deptIds.join(','),
            userType: 1
        }
        if (props.comDes.props.rangeType == 'CUSTOM' && Array.isArray(props.comDes.props.range)) {
            deptLists.value = props.comDes.props.range.map((v: any) => ({
                id: v.id,
                label: v.label || v.deptName || v.name || '',
            }))
        }
        let userId = localStorage.getItem('wornbench_userId')
        if (props.comDes.props.currentUserDept) {
            let params = {
                userId: userId,
                partTime: 0,
                lower: false
            }
            getDeptByUser(params).then(res => {
                deptLists.value = res.map((v => {
                    return { id: v.id, label: v.deptName }
                }))
            })
        }
        getUserList(params).then(res => {

            if (props.comDes.props.currentUserDept) {
                res = res.filter(v => v.id == userId)
            }
            userlist.value = res ? res.map((v => {
                return { id: v.userId, nickname: v.nickname }
            })) : []
            if (AllUser.value.length == 0) {
                AllUser.value = JSON.parse(JSON.stringify(userlist.value))
            }
            // handleChange(data.value)
        })
    } else {

        let params = {
            nickname: name.value,
            deptIds: selectedKeys.value.length > 0 ? selectedKeys.value.join(',') : '',
            userType: 1
        }
        getUserList(params).then(res => {
            userlist.value = res ? res.map((v => {
                return { id: v.userId, nickname: v.nickname }
            })) : []
            if (AllUser.value.length < res.length) {
                AllUser.value = JSON.parse(JSON.stringify(userlist.value))
            }
            // handleChange(data.value)
        })
    }

}
getUser()

const handleDeptCheck = () => {
    name.value = ''
    getUser()
}

const handleChange = () => {

}
const getData = () => {
    let datas = {} as any
    if (Array.isArray(AllUser.value) && data.value) {

        AllUser.value.map(v1 => {
            if (v1.id == data.value) {
                datas = v1
            }
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
    data.value = ''
}
const getAvatarColor = (index: number) => {
  const colors = ['gradient-red', 'gradient-blue', 'gradient-green'];
  return colors[index % 3];
};
const updateItem = (val: any) => {
    data.value = ''

    val.map((v: { id: any; }) => {
        data.value.push(v.id)
    })
    // handleChange(data.value)
}
const setData = (datas: any) => {
    data.value = datas
}
defineExpose({
    getData, clearData, updateItem, setData, getUser
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

        .right-body {
            @include personModal.dsp-org-panel;
            flex: 1;
            min-height: 0;
            overflow-y: auto;
            padding: 8px 12px;
        }
    }
}
.iconName{
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
.gradient-blue{
     color: #2563eb;
    background: #dbeafe;
}
.gradient-green{
       color: #16a34a;
  background: #dcfce7;
}
.gradient-red{
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
