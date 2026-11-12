import * as XLSX from 'xlsx'
import type {
  ExcelParseResult,
  ImportColumnMappingItem,
  ImportMapField,
  ImportValidationResult,
} from '@/types/originalImport'

const SKIP_VALUE = '__skip__'
const MAX_FILE_SIZE = 10 * 1024 * 1024

const SYNONYM_MAP: Record<string, string[]> = {
  id: ['序号', '编号', 'id', '主键'],
  createUser: ['创建人', '填表人', '提交人'],
  createTime: ['创建时间', '填报时间', '提交时间'],
  updateUser: ['修改人', '更新人'],
  updateTime: ['更新时间', '修改时间'],
  submitIp: ['提交IP', 'IP地址', 'ip'],
  instanceId: ['流程实例id', '流程ID', '流程编号', '审批编号'],
  instanceState: ['流程状态', '审批状态', '状态'],
}

export function validateExcelFile(file: File): string | null {
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
  if (ext !== '.xlsx' && ext !== '.xls') {
    return '文件格式不符合，请上传 .xlsx 或 .xls'
  }
  if (file.size > MAX_FILE_SIZE) {
    return '文件大小不能超过 10MB'
  }
  return null
}

export function parseExcelFile(file: File): Promise<ExcelParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json<(string | number)[]>(firstSheet, {
          header: 1,
          defval: '',
        })
        if (jsonData.length < 2) {
          reject(new Error('Excel数据为空或格式不正确'))
          return
        }
        const headers = jsonData[0].map((h) => String(h).trim())
        const rows = jsonData.slice(1).map((row, idx) => {
          const obj: Record<string, unknown> = { _rowIndex: idx + 2 }
          headers.forEach((h, i) => {
            obj[h] = row[i] !== undefined ? row[i] : ''
          })
          return obj
        })
        resolve({ headers, rows })
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Excel解析失败'))
      }
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsArrayBuffer(file)
  })
}

export function smartMapColumn(
  sysKey: string,
  sysLabel: string,
  headers: string[],
): string | null {
  const lowerLabel = sysLabel.toLowerCase()
  const lowerKey = sysKey.toLowerCase()
  for (const h of headers) {
    const lh = h.toLowerCase()
    if (lh === lowerLabel || lh === lowerKey) return h
  }
  for (const h of headers) {
    const lh = h.toLowerCase()
    if (lh.includes(lowerLabel) || lowerLabel.includes(lh)) return h
    if (lh.includes(lowerKey) || lowerKey.includes(lh)) return h
  }
  const syns = SYNONYM_MAP[sysKey] || []
  for (const s of syns) {
    for (const h of headers) {
      const lh = h.toLowerCase()
      if (lh.includes(s.toLowerCase()) || s.toLowerCase().includes(lh)) return h
    }
  }
  return null
}

export function buildInitialMapping(
  mapFields: ImportMapField[],
  headers: string[],
): Record<string, string> {
  const mapping: Record<string, string> = {}
  mapFields.forEach((field) => {
    const matched = smartMapColumn(field.key, field.label, headers)
    mapping[field.key] = matched || SKIP_VALUE
  })
  return mapping
}

export function getMappedColumnMapping(
  columnMapping: Record<string, string>,
  mapFields: ImportMapField[],
): ImportColumnMappingItem[] {
  const fieldMetaMap = new Map(mapFields.map((item) => [item.key, item]))
  const result: ImportColumnMappingItem[] = []

  Object.entries(columnMapping).forEach(([field, headName]) => {
    if (!headName || headName === SKIP_VALUE) return
    const meta = fieldMetaMap.get(field)
    result.push({
      headName,
      field,
      title: meta?.label ?? field,
    })
  })

  return result
}

export function validateImportRows(
  rows: Record<string, unknown>[],
  columnMapping: Record<string, string>,
  mapFields: ImportMapField[],
): ImportValidationResult {
  const validRows: Record<string, unknown>[] = []
  const invalidRows: ImportValidationResult['invalidRows'] = []
  const formFields = mapFields.filter((f) => f.group === 'form')

  rows.forEach((row) => {
    const errors: string[] = []
    formFields.forEach((field) => {
      const mapKey = columnMapping[field.key]
      if (!mapKey || mapKey === SKIP_VALUE) return
      const val = row[mapKey]
      if (field.required && (!val || String(val).trim() === '')) {
        errors.push(`${field.label}不能为空`)
      }
      if (
        (field.key === 'amount' || field.label.includes('金额')) &&
        val !== '' &&
        val !== '-' &&
        val != null &&
        isNaN(parseFloat(String(val)))
      ) {
        errors.push(`${field.label}格式错误（应为数字）`)
      }
    })
    if (errors.length > 0) {
      invalidRows.push({
        rowIndex: Number(row._rowIndex) || 0,
        errors,
      })
    } else {
      validRows.push(row)
    }
  })

  return { validRows, invalidRows }
}

export { SKIP_VALUE }
