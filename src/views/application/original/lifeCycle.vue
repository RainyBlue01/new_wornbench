<template>
    <a-modal :width="'40%'" title-align="start" v-model:visible="visible" :footer="false" :mask-closable="false"
        :align-center="false" unmountOnClose>
        <template #title>数据生命周期</template>

        <div class="lifeCycle">
            <div class="select">
                <a-select v-model="pagination.classify" allowClear placeholder="请选择分类" :style="{ width: '165px' }"
                    :options="opinion" @change="changeCurrent(1)">
                </a-select>
            </div>
            <a-table rowKey="id" :pagination="false" :columns="fixColumns" :data="data" :scroll="scroll"
                :scrollbar="scrollbar">
                <template #operation="row">
                    <a-space class="original-operation-cell">
                        <div class="text" @click="setData(row)" v-show="row.record.classify !=3 ">查看</div>
                    </a-space>
                </template>
            </a-table>
            <div class="lifeCycle-footer">
                <div class="lifeCycle-footer-left">
                    <span>共 {{ pagination.total }} 项数据</span>，每页显示
                    <a-select v-model="pagination.pageSize" :style="{ width: '65px' }" :options="pageOption"
                        @change="changePageSize">
                    </a-select>
                    条数据
                </div>
                <div class="lifeCycle-footer-right">
                    <a-pagination :total="pagination.total" :current="pagination.current"
                        :page-size="pagination.pageSize" @change="changeCurrent" />
                </div>
            </div>
        </div>
    </a-modal>
    <upDateData ref="upDateDataRef" />
</template>
<script lang="ts" setup>
import { ref, reactive } from "vue";
import { dataLifecycleRecord, dataLifecycleDes } from '@/api/original'
import upDateData from "./upDateData.vue";
const visible = ref(false)
const scrollbar = ref(true);
const scroll = { x: "max-content" };
const upDateDataRef = ref()
const data = ref([])
const pageOption = reactive([
    { label: "10", value: 10 },
    { label: "20", value: 20 },
    { label: "30", value: 30 },
    { label: "40", value: 40 },
]);
const opinion = [
    { label: "数据生产", value: 1 },
    { label: "数据维护", value: 2 },
    { label: "数据删除", value: 3 },
]
const pagination = reactive({
    formId: '',
    dataId: '',
    classify: '',
    total: 1,
    current: 1,
    pageSize: 10,
});
//固定字段
const fixColumns = [
    {
        title: "序号",
        key: "index",
        render: (record) => {
            return record.rowIndex + 1;
        },
        fixed: "left",
        width: 60,
    },
    {
        title: "变更人",
        width: 120,
        dataIndex: "nickname",
    },
    {
        title: "分类",
        dataIndex: "classify",
        width: 120,
        render: (data) => {
            const classify = data.record.classify;
            if (classify == 1) {
                return "数据生产";
            } else if (classify == 2) {
                return "数据维护";
            }
            return "数据删除";
        },
    },
    {
        title: "变更时间",
        dataIndex: "createTime",
    },
    {
        title: "操作",
        width: 100,
        slotName: "operation",
    },
];
const show = (parmas: any) => {
    pagination.formId = parmas.formId
    pagination.dataId = parmas.dataId
    visible.value = true
    getList()
}
const changePageSize = () => {
    getList();
};

const changeCurrent = (current) => {
    pagination.current = current;
    getList();
};
const setData = (row: any) => {
    dataLifecycleDes(row.record.id).then(res => {
        let datas = JSON.parse(res.dataValue)
        upDateDataRef.value.showItems({dataValue:datas}, pagination.formId, true)
    })
}
const getList = () => {
    let params = {
        formId: pagination.formId,
        dataId: pagination.dataId,
        classify: pagination.classify,
        current: pagination.current,
        size: pagination.pageSize,
    }
    dataLifecycleRecord(params).then(res => {
        pagination.total = res.total;
        data.value = res.records
    })
}
defineExpose({ show });
</script>

<style lang="scss" scoped>
@use "styles/textColor.scss" as textColor;

.lifeCycle {
    .select {
        margin-bottom: 10px;
    }

    &-footer {
        margin-top: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
}
</style>