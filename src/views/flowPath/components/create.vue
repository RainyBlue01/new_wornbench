<template>
  <div>
    <base-modal ref="modalRef" @handle-ok="formSubmit" @handle-cancel="handleCancel">
      <a-form ref="refChangeForm" :style="{ width: '100%' }" :model="formData" :rules="rules" layout="vertical"
        scroll-to-first-error>

        <a-form-item field="name" label="节点名称">
          <a-input v-model="formData.name" placeholder="节点名称" :max-length="50" allow-clear show-word-limit />
        </a-form-item>

        <a-form-item field="remarks" v-show="nodeData.type !== 'BRANCH' && nodeData.type !== 'CONNECTOR' && nodeData.type !== 'PLUGIN'"
          :label="nodeData.type == 'INPUT' ? '填写人' : nodeData.type == 'APPROVE' ? '审批人' : '抄送人'">
          <formUser class="flow-node-person-picker"
            :title="nodeData.type == 'INPUT' ? '填写人' : nodeData.type == 'APPROVE' ? '审批人' : '抄送人'"
            v-model="formData.candidate" :roleList="roleList" :deptList="deptList" :postList="postList" />
        </a-form-item>
      </a-form>
    </base-modal>
  </div>
</template>
<script setup lang="ts">
import { addApp } from '@/api/homePage/index'
import { upload } from '@/api/user'

import { ref, reactive, toRaw, watch } from 'vue'
import { IconPlus, IconEdit } from '@arco-design/web-vue/es/icon';
import { Message, Modal } from '@arco-design/web-vue';
import { useRouter } from 'vue-router'
const win = window as any
const refChangeForm = ref();
const nodeData = ref({ type: 2 })
const modalRef = ref()
let props = defineProps({
  roleList: {
    type: Object,
    default: () => ([]),
  },
  deptList: {
    type: Object,
    default: () => ([]),
  },
  postList: {
    type: Object,
    default: () => ([]),
  },
})
const selectUserRef = ref()
const emits = defineEmits([
  'upDateChildNode',
])

interface FormDataType {
  name?: string;
  candidate?: Object;
}
const formData = reactive<FormDataType>({
  name: '',
  candidate: {
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
  }
});
const showItem = (item: any) => {
  nodeData.value = item
  modalRef.value.handleClick({
    title: '新增节点',
    okText: '确认',
    cancelText: '取消',
    showBtn: true,
    width: '500px',
  })
}
const changeItem = () => {
  selectUserRef.value.showItem(formData.userList)
}


const rules = ref({
  name: [
    {
      required: true,
      message: '请输入节点名称',
    },
  ],

});
const handleCancel = () => {
  formData.name = ''
  formData.candidate =  {
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
  }
  nodeData.value = {}
}
const formSubmit = () => {
  refChangeForm.value.validate((error: any) => {
    if (!error) {
      let params = JSON.parse(JSON.stringify(nodeData.value))
      params.name = formData.name
      params.candidate = formData.candidate
      emits('upDateChildNode', params)
      Message.success('新增成功');
      handleCancel()
      modalRef.value.handleClose()

    }
  });
}
defineExpose({
  showItem,
})
</script>
<style lang="scss" scoped>
.flow-node-person-picker :deep(.person-form-picker) {
  min-height: 40px;
}
</style>
