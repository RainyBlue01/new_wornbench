import { describe, expect, it } from 'vitest'
import { isTaskAlreadyHandledError } from './taskOperationError'

describe('task operation error', () => {
  it('recognizes handled-task messages from supported error shapes', () => {
    expect(isTaskAlreadyHandledError('任务已被处理')).toBe(true)
    expect(isTaskAlreadyHandledError(new Error('任务已被处理，请刷新'))).toBe(true)
    expect(isTaskAlreadyHandledError({ data: { message: '任务已被处理' } })).toBe(true)
    expect(isTaskAlreadyHandledError({ response: { data: { message: '任务已被处理' } } })).toBe(true)
  })

  it('ignores unrelated errors', () => {
    expect(isTaskAlreadyHandledError('网络错误')).toBe(false)
    expect(isTaskAlreadyHandledError(undefined)).toBe(false)
  })
})
