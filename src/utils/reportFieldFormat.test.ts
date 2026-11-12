import { describe, expect, it } from 'vitest'
import { getReportFieldFormatKind, isReportNumberFieldType } from './reportFieldFormat'

describe('getReportFieldFormatKind', () => {
  it.each(['NUMBER', 'DOUBLE', 'RATE', 'MONEY'])('recognizes %s as a number format field', type => {
    expect(getReportFieldFormatKind({ type })).toBe('number')
    expect(isReportNumberFieldType(type)).toBe(true)
  })

  it.each(['DATE', 'DATETIME'])('recognizes %s as a date/time format field', type => {
    expect(getReportFieldFormatKind({ type })).toBe('dateTime')
  })

  it('does not expose data formatting for time components', () => {
    expect(getReportFieldFormatKind({ type: 'TIME' })).toBeNull()
    expect(getReportFieldFormatKind({ type: 'TIME', format: { dateTime: { type: 0 } } })).toBeNull()
  })

  it('keeps format metadata compatibility for derived fields', () => {
    expect(getReportFieldFormatKind({ type: 'INPUT', format: { address: {} } })).toBe('address')
    expect(getReportFieldFormatKind({ type: 'INPUT', format: { dateTime: 0 } })).toBe('dateTime')
  })

  it('does not expose format configuration for ordinary text fields', () => {
    expect(getReportFieldFormatKind({ type: 'INPUT' })).toBeNull()
  })
})
