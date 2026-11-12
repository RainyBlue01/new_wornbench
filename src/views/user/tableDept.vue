

<template>
    <div class="tableDept person-page">
        <div class="tableDept-title">
            <a-button class="btn-ghost-sm" @click="addItem">
                <template #icon> <icon-branch /></template>
                兼任
            </a-button>
        </div>
        <div class="body-table">
            <a-table
                row-key="deptId"
                :scroll="scroll"
                :pagination="false"
                :columns="columns"
                :bordered="false"
                :data="userData.userDeptList"
                class="person-table"
            >
                <template #userPostList="{ record }">
                    <span
                        v-if="Array.isArray(record.userPostList) && record.userPostList.length > 0"
                        v-for="(items, index2) in record.userPostList"
                        :key="index2"
                    >
                        {{ index2 !== 0 ? "，" : "" }}{{ items.postName }}
                    </span>
                </template>
                <template #leader="{ record }">
                    {{ record.leader == 1 ? "是" : "否" }}
                </template>
                <template #partTime="{ record }">
                    {{ record.partTime == 1 ? "是" : "否" }}
                </template>
                <template #actions="{ record }">
                    <div class="person-actions">
                        <button
                            v-if="record.partTime == 0"
                            type="button"
                            class="sg-action-btn edit"
                            title="调动"
                            @click="editItem(record)"
                        >
                            <icon-swap />
                        </button>
                        <button
                            v-if="record.partTime == 1"
                            type="button"
                            class="sg-action-btn edit"
                            title="免去兼任职务"
                            @click="removeItem(record)"
                        >
                            <icon-minus-circle />
                        </button>
                        <button
                            type="button"
                            class="sg-action-btn edit"
                            :title="record.leader == 0 ? '设置负责人' : '取消负责人'"
                            @click="setPersonItem(record)"
                        >
                            <icon-user />
                        </button>
                    </div>
                </template>
            </a-table>
        </div>
        <setPartTime @init="getIiem" :postList="postList" :deptList="deptList" ref="setPartTimeRef" />
    </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { IconPlus, IconSwap, IconMinusCircle, IconUser } from '@arco-design/web-vue/es/icon'
import setPartTime from './setPartTime.vue'
import { Modal, Message } from '@arco-design/web-vue';
import { addPartTimeDept, dismissPartTimeDept, setupDeptLeader } from '@/api/user/index'
import { hasPrimaryDept } from './utils/personDisplay'
import { useRouter } from 'vue-router'
const router = useRouter()
const scroll = { y: 400 };
const setPartTimeRef = ref()
const props = defineProps<{
    deptList: any,
    postList: any,
    userData: any,
}>()
const data = ref([])
const columns = [
    {
        title: '部门名称',
        dataIndex: 'deptName',
    },
    {
        title: '职位',
        slotName: 'userPostList',
    },
    {
        title: '是否兼任部门',
        slotName: 'partTime',
        align: 'center',
        width: 120,
    },
    {
        title: '是否负责人',
        slotName: 'leader',
        align: 'center',
        width: 100,
    },
    {
        title: '管理',
        slotName: 'actions',
        width: 120,
        align: 'center',
    },
];
const emits = defineEmits([
    'init',
])
const getIiem = () => {
    emits('init')
}
const addItem = () => {
    if (!hasPrimaryDept(props.userData)) {
        Message.warning('请先设置主要部门');
        return;
    }
    setPartTimeRef.value.showItem({ userId: props.userData.id }, 2)
}
const editItem = (record: any) => {
    setPartTimeRef.value.showItem({ ...record, userId: props.userData.id }, 1)
}
const removeItem = (record: any) => {
    Modal.confirm({
        modalClass: 'person-modal-wrap',
        title: '提示',
        simple: true,
        renderToBody: false,
        titleAlign: 'start',
        content: '确定要免去职务吗？',
        hideCancel: false,
        okText: '确认',
        onOk: async () => {
            try {
                let params = {
                    userId: props.userData.id,
                    deptId: record.deptId
                }
                dismissPartTimeDept(params).then(res => {
                    Message.success('免去职务成功');
                    getIiem()
                })
            } catch (error: any) {

            } finally {

            }
        }
    });
}
const setPersonItem = (record: any) => {
    Modal.confirm({
        modalClass: 'person-modal-wrap',
        title: '提示',
        simple: true,
        renderToBody: false,
        titleAlign: 'start',
        content: '确定要' + (record.leader == 0 ? '设置负责人' : '取消负责人') + '吗？',
        hideCancel: false,
        okText: '确认',
        onOk: async () => {
            try {
                let params = {
                    userIds: [props.userData.id],
                    deptId: record.deptId,
                    leader: record.leader == 0 ? 1 : 0
                }
                setupDeptLeader(params).then(res => {
                    Message.success((record.leader == 0 ? '设置负责人' : '取消负责人') + '成功');
                    getIiem()
                })
            } catch (error: any) {

            } finally {

            }
        }
    });
}
</script>
<style lang="scss" scoped>
@use "@/styles/system-settings.scss";

.tableDept {
    &-title {
        margin-bottom: 12px;
    }
}
</style>