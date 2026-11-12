const TASK_ALREADY_HANDLED_MESSAGE = '任务已被处理'

const getErrorMessages = (error: unknown): unknown[] => {
  if (!error || typeof error !== 'object') return [error]

  const value = error as {
    message?: unknown
    data?: { message?: unknown } | unknown
    response?: { data?: { message?: unknown } | unknown }
  }

  const data = value.data && typeof value.data === 'object'
    ? (value.data as { message?: unknown }).message
    : value.data
  const responseData = value.response?.data && typeof value.response.data === 'object'
    ? (value.response.data as { message?: unknown }).message
    : value.response?.data

  return [value.message, data, responseData]
}

export const isTaskAlreadyHandledError = (error: unknown) =>
  getErrorMessages(error).some(
    message => typeof message === 'string' && message.includes(TASK_ALREADY_HANDLED_MESSAGE),
  )
