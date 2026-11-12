import { describe, expect, it, vi } from 'vitest'
import { restoreFormConditionValue, serializeFormDesignLogicValues } from './formConditionValue'
import field from './field'

const { put } = vi.hoisted(() => ({ put: vi.fn().mockResolvedValue({}) }))
vi.mock('@/utils/request', () => ({
  Request: class { put = put },
}))
import { designApp, formDesign } from '../api/form/index'

describe('formLogics design values', () => {
  it.each(['IN', 'NOT_IN'])('saves %s as a comma string without mutating the source', (condition) => {
    const config = {
      formLogics: [{ logicConditions: [
        { fileCode: 'f1', condition, value: ['a', 'b'], default: [{ label: 'A', value: 'a' }] },
        { condition: 'BETWEEN', value: [1, 2] },
        { condition: 'EQ', value: ['c'] },
      ] }],
      formList: [{ props: { options: ['a', 'b'], value: ['a'] } }],
    }
    const input = { formConfig: JSON.stringify(config), processId: 'p1' }
    const before = structuredClone(input)
    const result = serializeFormDesignLogicValues(input)
    const saved = JSON.parse(result.formConfig)
    expect(saved.formLogics[0].logicConditions[0].value).toBe('a,b')
    expect(saved.formLogics[0].logicConditions[0].default).toEqual([{ label: 'A', value: 'a' }])
    expect(saved.formLogics[0].logicConditions.slice(1)).toEqual(config.formLogics[0].logicConditions.slice(1))
    expect(saved.formList).toEqual(config.formList)
    expect(result.processId).toBe('p1')
    expect(input).toEqual(before)
  })

  it('preserves strings and serializes empty membership arrays', () => {
    const result = serializeFormDesignLogicValues({ formConfig: JSON.stringify({
      formLogics: [{ logicConditions: [
        { condition: 'IN', value: 'a,b' },
        { condition: 'NOT_IN', value: [] },
      ] }],
    }) })
    expect(JSON.parse(result.formConfig).formLogics[0].logicConditions.map((item: any) => item.value))
      .toEqual(['a,b', ''])
  })

  it('restores typed option values for editing and supports legacy arrays', () => {
    expect(restoreFormConditionValue('IN', 'true,false,0', [
      { value: true }, { value: false }, { value: 0 },
    ])).toEqual([true, false, 0])
    expect(restoreFormConditionValue('NOT_IN', '')).toEqual([])
    const legacy = ['a', 'b']
    expect(restoreFormConditionValue('IN', legacy)).toBe(legacy)
    expect(restoreFormConditionValue('EQ', 'a,b')).toBe('a,b')
  })

  it.each([
    ['IN', 'in', true],
    ['NOT_IN', 'notIn', false],
  ])('keeps %s visibility checks working after saving strings', (condition, symbol, expected) => {
    const config = restoreFormConditionValue(condition as string, 'a,b')
    expect(field.getMolde({ symbol, extra: { config, input: 'b' } })).toBe(expected)
    expect(field.getMolde({ symbol, extra: { config, input: 'x' } })).toBe(!expected)
  })

  it.each([designApp, formDesign])('normalizes the actual design API payload', async (save) => {
    await save({ formConfig: JSON.stringify({
      formLogics: [{ logicConditions: [{ condition: 'IN', value: ['a', 'b'] }] }],
    }) }, 'app1')
    const payload = put.mock.calls.at(-1)![1]
    expect(JSON.parse(payload.formConfig).formLogics[0].logicConditions[0].value).toBe('a,b')
  })

  it('does not change unrelated or invalid design payloads', () => {
    for (const input of [{ processConfig: '{}' }, { formConfig: '{}' }, { formConfig: '{' }]) {
      expect(serializeFormDesignLogicValues(input)).toBe(input)
    }
  })
})
