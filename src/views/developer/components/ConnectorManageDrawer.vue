<script setup lang="ts">
defineProps<{
  visible: boolean;
  developer: { id: string; developer: string } | null;
  connectors: Array<{
    id: string;
    name: string;
    language: string;
    status: string;
    endpointCount: number;
    enabledCount: number;
    disabledCount: number;
    size: string;
    uploadTime: string;
  }>;
}>();

const emit = defineEmits<{
  close: [];
  remove: [id: string];
  "open-add": [];
}>();

const langClass = (value: string) => {
  if (value === "JAR") return "jar";
  if (value === "Python") return "py";
  return "php";
};
</script>

<template>
  <a-drawer
    :visible="visible"
    :width="'100%'"
    placement="bottom"
    :height="'95vh'"
    :closable="false"
    unmount-on-close
    class="auth-drawer-wrap"
  >
    <template #title>
      <div class="auth-drawer-header-inner">
        <h3>{{ developer?.developer || "开发者" }} - 连接器管理</h3>
        <button type="button" class="auth-drawer-close-btn" @click="emit('close')">×</button>
      </div>
    </template>
    <div class="auth-drawer-body-inner">
      <div v-if="connectors.length === 0" class="auth-empty">
        <i class="fas fa-plug" />
        <p>暂无连接器</p>
      </div>
      <div v-else>
        <div v-for="item in connectors" :key="item.id" class="conn-drawer-item">
          <div class="conn-drawer-info">
            <div class="conn-drawer-name">
              {{ item.name }}
              <span class="conn-drawer-badge" :class="langClass(item.language)">{{ item.language }}</span>
            </div>
            <div class="conn-drawer-meta">
              <span>{{ item.size }}</span>
              <span class="dot" />
              <span>{{ item.uploadTime }}</span>
              <span class="dot" />
              <span style="color: #16a34a">{{ item.status }}</span>
            </div>
            <div class="conn-drawer-stats">
              <span class="conn-drawer-stat"><strong>{{ item.endpointCount }}</strong> 个接口</span>
              <span class="conn-drawer-stat"><strong>{{ item.enabledCount }}</strong> 个已启用</span>
              <span class="conn-drawer-stat"><strong>{{ item.disabledCount }}</strong> 个已禁用</span>
            </div>
          </div>
          <button class="conn-drawer-remove" type="button" @click="emit('remove', item.id)">×</button>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="auth-drawer-footer-inner">
        <a-button @click="emit('close')">关闭</a-button>
        <a-button type="primary" @click="emit('open-add')">添加连接器</a-button>
      </div>
    </template>
  </a-drawer>
</template>
