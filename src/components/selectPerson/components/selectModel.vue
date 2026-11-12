

<template>
    <base-modal :unmount-on-close="true" ref="modalRef" @handle-ok="formSubmit" @handle-cancel="handleCancel">
        <div class="model">
                        <personList :formConfs="formConfs" :deptIds="deptIds" :comDes="comDes" :users="userList" :deptList="deptList" ref="personListRef" />
             
        </div>
    </base-modal>
</template>
<script setup lang="ts">
import personList from './personListCheck.vue'
import { getDeptTree, getUserList } from '@/api/common/index'
import { ref, reactive, toRaw, watch } from 'vue'
import { setDataFormList } from '@/data/data_form'
import { Message } from '@arco-design/web-vue'
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
const deptIds = ref([])
const showItem = (item: any) => {
    userList.value = item
       if (props.comDes.props.rangeType == 'DEPT_FIELD') {
        let list = []
        setDataFormList(props.formConfs.formList, list);
        list.map(v => {

            if (v.id == props.comDes.props.deptField) {
                if (v.type == 'DEPT_MULTIPLE') {
                    if (v.props.value.length > 0) {
                        v.props.value.map(v1 => {
                            deptIds.value.push(v1.id)
                        })
                        modalRef.value.handleClick({
                            title: props.title,
                            okText: '完成',
                            cancelText: '关闭',
                            showBtn: true,
                            width: '720px',
                        })
                    } else {
                        Message.error(`请输入选择选${v.title}`)
                        return
                    }
                } else if (Array.isArray(v.props.value) && v.props.value.length > 0) {
                    deptIds.value = [v.props.value[0].id]
                    modalRef.value.handleClick({
                        title: props.title,
                        okText: '完成',
                        cancelText: '关闭',
                        showBtn: true,
                        width: '720px',
                    })
                } else {
                    Message.error(`请输入选择选${v.title}`)
                    return
                }
            }
        })
    } else {
        modalRef.value.handleClick({
            title: props.title,
            okText: '完成',
            cancelText: '关闭',
            showBtn: true,
            width: '720px',
        })
    }
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