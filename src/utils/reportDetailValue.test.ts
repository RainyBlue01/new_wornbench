import { describe, expect, it } from 'vitest'
import { getReportDetailDisplayValue } from './reportDetailValue'

describe('getReportDetailDisplayValue', () => {
  it('keeps null and empty report values blank', () => {
    expect(getReportDetailDisplayValue(null)).toBe('')
    expect(getReportDetailDisplayValue('')).toBe('')
    expect(getReportDetailDisplayValue({ rawValue: null, formatValue: null })).toBe('')
    expect(getReportDetailDisplayValue({ rawValue: '', formatValue: '' })).toBe('')
  })

  it('preserves valid falsy values and formatted values', () => {
    expect(getReportDetailDisplayValue({ rawValue: 0, formatValue: 0 })).toBe(0)
    expect(getReportDetailDisplayValue({ rawValue: false, formatValue: false })).toBe(false)
    expect(getReportDetailDisplayValue({ rawValue: 10, formatValue: '10.00' })).toBe('10.00')
  })
})
