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
              <p class="integration-info-card__title">WebHook</p>
              <p class="integration-info-card__desc">
                Webhook
                是一种"事件驱动"的自动化数据推送机制。当系统内发生特定事件时（表单：数据新增、数据修改、数据删除；流程：流程完结、流程发起、节点审批、节点填写、节点抄送），系统会立即自动将最新数据发送到你指定的接收端。它能让你的多个系统之间实现秒级、无缝的实时联动，既高效又省资源。
              </p>
            </div>
          </div>
        </div>

        <div class="integration-form-card">
          <div class="dw-toggle" :class="{ 'dw-toggle--standalone': formData.active !== 1 }">
            <span class="dw-toggle-label">
              开启 WebHook
            </span>
            <a-switch v-model="formData.active" :checked-value="1" :unchecked-value="0" />
          </div>

          <div v-show="formData.active === 1" class="webhook-mapping-panel">
            <webhook-mapping ref="webhookMappingRef" :app-id="String(appId || '')" :mapping="formData.mapping"
              @change="changeWebhookMapping" />
          </div>
        </div>
      </div>
    </div>

    <div class="integration-footer">
      <div class="footer-center">
        <a-button type="primary" :loading="saveLoading" @click="handleSave">保存</a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { Message } from '@arco-design/web-vue';
import { getWebhookConfig, setWebhookConfig } from '@/api/homePage/index';
import WebhookMapping from '@/views/application/updateApp/webhookMapping.vue';

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

const formData = reactive({
  active: 0 as number,
  mapping: '',
});

const webhookMappingRef = ref<InstanceType<typeof WebhookMapping> | null>(null);
const mappingData = ref<any[]>([]);
const saveLoading = ref(false);

const appId = computed(() => props.appdes?.id);

const loadConfig = async (id: string | number) => {
  try {
    const res = await getWebhookConfig(id);
    formData.active = res.active ?? 0;
    formData.mapping = res.mapping ?? '';
    if (res.mapping) {
      try {
        mappingData.value = JSON.parse(res.mapping);
      } catch {
        mappingData.value = [];
      }
    } else {
      mappingData.value = [];
    }
  } catch {
    formData.active = 0;
    formData.mapping = '';
    mappingData.value = [];
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

const changeWebhookMapping = (data: any[]) => {
  mappingData.value = data;
};

const validateMappingData = (): boolean => {
  if (formData.active !== 1) return true;
  if (webhookMappingRef.value) {
    const result = webhookMappingRef.value.validateMappingData();
    if (!result.valid) {
      Message.warning(result.message || '请完善映射编码信息');
      return false;
    }
  }
  return true;
};

const handleSave = async () => {
  const id = appId.value;
  if (!id) {
    Message.warning('应用信息未加载');
    return;
  }
  if (!validateMappingData()) return;

  saveLoading.value = true;
  try {
    await setWebhookConfig(
      {
        active: formData.active,
        mapping: JSON.stringify(mappingData.value),
      },
      id,
    );
    Message.success('保存成功');
    await loadConfig(id);
  } finally {
    saveLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
@use '@/styles/app-integration-panel.scss';
</style>
