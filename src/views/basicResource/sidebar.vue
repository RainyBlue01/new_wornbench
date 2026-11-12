<template>
  <div class="config-sidebar">
    <div class="sys-card">
      <div class="card-body">
        <div v-for="menu in visibleMenus" :key="menu.id" :class="[
          'config-menu-item',
          { active: props.active == menu.id },
        ]" @click="props.active != menu.id ? goToPage(menu.page) : undefined">
          <i :class="menu.icon" aria-hidden="true" />
          {{ menu.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
// import { IconApps, IconUserGroup, IconUser } from '@arco-design/web-vue/es/icon';

interface MenuItem {
  id: string;
  name: string;
  page: string;
  icon: any;
  permission?: string; // 权限代码
}

const allMenus: MenuItem[] = [
  { id: "1", name: "部门管理", page: "/department", icon: 'fas fa-building', permission: "department" },
  { id: "2", name: "职位管理", page: "/job", icon: 'fas fa-user-tag', permission: "job" },
  { id: "3", name: "角色管理", page: "/role", icon: 'fas fa-user-shield', permission: "role" },
];

const props = defineProps<{ active: string }>();
const router = useRouter();
const route = useRoute();

// 获取用户权限
const getUserPermissions = (): string[] => {
  try {
    const userInfo = localStorage.getItem("wornbench_useinfo");
    if (!userInfo) return [];
    const user = JSON.parse(userInfo);
    return user.menuCodes || user.permissions || [];
  } catch (error) {
    // console.error("解析用户权限失败:", error);
    return [];
  }
};

// 根据权限过滤菜单
const visibleMenus = computed(() => {
  const permissions = getUserPermissions();
  // 如果没有权限限制，显示所有菜单
  if (!permissions || permissions.length === 0) {
    return allMenus;
  }
  // 只显示有权限的菜单
  return allMenus.filter(menu => !menu.permission || permissions.includes(menu.permission));
});

const goToPage = (page: string) => {
  router.push({ path: page, query: { menuCode: route.query.menuCode } });
};
</script>

<style lang="scss" scoped>
@use "../../styles/system-settings.scss";
</style>
