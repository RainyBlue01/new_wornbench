<template>
  <div class="person-panel">
    <div v-if="selectedKeys.length" class="person-batch-bar">
      <span>已选择 <strong>{{ selectedKeys.length }}</strong> 人</span>
      <a-button class="btn-ghost-sm" size="small" status="danger" @click="onBatchRemove">
        批量移除
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
      <template #post="{ record }">
        {{ getPostDisplay(record) }}
      </template>
      <template #chargeDepts="{ record }">
        {{ resolveDeptNames(record.deptIds) }}
      </template>
      <template #actions="{ record }">
        <div class="person-actions">
          <button
            type="button"
            class="sg-action-btn edit"
            title="修改"
            @click="emit('edit', record)"
          >
            <icon-edit />
          </button>
          <button
            type="button"
            class="sg-action-btn edit"
            title="移除"
            @click="onRemove(record)"
          >
            <icon-minus-circle />
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
import { IconEdit, IconMinusCircle } from "@arco-design/web-vue/es/icon";
import { pageRecord, removeChargeLeader } from "@/api/leader/index";
import { updateUserChargeBatch } from "@/api/user/index";
import { toSnowflakeIdString } from "@/utils/snowflakeId";
import PersonPagination from "./PersonPagination.vue";
import { getPostDisplay } from "../utils/personDisplay";

const props = defineProps<{
  searchKeyword: string;
  resolveDeptNames: (ids: (string | number)[] | undefined) => string;
}>();

const emit = defineEmits<{
  edit: [record: any];
  refresh: [];
}>();

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
  { title: "职位", slotName: "post", width: 120 },
  { title: "分管部门", slotName: "chargeDepts" },
  { title: "管理", slotName: "actions", width: 100, align: "center" },
];

const fetchList = () => {
  pageRecord({
    username: props.searchKeyword,
    current: pagination.value.pageNum,
    size: pagination.value.pageSize,
  }).then((res) => {
    pagination.value.total = res.total ?? 0;
    data.value = (res.records || []).map((r: any) => ({
      ...r,
      id: toSnowflakeIdString(r.id),
      deptIds: (r.deptIds || []).map((id: unknown) => toSnowflakeIdString(id)),
    }));
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

const onRemove = (record: any) => {
  Modal.confirm({
    modalClass: "person-modal-wrap",
    title: "提示",
       titleAlign: "start",
    content: "确定要移除用户分管领导吗？",
    onOk: async () => {
      try {
        await removeChargeLeader(record.id);
        Message.success("移除成功");
        fetchList();
        emit("refresh");
      } catch {
        Message.error("移除失败");
      }
    },
  });
};

const onBatchRemove = () => {
  Modal.confirm({
    modalClass: "person-modal-wrap",
    title: "提示",
       titleAlign: "start",
    content: `确定要批量移除 ${selectedKeys.value.length} 名分管领导吗？`,
    onOk: async () => {
      try {
        // 使用批量移除分管领导接口
        await updateUserChargeBatch(
          selectedKeys.value,
        );
        Message.success("批量移除成功");
        selectedKeys.value = [];
        fetchList();
        emit("refresh");
      } catch {
        Message.error("批量移除失败");
      }
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
