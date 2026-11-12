import { describe, expect, it } from 'vitest'
import { findReportFilterTables } from './reportFilterTargets'

describe('findReportFilterTables', () => {
  it('matches persisted string and numeric IDs without converting long IDs to numbers', () => {
    const layout = [
      { i: 'filter-1', type: 'CONDITION', props: { formId: '2097559709787328514' } },
      { i: 'table-1', type: 'TABLE', props: { data: { formId: '2097559709787328514' } } },
      { i: 'table-2', type: 'TABLE', props: { data: { formId: 'other' } } },
    ]
    expect(findReportFilterTables(layout, 'filter-1').map(item => item.i)).toEqual(['table-1'])
    expect(findReportFilterTables([
      { i: 1, type: 'CONDITION', props: { formId: 12 } },
      { i: 2, type: 'TABLE', props: { data: { formId: '12' } } },
    ], '1').map(item => item.i)).toEqual([2])
  })

  it('falls back to app ID when the form ID differs', () => {
    const layout = [
      { i: 'filter', type: 'CONDITION', props: { formId: 'old-form', appId: 'app-1' } },
      { i: 'table', type: 'TABLE', props: { data: { formId: 'new-form', appId: 'app-1' } } },
    ]
    expect(findReportFilterTables(layout, 'filter').map(item => item.i)).toEqual(['table'])
  })

  it('matches legacy configurations that stored the same ID under different keys', () => {
    expect(findReportFilterTables([
      { i: 'filter-by-form', type: 'CONDITION', props: { formId: 'app-1' } },
      { i: 'filter-by-app', type: 'CONDITION', props: { appId: 'form-1' } },
      { i: 'table', type: 'TABLE', props: { data: { formId: 'form-1', appId: 'app-1' } } },
    ], 'filter-by-form').map(item => item.i)).toEqual(['table'])

    expect(findReportFilterTables([
      { i: 'filter-by-form', type: 'CONDITION', props: { formId: 'app-1' } },
      { i: 'filter-by-app', type: 'CONDITION', props: { appId: 'form-1' } },
      { i: 'table', type: 'TABLE', props: { data: { formId: 'form-1', appId: 'app-1' } } },
    ], 'filter-by-app').map(item => item.i)).toEqual(['table'])
  })

  it('does not route unconfigured filters to unrelated tables', () => {
    expect(findReportFilterTables([
      { i: 'filter', type: 'CONDITION', props: {} },
      { i: 'table', type: 'TABLE', props: { data: {} } },
    ], 'filter')).toEqual([])
  })
})
