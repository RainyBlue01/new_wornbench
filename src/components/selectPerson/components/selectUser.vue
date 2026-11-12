

<template>
    <base-modal :unmount-on-close="true" ref="modalRef" @handle-ok="formSubmit" @handle-cancel="handleCancel">
        <div class="model">
            <div class="model-title">
                {{ title }}
            </div>
            <div class="model-body ">
                <div class="select person-form-picker">
                    <span v-if="!hasSelection" class="person-form-picker__placeholder">{{ displayPlaceholder }}</span>
                    <a-tag v-for="(name, index) of formData.deptIds"  :key="'dept-' + index">
                        <div class="tag">
                            <div class="tag-name">
                                {{ name?.label }}
                            </div>
                            <div class="close" @click.stop="closeItem(1, Number(index))">
                                <icon-close />
                            </div>
                        </div>
                    </a-tag>
                    <a-tag v-for="(name, index) of formData.postIds"  :key="index">
                        <div class="tag">
                            <div class="tag-name">
                                {{ name?.postName }}
                            </div>
                            <div class="close" @click.stop="closeItem(2, Number(index))">
                                <icon-close />
                            </div>
                        </div>
                    </a-tag>
                    <a-tag v-for="(name, index) of formData.roleIds"  :key="index">
                        <div class="tag">
                            <div class="tag-name">
                                {{ name?.roleName }}
                            </div>
                            <div class="close" @click.stop="closeItem(3, Number(index))">
                                <icon-close />
                            </div>
                        </div>
                    </a-tag>
                    <a-tag v-for="(name, index) of formData.userIds"  :key="index">
                        <div class="tag">
                            <div class="tag-name">
                                {{ name?.nickname }}
                            </div>
                            <div class="close" @click.stop="closeItem(4, Number(index))">
                                <icon-close />
                            </div>
                        </div>
                    </a-tag>
                    <a-tag v-if="showDynamic && formData.dynamic?.deptFields?.length" v-for="(tag, index) in formData.dynamic.deptFields"  :key="tag.id"                        @close="handleCloseDeptFields(Number(index))">
                        <div class="tag">
                            <div class="tag-name">
                                {{ tag.title }}
                            </div>
                            <div class="close" @click.stop="closeItem(8, Number(index))">
                                <icon-close />
                            </div>
                        </div>
                    </a-tag>
                    <a-tag v-if="showDynamic && formData.dynamic?.userFields?.length" v-for="(tag, index) in formData.dynamic.userFields"  :key="tag.id">
                        <div class="tag">
                            <div class="tag-name">
                                {{ tag.title }}
                            </div>
                            <div class="close" @click.stop="closeItem(9, Number(index))">
                                <icon-close />
                            </div>
                        </div>
                    </a-tag>
                    <a-tag v-if="showDynamic && formData.dynamic?.deptLeader?.level?.length" v-for="(tag, index) in formData.dynamic.deptLeader.level" :key="tag.id"  >
                        <div class="tag">
                            <div class="tag-name">
                                {{ tag.label }}
                            </div>
                            <div class="close" @click.stop="closeItem(5, Number(index))">
                                <icon-close />
                            </div>
                        </div>
                    </a-tag>
                    <a-tag v-if="showDynamic && formData.dynamic?.applyUser">
                        <div class="tag">
                            <div class="tag-name">
                                流程发起人
                            </div>
                            <div class="close" @click.stop="closeItem(6, 0)">
                                <icon-close />
                            </div>
                        </div>
                    </a-tag>
                    <a-tag v-if="showDynamic && formData.dynamic?.chargeLeader?.level?.length" v-for="(tag, index) in formData.dynamic.chargeLeader.level"  :key="tag.id">
                        <div class="tag">
                            <div class="tag-name">
                                {{ tag.label }}
                            </div>
                            <div class="close" @click.stop="closeItem(7, Number(index))">
                                <icon-close />
                            </div>
                        </div>
                    </a-tag>
                </div>
            </div>
            <div class="model-title">
                选区
            </div>
            <div class="model-body fillSelect-person-modal">
                <a-tabs v-model="activeKey" auto-switch justify>
                    <a-tab-pane key="1">
                        <template #title><i class="fas fa-building" style="margin-right:4px;" />部门</template>
                        <deptLists :deptList="deptList" ref="deptListsRef" />
                    </a-tab-pane>
                    <a-tab-pane key="2">
                        <template #title><i class="fas fa-briefcase" style="margin-right:4px;" />职位</template>
                        <jobsList :postList="postList" ref="jobsListRef" />
                    </a-tab-pane>
                    <a-tab-pane key="3">
                        <template #title><i class="fas fa-user-tag" style="margin-right:4px;" />角色</template>
                        <rolesList :roleList="roleList" ref="rolesListRef" />
                    </a-tab-pane>
                    <a-tab-pane key="4">
                        <template #title><i class="fas fa-user" style="margin-right:4px;" />人员</template>
                        <personList :showUser="true" :deptList="deptList" ref="personListRef" />
                    </a-tab-pane>
                    <a-tab-pane v-if="showDynamic" key="5">
                        <template #title><i class="fas fa-bolt" style="margin-right:4px;" />动态审批人</template>
                        <dynamicApproval ref="dynamicApprovalRef" />
                    </a-tab-pane>
                </a-tabs>
            </div>
        </div>
    </base-modal>
</template>
<script setup lang="ts">
import personList from './personList.vue'
import deptLists from './deptList.vue'
import jobsList from './jobsList.vue'
import rolesList from './rolesList.vue'
import dynamicApproval from './dynamicApproval.vue'
import { ref, reactive, provide, computed } from 'vue'
const deptListsRef = ref()
const activeKey = ref('1')
const jobsListRef = ref()
const dynamicApprovalRef = ref()
const modalRef = ref()
const rolesListRef = ref()
const emits = defineEmits([
    'setData',
])
const props = defineProps({
    deptList: { type: Array, default: [] },
    postList: { type: Array, default: [] },
    roleList: { type: Array, default: [] },
    title: { type: String, default: '选择人员' },
    showDynamic: { type: Boolean, default: true }, // 控制是否显示动态审批人
});

const displayPlaceholder = computed(
    () => (props.title ? `请选择${props.title}` : '选择人员'),
)

const hasSelection = computed(() => {
    if (formData.deptIds?.length || formData.postIds?.length || formData.roleIds?.length || formData.userIds?.length) {
        return true
    }
    if (!props.showDynamic || !formData.dynamic) return false
    const dynamic = formData.dynamic
    return !!(
        dynamic.deptFields?.length ||
        dynamic.userFields?.length ||
        dynamic.deptLeader?.level?.length ||
        dynamic.chargeLeader?.level?.length ||
        dynamic.applyUser
    )
})

interface FormDataType {
    deptIds: any,
    postIds: any,
    userIds: any,
    dynamic: any,
    roleIds: any,
}
const formData = reactive<FormDataType>({
    deptIds: [],
    postIds: [],
    dynamic: {
        deptFields: [],
        userFields: [],
        deptLeader: {
            deptField: '',
            userField: '',
            applyUser: false,
            level: []
        },
        applyUser: false,
        chargeLeader: {
            deptField: '',
            userField: '',
            applyUser: false,
            level: []
        }
    },
    userIds: [],
    roleIds: [],
});
const personListRef = ref();
const showItem = (item: any) => {
    modalRef.value.handleClick({
        title: props.title,
        okText: '完成',
        cancelText: '关闭',
        showBtn: true,
        width: '900px',
    })
    if (item) {
        let a = JSON.parse(JSON.stringify(item))
        formData.deptIds = a.deptIds
        formData.postIds = a.postIds
        formData.dynamic = a.dynamic
        formData.userIds = a.userIds
        formData.roleIds = a.roleIds
        setTimeout(() => {
            deptListsRef.value?.updateItem(formData.deptIds)
            jobsListRef.value?.updateItem(formData.postIds)
            rolesListRef.value?.updateItem(formData.roleIds)
            personListRef.value?.updateItem(formData.userIds)
            dynamicApprovalRef.value?.updateItem(formData.dynamic)
        })
    }
}
const closeItem = (val: any, index: number) => {
    if (val == 1) {
        formData.deptIds.splice(index, 1)
        deptListsRef.value?.updateItem(formData.deptIds)
    }
    if (val == 2) {
        formData.postIds.splice(index, 1)
        jobsListRef.value?.updateItem(formData.postIds)
    }
    if (val == 3) {
        formData.roleIds.splice(index, 1)
        rolesListRef.value?.updateItem(formData.roleIds)
    }
    if (val == 4) {
        formData.userIds.splice(index, 1)
        personListRef.value?.updateItem(formData.userIds)
    }
    if (val == 5) {
        formData.dynamic.deptLeader.level.splice(index, 1)
        dynamicApprovalRef.value?.updateItem(formData.dynamic)
    }
    if (val == 6) {
        formData.dynamic.applyUser = false
        dynamicApprovalRef.value?.updateItem(formData.dynamic)
    }
    if (val == 7) {
        formData.dynamic.chargeLeader.level.splice(index, 1)
        dynamicApprovalRef.value?.updateItem(formData.dynamic)
    }
    if (val == 8) {
        formData.dynamic.deptFields.splice(index, 1)
         dynamicApprovalRef.value?.updateItem(formData.dynamic)
    }
     if (val == 9) {
        formData.dynamic.userFields.splice(index, 1)
         dynamicApprovalRef.value?.updateItem(formData.dynamic)
    }
}
const handleCloseDeptFields = (index: number) => {
    formData.dynamic.deptFields.splice(index, 1)
    dynamicApprovalRef.value?.updateItem(formData.dynamic)
}
const handleCancel = () => {
    formData.deptIds = []
    formData.postIds = []
    formData.dynamic = {
        deptFields: [],
        userFields: [],
        deptLeader: {
            deptField: '',
            userField: '',
            applyUser: false,
            level: []
        },
        applyUser: false,
        chargeLeader: {
            deptField: '',
            userField: '',
            applyUser: false,
            level: []
        }
    }
    formData.userIds = []
    formData.roleIds = []
    personListRef.value.clearData()
}
const formSubmit = () => {
    let data = JSON.parse(JSON.stringify(formData))
    emits("setData", data)
    handleCancel()
    modalRef.value.handleClose()
}
const setForms = (val: any, item: any) => {
    formData[val] = JSON.parse(JSON.stringify(item))
}
provide("provideDesigner", { setForms });
defineExpose({
    showItem,
})
</script>
<style lang="scss" scoped>
@use "@/styles/person-modal.scss" as personModal;

.model {
    &-title {
        display: inline-block;
        text-align: left;
        line-height: 32px;
        padding: 10px 0 0;
        font-size: 14px;
        color: #606266;
    }
}

.model-body {
    @include personModal.dsp-org-tabs;
}

.tag {
    display: flex;
    align-items: center;
    color: #334155;
    font-size: 13px;

    .close {
        margin-left: 4px;
        cursor: pointer;
        color: #94a3b8;

        &:hover {
            color: #64748b;
        }
    }
}

.select {
    @include personModal.dsp-org-trigger;
    cursor: default;

    .person-form-picker__placeholder {
        font-size: 13px;
        color: #cbd5e1;
         margin-left: 8px;
        line-height: 26px;
    }
}
</style>
<style lang="scss">
.fillSelect-person-modal{
.arco-tabs-nav-tab-list{
    width: 100%;
  }
  .arco-tabs-tab{
    width: 20% !important;
  }
}
</style>