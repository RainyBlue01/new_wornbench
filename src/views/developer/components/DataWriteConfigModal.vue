<script setup lang="ts">
import { ref, watch } from 'vue';
import { Message } from "@arco-design/web-vue";
import { getDataWriteConfig } from '@/api/dataWrite';
import type { DataWriteConfig, DataWriteOutputParam } from '@/api/dataWrite';

const props = defineProps<{
  visible: boolean;
  appName: string;
  appId: string | number;
}>();

const emit = defineEmits<{
  "update:visible": [visible: boolean];
}>();

const close = () => emit("update:visible", false);

const config = ref<DataWriteConfig>({});

// 解析 fieldConfig 为 JSON 格式示例
const parseFieldConfig = (fields: DataWriteOutputParam[] | undefined): string => {
  if (!fields || fields.length === 0) return '';
  
  const obj = buildJsonObject(fields);
  return JSON.stringify(obj, null, 2);
};

const buildJsonObject = (fields: DataWriteOutputParam[]): any => {
  const obj: any = {};
  
  for (const field of fields) {
    const key =  field.path || field.name || 'unknown';
    
    if (field.classify === 'object' || field.classify === 'map') {
      if (field.children && field.children.length > 0) {
        obj[key] = buildJsonObject(field.children);
      } else {
        obj[key] = {};
      }
    } else if (field.classify === 'array' || field.classify === 'list') {
      if (field.children && field.children.length > 0) {
        obj[key] = [buildJsonObject(field.children)];
      } else {
        obj[key] = [];
      }
    } else {
      // any 类型或其他类型
      obj[key] = 'xxx';
    }
  }
  
  return obj;
};

const fetchConfig = async () => {
  try {
    const res = await getDataWriteConfig(props.appId);
    config.value = res;
  } catch (error) {
    console.error('获取配置失败:', error);
    Message.error('获取配置失败');
  }
};

// 监听 visible 变化，打开时获取数据
watch(() => props.visible, (val) => {
  if (val) {
    fetchConfig();
  }
});

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
      Message.success("已复制到剪贴板");
    } else {
      Message.error("复制失败，请手动复制");
    }
  } catch (err) {
    console.error('复制失败:', err);
    Message.error("复制失败，请手动复制");
  }
};

const copyData = async () => {
  const schemaText = parseFieldConfig(config.value.fieldConfig);
  const text = `数据写入地址：${config.value.apiUrl || ''}\n\n数据结构：\n${schemaText}`;
  
  // 尝试使用现代 Clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      Message.success("已复制到剪贴板");
    } catch {
      fallbackCopyToClipboard(text);
    }
  } else {
    // 降级方案：使用 execCommand
    fallbackCopyToClipboard(text);
  }
};
</script>

<template>
  <a-modal :visible="visible" :title="`${appName} - 数据写入配置`" title-align="start" :width="520" :mask-closable="false" @cancel="close">
    <a-form layout="vertical">
      <a-form-item label="业务描述">
        <a-textarea :model-value="config.desc" :auto-size="{ minRows: 3, maxRows: 5 }" readonly />
      </a-form-item>
      <a-form-item label="数据写入地址">
        <div class="config-input-group">
          <div class="data">
            <a-input :model-value="config.apiUrl" readonly />
          </div>
          <a-button @click="copyData" class="dw-copy-btn">
            <icon-copy />
            复制
          </a-button>
        </div>
      </a-form-item>
      <a-form-item label="数据接入结构">
        <a-textarea :model-value="parseFieldConfig(config.fieldConfig)" :auto-size="{ minRows: 8, maxRows: 12 }" readonly />
      </a-form-item>
    </a-form>
    <template #footer>
      <div class="config-modal-footer">
        <a-button @click="close">关闭</a-button>
        <a-button type="primary" @click="copyData">复制数据写入地址与数据结构</a-button>
      </div>
    </template>
  </a-modal>
</template>

<style lang="scss" scoped>
.config-input-group {
  display: flex;
  gap: 8px;
  align-items: center;

  :deep(.arco-input-wrapper) {
    flex: 1;
  }
}

.dw-copy-btn {
  padding: 10px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  height: 38px;
  gap: 4px;

}

.config-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.config-input-group{
  width: 100%;
}
.data{
  width: calc(100% - 84px);
}
</style>
