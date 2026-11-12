import { afterEach, describe, expect, it, vi } from 'vitest'
import { emptyReportConditionValue, mergeReportCondition } from './reportConditions'

describe('report runtime filters', () => {
  afterEach(() => vi.useRealTimers())
  it('clears the selected value when switching operators while keeping other filters', () => {
    expect(emptyReportConditionValue('NE', 'SELECT')).toBe('')
    expect(emptyReportConditionValue('IN', 'SELECT')).toEqual([])
    expect(emptyReportConditionValue('NOT_IN', 'CHECKBOX')).toEqual([])
    expect(emptyReportConditionValue('EQ', 'CHECKBOX')).toEqual([])
    expect(emptyReportConditionValue('LIKE', 'ADDRESS')).toEqual([])
    const conditions = mergeReportCondition([
      { id: 'job', symbol: 'EQ', value: 'teacher' },
      { id: 'dept', symbol: 'EQ', value: '1' },
    ], { id: 'job', symbol: 'IN', value: emptyReportConditionValue('IN', 'SELECT') })
    expect(conditions.map(item => item.id)).toEqual(['dept'])
  })

  it('applies null checks immediately and clears incomplete ranges', () => {
    expect(emptyReportConditionValue('IS_NULL', 'SELECT')).toBeNull()
    expect(emptyReportConditionValue('NOT_NULL', 'SELECT')).toBeNull()
    expect(emptyReportConditionValue('BETWEEN', 'DATE')).toEqual([])
    expect(mergeReportCondition([], {
      id: 'job', symbol: 'IS_NULL', value: emptyReportConditionValue('IS_NULL', 'SELECT'),
    })).toHaveLength(1)
  })
  it('keeps multiple conditions when adding, editing and clearing one field', () => {
    let conditions = mergeReportCondition([], { id: 'job', symbol: 'EQ', value: 'worker' })
    conditions = mergeReportCondition(conditions, { id: 'dept', symbol: 'EQ', value: '1' })
    expect(conditions.map(item => item.value)).toEqual(['worker', '1'])
    conditions = mergeReportCondition(conditions, { id: 'dept', symbol: 'EQ', value: '2' })
    expect(conditions.map(item => item.value)).toEqual(['worker', '2'])
    conditions = mergeReportCondition(conditions, { id: 'dept', symbol: 'EQ', value: '' })
    expect(conditions.map(item => item.id)).toEqual(['job'])
  })

  it('clears empty arrays but preserves zero and null predicates', () => {
    expect(mergeReportCondition([], { id: 'a', symbol: 'IN', value: [] })).toEqual([])
    expect(mergeReportCondition([], { id: 'a', symbol: 'EQ', value: 0 })).toHaveLength(1)
    for (const symbol of ['IS_NULL', 'NOT_NULL', 'IS_NOT_NULL']) {
      expect(mergeReportCondition([], { id: 'a', symbol, value: null })).toHaveLength(1)
    }
  })

  it.each([
    [0, '2026-09-16 13:14:15'], [1, '2026-09-16 00:00:00'],
    [2, '2026-09-16 13:14:15'], [3, '2026-09-16 00:00:00'],
    [4, '2026-09-16 13:14:15'], [5, '2026-09-16 00:00:00'],
    [6, '2026-09-01 00:00:00'], [7, '2030-09-16 00:00:00'], [8, '2030-09-16 00:00:00'],
  ])('formats a date using table date format %s', (type, expected) => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2030, 0, 1))
    const result = mergeReportCondition([], {
      id: 'date', type: 'DATE', symbol: 'EQ', value: '2026-09-16 13:14:15',
      extra: { format: 'YYYY-MM-DD' },
    }, [{ id: 'date', format: { dateTime: { type } } }])
    expect(result[0].value).toBe(expected)
    expect(typeof result[0].extra?.format).toBe('string')
  })

  it('formats both range endpoints without mutating values or table configuration', () => {
    const value = ['2026-09-01 12:00:00', '2026-09-16 13:00:00']
    const fields = [{ column: 'date', format: { dateTime: 1 } }]
    const result = mergeReportCondition([], { id: 'date', type: 'DATE', symbol: 'BETWEEN', value }, fields)
    expect(result[0].value).toEqual(['2026-09-01 00:00:00', '2026-09-16 00:00:00'])
    expect(value[0]).toBe('2026-09-01 12:00:00')
    expect(fields[0].format.dateTime).toBe(1)
  })
})
