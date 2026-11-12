<template>
  <BaseModal :unmount-on-close="true" ref="modalRef" @handle-ok="handleSubmit" @handle-cancel="handleCancel">
    <a-form ref="refForm" :style="{ width: '100%' }" :model="formData" layout="vertical" class="fill-person-modal" scroll-to-first-error>
      <a-form-item field="title" :label="title">
        <div class="select">
          <a-tag v-for="(tag, index) of formData.deptIds" :key="index">
            <div class="tag">
              <div class="tag-name">
                {{ tag.label }}
              </div>
              <div class="close" @click.stop="removeTag(1, index)">
                <icon-close/>
              </div>
            </div>
          </a-tag>
         
          <a-tag v-for="(tag, index) of formData.postIds" :key="index">
            <div class="tag">
              <div class="tag-name">
                {{ tag.postName }}
              </div>
              <div class="close" @click.stop="removeTag(2, index)">
                <icon-close/>
              </div>
            </div>
          </a-tag>
        
          <a-tag v-for="(tag, index) of formData.roleIds" :key="index">
            <div class="tag">
              <div class="tag-name">
                {{ tag.roleName }}
              </div>
              <div class="close" @click.stop="removeTag(3, index)">
                <icon-close/>
              </div>
            </div>
          </a-tag>
          
          <a-tag v-for="(tag, index) of formData.userIds" :key="index">
            <div class="tag">
              <div class="tag-name">
                {{ tag.nickname }}
              </div>
              <div class="close" @click.stop="removeTag(4, index)">
                <icon-close/>
              </div>
            </div>
          </a-tag>
          <span v-if="!hasSelection" class="person-form-picker__placeholder">{{ title }}</span>
        </div>
      </a-form-item>
      <a-form-item field="district" label="选区">
        <div class="district">
          <a-tabs v-model="activeKey" auto-switch :justify="true">
            <a-tab-pane key="1">
              <template #title><i class="fas fa-building" style="margin-right:4px;" />部门</template>
              <DeptList :deptList="deptList" ref="deptListRef"/>
            </a-tab-pane>
            <a-tab-pane key="2">
              <template #title><i class="fas fa-briefcase" style="margin-right:4px;" />职位</template>
              <JobsList :postList="postList" ref="jobsListRef"/>
            </a-tab-pane>
            <a-tab-pane key="3">
              <template #title><i class="fas fa-user-tag" style="margin-right:4px;" />角色</template>
              <RolesList :roleList="roleList" ref="rolesListRef"/>
            </a-tab-pane>
            <a-tab-pane key="4">
              <template #title><i class="fas fa-user" style="margin-right:4px;" />人员</template>
              <PersonList showUser :deptList="deptList" ref="personListRef"/>
            </a-tab-pane>
          </a-tabs>
        </div>
      </a-form-item>
    </a-form>
  </BaseModal>
</template>

<script setup lang="ts">
import {nextTick, provide, reactive, ref,computed} from "vue";
import BaseModal from "@/components/modal/baseModal.vue";
import DeptList from "@/components/selectPerson/components/deptList.vue";
import JobsList from "@/components/selectPerson/components/jobsList.vue";
import RolesList from "@/components/selectPerson/components/rolesList.vue";
import PersonList from "@/components/selectPerson/components/personList.vue";
import {getDeptTree, getPostList, getRoleList} from "@/api/common";

interface FormDataType {
  deptIds: any,
  postIds: any,
  roleIds: any,
  userIds: any,
}

const props = defineProps({
  modalTitle: {type: String, default: '设置填报人员范围'},
  title: {type: String, default: '填报人员'},
});

const emits = defineEmits(['setData'])

const formData = reactive<FormDataType>({
  deptIds: [],
  postIds: [],
  roleIds: [],
  userIds: [],
});
const activeKey = ref('1')

const modalRef = ref()
const refForm = ref()

const deptListRef = ref()
const jobsListRef = ref()
const rolesListRef = ref()
const personListRef = ref()

const deptList = ref([])
const postList = ref([])
const roleList = ref([])

const getBasicData = async () => {
  const [depts, roles, posts] = await Promise.all([getDeptTree(), getRoleList(), getPostList(),]);
  deptList.value = depts
  roleList.value = roles
  postList.value = posts
}
const hasSelection = computed(() => {
  
    return !!(
       formData.deptIds?.length ||
        formData.postIds?.length ||
        formData.roleIds?.length ||
        formData.userIds?.length 
    )
})
const showModal = (data: any) => {
  getBasicData();
  modalRef.value.handleClick({
    title: props.modalTitle,
    okText: '确认',
    cancelText: '取消',
    showBtn: true,
    width: '720px',
  })
  if (data) {
    let a = JSON.parse(JSON.stringify(data))
    formData.deptIds = a.deptIds
    formData.postIds = a.postIds
    formData.roleIds = a.roleIds
    formData.userIds = a.userIds
    nextTick(() => {
      deptListRef.value.updateItem(formData.deptIds)
      jobsListRef.value.updateItem(formData.postIds)
      rolesListRef.value.updateItem(formData.roleIds)
      personListRef.value.updateItem(formData.userIds)
    })
  }
}
const removeTag = (val: any, index: number) => {
  if (val == 1) {
    formData.deptIds.splice(index, 1)
    deptListRef.value.updateItem(formData.deptIds)
  }
  if (val == 2) {
    formData.postIds.splice(index, 1)
    jobsListRef.value.updateItem(formData.postIds)
  }
  if (val == 3) {
    formData.roleIds.splice(index, 1)
    rolesListRef.value.updateItem(formData.roleIds)
  }
  if (val == 4) {
    formData.userIds.splice(index, 1)
    personListRef.value.updateItem(formData.userIds)
  }
}

const handleSubmit = () => {
  let data = JSON.parse(JSON.stringify(formData))
  emits("setData", data)
  handleCancel()
  modalRef.value.handleClose()
}

const handleCancel = () => {
  formData.deptIds = []
  formData.postIds = []
  formData.roleIds = []
  formData.userIds = []
  nextTick(() => {
    deptListRef.value.updateItem(formData.deptIds)
    jobsListRef.value.updateItem(formData.postIds)
    rolesListRef.value.updateItem(formData.roleIds)
    personListRef.value.updateItem(formData.userIds)
  })
}

const setForms = (val: any, item: any) => {
  formData[val] = JSON.parse(JSON.stringify(item))
}

provide("provideDesigner", {setForms});

defineExpose({
  showModal,
})
</script>

<style scoped lang="scss">
@use "@/styles/person-modal.scss" as personModal;

.tag {
  display: flex;
  align-items: center;
  color: #334155;
  font-size: 13px;

  .tag-name {
    max-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .close {
    margin-left: 4px;
    cursor: pointer;
    color: #94a3b8;
    display: inline-flex;
    align-items: center;

    &:hover {
      color: #64748b;
    }
  }
}

.district {
  width: 100%;
  @include personModal.dsp-org-tabs;

  :deep(.arco-tabs-content) {
    padding-left: 0;
    padding-right: 0;
  }
}

.select {
  @include personModal.dsp-org-trigger;
}

    .person-form-picker__placeholder {
        font-size: 13px;
        color: #cbd5e1;
          margin-left: 8px;
        line-height: 26px;
    }
</style>
<style lang="scss">
.fill-person-modal{
.arco-tabs-nav-tab-list{
    width: 100%;
  }
  .arco-tabs-tab{
    width: 25% !important;
  }
}

</style>
