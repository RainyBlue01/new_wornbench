<script setup lang="ts">
import type { FormPluginItem } from './types'

const visible = defineModel<boolean>('visible', { required: true })
defineProps<{
  plugin: FormPluginItem | null
}>()

const emit = defineEmits<{
  confirm: []
}>()
</script>

<template>
  <a-modal
    v-model:visible="visible"
    modal-class="form-plugin-uninstall-modal"
    :width="400"
    :footer="false"
    :closable="false"
    :mask-closable="false"
  >
    <div class="uninstall-content">
      <div class="warning-icon"><i class="fas fa-exclamation-triangle" /></div>
      <h3>卸载插件</h3>
      <p>确定要卸载「{{ plugin?.name }}」吗？</p>
      <small>卸载后需要重新上传 JAR 包才能恢复使用。</small>
      <div class="uninstall-actions">
        <a-button @click="visible = false">取消</a-button>
        <a-button status="danger" type="primary" @click="emit('confirm')">确认卸载</a-button>
      </div>
    </div>
  </a-modal>
</template>

<style lang="scss">
.form-plugin-uninstall-modal {
  overflow: hidden;
  border-radius: 16px;

  .arco-modal-body {
    padding: 32px 28px 22px;
  }
}

.uninstall-content {
  text-align: center;

  h3 {
    margin: 0 0 8px;
    color: #1e293b;
    font-size: 15px;
  }

  p {
    margin: 0;
    color: #64748b;
    font-size: 13px;
  }

  small {
    display: block;
    margin-top: 6px;
    color: #94a3b8;
    font-size: 12px;
  }
}

.warning-icon {
  display: grid;
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  place-items: center;
  border-radius: 50%;
  background: #fef2f2;
  color: #ef4444;
  font-size: 20px;
}

.uninstall-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 28px;

  .arco-btn {
    min-width: 88px;
    border-radius: 8px;
  }
}
</style>
