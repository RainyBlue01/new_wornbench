<template>
  <div class="workbench-page my-apps-page">
    <HomeBanner
      variant="subpage"
      breadcrumb-parent="工作台"
      breadcrumb-current="我的应用"
      subpage-hero-title="我的应用"
       :showDesc="true" 
      subpage-hero-desc="管理我创建与负责的应用"
      :back-to="{ name: 'homePage' }"
    />
    <div class="workbench-body workbench-body--no-aside">
      <main class="workbench-main custom-scroll">
        <div class="wb-main-constrain">
          <myApp mode="mine" />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import HomeBanner from "@/components/banner/homeBanner.vue";
import myApp from "./myApps/index.vue";
</script>

<style lang="scss">
@use "../../styles/workbench-home.scss";
</style>

<style lang="scss" scoped>
.my-apps-page {
  .workbench-body {
    flex: 1;
    min-height: 0;
  }
}
</style>
