import { describe, expect, it } from 'vitest'
import { buildSwitchDisplayOptions, formatFlowConditionValue } from './flowConditionDisplay'

describe('formatFlowConditionValue', () => {
  it('translates switch values with the configured labels', () => {
    const options = [
      { label: '启用', value: 1 },
      { label: '停用', value: 0 },
    ]

    expect(formatFlowConditionValue({ inputType: 'SWITCH', value: 1, default: options })).toBe('启用')
    expect(formatFlowConditionValue({ inputType: 'SWITCH', value: [1, 0], default: options })).toBe('启用,停用')
  })

  it('falls back to readable switch labels for legacy boolean values', () => {
    expect(formatFlowConditionValue({ inputType: 'SWITCH', value: true })).toBe('开启')
    expect(formatFlowConditionValue({ inputType: 'SWITCH', value: 'false' })).toBe('关闭')
  })

  it('translates option and personnel values without changing their order', () => {
    expect(formatFlowConditionValue({
      inputType: 'SELECT_MULTIPLE',
      value: ['b', 'a'],
      default: [{ label: '选项A', value: 'a' }, { label: '选项B', value: 'b' }],
    })).toBe('选项B,选项A')

    expect(formatFlowConditionValue({
      inputType: 'USER_MULTIPLE',
      value: ['2', '1'],
      default: [{ id: '1', nickname: '张三' }, { id: '2', nickname: '李四' }],
    })).toBe('李四,张三')
  })
})

describe('buildSwitchDisplayOptions', () => {
  it('builds translated options from the current switch configuration', () => {
    expect(buildSwitchDisplayOptions({
      'checked-value': 1,
      'unchecked-value': 0,
      on: '是',
      off: '否',
    })).toEqual([
      { label: '是', value: 1 },
      { label: '否', value: 0 },
    ])
  })
})
