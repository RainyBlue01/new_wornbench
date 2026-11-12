<template>
  <div class="person-panel">
    <div v-if="selectedKeys.length" class="person-batch-bar">
      <span>已选择 <strong>{{ selectedKeys.length }}</strong> 人</span>
      <a-button class="btn-ghost-sm" size="small" @click="onBatchRehire">
        批量返聘
      </a-button>
    </div>

    <a-table
      row-key="id"
      :scroll="tableScroll"
      v-model:selected-keys="selectedKeys"
      :row-selection="rowSelection"
      :pagination="false"
      :columns="columns"
      :data="data"
      :bordered="false"
      class="person-table"
    >
      <template #serialNumber="{ rowIndex }">
        {{ (pagination.pageNum - 1) * pagination.pageSize + rowIndex + 1 }}
      </template>
      <template #nickname="{ record }">
        <span class="person-name">{{ record.nickname }}</span>
      </template>
      <template #sex="{ record }">
        {{ formatSex(record.sex) }}
      </template>
      <template #actions="{ record }">
        <div class="person-actions">
          <button
            type="button"
            class="sg-action-btn edit"
            title="返聘"
            @click="onRehire(record)"
          >
            <icon-undo />
          </button>
        </div>
      </template>
    </a-table>

    <PersonPagination
      :total="pagination.total"
      :current="pagination.pageNum"
      :page-size="pagination.pageSize"
      @change="onPageChange"
      @page-size-change="onPageSizeChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from "vue";
import { Modal, Message } from "@arco-design/web-vue";
import { IconUndo } from "@arco-design/web-vue/es/icon";
import { getUser, changeActive } from "@/api/user/index";
import PersonPagination from "./PersonPagination.vue";
import { formatSex } from "../utils/personDisplay";

const props = defineProps<{
  searchKeyword: string;
}>();

const emit = defineEmits<{ refresh: []; rehire: [record: any] }>();

const tableScroll = { maxHeight: "var(--person-table-max-height)" };
const data = ref<any[]>([]);
const selectedKeys = ref<(string | number)[]>([]);

const pagination = ref({
  total: 0,
  pageNum: 1,
  pageSize: 10,
});

const rowSelection = reactive({
  type: "checkbox" as const,
  showCheckedAll: true,
});

const columns = [
  { title: "序号", width: 60, align: "center", slotName: "serialNumber" },
  { title: "姓名", slotName: "nickname", width: 120 },
  { title: "性别", slotName: "sex", width: 64 },
  { title: "电话", dataIndex: "phone", width: 130, ellipsis: true, tooltip: true },
  { title: "邮箱", dataIndex: "email", width: 180, ellipsis: true, tooltip: true },
  { title: "管理", slotName: "actions", width: 80, align: "center" },
];

const fetchList = () => {
  getUser({
    username: props.searchKeyword,
    active: 0,
    userType: 1,
    current: pagination.value.pageNum,
    size: pagination.value.pageSize,
  }).then((res) => {
    pagination.value.total = res.total;
    data.value = res.records || [];
  });
};

const search = () => {
  pagination.value.pageNum = 1;
  selectedKeys.value = [];
  fetchList();
};

const onPageChange = (page: number) => {
  pagination.value.pageNum = page;
  fetchList();
};

const onPageSizeChange = (size: number) => {
  pagination.value.pageSize = size;
  pagination.value.pageNum = 1;
  fetchList();
};

const changeActiveUser = (userId: string | number, active: number) =>
  changeActive({ userId, active });

const onRehire = (record: any) => {
  emit("rehire", record);
};

const onBatchRehire = () => {
  Modal.confirm({
    title: "批量返聘",
       titleAlign: "start",
    content: `确定要返聘选中的 ${selectedKeys.value.length} 人吗？`,
    modalClass: "person-modal-wrap",
    onOk: async () => {
      await Promise.all(
        selectedKeys.value.map((id) => changeActiveUser(id, 1)),
      );
      Message.success("批量返聘成功");
      selectedKeys.value = [];
      fetchList();
      emit("refresh");
    },
  });
};

watch(
  () => props.searchKeyword,
  () => search(),
);

onMounted(() => fetchList());

defineExpose({ search, fetchList, clearSelection: () => (selectedKeys.value = []) });
</script>

<style lang="scss" scoped>
@use "@/styles/system-settings.scss";
</style>
