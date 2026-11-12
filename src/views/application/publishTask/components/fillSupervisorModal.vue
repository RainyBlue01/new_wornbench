<template>
  <BaseModal :unmount-on-close="true" ref="modalRef" @handle-ok="handleSubmit" @handle-cancel="handleCancel">
    <a-form ref="refForm" :style="{ width: '100%' }" :model="formData" class="fill-person-modal" layout="vertical" scroll-to-first-error>
      <a-form-item field="district" >
        <div class="district">
              <PersonList showUser :deptList="deptList" ref="personListRef"/>
           
        </div>
      </a-form-item>
    </a-form>
  </BaseModal>
</template>
<script setup lang="ts">
import {nextTick, provide, reactive, ref} from 'vue'
import BaseModal from "@/components/modal/baseModal.vue";
import PersonList from "@/components/selectPerson/components/personList.vue";
import {getDeptTree} from "@/api/common";

interface FormDataType {
  userIds?: Array<t>;
}

const props = defineProps({
  modalTitle: {type: String, default: '设置任务监督员'},
});

const emits = defineEmits([
  'setData',
])

const modalRef = ref()

const refForm = ref();

const personListRef = ref()

const formData = reactive<FormDataType>({
  userIds: []
});

const deptList = ref([])

const getBasicData = async () => {
  getDeptTree().then(res => {
    deptList.value = res ? res : []
  })
}

const showModal = (data: any) => {
  getBasicData()
  modalRef.value.handleClick({
    title: props.modalTitle,
    okText: '确认',
    cancelText: '取消',
    showBtn: true,
    width: '720px',
  })
  if (data) {
    formData.userIds = JSON.parse(JSON.stringify(data))
    nextTick(() => {
      personListRef.value.updateItem(formData.userIds)
    })
  }
}

const handleSubmit = () => {
  // let data = personListRef.value.getData()
  let data = JSON.parse(JSON.stringify(formData.userIds))
  emits("setData", data)
  handleCancel()
  modalRef.value.handleClose()
}

const handleCancel = () => {
  // personListRef.value.clearData()
  formData.userIds = []
  nextTick(() => {
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
<style lang="scss" scoped>
@use "@/styles/person-modal.scss" as personModal;

.district {
  width: 100%;
  @include personModal.dsp-org-tabs;

  :deep(.arco-tabs-content) {
    padding-left: 0;
    padding-right: 0;
  }
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