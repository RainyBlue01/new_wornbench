<template>
  <base-modal
    ref="modalRef"
    modal-class="person-modal-wrap person-import-modal"
    @handle-ok="onClose"
    @handle-cancel="onClose"
  >
    <div class="person-import-body">
      <div class="person-import-form-group">
        <label class="person-import-label">上传Excel</label>
        <div
          class="person-import-upload-zone"
          :class="{ 'is-dragging': isDragging }"
          role="button"
          tabindex="0"
          @click="triggerSelect"
          @keydown.enter="triggerSelect"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="onDrop"
        >
          <icon-cloud class="person-import-upload-zone__icon" />
          <p class="person-import-upload-zone__title">
            点击或拖拽上传Excel文件
          </p>
          <p class="person-import-upload-zone__hint">支持 .xlsx / .xls 格式</p>
          <p v-if="selectedFileName" class="person-import-upload-zone__file">
            已选择：{{ selectedFileName }}
          </p>
          <input
            ref="fileInputRef"
            type="file"
            accept=".xlsx,.xls"
            class="person-import-upload-zone__input"
            @change="onFileInputChange"
          />
        </div>
      </div>
      <p class="person-import-desc">
        Excel需包含列：<b>姓名</b>（必填）、<b>性别</b>、<b>电话</b>、<b>邮箱</b>、<b>部门</b>、<b>职位</b>、<b>角色</b>。
      </p>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Message } from "@arco-design/web-vue";
import { IconCloud } from "@arco-design/web-vue/es/icon";
import { dowload } from "@/api/user";
import { blobDownload } from "@/utils/export";

const props = defineProps<{
  scheduleData?: Record<string, any>;
}>();

const emit = defineEmits<{ success: [] }>();

const modalRef = ref();
const fileInputRef = ref<HTMLInputElement>();
const selectedFileName = ref("");
const isDragging = ref(false);

const schedule = () => ({
  downloadFileTitle: "人员导入模板",
  uploadFiles: null as ((e: any) => Promise<any>) | null,
  ...props.scheduleData,
});

const open = () => {
  selectedFileName.value = "";
  isDragging.value = false;
  if (fileInputRef.value) fileInputRef.value.value = "";
  modalRef.value?.handleClick({
    title: "批量导入人员",
    showBtn: true,
    width: "520px",
    okText: "确定导入",
    cancelText: "取消",
  });
};

const onClose = () => {
  selectedFileName.value = "";
  isDragging.value = false;
  if (fileInputRef.value) fileInputRef.value.value = "";
  modalRef.value?.handleClose();
};

const triggerSelect = () => {
  fileInputRef.value?.click();
};

const validateFile = (file: File) => {
  const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
  if (ext !== ".xlsx" && ext !== ".xls") {
    Message.error("文件格式不符合，请上传 .xlsx 或 .xls");
    return false;
  }
  return true;
};

const uploadFile = async (file: File) => {
  if (!validateFile(file)) return;

  const cfg = schedule();
  if (!cfg.uploadFiles) {
    Message.error("上传方法未配置");
    return;
  }

  selectedFileName.value = file.name;

  try {
    const dataMessage = await cfg.uploadFiles({
      fileItem: { file, name: file.name },
    });
    if (dataMessage?.failDataPath) {
      const result = await dowload({ fileId: dataMessage.failDataPath });
      blobDownload(result, cfg.downloadFileTitle);
    } else {
      Message.success("导入成功");
      emit("success");
      onClose();
    }
  } catch {
    Message.error("导入失败");
  }
};

const onFileInputChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) uploadFile(file);
  if (input) input.value = "";
};

const onDrop = (e: DragEvent) => {
  isDragging.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) uploadFile(file);
};

defineExpose({ open });
</script>

<style lang="scss" scoped>
.person-import-body {
  overflow-x: hidden;
  max-width: 100%;
}

.person-import-form-group {
  margin-bottom: 0;
}

.person-import-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  margin-bottom: 6px;
}

.person-import-upload-zone {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 28px 20px;
  text-align: center;
  cursor: pointer;
  background: #f8fafc;
  transition: all 0.2s;
  box-sizing: border-box;
  width: 100%;

  &:hover,
  &.is-dragging {
    border-color: rgb(var(--primary-6));
    background: #eff6ff;
  }

  &__input {
    display: none;
  }

  &__icon {
    font-size: 28px;
    color: #94a3b8;
    margin-bottom: 8px;
  }

  &__title {
    font-size: 14px;
    color: #475569;
    font-weight: 500;
    margin: 0 0 4px;
    line-height: 1.5;
  }

  &__hint {
    font-size: 12px;
    color: #94a3b8;
    margin: 0;
    line-height: 1.5;
  }

  &__file {
    font-size: 12px;
    color: rgb(var(--primary-6));
    font-weight: 500;
    margin: 8px 0 0;
    line-height: 1.5;
    word-break: break-all;
  }
}

.person-import-desc {
  font-size: 12px;
  color: #64748b;
  margin: 12px 0 0;
  line-height: 1.6;
  word-break: break-word;

  b {
    font-weight: 600;
    color: #475569;
  }
}
</style>
