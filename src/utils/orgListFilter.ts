/** 组织选择列表：树形部门前端过滤 */
export function filterTreeByLabel<T extends { label?: string; children?: T[] }>(
  nodes: T[],
  keyword: string,
): T[] {
  const kw = keyword.trim().toLowerCase()
  if (!kw || !nodes?.length) return nodes || []

  const filterNodes = (list: T[]): T[] => {
    const result: T[] = []
    for (const node of list) {
      const label = String(node.label ?? '').toLowerCase()
      const children = node.children?.length ? filterNodes(node.children) : []
      const selfMatch = label.includes(kw)
      if (selfMatch || children.length) {
        result.push({
          ...node,
          children: selfMatch ? node.children : children.length ? children : undefined,
        })
      }
    }
    return result
  }

  return filterNodes(nodes)
}

/** 组织选择列表：平铺项前端过滤 */
export function filterListByKeyword<T>(
  list: T[],
  keyword: string,
  getLabel: (item: T) => string,
): T[] {
  const kw = keyword.trim().toLowerCase()
  if (!kw || !list?.length) return list || []
  return list.filter((item) => getLabel(item).toLowerCase().includes(kw))
}
