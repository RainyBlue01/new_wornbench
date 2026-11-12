<template>
  <a-modal
      class="config-modal"
      title="配置域名端口"
      :visible="dialogVisible"
      :width="480"
      :esc-to-close="false"
      :mask-closable="false"
        title-align="start"
      @cancel="handleClose"
      @ok="submit"
  >
    <div class="dialog-content">
      <a-form ref="formRef"
              :model="form"
              :rules="rules"
              layout="vertical">
        <a-form-item label="协议" field="protocol" required>
          <a-select v-model="form.protocol" placeholder="请选择协议" allow-clear>
            <a-option value="http">http</a-option>
            <a-option value="https">https</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="域名（允许填写IP地址）" field="host" required>
          <a-input
              v-model="form.host"
              placeholder="请填写域名"
              allow-clear
          />
        </a-form-item>
        <a-form-item label="端口" field="port">
          <a-input
              v-model="form.port"
              placeholder="请输入端口"
              allow-clear
          />
        </a-form-item>
        <a-form-item label="公共路径" field="commonPath" required>
          <a-input
              v-model="form.commonPath"
              placeholder="请输入公共路径"
              allow-clear
          />
        </a-form-item>
      </a-form>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <a-button @click="handleClose">取消</a-button>
        <a-button type="primary" @click="submit">配置</a-button>
      </div>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import {reactive, ref} from 'vue'
import {Message} from '@arco-design/web-vue'
import {setConnectorConfig} from "@/api/connector";

const emits = defineEmits(['refresh'])

const dialogVisible = ref(false)
const formRef = ref(null)

const form = reactive({
  protocol: '',
  host: '',
  port: '80',
  commonPath: '/'
})

const connectorId = ref()

const rules = {
  protocol: [{required: true, message: '请选择协议'}],
  host: [{required: true, message: '请输入域名'}],
  commonPath: [{required: true, message: '请输入公共路径'}]
}

const showModal = (id: any, item: any) => {
  connectorId.value = id
  if (item) {
    Object.keys(form).forEach(k => {
      form[k] = item[k]
    })
  } else {
    resetForm()
  }
  dialogVisible.value = true
}

const resetForm = () => {
  form.protocol = ''
  form.host = ''
  form.port = '80'
  form.commonPath = '/'
}

const handleClose = () => {
  resetForm()
  dialogVisible.value = false
  formRef.value?.clearValidate()
}

// 提交表单
const submit = async () => {
  try {
    // 表单校验
    const validateResult = await formRef.value?.validate()
    if (validateResult) {
      return false
    }

    // 提交数据
    await setConnectorConfig(connectorId.value, form)
    Message.success('配置通信成功')
    handleClose()
    emits('refresh')
  } catch (error) {
    Message.error('配置失败')
  }
}

defineExpose({
  showModal
})
</script>

<style lang="scss" scoped>
@use "@/styles/textColor" as textColor;

.config-modal {
  .dialog-content {
    :deep(.arco-form-item) {
      &:last-of-type {
        margin-bottom: 0;
      }
    }
  }

  .dialog-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;

    :deep(.arco-btn) {
      border-radius: 3px;
    }
  }
}
</style>
