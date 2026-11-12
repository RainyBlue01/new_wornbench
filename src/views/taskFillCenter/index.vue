<template>
  <div class="tfc-page">
    <UserBanner url="/homepage" title="立即填报">
      <template #center>
        <a-dropdown v-if="allTaskList.length" trigger="click" class="tfc-page" position="bottom"
          :popup-max-height="340">
          <button type="button" class="tfc-batch-trigger">
            <span>{{ route?.query?.taskName || '选择填报批次' }}</span>
            <icon-down class="tfc-batch-trigger__chevron" />
          </button>
          <template #content>
            <div class="tfc-batch-panel">
              <div class="tfc-batch-panel__header">选择填报批次</div>
              <div class="tfc-batch-list">
                <div v-for="item in allTaskList" :key="item.batchId" :class="[
                  'tfc-batch-item',
                  { 'tfc-batch-item--active': activeTask?.batchId === item.batchId },
                ]" @click="setActiveTask(item)">
                  <div :class="[
                    'tfc-batch-item__icon',
                    item.batchState === 1 ? 'tfc-batch-item__icon--active' : 'tfc-batch-item__icon--done',
                  ]">
                    <i :class="item.batchState === 1 ? 'fas fa-pen' : 'fas fa-check'" aria-hidden="true" />
                  </div>
                  <div class="tfc-batch-item__body">
                    <p class="tfc-batch-item__title">批次 #{{ item.batchDate || item.batchId }}</p>
                    <p class="tfc-batch-item__meta">
                      填报时间：{{ item.fillStartTime }} 至 {{ item.fillStopTime }} ·
                      {{ item.batchState === 1 ? '进行中' : '已结束' }}
                    </p>
                  </div>
                  <span :class="[
                    'tfc-batch-item__status',
                    item.batchState === 1 ? 'tfc-batch-item__status--active' : 'tfc-batch-item__status--done',
                  ]">
                    {{ item.batchState === 1 ? '进行中' : '已结束' }}
                  </span>
                </div>
              </div>
            </div>
          </template>
        </a-dropdown>
      </template>
    </UserBanner>
    <div class="tfc-content" :style="showBottomBar ? '' : 'height: calc(100vh - 65px)'">
      <div class="tfc-main" :style="contentWidthStyle">
        <div v-if="dataLoading && !allTaskList.length" class="tfc-loading">
          <a-spin />
        </div>

        <template v-else-if="allTaskList.length && activeTask?.batchId">
          <div v-if="showRejectNotice && !rejectDismissed" class="tfc-reject-card">
            <div class="tfc-reject-card__icon">
              <i class="fas fa-exclamation-triangle" aria-hidden="true" />
            </div>
            <div class="tfc-reject-card__body">
              <p class="tfc-reject-card__title">填报数据已被打回，请重新填报</p>
              <p class="tfc-reject-card__desc">打回原因：{{ rejectReasonText }}</p>
            </div>
            <button type="button" class="tfc-reject-card__dismiss" @click="dismissRejectNotice">
              知道了
            </button>
          </div>

          <div class="tfc-task-card">
            <div class="tfc-task-card__header">
              <div class="tfc-task-card__icon">
                <img v-if="activeTask?.showIcon" :src="activeTask.showIcon" alt="icon" />
                <img v-else-if="route?.query?.appIcon" :src="win.api.dowUrl + route.query.appIcon + '&token=' + token"
                  alt="icon" />
                <img v-else :src="placeholderIcon" alt="icon" />
              </div>
              <div class="tfc-task-card__main">
                <div class="tfc-task-card__title-row">
                  <h2 class="tfc-task-card__title">
                    批次 #{{ activeTask.batchDate || activeTask.batchId }}
                  </h2>
                  <span :class="[
                    'tfc-task-card__status',
                    batchState === 1 ? 'tfc-task-card__status--active' : 'tfc-task-card__status--done',
                  ]">
                    {{ batchState === 1 ? '进行中' : '已结束' }}
                  </span>
                </div>
                <p class="tfc-task-card__meta">{{ taskMetaText }}</p>
              </div>
            </div>
            <div class="tfc-task-card__footer">
              <div class="tfc-task-card__footer-meta">
                <span>
                  <i class="fas fa-calendar-alt" aria-hidden="true" />
                  填报时间：{{ activeTask.fillStartTime }} 至 {{ activeTask.fillStopTime }}
                </span>
                <span v-if="remainingTime" class="tfc-task-card__remaining">
                  <i class="fas fa-clock" aria-hidden="true" />
                  <template v-if="remainingTime.type === 'days'">
                    剩余 {{ remainingTime.value }} 天
                  </template>
                  <template v-else-if="remainingTime.type === 'hours'">
                    剩余 {{ remainingTime.hours }}小时{{ remainingTime.minutes }}分钟
                  </template>
                </span>
                <span v-else-if="batchState === 0" class="tfc-task-card__remaining">已结束</span>
              </div>
            </div>
          </div>

          <fillContent ref="refFillContent" :active-task="activeTask" :task-state="batchState"
            @submit-success="refreshActiveTask" @reject-update="onRejectUpdate" />
        </template>

        <div v-else class="tfc-empty">
          <img src="@/assets/zanwuneirong@2x.png" alt="" />
          <p>当前无填报任务</p>
        </div>
      </div>
    </div>
    <div v-if="showBottomBar" class="tfc-bottom-bar">
      <div class="tfc-bottom-bar__inner" :style="contentWidthStyle">
        <!-- 审批进度 / 纠错记录 -->
        <!-- <div class="tfc-bottom-bar__left">
          <button v-show="activeTask?.category == 2 && activeTask?.processInstanceId" type="button"
            class="tfc-btn-ghost" @click="openTodoDes">
            <icon-eye />
            <span>审批进度</span>
          </button>
          <button v-show="[1, 2].includes(activeTask?.category)" type="button" class="tfc-btn-ghost"
            @click="openFixRecordDrawer">
            <icon-file />
            <span>纠错记录</span>
          </button>
        </div> -->
        <!-- 进行中：保存草稿 / 提交数据 -->
        <template v-if="batchState === 1 && activeTask?.states === 0 && activeTask?.resetFlag === null">
          <a-button class="tfc-btn-ghost" :loading="draftLoading" @click="handleSaveDraft">
            <icon-save /> 保存草稿
          </a-button>
          <a-button type="primary" class="tfc-btn-primary" :loading="submitLoading" @click="handleSubmitData">
            <icon-check /> 提交数据
          </a-button>
        </template>
        <!-- 已完成：纠错 / 打印 / 下载 / 重填 -->
        <template v-else>
          <a-button v-if="finishValidity === 2 || activeTask?.dataState === 2" type="button" class="tfc-btn-ghost"
            disabled>审批中</a-button>
          <template v-if="finishValidity === 1">
            <a-button type="button" class="tfc-btn-primary" @click="handleObjectRefill">纠错</a-button>
            <button type="button" class="tfc-btn-ghost" :disabled="finishDownloadLoading"
              @click="handlePrint">打印</button>
            <a-dropdown @select="handleDownload">
              <a-button type="button" class="tfc-btn-ghost" :disabled="finishDownloadLoading">
                下载 <icon-down />
              </a-button>
              <template #content>
                <a-doption :value="1">word</a-doption>
                <a-doption :value="2">pdf</a-doption>
              </template>
            </a-dropdown>
          </template>
          <a-button v-if="finishValidity === 0" type="button" class="tfc-btn-primary"
            @click="handleSubmitData">重填</a-button>
        </template>
      </div>
    </div>

    <FixRecord ref="refFixRecordDrawer" />
    <TodoDes ref="refTodoDes" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { CSSProperties } from 'vue'
import { useRoute } from 'vue-router'
import { fillBatchTaskPage } from '@/api/taskFillCenter'
import { getTaskListByTaskId } from '@/api/taskFillManager'
import { REAPPLY_FILL_TASK_DETAIL_STORAGE_KEY } from '@/utils/reapplyFlow'
import { IconEye, IconFile, IconSave, IconCheck, IconDown } from '@arco-design/web-vue/es/icon'
import UserBanner from '@/components/banner/userBanner.vue'
import TodoDes from '@/views/taskFillCenter/todoDes.vue'
import fillContent from '@/views/taskFillCenter/fillContent.vue'
import FixRecord from '@/views/taskFillCenter/fixRecord.vue'
import placeholderIcon from '@/assets/icon_zhanwei.svg'

const win = window as any;

interface FillTaskItem {
  batchId?: string | number
  batchDate?: string
  taskName?: string
  batchState?: number
  fillStartTime?: string
  fillStopTime?: string
  publisher?: { deptName?: string }[]
  supervisor?: { nickname?: string }[]
  category?: number
  processInstanceId?: string
  objectId?: string
  formId?: string
  appId?: string | number
  appIcon?: string
  taskId?: string | number
  showIcon?: string
}

const route = useRoute()
const token = localStorage.getItem('wornbench_token')
const refFillContent = ref<InstanceType<typeof fillContent> | null>(null)
const refTodoDes = ref<InstanceType<typeof TodoDes> | null>(null)
const refFixRecordDrawer = ref<InstanceType<typeof FixRecord> | null>(null)

const allTaskList = ref<FillTaskItem[]>([])
const dataLoading = ref(false)
const activeTask = ref<FillTaskItem>({} as FillTaskItem)
const rejectDismissed = ref(false)
const rejectInfo = ref({ show: false, reason: '' })

const batchState = computed(() => activeTask.value?.batchState ?? 1)

const taskMetaText = computed(() => {
  const dept = (activeTask.value?.publisher || []).map((_) => _.deptName).join('，')
  const supervisor = (activeTask.value?.supervisor || []).map((_) => _.nickname).join('，')
  const parts: string[] = []
  if (dept) parts.push(`发布部门：${dept}`)
  if (supervisor) parts.push(`监督：${supervisor}`)
  return parts.join('；') || '--'
})

const remainingTime = computed(() => {
  if (batchState.value !== 1 || !activeTask.value?.fillStopTime) return null
  const end = new Date(activeTask.value.fillStopTime.replace(/-/g, '/'))
  if (Number.isNaN(end.getTime())) return null
  const diffMs = end.getTime() - Date.now()
  if (diffMs <= 0) return { type: 'expired', value: 0 }

  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays > 1) {
    return { type: 'days', value: diffDays }
  } else {
    // 计算小时和分钟
    const totalMinutes = Math.floor(diffMs / (1000 * 60))
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return { type: 'hours', hours, minutes }
  }
})

const showRejectNotice = computed(() => activeTask.value?.resetFlag !== null && finishValidity.value === 0)

const rejectReasonText = computed(() => {
  return activeTask.value?.resetReason || '信息填写不完整，请补充完整后再提交'
})

const onRejectUpdate = (payload: { show: boolean; reason: string }) => {
  rejectInfo.value = payload
}

watch(
  () => activeTask.value?.batchId,
  () => {
    rejectDismissed.value = false
    rejectInfo.value = { show: false, reason: '' }
  },
)

const dismissRejectNotice = () => {
  rejectDismissed.value = true
}

const parseStoredResetTaskDetail = () => {
  const raw = sessionStorage.getItem(REAPPLY_FILL_TASK_DETAIL_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  } finally {
    sessionStorage.removeItem(REAPPLY_FILL_TASK_DETAIL_STORAGE_KEY)
  }
}

const normalizeResetTaskDetail = (detail: any): FillTaskItem => ({
  ...detail,
  taskId: detail?.taskId ?? detail?.fillTaskId ?? detail?.task?.id,
  batchId: detail?.batchId ?? detail?.fillBatchId ?? detail?.batch?.id,
  objectId: detail?.objectId ?? detail?.fillObjectId ?? detail?.object?.id,
  appId: detail?.appId ?? detail?.designInfo?.appId,
})

const loadAllTasks = async () => {
  dataLoading.value = true
  try {
    const resetTaskDetail = parseStoredResetTaskDetail()
    const resetTask = resetTaskDetail ? normalizeResetTaskDetail(resetTaskDetail) : null
    const taskId = (route.query.taskId || resetTask?.taskId) as string | undefined

    if (!taskId && resetTask?.appId && resetTask?.objectId) {
      resetTask.showIcon =
        resetTask.appIcon && resetTask.appIcon != null
          ? win.api.dowUrl +
          resetTask.appIcon +
          "&token=" +
          localStorage.getItem("wornbench_token")
          : "";
      allTaskList.value = [resetTask]
      setActiveTask(resetTask)
      return
    }

    if (!taskId) {
      allTaskList.value = []
      return
    }

    const res = await getTaskListByTaskId(taskId)
    // 处理应用图标，与首页保持一致
    res.map((v: any) => {
      v.showIcon =
        v.appIcon && v.appIcon != null
          ? win.api.dowUrl +
          v.appIcon +
          "&token=" +
          localStorage.getItem("wornbench_token")
          : "";
    });
    allTaskList.value = [...res]

    if (route.query.batchId || resetTask?.batchId || resetTask?.objectId) {
      setActiveTask(
        res.find((v) =>
          String(v.batchId) === String(route.query.batchId || resetTask?.batchId)
          || String(v.objectId) === String(resetTask?.objectId),
        ) || resetTask || res[0],
      )
    }

  } finally {
    dataLoading.value = false
  }
}

const setActiveTask = (val: FillTaskItem) => {
  activeTask.value = {} as FillTaskItem
  setTimeout(() => {
    activeTask.value = val
  })
}

const refreshActiveTask = async () => {
  try {
    const res = await getTaskListByTaskId(route.query.taskId as string)
    const updatedTask = res?.find(
      (item: FillTaskItem) => item.batchId === activeTask.value?.batchId,
    )
    if (updatedTask) {
      activeTask.value = updatedTask
      const idx = allTaskList.value.findIndex((t) => t.batchId === updatedTask.batchId)
      if (idx > -1) {
        allTaskList.value[idx] = updatedTask
      }
    } else {
      await loadAllTasks()
    }
  } catch (error) {
    console.error('刷新任务数据失败:', error)
  }
}

const openTodoDes = () => {
  const processConfigs = refFillContent.value?.getNodeData()
  refTodoDes.value?.openDrawer({ activeTask: activeTask.value, processConfig: processConfigs })
}

const openFixRecordDrawer = () => {
  refFixRecordDrawer.value?.openDrawer({
    objectId: activeTask.value.objectId,
    formId: activeTask.value.formId,
  })
}

const handleSaveDraft = () => {
  refFillContent.value?.submitForm?.(true)
}

const handleSubmitData = () => {
  refFillContent.value?.submitForm?.(false)
}

// ---- BtnFinish 底部栏：从 fillContent 读取状态 ----
const DEFAULT_CONTENT_WIDTH_STYLE: CSSProperties = { width: '768px' }
const lastContentWidthStyle = ref<CSSProperties>({ ...DEFAULT_CONTENT_WIDTH_STYLE })

const resolveContentWidthStyle = (formConfig: any): CSSProperties | null => {
  if (!formConfig?.width || !formConfig?.widthType) return null

  return {
    width: formConfig.widthType === 'fixed' ? `${formConfig.width}px` : `${formConfig.width}%`,
  }
}

watch(
  () => {
    const cf = refFillContent.value?.formConfs as any
    return resolveContentWidthStyle(cf)
  },
  (style) => {
    if (style) {
      lastContentWidthStyle.value = style
    }
  },
  { immediate: true },
)

const contentWidthStyle = computed(() => lastContentWidthStyle.value)

const showBottomBar = computed(() => {
  console.log(batchState.value)
  // if (activeTask?.value?.dataState === 0) return false
  if (!activeTask.value?.batchId) return false
  if (batchState.value === 1) return true
  return refFillContent.value?.BtnFinish ?? false
})

const finishValidity = computed(() => {
  return (activeTask.value)?.validity
})

const finishDownloadLoading = computed(() => {
  return refFillContent.value?.downloadLoading ?? false
})

const submitLoading = computed(() => {
  return refFillContent.value?.submitLoading ?? false
})

const draftLoading = computed(() => {
  return refFillContent.value?.draftLoading ?? false
})

const handleObjectRefill = () => {
  refFillContent.value?.handleObjectRefill()
}

const handlePrint = () => {
  refFillContent.value?.handPrint?.(2)
}

const handleDownload = (val: any) => {
  refFillContent.value?.handDowload?.(val)
}

onMounted(() => {
  loadAllTasks()
})
</script>

<style lang="scss" scoped>
@use '@/styles/task-fill-center.scss';
@use '@/styles/banner-subpage.scss';

.app-body {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.3s ease;
}
</style>
<style lang="scss">
.tfc-page {

  // 覆盖 Arco Design 下拉菜单默认样式
  .arco-dropdown {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    padding: 0 !important;
  }

}
</style>
