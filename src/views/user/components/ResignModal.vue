<template>
  <base-modal
    ref="modalRef"
    modal-class="person-modal-wrap"
    @handle-ok="onConfirm"
    @handle-cancel="onCancel"
  >
    <div class="person-modal-alert">
      <icon-exclamation-circle-fill class="person-modal-alert__icon" />
      <div>
        <p class="person-modal-alert__title">谨慎操作</p>
        <p class="person-modal-alert__desc">
          离职后该成员将无法登录系统，其创建或负责的应用需转交给其他成员，请确认后再操作。
        </p>
      </div>
    </div>

    <p class="person-modal-person-line">
      人员：<strong>{{ record?.nickname || "-" }}</strong>
    </p>

    <template v-if="appLoading">
      <p class="person-modal-hint">加载应用中...</p>
    </template>
    <template v-else-if="appList.length">
      <div class="person-resign-toolbar">
        <span class="person-resign-toolbar__label">应用转交</span>
        <div class="person-resign-batch">
          <span>一键转交给</span>
          <a-select
            v-model="batchTransferId"
            placeholder="选择转交人"
            allow-clear
            :style="{ width: '140px' }"
            size="small"
            @change="onBatchTransfer"
          >
            <a-option
              v-for="u in candidateUsers"
              :key="u.id"
              :value="u.id"
              :label="u.nickname"
            />
          </a-select>
        </div>
      </div>
      <div class="person-modal-app-list">
        <div
          v-for="app in appList"
          :key="appKey(app)"
          class="person-modal-app-item"
        >
          <div>
            <p class="person-modal-app-item__name">{{ app.appName || app.name }}</p>
            <p v-if="app.roleLabels" class="person-modal-app-item__roles">{{ app.roleLabels }}</p>
          </div>
          <a-select
            v-model="transferMap[appKey(app)]"
            placeholder="选择转交人"
            allow-clear
            :style="{ width: '160px' }"
            size="small"
          >
            <a-option
              v-for="u in candidateUsers"
              :key="u.id"
              :value="u.id"
              :label="u.nickname"
            />
          </a-select>
        </div>
      </div>
    </template>
    <p v-else class="person-modal-hint">暂无需要转交的应用</p>
  </base-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { Message, Modal } from "@arco-design/web-vue";
import { IconExclamationCircleFill } from "@arco-design/web-vue/es/icon";
import { getUser, batchLeave } from "@/api/user/index";
import { getAppByUserId, batchAppTransfer } from "@/api/homePage/index";

const emit = defineEmits<{ success: [] }>();

const modalRef = ref();
const record = ref<any>(null);
const appList = ref<any[]>([]);
const appLoading = ref(false);
const candidateUsers = ref<any[]>([]);
const transferMap = reactive<Record<string, string | number>>({});
const batchTransferId = ref<string | number>("");

const appKey = (app: any) => String(app.id ?? app.appId);

const normalizeAppList = (res: any): any[] => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.records)) return res.records;
  if (Array.isArray(res?.data)) return res.data;
  return [];
};

const formatRoleLabels = (app: any) => {
  if (app.roleLabels || app.roleName) {
    return app.roleLabels || app.roleName;
  }
  const labels: string[] = [];
  if (app.creator) labels.push("创建者");
  if (app.manager) labels.push("负责人");
  if (app.createUser) labels.push("创建者");
  return labels.join("、") || "";
};

const loadCandidates = () => {
  getUser({ active: 1, userType: 1, current: 1, size: 500 }).then((res) => {
    candidateUsers.value = (res.records || []).filter(
      (u: any) => String(u.id) !== String(record.value?.id),
    );
  });
};

const loadApps = async () => {
  if (!record.value?.id) {
    appList.value = [];
    return;
  }
  appLoading.value = true;
  try {
    const res = await getAppByUserId(record.value.id);
    appList.value = normalizeAppList(res).map((app: any) => ({
      ...app,
      roleLabels: formatRoleLabels(app),
    }));
    Object.keys(transferMap).forEach((k) => delete transferMap[k]);
    appList.value.forEach((app) => {
      transferMap[appKey(app)] = "";
    });
  } catch {
    appList.value = [];
  } finally {
    appLoading.value = false;
  }
};

const open = (row: any) => {
  record.value = row;
  batchTransferId.value = "";
  appList.value = [];
  Object.keys(transferMap).forEach((k) => delete transferMap[k]);
  loadCandidates();
  loadApps();
  modalRef.value?.handleClick({
    title: "成员离职",
    showBtn: true,
    width: "520px",
    okText: "确认离职",
    cancelText: "取消",
    okDanger: true,
  });
};

const onBatchTransfer = (val: string | number) => {
  if (!val) return;
  appList.value.forEach((app) => {
    transferMap[appKey(app)] = val;
  });
};

const onCancel = () => {
  record.value = null;
  appList.value = [];
  modalRef.value?.handleClose();
};

const onConfirm = () => {
  return new Promise<void>((resolve, reject) => {
    Modal.confirm({
      title: "再次确认",
         titleAlign: "start",
      content: `确定将「${record.value?.nickname}」设为离职吗？此操作不可轻易撤销。`,
      modalClass: "person-modal-wrap",
      onOk: async () => {
        try {
          const transferApps = appList.value
            .map((app) => ({
              appId: app.id ?? app.appId,
              userId: transferMap[appKey(app)],
            }))
            .filter((item) => item.appId != null && item.userId);

          if (transferApps.length > 0) {
            await batchAppTransfer({ transferApps,creatorId:record.value.id });
          }
          await batchLeave({ userIds: [record.value.id] });
          Message.success("离职成功");
          emit("success");
          onCancel();
          resolve();
        } catch (e) {
          reject(e);
        }
      },
      onCancel: () => reject(),
    });
  });
};

defineExpose({ open });
</script>

<style lang="scss" scoped>
@use "@/styles/person-modal.scss";

.person-modal-alert {
  display: flex;
  gap: 10px;
}

.person-modal-alert__icon {
  color: #dc2626;
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 2px;
}

.person-resign-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;

  &__label {
    font-size: 13px;
    font-weight: 600;
    color: #334155;
  }
}

.person-resign-batch {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #64748b;
}
</style>
