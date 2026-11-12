<script setup lang="ts">
import placeholderIcon from '@/assets/icon_zhanwei.svg'

const props = defineProps<{
  visible: boolean;
  developer: { id: string; developer: string } | null;
  rows: Array<{
    id?: string;
    appId: string;
    appName: string;
    appIcon?: string | null;
    appIntro?: string | null;
    showIcon?: string;
    subscribeId?: string;
    active?: number;
    dataWriteEnabled?: boolean;
    webhookEnabled?: boolean;
  }>;
  loading?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  "add-auth": [];
  "open-webhook": [item: any];
  "open-data-write": [item: any];
  "delete-auth": [id: string];
}>();

const win = window as Window & { api?: { dowUrl?: string } }

const getAppIconUrl = (item: { showIcon?: string; appIcon?: string | null }) => {
  if (item.showIcon) return item.showIcon
  if (!item.appIcon || !win.api?.dowUrl) return placeholderIcon
  const token = localStorage.getItem('wornbench_token')
  return `${win.api.dowUrl}${item.appIcon}${token ? `&token=${token}` : ''}`
}
</script>

<template>
  <a-drawer :visible="visible" :width="'100%'" placement="bottom" :height="'95vh'" :closable="false" unmount-on-close
    class="auth-drawer-wrap">
    <template #title>
      <div class="auth-drawer-header-inner">
        <h3>{{ developer?.developer || "开发者" }} - 授权管理</h3>
        <button type="button" class="auth-drawer-close-btn" @click="emit('close')">×</button>
      </div>
    </template>
    <div class="auth-drawer-body-inner">
      <p class="auth-drawer-tip">以应用为单位授权，勾选后该应用可获取数据写入和 WebHook 推送权限</p>
      <a-spin :loading="loading" style="width: 100%;">
        <div v-if="rows.length === 0" class="auth-empty">
          <i class="fas fa-layer-group" />
          <p>暂无授权应用</p>
        </div>
        <div v-else>
          <div v-for="item in rows" :key="item.appId" class="auth-app-item">
            <div class="auth-app-info">
              <div class="auth-app-icon">
                <img :src="getAppIconUrl(item)" :alt="item.appName" />
              </div>
              <div class="auth-app-copy">
                <div class="auth-app-name">{{ item.appName }}</div>
                <div v-if="item.appIntro" class="auth-app-intro">{{ item.appIntro }}</div>
              </div>
            </div>
            <div class="auth-app-actions">
              <span class="auth-perm-tag" :class="item.dataWriteEnabled ? 'on' : 'off'"
                @click="item.dataWriteEnabled && emit('open-data-write', item)">
                数据写入
              </span>
              <span class="auth-perm-tag" :class="item.webhookEnabled ? 'on' : 'off'"
                @click="item.webhookEnabled && emit('open-webhook', item)">
                WebHook推送
              </span>
              <a-button type="text" size="mini" @click="item.subscribeId && emit('delete-auth', item.subscribeId)">
                <div class="icons">
                  <icon-close />
                </div>

              </a-button>

            </div>
          </div>
        </div>
      </a-spin>
    </div>
    <template #footer>
      <div class="auth-drawer-footer-inner">
        <a-button @click="emit('close')">取消</a-button>
        <a-button type="primary" @click="emit('add-auth')">新增授权</a-button>
      </div>
    </template>
  </a-drawer>
</template>
<style lang="scss">
.auth-drawer-wrap {
  .arco-drawer {
    border-radius: 20px 20px 0 0;

    .arco-drawer-header {
      height: 68px;
      border-bottom: 1px solid #f1f5f9 !important;
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }
  }
}
</style>
