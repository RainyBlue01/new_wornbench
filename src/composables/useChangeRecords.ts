/**
 * 变更记录逻辑 Composable
 * 管理审批流程中的数据变更记录、用户/部门名称缓存等
 */

import { ref, reactive, computed } from 'vue'
import { dataLifecycleDes } from '@/api/original'
import { compareRecord } from '@/api/workbench/index'
import { getUsersByIds, getDeptsByIds } from '@/api/common/index'

export interface ChangeRecord {
  id: string
  dataId: string
  createUser: string
  nickname?: string
  createTime: string
  recordTime?: string
  classify: number // 1: 数据生产, 2: 数据维护, 3: 数据删除
  compareFields?: Array<{
    field: string
    fieldName?: string
    oldValue: any
    newValue: any
  }>
  oldValue?: any
  newValue?: any
  fieldName?: string
  field?: string
}

export interface ChangePagination {
  formId: string
  appId: string
  dataId: string
  total: number
  current: number
  pageSize: number
}

export function useChangeRecords() {
  const changeRecords = ref<ChangeRecord[]>([])
  const userNameMap = ref<Map<string, string>>(new Map())
  const deptNameMap = ref<Map<string, string>>(new Map())

  const changePagination = reactive<ChangePagination>({
    formId: '',
    appId: '',
    dataId: '',
    total: 0,
    current: 1,
    pageSize: 100,
  })

  /**
   * 获取变更记录
   */
  const fetchChangeRecords = async () => {
    const params = {
      formId: changePagination.formId,
      dataId: changePagination.dataId,
      classify: 2,
      current: changePagination.current,
      size: changePagination.pageSize,
    }

    try {
      const res = await compareRecord(params)
      changePagination.total = res.total
      changeRecords.value = res.records

      // 提取所有需要查询的用户和部门 ID
      const userIds: string[] = []
      const deptIds: string[] = []

      const extractIds = (obj: any) => {
        if (!obj || typeof obj !== 'object') return

        if (Array.isArray(obj)) {
          obj.forEach(item => extractIds(item))
          return
        }

        for (const key in obj) {
          if (!obj.hasOwnProperty(key)) continue

          const value = obj[key]

          if (key === 'compareFields' && typeof value === 'object') {
            for (const fieldKey in value) {
              if (!value.hasOwnProperty(fieldKey)) continue
              const fieldValue = value[fieldKey]
              extractIdsFromFieldValue(fieldValue, fieldKey)
            }
          } else {
            extractIds(value)
          }
        }
      }

      const extractIdsFromFieldValue = (value: any, fieldKey: string) => {
        if (!value) return

        if (Array.isArray(value)) {
          value.forEach(item => {
            if (typeof item === 'object' && item !== null) {
              extractIdsFromFieldValue(item, fieldKey)
            } else if (typeof item === 'string' || typeof item === 'number') {
              collectId(item, fieldKey)
            }
          })
        } else if (typeof value === 'object') {
          for (const k in value) {
            if (value.hasOwnProperty(k)) {
              extractIdsFromFieldValue(value[k], fieldKey)
            }
          }
        } else if (typeof value === 'string' || typeof value === 'number') {
          collectId(value, fieldKey)
        }
      }

      const collectId = (id: any, fieldKey: string) => {
        // 如果是对象，提取 id 属性
        if (typeof id === 'object' && id !== null) {
          if (id.id && /^\d+$/.test(String(id.id))) {
            const idStr = String(id.id)
            if (!userNameMap.value.has(idStr) && !deptNameMap.value.has(idStr)) {
              userIds.push(idStr)
              deptIds.push(idStr)
            }
          }
          return
        }

        const idStr = String(id)
        if (/^\d+$/.test(idStr)) {
          if (!userNameMap.value.has(idStr) && !deptNameMap.value.has(idStr)) {
            userIds.push(idStr)
            deptIds.push(idStr)
          }
        }
      }

      changeRecords.value.forEach(record => {
        extractIds(record)
      })

      const uniqueUserIds = [...new Set(userIds)]
      const uniqueDeptIds = [...new Set(deptIds)]

      // 批量查询用户名称
      if (uniqueUserIds.length > 0) {
        getUsersByIds(uniqueUserIds).then(res => {
          if (Array.isArray(res)) {
            res.forEach(user => {
              userNameMap.value.set(user.id, user.nickname || user.name || user.id)
            })
          }
        }).catch(() => {
          // 忽略错误
        })
      }

      // 批量查询部门名称
      if (uniqueDeptIds.length > 0) {
        getDeptsByIds(uniqueDeptIds).then(res => {
          if (Array.isArray(res)) {
            res.forEach(dept => {
              deptNameMap.value.set(dept.id, dept.deptName || dept.label || dept.id)
            })
          }
        }).catch(() => {
          // 忽略错误
        })
      }
    } catch (err) {
      console.error('获取变更记录失败:', err)
    }
  }

  /**
   * 分页大小变化
   */
  const handlePageSizeChange = () => {
    fetchChangeRecords()
  }

  /**
   * 页码变化
   */
  const handleCurrentChange = (current: number) => {
    changePagination.current = current
    fetchChangeRecords()
  }

  /**
   * 查看变更详情
   */
  const showChangeDetail = async (record: ChangeRecord, upDateDataRef: any) => {
    const params = {
      formId: changePagination.formId,
      dataId: record.dataId || changePagination.dataId,
      appId: changePagination.appId,
    }

    try {
      const res = await dataLifecycleDes(record.id)
      const datas = JSON.parse(res.dataValue)
      upDateDataRef.value?.showItems(
        { dataValue: datas },
        params.formId,
        true, // 禁用编辑模式（只读）
        params.appId
      )
    } catch (err) {
      console.error('获取变更详情失败:', err)
    }
  }

  /**
   * 获取变更记录图标样式类
   */
  const getChangeIconClass = (record: ChangeRecord): string => {
    if (record.classify === 2) return 'icon-edit'
    if (record.classify === 1) return 'icon-plus'
    return 'icon-delete'
  }

  /**
   * 获取变更记录描述
   */
  const getChangeDescription = (record: ChangeRecord, getFieldName: (fieldCode: string) => string): string => {
    const classifyMap: Record<number, string> = {
      1: '添加了',
      2: '修改了',
      3: '删除了',
    }
    const type = classifyMap[record.classify] || '操作了'

    if (record.compareFields && record.compareFields.length > 0) {
      const fieldName = getFieldName(record.compareFields[0].field)
      return `${type} ${fieldName}${record.compareFields.length > 1 ? ` 等${record.compareFields.length}项` : ''}`
    }

    const fieldName = record.fieldName || record.field || '数据'
    return `${type} ${fieldName}`
  }

  return {
    changeRecords,
    userNameMap,
    deptNameMap,
    changePagination,
    fetchChangeRecords,
    handlePageSizeChange,
    handleCurrentChange,
    showChangeDetail,
    getChangeIconClass,
    getChangeDescription,
  }
}
