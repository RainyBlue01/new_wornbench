<template>
  <div class="person-panel external-member-panel">
    <div v-if="selectedIds.length" class="person-batch-bar">
      <span
        >已选择 <strong>{{ selectedIds.length }}</strong> 人</span
      >
      <button
        type="button"
        class="batch-action-btn batch-action-btn--blue"
        title="移入其他分组"
        @click="emit('batch-move')"
      >
        <icon-folder />
        移入其他分组
      </button>
      <button
        type="button"
        class="batch-action-btn batch-action-btn--red"
        title="批量删除成员"
        @click="onBatchRemove"
      >
        <icon-delete />
        删除成员
      </button>
    </div>

    <a-table
      row-key="id"
      :scroll="tableScroll"
      v-model:selected-keys="selectedKeysModel"
      :row-selection="rowSelection"
      :pagination="false"
      :columns="columns"
      :data="Array.isArray(records) ? records : []"
      :loading="loading"
      :bordered="false"
      class="person-table"
    >
      <template #serialNumber="{ rowIndex }">
        {{ ((pagination?.pageNum ?? 1) - 1) * (pagination?.pageSize ?? 10) + rowIndex + 1 }}
      </template>
      <template #nickname="{ record }">
        <span class="person-name">{{ record.nickname }}</span>
      </template>
      <template #sex="{ record }">
        {{ formatSex(record.sex) }}
      </template>
      <template #email="{ record }">
        <span class="person-cell-email">{{ record.email || "-" }}</span>
      </template>
      <template #actions="{ record }">
        <div class="person-actions">
          <!-- <button
            type="button"
            class="sg-action-btn edit"
            title="移除分组"
            @click="onRemoveGroup(record)"
          >
            <icon-minus-circle />
          </button> -->
          <button
            type="button"
            class="sg-action-btn"
            title="删除"
            @click="onDelete(record)"
          >
            <icon-delete />
          </button>
        </div>
      </template>
    </a-table>

    <PersonPagination
      :total="pagination.total"
      :current="pagination.pageNum"
      :page-size="pagination.pageSize"
      @change="emit('page-change', $event)"
      @page-size-change="emit('page-size-change', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Modal, Message } from "@arco-design/web-vue";
import { IconFolder, IconDelete } from "@arco-design/web-vue/es/icon";
import PersonPagination from "@/views/user/components/PersonPagination.vue";
import { formatSex } from "@/views/user/utils/personDisplay";

const props = defineProps<{
  records: any[];
  loading: boolean;
  pagination: { total: number; pageNum: number; pageSize: number };
  selectedIds: (string | number)[];
}>();

const emit = defineEmits<{
  "update:selectedIds": [value: (string | number)[]];
  "page-change": [page: number];
  "page-size-change": [size: number];
  "batch-move": [];
  "remove-group": [record: any];
  "batch-remove": [ids: (string | number)[]];
  delete: [record: any];
}>();

const selectedKeysModel = computed({
  get: () => props.selectedIds,
  set: (v) => emit("update:selectedIds", v),
});

const rowSelection = { type: "checkbox", showCheckedAll: true };
const tableScroll = { maxHeight: "var(--person-table-max-height)" };

const columns = [
  { title: "序号", width: 60, align: "center", slotName: "serialNumber" },
  { title: "姓名", slotName: "nickname", width: 160 },
  { title: "性别", slotName: "sex", width: 64 },
  { title: "电话", dataIndex: "phone", width: 130 },
  { title: "邮箱", slotName: "email", width: 180 },
  { title: "管理", slotName: "actions", width: 100, align: "center" },
];

const onRemoveGroup = (record: any) => {
  Modal.confirm({
    title: "提示",
       titleAlign: "start",
    content: `确定将「${record.nickname || "该成员"}」移出当前分组吗？`,
    modalClass: "person-modal-wrap",
    onOk: () => emit("remove-group", record),
  });
};

const onDelete = (record: any) => {
  Modal.confirm({
    title: "提示",
       titleAlign: "start",
    content: `确定删除外部成员「${record.nickname || ""}」吗？删除后不可恢复。`,
    modalClass: "person-modal-wrap",
    okButtonProps: { status: "danger" },
    onOk: () => emit("delete", record),
  });
};

const onBatchRemove = () => {
  if (!props.selectedIds.length) return;
  Modal.confirm({
    title: "提示",
       titleAlign: "start",
    content: `确定删除选中的 ${props.selectedIds.length} 人吗？`,
    modalClass: "person-modal-wrap",
    onOk: () => {
      emit("batch-remove", [...props.selectedIds]);
    },
  });
};
</script>

<style lang="scss" scoped>
@use "@/styles/system-settings.scss";

.batch-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid;
  background: #f8fafc;
  transition: all 0.2s;
  font-family: inherit;
  white-space: nowrap;

  &--blue {
    color: #2563eb;
    border-color: #bfdbfe;

    &:hover:not(:disabled) {
      background: #eff6ff;
    }
  }

  &--red {
    color: #dc2626;
    border-color: #fecaca;

    &:hover:not(:disabled) {
      background: #fef2f2;
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style>
