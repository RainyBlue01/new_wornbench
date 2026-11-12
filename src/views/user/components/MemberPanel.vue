<template>
  <div class="person-panel">
    <div v-if="selectedKeys.length" class="person-batch-bar">
      <span>已选择 <strong>{{ selectedKeys.length }}</strong> 人</span>
      <!-- <a-button class="btn-ghost-sm" size="small" @click="onBatchLeave">
        人员离职
      </a-button> -->
      <button v-if="canSetDeptLeader" type="button" class="batch-action-btn"
        :class="hasSelectedLeaders ? 'batch-action-btn--muted' : 'batch-action-btn--blue'" @click="onSetDeptLeader">
        <icon-close v-if="hasSelectedLeaders" />
        <icon-user v-else />
        {{ hasSelectedLeaders ? "取消负责人" : "设为负责人" }}
      </button>
      <button v-if="deptFilter === '__NO_DEPT__'" type="button" class="batch-action-btn batch-action-btn--blue"
        @click="showMoveModal = true">
        <icon-mind-mapping />
        移入部门
      </button>
      <button v-if="showExportActions" type="button" class="batch-action-btn batch-action-btn--green"
        :disabled="exporting" @click="onExportSelected">
        <icon-download />
        下载选中
      </button>
      <button v-if="showExportActions" type="button" class="batch-action-btn batch-action-btn--blue"
        :disabled="exporting" @click="onExportAll">
        <icon-download />
        {{ exportAllLabel }}
      </button>
    </div>

    <a-table row-key="id" :scroll="tableScroll" v-model:selected-keys="selectedKeys" :row-selection="rowSelection"
      :pagination="false" :columns="columns" :data="data" :bordered="false" class="person-table">
      <template #serialNumber="{ rowIndex }">
        {{ (pagination.pageNum - 1) * pagination.pageSize + rowIndex + 1 }}
      </template>
      <template #nickname="{ record }">
        <span class="person-name">{{ record.nickname }}</span>
        <span v-if="record.leader == 1" class="person-badge person-badge--leader">负责人</span>
        <span v-if="getPartTimeDeptCount(record) > 0" class="person-badge person-badge--part">
          兼{{ getPartTimeDeptCount(record) }}部门
        </span>
      </template>
      <template #sex="{ record }">
        {{ formatSex(record.sex) }}
      </template>
      <template #email="{ record }">
        <span class="person-cell-email">{{ record.email || "-" }}</span>
      </template>
      <template #dept="{ record }">
        {{ getPrimaryDeptName(record) }}
        <span v-if="getPartTimeDeptCount(record) > 0" class="person-dept-extra">
          (兼{{ getPartTimeDeptCount(record) }}部门)
        </span>
      </template>
      <template #post="{ record }">
        {{ getPostDisplay(record) }}
      </template>
      <template #actions="{ record }">
        <div class="person-actions">
          <button type="button" class="sg-action-btn edit" title="编辑" @click="emit('edit', record)">
            <i class="fas fa-pen"></i>
          </button>
          <button type="button" class="sg-action-btn edit" title="调动" @click="emit('transfer', record)">
            <i class="fas fa-exchange-alt"></i>
          </button>
          <button type="button" class="sg-action-btn edit" title="兼任" @click="emit('part-time', record)">
            <i class="fas fa-sitemap"></i>
          </button>
          <button type="button" class="sg-action-btn" title="离职" @click="emit('resign', record)">
            <i class="fas fa-user-slash"></i>
          </button>
        </div>
      </template>
    </a-table>

    <PersonPagination :total="pagination.total" :current="pagination.pageNum" :page-size="pagination.pageSize"
      @change="onPageChange" @page-size-change="onPageSizeChange" />

    <a-modal v-model:visible="showMoveModal" modal-class="person-modal-wrap" title="批量移入部门" :width="440" ok-text="确定移入"
      cancel-text="取消" @ok="confirmMoveDept">
      <p class="person-modal-person-line">
        已选择 <strong>{{ selectedKeys.length }}</strong> 人
      </p>
      <a-form layout="vertical" class="person-modal-form">
        <a-form-item label="目标部门" required>
          <a-cascader v-model="moveDeptId" :options="deptList" :field-names="{ value: 'id', label: 'label' }" path-mode
            check-strictly allow-search placeholder="请选择部门" :style="{ width: '100%' }" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from "vue";
import { Modal, Message } from "@arco-design/web-vue";
import {
  IconEdit,
  IconSwap,
  IconBranch,
  IconCloseCircle,
  IconDownload,
  IconUser,
  IconClose,
  IconMindMapping,
} from "@arco-design/web-vue/es/icon";
import { getUser, batchLeave, setupDeptLeader, updateDept, exportBatch } from "@/api/user/index";
import PersonPagination from "./PersonPagination.vue";
import {
  formatSex,
  getPrimaryDeptName,
  getPartTimeDeptCount,
  getPostDisplay,
} from "../utils/personDisplay";

const props = defineProps<{
  deptList: any[];
  deptFilter: string;
  selectedPostId: string | number | "";
  searchKeyword: string;
  leftTab: string;
}>();

const emit = defineEmits<{
  edit: [record: any];
  transfer: [record: any];
  "part-time": [record: any];
  resign: [record: any];
  refresh: [];
}>();

const tableScroll = { maxHeight: "var(--person-table-max-height)" };
const data = ref<any[]>([]);
const selectedKeys = ref<(string | number)[]>([]);
const showMoveModal = ref(false);
const moveDeptId = ref<any>("");
const exporting = ref(false);

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
  { title: "姓名", slotName: "nickname", width: 160 },
  { title: "性别", slotName: "sex", width: 64 },
  { title: "电话", dataIndex: "phone", width: 115, },
  { title: "邮箱", slotName: "email", width: 100, },
  { title: "部门", slotName: "dept", width: 120 },
  { title: "职位", slotName: "post", width: 120 },
  { title: "管理", slotName: "actions", align: "center" },
];

const canSetDeptLeader = computed(
  () =>
    props.deptFilter &&
    props.deptFilter !== "__NO_DEPT__" &&
    props.deptFilter !== "",
);

const selectedRows = computed(() =>
  data.value.filter((r) => selectedKeys.value.includes(r.id)),
);

const leaderAmongSelected = computed(() =>
  selectedRows.value.filter((r) => r.leader === 1),
);

const hasSelectedLeaders = computed(
  () => leaderAmongSelected.value.length > 0,
);

/** 全部成员视图（未选具体部门）或职位视图下显示导出 */
const showExportActions = computed(() => {
  if (!selectedKeys.value.length) return false;
  if (props.leftTab === "post") return true;
  if (props.leftTab === "dept" && !props.deptFilter) return true;
  return false;
});

const exportAllLabel = computed(() =>
  props.leftTab === "post" && props.selectedPostId
    ? "下载当前职位成员"
    : "下载全部成员",
);

const resolveExportPostIds = (): string[] => {
  if (props.leftTab === "post" && props.selectedPostId) {
    return [String(props.selectedPostId)];
  }
  return [];
};

const onExportSelected = async () => {
  if (!selectedKeys.value.length) {
    Message.warning("请先选择人员");
    return;
  }
  exporting.value = true;
  try {
    await exportBatch({
      exportType: 1,
      userIds: selectedKeys.value.map(String),
      postIds: resolveExportPostIds(),
    });
    Message.success("请前往任务中心下载任务");
  } catch {
    // Message.error("导出失败");
  } finally {
    exporting.value = false;
  }
};

const onExportAll = async () => {
  exporting.value = true;
  try {
    await exportBatch({
    });
    Message.success("请前往任务中心下载任务");
  } catch {
    // Message.error("导出失败");
  } finally {
    exporting.value = false;
  }
};

const fetchList = () => {
  const params: Record<string, any> = {
    username: props.searchKeyword,
    active: 1,
    userType: 1,
    current: pagination.value.pageNum,
    size: pagination.value.pageSize,
  };
  if (props.deptFilter === "__NO_DEPT__") {
    params.noDept = true;
  } else if (props.deptFilter) {
    params.deptIds = props.deptFilter;
  }
  if (props.leftTab === "post" && props.selectedPostId) {
    params.postIds = props.selectedPostId;
  }
  getUser(params).then((res) => {
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

const onBatchLeave = () => {
  Modal.confirm({
    title: "提示",
    content: "确定要批量离职吗？",
    titleAlign: "start",
    modalClass: "person-modal-wrap",
    onOk: () =>
      batchLeave({ userIds: selectedKeys.value }).then(() => {
        Message.success("批量离职成功");
        selectedKeys.value = [];
        fetchList();
        emit("refresh");
      }),
  });
};

const onSetDeptLeader = () => {
  const isCancel = hasSelectedLeaders.value;
  const userIds = isCancel
    ? leaderAmongSelected.value.map((r) => r.id)
    : selectedKeys.value;
  if (!userIds.length) {
    Message.warning(isCancel ? "请选择已是负责人的成员" : "请选择成员");
    return;
  }
  setupDeptLeader({
    userIds,
    deptId: props.deptFilter,
    leader: isCancel ? 0 : 1,
  }).then(() => {
    Message.success((isCancel ? "取消" : "设置") + "成功");
    selectedKeys.value = [];
    fetchList();
  });
};

const confirmMoveDept = async () => {
  const deptId = Array.isArray(moveDeptId.value)
    ? moveDeptId.value[moveDeptId.value.length - 1]
    : moveDeptId.value;
  if (!deptId) {
    Message.warning("请选择部门");
    return false;
  }
  await Promise.all(
    selectedKeys.value.map((userId) =>
      updateDept({ userId, deptId, postIds: [] }),
    ),
  );
  Message.success("移入部门成功");
  showMoveModal.value = false;
  moveDeptId.value = "";
  selectedKeys.value = [];
  fetchList();
  emit("refresh");
  return true;
};

watch(
  () => [props.deptFilter, props.selectedPostId, props.searchKeyword, props.leftTab],
  () => {
    if (props.leftTab === "dept" || props.leftTab === "post") {
      search();
    }
  },
  { deep: true },
);

onMounted(() => {
  if (props.leftTab === "dept" || props.leftTab === "post") {
    fetchList();
  }
});

defineExpose({ search, fetchList, clearSelection: () => (selectedKeys.value = []) });
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

  &--muted {
    color: #64748b;
    border-color: #e2e8f0;

    &:hover:not(:disabled) {
      background: #f1f5f9;
      color: #334155;
    }
  }

  &--green {
    color: #16a34a;
    border-color: #bbf7d0;

    &:hover:not(:disabled) {
      background: #f0fdf4;
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style>
