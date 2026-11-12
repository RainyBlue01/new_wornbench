<template>
  <div class="developer-page">
    <userBanner url="/homepage" :title="'开发者中心'" :active="2" />
    <div class="dev-main">


      <div class="dev-card">
        <div class="dev-card-header">
          <h3>开发者管理</h3>
          <div class="dev-toolbar-actions">
            <a-input v-model="keyword" class="dev-search-input" placeholder="搜索开发者或 AppID..." allow-clear
              @change="handleSearch" />
            <a-button class="dev-add-btn" @click="openCreateDeveloper">
              新增
            </a-button>
          </div>
        </div>
        <div class="dev-card-body">
          <div class="dev-table-wrap">
            <a-table row-key="id" :pagination="false" :columns="developerColumns" :bordered="false"
              :data="developerList">
              <template #serialNumber="{ rowIndex }">
                <span class="dev-cell-index">{{ rowIndex + 1 }}</span>
              </template>
              <template #developer="{ record }">
                <span class="dev-cell-name">{{ record.developer || "--" }}</span>
              </template>
              <template #appid="{ record }">
                <span class="dev-cell-mono-id">{{ record.id }}</span>
              </template>
              <template #authCount="{ record }">
                <span class="conn-tag">{{ authCountMap[record.id] || 0 }}</span>
              </template>
              <template #connectorCount="{ record }">
                <span class="conn-tag">{{ connectorCountMap[record.id] || 0 }}</span>
              </template>
              <template #active="{ record }">
                <span class="status-tag" :class="record.active === 1 ? 'on' : 'off'">
                  {{ record.active === 1 ? "启用" : "禁用" }}
                </span>
              </template>
              <template #optional="{ record }">
                <div class="dev-actions">
                  <DeveloperMoreActions :record="record" @edit="openEditDeveloper" @toggle="toggleDeveloperState"
                    @copy="copySecret" @reset="resetDeveloperSecret" />
                  <button type="button" class="ops-action-btn ops-action-btn--primary" @click="openAuthDrawer(record)">
                    授权管理
                  </button>
                  <!-- <button type="button" class="action-btn primary" @click="openConnectorDrawer(record)">
                    连接器管理
                  </button> -->
                </div>
              </template>
            </a-table>
          </div>
          <div class="dev-pagination">
            <PersonPagination :total="developerPagination.total" :current="developerPagination.pageNum"
              :page-size="developerPagination.pageSize" :show-page-size="false" :show-jump="false"
              @change="handleDeveloperPageChange" />
          </div>
        </div>
      </div>


    </div>

    <AddDeveloperModal v-model:visible="developerModalVisible" :edit-data="editingDeveloper"
      @success="handleDeveloperSaved" />
    <AuthManageDrawer :visible="authDrawerVisible" :developer="currentDeveloper" :rows="authRows" :loading="authLoading"
      @close="authDrawerVisible = false" @add-auth="openAddAuth" @open-webhook="openWebhookModal"
      @open-data-write="openDataWriteModal" @delete-auth="handleDeleteAuth" />
    <ConnectorManageDrawer :visible="connectorDrawerVisible" :developer="currentDeveloper"
      :connectors="currentConnectorList" @close="connectorDrawerVisible = false" @remove="removeConnector"
      @open-add="addConnectorVisible = true" />
    <WebhookConfigModal v-model:visible="webhookModalVisible" :app-name="activeAppName" :app-id="activeAppId"
      :developer-id="activeDeveloperId" />
    <DataWriteConfigModal :app-id="dataWriteConfig.appId" v-model:visible="dataWriteModalVisible"
      :app-name="activeAppName" />
    <AddConnectorWizard v-model:visible="addConnectorVisible" @confirm="confirmImportConnector" />
    <AddAuthModal ref="addAuthRef" @init="loadAuthRows" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { Message, Modal } from "@arco-design/web-vue";
import PersonPagination from "@/views/user/components/PersonPagination.vue";
import {
  getDeveloper,
  getPageRecord,
  getSubscribePage,
  putSeveloper,
  resetSecret,
  setSeveloper,
  setState,
  deleteSubscribe,
} from "@/api/developer/index";
import DeveloperMoreActions from "./components/DeveloperMoreActions.vue";
import AddDeveloperModal from "./components/AddDeveloperModal.vue";
import AuthManageDrawer from "./components/AuthManageDrawer.vue";
import ConnectorManageDrawer from "./components/ConnectorManageDrawer.vue";
import WebhookConfigModal from "./components/WebhookConfigModal.vue";
import DataWriteConfigModal from "./components/DataWriteConfigModal.vue";
import AddConnectorWizard from "./components/AddConnectorWizard.vue";
import AddAuthModal from "./subscriptionApp/create.vue";

interface DeveloperRecord {
  id: string;
  developer: string;
  serverAddress?: string;
  active: number;
}

interface ConnectorItem {
  id: string;
  name: string;
  language: string;
  status: string;
  endpointCount: number;
  enabledCount: number;
  disabledCount: number;
  size: string;
  uploadTime: string;
}

const activeTab = ref<"developer" | "connector">("developer");
const keyword = ref("");
const connectorKeyword = ref("");
const developerList = ref<DeveloperRecord[]>([]);
const developerPagination = reactive({ total: 0, pageNum: 1, pageSize: 10 });

const authCountMap = reactive<Record<string, number>>({});
const connectorCountMap = reactive<Record<string, number>>({});
const connectorStore = reactive<Record<string, ConnectorItem[]>>({});

const developerModalVisible = ref(false);
const authDrawerVisible = ref(false);
const connectorDrawerVisible = ref(false);
const webhookModalVisible = ref(false);
const dataWriteModalVisible = ref(false);
const addConnectorVisible = ref(false);
const addAuthRef = ref();
const authLoading = ref(false);

const currentDeveloper = ref<DeveloperRecord | null>(null);
const editingDeveloper = ref<DeveloperRecord | null>(null);
const activeAppName = ref("");
const authRows = ref<any[]>([]);

const webhookConfig = ref({ url: "", secret: "", events: [] as number[] });
const dataWriteConfig = ref({
  desc: "该应用用于业务系统数据对接，请确保调用方具备相应权限。",
  url: "https://api.example.com/datawrite/default",
  schema: '{\n  "appId": "xxx",\n  "timestamp": 1717497600,\n  "data": [],\n  "signature": "xxx"\n}',
});

const developerColumns = [
  { title: "序号", width: 60, align: "center", slotName: "serialNumber" },
  { title: "开发者", slotName: "developer" },
  { title: "开发者ID", slotName: "appid" },
  { title: "授权应用", width: 100, align: "center", slotName: "authCount" },
  { title: "连接器", width: 100, align: "center", slotName: "connectorCount" },
  { title: "状态", width: 90, align: "center", slotName: "active" },
  { title: "管理", width: 180, align: "center", slotName: "optional" },
];

const officialConnectors = ref([
  {
    id: "rest",
    name: "REST API 连接器",
    desc: "通用 RESTful API 调用，支持 GET/POST/PUT/DELETE",
    tags: ["HTTP", "JSON", "官方"],
    color: "linear-gradient(135deg,#3b82f6,#6366f1)",
  },
  {
    id: "db",
    name: "数据库连接器",
    desc: "MySQL、PostgreSQL、SQL Server 数据库连接",
    tags: ["SQL", "官方"],
    color: "linear-gradient(135deg,#10b981,#059669)",
  },
  {
    id: "mq",
    name: "消息队列连接器",
    desc: "RabbitMQ、Kafka、RocketMQ 消息队列集成",
    tags: ["MQ", "官方"],
    color: "linear-gradient(135deg,#f59e0b,#d97706)",
  },
]);

const filteredOfficialConnectors = computed(() => {
  const key = connectorKeyword.value.trim().toLowerCase();
  if (!key) return officialConnectors.value;
  return officialConnectors.value.filter(
    (item) => item.name.toLowerCase().includes(key) || item.desc.toLowerCase().includes(key),
  );
});

const currentConnectorList = computed<ConnectorItem[]>(() => {
  if (!currentDeveloper.value?.id) return [];
  return connectorStore[currentDeveloper.value.id] || [];
});

const handleDeveloperPageChange = (page: number) => {
  developerPagination.pageNum = page;
  fetchDevelopers();
};

const handleSearch = () => {
  developerPagination.pageNum = 1;
  fetchDevelopers();
};

const fetchDevelopers = async () => {
  const params = {
    username: keyword.value.trim(),
    current: developerPagination.pageNum,
    size: developerPagination.pageSize,
  };
  const res = await getPageRecord(params);
  developerPagination.total = res?.total || 0;
  developerList.value = res?.records || [];
  await Promise.all(developerList.value.map((item) => fillDevStatistics(item.id)));
};

const fillDevStatistics = async (developerId: string) => {
  const res = await getSubscribePage({ developerId, current: 1, size: 200 });
  authCountMap[developerId] = res?.total || 0;
  if (!connectorStore[developerId]) {
    connectorStore[developerId] = [];
  }
  connectorCountMap[developerId] = connectorStore[developerId].length;
};

const openCreateDeveloper = () => {
  editingDeveloper.value = null;
  developerModalVisible.value = true;
};

const openEditDeveloper = (record: DeveloperRecord) => {
  editingDeveloper.value = { ...record };
  developerModalVisible.value = true;
};

const handleDeveloperSaved = async (payload: { id?: string; developer: string; intro: string }) => {
  if (payload.id) {
    await putSeveloper({ developer: payload.developer, intro: payload.intro }, payload.id);
    Message.success("修改成功");
  } else {
    await setSeveloper(payload);
    Message.success("新增成功");
  }
  developerModalVisible.value = false;
  fetchDevelopers();
};

const toggleDeveloperState = (record: DeveloperRecord) => {
  const targetActive = record.active === 1 ? 0 : 1;
  const actionText = targetActive === 1 ? "启用" : "禁用";
  Modal.confirm({
    title: `${actionText}开发者`,
    content:
      targetActive === 0
        ? "禁用后，该开发者已授权应用的数据写入和 WebHook 推送将暂停。"
        : "确认启用该开发者？",
    hideCancel: false,
    onOk: async () => {
      await setState({ id: record.id, active: targetActive });
      Message.success(`${actionText}成功`);
      fetchDevelopers();
    },
  });
};

// 降级复制方法（兼容旧版浏览器）
const fallbackCopyToClipboard = (text: string) => {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);

    if (successful) {
      Message.success("已复制");
    } else {
      Message.error("复制失败，请手动复制");
    }
  } catch (err) {
    console.error('复制失败:', err);
    Message.error("复制失败，请手动复制");
  }
};

const copyText = async (text: string) => {
  // 尝试使用现代 Clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      Message.success("已复制");
    } catch {
      fallbackCopyToClipboard(text);
    }
  } else {
    // 降级方案：使用 execCommand
    fallbackCopyToClipboard(text);
  }
};

const copySecret = async (record: DeveloperRecord) => {
  const res = await getDeveloper(record.id);
  if (!res?.secret) {
    Message.warning("暂无密钥");
    return;
  }
  copyText(res.secret);
};

const resetDeveloperSecret = (record: DeveloperRecord) => {
  Modal.confirm({
    title: "重置密钥",
    content: "重置后旧密钥将立即失效，是否继续？",
    hideCancel: false,
    onOk: async () => {
      const secret = await resetSecret(record.id);
      Modal.info({ title: "重置成功", content: String(secret || "") });
    },
  });
};

const openAuthDrawer = async (record: DeveloperRecord) => {
  currentDeveloper.value = record;
  authDrawerVisible.value = true;
  await loadAuthRows();
};

const loadAuthRows = async () => {
  if (!currentDeveloper.value?.id) return;
  authLoading.value = true;
  try {
    const res = await getSubscribePage({
      developerId: currentDeveloper.value.id,
      current: 1,
      size: 200,
    });
    authRows.value = (res?.records || []).map((item: any) => ({
      ...item,
      appId: item.appId || item.id,
      appName: item.appName || "未命名应用",
      dataWriteEnabled: item.dataWriteEnabled || false,
      webhookEnabled: item.webhookEnabled || false,
    }));
    authCountMap[currentDeveloper.value.id] = authRows.value.length;
  } finally {
    authLoading.value = false;
  }
};

const openAddAuth = () => {
  if (!currentDeveloper.value?.id) return;
  addAuthRef.value?.showItem({
    developerId: currentDeveloper.value.id,
    authorizedAppIds: authRows.value.map((item) => item.appId),
  });
};

const openConnectorDrawer = (record: DeveloperRecord) => {
  currentDeveloper.value = record;
  if (!connectorStore[record.id]) {
    connectorStore[record.id] = [];
  }
  connectorDrawerVisible.value = true;
};

const removeConnector = (connectorId: string) => {
  if (!currentDeveloper.value?.id) return;
  connectorStore[currentDeveloper.value.id] = connectorStore[currentDeveloper.value.id].filter(
    (item) => item.id !== connectorId,
  );
  connectorCountMap[currentDeveloper.value.id] = connectorStore[currentDeveloper.value.id].length;
  Message.success("连接器已移除");
};

const confirmImportConnector = (rows: ConnectorItem[]) => {
  if (!currentDeveloper.value?.id || rows.length === 0) return;
  const next = [...(connectorStore[currentDeveloper.value.id] || []), ...rows];
  connectorStore[currentDeveloper.value.id] = next;
  connectorCountMap[currentDeveloper.value.id] = next.length;
  addConnectorVisible.value = false;
  Message.success(`成功导入 ${rows.length} 个连接器`);
};

const activeAppId = ref<string | number>("");
const activeDeveloperId = ref<string | number>("");

const openWebhookModal = (item: any) => {
  activeAppName.value = item.appName;
  activeAppId.value = item.subscribeId;
  activeDeveloperId.value = item.developerId || currentDeveloper.value?.id || "";
  webhookModalVisible.value = true;
};

const openDataWriteModal = (item: any) => {
  activeAppName.value = item.appName;
  dataWriteConfig.value = {
    ...dataWriteConfig.value,
    appId: item.appId,
    url: `https://api.example.com/datawrite/${item.appName}`,
  };
  dataWriteModalVisible.value = true;
};

const handleDeleteAuth = (subscribeId: string) => {
  Modal.confirm({
    title: "取消授权",
    content: "取消授权后，该应用的数据写入和 WebHook 推送权限将被移除。",
    hideCancel: false,
    onOk: async () => {
      await deleteSubscribe(subscribeId);
      Message.success("取消授权成功");
      loadAuthRows();
    },
  });
};

onMounted(() => {
  fetchDevelopers();
});
</script>

<style lang="scss" scoped>
@use "@/styles/developer-center.scss";
</style>
