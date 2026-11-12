<template>
  <div class="home-banner" :class="{ 'home-banner--subpage': variant === 'subpage' }">
    <header v-if="variant === 'home'" class="top-nav">
      <div class="wb-header-left">
        <div class="wb-brand" @click="router.push({ path: '/homePage' })">
          <div class="wb-brand-icon">
            <i class="fas fa-cubes" aria-hidden="true"></i>
          </div>
          <div>
            <h1>{{ webSiteStore.getTitle }}</h1>
            <p>0代码，一表通</p>
          </div>
        </div>
        <!-- <div class="wb-header-search search-box">
          <i class="fas fa-search wb-search-ic" aria-hidden="true"></i>
          <a-input v-model="searchValue" placeholder="搜索应用、流程、任务..." class="wb-search-input" />
          <kbd class="wb-search-kbd">⌘K</kbd>
        </div> -->
      </div>
      <div class="wb-header-right">
        <nav class="wb-header-nav">
          <span v-for="(item, idx) in menuList" v-show="item.frontendCode !== 'createApp'"
            :key="item.menuCode || item.label || idx" class="wb-nav-link" @click="setData(item)">
            <i class="fas fa-puzzle-piece wb-ic-orange wb-nav-ic" v-if="item.menuCode === 'pluginCenter'"></i>
            <i class="fas fa-tools wb-ic-orange wb-nav-ic" v-if="item.menuCode === 'operationsCenter'"></i>
            <i class="fas fa-code wb-ic-purple wb-nav-ic" v-else-if="item.menuCode === 'developerCenter'"></i>
            <i class="fas fa-database wb-ic-cyan wb-nav-ic" v-else-if="item.menuCode === 'basicResources'"></i>
            <i class="fas fa-cog wb-nav-ic wb-ic-gray" v-else-if="item.menuCode === 'systemSettings'"></i>{{ item.label
            }}
          </span>
        </nav>
        <div class="wb-header-divider" />
        <button v-if="!externalBackUrl" type="button" class="wb-bell-btn" aria-label="我的待办" @click="goToDoCenter">
          <i class="fas fa-bell" aria-hidden="true"></i>
          <span v-if="pendingCount > 0" class="wb-bell-dot" aria-hidden="true"></span>
        </button>
        <button type="button" class="wb-download-btn" aria-label="下载中心" @click="openDownloadCenter">
          <i class="fas fa-download" aria-hidden="true"></i>
        </button>
        <a-dropdown trigger="click" @select="onUserMenuSelect">
          <span class="wb-user-trigger">
            <img v-if="userInfo?.icon" :src="userInfo.icon" class="wb-avatar" alt="" />
            <div v-else class="wb-avatar-fallback">
              {{ userNicknameInitial }}
            </div>
            <div class="wb-user-meta">
              <p class="wb-user-name">{{ userInfo?.nickname || "系统管理员" }}</p>
              <p class="wb-user-dept">{{ userDeptLabel }}</p>
            </div>
          </span>
          <template #content>
            <a-doption value="logOut">退出登录</a-doption>
          </template>
        </a-dropdown>
      </div>
    </header>

    <header v-else class="tdc-page-header">
      <div class="tdc-top-nav">
        <div class="tdc-top-nav__left">
          <button type="button" class="tdc-back-pill" @click="goBack">
            <icon-left />
            {{ backLabel }}
          </button>
          <nav class="tdc-breadcrumb" aria-label="面包屑">
            <span class="tdc-breadcrumb__item">{{ breadcrumbParent }}</span>
            <span class="tdc-breadcrumb__sep" aria-hidden="true">/</span>
            <span class="tdc-breadcrumb__item tdc-breadcrumb__item--current">{{ breadcrumbCurrent }}</span>
          </nav>
        </div>
        <div class="tdc-top-nav__center">
          <slot name="nav-center" />
        </div>
        <div class="tdc-top-nav__right">
          <slot name="extra-actions"></slot>
          <span class="tdc-top-nav__divider" aria-hidden="true" v-if="!showDesc"></span>
          <button v-if="!externalBackUrl" type="button" class="tdc-bell-btn" aria-label="我的待办" @click="goToDoCenter">
            <i class="fas fa-bell" aria-hidden="true"></i>
            <span v-if="pendingCount > 0" class="tdc-bell-dot" aria-hidden="true"></span>
          </button>
          <button type="button" class="tdc-download-btn" aria-label="下载中心" @click="openDownloadCenter">
            <i class="fas fa-download" aria-hidden="true"></i>
          </button>

          <a-dropdown trigger="click" @select="onUserMenuSelect">
            <span class="tdc-user-trigger">
              <img v-if="userInfo?.icon" :src="userInfo.icon" class="tdc-avatar" alt="" />
              <div v-else class="tdc-avatar-fallback">
                {{ userNicknameInitial }}
              </div>
              <div class="tdc-user-meta">
                <p class="tdc-user-name">{{ userInfo?.nickname || "系统管理员" }}</p>
                <p class="tdc-user-dept">
                  {{ userDeptLabel }}
                </p>
              </div>
            </span>
            <template #content>
              <a-doption value="logOut">退出登录</a-doption>
            </template>
          </a-dropdown>
        </div>
      </div>
    </header>

    <OutputManageCenter ref="outputManageCenterRef" embedded />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { RouteLocationRaw } from "vue-router";
import { useRouter } from "vue-router";
import { getMenus } from "@/api/common";
import { getCachedMenus } from "@/utils/menuCache";
import OutputManageCenter from "@/views/outputManageCenter/index.vue";
import { useSupervisorPermission } from "@/composables/useSupervisorPermission";
import { useBannerBell } from "@/composables/useBannerBell";
import { webSiteConfigStore } from "@/store";

type Variant = "home" | "subpage";

const props = withDefaults(
  defineProps<{
    variant?: Variant;
    subpageHeroTitle?: string;
    subpageHeroDesc?: string;
    breadcrumbParent?: string;
    breadcrumbCurrent?: string;
    backLabel?: string;
    showDesc?: boolean;
    backTo?: RouteLocationRaw;
    externalBackUrl?: string;
    showSubpageHero?: boolean;
  }>(),
  {
    variant: "home",
    subpageHeroTitle: "审批办理",
    subpageHeroDesc: "处理您的待办审批，查看发起和已处理的流程",
    breadcrumbParent: "工作台",
    breadcrumbCurrent: "审批办理",
    backLabel: "返回工作台",
    backTo: undefined,
    externalBackUrl: undefined,
    showDesc: false,
    showSubpageHero: true,
  },
);

const router = useRouter();
const webSiteStore = webSiteConfigStore();
const win = window as any;

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

const menuList = ref<any[]>([]);
const searchValue = ref("");
const outputManageCenterRef = ref<InstanceType<typeof OutputManageCenter> | null>(null);
const { pendingCount, goToDoCenter } = useBannerBell();
const { hasSupervisorPermission, checkSupervisorPermission } = useSupervisorPermission();

const loadMenus = async () => {
  if (props.variant !== "home") return;
  try {
    const res = await getCachedMenus(false, getMenus);
    menuList.value = res;
  } catch (error) {
    console.error("加载菜单失败:", error);
  }
};

loadMenus();
checkSupervisorPermission();

watch(
  () => props.variant,
  (v) => {
    if (v === "home") {
      loadMenus();
      checkSupervisorPermission();
    }
  },
);

const setData = (val: any) => {
  if (val.children) {
    if (val.children[0].menuCode === "basicSettings") {
      router.push({
        name: val.children[0].children[0].menuCode,
        query: { menuCode: val.menuCode },
      });
    } else {
      router.push({ name: val.children[0].menuCode, query: { menuCode: val.menuCode } });
    }
  } else if (val.menuCode === "pluginCenter") {
    router.push({ name: val.menuCode });
  }
};

const openDownloadCenter = () => {
  outputManageCenterRef.value?.open();
};

const onUserMenuSelect = (value: string | number) => {
  if (value === "logOut") {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("wornbench_userId");
    localStorage.removeItem("wornbench_token");
    localStorage.removeItem("wornbench_info");
    window.location.href = win.api?.logoutUrl || "/";
  }
};

const goBack = () => {
  if (props.externalBackUrl) {
    window.location.href = props.externalBackUrl;
    return;
  }
  router.push(props.backTo ?? { name: "homePage" });
};
</script>

<style lang="scss">
@use "../../styles/banner-subpage.scss";
</style>

<style lang="scss" scoped>
:deep(.wb-header-search) {
  flex: 1;
  min-width: 0;

  .arco-input-wrapper {
    background: transparent !important;
    border: none !important;
    padding: 0 !important;
    box-shadow: none !important;

    .arco-input {
      font-size: 14px;
      color: #4b5563;
      background: transparent !important;
      border: none !important;
      padding: 0 !important;
      height: 20px !important;

      &::placeholder {
        color: #9ca3af;
      }

      &:hover {
        background: rgba(0, 0, 0, 0) !important;
        border-color: rgba(0, 0, 0, 0) !important;
      }

      &:focus {
        border: none !important;
        box-shadow: none !important;
        outline: none !important;
      }
    }

    .arco-input-clear-btn {
      display: none !important;
    }
  }
}

.home-banner--subpage .tdc-page-header {
  display: flex;
  flex-direction: column;
}

.home-banner--subpage .tdc-top-nav__center {
  :slotted(*) {
    pointer-events: auto;
  }
}
</style>
