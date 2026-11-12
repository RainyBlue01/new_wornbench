<template>
  <div class="person-panel">
    <div v-if="selectedRoleId && selectedKeys.length" class="person-batch-bar">
      <span>已选择 <strong>{{ selectedKeys.length }}</strong> 人</span>
      <a-button class="btn-ghost-sm" size="small" status="danger" @click="onBatchRemove">
        批量移除
      </a-button>
    </div>

    <a-table row-key="id" :scroll="tableScroll" v-model:selected-keys="selectedKeys" :row-selection="rowSelection"
      :pagination="false" :columns="columns" :data="data" :bordered="false" class="person-table">
      <template #serialNumber="{ rowIndex }">
        {{ (pagination.pageNum - 1) * pagination.pageSize + rowIndex + 1 }}
      </template>
      <template #nickname="{ record }">
        <span class="person-name">{{ record.nickname }}</span>
      </template>
      <template #dept="{ record }">
        {{ getPrimaryDeptName(record) }}
      </template>
      <template #post="{ record }">
        {{ getPostDisplay(record) }}
      </template>
      <template #actions="{ record }">
        <div class="person-actions">
          <button v-if="selectedRoleId" type="button" class="sg-action-btn edit" title="移除" @click="onRemove(record)">
            <icon-minus-circle />
          </button>
        </div>
      </template>
    </a-table>

    <PersonPagination :total="pagination.total" :current="pagination.pageNum" :page-size="pagination.pageSize"
      @change="onPageChange" @page-size-change="onPageSizeChange" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Modal, Message } from "@arco-design/web-vue";
import { IconMinusCircle } from "@arco-design/web-vue/es/icon";
import { getUser } from "@/api/user/index";
import { removeRoleUser } from "@/api/role/index";
import { updateUserBatch } from "@/api/user/index";
import { toSnowflakeIdString } from "@/utils/snowflakeId";
import PersonPagination from "./PersonPagination.vue";
import { getPrimaryDeptName, getPostDisplay } from "../utils/personDisplay";

const props = defineProps<{
  selectedRoleId: string | number | "";
  searchKeyword: string;
}>();

const emit = defineEmits<{ refresh: [] }>();

const tableScroll = { maxHeight: "var(--person-table-max-height)" };
const data = ref<any[]>([]);
const selectedKeys = ref<(string | number)[]>([]);

const pagination = ref({
  total: 0,
  pageNum: 1,
  pageSize: 10,
});

const rowSelection = computed(() =>
  props.selectedRoleId
    ? { type: "checkbox" as const, showCheckedAll: true }
    : undefined,
);

const columns = [
  { title: "序号", width: 60, align: "center", slotName: "serialNumber" },
  { title: "姓名", slotName: "nickname", width: 100 },
  { title: "部门", slotName: "dept", },
  { title: "职位", slotName: "post" },
  { title: "电话", dataIndex: "phone", width: 130 },
  { title: "管理", slotName: "actions", width: 72, align: "center" },
];

const removeRoleFromUser = async (record: any) => {
  if (!props.selectedRoleId) return;
  await removeRoleUser(record.id, props.selectedRoleId);
};

let fetchSeq = 0;

const fetchList = async () => {
  const seq = ++fetchSeq;
  const params: Record<string, any> = {
    username: props.searchKeyword,
    active: 1,
    userType: 1,
    current: pagination.value.pageNum,
    size: pagination.value.pageSize,
  };
  if (props.selectedRoleId) {
    params.roleIds = toSnowflakeIdString(props.selectedRoleId);
  }
  try {
    const res = await getUser(params);
    if (seq !== fetchSeq) return;
    pagination.value.total = res.total ?? 0;
    data.value = (res.records || []).map((r: any) => ({
      ...r,
      id: toSnowflakeIdString(r.id),
    }));
  } catch {
    if (seq !== fetchSeq) return;
    data.value = [];
    pagination.value.total = 0;
  }
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
  if (!props.selectedRoleId) {
    Message.warning("请先选择具体角色后再移除成员");
    return;
  }
  Modal.confirm({
    modalClass: "person-modal-wrap",
    title: "提示",
       titleAlign: "start",
    content: "确定要从该角色中移除该成员吗？",
    onOk: () =>
      removeRoleFromUser(record).then(() => {
        Message.success("移除成功");
        fetchList();
        emit("refresh");
      }),
  });
};

const onBatchRemove = () => {
  if (!props.selectedRoleId) {
    Message.warning("请先选择具体角色后再移除成员");
    return;
  }
  Modal.confirm({
    modalClass: "person-modal-wrap",
    title: "提示",
       titleAlign: "start",
    content: `确定要批量移除 ${selectedKeys.value.length} 名成员吗？`,
    onOk: async () => {
      try {
        // 使用批量移除接口
        await updateUserBatch(
          selectedKeys.value
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
  () => [toSnowflakeIdString(props.selectedRoleId), props.searchKeyword] as const,
  () => search(),
);

defineExpose({ search, fetchList, clearSelection: () => (selectedKeys.value = []) });
</script>

<style lang="scss" scoped>
@use "@/styles/system-settings.scss";
</style>
