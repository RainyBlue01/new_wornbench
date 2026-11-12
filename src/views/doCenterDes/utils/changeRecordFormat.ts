
import type { Ref } from 'vue'
import type { FormConfs } from '@/types/form'

export function createChangeRecordFormatter({ formConfs, userNameMap, deptNameMap }: {
  formConfs: Ref<FormConfs>
  userNameMap: Ref<Map<string, string>>
  deptNameMap: Ref<Map<string, string>>
}) {



// 获取字段名称
const getFieldName = (fieldCode: string): string => {
    if (!formConfs.value.formList || !Array.isArray(formConfs.value.formList)) {
        return fieldCode
    }

    // 在表单配置中查找字段
    const findField = (list: any[]): string => {
        for (const item of list) {
            // 检查是否是子表单字段（格式：子表单ID.子字段ID）
            if (fieldCode.includes('.')) {
                const [parentId, childId] = fieldCode.split('.')

                // 如果当前项是子表单且ID匹配
                if (item.id === parentId) {
                    // 子表单的子字段配置在 children 数组中（子字段的id包含父ID前缀）
                    const subFormFieldList = item.children || []
                    const childField = subFormFieldList.find((child: any) => child.id === fieldCode)
                    if (childField) {
                        return `${item.title || parentId} - ${childField.title || childId}`
                    }
                }
            } else {
                // 普通字段查找
                if (item.id === fieldCode) {
                    return item.title || fieldCode
                }
            }

            // 递归查找子表单（针对嵌套结构）
            if (item.children && Array.isArray(item.children)) {
                const found = findField(item.children)
                if (found !== fieldCode) return found
            }
        }
        return fieldCode
    }

    return findField(formConfs.value.formList)
}

// 格式化字段值，参考 fixRecord.vue 中的 formatFieldValue 方法
const formatFieldValue = (value: any, fieldCode: string): string => {


    if (value === null || value === undefined || value === '') {
        return '-'
    }

    // 检查 value 是否是对象且键不包含 '.' (子表单字段格式：{ childId: value })
    if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length > 0) {
        const keys = Object.keys(value)


        // 判断是否为子表单数据：检查键是否为纯子字段ID（不包含点号）
        const isSubformData = keys.every(k => !k.includes('.')) && keys.length > 0


        if (isSubformData) {

            // 这是子表单的行数据：{ childId: value, ... }
            // 需要找到父表单ID来构建完整的 fieldCode
            const items: string[] = []

            for (const childId in value) {
                if (value.hasOwnProperty(childId)) {
                    const fieldValue = value[childId]

                    // 尝试从 formList 中找到包含此 childId 的子表单
                    const fullFieldCode = findFullFieldCode(fieldCode, childId)
                    const fieldName = getFieldName(fullFieldCode || childId)
                    const formattedValue = formatSingleFieldValue(fieldValue, fullFieldCode || childId)
                    items.push(`${fieldName}: ${formattedValue}`)
                }
            }

            return items.join('\n')
        }
    }

    // 检查 value 是否是对象且键包含 '.' (子表单字段格式)
    if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).some(k => k.includes('.'))) {

        // 这是子表单的字段数据：{ "父ID.子ID": 值, ... }
        const items: string[] = []

        for (const key in value) {
            if (value.hasOwnProperty(key)) {
                const fieldValue = value[key]
                const fieldName = getFieldName(key)
                const formattedValue = formatSingleFieldValue(fieldValue, key)
                items.push(`${fieldName}: ${formattedValue}`)
            }
        }

        return items.join('\n')
    }

    // 检查是否是子表单数据（数组且每个元素是对象）
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && !Array.isArray(value[0])) {

        // 子表单数据：格式化每一行
        const formattedRows = value.map((row: any) => {
            const rowItems: string[] = []

            // 遍历该行的所有字段
            for (const key in row) {
                if (row.hasOwnProperty(key)) {
                    const fieldValue = row[key]
                    // 使用完整的 key（父字段ID.子字段ID）来查找配置和名称
                    const fieldName = getFieldName(key)
                    const formattedValue = formatSingleFieldValue(fieldValue, key)
                    // 每行数据格式：字段名: 值
                    rowItems.push(`${fieldName}: ${formattedValue}`)
                }
            }

            return rowItems.join('\n')
        })

        // 多行数据用换行分隔，并添加行号

        return formattedRows.map((row, index) => `第${index + 1}行:\n${row}`).join('\n\n')
    }

    // 普通字段，使用原有逻辑

    return formatSingleFieldValue(value, fieldCode)
}

// 查找完整的字段代码（父ID.子ID）
const findFullFieldCode = (_parentFieldCode: string, childId: string): string => {
    if (!formConfs.value.formList || !Array.isArray(formConfs.value.formList)) {
        return childId
    }



    const findInList = (list: any[]): string | null => {
        for (const item of list) {
            // 检查是否是子表单且包含此 childId
            if (item.type === 'SUBFORM' && item.children && Array.isArray(item.children)) {

                const childField = item.children.find((child: any) => {
                    const match = child.id === childId || child.id.endsWith('.' + childId)

                    return match
                })
                if (childField) {
                    // 返回完整的 fieldCode：父ID.子ID
                    const fullCode = childField.id.includes('.') ? childField.id : `${item.id}.${childId}`

                    return fullCode
                }
            }

            // 递归查找
            if (item.children && Array.isArray(item.children)) {
                const found = findInList(item.children)
                if (found) return found
            }
        }
        return null
    }

    const result = findInList(formConfs.value.formList) || childId

    return result
}

// 格式化单个字段值
const formatSingleFieldValue = (value: any, fieldCode: string): string => {
    if (value === null || value === undefined || value === '') {
        return '-'
    }
    if (Array.isArray(value) && value.length === 0) {
        return '-'
    }

    // 查找字段配置
    const findFieldConfig = (list: any[]): any => {
        for (const item of list) {
            // 支持子表单字段查找（格式：父字段ID.子字段ID）
            if (fieldCode.includes('.')) {
                const dotIndex = fieldCode.indexOf('.')
                const parentId = fieldCode.substring(0, dotIndex)

                // 查找父字段（子表单）
                if (item.id === parentId) {
                    // 子表单的子字段配置在 children 数组中（子字段的id包含父ID前缀）
                    const subFormFieldList = item.children || []
                    const childField = subFormFieldList.find((child: any) => child.id === fieldCode)
                    if (childField) return childField
                }
            } else {
                // 普通字段查找
                if (item.id === fieldCode) {
                    return item
                }
            }

            // 递归查找子表单（针对嵌套结构）
            if (item.children && Array.isArray(item.children)) {
                const found = findFieldConfig(item.children)
                if (found) return found
            }
        }
        return null
    }

    const fieldConfig = findFieldConfig(formConfs.value.formList || [])

    if (!fieldConfig) {
        // 如果没有找到配置，尝试智能判断
        if (Array.isArray(value)) {
            return value.join('、')
        }
        return String(value)
    }

    const fieldType = fieldConfig.type
    const component = fieldConfig.component

    // 用户选择（支持子表单中的用户字段）
    if (fieldType == 'USER' && value) {
        if (Array.isArray(value)) {
            return value.map((v: any) => {
                // 如果是对象，提取名称；如果是字符串，从缓存中查找
                if (typeof v === 'object') {
                    return v.nickname || v.name || v.userName || v
                }
                // 字符串ID，从缓存中查找
                return userNameMap.value.get(String(v)) || String(v)
            }).join('、')
        }
        // 单个值处理
        if (typeof value === 'object') {
            return value.nickname || value.name || value.userName || String(value)
        }
        // 字符串ID，从缓存中查找
        return userNameMap.value.get(String(value)) || String(value)
    }

    // 部门选择（支持子表单中的部门字段）
    if (fieldType == 'DEPT' && value) {
        if (Array.isArray(value)) {
            return value.map((v: any) => {
                if (typeof v === 'object') {
                    return v.deptName || v.label || v.name || v
                }
                // 字符串ID，从缓存中查找
                return deptNameMap.value.get(String(v)) || String(v)
            }).join('、')
        }
        if (typeof value === 'object') {
            return value.deptName || value.label || value.name || String(value)
        }
        // 字符串ID，从缓存中查找
        return deptNameMap.value.get(String(value)) || String(value)
    }

    // 多选用户
    if (fieldType == 'USER_MULTIPLE' && Array.isArray(value) && value.length > 0) {
        return value.map((v: any) => {
            if (typeof v === 'object') {
                return v.nickname || v.name || v.userName || v
            }
            // 字符串ID，从缓存中查找
            return userNameMap.value.get(String(v)) || String(v)
        }).join('、')
    }

    // 多选部门
    if (fieldType == 'DEPT_MULTIPLE' && Array.isArray(value) && value.length > 0) {
        return value.map((v: any) => {
            if (typeof v === 'object') {
                return v.deptName || v.label || v.name || v
            }
            // 字符串ID，从缓存中查找
            return deptNameMap.value.get(String(v)) || String(v)
        }).join('、')
    }

    // 日期区间
    if (fieldType == 'DATE_INTERVAL' && value) {
        if (typeof value === 'object' && value.start && value.end) {
            return `${value.start} ~ ${value.end}`
        }
        return String(value)
    }

    // 时间区间
    if (fieldType == 'TIME_INTERVAL' && value) {
        if (typeof value === 'object' && value.start && value.end) {
            return `${value.start} ~ ${value.end}`
        }
        return String(value)
    }

    // 复选框/多选下拉
    if ((fieldType == 'CHECKBOX' || fieldType == 'SELECT_MULTIPLE') && value) {
        if (Array.isArray(value)) {
            const options = fieldConfig.props?.options || []
            return value.map((v: any) => {
                const opt = options.find((o: any) => o.value === v)
                return opt ? opt.label : v
            }).join('、')
        }
        return String(value)
    }

    // 单选框/下拉
    if ((fieldType == 'RADIO' || fieldType == 'SELECT') && value) {
        const options = fieldConfig.props?.options || []
        const opt = options.find((o: any) => o.value === value)
        return opt ? opt.label : String(value)
    }

    // 关联数据
    if (fieldType == 'RELATION_DATA' && value) {
        if (Array.isArray(value)) {
            return value.map((v: any) => {
                if (typeof v === 'object') {
                    return v.name || v.title || v.label || v
                }
                return v
            }).join('、')
        }
        if (typeof value === 'object') {
            return value.name || value.title || value.label || String(value)
        }
        return String(value)
    }

    // 数字
    if (component == 'qInputNumber' && value) {
        return String(Number(value))
    }

    // 数组类型
    if (Array.isArray(value)) {
        return value.map((v: any) => {
            if (typeof v === 'object') {
                // 尝试从对象中提取有用的值
                return v.value || v.label || v.name || JSON.stringify(v)
            }
            return v
        }).join('、')
    }

    // 默认返回
    return String(value)
}
  return { getFieldName, formatFieldValue }
}
