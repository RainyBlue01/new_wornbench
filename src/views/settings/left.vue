<template>
  <div class="config-sidebar">
    <div class="sys-card">
      <div class="card-body">
        <div
          v-for="menu in menus"
          :key="menu.id"
          :class="[
            'config-menu-item',
            { active: props.active == menu.id },
          ]"
          @click="props.active != menu.id ? goToPage(menu.page) : undefined"
        >
          <i :class="menu.icon" aria-hidden="true" />
          {{ menu.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";

const menus = [
  { id: "1", name: "系统配置", page: "/website", icon: "fas fa-cog" },
  { id: "2", name: "内部认证配置", page: "/middleLogin", icon: "fas fa-server" },
  {
    id: "3",
    name: "微信服务号配置",
    page: "/wechatOfficialConfig",
    icon: "fab fa-weixin",
  },
  { id: "4", name: "业务配置", page: "/fillMessageLink", icon: "fas fa-file-alt" },
];

const props = defineProps<{ active: string }>();
const router = useRouter();
const route = useRoute();

const goToPage = (page: string) => {
  router.push({ path: page, query: { menuCode: route.query.menuCode } });
};
</script>

<style lang="scss">
@use "../../styles/system-settings.scss";
</style>
