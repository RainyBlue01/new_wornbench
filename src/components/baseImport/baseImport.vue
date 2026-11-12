<template>
  <div>
    <a-steps :current="0" direction="vertical">
      <a-step>
        <div style="margin-bottom: 20px">
          <div class="titles"> {{ mergedScheduleData.downloadTemplateTitle }} </div>
          <div style="margin-top: 10px" v-show="mergedScheduleData.showDown">
            <a-button type="primary" @click="exportTemplate">{{
              mergedScheduleData.downloadTemplateText
            }}</a-button>
            <div class="downloadText">{{
              mergedScheduleData.downloadTemplateFooter
            }}</div>
          </div>
        </div>
      </a-step>
      <a-step>
        <div style="width: 100%">
          <div> {{ mergedScheduleData.importDataTitle }} </div>
          <div>
            <a-upload ref="file" draggable accept=".xlsx,.zip" :limit="mergedScheduleData.limit"
              :on-before-upload="beforeUpload" :on-before-remove="beforeRemove" :custom-request="importFn"
              @error="importError" />
          </div>
          <div style="font-size: 12px">{{
            mergedScheduleData.fileFormatText
          }}</div>
          <div v-html="safeErrorMessage" class="err-message"></div>
        </div>
      </a-step>
    </a-steps>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import type { FileItem } from '@arco-design/web-vue'
import { sanitizeHtml } from '@/utils/sanitizeHtml'
import { dowload } from '@/api/user'
import { blobDownload } from '@/utils/export'

const props = defineProps({
  scheduleData: {
    type: Object,
    default: () => ({}),
  },
})

const defaultScheduleData = {
  downloadTemplateTitle: '下载模板',
  downloadTemplateText: '下载导入模板.xlsx',
  downloadTemplateFooter: '所有上传的内容必须按照模板进行导入',
  importDataTitle: '导入数据',
  fileFormatText: '只能上传xlsx文件，为保障顺利上传每次上传数据少于1000条',
  downloadFileTitle: '模板信息', // 下载文件名称
  downloadnowFileTitle: '模板信息',
  showDown: true,
  fileFormat: '.xlsx', // 允许上传的文件格式
  limit: 1, // 允许上传文件数量
  exportTemplateFn: null, // 导出模板方法
  uploadFiles: null, // 上传文件方法
}

const mergedScheduleData = computed(() => {
  return {
    ...defaultScheduleData,
    ...props.scheduleData,
  }
})

const emits = defineEmits(['closeModel', 'importSuccess'])
const file = ref()
const errorMessage = ref()
const safeErrorMessage = computed(() => sanitizeHtml(errorMessage.value))
// 导出模板
async function exportTemplate() {
  if (!mergedScheduleData.value.exportTemplateFn) return
  const result = await mergedScheduleData.value.exportTemplateFn()
  if (!result) return
  blobDownload(result, mergedScheduleData.value.downloadnowFileTitle)
}

//导入失败
function importError(err: any) {
  // Message.error(err?.response?.error || '导入失败！')
}

// 校验文件格式
const beforeUpload = (file: FileItem) => {
  const fileType = file.name?.substring(file.name.lastIndexOf('.'))
  if (fileType !== '.xlsx' && fileType !== '.zip') {
    Message.error('文件格式不符合')
    return false
  }
  return true
}

const beforeRemove = (fileItem: FileItem) => {
  errorMessage.value = ''
  return true
}

// 导入文件处理
async function importFn(e: any) {
  try {
    if (!mergedScheduleData.value.uploadFiles) {
      Message.error('上传方法未配置')
      return
    }
    const dataMessage = await mergedScheduleData.value.uploadFiles(e)

    if (dataMessage.failDataPath) {
      let params = {
        fileId: dataMessage.failDataPath
      }
      const result = await dowload(params)

      blobDownload(result, mergedScheduleData.value.downloadFileTitle)
      // Message.error('导入失败,' + '失败数据' + dataMessage.fail + '条' + ',成功数据' + dataMessage.successful + '条')
      emits('closeModel')
    } else {
      // Message.success('导入成功' + ',成功数据' + dataMessage.successful + '条')
      // 触发导入成功事件
      // emits('importSuccess')
      emits('closeModel')
    }
  } catch (error) {
    throw new Error('upload err')
  }
}
</script>

<style lang="scss" scoped>
.downloadText {
  font-size: 12px;
  line-height: 18px;
  color: rgba(187, 187, 187, 1);
}

.err-message {
  width: 408px;
  max-height: 167px;
  font-size: 12px;
  color: red;
  overflow-y: auto;
  white-space: pre-wrap;
}

:deep(.arco-steps-item) {
  display: flex;
}

:deep(.arco-steps-item-title) {
  width: 100%;
}

:deep(.arco-steps-item-content) {
  flex: 1;
}

:deep(.arco-steps) {
  width: 100%;
}

.titles {
  word-break: normal;
  display: flex;
  white-space: wrap;
  width: 400px;
  /* 根据需要设置宽度 */
}
</style>
