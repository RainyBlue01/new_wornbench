import { beforeEach, describe, expect, it, vi } from 'vitest'
import { serializeFormConditionValue } from './formConditionValue'
import { buildSelectFilterConditions, loadSelectFormOptions } from './formSelectOptions'
import { buildLinkageSubmitData, loadLinkageValue } from './formLinkage'
import { selectComponentDataApi, linkageComponentDataApi } from '@/api/original/index'

vi.mock('@/api/original/index', () => ({
  selectComponentDataApi: vi.fn().mockResolvedValue([]),
  linkageComponentDataApi: vi.fn().mockResolvedValue('linked value'),
}))

describe('form membership request values', () => {
  beforeEach(() => vi.clearAllMocks())

  it.each(['IN', 'NOT_IN'])('serializes %s arrays without changing source values', (symbol) => {
    const value = ['a', 'b', 0, false]
    expect(serializeFormConditionValue(symbol, value)).toBe('a,b,0,false')
    expect(value).toEqual(['a', 'b', 0, false])
    expect(serializeFormConditionValue(symbol, [])).toBe('')
    expect(serializeFormConditionValue(symbol, ['a'])).toBe('a')
    expect(serializeFormConditionValue(symbol, 'a,b')).toBe('a,b')
  })

  it.each(['EQ', 'NE', 'BETWEEN', 'LIKE', 'IS_NULL'])('preserves %s values', (symbol) => {
    const value = ['a', 'b']
    expect(serializeFormConditionValue(symbol, value)).toBe(value)
    expect(serializeFormConditionValue(symbol, null)).toBeNull()
  })

  it.each(['IN', 'NOT_IN'])('uses strings in select and linkage requests for %s', async (symbol) => {
    const conditions = [{ field: 'source', relationField: 'target', symbol, inputType: 'CHECKBOX' }]
    const form = { source: ['a', 'b'], unchanged: ['c'] }
    const before = structuredClone(form)
    const props = {
      dataSourceType: 2, conditionList: conditions,
      linkage: {
        enable: true, sourceFormCode: 'other-form', logicConditions: conditions,
        relationTrigger: { sourceFieldCode: 'target' },
      },
    }
    await loadSelectFormOptions({ id: 'select', props }, form, 'form1', true)
    expect(selectComponentDataApi).toHaveBeenCalledWith(expect.objectContaining({
      data: { source: 'a,b' },
      tempProps: expect.objectContaining({ conditionList: conditions }),
    }))
    expect(buildLinkageSubmitData(conditions, form)).toEqual({ source: 'a,b' })
    await loadLinkageValue({ id: 'linked', type: 'INPUT', props }, form, 'form1')
    expect(linkageComponentDataApi).toHaveBeenCalledWith(expect.objectContaining({
      data: { source: 'a,b' },
    }))
    expect(form.source).toEqual(before.source)
    expect(form.unchanged).toEqual(before.unchanged)
    expect(conditions[0].symbol).toBe(symbol)
  })

  it('keeps non-membership arrays and existing empty-value behavior', async () => {
    const form = { source: [1, 2], empty: [] }
    const conditions = [
      { field: 'source', relationField: 'target', symbol: 'BETWEEN' },
      { field: 'empty', relationField: 'target2', symbol: 'IN' },
    ]
    await loadSelectFormOptions({
      id: 'select', props: { dataSourceType: 2, conditionList: conditions },
    }, form, 'form1')
    expect(selectComponentDataApi).toHaveBeenCalledWith(expect.objectContaining({
      data: { source: [1, 2], empty: '' },
    }))
    expect(buildLinkageSubmitData(conditions, form)).toEqual({ source: [1, 2] })
    expect(form).toEqual({ source: [1, 2], empty: [] })
  })

  it('converts resolved select option values only for membership conditions', () => {
    const form = { source: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }] }
    expect(buildSelectFilterConditions([
      { field: 'source', relationField: 'target', symbol: 'IN', inputType: 'CHECKBOX' },
      { field: 'source', relationField: 'target2', symbol: 'EQ', inputType: 'CHECKBOX' },
    ], form)).toMatchObject([
      { value: 'a,b' }, { value: ['a', 'b'] },
    ])
  })
})
