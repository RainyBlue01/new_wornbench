<template>
  <div class="sys-settings-page person-page external-page">
    <userBanner url="/homepage" :title="'基础资源'" :active="3" />
    <div class="sys-settings-main config-layout person-layout">
      <ExternalGroupSidebar
        :groups="groups"
        :active-group-id="activeGroupId ?? ''"
        :default-group-id="defaultGroupId ?? ''"
        @select="onSelectGroup"
        @add-group="groupModalRef?.show()"
        @edit-group="onEditGroup"
        @delete-group="onDeleteGroup"
      />

      <div class="config-main">
        <div class="sys-card person-main-card">
          <div class="card-header">
            <h3>{{ pageTitle }}</h3>
            <div class="header-actions">
              <a-button class="btn-ghost-sm" @click="memberModalRef?.show()">
                <template #icon><icon-plus /></template>
                新增外部成员
              </a-button>
              <a-input
                v-model="searchKeyword"
                allow-clear
                placeholder="姓名 / 电话"
                class="person-search"
                @press-enter="search"
                @clear="search"
              />
            </div>
          </div>
          <div class="card-body person-card-body">
            <ExternalMemberPanel
              :records="pageRecords"
              :loading="loading"
              :pagination="pagination"
              v-model:selected-ids="selectedIds"
              @page-change="onPageChange"
              @page-size-change="onPageSizeChange"
              @batch-move="batchMoveModalRef?.show()"
              @remove-group="onRemoveGroup"
              @batch-remove="onBatchRemove"
              @delete="onDelete"
            />
          </div>
        </div>
      </div>
    </div>

    <ExternalMemberCreateModal
      ref="memberModalRef"
      :groups="groups"
      :default-group-id="activeGroupId ?? ''"
      @submit="onCreateMember"
    />
    <ExternalGroupCreateModal ref="groupModalRef" @submit="onGroupSubmit" />
    <ExternalBatchMoveModal
      ref="batchMoveModalRef"
      :groups="groups"
      :exclude-group-id="activeGroupId ?? ''"
      @submit="onBatchMove"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Message, Modal } from "@arco-design/web-vue";
import { IconPlus } from "@arco-design/web-vue/es/icon";
import userBanner from "@/components/banner/userBanner.vue";
import ExternalGroupSidebar from "./components/ExternalGroupSidebar.vue";
import ExternalMemberPanel from "./components/ExternalMemberPanel.vue";
import ExternalMemberCreateModal from "./components/ExternalMemberCreateModal.vue";
import ExternalGroupCreateModal, {
  type GroupSubmitPayload,
} from "./components/ExternalGroupCreateModal.vue";
import ExternalBatchMoveModal from "./components/ExternalBatchMoveModal.vue";
import {
  useExternalPage,
  ExternalGroupDeleteError,
  type ExternalGroup,
} from "./composables/useExternalPage";

const {
  groups,
  defaultGroupId,
  activeGroupId,
  pageTitle,
  searchKeyword,
  selectedIds,
  loading,
  pagination,
  pageRecords,
  init,
  search,
  selectGroup,
  addGroup,
  updateGroup,
  deleteGroup,
  getGroupMemberCount,
  removeUserFromGroup,
  createExternalUser,
  deleteExternalUser,
  batchDeleteExternalUsers,
  batchMoveToGroup,
  onPageChange,
  onPageSizeChange,
} = useExternalPage();

const memberModalRef = ref<InstanceType<typeof ExternalMemberCreateModal>>();
const groupModalRef = ref<InstanceType<typeof ExternalGroupCreateModal>>();
const batchMoveModalRef = ref<InstanceType<typeof ExternalBatchMoveModal>>();

const onSelectGroup = (id: string | number) => {
  selectGroup(id);
};

const onCreateMember = async (payload: {
  nickname: string;
  sex: number;
  phone: string;
  email: string;
  groupId: string | number;
}) => {
  try {
    await createExternalUser(payload);
    Message.success("新增成功");
  } catch {
    Message.error("新增失败");
  }
};

const onGroupSubmit = async (payload: GroupSubmitPayload) => {
  try {
    if (payload.id) {
      await updateGroup(payload.id, payload.name);
      Message.success("修改成功");
    } else {
      const id = await addGroup(payload.name);
      if (id != null) await selectGroup(id);
      Message.success("分组已创建");
    }
  } catch (e: any) {
  }
};

const onEditGroup = (group: ExternalGroup) => {
  groupModalRef.value?.showEdit(group);
};

const onDeleteGroup = async (group: ExternalGroup) => {
  if ((await getGroupMemberCount(group.id)) > 0) {
    Message.warning("该分组下仍有成员，请先移出成员");
    return;
  }
  Modal.confirm({
    title: "提示",
    content: `确定要删除分组「${group.name}」吗？`,
    modalClass: "person-modal-wrap",
    okText: "确认删除",
       titleAlign: "start",
    okButtonProps: { status: "danger" },
    onOk: async () => {
      try {
        await deleteGroup(group.id);
        Message.success("删除成功");
      } catch (e) {
        if (e instanceof ExternalGroupDeleteError) {
          Message.warning(e.message);
        } else {
        }
      }
    },
  });
};

const onRemoveGroup = async (record: any) => {
  try {
    await removeUserFromGroup(record.id);
    Message.success("已移出分组");
  } catch {
  }
};

const onBatchRemove = async (ids: (string | number)[]) => {
  try {
    await batchDeleteExternalUsers(ids);
    Message.success("删除成功");
  } catch {
    Message.error("删除失败");
  }
};

const onDelete = async (record: any) => {
  try {
    await deleteExternalUser(record.id);
    Message.success("删除成功");
  } catch {
    Message.error("删除失败");
  }
};

const onBatchMove = async (targetGroupId: string | number) => {
  try {
    await batchMoveToGroup([...selectedIds.value], targetGroupId);
    batchMoveModalRef.value?.close?.();
    Message.success("移动成功");
  } catch {
  }
};

onMounted(() => {
  init();
});
</script>

<style lang="scss" scoped>
@use "@/styles/system-settings.scss";

.person-layout {
  width: 100%;
  max-width: 1200px;
  align-items: flex-start;
  min-height: 0;
  margin-bottom: 0;
  padding-bottom: 20px;
}

.config-main {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  min-height: 0;
  max-height: var(--person-layout-height);
}

.person-main-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-height: 100%;

  .card-header {
    flex-shrink: 0;
  }
}

.person-card-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 16px 20px 16px;
}

.person-card-body :deep(.person-panel) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.person-card-body :deep(.person-batch-bar) {
  flex-shrink: 0;
}

.person-card-body :deep(.person-pagination) {
  flex-shrink: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.person-search {
  width: 220px;
}

.btn-primary-sm {
  border-radius: 10px !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  height: auto !important;
  padding: 7px 14px !important;
}
</style>

<style lang="scss">
@use "@/styles/person-modal.scss";
</style>
