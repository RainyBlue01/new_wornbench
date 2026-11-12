<template>
  <div class="app-container">
    <router-view></router-view>
  </div>
</template>
<script setup lang="ts">
import { applyConfig } from "@/api/settings/index";
import { webSiteConfigStore } from "@/store/index";
import { closeTaskCenterEventSource, initTaskCenterEventSource } from "@/utils/taskCenterEventSource";
import { onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const webSiteStore = webSiteConfigStore();
const loadWebSite = () => {
  applyConfig("website").then((res) => {
    webSiteStore.setWebSiteConfig(JSON.parse(res.configure));
  });
};

loadWebSite();

onMounted(() => {
  initTaskCenterEventSource(router);
});

onUnmounted(() => {
  closeTaskCenterEventSource();
});
</script>
<style lang="scss">
// Global modal styles
@use "./styles/modal-global.scss";

body,
html {
  margin: 0;
  padding: 0;
  background: #f8f8f8 !important;
  color: rgba(0, 0, 0, 0.65);
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  font-family: "Alibaba PuHuiTi 2.0-55 Regular";
}

::-webkit-scrollbar {
  width: 4px;
  height: 10px;
}

::-webkit-scrollbar-thumb {
  border-radius: 2px;
  background-color: rgba(0, 0, 0, 0.16) !important;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 0.85);
}

::-webkit-scrollbar-track {
  border-radius: 2px;
}

/* Global overlay styles - Modal and Drawer */
</style>
