/**
 * 审批流转逻辑 Composable
 * 统一管理审批流程中的通过、拒绝、转交、退回、撤回、终止等操作
 */

import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import {
  approvePass,
  approveReject,
  approveBack,
  inputComplete,
  delegate,
  revokeApply,
  revokeHandler,
  terminateApply,
  urgentApply,
} from '@/api/workbench/index'
import type { FlowInfo } from '@/types/form'
import { navigateReapplyFlow } from '@/utils/reapplyFlow'

export interface ApprovalActions {
  /** 是否正在执行某个操作 */
  isOperating: boolean
  /** 操作类型 */
  currentOperation: string | null
}

export interface ApprovalParams {
  taskId?: string
  processInstanceId: string
  reason?: string
  signature?: string
  formData?: any
}

export function useApprovalFlow(flowInfo: any, route: any, router: any) {
  // Loading 状态
  const passLoading = ref(false)
  const refuseLoading = ref(false)
  const delegateLoading = ref(false)
  const backLoading = ref(false)
  const submitBtnLoading = ref(false)
  const returnLoading = ref(false)
  const urgentLoading = ref(false)
  const endFlowLoading = ref(false)
  const downloadLoading = ref(false)

  /**
   * 检查是否有操作正在进行
   */
  const isAnyOperating = computed(() => {
    return (
      passLoading.value ||
      refuseLoading.value ||
      delegateLoading.value ||
      backLoading.value ||
      submitBtnLoading.value ||
      returnLoading.value ||
      urgentLoading.value ||
      endFlowLoading.value ||
      downloadLoading.value
    )
  })

  /**
   * 重置所有 loading 状态
   */
  const resetLoading = () => {
    passLoading.value = false
    refuseLoading.value = false
    delegateLoading.value = false
    backLoading.value = false
    submitBtnLoading.value = false
    returnLoading.value = false
    urgentLoading.value = false
    endFlowLoading.value = false
    downloadLoading.value = false
  }

  const goToPendingCenter = () => {
    localStorage.setItem('activeTab', '0')
    router.push({
      name: 'toDoCenter',
      query: {
        tab: '0',
      },
    })
  }

  /**
   * 审批通过
   */
  const handleApprovePass = async (params: ApprovalParams) => {
    const api = route.query.taskType === 'approve' ? approvePass : inputComplete
    try {
      await api(params)
      Message.success('通过成功')
      router.go(-1)
      return true
    } catch {
      passLoading.value = false
      return false
    }
  }

  /**
   * 审批拒绝
   */
  const handleApproveReject = async (params: ApprovalParams) => {
    try {
      await approveReject(params)
      Message.success('拒绝成功')
      router.go(-1)
      return true
    } catch {
      refuseLoading.value = false
      return false
    }
  }

  /**
   * 审批退回
   */
  const handleApproveBack = async (params: ApprovalParams) => {
    try {
      await approveBack(params)
      Message.success('退回成功')
      router.go(-1)
      return true
    } catch {
      backLoading.value = false
      return false
    }
  }

  /**
   * 转交
   */
  const handleDelegate = async (userId: string, nickname: string) => {
    const params = {
      taskId: route.query.taskId,
      userId,
      nickname,
    }
    try {
      await delegate(params)
      Message.success('转交成功')
      delegateLoading.value = false
      router.go(-1)
      return true
    } catch {
      delegateLoading.value = false
      return false
    }
  }

  /**
   * 撤回（申请端走 apply/revoke，已办端走 handler/revoke）
   */
  const handleRevoke = async (getData: () => void, reason = '') => {
    if (isAnyOperating.value) {
      Message.warning('正在进行其他操作，请稍后再试')
      return false
    }

    const isHandlerRevoke =
      route.query.classify === 'handler' || flowInfo.value?.classify === 'handler'

    returnLoading.value = true
    try {
      if (isHandlerRevoke) {
        await revokeHandler({
          taskId: route.query.taskId as string,
          reason,
        })
        Message.success('撤回成功')
        returnLoading.value = false
        goToPendingCenter()
      } else {
        await revokeApply({
          processInstanceId: route.query.id,
        })
        Message.success('撤回成功')
        returnLoading.value = false
        goToPendingCenter()
      }
      return true
    } catch {
      returnLoading.value = false
      return false
    }
  }

  /**
   * 终止流程
   */
  const handleTerminate = async (getData: () => void) => {
    if (isAnyOperating.value) {
      Message.warning('正在进行其他操作，请稍后再试')
      return false
    }

    endFlowLoading.value = true
    try {
      await terminateApply({
        processInstanceId: route.query.id,
        reason: '',
      })
      Message.success('终止成功')
      endFlowLoading.value = false
      getData()
      return true
    } catch {
      endFlowLoading.value = false
      return false
    }
  }

  /**
   * 催办
   */
  const handleUrgent = async () => {
    if (isAnyOperating.value) {
      Message.warning('正在进行其他操作，请稍后再试')
      return false
    }

    urgentLoading.value = true
    try {
      await urgentApply({
        processInstanceId: route.query.id,
      })
      Message.success('催办成功')
      urgentLoading.value = false
      return true
    } catch {
      urgentLoading.value = false
      return false
    }
  }

  /**
   * 重新申请
   */
  const handleReApply = async (formData?: any) => {
    const processInstanceId = route.query.processInstanceId || route.query.id
    if (!processInstanceId || !flowInfo.value?.appId) {
      Message.warning('缺少重新发起参数')
      return

    }

    try {
      await navigateReapplyFlow({
        router,
        processInstanceId,
        appId: flowInfo.value.appId,
        formData,
      })
    } catch (e) {

    }
  }

  /**
   * 提交表单
   */
  const handleSubmitForm = async (val: number, formRef: any, form: any, formList: any[], getData: () => void) => {
    if (isAnyOperating.value) {
      Message.warning('正在进行其他操作，请稍后再试')
      return
    }

    try {
      const error = await formRef.value?.validate()
      if (!error) {
        const params = {
          taskId: route.query.taskId,
          processInstanceId: route.query.id,
          formData: form.value,
        }

        // 根据操作类型设置 loading
        const loadingMap: Record<number, { ref: any; api: any }> = {
          1: { ref: passLoading, api: route.query.taskType === 'approve' ? approvePass : inputComplete },
          2: { ref: refuseLoading, api: approveReject },
          3: { ref: delegateLoading, api: null },
          4: { ref: backLoading, api: approveBack },
        }

        const current = loadingMap[val]
        if (current?.ref) {
          current.ref.value = true
        }

        // 这里需要根据业务逻辑继续处理
        return params
      } else {
        // 重置 loading
        if (val === 1) passLoading.value = false
        if (val === 2) refuseLoading.value = false
        if (val === 3) delegateLoading.value = false
        if (val === 4) backLoading.value = false
      }
    } catch {
      // 重置 loading
      if (val === 1) passLoading.value = false
      if (val === 2) refuseLoading.value = false
      if (val === 3) delegateLoading.value = false
      if (val === 4) backLoading.value = false
    }
  }

  return {
    // Loading 状态
    passLoading,
    refuseLoading,
    delegateLoading,
    backLoading,
    submitBtnLoading,
    returnLoading,
    urgentLoading,
    endFlowLoading,
    downloadLoading,
    isAnyOperating,
    resetLoading,

    // 操作方法
    handleApprovePass,
    handleApproveReject,
    handleApproveBack,
    handleDelegate,
    handleRevoke,
    handleTerminate,
    handleUrgent,
    handleReApply,
    handleSubmitForm,
  }
}
