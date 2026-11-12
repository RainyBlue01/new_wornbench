<script setup lang="ts">
import { Message, Modal } from '@arco-design/web-vue'
import PluginCreateModal from './PluginCreateModal.vue'
import PluginDetailDrawer from './PluginDetailDrawer.vue'
import PluginList from './PluginList.vue'
import { usePluginCenter } from '../composables/usePluginCenter'
import type { PluginItem } from '../types'

const {
  plugins,
  loading,
  uploadVisible,
  detailVisible,
  detailLoading,
  selectedPlugin,
  pagination,
  togglePlugin,
  removePlugin,
  showDetail,
  fetchPlugins,
} = usePluginCenter()

async function handleUploadCompleted() {
  await fetchPlugins(1)
  Message.success('插件安装成功')
}

async function handleToggle(id: string, enabled: boolean) {
  const ok = await togglePlugin(id, enabled)
  if (ok) {
    Message.success(enabled ? '插件已启用' : '插件已停用')
  } else {
    Message.error('操作失败，请重试')
  }
}

function handleRemove(plugin: PluginItem) {
  Modal.confirm({
    title: '删除插件',
    content: `删除后将无法恢复，确定删除「${plugin.name}」吗？`,
    okText: '确认删除',
    cancelText: '取消',
    okButtonProps: { status: 'danger' },
    onOk: async () => {
      const ok = await removePlugin(plugin.id)
      if (!ok) return false
      Message.success('插件已删除')
    },
  })
}

</script>

<template>
  <main class="plugin-main">
    <section class="plugin-shell">
      <header class="shell-header">
        <div>
          <h1>插件中心</h1>
          <!-- <p>统一管理业务扩展能力与运行状态</p> -->
        </div>
        <div class="header-actions">
          <button type="button" class="create-button" @click="uploadVisible = true">
            <i class="fas fa-upload" aria-hidden="true" />
            上传插件
          </button>
        </div>
      </header>

      <div class="shell-body">
        <PluginList :plugins="plugins" :loading="loading" @toggle="handleToggle"
          @detail="showDetail" @remove="handleRemove" />
        <a-pagination v-if="pagination.total > pagination.pageSize" class="plugin-pagination"
          :current="pagination.current" :page-size="pagination.pageSize" :total="pagination.total"
          simple @change="fetchPlugins" />
      </div>
    </section>

    <PluginCreateModal v-model:visible="uploadVisible" @completed="handleUploadCompleted" />
    <PluginDetailDrawer v-model:visible="detailVisible" :plugin="selectedPlugin" :loading="detailLoading" />
  </main>
</template>

<style scoped lang="scss">
.plugin-main {
  flex: 1;
  min-height: 0;
  height: calc(100vh - 64px);
  overflow-y: auto;
  padding: 20px 24px 40px;
  background: #f1f5f9;
}

.plugin-shell {
  width: min(1200px, 100%);
  margin: 0 auto;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 2px 12px rgb(0 0 0 / 4%);
}

.shell-header {
  display: flex;
  // min-height: 66px;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
}

.shell-header h1 {
  margin: 0;
  color: #1e293b;
  font-size: 16px;
  font-weight: 700;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.create-button {
  display: inline-flex;
  height: 34px;
  align-items: center;
  gap: 7px;
  padding: 0 14px;
  border: 0;
  border-radius: 10px;
  background: linear-gradient(135deg, #3386fa, #5265ed);
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.create-button:hover {
  box-shadow: 0 4px 12px rgb(59 130 246 / 30%);
  transform: translateY(-1px);
}

.shell-body {
  padding: 16px 20px;
}

.plugin-pagination { justify-content: flex-end; margin-top: 16px; }

@media (max-width: 720px) {
  .plugin-main {
    padding: 12px;
  }

  .shell-header {
    align-items: flex-start;
    padding: 15px;
  }

  .shell-body {
    padding: 12px;
  }
}
</style>
