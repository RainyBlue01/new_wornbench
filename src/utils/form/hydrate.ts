import { batchGetUsers } from './referenceData'
import { batchGetDepts } from './referenceData'
import { formatDisplayDateTime } from './dateFormats'
import { formatDisplayTime } from './dateFormats'
import { getValueFormat } from './dateFormats'
import { getQuery } from './expressions'
import { getDeptsByIds, getUsersByIds } from '@/api/common/index'
import { applySelectFormOptions } from '@/utils/formSelectOptions'
import { getInitialAttachmentUrl } from '@/utils/attachmentUrl'
import { useReferenceStore } from '@/store/modules/reference'
import { normalizeSwitchValue } from './switchValue'

export async function setUpDateData(params: any, formList: any, form: any, disabled: any, id?: any) {
  if (formList && Array.isArray(formList)) {
    // 第一步：收集所有需要查询的用户和部门ID
    const userIds: string[] = []
    const deptIds: string[] = []

    const collectIds = (list: any[]) => {
      list.forEach(v1 => {
        // 收集USER类型字段的ID
        if (v1.type == 'USER' && params[v1.id]) {
          const userId = String(params[v1.id])
          userIds.push(userId)
        }
        // 收集DEPT类型字段的ID
        if (v1.type == 'DEPT' && params[v1.id]) {
          const deptId = String(params[v1.id])
          deptIds.push(deptId)
        }
        // 收集USER_MULTIPLE类型字段的ID
        if (v1.type == 'USER_MULTIPLE' && Array.isArray(params[v1.id]) && params[v1.id].length > 0) {
          params[v1.id].forEach((uid: any) => {
            userIds.push(String(uid))
          })
        }
        // 收集DEPT_MULTIPLE类型字段的ID
        if (v1.type == 'DEPT_MULTIPLE' && Array.isArray(params[v1.id]) && params[v1.id].length > 0) {
          params[v1.id].forEach((did: any) => {
            deptIds.push(String(did))
          })
        }
        // 递归处理子表单
        if (v1.type == 'SUBFORM' && params[v1.id] && Array.isArray(params[v1.id])) {
          params[v1.id].forEach((row: any) => {
            if (v1.children) {
              v1.children.forEach((child: any) => {
                const fieldValue = row[child.id]
                if (child.type == 'USER' && fieldValue) {
                  userIds.push(String(fieldValue))
                }
                if (child.type == 'DEPT' && fieldValue) {
                  deptIds.push(String(fieldValue))
                }
                if (child.type == 'USER_MULTIPLE' && Array.isArray(fieldValue)) {
                  fieldValue.forEach((uid: any) => userIds.push(String(uid)))
                }
                if (child.type == 'DEPT_MULTIPLE' && Array.isArray(fieldValue)) {
                  fieldValue.forEach((did: any) => deptIds.push(String(did)))
                }
              })
            }
          })
        }
        // 递归处理其他子项
        if (v1.children && v1.type !== 'SUBFORM') {
          collectIds(v1.children)
        }
      })
    }

    collectIds(formList)

    // 去重
    const uniqueUserIds = [...new Set(userIds)]
    const uniqueDeptIds = [...new Set(deptIds)]

    // 第二步：批量查询用户和部门信息（初始化预加载）
    await Promise.all([
      uniqueUserIds.length > 0 ? batchGetUsers(uniqueUserIds) : Promise.resolve(new Map()),
      uniqueDeptIds.length > 0 ? batchGetDepts(uniqueDeptIds) : Promise.resolve(new Map())
    ])

    // 第三步：同步渲染数据
    const referenceStore = useReferenceStore();
    formList.map(v1 => {
      v1.props.disabled = disabled

      if (v1.component == 'qUpload' && Array.isArray(params[v1.id])) {
        v1.props.value = []
        params[v1.id].map(v => {
          let params = {
            ...v, url: getInitialAttachmentUrl(v), name: v.fileName ? v.fileName : '无名', example: false
          }
          v1.props.value.push(params)
        })
      } else if (v1.component == 'qInputNumber') {
        const numberValue = params[v1.id]
        v1.props.value = numberValue === '' || numberValue === null || numberValue === undefined
          ? undefined
          : Number(numberValue)
        // console.log(v1, v1.props.value)
      } else if (v1.type == 'USER' && params[v1.id]) {
        // 从缓存中获取用户信息
        const userId = String(params[v1.id])
        const user = referenceStore.getUser(userId)
        if (user) {
          v1.props.value = [user]
          form[v1.id] = v1.props.value
        } else {
          v1.props.value = []
        }
      } else if (v1.type == 'DEPT' && params[v1.id]) {
        // 从缓存中获取部门信息
        const deptId = String(params[v1.id])
        const dept = referenceStore.getDept(deptId)
        if (dept) {
          v1.props.value = [dept]
          form[v1.id] = v1.props.value
        } else {
          v1.props.value = []
        }
      } else if (v1.type == 'USER_MULTIPLE' && Array.isArray(params[v1.id]) && params[v1.id].length > 0) {
        // 从缓存中获取多个用户信息
        const users = params[v1.id].map((uid: any) => referenceStore.getUser(String(uid))).filter(Boolean)
        v1.props.value = users
        form[v1.id] = v1.props.value
      } else if (v1.type == 'DEPT_MULTIPLE' && Array.isArray(params[v1.id]) && params[v1.id].length > 0) {
        // 从缓存中获取多个部门信息
        const depts = params[v1.id].map((did: any) => referenceStore.getDept(String(did))).filter(Boolean)
        v1.props.value = depts
        form[v1.id] = v1.props.value
      } else if (v1.type == 'RELATION_DATA' && params[v1.id]) {
        if (v1.props.selectType == 'single') {
          params[v1.id] = params[v1.id][0]
          setTimeout(() => {
            v1.props.value = params[v1.id].id
          }, 300);
        } else {
          v1.props.value = []
          let datas = JSON.parse(JSON.stringify(params[v1.id]))
          datas.map(values => {
            if (values) {
              v1.props.value.push(values.id)
            }
          })
        }
      } else if ((v1.type == 'CHECKBOX' || v1.type == 'SELECT_MULTIPLE') && params[v1.id]) {
        // 处理多选框组和多项选择器的数据回显
        if (Array.isArray(params[v1.id])) {
          v1.props.value = params[v1.id]
        } else {
          // 如果后端返回的是字符串（逗号分隔），转换为数组
          v1.props.value = String(params[v1.id]).split(',').filter((item: string) => item !== '')
        }
      } else if (v1.type == 'SWITCH') {
        v1.props.value = normalizeSwitchValue(params[v1.id], v1.props)
      } else if (v1.type == 'DATE' && params[v1.id]) {
        v1.props.value = formatDisplayDateTime(params[v1.id], v1.props)
      } else if (v1.type == 'DATE_INTERVAL' && params[v1.id]) {
        // 确保 v1.props.value 是对象而不是字符串
        if (typeof v1.props.value !== 'object' || v1.props.value === null) {
          v1.props.value = {}
        }
        v1.props.value.start = formatDisplayDateTime(params[v1.id].start, v1.props)
        v1.props.value.end = formatDisplayDateTime(params[v1.id].end, v1.props)
      } else if (v1.type == 'TIME') {
        v1.props.value = formatDisplayTime(params[v1.id], getValueFormat(v1.props, 'HH:mm:ss'))
      } else if (v1.type == 'TIME_INTERVAL') {
        // 确保 v1.props.value 是对象而不是字符串
        if (typeof v1.props.value !== 'object' || v1.props.value === null) {
          v1.props.value = {}
        }
        v1.props.value.start = formatDisplayTime(params[v1.id]?.start, getValueFormat(v1.props, 'HH:mm:ss'))
        v1.props.value.end = formatDisplayTime(params[v1.id]?.end, getValueFormat(v1.props, 'HH:mm:ss'))
      } else {
        v1.props.value = params[v1.id]
      }
      form[v1.id] = v1.props.value
      getQuery(formList, form, v1, id)
      applySelectFormOptions(formList, form, id, v1.id)
      if (v1.type == 'SUBFORM') {
        let values = params[v1.id]
        v1.list = []
        if (values && Array.isArray(values)) {
          values.map((v2, index) => {
            let children = JSON.parse(JSON.stringify(v1.children))
            children.map((v: { id: any; field: any; }) => {
              let id = JSON.parse(JSON.stringify(v.id))
              v.field = JSON.parse(JSON.stringify(v.id))
              v.id = id + (index == 0 ? '' : v1.list.length)
            })
            v1.list.push(children)
            setUpDateSubFormData(v2, v1.list[index], form, disabled)
          })
        } else {
          let children = JSON.parse(JSON.stringify(v1.children))
          children.map((v: { id: any; field: any; props: any }) => {
            v.props.disabled = disabled
            v.field = JSON.parse(JSON.stringify(v.id))
          })
          v1.list.push(children)
        }
        setTimeout(() => {
          let items = {}
          v1.list.map((v3: any[]) => {
            v3.map((v2: { id: string; props: { value: any; }; }) => {
              let id = v2.id.split('.')
              items[id[1]] = v2.props.value
            })
          })
          v1.props.value = items
          form[v1.id] = v1.props.value
        }, 1000)
      }
      if (v1.children && v1.type !== 'SUBFORM') {
        setUpDateData(params, v1.children, form, disabled, id)
      }
    })
  }
}
export async function setUpDateSubFormData(params: any, formList: any, form: any, disabled: any) {
  if (formList && Array.isArray(formList)) {
    //   // 第一步：收集所有需要查询的用户和部门ID
    //   const userIds: string[] = []
    //   const deptIds: string[] = []

    //   formList.forEach(v1 => {
    //     // 收集USER类型字段的ID
    //     if (v1.type == 'USER' && params[v1.field]) {
    //       const userId = String(params[v1.field])
    //       if (!userCache.has(userId)) userIds.push(userId)
    //     }
    //     // 收集DEPT类型字段的ID
    //     if (v1.type == 'DEPT' && params[v1.field]) {
    //       const deptId = String(params[v1.field])
    //       if (!deptCache.has(deptId)) deptIds.push(deptId)
    //     }
    //     // 收集USER_MULTIPLE类型字段的ID
    //     if (v1.type == 'USER_MULTIPLE' && params[v1.field]) {
    //       const fieldVal = params[v1.field]
    //       if (Array.isArray(fieldVal)) {
    //         fieldVal.forEach((uid: any) => {
    //           const userId = String(uid)
    //           if (!userCache.has(userId)) userIds.push(userId)
    //         })
    //       }
    //     }
    //     // 收集DEPT_MULTIPLE类型字段的ID
    //     if (v1.type == 'DEPT_MULTIPLE' && params[v1.field]) {
    //       const fieldVal = params[v1.field]
    //       if (Array.isArray(fieldVal)) {
    //         fieldVal.forEach((did: any) => {
    //           const deptId = String(did)
    //           if (!deptCache.has(deptId)) deptIds.push(deptId)
    //         })
    //       }
    //     }
    //   })

    //   // 去重
    //   const uniqueUserIds = [...new Set(userIds)]
    //   const uniqueDeptIds = [...new Set(deptIds)]

    //   // 第二步：批量查询用户和部门信息
    //   await Promise.all([
    //     uniqueUserIds.length > 0 ? batchGetUsers(uniqueUserIds) : Promise.resolve(new Map()),
    //     uniqueDeptIds.length > 0 ? batchGetDepts(uniqueDeptIds) : Promise.resolve(new Map())
    //   ])

    // 第三步：设置表单数据
    const referenceStore = useReferenceStore();
    formList.map(v1 => {
      v1.props.disabled = disabled
      if (v1.component == 'qUpload' && Array.isArray(params[v1.field])) {
        params[v1.field].map(v => {
          let params = {
            ...v, url: getInitialAttachmentUrl(v), name: v.fileName ? v.fileName : '无名', example: false
          }
          v1.props.value.push(params)
        })
      } else if (v1.component == 'qInputNumber' && (params[v1.field] || params[v1.field] === 0)) {
        v1.props.value = Number(params[v1.field])
      } else if (v1.type == 'USER') {
        // 从缓存中获取用户信息
        const userId = String(params[v1.field])
        const user = referenceStore.getUser(userId)
        if (user) {
          v1.props.value = [user]
        }
      } else if (v1.type == 'DEPT' && params[v1.field]) {
        // 从缓存中获取部门信息
        const deptId = String(params[v1.field])
        const dept = referenceStore.getDept(deptId)
        if (dept) {
          v1.props.value = [dept]
        }
      } else if (v1.type == 'USER_MULTIPLE' && params[v1.field]) {
        // 从缓存中获取多个用户信息
        const fieldVal = params[v1.field]
        if (Array.isArray(fieldVal)) {
          v1.props.value = fieldVal.map((uid: any) => referenceStore.getUser(String(uid))).filter(Boolean)
        }
      } else if (v1.type == 'DEPT_MULTIPLE' && params[v1.field]) {
        // 从缓存中获取多个部门信息
        const fieldVal = params[v1.field]
        if (Array.isArray(fieldVal)) {
          v1.props.value = fieldVal.map((did: any) => referenceStore.getDept(String(did))).filter(Boolean)
        }
      } else if (v1.type == 'SWITCH') {
        v1.props.value = normalizeSwitchValue(params[v1.field], v1.props)
      } else if (v1.type == 'DATE' || v1.type == 'DTAE') {
        v1.props.value = formatDisplayDateTime(params[v1.field], v1.props)
      } else if (v1.type == 'DATE_INTERVAL' && params[v1.field]) {

        if (typeof v1.props.value !== 'object' || v1.props.value === null) {
          v1.props.value = { start: '', end: '' }
        }
        v1.props.value.start = formatDisplayDateTime(params[v1.field].start, v1.props)
        v1.props.value.end = formatDisplayDateTime(params[v1.field].end, v1.props)
      } else if (v1.type == 'TIME') {
        v1.props.value = formatDisplayTime(params[v1.field], getValueFormat(v1.props, 'HH:mm:ss'))
      } else if (v1.type == 'TIME_INTERVAL') {
        if (typeof v1.props.value !== 'object' || v1.props.value === null) {
          v1.props.value = { start: '', end: '' }
        }
        v1.props.value.start = formatDisplayTime(params[v1.field]?.start, getValueFormat(v1.props, 'HH:mm:ss'))
        v1.props.value.end = formatDisplayTime(params[v1.field]?.end, getValueFormat(v1.props, 'HH:mm:ss'))
      } else {
        v1.props.value = params[v1.field]
      }
      form[v1.id] = v1.props.value
    })
  }
}
export function setFormData(params: any, formList: any, form: any, disabled: any) {
  formList.map(v1 => {
    v1.props.disabled = disabled
    if (disabled) {
      if (v1.type == 'SWITCH') {
        v1.props.value = normalizeSwitchValue(params[v1.id], v1.props)
      } else if (v1.type == 'DATE') {
        v1.props.value = formatDisplayDateTime(params[v1.id], v1.props)
      } else if (v1.type == 'DATE_INTERVAL' && params[v1.id]) {
        v1.props.value = {
          start: formatDisplayDateTime(params[v1.id].start, v1.props),
          end: formatDisplayDateTime(params[v1.id].end, v1.props),
        }
      } else if (v1.type == 'TIME') {
        v1.props.value = formatDisplayTime(params[v1.id], getValueFormat(v1.props, 'HH:mm:ss'))
      } else if (v1.type == 'TIME_INTERVAL' && params[v1.id]) {
        v1.props.value = {
          start: formatDisplayTime(params[v1.id].start, getValueFormat(v1.props, 'HH:mm:ss')),
          end: formatDisplayTime(params[v1.id].end, getValueFormat(v1.props, 'HH:mm:ss')),
        }
      } else if (v1.component == 'qUpload' && Array.isArray(params[v1.id])) {

        params[v1.id].map(v => {
          let params = {
            ...v, url: getInitialAttachmentUrl(v), name: v.fileName ? v.fileName : '无名', example: false
          }
          v1.props.value.push(params)
        })
      } else if (v1.component == 'qInputNumber' && (params[v1.id] || params[v1.id] === 0)) {
        v1.props.value = Number(params[v1.id])
      } else {
        v1.props.value = params[v1.id]
      }
    } else {
      if (v1.type == 'SWITCH') {
        v1.props.value = normalizeSwitchValue(params[v1.id], v1.props)
      } else if (v1.type == 'DATE') {
        v1.props.value = formatDisplayDateTime(params[v1.id], v1.props)
      } else if (v1.type == 'DATE_INTERVAL' && params[v1.id]) {
        let times = params[v1.id]
        v1.props.value = {
          start: formatDisplayDateTime(times.start, v1.props),
          end: formatDisplayDateTime(times.end, v1.props),
        }
      } else if (v1.type == 'TIME') {
        v1.props.value = formatDisplayTime(params[v1.id], getValueFormat(v1.props, 'HH:mm:ss'))
      } else if (v1.type == 'TIME_INTERVAL' && params[v1.id]) {
        let times = params[v1.id]
        v1.props.value = {
          start: formatDisplayTime(times.start, getValueFormat(v1.props, 'HH:mm:ss')),
          end: formatDisplayTime(times.end, getValueFormat(v1.props, 'HH:mm:ss')),
        }
      } else if ((v1.type == 'SELECT_MULTIPLE' || v1.type == 'CHECKBOX') && params[v1.id]) {
        v1.props.value = []
        let datas = params[v1.id].split(',')
        v1.props.options.map(val => {
          datas.map(v2 => {
            if (val.label == v2) {
              v1.props.value.push(val.value)
            }
          })
        })
      } else if (v1.component == 'qUpload' && Array.isArray(params[v1.id])) {

        params[v1.id].map(v => {
          let params = {
            ...v, url: getInitialAttachmentUrl(v), name: v.fileName ? v.fileName : '无名', example: false
          }
          v1.props.value.push(params)
        })
      } else if (v1.component == 'qInputNumber' && (params[v1.id] || params[v1.id] === 0)) {
        v1.props.value = Number(params[v1.id])
      } else if (v1.type == 'USER') {
        getUsersByIds([params[v1.id]]).then(res => {
          v1.props.value = res
        })
      } else if (v1.type == 'DEPT') {

        getDeptsByIds([params[v1.id]]).then(res => {
          v1.props.value = res.map((v => { return { id: v.id, label: v.deptName } }))
        })
      } else if (v1.type == 'USER_MULTIPLE') {
        if (disabled) {
          getUsersByIds(params[v1.id].split(',')).then(res => {
            v1.props.value = res
          })
        } else {
          getUsersByIds(params[v1.id]).then(res => {
            v1.props.value = res
          })
        }

      } else if (v1.type == 'DEPT_MULTIPLE') {

        getDeptsByIds(params[v1.id]).then(res => {
          v1.props.value = res.map((v => { return { id: v.id, label: v.deptName } }))
        })
      } else {
        v1.props.value = params[v1.id]
      }
    }

    form[v1.id] = v1.props.value
    if (v1.type == 'SUBFORM') {
      let values = params[v1.id]
      v1.list = []
      if (values && Array.isArray(values)) {
        values.map(v2 => {
          let children = JSON.parse(JSON.stringify(v1.children))

          setUpDateData(v2, children, form, disabled)
          children.map((v: { id: any; field: any; }) => {
            let id = JSON.parse(JSON.stringify(v.id))
            v.field = JSON.parse(JSON.stringify(v.id))
            v.id = id + v1.list.length
          })
          v1.list.push(children)
        })
      }


    }
    if (v1.children && v1.type !== 'SUBFORM') {
      setUpDateData(params, v1.children, form, disabled)
    }

  })
}
