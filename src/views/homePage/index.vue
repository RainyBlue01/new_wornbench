<template>
  <div class="workbench-page">
    <banner />

    <div class="workbench-body workbench-body--no-aside">
      <main class="workbench-main custom-scroll">
        <div class="wb-main-constrain">


          <div class="anim-up wb-home-app-shell">
            <div class="wb-home-stats" aria-label="待办概览">
              <button type="button" class="wb-home-stat-card" @click="goFlowTab(0)">
                <div class="wb-home-stat-left">
                  <span class="wb-home-stat-label">我的待办</span>
                  <span class="wb-home-stat-num">{{ counts.pendingCount }}</span>
                </div>
                <div class="wb-home-stat-icon wb-home-stat-icon--blue">
                  <i class="fas fa-clock"></i>
                </div>
              </button>
              <button type="button" class="wb-home-stat-card" @click="goFlowTab(1)">
                <div class="wb-home-stat-left">
                  <span class="wb-home-stat-label">我发起的</span>
                  <span class="wb-home-stat-num">{{ counts.applyCount }}</span>
                </div>
                <div class="wb-home-stat-icon wb-home-stat-icon--green">
                  <i class="fas fa-paper-plane"></i>
                </div>
              </button>
              <button type="button" class="wb-home-stat-card" @click="goFlowTab(2)">
                <div class="wb-home-stat-left">
                  <span class="wb-home-stat-label">我处理的</span>
                  <span class="wb-home-stat-num">{{ counts.handledCount }}</span>
                </div>
                <div class="wb-home-stat-icon wb-home-stat-icon--slate">
                  <i class="fas fa-check-double"></i>
                </div>
              </button>
              <button type="button" class="wb-home-stat-card" @click="goFlowTab(3)">
                <div class="wb-home-stat-left">
                  <span class="wb-home-stat-label">抄送我的</span>
                  <span class="wb-home-stat-num">{{ counts.noticeCount }}</span>
                </div>
                <div class="wb-home-stat-icon wb-home-stat-icon--amber">
                  <i class="fas fa-envelope-open"></i>
                </div>
              </button>
            </div>
            <div class="wb-home-fill-task" v-if="fillTaskList.length > 0">
              <div class="wb-home-fill-task-header">
                <h3 class="wb-home-fill-task-title">填报任务</h3>
                <!-- <span class="wb-home-fill-task-link" @click="goToTaskFillCenter()">查看全部 <icon-right /></span> -->
              </div>
              <div class="wb-home-fill-task-list">
                <div v-if="fillTaskLoading" class="wb-home-fill-task-loading">加载中...</div>
                <EmptyState v-else-if="fillTaskList.length === 0" text="暂无进行中的填报任务" />
                <div v-for="task in fillTaskList" :key="task.batchId" class="wb-home-fill-task-item">
                  <div class="wb-home-fill-task-left">
                    <div class="wb-home-fill-task-icon">
                      <AppIconImage :src="task.showIcon" :alt="task.taskName" />
                    </div>
                    <div class="wb-home-fill-task-info">
                      <div class="wb-home-fill-task-top">
                        <span class="wb-home-fill-task-name">{{ task.taskName }}</span>
                        <a-tag color="arcoblue" size="small" class="wb-home-fill-task-status">进行中</a-tag>
                        <span class="wb-home-fill-task-countdown" v-if="calcRemaining(task.fillStopTime)"
                          :class="{ 'countdown-expired': calcRemaining(task.fillStopTime)?.expired }"><icon-clock-circle
                            class="countdown-icon" /> {{ calcRemaining(task.fillStopTime)?.text }}</span>
                      </div>
                      <div class="wb-home-fill-task-meta">
                        <span class="meta-item"><i class="fas fa-calendar-alt mr-1"></i> 填报时间：{{ task.fillStartTime }} 至
                          {{ task.fillStopTime
                          }}</span>
                        <span class="meta-item" v-if="task.publisher && task.publisher.length"><i
                            class="fas fa-building mr-1"></i> 发布：{{
                              task.publisher.map(p => p.deptName).join('、')}}</span>
                        <span class="meta-item" v-if="task.supervisor && task.supervisor.length"><i
                            class="fas fa-user-shield mr-1"></i> 监督：{{
                              task.supervisor.map(s => s.nickname).join('、')}}</span>
                      </div>
                    </div>
                  </div>
                  <a-button type="primary" shape="round" size="small" class="wb-home-fill-task-btn"
                    @click="goToTaskFillCenter(task)">
                    立即填报
                  </a-button>
                </div>
              </div>
            </div>
            <div v-if="hasSupervisorPermission && superviseTaskList.length > 0"
              class="wb-home-supervise-task modern-card">
              <div class="wb-home-supervise-task-header">
                <h3 class="wb-home-supervise-task-title">任务监督</h3>
                <!-- <span class="wb-home-fill-task-link" @click="goToTaskSuperviseCenter">查看全部 <icon-right /></span> -->
              </div>
              <div class="wb-home-supervise-task-list">
                <div v-if="superviseTaskLoading" class="wb-home-supervise-task-empty">加载中...</div>
                <EmptyState v-else-if="superviseTaskList.length === 0" text="暂无监督任务" />
                <div v-for="task in superviseTaskList" :key="task.batchId" class="wb-home-supervise-task-item">

                  <div class="wb-home-supervise-task-left">
                    <div class="wb-home-supervise-task-icon">

                      <AppIconImage :src="task.showIcon" :alt="task.taskName" class="task-icon-img" />
                    </div>
                    <div class="wb-home-supervise-task-info">
                      <div class="wb-home-supervise-task-top">
                        <span class="wb-home-supervise-task-name">{{ task.taskName }}</span>
                        <span class="wb-home-supervise-task-batch">· 批次 #{{ task.batchNo }}</span>
                        <a-tag v-if="task.status === 'ongoing'" color="arcoblue" size="small"
                          class="wb-home-supervise-task-status">
                          进行中
                        </a-tag>
                        <a-tag v-else color="red" size="small"
                          class="wb-home-supervise-task-status wb-home-supervise-task-status--urgent">
                          即将截止
                        </a-tag>
                      </div>
                      <div class="wb-home-supervise-task-meta">
                        <span class="meta-item"><i class="fas fa-chart-line mr-1" aria-hidden="true"></i>进度：{{
                          formatProgressPercent(task.progress) }}%</span>
                        <span class="meta-item"><i class="fas fa-calendar-alt mr-1"></i> {{ task.fillStartTime }} ~ {{
                          task.fillStopTime }}</span>
                        <span class="meta-item"><i class="fas fa-user mr-1"></i> 发起人：{{ task.startUser }}</span>
                        <span class="meta-item"><i class="fas fa-building mr-1"></i>发布部门：{{ task.publisherDept }}</span>
                        <span class="meta-item"><i class="fas fa-user-shield mr-1"></i>监督：{{ task.supervisor }}</span>
                      </div>
                      <div class="wb-home-supervise-task-progress">
                        <div class="wb-home-supervise-task-progress-bar"
                          :class="`wb-home-supervise-task-progress-bar--${task.theme}`"
                          :style="{ width: `${task.progress}%` }" />
                      </div>
                    </div>
                  </div>
                  <a-button type="primary" shape="round" size="small" class="wb-home-fill-task-btn"
                    @click="goToFillDetail(task)">
                    填报监督
                  </a-button>
                </div>
              </div>
            </div>
            <div class="workbench-my-wrap wb-home-my-app-wrap">
              <myApp mode="plaza" />
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- FAB 浮动按钮 - 有「创建应用」菜单权限时显示 -->
    <div v-if="canCreateApp" class="fab-go-myapps" @click="goToMyApps">
      <icon-plus />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getWorkbenchCount as getWorkbenchCountApi } from "@/api/workbench/index";
import { getMenus } from "@/api/common";
import {
  CREATE_APP_FRONTEND_CODE,
  getCachedMenus,
  hasMenuFrontendCode,
} from "@/utils/menuCache";
import { getSupervisorFillBatchTaskList } from "@/api/taskFillManager";
import { fillBatchTaskList } from "@/api/taskFillCenter";
import { useSupervisorPermission } from "@/composables/useSupervisorPermission";
import banner from "./banner.vue";
import myApp from "./myApps/index.vue";
import EmptyState from "./myApps/EmptyState.vue";
import AppIconImage from '@/components/AppIconImage.vue';
import { getAppIconUrl } from '@/utils/appIcon';
import {
  IconCalendar,
  IconUser,
  IconClockCircle,
  IconList,
} from '@arco-design/web-vue/es/icon';

type HomeSuperviseTaskTheme = 'blue' | 'green' | 'orange'

interface HomeSuperviseTask {
  batchId: string
  taskId: string
  taskName: string
  batchNo: string
  status: 'ongoing' | 'urgent'
  progress: number
  fillStartTime: string
  fillStopTime: string
  initiator: string
  publisherDept: string
  supervisor: string
  theme: HomeSuperviseTaskTheme
  batchState?: number
  appIcon?: string
  showIcon?: string
}

const appState = ref("");
const router = useRouter();
/** 授权菜单中是否包含「创建应用」(frontendCode: createApp) */
const canCreateApp = ref(false);

type Section = "flow" | "app" | "task" | "report";

// 从 localStorage 恢复上一次的 activeSection；无记录时默认应用中心（侧栏已移除）
const savedSection = localStorage.getItem("homePageActiveSection") as Section | null;
const activeSection = ref<Section>(
  savedSection && ["flow", "app", "task", "report"].includes(savedSection) ? savedSection : "app",
);
const flowInnerTab = ref(0);

const counts = reactive({
  fillCount: 0,
  applyCount: 0,
  pendingCount: 0,
  handledCount: 0,
  noticeCount: 0,
});

// 填报任务列表（接口数据）
const fillTaskList = ref<any[]>([]);
const fillTaskLoading = ref(false);

const { hasSupervisorPermission, checkSupervisorPermission } = useSupervisorPermission();
const superviseTaskList = ref<HomeSuperviseTask[]>([]);
const superviseTaskLoading = ref(false);

const calcTaskProgress = (finishTotal: number, fillTotal: number): number => {
  const finish = Number(finishTotal) || 0;
  const total = Number(fillTotal) || 0;
  if (total <= 0) return 0;
  return Math.min(100, Number(((finish / total) * 100).toFixed(2)));
};

const formatProgressPercent = (value: number): string => {
  return (Number(value) || 0).toFixed(2);
};

const mapSupervisorTask = (item: any, index: number): HomeSuperviseTask => {
  const themes: HomeSuperviseTaskTheme[] = ["blue", "green", "orange"];
  const stopTime = item.fillStopTime ? new Date(item.fillStopTime).getTime() : 0;
  const isUrgent = stopTime > 0 && stopTime - Date.now() < 3 * 24 * 60 * 60 * 1000;

  return {
    batchId: String(item.batchId ?? item.objectId ?? ""),
    taskId: String(item.taskId ?? ""),
    taskName: item.taskName || "--",
    batchNo: item.batchDate || String(item.batchId ?? ""),
    status: isUrgent ? "urgent" : "ongoing",
    progress: calcTaskProgress(item.finishTotal, item.fillTotal),
    fillStartTime: item.fillStartTime || "--",
    fillStopTime: item.fillStopTime || "--",
    initiator: "--",
    appIcon: item.appIcon || "",
    showIcon: getAppIconUrl(item.appIcon),
    publisherDept: (item.publisher || []).map((p: any) => p.deptName).join("、") || "--",
    supervisor: (item.supervisor || []).map((s: any) => s.nickname).join("、") || "--",
    theme: themes[index % themes.length],
    batchState: item.status,
  };
};

const fetchSuperviseTasks = async () => {
  try {
    superviseTaskLoading.value = true;
    const res = await getSupervisorFillBatchTaskList();
    const records = Array.isArray(res) ? res : res?.records || [];

    superviseTaskList.value = records.filter((item: any) => item.taskStatus === 1 && item.batchState !== 0).map(mapSupervisorTask);
  } catch {
    superviseTaskList.value = [];
  } finally {
    superviseTaskLoading.value = false;
  }
};

const calcRemaining = (fillStopTime: string) => {
  if (!fillStopTime) return null
  const p = fillStopTime.split(/[\s\-:]/)
  if (p.length < 5) return null
  const end = new Date(+p[0], +p[1] - 1, +p[2], +p[3] || 0, +p[4] || 0, +p[5] || 0)
  if (Number.isNaN(end.getTime())) return null
  const diffMs = end.getTime() - Date.now()
  if (diffMs <= 0) return { text: '已截止', expired: true }
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays > 1) return { text: `剩余 ${diffDays} 天`, expired: false }
  const totalMinutes = Math.floor(diffMs / (1000 * 60))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return { text: minutes > 0 ? `剩余 ${hours}小时${minutes}分钟` : `剩余 ${hours}小时`, expired: false }
}

const fetchFillTasks = async () => {
  try {
    fillTaskLoading.value = true
    const res = await fillBatchTaskList()
    const records = (Array.isArray(res) ? res : res?.records || []).map((task: any) => ({
      ...task,
      showIcon: getAppIconUrl(task.appIcon),
    }))
    // 前端过滤：排除已截止的任务
    const now = Date.now()

    fillTaskList.value = records.filter((task: any) => {
      if (!task.fillStopTime) return true
      // 手动解析 "2026-06-26 09:52:47"，避免浏览器日期解析差异
      const p = String(task.fillStopTime).split(/[\s\-:]/)
      if (p.length < 5) return true
      const end = new Date(+p[0], +p[1] - 1, +p[2], +p[3] || 0, +p[4] || 0, +p[5] || 0).getTime()
      return !Number.isNaN(end) && end > now
    })
  } catch {
    fillTaskList.value = []
  } finally {
    fillTaskLoading.value = false
  }
}

const goToTaskFillCenter = (task?: any) => {
  router.push({ path: "/taskFillCenter", query: task ? { batchId: String(task.batchId), taskId: String(task.taskId), taskName: task.taskName, appIcon: task.appIcon } : {} });
};

const goToTaskSuperviseCenter = () => {
  router.push({ path: "/taskManageCenter" });
};

const goToFillDetail = (task: HomeSuperviseTask) => {
  router.push({
    path: '/taskManageCenter/fillDetail',
    query: {
      from: 'home',
      batchId: task.batchId,
      appIcon: task.appIcon,
    },
  })
}

const loadCreateAppPermission = async () => {
  try {
    const menus = await getCachedMenus(false, getMenus);
    canCreateApp.value = hasMenuFrontendCode(menus, CREATE_APP_FRONTEND_CODE);
  } catch {
    canCreateApp.value = false;
  }
};

onMounted(async () => {
  loadCreateAppPermission();
  fetchFillTasks();
  const allowed = await checkSupervisorPermission();
  if (allowed) {
    fetchSuperviseTasks();
  }
});

getWorkbenchCountApi().then((res) => {
  counts.fillCount = res.fillCount ?? 0;
  counts.applyCount = res.applyCount ?? 0;
  counts.pendingCount = res.pendingCount ?? 0;
  counts.handledCount = res.handledCount ?? 0;
  counts.noticeCount = res.noticeCount ?? 0;
  // const endedHandled = res.handledCount ?? 0;
  // const endedApply = res.applyCount ?? 0;
  // getWorkbenchCountApi({ processFinish: 0 }).then((res2) => {

  // });
});


const goTaskFill = () => {
  router.push({ path: "/taskFillCenter" });
};

// 监听 activeSection 变化，保存到 localStorage
watch(activeSection, (newSection) => {
  localStorage.setItem('homePageActiveSection', newSection);
});

watch(flowInnerTab, (v) => {
  localStorage.setItem("activeTab", String(v));
});

const goFlowTab = (tab: number) => {
  const t = String(tab);
  localStorage.setItem("activeTab", t);
  flowInnerTab.value = tab;
  router.push({ name: "toDoCenter" });
};

const goToMyApps = () => {
  router.push({ name: "myApps" });
};
</script>

<style lang="scss" scoped>
@use '../../styles/textColor.scss' as textColor;

.bottom-saa:deep(a) {
  cursor: pointer;
}

.bottom-saa:deep(a:hover) {
  color: textColor.$ThemeTextColor !important;
}

/* 工作台首页：小屏响应式优化 */
.workbench-page {
  .wb-main-constrain {
    padding: 0 16px;
    box-sizing: border-box;
  }

  .wb-home-stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;

    @media (max-width: 1200px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }

  // 覆盖全局样式，使用 :deep() 确保优先级
  :deep(.wb-home-stat-card) {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: space-between !important;
    background: #fff !important;
    border: 1px solid #f1f5f9 !important;
    border-radius: 14px !important;
    padding: 18px 22px !important;
    cursor: pointer;
    transition: all 0.2s ease !important;
    min-height: auto !important;
    box-shadow: none !important;
    text-align: left !important;
    gap: 0 !important;

    &:hover {
      background: #fafbfc !important;
      border-color: #e2e8f0 !important;
      box-shadow: none !important;
      transform: none !important;
    }

    .wb-home-stat-left {
      display: flex !important;
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 0 !important;
      flex: 1 !important;
    }

    .wb-home-stat-label {
      font-size: 13px !important;
      color: #94a3b8 !important;
      font-weight: 400 !important;
      line-height: 1 !important;
      margin: 0 !important;
    }

    .wb-home-stat-num {
      font-size: 28px !important;
      font-weight: 700 !important;
      color: #1e293b !important;
      line-height: 1 !important;
      margin-top: 4px !important;
    }

    // 隐藏全局的装饰图标
    .wb-home-stat-deco {
      display: none !important;
    }

    .wb-home-stat-icon {
      width: 32px !important;
      height: 32px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      border-radius: 8px !important;
      background: #f8fafc !important;
      flex-shrink: 0 !important;
      position: static !important;
      opacity: 1 !important;
      color: #cbd5e1
    }
  }

  .wb-home-fill-task {
    background: #fff;
    border-radius: 16px;
    padding: 0;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    overflow: hidden;

    &-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid #f2f3f5;
    }

    &-title {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      color: #1d2129;
    }

    &-link {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: rgb(var(--primary-6));
      font-weight: 500;
      cursor: pointer;
      transition: color 0.2s;

      &:hover {
        color: #2563eb;
      }

      :deep(.arco-icon) {
        font-size: 10px;
      }
    }

    &-list {
      // padding: 16px 20px;
    }

    &-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 16px 24px;
      // background: #f7f8fa;
      // border-radius: 10px;
      transition: all 0.2s;

      &:hover {
        background: #F9FAFB;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
      }
    }

    &-left {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 0;
    }

    &-icon {
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      border-radius: 10px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    &-info {
      flex: 1;
      min-width: 0;
    }

    &-top {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
      flex-wrap: wrap;
    }

    &-name {
      font-size: 15px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.9);
      line-height: 18px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &-status {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      border: 0;
      font-weight: 600;
      color: rgb(var(--arcoblue-6));
      background-color: rgb(var(--arcoblue-1));
    }

    &-countdown {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-size: 12px;
      color: #f53f3f;
      font-weight: 400;
      line-height: 1.5;

      .countdown-icon {
        font-size: 12px;
      }
    }

    &-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      font-size: 12px;
      color: #86909c;
      line-height: 1.5;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;

        .arco-icon {
          font-size: 12px;
        }
      }
    }

    &-btn {
      flex-shrink: 0;
      padding: 8px 16px;
      font-size: 13px;
      height: 30px;
      border-radius: 12px;
      background: linear-gradient(135deg, rgb(var(--primary-6)) 0%, #6366f1 100%);
      border: none;

      &:hover {
        background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
      }
    }

    &-loading,
    &-empty {
      text-align: center;
      padding: 32px 0;
      color: #86909c;
      font-size: 13px;
    }
  }

  .wb-home-supervise-task {
    background: #fff;
    border-radius: 16px;
    padding: 0;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    overflow: hidden;

    &-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid #f2f3f5;
    }

    &-title {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      color: #1d2129;
    }

    &-list {
      // 列表容器
    }

    &-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 16px 24px;
      border-bottom: 1px solid #f9fafb;
      transition: all 0.2s;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background: #f9fafb;
      }
    }

    &-left {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      flex: 1;
      min-width: 0;
    }

    &-icon {
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      border-radius: 10px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    &-info {
      flex: 1;
      min-width: 0;
    }

    &-top {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
      flex-wrap: wrap;
    }

    &-name {
      font-size: 14px;
      font-weight: 600;
      color: #111827;
      line-height: 18px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 280px;
    }

    &-batch {
      font-size: 12px;
      color: #9ca3af;
      flex-shrink: 0;
    }

    &-status {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      color: rgb(var(--arcoblue-6));
      background-color: rgb(var(--arcoblue-1));

      &--urgent {
        background: #fef2f2;
        color: #ef4444;
      }
    }

    &-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 12px 16px;
      font-size: 12px;
      color: #9ca3af;
      line-height: 1.5;
      margin-bottom: 8px;

      .meta-item {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;

        .arco-icon {
          font-size: 12px;
        }
      }
    }

    &-progress {
      width: 192px;
      max-width: 100%;
      height: 6px;
      background: #f3f4f6;
      border-radius: 999px;
      overflow: hidden;
    }

    &-progress-bar {
      height: 100%;
      border-radius: 999px;
      transition: width 0.3s ease;

      &--blue {
        background: linear-gradient(90deg, #60a5fa 0%, #6366f1 100%);
      }

      &--green {
        background: linear-gradient(90deg, #4ade80 0%, #10b981 100%);
      }

      &--orange {
        background: linear-gradient(90deg, #fb923c 0%, #ef4444 100%);
      }
    }

    &-empty {
      text-align: center;
      padding: 32px 0;
      color: #86909c;
      font-size: 13px;
    }
  }

  .workbench-body--no-aside {
    .workbench-main {
      padding: 16px;
      height: calc(100vh - 64px);
    }
  }

  /* FAB 按钮 - 跳转到我的应用 */
  .fab-go-myapps {
    position: fixed;
    bottom: 32px;
    right: 32px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgb(var(--primary-6)) 0%, #6366f1 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    cursor: pointer;
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: none;
    z-index: 1000;

    &:hover {
      transform: scale(1.08);
      box-shadow: 0 12px 32px rgba(59, 130, 246, 0.5);
    }

    &:active {
      transform: scale(0.95);
    }
  }
}

.wb-home-my-app-wrap {
  margin-bottom: 50px;
}

.wb-home-supervise-task-status {
  font-size: 12px;
  padding: 1px 6px;
  border-radius: 8px;
  line-height: 1.5;
}
</style>

<style lang="scss">
@use "../../styles/workbench-home.scss";
</style>
