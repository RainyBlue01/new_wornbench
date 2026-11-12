<template>
  <div class="integration-panel" :class="{ 'integration-panel--embedded': embedded }">
    <div class="integration-content">
      <div class="integration-inner">
        <div class="integration-info-card">
          <div class="integration-info-card__row">
            <div class="integration-info-card__icon">
             <i class="fas fa-info-circle text-blue-500 text-sm"></i>
            </div>
            <div>
              <p class="integration-info-card__title">数据写入</p>
              <p class="integration-info-card__desc">
                支持外部系统数据直接对接：既能让外部业务一键写入并自动触发本系统的审批流程，也能作为通用接口实现外部数据的快速同步入库。
              </p>
            </div>
          </div>
        </div>

        <div class="integration-form-card">
          <div class="integration-form">
            <div class="dw-toggle" :class="{ 'dw-toggle--standalone': !activeEnabled }">
              <span class="dw-toggle-label">开启数据写入</span>
              <a-switch
                :model-value="activeEnabled"
                :loading="toggleLoading"
                @change="onToggleActive"
              />
            </div>
            <div class="dw-form" v-show="activeEnabled"> 
                  <div class="dw-field" style="margin-top: 20px">
              <label class="dw-field-label">业务描述</label>
              <a-textarea
                v-model="form.desc"
                :max-length="100"
                show-word-limit
                placeholder="请输入业务描述"
                :auto-size="{ minRows: 3, maxRows: 5 }"
              />
            </div>

            <div class="dw-field">
              <label class="dw-field-label">URL</label>
              <div class="dw-url-box">
                <a-input :model-value="displayUrl" readonly />
                <a-button @click="copyUrl" class="dw-copy-btn">
                  <icon-copy />
                  复制
                </a-button>
              </div>
            </div>

            <div class="dw-field">
              <label class="dw-field-label">
                接入数据是否进入该应用对应的审批流程（如果是非流程表单，则直接写入）
              </label>
              <a-select v-model="form.approve">
                <a-option :value="false">否</a-option>
                <a-option :value="true">是</a-option>
              </a-select>
            </div>

            <div class="dw-field">
              <label class="dw-field-label">接收数据类型</label>
              <a-select v-model="form.resolveType">
                <a-option :value="0">JSON</a-option>
                <!-- <a-option :value="1">XML</a-option>
                <a-option :value="2">Form Data</a-option> -->
              </a-select>
            </div>

            <div class="dw-field">
              <label class="dw-field-label">数据解析</label>
              <DataWriteParseRowList
                v-model:rows="parseRows"
                :form-list="formList"
                :top-field-options="topFieldOptions"
              />
              <button type="button" class="dw-add-btn" style="margin-top: 8px" @click="addParseRow">
                <icon-plus />
                新增
              </button>
            </div>

            <div class="dw-field">
              <label class="dw-field-label">数据更新</label>
              <a-select v-model="form.dataUpdate">
                <a-option :value="false">否</a-option>
                <a-option :value="true">是</a-option>
              </a-select>
            </div>

            <div class="dw-field">
              <span class="dw-link" @click="openRuleModal">
                数据更新规则：{{ ruleConditionCount }}条
              </span>
            </div>

            <div class="dw-field">
              <label class="dw-field-label">IP白名单</label>
              <a-textarea
                v-model="form.whiteList"
                :max-length="100"
                show-word-limit
                placeholder="请输入IP白名单"
                :auto-size="{ minRows: 3, maxRows: 5 }"
              />
            </div>
            </div>
      
          </div>
        </div>
      </div>
    </div>

    <div class="integration-footer">
      <div class="footer-center">
        <a-button type="primary" :loading="saveLoading" @click="handleSave">保存</a-button>
      </div>
     
    </div>

    <a-modal
      v-model:visible="ruleModalVisible"
      title="数据更新规则"
      :width="560"
      unmount-on-close
      @before-ok="confirmRuleModal"
      @cancel="cancelRuleModal"
    >
      <div class="dw-rule-condition-bar">
        <a-radio-group v-model="ruleDraft.option">
          <a-radio :value="1">满足全部条件</a-radio>
          <a-radio :value="2">满足任一条件</a-radio>
        </a-radio-group>
      </div>
      <DataWriteParseRowList
        v-model:rows="ruleDraft.conditions"
        :form-list="formList"
        :top-field-options="topFieldOptions"
      />
      <button type="button" class="dw-rule-add" style="margin-top: 8px" @click="addRuleRow">
        <icon-plus />
        新增
      </button>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { Message } from '@arco-design/web-vue';
import {
  getDataWriteConfig,
  saveDataWriteConfig,
  setDataWriteActive,
  getDefaultDataWriteUrl,
  type DataUpdateRule,
} from '@/api/dataWrite/index';
import { getDesignApp } from '@/api/form/index';
import DataWriteParseRowList from './DataWriteParseRowList.vue';
import {
  buildTopFieldOptions,
  countParseConditions,
  createEmptyParseRow,
  mapFieldConfigToRows,
  resetRowKeySeed,
  serializeFieldConfig,
  validateParseTree,
  type FieldOption,
  type ParseRow,
} from './dataWriteParseUtils';

interface RuleDraft {
  option: number;
  conditions: ParseRow[];
}

const props = withDefaults(
  defineProps<{
    embedded?: boolean;
    active?: boolean;
    appdes?: Record<string, any>;
  }>(),
  {
    embedded: false,
    active: false,
    appdes: () => ({}),
  },
);

const activeEnabled = ref(false);
const toggleLoading = ref(false);
const saveLoading = ref(false);
const ruleModalVisible = ref(false);

const form = reactive({
  desc: '',
  apiUrl: '',
  approve: true,
  resolveType: 0,
  dataUpdate: false,
  whiteList: '',
});

const parseRows = ref<ParseRow[]>([]);
const updateRule = ref<DataUpdateRule | null>(null);
const ruleDraft = reactive<RuleDraft>({
  option: 1,
  conditions: [],
});

const formList = ref<any[]>([]);
const topFieldOptions = ref<FieldOption[]>([]);

const appId = computed(() => props.appdes?.id);

const displayUrl = computed(() => getDefaultDataWriteUrl(props.appdes?.id));

const ruleConditionCount = computed(() =>
  countParseConditions(updateRule.value?.conditions),
);

const loadFormFields = async (id: string | number) => {
  try {
    const res = await getDesignApp(id);
    const formConfig = res.formConfig ? JSON.parse(res.formConfig) : { formList: [] };
    formList.value = formConfig.formList || [];
    topFieldOptions.value = buildTopFieldOptions(formList.value);
  } catch {
    formList.value = [];
    topFieldOptions.value = [];
  }
};

const applyConfig = (data: Record<string, any>) => {
  resetRowKeySeed();
  form.desc = data.desc ?? '';
  form.apiUrl = data.apiUrl ?? '';
  form.approve = data.approve ?? true;
  form.resolveType = data.resolveType ?? 0;
  form.dataUpdate = data.dataUpdate ?? false;
  form.whiteList = data.whiteList ?? '';
  activeEnabled.value = data.active === 1;
  parseRows.value = mapFieldConfigToRows(data.fieldConfig);
  const rule = Array.isArray(data.updateRule) ? data.updateRule[0] : null;
  updateRule.value = rule
    ? {
        option: rule.option ?? 1,
        conditions: rule.conditions ?? [],
      }
    : null;
};

const loadConfig = async (id: string | number) => {
  try {
    const [config] = await Promise.all([getDataWriteConfig(id), loadFormFields(id)]);
    applyConfig(config ?? {});
  } catch {
    await loadFormFields(id);
    applyConfig({});
  }
};

watch(
  () => [props.active, appId.value] as const,
  ([active, id]) => {
    if (active && id) {
      loadConfig(id);
    }
  },
  { immediate: true },
);

const addParseRow = () => {
  parseRows.value.push(createEmptyParseRow());
};

const openRuleModal = () => {
  resetRowKeySeed();
  const rule = updateRule.value;
  ruleDraft.option = rule?.option ?? 1;
  ruleDraft.conditions = mapFieldConfigToRows(rule?.conditions);
  if (!ruleDraft.conditions.length) {
    ruleDraft.conditions.push(createEmptyParseRow());
  }
  ruleModalVisible.value = true;
};

const addRuleRow = () => {
  ruleDraft.conditions.push(createEmptyParseRow());
};

const confirmRuleModal = () => {
  const parseError = validateParseTree(ruleDraft.conditions, '数据更新规则');
  if (parseError) {
    Message.warning(parseError);
    return false;
  }
  updateRule.value = {
    option: ruleDraft.option,
    conditions: serializeFieldConfig(ruleDraft.conditions),
  };
  return true;
};

const cancelRuleModal = () => {
  ruleModalVisible.value = false;
};

const validateForm = (): boolean => {
  if (!activeEnabled.value) return true;
  const parseError = validateParseTree(parseRows.value, '数据解析');
  if (parseError) {
    Message.warning(parseError);
    return false;
  }
  if (form.dataUpdate && updateRule.value?.conditions?.length) {
    const ruleError = validateParseTree(
      mapFieldConfigToRows(updateRule.value.conditions),
      '数据更新规则',
    );
    if (ruleError) {
      Message.warning(ruleError);
      return false;
    }
  }
  return true;
};

const buildSavePayload = () => {
  const payload: Record<string, any> = {
    desc: form.desc,
    apiUrl: form.apiUrl || displayUrl.value,
    approve: form.approve,
    resolveType: form.resolveType,
    fieldConfig: serializeFieldConfig(parseRows.value),
    dataUpdate: form.dataUpdate,
    whiteList: form.whiteList,
  };
  if (form.dataUpdate && updateRule.value) {
    payload.updateRule = [
      {
        option: updateRule.value.option ?? 1,
        conditions: updateRule.value.conditions ?? [],
      },
    ];
  } else {
    payload.updateRule = [];
  }
  return payload;
};

const onToggleActive = async (val: boolean | string | number) => {
  const next = Boolean(val);
  const id = appId.value;
  if (!id) return;
  const prev = activeEnabled.value;
  activeEnabled.value = next;
  toggleLoading.value = true;
  try {
    await setDataWriteActive(id, { active: next ? 1 : 0 });
    Message.success(next ? '已开启数据写入' : '已关闭数据写入');
  } catch {
    activeEnabled.value = prev;
  } finally {
    toggleLoading.value = false;
  }
};

const handleSave = async () => {
  const id = appId.value;
  if (!id) {
    Message.warning('应用信息未加载');
    return;
  }
  if (!validateForm()) return;
  saveLoading.value = true;
  try {
    await saveDataWriteConfig(id, buildSavePayload());
    Message.success('保存成功');
    await loadConfig(id);
  } finally {
    saveLoading.value = false;
  }
};

const copyUrl = async () => {
  // 尝试使用现代 Clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(displayUrl.value);
      Message.success('已复制到剪贴板');
    } catch {
      fallbackCopyToClipboard(displayUrl.value);
    }
  } else {
    // 降级方案：使用 execCommand
    fallbackCopyToClipboard(displayUrl.value);
  }
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
      Message.success('已复制到剪贴板');
    } else {
      Message.error('复制失败，请手动复制');
    }
  } catch (err) {
    console.error('复制失败:', err);
    Message.error('复制失败，请手动复制');
  }
};
</script>

<style lang="scss" scoped>
@use '@/styles/app-integration-panel.scss';
</style>
