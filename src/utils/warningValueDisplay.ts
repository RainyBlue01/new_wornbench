import { getUsersByIds } from '@/api/common/index'

export function findTreeNodeLabel(tree: any[], id: any): string | undefined {
  if (!tree?.length || id == null || id === '') return undefined
  for (const node of tree) {
    if (node.id == id) {
      return node.label || node.deptName || node.name
    }
    if (node.children?.length) {
      const found = findTreeNodeLabel(node.children, id)
      if (found) return found
    }
  }
  return undefined
}

export function resolveOptionLabel(val: any, options: any[] = []): string {
  const opt = options.find((o: any) => o.value == val || o.id == val)
  return opt?.label ?? opt?.name ?? String(val ?? '')
}

export function buildWarningValueNames(
  fieldType: string,
  value: any,
  defaultData: any[],
  extraOptions: any[] = [],
): string | string[] | undefined {
  if (['USER', 'USER_MULTIPLE'].includes(fieldType) && Array.isArray(defaultData)) {
    return defaultData.map((v: any) => v.nickname || v.label || String(v.id ?? ''))
  }

  if (['DEPT', 'DEPT_MULTIPLE'].includes(fieldType) && Array.isArray(defaultData)) {
    return defaultData.map((v: any) => v.label || v.deptName || String(v.id ?? ''))
  }

  if (['RADIO', 'SELECT', 'CHECKBOX', 'SELECT_MULTIPLE'].includes(fieldType)) {
    if (Array.isArray(value)) {
      return value.map(v => resolveOptionLabel(v, extraOptions))
    }
    if (value != null && value !== '') {
      return resolveOptionLabel(value, extraOptions)
    }
  }

  return undefined
}

export function formatWarningPlanValue(
  
  item: { symbol: string; value: any; valueNames?: string | string[] },
  fieldType: string,
  context: { extraOptions?: any[]; deptList?: any[] } = {},
): string {
  if (item.symbol === 'IS_NULL' || item.symbol === 'NOT_NULL') return ''

  if (item.symbol === 'BETWEEN' && Array.isArray(item.value)) {
    return `${item.value[0]} ~ ${item.value[1]}`
  }
  console.log(item)
  const resolveId = (id: any, index?: number): string => {
    if (item.valueNames != null) {
      if (Array.isArray(item.valueNames)) {
        if (index != null && item.valueNames[index]) return item.valueNames[index]
        const idx = Array.isArray(item.value) ? item.value.findIndex(v => v == id) : -1
        if (idx >= 0 && item.valueNames[idx]) return item.valueNames[idx]
      } else if (!Array.isArray(item.value) && item.value == id) {
        return item.valueNames
      }
    }

    if (['USER', 'USER_MULTIPLE'].includes(fieldType)) {
      return String(id ?? '')
    }

    if (['DEPT', 'DEPT_MULTIPLE'].includes(fieldType)) {
      return findTreeNodeLabel(context.deptList || [], id) || String(id ?? '')
    }

    if (['RADIO', 'SELECT', 'CHECKBOX', 'SELECT_MULTIPLE'].includes(fieldType)) {
      return resolveOptionLabel(id, context.extraOptions || [])
    }

    return String(id ?? '')
  }

  if (Array.isArray(item.value)) {
    return item.value.map((v, i) => resolveId(v, i)).join(', ')
  }

  if (item.valueNames != null && !Array.isArray(item.valueNames)) {
    return item.valueNames
  }

  if (
    [ 'USER', 'DEPT', 'USER_MULTIPLE', 'DEPT_MULTIPLE'].includes(
      fieldType,
    )
  ) {
   
    return item.valueNames.join(', ')
  }
  if (
    ['RADIO', 'SELECT'].includes(
      fieldType,
    )
  ) {
   
    return resolveId(item.value,0)
  }

  return item.value ?? ''
}

/** 将预警保存的 value 规范化为 id 列表 */
export function normalizeWarningUserIds(value: any): string[] {
  if (value == null || value === '') return []

  if (Array.isArray(value)) {
    return value
      .map((v) => {
        if (v == null || v === '') return ''
        if (typeof v === 'object') return String(v.id ?? v.userId ?? '')
        return String(v)
      })
      .filter(Boolean)
  }

  if (typeof value === 'object') {
    const id = value.id ?? value.userId
    return id != null && id !== '' ? [String(id)] : []
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return []
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed)
        return normalizeWarningUserIds(parsed)
      } catch {
        /* fall through */
      }
    }
    if (trimmed.includes(',')) {
      return trimmed.split(',').map((s) => s.trim()).filter(Boolean)
    }
    return [trimmed]
  }

  return [String(value)]
}

export function restoreWarningFormDefault(
  fieldType: string,
  value: any,
  valueNames: string | string[] | undefined,
  deptList: any[] = [],
): any[] {
  const ids = normalizeWarningUserIds(value)
  const names = Array.isArray(valueNames) ? valueNames : valueNames ? [valueNames] : []

  if (['USER', 'USER_MULTIPLE'].includes(fieldType)) {
    return ids.map((id: string, i: number) => ({
      id,
      nickname: names[i] || String(id),
    }))
  }

  if (['DEPT', 'DEPT_MULTIPLE'].includes(fieldType)) {
    return ids.map((id: string, i: number) => ({
      id,
      label: names[i] || findTreeNodeLabel(deptList, id) || String(id),
    }))
  }

  return []
}

/** 编辑预警时回显人员/部门：优先接口补全昵称 */
export async function hydrateWarningFormDefault(
  fieldType: string,
  value: any,
  valueNames: string | string[] | undefined,
  deptList: any[] = [],
): Promise<any[]> {
  const fallback = restoreWarningFormDefault(fieldType, value, valueNames, deptList)
  if (!fallback.length) return []

  if (['USER', 'USER_MULTIPLE'].includes(fieldType)) {
    const ids = fallback.map((item) => String(item.id))
    try {
      const users = await getUsersByIds(ids)
      if (Array.isArray(users) && users.length > 0) {
        const userMap = new Map(users.map((u: any) => [String(u.id), u]))
        return ids.map((id, i) => {
          const user = userMap.get(id)
          return {
            id,
            nickname: user?.nickname || fallback[i]?.nickname || String(id),
          }
        })
      }
    } catch {
      /* 使用 fallback */
    }
  }

  return fallback
}
