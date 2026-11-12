<template>
    <base-modal :unmount-on-close="true" ref="modalRef" @handle-ok="formSubmit" @handle-cancel="handleCancel">
        <div class="model">

            <div class="item">
                <deptLists :comDes="comDes" :deptList="deptList" :restrict-to-range="restrictToRange"
                    ref="deptListRef" />
            </div>
        </div>
    </base-modal>
</template>
<script setup lang="ts">
import deptLists from './deptListCheck.vue'
import { ref } from 'vue'
const modalRef = ref()
const emits = defineEmits([
    'setData',
])
const userList = ref([])
const props = defineProps({
    comDes: { type: Object, default: () => { } },
    deptList: { type: Array, default: [] },
    title: { type: String, default: '选择部门' },
    restrictToRange: { type: Boolean, default: true },
});
const deptListRef = ref()
const showItem = (item: any) => {
    console.log(item)

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
            deptListRef.value.setData(datas)
        }, 100)
    }


}
const handleCancel = () => {
    userList.value = []
    deptListRef.value.clearData()
}
const formSubmit = () => {
    let datas = deptListRef.value.getDeptData()
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
