<script setup lang="ts">
import { computed, ref } from "vue";
import { Message } from "@arco-design/web-vue";

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

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  "update:visible": [visible: boolean];
  confirm: [rows: ConnectorItem[]];
}>();

const currentStep = ref(1);
const uploadName = ref("");
const apiList = ref([
  { id: "1", method: "GET", path: "/api/users", desc: "获取用户列表", selected: true },
  { id: "2", method: "POST", path: "/api/users", desc: "创建用户", selected: true },
  { id: "3", method: "PUT", path: "/api/users/{id}", desc: "更新用户", selected: false },
  { id: "4", method: "DELETE", path: "/api/users/{id}", desc: "删除用户", selected: false },
]);

const selectedCount = computed(() => apiList.value.filter((item) => item.selected).length);
const canNext = computed(() => {
  if (currentStep.value === 1) return !!uploadName.value;
  if (currentStep.value === 2) return selectedCount.value > 0;
  return true;
});

const close = () => {
  emit("update:visible", false);
  currentStep.value = 1;
  uploadName.value = "";
  apiList.value.forEach((item) => {
    item.selected = item.id === "1" || item.id === "2";
  });
};

const next = () => {
  if (!canNext.value) {
    Message.warning("请先完成当前步骤");
    return;
  }
  if (currentStep.value < 3) {
    currentStep.value += 1;
    return;
  }
  const lang = uploadName.value.endsWith(".jar")
    ? "JAR"
    : uploadName.value.endsWith(".py")
      ? "Python"
      : "PHP";
  emit("confirm", [
    {
      id: `${Date.now()}`,
      name: uploadName.value,
      language: lang,
      status: "解析成功",
      endpointCount: apiList.value.length,
      enabledCount: selectedCount.value,
      disabledCount: apiList.value.length - selectedCount.value,
      size: "12.5 MB",
      uploadTime: new Date().toLocaleDateString(),
    },
  ]);
  close();
};

const prev = () => {
  if (currentStep.value > 1) currentStep.value -= 1;
};

const mockUpload = () => {
  uploadName.value = "user-service-v1.0.jar";
  Message.success("上传成功，点击下一步解析");
};
</script>

<template>
  <a-modal
    :visible="props.visible"
    title="添加连接器"
    :width="720"
    :render-to-body="false"
    :mask-closable="false"
    @cancel="close"
  >
    <div class="conn-step-wrap">
      <a-steps :current="currentStep - 1" size="small">
        <a-step title="上传接口包" />
        <a-step title="解析预览" />
        <a-step title="确认导入" />
      </a-steps>
    </div>

    <div v-if="currentStep === 1" class="wizard-step">
      <p class="wizard-tip">支持上传 JAR、PHP、Python 等接口包文件。</p>
      <div class="upload-zone" @click="mockUpload">
        <div class="upload-zone__title">{{ uploadName || "点击上传接口包" }}</div>
        <div class="upload-zone__hint">支持 .jar .py .php</div>
      </div>
    </div>

    <div v-else-if="currentStep === 2" class="wizard-step">
      <div class="wizard-tip">已解析 {{ apiList.length }} 个接口，勾选需要导入的接口。</div>
      <div class="api-select-list">
        <label v-for="row in apiList" :key="row.id" class="api-select-item">
          <a-checkbox v-model="row.selected" />
          <span class="api-method">{{ row.method }}</span>
          <span class="api-path">{{ row.path }}</span>
          <span class="api-desc">{{ row.desc }}</span>
        </label>
      </div>
    </div>

    <div v-else class="wizard-step wizard-confirm">
      <i class="fas fa-check-circle wizard-success-icon" />
      <p>解析完成，共选择 {{ selectedCount }} 个接口用于导入。</p>
    </div>

  
         <template #footer>
   <div class="wizard-footer">
      <a-button  @click="close">取消</a-button>
      <a-button v-if="currentStep > 1"  @click="prev">上一步</a-button>
      <a-button type="primary" @click="next">{{ currentStep === 3 ? "确认导入" : "下一步" }}</a-button>
    </div>
     </template>
  </a-modal>
</template>

<style lang="scss" scoped>
.wizard-footer::v-deep {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  
.modal-btn {
  padding: 9px 18px !important;
  border-radius: 10px !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  transition: all 0.2s !important;
  border: none !important;

  &.modal-btn-ghost {
    background: #f8fafc !important;
    color: #64748b !important;
    border: 1px solid #e2e8f0 !important;

    &:hover {
      background: #f1f5f9 !important;
      color: #334155 !important;
    }
  }

  &.modal-btn-primary {
    background: linear-gradient(135deg, #3b82f6, #6366f1) !important;
    color: white !important;
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.25) !important;

    &:hover {
      transform: translateY(-1px) !important;
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35) !important;
    }
  }
}
}

</style>
