<template>
    <base-modal :unmount-on-close="true" ref="modalRef" @handle-ok="formSubmit" @handle-cancel="handleCancel">
        <div class="model">

            <deptRadioList :comDes="comDes" :deptList="deptList" ref="deptRadioListRef" />

        </div>
    </base-modal>
</template>
<script setup lang="ts">
import deptRadioList from './deptRadioList.vue'
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
    comDes: { type: Object, default: () => { } },
    deptList: { type: Array, default: [] },
    title: { type: String, default: '选择人员' },
});
const deptRadioListRef = ref()
interface FormDataType {
    username?: string;
    userIds?: Array<t>;
}
const formData = reactive<FormDataType>({
    username: '',
    userIds: []
});
const showItem = (item: any) => {
    // userList.value = item
    modalRef.value.handleClick({
        title: props.title,
        okText: '完成',
        cancelText: '关闭',
        showBtn: true,
        width: '720px',
    })
    if (item && item.length > 0) {
        let datas = item.map((v: any) => {
            return v.id
        })
        setTimeout(() => {
            deptRadioListRef.value.setData(datas)
        }, 100)
    }
}
const handleCancel = () => {
    userList.value = []
    deptRadioListRef.value.clearData()
}
const formSubmit = () => {
    let datas = deptRadioListRef.value.getDeptData()
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

.item {
    padding: 16px;
}
</style>