const DEPT_LEADER_OPTIONS = [
  { label: '直接部门负责人', value: 0 },
  { label: '上级部门负责人', value: 1 },
  { label: '三级部门负责人', value: 2 },
  { label: '四级部门负责人', value: 3 },
  { label: '五级部门负责人', value: 4 },
  { label: '直接部门负责人', value: 1 },
  { label: '上级部门负责人', value: 2 },
  { label: '三级部门负责人', value: 3 },
  { label: '四级部门负责人', value: 4 },
  { label: '五级部门负责人', value: 5 },
]

const CHARGE_LEADER_OPTIONS = [
  { label: '直接部门分管领导', value: 0 },
  { label: '上级部门分管领导', value: 1 },
  { label: '三级部门分管领导', value: 2 },
  { label: '四级部门分管领导', value: 3 },
  { label: '五级部门分管领导', value: 4 },
]

const GRADUAL_APPROVE_OPTIONS = [
  { label: '直接部门负责人', value: 1 },
  { label: '上级部门负责人', value: 2 },
  { label: '三级部门负责人', value: 3 },
  { label: '四级部门负责人', value: 4 },
  { label: '五级部门负责人', value: 5 },
]

type ReferenceResolver = {
  getUser?: (id: string) => any | null
  getDept?: (id: string) => any | null
  getPost?: (id: string) => any | null
}

const flattenFormList = (formList: any[] = []): any[] => {
  const result: any[] = []
  const walk = (items: any[]) => {
    items.forEach((item) => {
      if (!item) return
      result.push(item)
      if (Array.isArray(item.children)) walk(item.children)
      if (Array.isArray(item.list)) walk(item.list)
    })
  }
  walk(formList)
  return result
}

const resolveOptionLabel = (value: any, options: Array<{ label: string; value: number }>) => {
  const matched = options.find((item) => item.value == value)
  return matched?.label || ''
}

const resolveFormFieldTitle = (fieldId: any, formList: any[] = []) => {
  if (fieldId == null || fieldId === '') return ''
  const flatList = flattenFormList(formList)
  const matched = flatList.find((item) => String(item.id) === String(fieldId))
  return matched?.title || matched?.label || matched?.name || ''
}

const formatEntityLabel = (item: any, resolver?: ReferenceResolver) => {
  if (item == null || item === '') return ''

  if (typeof item === 'string' || typeof item === 'number') {
    const id = String(item)
    const user = resolver?.getUser?.(id)
    if (user) {
      return user.nickname || user.name || user.username || ''
    }
    const dept = resolver?.getDept?.(id)
    if (dept) {
      return dept.label || dept.deptName || dept.name || ''
    }
    const post = resolver?.getPost?.(id)
    if (post) {
      return post.postName || post.label || post.name || ''
    }
    return ''
  }

  if (typeof item === 'object') {
    return (
      item.nickname ||
      item.label ||
      item.name ||
      item.roleName ||
      item.postName ||
      item.title ||
      item.deptName ||
      resolveOptionLabel(item.value, DEPT_LEADER_OPTIONS) ||
      ''
    )
  }

  return ''
}

const appendLabels = (labels: string[], items: any[] | undefined, formatter: (item: any) => string) => {
  if (!Array.isArray(items) || items.length === 0) return
  items.forEach((item) => {
    const label = formatter(item)
    if (label) labels.push(label)
  })
}

const appendLeaderLevels = (labels: string[], levels: any[] | undefined, options: Array<{ label: string; value: number }>) => {
  if (!Array.isArray(levels) || levels.length === 0) return
  levels.forEach((item) => {
    if (item && typeof item === 'object') {
      const label = item.label || resolveOptionLabel(item.value, options)
      if (label) labels.push(label)
      return
    }
    const label = resolveOptionLabel(item, options)
    if (label) labels.push(label)
  })
}

const appendFieldLabels = (labels: string[], fields: any[] | undefined, formList: any[]) => {
  if (!Array.isArray(fields) || fields.length === 0) return
  fields.forEach((item) => {
    if (item && typeof item === 'object') {
      const label = item.title || item.label || item.name || ''
      if (label) labels.push(label)
      return
    }
    const label = resolveFormFieldTitle(item, formList)
    if (label) labels.push(label)
  })
}

export function buildNodeCandidateText(
  nodeConfig: any,
  formList: any[] = [],
  resolver?: ReferenceResolver,
) {
  if (!nodeConfig) return ''

  if (nodeConfig.type === 'APPROVE' && nodeConfig.approveOption == 1) {
    return resolveOptionLabel(nodeConfig.graduallyCandidate?.level, GRADUAL_APPROVE_OPTIONS)
  }

  const candidate = nodeConfig.candidate
  if (!candidate) return ''

  const labels: string[] = []
  const formatEntity = (item: any) => formatEntityLabel(item, resolver)

  appendLabels(labels, candidate.deptIds, formatEntity)
  appendLabels(labels, candidate.postIds, formatEntity)
  appendLabels(labels, candidate.roleIds, formatEntity)
  appendLabels(labels, candidate.userIds, formatEntity)

  const dynamic = candidate.dynamic
  if (dynamic) {
    appendFieldLabels(labels, dynamic.deptFields, formList)
    appendFieldLabels(labels, dynamic.userFields, formList)
    appendLeaderLevels(labels, dynamic.deptLeader?.level, DEPT_LEADER_OPTIONS)
    appendLeaderLevels(labels, dynamic.chargeLeader?.level, CHARGE_LEADER_OPTIONS)

    if (dynamic.applyUser) {
      labels.push('流程发起人')
    }
  }

  return labels.join(',')
}

export function collectCandidateReferenceIds(nodeConfig: any) {
  const userIds = new Set<string>()
  const deptIds = new Set<string>()
  const postIds = new Set<string>()

  const walk = (node: any) => {
    if (!node) return

    const appendIds = (items: any[] | undefined, target: Set<string>) => {
      if (!Array.isArray(items)) return
      items.forEach((item) => {
        if (item == null || item === '') return
        if (typeof item === 'string' || typeof item === 'number') {
          target.add(String(item))
          return
        }
        if (item.id != null && item.id !== '') {
          target.add(String(item.id))
        }
      })
    }

    const candidate = node.candidate
    if (candidate) {
      appendIds(candidate.userIds, userIds)
      appendIds(candidate.deptIds, deptIds)
      appendIds(candidate.postIds, postIds)
      appendIds(candidate.dynamic?.userIds, userIds)
    }

    if (node.childNode) walk(node.childNode)
    if (Array.isArray(node.conditionNodes)) {
      node.conditionNodes.forEach((branch: any) => {
        walk(branch)
        if (branch?.childNode) walk(branch.childNode)
      })
    }
  }

  walk(nodeConfig)

  return {
    userIds: [...userIds],
    deptIds: [...deptIds],
    postIds: [...postIds],
  }
}
