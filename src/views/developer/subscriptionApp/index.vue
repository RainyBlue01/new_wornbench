<template>
    <base-modal
        ref="modalRef"
        modal-class="person-modal-wrap dev-subscription-modal"
        @handle-ok="formSubmit"
        @handle-cancel="handleCancel"
    >
        <template #title>
            <div class="dev-modal-header">
                <h3>订阅应用</h3>
                <div class="dev-toolbar-actions">
                    <a-input
                        v-model="pagination.appName"
                        class="dev-search-input"
                        placeholder="搜索应用名称..."
                        allow-clear
                        @change="search"
                    />
                    <a-button class="dev-add-btn" @click="addItem">
                        <template #icon>
                            <icon-plus />
                        </template>
                        新增
                    </a-button>
                </div>
            </div>
        </template>
        <div class="dev-modal-body">
            <div class="dev-card-body">
                <div class="dev-table-wrap">
                    <a-table
                        :scroll="scroll"
                        row-key="id"
                        :pagination="false"
                        :columns="columns"
                        :bordered="false"
                        :data="data"
                    >
                        <template #serialNumber="{ rowIndex }">
                            <span class="dev-cell-index">{{ rowIndex + 1 }}</span>
                        </template>
                        <template #appName="{ record }">
                            <span class="dev-cell-name">{{ record.appName }}</span>
                        </template>
                        <template #active="{ record }">
                            <span
                                class="status-tag"
                                :class="record.active == 1 ? 'on' : 'off'"
                            >
                                {{ record.active == 1 ? "已启用" : "已禁用" }}
                            </span>
                        </template>
                        <template #events="{ record }">
                            <span>{{ setData(record.events) }}</span>
                        </template>
                        <template #optional="{ record }">
                            <div class="dev-actions">
                                <button
                                    v-if="record.active == 1"
                                    type="button"
                                    class="action-btn primary"
                                    @click="editItem(record)"
                                >
                                    修改
                                </button>
                                <button
                                    type="button"
                                    class="action-btn"
                                    :class="record.active == 1 ? 'danger' : 'primary'"
                                    @click="deleteItem(record)"
                                >
                                    {{ record.active == 1 ? "禁用" : "启用" }}
                                </button>
                                <button
                                    v-if="record.active == 1"
                                    type="button"
                                    class="action-btn danger"
                                    @click="reSetItem(record)"
                                >
                                    删除
                                </button>
                            </div>
                        </template>
                    </a-table>
                </div>
                <div class="dev-pagination">
                    <PersonPagination
                        :total="pagination.total"
                        :current="pagination.pageNum"
                        :page-size="pagination.pageSize"
                        :show-page-size="false"
                        :show-jump="false"
                        @change="pagingChange"
                    />
                </div>
            </div>
            <create @init="search" ref="createRef" />
        </div>
    </base-modal>
</template>
<script setup lang="ts">
import {
    disableSubscribe,
    enableSubscribe,
    deleteSubscribe,
    getSubscribePage,
} from "@/api/developer/index";
import { Modal, Message } from "@arco-design/web-vue";
import { IconPlus } from "@arco-design/web-vue/es/icon";
import create from "./create.vue";
import PersonPagination from "@/views/user/components/PersonPagination.vue";
import { ref } from "vue";

const modalRef = ref();
const createRef = ref();
const data = ref([]);
const pagination = ref({
    total: 0,
    pageNum: 1,
    pageSize: 10,
    developerId: "",
    appName: "",
});
const columns = [
    {
        title: "序号",
        width: 65,
        align: "center",
        slotName: "serialNumber",
    },
    {
        title: "应用名称",
        width: 150,
        slotName: "appName",
    },
    {
        title: "状态",
        width: 90,
        align: "center",
        slotName: "active",
    },
    {
        title: "订阅事件",
        slotName: "events",
    },
    {
        title: "管理",
        width: 200,
        align: "center",
        slotName: "optional",
    },
];

const eventsList = [
    { key: 1, title: "数据新增" },
    { key: 2, title: "数据修改" },
    { key: 3, title: "数据删除" },
    { key: 4, title: "流程完结" },
    { key: 5, title: "流程发起" },
    { key: 6, title: "节点审批" },
    { key: 7, title: "节点填写" },
    { key: 8, title: "节点抄送" },
];

const editItem = (item: Record<string, unknown>) => {
    const params = { developerId: pagination.value.developerId, ...item };
    createRef.value.showItem(params);
};

const setData = (dataStr: string) => {
    const events = dataStr.split(",");
    const eventName: string[] = [];
    events.forEach((v) => {
        eventsList.forEach((v1) => {
            if (String(v1.key) === String(v)) {
                eventName.push(v1.title);
            }
        });
    });
    return eventName.join(",");
};

const getList = () => {
    const params = {
        developerId: pagination.value.developerId,
        appName: pagination.value.appName,
        current: pagination.value.pageNum,
        size: pagination.value.pageSize,
    };
    getSubscribePage(params).then((res) => {
        pagination.value.total = res.total;
        data.value = res.records;
    });
};

const search = () => {
    pagingChange(1);
};

const pagingChange = (val: number) => {
    pagination.value.pageNum = val;
    getList();
};

const scroll = { y: 420 };
const handleCancel = () => {};
const formSubmit = () => {};

const reSetItem = (item: { subscribeId: string }) => {
    Modal.confirm({
        title: "确认删除",
        simple: true,
        renderToBody: false,
        titleAlign: "start",
        content: "确定删除该订阅吗？删除后将不再接收相关推送。",
        hideCancel: false,
        okText: "确定删除",
        onOk: async () => {
            deleteSubscribe(item.subscribeId).then(() => {
                Message.success("删除成功");
                search();
            });
        },
    });
};

const deleteItem = (item: { subscribeId: string; active: number }) => {
    if (item.active == 1) {
        Modal.confirm({
            title: "确认禁用",
            simple: true,
            renderToBody: false,
            titleAlign: "start",
            content: "确定禁用该订阅吗？禁用后将不再接收相关推送。",
            hideCancel: false,
            okText: "确定禁用",
            onOk: async () => {
                disableSubscribe(item.subscribeId).then(() => {
                    Message.success("禁用成功");
                    search();
                });
            },
        });
    } else {
        Modal.confirm({
            title: "提示",
            simple: true,
            renderToBody: false,
            titleAlign: "start",
            content: "确定要启用该订阅吗？",
            hideCancel: false,
            okText: "确认",
            onOk: async () => {
                enableSubscribe(item.subscribeId).then(() => {
                    Message.success("启用成功");
                    search();
                });
            },
        });
    }
};

const addItem = () => {
    const params = { developerId: pagination.value.developerId };
    createRef.value.showItem(params);
};

const showItem = (item: { id: string }) => {
    pagination.value.developerId = item.id;
    modalRef.value.handleClick({
        showBtn: false,
        width: "1200px",
    });
    search();
};

defineExpose({
    showItem,
});
</script>
<style lang="scss" scoped>
@use "@/styles/developer-center.scss";

</style>
<style lang="scss">
@use "@/styles/developer-center.scss";

.dev-subscription-modal {
  .arco-modal-title {
    flex: 1;
    width: 100%;
  }
  .arco-modal-header{
    height: auto !important;
  }
}
</style>
