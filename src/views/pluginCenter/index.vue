<script setup lang="ts">
import HomeBanner from '@/components/banner/homeBanner.vue'
import PluginCenterPanel from './components/PluginCenterPanel.vue'
</script>

<template>
  <div class="plugin-center-page">
    <HomeBanner variant="subpage" breadcrumb-parent="工作台" breadcrumb-current="插件中心" back-label="返回工作台"
      :back-to="{ name: 'homePage' }" :show-desc="true" :show-subpage-hero="false">
      <template #nav-center>
        <span class="plugin-nav-pill">插件中心</span>
      </template>
    </HomeBanner>
    <PluginCenterPanel />
  </div>
</template>

<style scoped lang="scss">
.plugin-center-page {
  display: flex;
  min-height: 100vh;
  overflow: hidden;
  flex-direction: column;
  background: #f1f5f9;
}

.plugin-nav-pill {
  display: inline-flex;
  height: 34px;
  align-items: center;
  padding: 0 15px;
  border-radius: 10px;
  background: #e4efff;
  color: #1769e9;
  font-size: 13px;
  font-weight: 600;
}
</style>
