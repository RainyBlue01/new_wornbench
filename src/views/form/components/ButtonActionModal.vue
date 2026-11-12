<template>
  <a-modal
    :visible="visible"
    title="设置动作"
    :width="900"
    :mask-closable="false"
    @cancel="handleClose"
    @ok="handleConfirm"
  >
    <div class="buttonActive">
      <a-card title="连接器与动作" :bordered="true" class="section-card">
        <a-form layout="vertical">
          <a-form-item label="连接器">
            <a-select
              v-model="localAction.connectorId"
              :options="connectorOptions"
              placeholder="请选择连接器"
              @change="changeConnector"
              allow-search
            />
          </a-form-item>
          <a-form-item label="动作">
            <a-select
              v-model="localAction.sceneId"
              :options="actionOptions"
              placeholder="请选择动作"
              allow-search
              @change="changeScene"
            />
          </a-form-item>
        </a-form>
      </a-card>

      <a-card title="变量配置" :bordered="true" class="section-card">
        <div class="var-summary">
          <div>入参变量：{{ localAction.input.length }}</div>
          <div>出参变量：{{ localAction.output.length }}</div>
          <div>填充当前表单字段：{{ localAction.enableOutput ? "开启" : "关闭" }}</div>
        </div>
        <a-button type="primary" long @click="openVariableModal">修改变量</a-button>
      </a-card>
      <variable
        ref="variableRef"
        :actions="currentActionMeta"
        :activeFlew="localAction"
        @refresh="refreshVariable"
      />
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import { Message } from "@arco-design/web-vue";
import { getConnectorList, getScene } from "@/api/connector/index";
import variable from "@/views/flowPath/components/variable.vue";
import type { BtnActionModel } from "@/utils/buttonAction";

const props = defineProps<{
  visible: boolean;
  btnAction: Partial<BtnActionModel>;
}>();

const emit = defineEmits<{
  "update:visible": [visible: boolean];
  save: [payload: BtnActionModel];
}>();

const variableRef = ref();
const connectorOptions = ref<any[]>([]);
const actionOptions = ref<any[]>([]);
const currentActionMeta = ref<any>({ input: [], output: { outputParams: [] } });

const localAction = reactive<BtnActionModel>({
  connectorId: "",
  connectorName: "",
  sceneId: "",
  sceneName: "",
  input: [],
  output: [],
  enableOutput: false,
});

const normalizeAction = () => {
  Object.assign(localAction, {
    connectorId: props.btnAction.connectorId ?? "",
    connectorName: props.btnAction.connectorName ?? "",
    sceneId: props.btnAction.sceneId ?? "",
    sceneName: props.btnAction.sceneName ?? "",
    input: Array.isArray(props.btnAction.input) ? [...props.btnAction.input] : [],
    output: Array.isArray(props.btnAction.output) ? [...props.btnAction.output] : [],
    enableOutput: !!props.btnAction.enableOutput,
  });
};

const loadConnectors = async () => {
  const res = await getConnectorList({ type: 1 });
  connectorOptions.value = (res || []).map((item: any) => ({
    label: item.name,
    value: item.id,
  }));
  if (localAction.connectorId) {
    await loadScenes(localAction.connectorId);
  }
};

const loadScenes = async (connectorId: number | string) => {
  if (!connectorId) {
    actionOptions.value = [];
    currentActionMeta.value = { input: [], output: { outputParams: [] } };
    return;
  }
  const res = await getScene(connectorId);
  actionOptions.value = (res || []).map((item: any) => ({
    label: item.name,
    value: item.id,
    input: item.input || [],
    output: item.output || { outputParams: [] },
  }));
  if (localAction.sceneId) {
    const target = actionOptions.value.find((v) => v.value === localAction.sceneId);
    if (target) currentActionMeta.value = target;
  }
};

const changeConnector = async (connectorId: number | string) => {
  localAction.connectorId = connectorId;
  localAction.sceneId = "";
  localAction.sceneName = "";
  const connector = connectorOptions.value.find((item) => item.value === connectorId);
  localAction.connectorName = connector?.label || "";
  await loadScenes(connectorId);
};

const changeScene = (sceneId: number | string) => {
  localAction.sceneId = sceneId;
  const scene = actionOptions.value.find((item) => item.value === sceneId);
  localAction.sceneName = scene?.label || "";
  currentActionMeta.value = scene || { input: [], output: { outputParams: [] } };
};

const openVariableModal = () => {
  if (!localAction.sceneId) {
    Message.warning("请先选择动作");
    return;
  }
  variableRef.value?.showModal(localAction);
};

const refreshVariable = (item: any) => {
  localAction.input.splice(0, localAction.input.length, ...(item.input || []));
  localAction.output.splice(0, localAction.output.length, ...(item.output || []));
  localAction.enableOutput = !!item.enableOutput;
};

const handleClose = () => emit("update:visible", false);

const handleConfirm = () => {
  if (!localAction.connectorId) {
    Message.warning("请选择连接器");
    return;
  }
  if (!localAction.sceneId) {
    Message.warning("请选择动作");
    return;
  }
  emit("save", { ...localAction });
  handleClose();
};

watch(
  () => props.visible,
  async (visible) => {
    if (!visible) return;
    normalizeAction();
    await loadConnectors();
  },
  { immediate: true },
);
</script>

<style scoped>
.buttonActive {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-card {
  width: 100%;
}

.var-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  color: #4e5969;
  font-size: 13px;
}
</style>
