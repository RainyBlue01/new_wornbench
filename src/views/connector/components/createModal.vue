<template>
  <a-modal
    class="create-modal conn-form-modal"
    title="创建连接器"
    :visible="dialogVisible"
    :width="480"
    :esc-to-close="false"
    title-align="start"
    :mask-closable="false"
    unmount-on-close
    @cancel="handleClose"
    @ok="submit"
  >
    <div class="dialog-content">
      <a-form
        ref="formRef"
        :model="form"
        :rules="rules"
        layout="vertical"
      >
        <a-form-item field="name">
          <template #label>
            连接器名称<span class="conn-required">*</span>
          </template>
          <a-input
            v-model="form.name"
            placeholder="请输入连接器名称"
            :max-length="24"
            show-word-limit
            allow-clear
          />
        </a-form-item>
        <a-form-item field="describe">
          <template #label>
            描述<span class="conn-required">*</span>
          </template>
          <a-textarea
            v-model="form.describe"
            placeholder="请输入连接器的功能描述"
            :max-length="100"
            show-word-limit
            :auto-size="{ minRows: 3, maxRows: 5 }"
            allow-clear
          />
        </a-form-item>
      </a-form>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <a-button @click="handleClose">取消</a-button>
        <a-button type="primary" @click="submit">确定</a-button>
      </div>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { createConnector, modifyConnector } from '@/api/connector'

const emits = defineEmits(['refresh'])

const dialogVisible = ref(false)
const formRef = ref(null)

const form = reactive({
  id: null as number | null,
  name: '',
  describe: '',
})

const rules = {
  name: [{ required: true, message: '请输入连接器名称' }],
  describe: [{ required: true, message: '请输入连接器的功能描述' }],
}

const showModal = (data: Record<string, unknown> | null) => {
  if (data) {
    Object.keys(form).forEach((k) => {
      ;(form as Record<string, unknown>)[k] = data[k]
    })
  } else {
    form.id = null
    form.name = ''
    form.describe = ''
  }
  dialogVisible.value = true
}

const handleClose = () => {
  form.id = null
  form.name = ''
  form.describe = ''
  dialogVisible.value = false
}

const submit = async () => {
  try {
    const validateResult = await formRef.value?.validate()
    if (validateResult) {
      return false
    }

    const params = {
      name: form.name,
      describe: form.describe,
    }
    if (form.id) {
      await modifyConnector(form.id, params)
      Message.success('修改成功')
    } else {
      await createConnector(params)
      Message.success('新增成功')
    }
    handleClose()
    emits('refresh')
  } catch {
    Message.error('操作失败')
  }
}

defineExpose({
  showModal,
})
</script>

<style lang="scss" scoped>
@use '@/styles/developer-center.scss';

.conn-required {
  color: #ef4444;
  margin-left: 2px;
}

.create-modal {
  .dialog-content {
    :deep(.arco-form-item:last-of-type) {
      margin-bottom: 0;
    }
  }

  .dialog-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
  }
}
</style>
