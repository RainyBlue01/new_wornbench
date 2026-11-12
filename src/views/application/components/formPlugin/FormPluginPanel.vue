<script setup lang="ts">
import { shallowRef } from 'vue'
import { Message } from '@arco-design/web-vue'
import FormPluginDetailModal from './FormPluginDetailModal.vue'
import FormPluginList from './FormPluginList.vue'
import PluginCreateModal from '@/views/pluginCenter/components/PluginCreateModal.vue'
import FormPluginUninstallModal from './FormPluginUninstallModal.vue'
import type { FormPluginItem } from './types'
import { useFormPlugins } from './useFormPlugins'

defineProps<{
  appId: string
}>()

const { plugins, load, toggle, uninstall, getDetail } = useFormPlugins()
const detailVisible = shallowRef(false)
const uninstallVisible = shallowRef(false)
const uploadVisible = shallowRef(false)
const selectedPlugin = shallowRef<FormPluginItem | null>(null)

async function handleToggle(plugin: FormPluginItem, enabled: boolean) {
  try {
    await toggle(plugin.id, enabled)
    Message.success(`${plugin.name}已${enabled ? '启用' : '停用'}`)
  } catch {
    // 请求错误由全局拦截器提示。
  }
}

function handleUpload() {
  uploadVisible.value = true
}

async function handleInstall() {
  await load()
  Message.success('应用级插件安装成功')
}

async function openDetail(plugin: FormPluginItem) {
  detailVisible.value = true
  selectedPlugin.value = plugin
  try {
    selectedPlugin.value = await getDetail(plugin.id)
  } catch {
    // 请求错误由全局拦截器提示。
  }
}

function openUninstall(plugin: FormPluginItem) {
  selectedPlugin.value = plugin
  uninstallVisible.value = true
}

async function confirmUninstall() {
  const plugin = selectedPlugin.value
  if (!plugin) return
  try {
    await uninstall(plugin.id)
    uninstallVisible.value = false
    selectedPlugin.value = null
    Message.success('插件已卸载')
  } catch {
    // 请求错误由全局拦截器提示。
  }
}
</script>

<template>
  <main class="form-plugin-page">
    <section class="form-plugin-card">
      <header class="panel-header">
        <div>
          <h2>表单插件</h2>
          <p>当前表单已安装的插件列表，请在合适的场景进行使用，如：表单事件、按钮组件、表单流程</p>
        </div>
        <button class="upload-button" type="button" @click="handleUpload">
          <i class="fas fa-upload" />
          上传插件
        </button>
      </header>

      <FormPluginList
        :plugins="plugins"
        @toggle="handleToggle"
        @detail="openDetail"
        @uninstall="openUninstall"
      />
    </section>

    <FormPluginDetailModal v-model:visible="detailVisible" :plugin="selectedPlugin" />
    <PluginCreateModal v-model:visible="uploadVisible" fixed-plugin-type="app" @completed="handleInstall" />
    <FormPluginUninstallModal
      v-model:visible="uninstallVisible"
      :plugin="selectedPlugin"
      @confirm="confirmUninstall"
    />
  </main>
</template>

<style scoped lang="scss">
.form-plugin-page {
  box-sizing: border-box;
  width: 100%;
  height: calc(100vh - 64px);
  min-height: 0;
  padding: 24px 16px 200px;
  overflow-y: auto;
  scrollbar-gutter: stable;
}

.form-plugin-card {
  box-sizing: border-box;
  width: 100%;
  max-width: 1118px;
  margin: 0 auto;
  padding: 24px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  }
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 20px;

  h2 {
    margin: 0;
    color: #111827;
    font-size: 18px;
    font-weight: 700;
  }

  p {
    margin: 4px 0 0;
    color: #9ca3af;
    font-size: 14px;
  }
}

.upload-button {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  border: 0;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  i {
    font-size: 11px;
  }

  &:hover {
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.28);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}

@media (max-width: 720px) {
  .form-plugin-page {
    padding: 16px 12px 100px;
  }

  .form-plugin-card {
    padding: 20px 16px;
  }

  .panel-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 14px;
  }
}
</style>
