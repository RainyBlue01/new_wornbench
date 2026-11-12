<template>
  <div class="toDoCenter" :class="{ 'toDoCenter--embedded': embedded }">
    <HomeBanner v-if="!embedded" variant="subpage" :showDesc="true" />
    <div class="toDoCenterbody">
      <div class="page-header" v-if="!embedded">
        <h1 class="page-title">审批办理</h1>
        <p class="page-desc">处理您的待办审批、查看发起和已处理的流程</p>
      </div>
      <div class="toDoCenter-body" :class="{ 'toDoCenter-body--embedded': embedded }">
        <div class="toDoCenter-body-tabs">
          <!-- 标题模块 -->

          <a-tabs v-model:active-key="activeTab" @change="tabHandler">
            <a-tab-pane key="0">
              <template #title>
                <span class="wb-tab-title">
                  我的待办
                  <span class="wb-tab-badge">{{ workbenchCount.pendingCount }}</span>
                </span>
              </template>
              <wrapperTable :activeTab="activeTab" :embedded="embedded" ref="pendingRef"
                :get-app-options="getPendingAppsApi" :get-table-data="pendingRecordApi" classify="pending"
                @getDataNum="pendingCallBack">
                <template #record="{ record, rowIndex }">
                  <div class="flow-item">
                    <div :class="['flow-item-avatar', getAvatarColor(rowIndex)]">
                      {{ record.startNickname ? record.startNickname.charAt(0) : '待' }}
                    </div>
                    <div class="flow-item-content">
                      <div class="flow-item-header">
                        <span class="flow-item-title">{{ record.pendingTitle }}</span>
                        <div class="flow-item-tags">
                          <a-tag color="arcoblue" size="small">
                            {{ showPending(record.taskType) }}
                          </a-tag>
                          <a-tag class="status-tag-urgent" v-if="record.priority == 2" size="small">
                            加急
                          </a-tag>
                          <a-tag class="green-color" v-if="record.isFillTask" size="small">
                            填报任务
                          </a-tag>
                        </div>
                      </div>
                      <div class="flow-item-fields" v-if="record.fieldInfos && record.fieldInfos.length > 0">
                        <span class="flow-item-field-tag" v-for="(field, idx) in record.fieldInfos" :key="idx">
                          {{ field.fieldName }}：{{ field.fieldValue }}
                        </span>
                        <!-- <span class="flow-item-field-tag more-tag" v-if="record.fieldInfos.length > 3">+{{ record.fieldInfos.length - 3 }}</span> -->
                      </div>
                      <div class="flow-item-info">
                        <span class="flow-item-info-item">
                          <i class="fas fa-user"></i>
                          提交人：{{ record.startNickname }}
                        </span>
                        <span class="flow-item-info-item">
                          <i class="fas fa-clock"></i>
                          发起：{{ record.startTime }}
                        </span>
                      </div>
                    </div>
                    <div class="flow-item-actions">
                      <button class="btn-primary" @click="handClick(record, 'pending')">
                        {{ record.priority == 2 ? "立即处理" : "去审批" }}
                      </button>
                    </div>
                  </div>
                </template>
              </wrapperTable>
            </a-tab-pane>
            <a-tab-pane key="1">
              <template #title>
                <span class="wb-tab-title">
                  我发起的
                  <span class="wb-tab-badge">{{ workbenchCount.applyCount }}</span>
                </span>
              </template>
              <wrapperTable :activeTab="activeTab" :embedded="embedded" ref="applyRef"
                :get-app-options="getApplyAppsApi" :get-table-data="applyRecordApi" classify="apply"
                @getDataNum="applyCallBack">
                <template #record="{ record, rowIndex }">
                  <div class="flow-item">
                    <div :class="['flow-item-avatar', getAvatarColor(rowIndex)]">
                      我
                    </div>
                    <div class="flow-item-content">
                      <div class="flow-item-header">
                        <span class="flow-item-title">{{ record.applyTitle }}</span>
                        <div class="flow-item-tags">
                          <a-tag v-if="!record.finish" color="arcoblue" size="small">
                            审批中
                          </a-tag>
                          <a-tag v-else-if="record.finishState === 1" color="green" size="small">
                            已通过
                          </a-tag>
                          <a-tag v-else-if="record.finishState === 2" class="status-tag-fail" size="small">
                            流程失败
                          </a-tag>
                          <a-tag class="status-tag-urgent" v-if="record.urgent == 2" size="small">
                            加急
                          </a-tag>
                          <a-tag class="green-color" v-if="record.isFillTask" size="small">
                            填报任务
                          </a-tag>
                        </div>
                      </div>
                      <div class="flow-item-fields" v-if="record.fieldInfos && record.fieldInfos.length > 0">
                        <span class="flow-item-field-tag" v-for="(field, idx) in record.fieldInfos" :key="idx">
                          {{ field.fieldName }}：{{ field.fieldValue }}
                        </span>
                      </div>
                      <div class="flow-item-info">
                        <span class="flow-item-info-item">
                          <i class="fas fa-clock"></i>
                          发起：{{ record.applyTime }}
                        </span>
                        <span class="flow-item-info-item" v-if="record.finishState === 1">
                          <i class="fas fa-check"></i>
                          完成：{{ record.finishTime }}
                        </span>
                        <span class="flow-item-info-item" v-if="record.finishState === 2">
                          <i class="fas fa-exclamation-circle red-color"></i>
                          失败原因：{{ record.failReason }}
                        </span>
                        <span class="flow-item-info-item"
                          v-if="record.currentRuntimes && record.currentRuntimes.length > 0">
                          <i class="fas fa-user "></i>
                          当前：{{ getCurrentNicknames(record) }}
                        </span>
                        <span class="flow-item-info-item"
                          v-if="record.currentRuntimes && record.currentRuntimes.length > 0">
                          <i class="fas fa-route"></i>
                          节点：{{record.currentRuntimes.map(item => item.executionName).join('、')}}
                        </span>
                      </div>
                    </div>
                    <div class="flow-item-actions">
                      <button class="btn-ghost" @click="handClick(record, 'apply')">查看</button>
                      <button v-if="!record.finish" class="btn-ghost btn-urgent" @click.stop="handleUrgent(record)"
                        :disabled="urgentLoading">
                        <i class="fas fa-bell"></i>
                        催办
                      </button>
                      <button v-if="record.finishState === 2" class="btn-ghost" @click.stop="handleReApply(record)">
                        重新发起
                      </button>
                    </div>
                  </div>
                </template>
              </wrapperTable>
            </a-tab-pane>
            <a-tab-pane key="2">
              <template #title>
                <span class="wb-tab-title">
                  我处理的
                  <span class="wb-tab-badge">{{ workbenchCount.handledCount }}</span>
                </span>
              </template>
              <wrapperTable :activeTab="activeTab" :embedded="embedded" ref="handlerRef"
                :get-app-options="getHandlerAppsApi" :get-table-data="handlerRecordApi" classify="handler"
                @getDataNum="handlerCallBack">
                <template #record="{ record, rowIndex }">
                  <div class="flow-item">
                    <div :class="['flow-item-avatar', getAvatarColor(rowIndex)]">
                      {{ record.operatorNickname ? record.operatorNickname.charAt(0) : '我' }}
                    </div>
                    <div class="flow-item-content">
                      <div class="flow-item-header">
                        <span class="flow-item-title">{{ record.handlerTitle }}</span>
                        <div class="flow-item-tags">
                          <a-tag v-if="record.operatorType === 1" color="green" size="small">
                            已通过
                          </a-tag>
                          <a-tag v-else-if="record.operatorType === 3" class="status-tag-back" size="small">
                            已驳回
                          </a-tag>
                          <a-tag v-else-if="record.operatorType === 0" class="status-tag-reject" size="small">
                            已拒绝
                          </a-tag>
                          <a-tag v-else-if="record.operatorType === 2" color="arcoblue" size="small">
                            已转交
                          </a-tag>
                          <a-tag class="status-tag-urgent" v-if="record.priority == 2" size="small">
                            加急
                          </a-tag>
                          <a-tag color="green" size="small" v-if="record.autoOption">
                            {{
                              "自动审批-" + getAutoOptionLabel(record.autoOption)
                            }}
                          </a-tag>
                          <a-tag class="green-color" v-if="record.isFillTask" size="small">
                            填报任务
                          </a-tag>
                        </div>
                      </div>
                      <div class="flow-item-fields" v-if="record.fieldInfos && record.fieldInfos.length > 0">
                        <span class="flow-item-field-tag" v-for="(field, idx) in record.fieldInfos" :key="idx">
                          {{ field.fieldName }}：{{ field.fieldValue }}
                        </span>
                      </div>
                      <div class="flow-item-info">
                        <span class="flow-item-info-item">
                          <i class="fas fa-user"></i>
                          处理人：{{ record.operatorNickname }}
                        </span>
                        <span class="flow-item-info-item">
                          <i class="fas fa-clock"></i>
                          处理：{{ record.handlerTime }}
                        </span>
                        <span class="flow-item-info-item" v-if="record.operatorType === 1">
                          <i class="fas fa-check green-color"></i>
                          结果：{{ record.passButtonLabel }}
                        </span>
                        <span class="flow-item-info-item" v-if="record.operatorType === 3">
                          <i class="fas fa-times orange-color"></i>
                          结果：{{ record.backButtonLabel }}
                        </span>
                        <span class="flow-item-info-item" v-if="record.operatorType === 0">
                          <i class="fas fa-times red-color"></i>
                          结果：{{ record.refuseButtonLabel }}
                        </span>
                        <span class="flow-item-info-item" v-if="record.operatorType === 2">
                          <i class="fas fa-share blue-color"></i>
                          结果：：{{ record.delegateButtonLabel }}
                        </span>
                        <!-- <span class="flow-item-info-item" v-if="record.refuseReason && record.operatorType === 3">
                        <i class="fas fa-exclamation-circle orange-color"></i>
                        退回原因：{{ record.refuseReason }}
                      </span> -->
                      </div>
                    </div>
                    <div class="flow-item-actions">
                      <button class="btn-ghost" @click="handClick(record, 'handler')">查看</button>
                    </div>
                  </div>
                </template>
              </wrapperTable>
            </a-tab-pane>
            <a-tab-pane key="3">
              <template #title>
                <span class="wb-tab-title">
                  抄送我的
                  <span class="wb-tab-badge">{{ workbenchCount.noticeCount }}</span>
                </span>
              </template>
              <wrapperTable :activeTab="activeTab" :embedded="embedded" ref="noticeRef"
                :get-app-options="getNoticeAppsApi" :get-table-data="noticeRecordApi" classify="notice"
                @getDataNum="noticeCallBack">
                <template #record="{ record, rowIndex }">
                  <div class="flow-item" :class="{ 'is-read': record.states == 0 }">
                    <div :class="['flow-item-avatar', getAvatarColor(rowIndex)]">
                      {{ record.startNickname ? record.startNickname.charAt(0) : '我' }}
                    </div>
                    <div class="flow-item-content">
                      <div class="flow-item-header">
                        <span class="flow-item-title">{{ record.noticeTitle }}</span>
                        <div class="flow-item-tags">
                          <a-tag v-if="record.states == 1" color="arcoblue" size="small">
                            未读
                          </a-tag>
                          <a-tag v-if="record.states == 0" size="small"> 已读 </a-tag>
                        </div>
                      </div>
                      <div class="flow-item-fields" v-if="record.fieldInfos && record.fieldInfos.length > 0">
                        <span class="flow-item-field-tag" v-for="(field, idx) in record.fieldInfos" :key="idx">
                          {{ field.fieldName }}：{{ field.fieldValue }}
                        </span>
                      </div>
                      <div class="flow-item-info">
                        <span class="flow-item-info-item">
                          <i class="fas fa-clock"></i>
                          申请人：{{ record.startNickname }}
                        </span>
                        <span class="flow-item-info-item">
                          <i class="fas fa-clock"></i>
                          抄送：{{ record.arriveTime }}
                        </span>
                      </div>
                    </div>
                    <div class="flow-item-actions">
                      <button class="btn-ghost" @click="handClick(record, 'notice')">查看</button>
                    </div>
                  </div>
                </template>
              </wrapperTable>
            </a-tab-pane>
          </a-tabs>
        </div>
      </div>
    </div>

  </div>
</template>
<script setup lang="ts">
import {
  getApplyApps as getApplyAppsApi,
  applyRecord as applyRecordApi,
  applyWorkbench,
  getWorkbenchCount as getWorkbenchCountApi,
  getPendingApps as getPendingAppsApi,
  getHandlerApps as getHandlerAppsApi,
  handlerRecord as handlerRecordApi,
  getNoticeApps as getNoticeAppsApi,
  noticeRecord as noticeRecordApi,
  pendingRecord as pendingRecordApi,
  executionCandidates,
  readNotice,
  urgentApply
} from "@/api/workbench/index";
import { onMounted, ref, reactive, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Message } from "@arco-design/web-vue";
import wrapperTable from "./wrapperTable.vue";
import HomeBanner from "@/components/banner/homeBanner.vue";
import { navigateReapplyFlow, normalizeReapplyFormData } from "@/utils/reapplyFlow";
const props = defineProps<{
  embedded?: boolean;
  tabId?: string | number;
  counts?: {
    fillCount: number;
    applyCount: number;
    pendingCount: number;
    handledCount: number;
    noticeCount: number;
  };
}>();
const route = useRoute();
const router = useRouter();
const VALID_TABS = new Set(["0", "1", "2", "3"]);

const normalizeTab = (tab: unknown) => {
  if (Array.isArray(tab)) {
    return normalizeTab(tab[0]);
  }
  const value = String(tab ?? "");
  return VALID_TABS.has(value) ? value : "0";
};

const resolveInitialTab = (): string => {
  if (props.embedded && props.tabId !== undefined && props.tabId !== null && String(props.tabId) !== "") {
    return normalizeTab(props.tabId);
  }
  return normalizeTab(route.query.tab ?? localStorage.getItem("activeTab"));
};

const activeTab = ref(resolveInitialTab());

const workbenchCount = reactive({
  fillCount: props.counts?.fillCount ?? 0,
  applyCount: props.counts?.applyCount ?? 0,
  pendingCount: props.counts?.pendingCount ?? 0,
  handledCount: props.counts?.handledCount ?? 0,
  noticeCount: props.counts?.noticeCount ?? 0,
});

const pendingRef = ref();
const applyRef = ref();
const handlerRef = ref();
const noticeRef = ref();
const urgentLoading = ref(false);

// 缓存执行候选人数据，key: processInstanceId_executionId
const executionCandidatesData = reactive<Record<string, any[]>>({});

// 异步加载执行候选人并缓存
const loadCandidatesForRuntime = async (processInstanceId: string, executionId: string) => {
  if (!processInstanceId || !executionId) return;
  const key = `${processInstanceId}_${executionId}`;
  if (executionCandidatesData[key] !== undefined) return;

  try {
    const res = await executionCandidates(processInstanceId, executionId);
    if (res && Array.isArray(res)) {
      executionCandidatesData[key] = res;
    } else {
      executionCandidatesData[key] = [];
    }
  } catch (e) {
    console.error('获取执行候选人失败:', e);
    executionCandidatesData[key] = [];
  }
};

// 获取记录中当前审批人的 nickname 展示文本
const getCurrentNicknames = (record: any): string => {
  if (!record.currentRuntimes || !Array.isArray(record.currentRuntimes)) return '';

  const nicknames: string[] = [];
  for (const runtime of record.currentRuntimes) {
    if (!runtime.executionId) continue;
    const key = `${record.processInstanceId}_${runtime.executionId}`;
    const candidates = executionCandidatesData[key];

    // 未缓存时触发异步加载
    if (candidates === undefined) {
      loadCandidatesForRuntime(record.processInstanceId, runtime.executionId);
      continue;
    }

    if (candidates.length > 0) {
      nicknames.push(...candidates.map((c: any) => c.nickname || c.username));
    }
  }

  return nicknames.join('、');
};

// 获取头像颜色类 - 根据序号随机生成颜色
const getAvatarColor = (index: number) => {
  const colors = ['gradient-red', 'gradient-blue', 'gradient-green', 'gradient-purple'];
  return colors[index % 4];
};

function handClick(item: any, classify: string) {
  if (classify == 'notice') {
    readNotice(item.noticeId).then(() => {

    });
    router.push({ name: "toDoCenterDes", query: { id: item.executionId, processInstanceId: item.processInstanceId, taskId: item.taskId, taskType: item.taskType, priority: item.priority, classify: classify } });
  } else {
    router.push({ name: "toDoCenterDes", query: { id: item.processInstanceId, taskId: item.taskId, taskType: item.taskType, priority: item.priority, classify: classify, finishState: item.finishState ? item.finishState : 1 } });
  }

}
// 催办
const handleUrgent = (record: any) => {
  if (urgentLoading.value) {
    Message.warning('正在进行其他操作，请稍后再试')
    return
  }

  urgentLoading.value = true
  const params = {
    processInstanceId: record.processInstanceId
  }
  urgentApply(params).then(res => {
    Message.success('催办成功')
    urgentLoading.value = false
    // 刷新列表
    if (applyRef.value) {
      applyRef.value.initialize()
    }
  }).catch(() => {
    urgentLoading.value = false
  })
};

// 重新发起
const handleReApply = async (record: any) => {
  const id = record.processInstanceId || record.id
  let formData

  if (id) {
    try {
      const res = await applyWorkbench(id)
      if (res && res.formData) {
        // 确保存入的是 Object 格式，避免双重编码导致目标页解析失败
        formData = normalizeReapplyFormData(res.formData)
      }
    } catch (e) {
      console.warn('获取重新申请数据失败:', e)
    }
  }

  if (record.appId && id) {
    try {
      await navigateReapplyFlow({
        router,
        processInstanceId: id,
        appId: record.appId,
        formData,
      })
    } catch (e) {

    }
  } else {
    // console.warn('重新发起失败：缺少 appId')
  }
}

// 处理鼠标移入事件 - 暂时不用，保留以备后用
// const handleMouseOver = async (record: any, item: any) => {
//   currentData.value = [];
//   try {
//     if (!record.processInstanceId || !item.executionId) {
//       return;
//     }
//     const res = await executionCandidates(record.processInstanceId, item.executionId);
//     if (res) {
//       currentData.value = res;
//     }
//   } catch (error) {
//     console.error('获取流程节点执行候选人失败:', error);
//   }
// };

const tabHandlerStrategy = {
  "0": function () {
    pendingRef.value.initialize();
  },
  "1": function () {
    applyRef.value.initialize();
  },
  "2": function () {
    handlerRef.value.initialize();
  },
  "3": function () {
    noticeRef.value.initialize();
  },
};

const embedded = props.embedded ?? false;

onMounted(() => {
  activeTab.value = resolveInitialTab();
  tabHandler(activeTab.value);
});

watch(
  () => props.tabId,
  (v) => {
    if (!embedded) return;
    if (v === undefined || v === null || String(v) === "") return;
    tabHandler(String(v));
  },
);

const tabHandler = (tabId: string | number) => {
  const next = normalizeTab(tabId);
  activeTab.value = next;

  localStorage.setItem("activeTab", next);

  const safeFn = (tabHandlerStrategy as any)[next];
  if (typeof safeFn === "function") {
    safeFn();
  }
};

const showPending = (taskType: string) => {
  if (taskType == "input" || taskType == "start") {
    return "填写";
  } else if (taskType == "approve") {
    return "审批";
  }
  return "未知";
};

const getAutoOptionLabel = (autoOption: number | null) => {
  if (autoOption != null) {
    if (autoOption === 0) {
      return "与流程发起人一致";
    } else if (autoOption === 1) {
      return "审批人处理过该流程";
    } else if (autoOption === 2) {
      return "与上个节点审批人一致";
    }
  }
  // return "未知";
};

const getWorkbenchCount = () => {
  getWorkbenchCountApi().then((res2) => {
    workbenchCount.fillCount = res2.fillCount ?? 0;
    workbenchCount.applyCount = (res2.applyCount ?? 0);
    workbenchCount.pendingCount = res2.pendingCount ?? 0;
    workbenchCount.handledCount = (res2.handledCount ?? 0);
    workbenchCount.noticeCount = res2.noticeCount ?? 0;
  });
};
getWorkbenchCount();

const pendingCallBack = (pendingCount: any) => {
  workbenchCount.pendingCount = pendingCount;
};
const applyCallBack = (applyCount: any) => {
  workbenchCount.applyCount = applyCount;
};
const handlerCallBack = (handledCount: any) => {
  workbenchCount.handledCount = handledCount;
};
const noticeCallBack = (noticeCount: any) => {
  workbenchCount.noticeCount = noticeCount;
};

// 监听 props.counts 变化，同步更新 workbenchCount
watch(
  () => props.counts,
  (newCounts) => {
    if (newCounts) {
      workbenchCount.fillCount = newCounts.fillCount ?? 0;
      workbenchCount.applyCount = newCounts.applyCount ?? 0;
      workbenchCount.pendingCount = newCounts.pendingCount ?? 0;
      workbenchCount.handledCount = newCounts.handledCount ?? 0;
      workbenchCount.noticeCount = newCounts.noticeCount ?? 0;
    }
  },
  { deep: true }
);
</script>
<style lang="scss" scoped>
@use "../../styles/textColor.scss" as textColor;


.toDoCenter {
  &:not(.toDoCenter--embedded) {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f5f7fa;
  }

  &--embedded {
    .toDoCenter-body {
      padding: 0;
    }
  }

  // 页面标题模块
  .page-header {
    background: transparent;
    padding: 0;

    // 居中布局，最大宽度 1400px，兼容小屏幕
    max-width: 1400px;
    margin: 24px auto 0;

    .page-title {
      margin: 0 0 6px;
      font-size: 22px;
      font-weight: 700;
      color: #1d2129;
      line-height: 1.35;
    }

    .page-desc {
      margin: 0;
      font-size: 14px;
      line-height: 1.55;
      color: #86909c;
    }
  }

  &-body {
    padding: 24px;
    position: relative;
    overflow-y: auto;
    flex: 1;
    min-height: 0;

    // 居中布局，最大宽度 1400px，兼容小屏幕
    max-width: 1400px;
    margin: 0 auto;

    &:not(.toDoCenter-body--embedded) {
      height: auto;
    }

    &--embedded {
      height: 100%;
      padding: 0;
      flex: none;
    }

    &-tabs {
      background: #fff;
      border-radius: 20px;
      border: 1px solid #f1f5f9;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
      transition: all 0.3s;
      overflow: hidden;

      // 标签页头部样式
      :deep(.wb-tab-title) {
        display: flex;
        align-items: center;
        gap: 4px;
        line-height: 20px;
        font-size: 14px;

        &:hover {
          color: #334155;
        }
      }

      :deep(.wb-tab-badge) {
        display: inline-flex;
        align-items: center;
        margin-left: 0;
        justify-content: center;
        min-width: 12px;
        height: 20px;
        padding: 0 6px;
        background: rgb(243, 244, 246);
        color: #64748b;
        border-radius: 10px;
        font-size: 12px;
        font-weight: 600;
        line-height: 1;
      }

      // 选中状态的徽章
      :deep(.arco-tabs-tab-active) .wb-tab-badge {
        background: rgba(59, 130, 246, 0.15);
        // color: rgb(var(--primary-6));
      }

      // 标签页导航容器
      :deep(.arco-tabs-nav) {
        padding: 20px 24px 8px;
        border: 0;
        background: #fff;
        margin: 0;
      }

      // 单个标签
      :deep(.arco-tabs-tab) {
        padding: 8px 16px;
        margin: 0 4px;
        font-size: 14px;
        font-weight: 400;
        cursor: pointer;
        color: #64748b;
        transition: all 0.2s;
        border-radius: 12px;
        background: transparent;

        &:hover {
          color: #334155;
        }
      }

      // 选中的标签
      :deep(.arco-tabs-tab-active) {
        color: rgb(var(--primary-6));
        background: #eff6ff;
        font-weight: 500;

        .arco-tabs-tab-title {
          color: rgb(var(--primary-6));
        }
      }

      // 隐藏底部线条
      :deep(.arco-tabs-nav-ink) {
        display: none;
      }

      :deep(.arco-tabs-content) {
        padding: 0;
      }

      :deep(.arco-tabs-pane) {
        padding: 0;
      }
    }

    .leader-title {
      display: flex;
      margin-bottom: 20px;
      align-items: center;
      justify-content: space-between;
    }

    .page-bottom {
      display: flex;
      align-items: center;
      margin-top: 16px;
      justify-content: flex-end;
    }


  }

  // 流程列表项样式 - 全新设计
  .flow-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 24px;
    transition: all 0.2s;
    border-bottom: 1px solid #f8fafc;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: #f8fafc;

      .flow-item-title {
        color: textColor.$ThemeTextColor;
      }
    }

    &.is-read {
      opacity: 0.7;
    }
  }

  .flow-item-avatar {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 16px;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

    &.gradient-red {
      background: linear-gradient(135deg, #f87171 0%, #dc2626 100%);
    }

    &.gradient-blue {
      background: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%);
    }

    &.gradient-green {
      background: linear-gradient(135deg, #4ade80 0%, #059669 100%);
    }

    &.gradient-purple {
      background: linear-gradient(135deg, #c084fc 0%, #9333ea 100%);
    }
  }

  .flow-item-content {
    flex: 1;
    min-width: 0;
  }

  .flow-item-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    flex-wrap: wrap;
  }

  .flow-item-title {
    font-weight: 600;
    color: rgba(0, 0, 0, 0.9);
    font-size: 15px;
    transition: color 0.2s;
    // flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .flow-item-tags {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  .flow-item-info {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    font-size: 12px;
    color: #94a3b8;
  }

  .flow-item-fields {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 6px;
  }

  .flow-item-field-tag {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    // border: 1px solid #f1f5f9;
    border-radius: 6px;
    font-size: 11px;
    background: #f1f5f9;
    color: #475569;
  }

  .more-tag {
    background: #eff6ff;
    border-color: #dbeafe;
    color: #2563eb;
  }

  .flow-item-info-item {
    display: flex;
    align-items: center;
    gap: 4px;

    i {
      font-size: 11px;
      color: #cbd5e1;
    }
  }

  .flow-item-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  // 按钮样式 - 参考工作台.html
  .btn-primary {
    padding: 8px 18px;
    background: linear-gradient(135deg, rgb(var(--primary-6)), #6366f1);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.25);

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
    }
  }

  .btn-ghost {
    padding: 8px 16px;
    background: transparent;
    color: #64748b;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
      color: #334155;
    }
  }

  .btn-urgent {
    color: #f59e0b;
    border-color: #fbbf24;

    &:hover {
      background: #fef3c7;
      border-color: #f59e0b;
      color: #d97706;
    }
  }

  .btn-primary {
    padding: 8px 16px;
    background: linear-gradient(135deg, rgb(var(--primary-6)), #6366f1);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);

    &:hover {
      background: linear-gradient(135deg, #2563eb, #4f46e5);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  }
}

:deep(.arco-tabs-tab-title::before) {
  display: none;
}

.toDoCenterbody {
  height: calc(100vh - 77px);
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
}

// 低分辨率屏幕响应式优化 - 参照 doCenterDes 的实现逻辑
@media (max-width: 1400px) {
  .toDoCenter {
    &-body {
      max-width: 100%;
      padding: 20px;
    }

    .page-header {
      max-width: 100%;
      padding: 0 16px;
    }
  }
}

@media (max-width: 1200px) {
  .toDoCenter {
    &-body {
      padding: 16px;

      &-tabs {
        border-radius: 16px;

        :deep(.arco-tabs-nav) {
          padding: 16px 20px 8px;
          overflow-x: auto;

          // 防止标签过多时遮挡
          .arco-tabs-nav-list {
            flex-wrap: nowrap;
          }
        }

        :deep(.arco-tabs-tab) {
          padding: 6px 14px;
          font-size: 13px;
          white-space: nowrap;
        }
      }

      // 流程列表项在小屏下的优化
      .flow-item {
        padding: 14px 16px;
        gap: 12px;

        .flow-item-avatar {
          width: 40px;
          height: 40px;
          font-size: 14px;
        }

        .flow-item-content {
          min-width: 0;
          flex: 1;
        }

        .flow-item-header {
          flex-wrap: wrap;
          gap: 6px;
        }

        .flow-item-title {
          font-size: 14px;
        }

        .flow-item-info {
          gap: 12px;
          font-size: 11px;
        }

        .flow-item-actions {
          button {
            padding: 6px 14px;
            font-size: 12px;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .toDoCenter {
    .page-header {
      margin: 16px auto 0;
      padding: 0 8px;

      .page-title {
        font-size: 20px;
      }

      .page-desc {
        font-size: 13px;
      }
    }

    &-body {
      padding: 12px;
      overflow-x: hidden;

      &-tabs {
        border-radius: 12px;

        :deep(.arco-tabs-nav) {
          padding: 12px 12px 8px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;

          // 确保标签可以横向滚动
          &::-webkit-scrollbar {
            height: 4px;
          }

          &::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 2px;
          }
        }

        :deep(.arco-tabs-tab) {
          padding: 6px 10px;
          font-size: 12px;
          margin: 0 2px;
        }

        :deep(.wb-tab-badge) {
          min-width: 10px;
          height: 18px;
          padding: 0 4px;
          font-size: 10px;
        }
      }

      .flow-item {
        padding: 12px;
        gap: 10px;
        flex-wrap: wrap;

        .flow-item-avatar {
          width: 36px;
          height: 36px;
          font-size: 13px;
          border-radius: 10px;
        }

        .flow-item-content {
          flex: 1 1 calc(100% - 46px);
          min-width: 0;
        }

        .flow-item-actions {
          width: 100%;
          justify-content: flex-end;
          margin-top: 8px;

          button {
            padding: 7px 12px;
            font-size: 12px;
          }
        }

        .flow-item-header {
          margin-bottom: 6px;
        }

        .flow-item-title {
          font-size: 13px;
          white-space: normal;
          line-height: 1.4;
        }

        .flow-item-tags {
          flex-wrap: wrap;
        }

        .flow-item-info {
          flex-wrap: wrap;
          gap: 8px;
          font-size: 11px;
        }
      }

      // 按钮样式调整
      .btn-primary,
      .btn-ghost {
        padding: 7px 14px;
        font-size: 12px;
        border-radius: 10px;
      }
    }
  }
}

@media (max-width: 480px) {
  .toDoCenter {
    .page-header {
      margin: 12px auto 0;

      .page-title {
        font-size: 18px;
      }

      .page-desc {
        font-size: 12px;
      }
    }

    &-body {
      padding: 8px;

      &-tabs {
        border-radius: 8px;

        :deep(.arco-tabs-nav) {
          padding: 8px 8px 6px;
        }

        :deep(.arco-tabs-tab) {
          padding: 4px 8px;
          font-size: 11px;
        }
      }

      .flow-item {
        padding: 10px;
        gap: 8px;
        flex-direction: column;
        align-items: flex-start;

        .flow-item-avatar {
          width: 32px;
          height: 32px;
          font-size: 12px;
        }

        .flow-item-content {
          width: 100%;
          flex: none;
        }

        .flow-item-title {
          font-size: 12px;
        }

        .flow-item-info {
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
          font-size: 10px;

          i {
            font-size: 10px;
          }
        }

        .flow-item-actions {
          width: 100%;
          gap: 8px;

          button {
            flex: 1;
            padding: 8px 10px;
            font-size: 11px;
          }
        }
      }

      // 按钮样式调整
      .btn-primary,
      .btn-ghost {
        padding: 6px 12px;
        font-size: 11px;
        border-radius: 8px;
      }
    }
  }
}
</style>
<style lang="scss">
@use "../../styles/textColor.scss" as textColor;

.toDoCenter {
  &-body {
    &-tabs {

      // 标签样式
      .arco-tag {
        border-radius: 20px;
        font-size: 11px;
        font-weight: 600;
        padding: 2px 10px;
      }

      // 流程失败标签样式
      .status-tag-fail {
        background-color: #fef2f2 !important;
        color: #dc2626 !important;
        border: none !important;
      }

      // 已驳回标签样式 (operatorType === 3)
      .status-tag-back {
        background-color: #fef2f2 !important;
        color: #dc2626 !important;
        border: none !important;
      }

      // 已拒绝标签样式 (operatorType === 0)
      .status-tag-reject {
        background-color: #fff7ed !important;
        color: #c2410c !important;
        border: none !important;
      }

      // 加急标签样式
      .status-tag-urgent {
        background-color: #fef2f2 !important;
        color: #ef4444 !important;
        border: none !important;
      }


    }
  }
}

.red-color {
  color: rgb(248, 113, 113) !important;
}

.green-color {
  color: rgb(34, 197, 94) !important;
}

.orange-color {
  color: rgb(251, 146, 60) !important;
}

.blue-color {
  color: rgb(59, 130, 246) !important;
}
</style>
