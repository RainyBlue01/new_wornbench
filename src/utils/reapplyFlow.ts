import type { Router } from 'vue-router'
import { checkResetTaskDetail } from '@/api/taskFillCenter'

export const REAPPLY_FORM_DATA_STORAGE_KEY = 'reapply_form_data'
export const REAPPLY_FILL_TASK_DETAIL_STORAGE_KEY = 'reapply_fill_task_detail'

const parseMaybeJson = (value: any) => {
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

export const normalizeReapplyFormData = (value: any) => parseMaybeJson(value)

export const setReapplyFormData = (formData: any) => {
  const normalized = normalizeReapplyFormData(formData)
  if (!normalized || typeof normalized !== 'object' || !Object.keys(normalized).length) return
  sessionStorage.setItem(REAPPLY_FORM_DATA_STORAGE_KEY, JSON.stringify(normalized))
}

const getResultPayload = (value: any) => {
  const parsed = parseMaybeJson(value)
  if (Array.isArray(parsed)) return parsed[0]
  return parsed
}

const hasResetTaskDetail = (value: any) => {
  const payload = getResultPayload(value)
  if (Array.isArray(value)) return value.length > 0
  if (payload && typeof payload === 'object') return Object.keys(payload).length > 0
  return Boolean(payload)
}

const firstDefined = (...values: any[]) =>
  values.find((value) => value !== undefined && value !== null && value !== '')

const buildTaskFillQuery = (detail: any, appId?: string | number) => {
  const query = {
    taskId: firstDefined(detail?.taskId, detail?.fillTaskId, detail?.task?.id),
    batchId: firstDefined(detail?.batchId, detail?.fillBatchId, detail?.batch?.id),
    taskName: firstDefined(detail?.taskName, detail?.name, detail?.batchName),
    appIcon: detail?.appIcon,
    appId: firstDefined(detail?.appId, appId),
  }
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  )
}

export const navigateReapplyFlow = async ({
  router,
  processInstanceId,
  appId,
  formData,
}: {
  router: Router
  processInstanceId: string | number
  appId?: string | number
  formData?: any
}) => {
  setReapplyFormData(formData)

  const resetTaskDetailResult = await checkResetTaskDetail(processInstanceId)
  if (hasResetTaskDetail(resetTaskDetailResult)) {
    const detail = getResultPayload(resetTaskDetailResult)
    sessionStorage.setItem(REAPPLY_FILL_TASK_DETAIL_STORAGE_KEY, JSON.stringify(detail))
    await router.push({
      name: 'taskFillCenter',
      query: buildTaskFillQuery(detail, appId),
    })
    return
  }

  await router.push({
    name: 'visitor',
    query: { id: appId, reapply: '1' },
  })
}
