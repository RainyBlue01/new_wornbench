const STORAGE_KEY = 'originalDataColumnWidths'

type WidthStore = Record<string, Record<string, number>>

function readStore(): WidthStore {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function writeStore(store: WidthStore) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // ignore quota / privacy errors
  }
}

export function getColumnWidths(appId: string): Record<string, number> {
  if (!appId) return {}
  return readStore()[appId] || {}
}

export function setColumnWidth(appId: string, fieldId: string, width: number) {
  if (!appId || !fieldId || !Number.isFinite(width)) return
  const store = readStore()
  if (!store[appId]) store[appId] = {}
  store[appId][fieldId] = width
  writeStore(store)
}

function applyToColumn(col: any, widths: Record<string, number>) {
  if (col.dataIndex && widths[col.dataIndex] != null) {
    const minWidth = Number(col.minWidth) || 0
    col.width = Math.max(widths[col.dataIndex], minWidth)
  }
  if (col.children?.length) {
    col.children.forEach((child: any) => applyToColumn(child, widths))
  }
}

export function applyColumnWidths<T extends { dataIndex?: string; children?: T[] }>(
  columns: T[],
  appId: string,
): T[] {
  if (!appId || !columns.length) return columns
  const widths = getColumnWidths(appId)
  if (!Object.keys(widths).length) return columns
  columns.forEach((col) => applyToColumn(col, widths))
  return columns
}
