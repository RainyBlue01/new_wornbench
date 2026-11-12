<template>
  <header class="ub-page-header">
    <div class="tdc-top-nav">
      <div class="tdc-top-nav__left">
        <button type="button" class="tdc-back-pill" @click="linkTo">
          <icon-left />
          {{ backLabel }}
        </button>
        <nav class="tdc-breadcrumb" aria-label="面包屑">
          <span class="tdc-breadcrumb__item tdc-breadcrumb__item--link" @click="linkTo">
            {{ breadcrumbParent }}
          </span>
          <span class="tdc-breadcrumb__sep" aria-hidden="true">/</span>
          <span class="tdc-breadcrumb__item tdc-breadcrumb__item--current">
            {{ title }}
          </span>
        </nav>
      </div>
      <div class="tdc-top-nav__center">
        <slot v-if="$slots.center" name="center" />
        <div v-else v-for="item in roleList" :key="item.menuCode" v-show="menuCode == item.menuCode"
          class="ub-nav-tabs">
          <button v-for="items in item.children" :key="items.menuCode" type="button" :class="[
            'ub-nav-btn',
            { 'ub-nav-btn--active': setData(items) },
          ]" @click="changeItem(items)">
            {{ items.label }}
          </button>
        </div>
      </div>
      <div class="tdc-top-nav__right">
        <!-- <span class="tdc-top-nav__divider" aria-hidden="true" /> -->
        <button type="button" class="tdc-bell-btn" aria-label="我的待办" @click="goToDoCenter">
          <i class="fas fa-bell" aria-hidden="true" />
          <span v-if="pendingCount > 0" class="tdc-bell-dot" aria-hidden="true" />
        </button>
        <button type="button" class="tdc-download-btn" aria-label="下载中心" @click="openDownloadCenter">
          <i class="fas fa-download" aria-hidden="true" />
        </button>
        <a-dropdown trigger="click" @select="onUserMenuSelect">
          <span class="tdc-user-trigger">
            <img v-if="userInfo?.icon" :src="userInfo.icon" class="tdc-avatar" alt="" />
            <div v-else class="tdc-avatar-fallback">
              {{ userNicknameInitial }}
            </div>
            <div class="tdc-user-meta">
              <p class="tdc-user-name">
                {{ userInfo?.nickname || "系统管理员" }}
              </p>
              <p class="tdc-user-dept">{{ userDeptLabel }}</p>
            </div>
          </span>
          <template #content>
            <a-doption value="logOut">退出登录</a-doption>
          </template>
        </a-dropdown>
      </div>
    </div>

    <OutputManageCenter ref="outputManageCenterRef" embedded />
  </header>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getMenus } from "@/api/common";
import { getCachedMenus } from "@/utils/menuCache";
import OutputManageCenter from "@/views/outputManageCenter/index.vue";
import { useBannerBell } from "@/composables/useBannerBell";

const props = withDefaults(
  defineProps<{
    active?: string | number;
    title: string;
    url: string;
    backLabel?: string;
    breadcrumbParent?: string;
  }>(),
  {
    backLabel: "返回工作台",
    breadcrumbParent: "工作台",
  },
);

const win = window as any;
const router = useRouter();
const route = useRoute();
const roleList = ref<any[]>([]);
const menuCode = ref(route.query.menuCode);
const outputManageCenterRef = ref<InstanceType<
  typeof OutputManageCenter
> | null>(null);
const { pendingCount, goToDoCenter } = useBannerBell();

const rawUser = localStorage.getItem("wornbench_useinfo");
const userInfo = ref(
  rawUser
    ? (JSON.parse(rawUser) as {
      nickname?: string;
      icon?: string;
      deptName?: string;
      department?: string;
      departments?: any[];
      deptList?: any[];
    })
    : null,
);

const userNicknameInitial = computed(
  () => (userInfo.value?.nickname && userInfo.value.nickname.charAt(0)) || "",
);

const userDeptLabel = computed(() => {
  const departmentList = userInfo.value?.departments || userInfo.value?.deptList || [];
  const departmentLabel = Array.isArray(departmentList)
    ? departmentList
      .map((item: any) => item?.deptName || item?.name || item?.label)
      .filter(Boolean)
      .join("、")
    : "";

  return userInfo.value?.deptName || userInfo.value?.department || departmentLabel || "";
});

watch(
  () => route.query.menuCode,
  (code) => {
    menuCode.value = code;
  },
);

const linkTo = () => {
  if (props.url) {
    router.push(props.url);
  } else {
    router.go(-1);
  }
};

const getMenu = async () => {
  if (props.active === undefined || props.active === null || props.active === "") {
    return;
  }

  try {
    const res = await getCachedMenus(false, getMenus);
    roleList.value = res;
  } catch (error) {
    console.error("获取菜单失败:", error);
  }
};

getMenu();

const setData = (val: any) => {
  if (val.children) {
    const index = val.children.findIndex(
      (item: any) => item.menuCode == route.name,
    );
    return index > -1;
  }
  if (val.menuCode) {
    return val.menuCode == route.name || val.menuCode == props.active;
  }
  return false;
};

const changeItem = (val: any) => {
  if (val.children) {
    router.push({
      name: val.children[0].menuCode,
      query: { menuCode: route.query.menuCode },
    });
  } else if (val.menuCode) {
    router.push({
      name: val.menuCode,
      query: { menuCode: route.query.menuCode },
    });
  }
};

const openDownloadCenter = () => {
  outputManageCenterRef.value?.open();
};

const onUserMenuSelect = (value: string | number) => {
  if (value === "logOut") {
    window.location.href = win.api?.logoutUrl || "/";
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("wornbench_userId");
    localStorage.removeItem("wornbench_token");
    localStorage.removeItem("wornbench_info");
    localStorage.removeItem("wornbench_useinfo");
    localStorage.removeItem("activeName");
    localStorage.removeItem("activeTab");
    localStorage.removeItem("flowList");
    localStorage.removeItem("formList");
    localStorage.removeItem("taskFillCenterAppId");
  }
};
</script>

<style lang="scss">
@use "../../styles/banner-subpage.scss";
</style>
