export type ImportMode = 'insert' | 'update' | 'upsert'

export interface ImportMapField {
  key: string
  label: string
  group: 'form' | 'process' | 'system'
  required?: boolean
}

/** 导入字段映射项（提交后端） */
export interface ImportColumnMappingItem {
  /** Excel 表头名称 */
  headName: string
  /** 字段编码 */
  field: string
  /** 字段标题 */
  title: string
}

export interface OriginalImportPayload {
  importOriginal: string
  file: File
}

export interface OriginalImportResult {
  successful?: number
  fail?: number
  insertCount?: number
  updateCount?: number
  skipCount?: number
  failDataPath?: string
}

export interface ExcelParseResult {
  headers: string[]
  rows: Record<string, unknown>[]
}

export interface ImportValidationItem {
  rowIndex: number
  errors: string[]
}

export interface ImportValidationResult {
  validRows: Record<string, unknown>[]
  invalidRows: ImportValidationItem[]
}
