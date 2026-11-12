import field from '@/utils/field'
import { getDataForm } from '@/data/data_form.js'
import { restoreFormConditionValue } from '../formConditionValue'


export function setFieldControl(formList: any, fieldControl: any, isHide: any) {
  // 如果 fieldControl 为空，则不做处理（保持默认显示）
  if (!Array.isArray(fieldControl) || fieldControl.length === 0) return;

  // 构建 fieldCode 映射表，提高查找效率
  const controlMap = new Map();
  fieldControl.forEach(fc => {
    if (fc.fieldCode) {
      controlMap.set(fc.fieldCode, fc);
    }
  });

  // 递归处理函数
  const processFields = (fields: any[]) => {
    fields.forEach(v => {
      // 查找当前字段在 fieldControl 中的配置
      const control = controlMap.get(v.id) || controlMap.get(v.field);

      if (control) {
        // 如果在 fieldControl 中找到了匹配项，则应用其显示和编辑规则
        // view: true 表示可见，edit: true 表示可编辑
        v.showItem = !control.view;
        if (v.props) {
          v.props.disabled = !control.edit;
        }
      } else {
        // 如果 fieldControl 中没有该 fieldCode，则隐藏该字段
        v.showItem = isHide;
      }

      // 递归处理子组件
      if (v.children && Array.isArray(v.children)) {
        processFields(v.children);
      }
      // 递归处理子表单列表
      if (v.list && Array.isArray(v.list)) {
        v.list.forEach((subForm: any) => {
          processFields(subForm);
        });
      }
    });
  };

  processFields(formList);
}
/**
 * 设置表单逻辑规则，支持子表单和普通组件互相控制
 * @param formList - 表单组件列表
 * @param formLogics - 表单逻辑规则列表
 */
export function setFormLogics(formList: any, formLogics: any) {
  // console.log('setFormLogics called with formLogics:', formLogics)
  if (formLogics && formLogics.length > 0) {
    // 第一步：构建组件映射表（包括普通组件、子表单模板和子表单实际数据行中的组件）
    const componentMap = new Map<string, any>()

    // 递归收集所有组件
    const collectComponents = (list: any[], parentSubform?: any) => {
      list.forEach(item => {
        // 收集有 id 的组件（普通组件和子表单模板）
        if (item.id) {
          componentMap.set(item.id, { component: item, parentSubform })
        }

        // 如果是子表单，需要收集两部分：
        // 1. children 中的模板定义
        // 2. list 中的实际数据行
        if (item.type === 'SUBFORM') {
          // 收集模板定义
          if (item.children) {
            collectComponents(item.children, item)
          }

          // 收集实际数据行中的组件
          if (item.list && Array.isArray(item.list)) {
            item.list.forEach((row: any, rowIndex: number) => {
              if (Array.isArray(row)) {
                row.forEach((field: any) => {
                  // 使用 id 作为唯一标识
                  if (field.id) {
                    componentMap.set(field.id, {
                      component: field,
                      parentSubform: item,
                      rowIndex
                    })
                  }
                })
              }
            })
          }
        }

        // 处理栅格布局的 children
        if (item.children && item.type !== 'SUBFORM') {
          collectComponents(item.children, parentSubform)
        }
      })
    }

    collectComponents(formList)
    // console.log('Component map size:', componentMap.size)
    // console.log('Component map keys:', Array.from(componentMap.keys()))

    // 第二步：遍历所有逻辑规则
    formLogics.forEach((rule: { mode: string; logicConditions: any[]; format: string; fieldCodes: any[]; }, ruleIndex: number) => {
      const logicRule = {
        logic: rule.mode === 'all' ? 'and' : 'or',
        conditions: []
      }

      // 遍历所有条件
      rule.logicConditions.forEach((condition: { fileCode: any; condition: string; value: any; }) => {
        // console.log('Processing condition for fileCode:', condition.fileCode)
        const componentInfo = componentMap.get(condition.fileCode)

        if (!componentInfo) {
          // console.warn('Component not found for fileCode:', condition.fileCode)
          return
        }

        const { component } = componentInfo
        // console.log('Found component:', component.type, 'parentSubform:', !!parentSubform)

        // 获取符号类型
        let symbol = ''
        const defaults = getDataForm(rule.format === 'yyyy' ? 'yyyy' : component.type)

        if (component.type !== 'ADDRESS' && component.type !== 'LOCATION') {
          defaults?.default?.forEach((item: { value: any; type: string; }) => {
            if (item.value === condition.condition) {
              symbol = item.type
            }
          })
        } else {
          symbol = condition.condition
        }

        // 获取当前值（优先从 props.value，如果没有则从其他属性获取）
        let currentValue = component.props?.value ?? component.value ?? ''

        // 特殊处理人员/部门类型
        if (component.type === 'DEPT' || component.type === 'USER') {
          currentValue = Array.isArray(component.props?.value) && component.props.value.length > 0
            ? component.props.value[0].id
            : (Array.isArray(component.value) && component.value.length > 0 ? component.value[0].id : '')
        }
        if (component.type === 'DEPT_MULTIPLE' || component.type === 'USER_MULTIPLE') {
          currentValue = Array.isArray(component.props?.value)
            ? component.props.value.map((v: any) => v.id)
            : (Array.isArray(component.value) ? component.value.map((v: any) => v.id) : [])
        }

        // console.log('Condition value for', condition.fileCode, ':', currentValue)

        logicRule.conditions.push({
          field: condition.fileCode,
          symbol,
          extra: {
            input: currentValue,
            config: restoreFormConditionValue(condition.condition, condition.value)
          }
        })
      })

      // 第三步：判断逻辑规则是否满足
      if (logicRule.conditions.length > 0) {
        let isMatch = false
        const results: boolean[] = []

        logicRule.conditions.forEach(cond => {
          const result = field.getMolde(cond)
          results.push(result)
        })

        const hasFalse = results.indexOf(false)
        const hasTrue = results.indexOf(true)

        if (logicRule.logic === 'and') {
          isMatch = hasFalse === -1
        } else if (logicRule.logic === 'or') {
          isMatch = hasTrue !== -1
        }

        // 第四步：应用显示/隐藏规则
        rule.fieldCodes.forEach(targetFieldCode => {
          // console.log('Applying rule to target field:', targetFieldCode, 'isMatch:', isMatch)
          // 查找目标组件
          const targetInfo = componentMap.get(targetFieldCode)

          if (!targetInfo) {
            console.warn('Target component not found for fieldCode:', targetFieldCode)
            return
          }

          const { component: targetComponent, parentSubform: targetParentSubform } = targetInfo

          // 初始化 showList
          if (!targetComponent.showList) {
            targetComponent.showList = []
          }

          // 设置对应规则索引的状态
          targetComponent.showList[ruleIndex] = isMatch
          // console.log('Set showList for', targetFieldCode, 'at index', ruleIndex, 'to', isMatch)

          // 如果目标组件在子表单中，需要同步到子表单的所有行
          if (targetParentSubform && targetParentSubform.list && targetParentSubform.list.length > 0) {
            // console.log('Syncing to subform rows, total rows:', targetParentSubform.list.length)
            targetParentSubform.list.forEach((row: any) => {
              // 在子表单行中查找对应字段（使用 id 作为标识）
              if (Array.isArray(row)) {
                row.forEach((field: any) => {
                  if (field.id === targetFieldCode) {
                    if (!field.showList) {
                      field.showList = []
                    }
                    field.showList[ruleIndex] = isMatch
                    // console.log('Synced row', rowIdx, 'field', targetFieldCode, 'showList[' + ruleIndex + '] =', isMatch)
                  }
                })
              }
            })
          }
        })
      }
    })

    // 第五步：最终处理 - 根据 showList 设置 showItem
    const processShowItem = (list: any[]) => {
      list.forEach((item: { showList: any[]; showItem: boolean; type: string; list: any[]; children: any[]; }) => {
        // 处理普通组件
        if (item.showList && item.showList.length > 0) {
          const hasTrue = item.showList.indexOf(true) !== -1
          item.showItem = !hasTrue
          item.showList = []
        }

        // 处理子表单
        if (item.type === 'SUBFORM') {
          // 处理子表单本身的显示
          if (item.showList && item.showList.length > 0) {
            const hasTrue = item.showList.indexOf(true) !== -1
            item.showItem = !hasTrue
            item.showList = []
          }

          // 处理子表单中的每一行
          if (item.list && item.list.length > 0) {
            item.list.forEach((row: any) => {
              if (Array.isArray(row)) {
                row.forEach((field: any) => {
                  if (field.showList && field.showList.length > 0) {
                    const hasTrue = field.showList.indexOf(true) !== -1
                    field.showItem = !hasTrue
                    field.showList = []
                  }
                })
              }
            })
          }
        }

        // 递归处理 children（栅格布局）
        if (item.children && item.type !== 'SUBFORM') {
          processShowItem(item.children)
        }

        // 递归处理 list（子表单的行定义）
        if (item.list && item.type === 'SUBFORM') {
          item.list.forEach((row: any) => {
            if (Array.isArray(row)) {
              processShowItem(row)
            }
          })
        }
      })
    }

    processShowItem(formList)
  }
}
