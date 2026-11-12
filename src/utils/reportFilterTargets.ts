type ReportLayoutItem = {
  i?: string | number
  type?: string
  props?: {
    formId?: string | number
    appId?: string | number
    data?: {
      formId?: string | number
      appId?: string | number
    }
  }
}

const id = (value: string | number | undefined | null) =>
  value === undefined || value === null ? '' : String(value).trim()

const ids = (...values: Array<string | number | undefined | null>) =>
  values.map(id).filter(Boolean)

export function findReportFilterTables(layout: ReportLayoutItem[], filterId: string | number) {
  const filter = layout.find(item => id(item.i) === id(filterId))
  if (!filter) return []

  const filterIds = ids(filter.props?.formId, filter.props?.appId)
  if (filterIds.length === 0) return []

  return layout.filter(item => {
    if (item.type !== 'TABLE') return false
    const tableIds = ids(item.props?.data?.formId, item.props?.data?.appId)
    return filterIds.some(filterId => tableIds.indexOf(filterId) !== -1)
  })
}
