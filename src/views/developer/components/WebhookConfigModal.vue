<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import { Message } from "@arco-design/web-vue";
import { getWebhookConfig, setWebhookConfig, generateSecret } from '@/api/webHook';
import { testConnect } from '@/api/developer';

const props = defineProps<{
  visible: boolean;
  appName: string;
  appId: string | number;
  developerId?: string | number;
}>();

const emit = defineEmits<{
  "update:visible": [visible: boolean];
}>();

// 事件选项分组
const formEvents = [
  { label: "数据新增", value: 1 },
  { label: "数据修改", value: 2 },
  { label: "数据删除", value: 3 },
];

const flowEvents = [
  { label: "流程发起", value: 4 },
  { label: "流程完结", value: 5 },
  { label: "节点审批", value: 6 },
  { label: "节点填写", value: 7 },
  { label: "节点抄送", value: 8 },
];

const model = reactive({
  serverAddress: "",
  secret: "",
  events: [] as number[],
  mapping: "",
});

const currentConfig = ref<{ id?: number; subscribeId?: number; developerId?: number; appId?: number }>({});

const fieldMappingList = ref<{ fieldName: string; fieldCode: string; mappingCode: string }[]>([]);
const showFieldMapping = ref(false);

const fetchConfig = async () => {
  try {
    const res = await getWebhookConfig(props.appId);
    model.serverAddress = res.serverAddress || "";
    model.secret = res.secret || "";
    model.events = res.events ? res.events.split(",").map(Number) : [];
    model.mapping = res.mapping || "";
    currentConfig.value = {
      id: res.id,
      subscribeId: res.subscribeId,
      developerId: res.developerId,
      appId: res.appId,
    };
    if (res.mapping) {
      try {
        fieldMappingList.value = JSON.parse(res.mapping);
      } catch {
        fieldMappingList.value = [];
      }
    } else {
      fieldMappingList.value = [];
    }
  } catch (error) {
    console.error("获取配置失败:", error);
    Message.error("获取配置失败");
  }
};

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      fetchConfig();
    }
  },
);

const close = () => emit("update:visible", false);

const generateSecretFn = async () => {
  try {
    const secret = await generateSecret();
    model.secret = secret;
    Message.success("密钥生成成功");
  } catch (error) {
    console.error("生成密钥失败:", error);
    Message.error("生成密钥失败");
  }
};

const testWebhook = async () => {
  if (!model.serverAddress) {
    Message.warning("请先输入地址");
    return;
  }
  testConnect({
    serverAddress: model.serverAddress,
    secret: model.secret,
  }).then((res) => {
    if (res) {
      Message.success("连接测试成功");
    } else {
      Message.error("连接测试失败");
    }
  })
};

const save = async () => {
  try {
    await setWebhookConfig(props.appId, {
      id: currentConfig.value.id,
      subscribeId: currentConfig.value.subscribeId ?? Number(props.appId),
      developerId: currentConfig.value.developerId ?? Number(props.developerId),
      appId: currentConfig.value.appId ?? Number(props.appId),
      serverAddress: model.serverAddress.trim(),
      secret: model.secret.trim(),
      events: model.events.join(","),
      mapping: JSON.stringify(fieldMappingList.value),
    });
    Message.success("保存成功");
    close();
  } catch (error) {
    console.error("保存失败:", error);
    Message.error("保存失败");
  }
};
</script>

<template>
  <a-modal :visible="visible" :title="`${appName} - WebHook推送配置`" :width="600" :mask-closable="false" @cancel="close">
    <div class="webhook-config-body">
      <a-form layout="vertical">
        <!-- WebHook 服务器地址 -->
        <a-form-item label="WebHook 服务器地址" required>
          <div class="config-input-group">
            <div class="config-input">
              <a-input v-model="model.serverAddress" placeholder="https://your-server.com/webhook" />
            </div>
            <a-button class="test-btn" @click="testWebhook">
              <icon-link />
              <span>链接测试</span>
            </a-button>
          </div>
        </a-form-item>

        <!-- 密钥 -->
        <a-form-item label="密钥">
          <div class="config-input-group">
            <div class="config-input">
              <a-input v-model="model.secret" placeholder="请输入或生成密钥" />
            </div>

            <a-button class="generate-btn" @click="generateSecretFn">
              <icon-edit />
              <span>自动生成</span>
            </a-button>
          </div>
        </a-form-item>

        <!-- 订阅事件 -->
        <a-form-item label="订阅事件" required>
          <div class="event-groups-container">
            <!-- 表单事件 -->
            <div class="event-section">
              <div class="event-section-title">表单事件</div>
              <div class="event-section-content">
                <label v-for="item in formEvents" :key="item.value" class="event-item">
                  <a-checkbox v-model="model.events" :value="item.value" />
                  <span>{{ item.label }}</span>
                </label>
              </div>
            </div>

            <!-- 流程事件 -->
            <div class="event-section">
              <div class="event-section-title">流程事件</div>
              <div class="event-section-content">
                <label v-for="item in flowEvents" :key="item.value" class="event-item">
                  <a-checkbox v-model="model.events" :value="item.value" />
                  <span>{{ item.label }}</span>
                </label>
              </div>
            </div>
          </div>
        </a-form-item>

        <!-- 字段映射配置 -->
        <div class="field-mapping-section">
          <div class="field-mapping-header" @click="showFieldMapping = !showFieldMapping">
            <span class="header-title">字段映射配置</span>
            <icon-down v-if="!showFieldMapping" />
            <icon-up v-else />
          </div>

          <transition name="slide-fade">
            <div v-if="showFieldMapping" class="field-mapping-content">
              <table class="mapping-table">
                <thead>
                  <tr>
                    <th>字段名称</th>
                    <th>字段编码</th>
                    <th>映射编码</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in fieldMappingList" :key="row.fieldCode">
                    <td>{{ row.fieldName }}</td>
                    <td class="code-cell">{{ row.fieldCode }}</td>
                    <td class="code-cell">{{ row.mappingCode }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </transition>
        </div>
      </a-form>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="modal-footer-actions">
        <a-button class="cancel-btn" @click="close">取消</a-button>
        <a-button class="save-btn" type="primary" @click="save">
          <icon-save />
          <span>保存配置</span>
        </a-button>
      </div>
    </template>

  </a-modal>
</template>

<style lang="scss" scoped>
.webhook-config-body {
  padding-bottom: 8px;
}

/* 输入框组 */
.config-input-group {
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;

  .config-input {
    width: calc(100% - 124px);
  }

  :deep(.arco-input-wrapper) {
    flex: 1;
    border-radius: 10px;
    background: #f8fafc;
    border-color: #e2e8f0;

    &:focus-within {
      border-color: #3b82f6;
      background: white;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08);
    }
  }

  .test-btn,
  .generate-btn {
    padding: 8px 16px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1px solid #e2e8f0;
    background: white;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;

    &:hover {
      background: #f8fafc;
      color: #334155;
      border-color: #cbd5e1;
    }
  }
}

/* 事件分组 */
.event-groups-container {
  display: flex;
  flex-direction: column;
  // gap: 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: white;
  overflow: hidden;
}

.event-section {
  padding: 16px;

  &:not(:last-child) {
    // border-bottom: 1px solid #e2e8f0;
  }
}

.event-section-title {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 12px;
}

.event-section-content {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.event-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
  font-size: 13px;
  color: #475569;
  transition: all 0.2s;

  &:hover {
    border-color: #bfdbfe;
    background: #f8fafc;
  }

  :deep(.arco-checkbox-checked + span) {
    color: #2563eb;
  }

  &:has(:deep(.arco-checkbox-checked)) {
    border-color: #3b82f6;
    background: #eff6ff;
    color: #2563eb;
  }
}

/* 字段映射配置 */
.field-mapping-section {
  margin-top: 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: white;
  overflow: hidden;
}

.field-mapping-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
  }

  .header-title {
    font-size: 13px;
    font-weight: 600;
    color: #475569;
  }

  :deep(.arco-icon) {
    color: #94a3b8;
    font-size: 16px;
  }
}

.field-mapping-content {
  border-top: 1px solid #e2e8f0;
}

.mapping-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  thead {
    background: #f8fafc;

    th {
      padding: 12px 16px;
      text-align: left;
      font-weight: 600;
      color: #475569;
      border-bottom: 1px solid #e2e8f0;
    }
  }

  tbody {
    tr {
      &:nth-child(even) {
        background: #f8fafc;
      }

      td {
        padding: 12px 16px;
        color: #334155;
        border-bottom: 1px solid #f1f5f9;

        &.code-cell {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 12px;
          color: #64748b;
        }
      }

      &:last-child td {
        border-bottom: none;
      }
    }
  }
}

/* 过渡动画 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  max-height: 0;
  opacity: 0;
}

.slide-fade-enter-to,
.slide-fade-leave-from {
  max-height: 500px;
  opacity: 1;
}

/* 底部按钮 */
.modal-footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
}

.cancel-btn {
  padding: 9px 18px !important;
  border-radius: 10px !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  background: #f8fafc !important;
  color: #64748b !important;
  border: 1px solid #e2e8f0 !important;
  transition: all 0.2s !important;

  &:hover {
    background: #f1f5f9 !important;
    color: #334155 !important;
  }
}

.save-btn {
  padding: 9px 18px !important;
  border-radius: 10px !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  background: linear-gradient(135deg, #3b82f6, #6366f1) !important;
  color: white !important;
  border: none !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.25) !important;
  transition: all 0.2s !important;

  &:hover {
    transform: translateY(-1px) !important;
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35) !important;
  }
}
</style>
