<template>
  <div class="sys-settings-page person-page">
    <userBanner url="/homepage" :title="'基础资源'" :active="3" />
    <div class="sys-settings-main config-layout person-layout">
      <PersonSidebar :left-tab="leftTab" :dept-list="deptList" :role-list="roleList" :post-list="postList"
        :no-dept-num="noDeptNum" :dept-filter="deptFilter" :selected-post-id="selectedPostId"
        :selected-role-id="selectedRoleId" @switch-tab="onSwitchTab" @dept-filter="onDeptFilter"
        @post-filter="onPostFilter" @role-filter="onRoleFilter" />

      <div class="config-main">
        <div class="sys-card person-main-card">
          <div class="card-header">
            <h3>{{ pageTitle }}</h3>
            <div class="header-actions">
              <template v-if="showMemberHeader">
                <a-button class="btn-ghost-sm" @click="openImportModal">
                  <template #icon><icon-upload /></template>
                  批量导入
                </a-button>
                <!-- <a-button type="primary" class="btn-ghost-sm" :loading="syncingUser" @click="syncUserData">
                  <template #icon>
                    <icon-loop />
                  </template>
                  更新
                </a-button> -->
                <a-button class="btn-ghost-sm" @click="createRef?.showItem()">
                  <template #icon><icon-plus /></template>
                  新增
                </a-button>
                <a-input v-model="searchKeyword" allow-clear placeholder="姓名 / 电话" class="person-search"
                  @press-enter="onSearch" @clear="onSearch" />
              </template>
              <template v-else-if="leftTab === 'leader'">
                <a-button class="btn-ghost-sm" @click="leaderCreateRef?.showItem()">
                  <template #icon><icon-plus /></template>
                  设置分管领导
                </a-button>
                <a-input v-model="searchKeyword" allow-clear placeholder="姓名 / 电话" class="person-search"
                  @press-enter="onSearch" @clear="onSearch" />
              </template>
              <template v-else-if="leftTab === 'role'">
                <a-button class="btn-ghost-sm" :disabled="!selectedRoleId" @click="openAddRoleMember">
                  <template #icon><icon-plus /></template>
                  新增成员
                </a-button>
                <a-input v-model="searchKeyword" allow-clear placeholder="姓名 / 电话" class="person-search"
                  @press-enter="onSearch" @clear="onSearch" />
              </template>
              <template v-else-if="leftTab === 'resigned'">
                <a-input v-model="searchKeyword" allow-clear placeholder="姓名 / 电话" class="person-search"
                  @press-enter="onSearch" @clear="onSearch" />
              </template>
            </div>
          </div>
          <div class="card-body person-card-body">
            <MemberPanel v-show="showMemberPanel" ref="memberPanelRef" :dept-list="deptList" :dept-filter="deptFilter"
              :selected-post-id="selectedPostId" :search-keyword="searchKeyword" :left-tab="leftTab" @edit="onEdit"
              @transfer="onTransfer" @part-time="onPartTime" @resign="onResign" @refresh="refreshNoDeptNum" />
            <LeaderPanel v-show="leftTab === 'leader'" ref="leaderPanelRef" :search-keyword="searchKeyword"
              :resolve-dept-names="resolveDeptNames" @edit="leaderCreateRef?.showItem($event)" @refresh="refreshMeta" />
            <RoleMemberPanel v-show="leftTab === 'role'" ref="roleMemberPanelRef" :selected-role-id="selectedRoleId"
              :search-keyword="searchKeyword" @refresh="refreshMeta" />
            <ResignedPanel v-show="leftTab === 'resigned'" ref="resignedPanelRef" :search-keyword="searchKeyword"
              @rehire="onRehireFromPanel" @refresh="refreshMeta" />
          </div>
        </div>
      </div>
    </div>

    <setPartTime ref="setPartTimeRef" :post-list="postList" :dept-list="deptList" @init="onDeptChanged" />
    <edit ref="editRef" :dept-list="deptList" :role-list="roleList" :post-list="postList" @init="onDeptChanged" />
    <create ref="createRef" :dept-list="deptList" :role-list="roleList" :post-list="postList" @init="onDeptChanged" />
    <leaderCreate ref="leaderCreateRef" :dept-list="deptList" @init="onSearch" />

    <PersonImportModal ref="importModalRef" :schedule-data="importSchedule" @success="onDeptChanged" />
    <RoleMemberAddModal ref="roleMemberModalRef" :dept-list="deptList" @success="onRoleMemberAdded" />
    <ResignModal ref="resignModalRef" @success="onResignSuccess" />
    <RehireModal ref="rehireModalRef" :dept-list="deptList" :post-list="postList" :role-list="roleList"
      @success="onRehireSuccess" />
    <ExtraDeptModal ref="extraDeptModalRef" :dept-list="deptList" @success="onDeptChanged" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Modal, Message } from "@arco-design/web-vue";
import { IconPlus, IconUpload } from "@arco-design/web-vue/es/icon";
import { importUser, syncUsers } from "@/api/user/index";
import { usePersonPage, type PersonLeftTab } from "./composables/usePersonPage";
import PersonSidebar from "./components/PersonSidebar.vue";
import MemberPanel from "./components/MemberPanel.vue";
import LeaderPanel from "./components/LeaderPanel.vue";
import RoleMemberPanel from "./components/RoleMemberPanel.vue";
import ResignedPanel from "./components/ResignedPanel.vue";
import create from "./create.vue";
import edit from "./edit.vue";
import setPartTime from "./setPartTime.vue";
import leaderCreate from "./leaderCreate.vue";
import PersonImportModal from "./components/PersonImportModal.vue";
import RoleMemberAddModal from "./components/RoleMemberAddModal.vue";
import ResignModal from "./components/ResignModal.vue";
import RehireModal from "./components/RehireModal.vue";
import ExtraDeptModal from "./components/ExtraDeptModal.vue";
import { hasPrimaryDept } from "./utils/personDisplay";

const router = useRouter();
const route = useRoute();

const {
  leftTab,
  deptList,
  roleList,
  postList,
  noDeptNum,
  deptFilter,
  selectedPostId,
  selectedRoleId,
  pageTitle,
  resolveDeptNames,
  switchTab,
  loadMeta,
  refreshNoDeptNum,
} = usePersonPage();

const searchKeyword = ref("");
const syncingUser = ref(false);
const memberPanelRef = ref<InstanceType<typeof MemberPanel>>();
const leaderPanelRef = ref<InstanceType<typeof LeaderPanel>>();
const roleMemberPanelRef = ref<InstanceType<typeof RoleMemberPanel>>();
const resignedPanelRef = ref<InstanceType<typeof ResignedPanel>>();
const createRef = ref();
const editRef = ref();
const setPartTimeRef = ref();
const leaderCreateRef = ref();
const importModalRef = ref();
const roleMemberModalRef = ref();
const resignModalRef = ref<InstanceType<typeof ResignModal>>();
const rehireModalRef = ref<InstanceType<typeof RehireModal>>();
const extraDeptModalRef = ref<InstanceType<typeof ExtraDeptModal>>();

const importSchedule = {
  downloadFileTitle: "人员导入失败文档.xlsx",
  uploadFiles: async ({ fileItem }: { fileItem: { file: File } }) => {
    return importUser(fileItem.file);
  },
};

const showMemberPanel = computed(
  () => leftTab.value === "dept" || leftTab.value === "post",
);
const showMemberHeader = computed(() => showMemberPanel.value);

const activePanelRef = computed(() => {
  if (leftTab.value === "leader") return leaderPanelRef;
  if (leftTab.value === "role") return roleMemberPanelRef;
  if (leftTab.value === "resigned") return resignedPanelRef;
  return memberPanelRef;
});

const clearAllSelections = () => {
  memberPanelRef.value?.clearSelection();
  leaderPanelRef.value?.clearSelection();
  roleMemberPanelRef.value?.clearSelection();
  resignedPanelRef.value?.clearSelection();
};

const onSearch = () => {
  activePanelRef.value.value?.search();
};

const refreshMeta = () => {
  loadMeta();
};

const onDeptChanged = () => {
  onSearch();
  refreshNoDeptNum();
};

const syncRouteTab = (tab: PersonLeftTab) => {
  if (route.query.tab !== tab) {
    router.replace({ path: "/user", query: { ...route.query, tab } });
  }
};

const onSwitchTab = (tab: PersonLeftTab) => {
  switchTab(tab);
  syncRouteTab(tab);
  deptFilter.value = ''
  searchKeyword.value = "";
  clearAllSelections();
  setTimeout(() => activePanelRef.value.value?.search(), 0);
};

const onDeptFilter = (val: string) => {
  deptFilter.value = val;
  clearAllSelections();
};

const onPostFilter = (id: string | number | "") => {
  selectedPostId.value = id;
  clearAllSelections();
};

const onRoleFilter = (id: string | number | "") => {
  selectedRoleId.value = id;
  clearAllSelections();
};

const onEdit = (record: any) => {
  editRef.value?.showItem(record);
};

const onTransfer = (record: any) => {
  if (Array.isArray(record.userDeptList) && record.userDeptList.length > 0) {
    const main = record.userDeptList.find((v: any) => v.partTime === 0);
    if (main) {
      setPartTimeRef.value?.showItem(
        { ...main, userId: record.id, nickname: record.nickname },
        1,
      );
      return;
    }
  }
  setPartTimeRef.value?.showItem(
    { userId: record.id, nickname: record.nickname },
    1,
  );
};

const onPartTime = (record: any) => {
  if (!hasPrimaryDept(record)) {
    Message.warning("请先设置主要部门");
    return;
  }
  extraDeptModalRef.value?.open(record);
};

const onResign = (record: any) => {
  resignModalRef.value?.open(record);
};

const onResignSuccess = () => {
  onSearch();
  refreshMeta();
};

const onRehireSuccess = () => {
  onSearch();
  refreshMeta();
};

const onRehireFromPanel = (record: any) => {
  rehireModalRef.value?.open(record);
};

const syncUserData = () => {
  Modal.confirm({
    title: "\u63d0\u793a",
    titleAlign: "start",
    content: "\u6b64\u64cd\u4f5c\u5c06\u540c\u6b65\u7528\u6237\u6570\u636e\uff0c\u53ef\u80fd\u4f1a\u5f71\u54cd\u6d41\u7a0b\u76f8\u5173\u4eba\u5458\u548c\u7ec4\u7ec7\u4fe1\u606f\uff0c\u662f\u5426\u7ee7\u7eed\uff1f",
    hideCancel: false,
    okText: "\u786e\u8ba4\u540c\u6b65",
    onOk: async () => {
      syncingUser.value = true;
      try {
        await syncUsers();
        Message.success("\u7528\u6237\u540c\u6b65\u5df2\u63d0\u4ea4\uff0c\u8bf7\u7a0d\u540e\u5237\u65b0\u5217\u8868");
        await loadMeta();
        onDeptChanged();
      } finally {
        syncingUser.value = false;
      }
    },
  });
};
const openImportModal = () => {
  importModalRef.value?.open();
};

const openAddRoleMember = () => {
  if (!selectedRoleId.value) {
    Message.warning("请先选择角色");
    return;
  }
  const role = roleList.value.find(
    (r: any) => String(r.id) === String(selectedRoleId.value),
  );
  roleMemberModalRef.value?.open(
    selectedRoleId.value,
    role?.roleName || "",
  );
};

const onRoleMemberAdded = () => {
  roleMemberPanelRef.value?.search();
};

onMounted(async () => {
  await loadMeta();
  setTimeout(() => activePanelRef.value.value?.search(), 0);
});

watch(
  () => route.query.tab,
  (tab) => {
    if (
      tab &&
      ["dept", "post", "role", "leader", "resigned"].includes(tab as string) &&
      leftTab.value !== tab
    ) {
      switchTab(tab as PersonLeftTab);
      searchKeyword.value = "";
      clearAllSelections();
      setTimeout(() => activePanelRef.value.value?.search(), 0);
    }
  },
);

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
