import { describe, expect, it } from 'vitest'
import {
  SYSTEM_DATE_TIME_FORMAT,
  normalizeReportFilterFormat,
  resolveReportFilterTemporalConfig,
} from './reportFilterTemporal'

describe('reportFilterTemporal', () => {
  it('uses the form default for a legacy date filter without format', () => {
    expect(resolveReportFilterTemporalConfig({ column: 'birthday', type: 'DATE' })).toMatchObject({
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD',
      showTime: false,
    })
  })

  it('uses the form date component format', () => {
    expect(resolveReportFilterTemporalConfig({
      column: 'birthday',
      type: 'DATE',
      props: { format: 'YYYY-MM-DD' },
    })).toEqual({
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD',
      showTime: false,
      mode: 'date',
    })
  })

  it('uses year and month picker modes from the form format', () => {
    expect(resolveReportFilterTemporalConfig({ type: 'DATE', props: { format: 'YYYY' } }).mode).toBe('year')
    expect(resolveReportFilterTemporalConfig({ type: 'DATE', props: { format: 'yyyy-MM' } }).mode).toBe('month')
  })

  it.each(['create_time', 'update_time'])('forces %s to full date time', (column) => {
    expect(resolveReportFilterTemporalConfig({
      column,
      type: 'DATE',
      props: { format: 'YYYY-MM-DD' },
    })).toEqual({
      format: SYSTEM_DATE_TIME_FORMAT,
      valueFormat: SYSTEM_DATE_TIME_FORMAT,
      showTime: true,
      mode: 'date',
    })
  })

  it('uses the form time component format', () => {
    expect(resolveReportFilterTemporalConfig({ type: 'TIME', format: 'HH:mm' })).toMatchObject({
      format: 'HH:mm',
      valueFormat: 'HH:mm',
      showTime: false,
    })
  })

  it('normalizes backend date tokens', () => {
    expect(normalizeReportFilterFormat('yyyy-MM-dd HH:mm:ss')).toBe(SYSTEM_DATE_TIME_FORMAT)
  })
})
