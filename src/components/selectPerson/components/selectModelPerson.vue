

<template>
    <base-modal
        :unmount-on-close="true"
        ref="modalRef"
        :modal-class="modalClass"
        @handle-ok="formSubmit"
        @handle-cancel="handleCancel"
    >
        <div class="model">
                        <personList formConfs="formConfs"  :users="userList" :deptList="deptList" ref="personListRef" />
           
        </div>
    </base-modal>
</template>
<script setup lang="ts">
import personList from './personList.vue'
import { getDeptTree, getUserList } from '@/api/common/index'
import { ref, reactive, toRaw, watch } from 'vue'
import { Message, Modal } from '@arco-design/web-vue';
const refChangeForm = ref();
const modalRef = ref()
const emits = defineEmits([
    'setData',
])
const userList = ref([])
const props = defineProps({
    formConfs: { type: Object, default: () => {} },
    comDes: { type: Object, default: () => {} },
    deptList: { type: Array, default: [] },
    title: { type: String, default: '选择人员' },
    modalClass: { type: String, default: '' },
});
const personListRef = ref()
interface FormDataType {
    username?: string;
    userIds?: Array<t>;
}
const formData = reactive<FormDataType>({
    username: '',
    userIds: []
});
const showItem = (item: any) => {
    userList.value = item
    console.log(item)
    modalRef.value.handleClick({
        title: props.title,
        okText: '确定',
        cancelText: '取消',
        showBtn: true,
        width: '720px',
    })
}
const handleCancel = () => {
    userList.value = []
    personListRef.value.clearData()
}
const formSubmit = () => {
    let datas = personListRef.value.getData()
    emits("setData", datas)
    handleCancel()
    modalRef.value.handleClose()
}
defineExpose({
    showItem,
})
</script>
<style lang="scss" scoped>
.model {
    &-title {
        display: inline-block;
        text-align: left;
        line-height: 32px;
        padding: 0 0 10px;
        font-size: 14px;
        color: #606266;
    }
}
</style>