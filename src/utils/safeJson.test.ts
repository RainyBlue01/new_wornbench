import { describe, expect, it } from 'vitest'

import { safeJsonParse, safeJsonRecord } from './safeJson'

describe('safe JSON helpers', () => {
  it('returns parsed values for valid JSON', () => {
    expect(safeJsonParse('{"enabled":true}', {})).toEqual({ enabled: true })
  })

  it('returns a fallback for missing or invalid JSON', () => {
    expect(safeJsonParse('', [])).toEqual([])
    expect(safeJsonParse('{broken', { safe: true })).toEqual({ safe: true })
  })

  it('only accepts object-shaped storage records', () => {
    expect(safeJsonRecord<number>('{"field":120}')).toEqual({ field: 120 })
    expect(safeJsonRecord('[]')).toEqual({})
  })
})
