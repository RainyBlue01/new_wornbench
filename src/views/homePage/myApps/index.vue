<template>
  <div class="my" :class="{ 'my--mode-plaza': mode === 'plaza', 'my--mode-mine': mode === 'mine' }">
    <div class="my-create">
      <!-- 页面头部：标题 + 创建按钮（仅在 mine 模式显示） -->
      <div v-if="mode === 'mine'" class="mine-page-header">
        <div class="header-left">
          <h2 class="page-title">应用管理</h2>
          <p class="page-desc">管理您创建和负责设计的所有应用</p>
        </div>
        <div class="header-right">
          <a-button v-if="isdefault" class="create-btn create-btn-form" @click="showCreate(1)">
            <template #icon><icon-plus /></template>
            创建普通表单
          </a-button>
          <a-button v-if="isdefault" class="create-btn create-btn-flow" @click="showCreate(2)">
            <template #icon><icon-plus /></template>
            创建流程表单
          </a-button>
          <a-button v-if="isdefault" class="create-btn create-btn-report" @click="showCreate(3)">
            <template #icon><icon-plus /></template>
            创建简单报表
          </a-button>
          <a-input-search v-model="mineSearchInput" allow-clear class="mine-search-input"
            placeholder="搜索应用名称" aria-label="搜索应用" />
        </div>
      </div>

      <!-- 整体卡片容器：包含 Tab 切换栏和应用列表 -->
      <div v-if="mode === 'mine' && (isdefault || isManager)" class="mine-app-card">
        <!-- Tab 切换栏 -->
        <div class="mine-tab-header">
          <div class="mine-tab-item" :class="{ active: mineActiveTab === 'created' }"
            @click="setMineActiveTab('created')">
            <div class="mine-tab-title">我创建的应用</div>
            <div class="mine-tab-desc">拥有应用的所有权限</div>
          </div>
          <div class="mine-tab-item" :class="{ active: mineActiveTab === 'managed' }"
            @click="setMineActiveTab('managed')">
            <div class="mine-tab-title">转让给我的应用</div>
            <div class="mine-tab-desc">拥有应用的所有权限</div>
          </div>
        </div>

        <!-- 应用列表内容区域 -->
        <div class="mine-tab-content">
          <MineAppCatalog
            v-if="mineActiveTab === 'created' && isdefault"
            v-model="mineCategoryId"
            :categories="myCategoryList"
            :search-text="mineSearchInput"
            context-type="create"
            empty-text="暂无我创建的应用"
            @app-click="setApp"
            @contextmenu="showContextMenu"
          />
          <MineAppCatalog
            v-if="mineActiveTab === 'managed' && isManager"
            v-model="mineCategoryId"
            :categories="myManageCategoryList"
            :search-text="mineSearchInput"
            context-type="manage"
            empty-text="暂无转让给我的应用"
            @app-click="setManager"
            @contextmenu="showContextMenu"
          />
        </div>
      </div>

      <!-- 其他模式下的应用列表 -->
      <div v-else class="item-my-body wb-dashboard">
        <!-- 我创建的应用 -->
        <MyCreatedApps v-if="mode !== 'plaza' && isdefault" :apps="myList" :show-create-btn="isdefault"
          @create="showCreate" @click="setApp" @contextmenu="showContextMenu" />

        <!-- 我管理的应用 -->
        <MyManagedApps v-if="mode !== 'plaza' && isManager" :apps="myManageList" @click="setManager"
          @contextmenu="showContextMenu" />

        <!-- 应用广场 -->
        <AppPlaza v-if="mode !== 'mine' && (allList.length > 0 || (mode === 'plaza' && plazaLoaded))" :mode="mode"
          :categories="allList" :category-id="plazaCategoryId" :search-text="searchInput"
          :show-fab="isdefault && mode === 'plaza'" :show-fab-menu="showFabMenu" :plaza-loaded="plazaLoaded"
          @update:search-text="searchInput = $event" @search="searchItem" @category-change="onPlazaCategoryChangeHandle"
          @toggle-fab="toggleFabMenu" @create-form="handleCreateForm" @create-flow="handleCreateFlow"
          @create-report="handleCreateReport" @app-click="setVisitor" />

        <!-- 全局空状态 -->
        <div class="empty-box hei"
          v-show="mode === 'full' && myManageList.length == 0 && myList.length == 0 && allAllList.length == 0">
          <EmptyState text="暂无内容" />
        </div>
      </div>


    </div>

    <!-- 弹窗组件 -->
    <create ref="createRef" @init="getList" />
    <updateApp ref="updateAppRef" :appdes="currentAppDes" :dept-lists="deptLists" />
    <publishTask ref="publishTaskRef" :appdes="currentAppDes" />

    <!-- 右键上下文菜单 -->
    <ContextMenu :visible="contextMenuVisible" :position="contextMenuPos" :buttons="contextMenuButtons"
      @close="contextMenuVisible = false" @action="handleContextAction" />
  </div>
</template>

<script setup lang="ts">
import {
  getCreatorApp,
  getVisitorApp,
  getManagerApp,
  appTabPermission,
} from "@/api/homePage/index";
import { getCreatorDes } from '@/api/homePage/index';
import { getCreatorApp as getCreatorAppApi } from '@/api/form/index';
import { getDeptTree } from '@/api/common/index';
import { ref, shallowRef, watch, onMounted, onBeforeUnmount, provide, computed } from "vue";
import { useRouter } from "vue-router";
import { flowsToTree } from '@/utils/flowPath';
import { setFormById, setRules, setForm } from '@/utils/form';
import { getAppIconUrl } from '@/utils/appIcon';

// 子组件导入
import MyCreatedApps from './MyCreatedApps.vue';
import MyManagedApps from './MyManagedApps.vue';
import AppPlaza from './AppPlaza.vue';
import MineAppCatalog from './MineAppCatalog.vue';
import {
  setPersistedAppNav,
} from '../../application/composables/useAppFormNav';
import FabButton from './FabButton.vue';
import ContextMenu from './ContextMenu.vue';
import EmptyState from './EmptyState.vue';
import create from "../create.vue";
import updateApp from "../../application/updateApp/index.vue";
import publishTask from "../../application/publishTask/index.vue";
import {
  loadMineTab,
  saveMineTab,
  loadPlazaSearch,
  savePlazaSearch,
  loadPlazaCategory,
  savePlazaCategory,
  migrateLegacyPlazaCategory,
  type MineTab,
} from "./persist";

export type MyAppMode = "full" | "plaza" | "mine";

const props = withDefaults(defineProps<{ mode?: MyAppMode }>(), {
  mode: "full",
});

const PLAZA_ALL = "__plaza_all__";

const router = useRouter();
const searchInput = ref(loadPlazaSearch());
const myManageList = ref([]);
const myList = ref([]);
const myCategoryList = ref<any[]>([]);
const myManageCategoryList = ref<any[]>([]);
const isdefault = ref(true);
const isManager = ref(true);
const allList = ref([]);
const allMyList = ref([]);
const createRef = ref();
const updateAppRef = ref();
const publishTaskRef = ref();
const allmyManageList = ref([]);
const allAllList = ref([]);
const currentAppDes = ref<any>({});
const deptLists = ref([]);

const plazaCategoryId = ref<string | number>("");
const plazaLoaded = ref(false);

// 右键菜单相关
const contextMenuVisible = ref(false);
const contextMenuPos = ref({ x: 0, y: 0 });
const contextMenuItem = ref<any>(null);
const contextMenuType = ref<'create' | 'manage'>('create');

// mine 模式切换栏状态（持久化）
const mineActiveTab = ref<MineTab>(loadMineTab());
const mineSearchInput = shallowRef('');
const mineCategoryId = ref<string | number>(PLAZA_ALL);

const setMineActiveTab = (tab: MineTab) => {
  mineActiveTab.value = tab;
  mineCategoryId.value = PLAZA_ALL;
  saveMineTab(tab);
};

const normalizeMineTabByPermission = () => {
  if (mineActiveTab.value === "created" && !isdefault.value && isManager.value) {
    setMineActiveTab("managed");
  } else if (mineActiveTab.value === "managed" && !isManager.value && isdefault.value) {
    setMineActiveTab("created");
  }
};

const ensurePlazaCategory = () => {
  if (!allList.value.length) return;
  if (String(plazaCategoryId.value) === PLAZA_ALL) return;
  const exists = allList.value.some((x: any) => String(x.id) === String(plazaCategoryId.value));
  if (!plazaCategoryId.value || !exists) {
    plazaCategoryId.value = PLAZA_ALL;
  }
};

const syncHomeTabsState = () => {
  const migrated = migrateLegacyPlazaCategory(allList.value);
  if (migrated != null) {
    plazaCategoryId.value = migrated;
  }

  const storedPlaza = loadPlazaCategory();
  if (storedPlaza === PLAZA_ALL) {
    plazaCategoryId.value = PLAZA_ALL;
  } else if (
    storedPlaza &&
    allList.value.some((x: any) => String(x.id) === storedPlaza)
  ) {
    plazaCategoryId.value = /^\d+$/.test(storedPlaza) ? Number(storedPlaza) : storedPlaza;
  }
  ensurePlazaCategory();
  if (plazaCategoryId.value !== "" && plazaCategoryId.value != null) {
    savePlazaCategory(plazaCategoryId.value);
  }
};

const showCreate = (type?: number) => {
  createRef.value?.showItem(type || 1);
};

const onPlazaCategoryChangeHandle = (id: string | number) => {
  plazaCategoryId.value = id;
  savePlazaCategory(plazaCategoryId.value);
};

// FAB 按钮菜单控制
const showFabMenu = ref(false);

const toggleFabMenu = () => {
  showFabMenu.value = !showFabMenu.value;
};

const handleCreateForm = () => {
  showFabMenu.value = false;
  createRef.value.showItem(1);
};

const handleCreateFlow = () => {
  showFabMenu.value = false;
  createRef.value.showItem(2);
};

const handleCreateReport = () => {
  showFabMenu.value = false;
  createRef.value.showItem(3);
};

// 点击外部关闭菜单
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!target.closest('.fab-container') && !target.closest('.fab-container-inner')) {
    showFabMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

// 右键菜单控制
const showContextMenu = (e: MouseEvent, item: any, type: 'create' | 'manage') => {
  contextMenuItem.value = item;
  contextMenuType.value = type;

  // 计算菜单位置，防止超出屏幕边界
  const menuWidth = 160;
  const menuHeight = 200;
  let x = e.clientX;
  let y = e.clientY;

  if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 10;
  if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - 10;

  contextMenuPos.value = { x, y };
  contextMenuVisible.value = true;
};

const contextMenuButtons = computed(() => {
  const item = contextMenuItem.value;
  if (!item) return [];
  const btns: any[] = [];
  const cat = item.category;

  if (cat === 1 || cat === 2) btns.push({ key: 'formDesign', label: '设计表单' });
  if (cat === 2) btns.push({ key: 'flowDesign', label: '设计流程' });
  // 仅"我创建的应用"显示应用管理
  if (contextMenuType.value === 'create') btns.push({ key: 'appManage', label: '应用管理' });
  if (cat === 3) btns.push({ key: 'reportDesign', label: '报表管理' });
  if (cat === 1 || cat === 2) btns.push({ key: 'publishTask', label: '发布任务' });
  // 表单和流程应用支持查看原始数据
  if (cat === 1 || cat === 2) btns.push({ key: 'viewOriginalData', label: '原始数据' });

  return btns;
});

const handleContextAction = (key: string) => {
  contextMenuVisible.value = false;
  const item = contextMenuItem.value;
  if (!item) return;

  switch (key) {
    case 'formDesign': handleFormDesign(item); break;
    case 'flowDesign': handleFlowDesign(item); break;
    case 'appManage': handleAppManage(item); break;
    case 'reportDesign': handleEditReport(item); break;
    case 'publishTask': handlePublishTask(item); break;
    case 'viewOriginalData': handleViewOriginalData(item); break;
  }
};

// 获取部门树数据
getDeptTree().then(res => {
  deptLists.value = res;
});

const searchItem = () => {
  savePlazaSearch(searchInput.value);
  let allLists = [];
  allAllList.value.map(v => {
    let accessAppList = searchInput.value
      ? v.accessAppList.filter((item: any) =>
        item.appName.toLowerCase().includes(searchInput.value.toLowerCase()),
      )
      : v.accessAppList;
    allLists.push({ ...v, accessAppList });
  });
  allList.value = allLists;
  myList.value = searchInput.value
    ? allMyList.value.filter((item: any) =>
      item.appName.toLowerCase().includes(searchInput.value.toLowerCase()),
    )
    : allMyList.value;
  myManageList.value = searchInput.value
    ? allmyManageList.value.filter((item: any) =>
      item.appName.toLowerCase().includes(searchInput.value.toLowerCase()),
    )
    : allmyManageList.value;
  ensurePlazaCategory();
};

const setApp = (item: any) => {
  setPersistedAppNav(item.id as string, 'form');
  router.push({ path: "/application", query: { id: item.id } });
};

const setVisitor = (item: any) => {
  router.push({ path: "/visitor", query: { id: item.id } });
};

const setManager = (item: any) => {
  setPersistedAppNav(item.id as string, 'form');
  router.push({ path: "/manager", query: { id: item.id } });
};

// 操作按钮处理函数
const handleFormDesign = async (item: any) => {
  try {
    await preloadAppData(item.id);
    router.push({ path: "/form", query: { id: item.id, type: item.category } });
  } catch (error) {
    console.error('数据加载失败:', error);
    router.push({ path: "/form", query: { id: item.id, type: item.category } });
  }
};

const handlePublishTask = async (item: any) => {
  try {
    await preloadAppData(item.id);
    publishTaskRef.value.show();
  } catch (error) {
    console.error('数据加载失败:', error);
  }
};

const handleFlowDesign = async (item: any) => {
  try {
    await preloadAppData(item.id);
    router.push({ path: "/flowPath", query: { id: item.id, type: item.category } });
  } catch (error) {
    console.error('数据加载失败:', error);
    router.push({ path: "/flowPath", query: { id: item.id, type: item.category } });
  }
};

// 预加载应用数据
const preloadAppData = (appId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    let appdes: any = {};
    let formConfs: any = {};

    getCreatorDes(appId).then(res => {
      appdes = res;
      appdes.showIcon = getAppIconUrl(appdes.icon);
      appdes.id = appId;
      currentAppDes.value = appdes;

      getCreatorAppApi(appId).then(res => {
        if (appdes.category !== 3) {
          formConfs = res.formConfig ? JSON.parse(res.formConfig) : { id: '', formList: [] };
          let processConfig = res.processConfig ? JSON.parse(res.processConfig) : { sequenceFlows: [], nodes: [] };

          flowsToTree(processConfig, appId);

          formConfs.name = appdes.appName;
          formConfs.category = appdes.category;
          formConfs.id = appdes.formId;
          formConfs.processId = appdes.processId;

          if (!formConfs.formList) {
            formConfs.formList = [];
          } else {
            formConfs.formList = formConfs.formList.map((item: any) => {
              const { '@class': _unused, ...rest } = item;
              return rest;
            });
          }

          setForm(formConfs.formList);
          if (Array.isArray(formConfs.formList)) {
            setRules(formConfs.formList, [], false);
          }
          setFormById(formConfs, appId);
          resolve();
        } else {
          formConfs = res.reportConfig ? JSON.parse(res.reportConfig) : { id: '', formList: [] };

          if (!formConfs.formList) {
            formConfs.formList = [];
          } else {
            formConfs.formList = formConfs.formList.map((item: any) => {
              const { '@class': _unused, ...rest } = item;
              return rest;
            });
          }

          formConfs.reportId = appdes.reportId;
          formConfs.name = appdes.appName;
          formConfs.category = appdes.category;
          setFormById(formConfs, appId);
          resolve();
        }
      }).catch(reject);
    }).catch(reject);
  });
};

const handleEditReport = async (item: any) => {
  try {
    await preloadAppData(item.id);
    router.push({ path: "/designer", query: { id: item.id, type: item.category } });
  } catch (error) {
    console.error('数据加载失败:', error);
    router.push({ path: "/designer", query: { id: item.id, type: item.category } });
  }
};

const handleAppManage = async (item: any) => {
  try {
    await preloadAppData(item.id);
    updateAppRef.value.showItem();
  } catch (error) {
    console.error('数据加载失败:', error);
  }
};

const handleViewOriginalData = async (item: any) => {
  try {
    await preloadAppData(item.id);
    router.push({
      path: '/originalData',
      query: {
        id: item.id,
        formId: item.formId,
        processId: item.processId,
        appName: item.appName,
      }
    });
  } catch (error) {
    console.error('数据加载失败:', error);
    // 即使预加载失败也跳转，由原始数据页面处理
    router.push({
      path: '/originalData',
      query: {
        id: item.id,
        formId: item.formId,
        processId: item.processId,
        appName: item.appName,
      }
    });
  }
};

const setMineAppIcon = (app: any) => {
  app.showIcon = getAppIconUrl(app.icon);
  return app;
};

const normalizeMineCategoryResponse = (response: any) => {
  const rows = Array.isArray(response) ? response : [];
  const isCategoryResponse = rows.some((row: any) => Array.isArray(row?.accessAppList));

  if (!isCategoryResponse) {
    return {
      categories: [],
      apps: rows.map(setMineAppIcon),
    };
  }

  const categories = rows.map((row: any) => ({
    ...row,
    accessAppList: Array.isArray(row.accessAppList)
      ? row.accessAppList.map(setMineAppIcon)
      : [],
  }));

  return {
    categories,
    apps: categories.flatMap((row: any) => row.accessAppList),
  };
};

const getList = () => {
  if (isdefault.value && router.currentRoute.value.name == 'myApps') {
    getCreatorApp().then((res) => {
      const normalized = normalizeMineCategoryResponse(res);
      myCategoryList.value = normalized.categories;
      myList.value = normalized.apps;
      allMyList.value = JSON.parse(JSON.stringify(normalized.apps));
    });
  }
  if (router.currentRoute.value.name == 'homePage') {
    getVisitorApp().then((res) => {
      if (res) {
        res.map((v: any) => {
          if (Array.isArray(v.accessAppList)) {
            v.accessAppList.map((v1: { showIcon: string; icon: string | null }) => {
              v1.showIcon = getAppIconUrl(v1.icon);
            });
          }
        });
        allList.value = res;
        allAllList.value = JSON.parse(JSON.stringify(res));
      } else {
        allList.value = [];
      }
      if (router.currentRoute.value.name == 'homePage') {
        syncHomeTabsState();
      }
      plazaLoaded.value = true;
      if (router.currentRoute.value.name == 'homePage' && searchInput.value.trim()) {
        searchItem();
      }
    });
  }

  if (isManager.value && router.currentRoute.value.name == 'myApps') {
    getManagerApp().then((res) => {
      const normalized = normalizeMineCategoryResponse(res);
      myManageCategoryList.value = normalized.categories;
      myManageList.value = normalized.apps;
      allmyManageList.value = JSON.parse(JSON.stringify(normalized.apps));
    });
  }
};

const getDefault = () => {
  // appTabPermission().then((res) => {
  //   isdefault.value = res.isDefault;
  //   isManager.value = res.isManager;
  //   normalizeMineTabByPermission();
  getList();
  // });
};

watch(searchInput, (val) => {
  savePlazaSearch(val);
});

getDefault();

watch(
  () => allList.value,
  () => {
    ensurePlazaCategory();
  },
  { deep: true },
);

const getAppDes = () => {
  getList();
};

provide("provideServer", { getAppDes });
</script>

<style lang="scss" scoped>
@use "@/styles/textColor.scss" as textColor;

// 应用广场模式（homePage 使用）
.my {
  width: 100%;
  border-radius: 20px;
  margin: 0 auto 20px;
  // font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial,
  // sans-serif;
  font-size: 14px;
  color: #334155;
}

.my--mode-plaza {
  margin-top: 0;
  margin-bottom: 0;
}

.my:deep() {
  .el-tabs__header {
    margin: 0 0 24px;
  }

  .arco-tabs-nav-tab-list {
    background: #f8f8f8;
    border-radius: 3px 3px 3px 3px;
    padding: 4px;

    .arco-tabs-tab-active {
      color: textColor.$ThemeTextColor;
      background: #ffffff;
    }
  }

  .arco-tabs-nav-ink {
    display: none;
  }

  .arco-tabs-nav::before {
    display: none;
  }

  .arco-tabs-tab {
    padding: 5px 20px;
    min-width: 132px;
    margin: 0;
    padding-left: 20px !important;
    padding-right: 20px !important;
    text-align: center;
    height: 28px;
    line-height: 18px;
  }

  .arco-tabs-tab:hover {
    color: textColor.$ThemeTextColor;
    background: #ffffff;
  }

  .btn {
    .arco-input-wrapper {
      width: 240px;
      height: 36px;
      line-height: 36px;
      background-color: #fff;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      transition: all 0.2s ease;

      &:focus-within {
        border-color: textColor.$ThemeTextColor;
        box-shadow: 0 0 0 3px rgba(var(--primary-6), 0.1);
      }
    }

    .arco-btn-size-medium {
      margin-left: 10px;
      padding: 9px 20px;
      border: 0;
      height: 36px;
      background: textColor.$ThemeTextColor;
      border-radius: 10px;
      color: #ffffff;
      font-weight: 500;
      position: relative;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      transform: translateZ(0);

      &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: translate(-50%, -50%);
        transition: width 0.6s ease, height 0.6s ease;
        pointer-events: none;
      }

      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.6s ease;
        pointer-events: none;
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(var(--primary-6), 0.4);

        &::before {
          width: 300px;
          height: 300px;
        }

        &::after {
          left: 100%;
        }
      }

      &:active {
        transform: translateY(0) scale(0.98);
        box-shadow: 0 2px 8px rgba(var(--primary-6), 0.3);
      }
    }
  }
}

.my-create {
  border-radius: 20px;
  position: relative;
  width: 100%;

  // mine 模式页面头部
  .mine-page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 0 0 20px;

    .header-left {
      .page-title {
        font-size: 20px;
        font-weight: 700;
        color: #111827;
        margin: 0 0 4px 0;
        line-height: 1.4;
      }

      .page-desc {
        font-size: 14px;
        font-weight: 400;
        color: #9ca3af;
        margin: 0;
        line-height: 1.5;
      }
    }

    .header-right {
      display: flex;
      gap: 10px;
      flex-shrink: 0;

      .create-btn {
        height: 34px;
        padding: 0 14px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 500;
        border: none;
        transition: all 0.3s;

        &.create-btn-form {
          background: linear-gradient(135deg, #e8f3ff 0%, #d4e8ff 100%);
          color: #165dff;

          &:hover {
            background: linear-gradient(135deg, #d4e8ff 0%, #c0dcff 100%);
          }
        }

        &.create-btn-flow {
          background: linear-gradient(135deg, #f0e6ff 0%, #e4d4ff 100%);
          color: #722ed1;

          &:hover {
            background: linear-gradient(135deg, #e4d4ff 0%, #d8c4ff 100%);
          }
        }

        &.create-btn-report {
          background: linear-gradient(135deg, #e6fffb 0%, #d4f7ef 100%);
          color: #00b42a;

          &:hover {
            background: linear-gradient(135deg, #d4f7ef 0%, #c2f0e3 100%);
          }
        }
      }
    }
  }

  // mine 模式整体卡片
  .mine-app-card {
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    overflow: hidden;

    // 隐藏子组件内部的标题区域，避免重复
    :deep(.wb-apps-card-head) {
      display: none !important;
    }

    // 调整子组件内容区域的内边距，与 Tab 栏衔接
    :deep(.wb-apps-mine-body) {
      padding: 24px 32px 32px !important;
      border-radius: 0 !important;
    }

    :deep(.content-area) {
      padding: 0 !important;
    }
  }

  // mine 模式切换栏
  .mine-search-input {
    width: 240px;
    max-width: 100%;

    :deep(.arco-input-wrapper) {
      height: 34px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      background: #f8fafc;
      transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    }

    :deep(.arco-input-wrapper:hover),
    :deep(.arco-input-wrapper-focus) {
      border-color: rgb(var(--primary-6));
      background: #fff;
      box-shadow: 0 0 0 3px rgba(var(--primary-6), 0.08);
    }
  }

  @media (max-width: 640px) {
    .mine-search-input {
      width: 100%;
    }
  }

  .mine-tab-header {
    display: flex;
    background: #ffffff;
    border-radius: 12px 12px 0 0;
    border-bottom: 1px solid #e5e6eb;
    margin-bottom: 0;

    .mine-tab-item {
      flex: 1;
      padding: 18px 0;
      cursor: pointer;
      text-align: center;
      position: relative;
      transition: all 0.3s;
      background: #fafafa;

      &::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 2px;
        background: textColor.$ThemeTextColor;
        border-radius: 1px 1px 0 0;
        transition: width 0.3s;
      }

      &.active {
        background: #ffffff;

        &::after {
          width: 100%;
        }

        .mine-tab-title {
          color: rgb(var(--primary-6));
          font-weight: 600;
        }
      }

      &:hover:not(.active) {
        background: #f2f3f5;
      }

      .mine-tab-title {
        font-size: 14px;
        font-weight: 600;
        color: #475569;
        margin-bottom: 2px;
        line-height: 1.4;
        transition: color 0.2s;
      }

      .mine-tab-desc {
        font-size: 12px;
        font-weight: 400;
        color: #94a3b8;
        line-height: 1.4;
        transition: color 0.2s;
      }
    }
  }

  &-title {
    display: flex;
    padding: 0 0 20px;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0;

    .title {
      font-size: 16px;
      font-weight: 700;
      color: #111827;
      line-height: 1.4;
    }

    .btn {
      font-size: 13px;
      font-weight: 500;
      color: #64748b;
      cursor: pointer;
      display: flex;
      align-items: center;

      .el-input {
        margin-right: 10px;
      }
    }
  }

  // 子组件字体与 工作台.html 对齐
  :deep(.wb-apps-card-title) {
    font-size: 16px !important;
    font-weight: 700 !important;
    color: #111827 !important;
    letter-spacing: normal !important;
  }

  :deep(.wb-apps-card-subtitle) {
    font-size: 13px !important;
    font-weight: 400 !important;
    color: #64748b !important;
  }

  :deep(.wb-apps-create-btn) {
    font-size: 13px !important;
    font-weight: 500 !important;
  }

  :deep(.category-tab) {
    font-size: 13px !important;
    font-weight: 500 !important;
    color: #64748b !important;

    &.active {
      font-weight: 500 !important;
      color: rgb(var(--primary-6)) !important;
    }
  }

  :deep(.wb-apps-plaza-subtitle) {
    font-size: 14px !important;
    font-weight: 500 !important;
    color: #334155 !important;
  }

  :deep(.wb-app-tile__name) {
    font-size: 13px !important;
    font-weight: 500 !important;
    color: #475569 !important;
    line-height: 1.4 !important;
    transition: color 0.25s ease;
  }

  :deep(.wb-app-tile__type) {
    font-size: 12px !important;
    font-weight: 500 !important;
    line-height: 1.4 !important;
  }

  :deep(.wb-app-tile:hover .wb-app-tile__name) {
    color: #0f172a !important;
  }

  :deep(.empty-box .tit) {
    font-size: 13px !important;
    font-weight: 500 !important;
    color: #64748b !important;
  }

  :deep(.wb-apps-plaza-search .arco-input) {
    font-size: 12px !important;
    line-height: 24px !important;
    font-weight: 400 !important;
  }

  :deep(.wb-apps-mine-entry) {
    font-size: 14px !important;
    font-weight: 500 !important;
  }
}

.hei {
  height: calc(100vh - 280px);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes itemFadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
