import { relationComponentData } from '@/api/common/index'
import { applySelectFormOptions, isOtherFormDataSource } from '@/utils/formSelectOptions'
import { applyFormLinkage } from '@/utils/formLinkage'
import { calculate } from '@/components/expression/formula'

const pendingExpressionCalculateMap = new Map<string, Promise<any>>()
const INIT_ONLY_EXPRESSION_FUNCTION_PATTERNS = [
  /^getFormValue$/,
  /^getSubFormValue$/,
]

const getExpressionCalculateKey = (formId: any, field: any) => {
  return [formId || '', field?.id || '', field?.props?.expressionValue || ''].join('__')
}

const getExpressionFunctionNames = (expressionValue: string) => {
  if (!expressionValue) return []

  const normalizedExpression = String(expressionValue).replace(/@#|#@/g, '')
  const matchedNames = normalizedExpression.match(/[A-Za-z_][A-Za-z0-9_]*(?=\s*\()/g) || []
  return Array.from(new Set(matchedNames))
}

const shouldSkipExpressionRecalculate = (field: any) => {
  const expressionValue = field?.props?.expressionValue
  const currentValue = field?.props?.value

  if (!expressionValue || currentValue === '' || currentValue === undefined || currentValue === null) {
    return true
  }

  const functionNames = getExpressionFunctionNames(expressionValue)
  const containsFormValueFunction = functionNames.some((functionName) =>
    INIT_ONLY_EXPRESSION_FUNCTION_PATTERNS.some((pattern) => pattern.test(functionName)),
  )

  return containsFormValueFunction
}

const calculateExpressionOnce = (formId: any, field: any) => {
  const key = getExpressionCalculateKey(formId, field)
  const pendingTask = pendingExpressionCalculateMap.get(key)
  if (pendingTask) return pendingTask

  const task = Promise.resolve(calculate(field.props.expressionValue)).finally(() => {
    pendingExpressionCalculateMap.delete(key)
  })
  pendingExpressionCalculateMap.set(key, task)
  return task
}

export function getQuery(formList: any, form: any, value: any, id: any, withTempProps = false) {
  if (formList && Array.isArray(formList)) {
    formList.map(async v => {
      if (v.type === 'RELATION_QUERY' || v.type === 'RELATION_DATA') {
        const from = {}
        v.props.conditionList.map(vvs => {
          from[vvs.field] = form[vvs.field] ? form[vvs.field] : ''
          if (vvs.field == value.id) {
            setTimeout(() => {
              const params = {
                field: v.id,
                formId: id,
                relationFormId: v.props.formId,
                data: from
              }
              relationComponentData(params).then(res => {
                if (v.type === 'RELATION_DATA') {
                  const a = []
                  res.map(vss => {
                    let item = ''
                    v.props.fieldList.map((v1s, index) => {
                      if (v1s.type === 'RADIO' || v1s.type === 'SELECT' || v1s.type === 'SWITCH') {
                        let val = JSON.parse(JSON.stringify(vss[v1s.id]))
                        // vss[v1s.id] = val.value
                        item = item + (index == 0 ? '' : ',') + val.label
                      } else if (v1s.type === 'CHECKBOX' || v1s.type === 'SELECT_MULTIPLE') {
                        let val = JSON.parse(JSON.stringify(vss[v1s.id]))
                        // vss[v1s.id] = val.map(v => {
                        //   return v.value
                        // })
                        item = item + (index == 0 ? '' : ',') + val.map((v, index1) => {
                          return (index1 == 0 ? '' : ',') + v.label
                        })
                      } else if (v1s.type === 'DATE_INTERVAL' || v1s.type === 'TIME_INTERVAL') {
                        let val = JSON.parse(JSON.stringify(vss[v1s.id]))
                        // vss[v1s.id] = val.map(v => {
                        //   return v.value
                        // })
                        item = item + (index == 0 ? '' : ',') + val.start + '-' + val.end
                      } else if (v1s.type === 'ADDRESS' || v1s.type === 'LOCATION') {
                        let val = JSON.parse(JSON.stringify(vss[v1s.id]))
                        // vss[v1s.id] = val.map(v => {
                        //   return v.value
                        // })
                        item = item + (index == 0 ? '' : ',') + val.prov + '/' + val.city + '/' + val.dist + '/' + val.det
                      } else if (v1s.type === 'PICTURE' || v1s.type === 'ATTACH') {
                        let val = JSON.parse(JSON.stringify(vss[v1s.id]))
                        // vss[v1s.id] = JSON.stringify(val)
                        item = item + (index == 0 ? '' : ',') + val.map((v, index1) => {
                          return (index1 == 0 ? '' : ',') + (v.fileName ? v.fileName : '无名称')
                        })
                      } else if (v1s.type === 'USER') {
                        let val = JSON.parse(JSON.stringify(vss[v1s.id]))
                        // vss[v1s.id] = JSON.stringify(val)
                        item = item + (index == 0 ? '' : ',') + val.nickname
                      } else if (v1s.type === 'USER_MULTIPLE') {
                        let val = JSON.parse(JSON.stringify(vss[v1s.id]))
                        // vss[v1s.id] = JSON.stringify(val)
                        item = item + (index == 0 ? '' : ',') + val.map((v, index1) => {
                          return (index1 == 0 ? '' : ',') + (v.nickname ? v.nickname : '无名称')
                        })
                      } else if (v1s.type === 'DEPT') {
                        let val = JSON.parse(JSON.stringify(vss[v1s.id]))
                        // vss[v1s.id] = JSON.stringify(val)
                        item = item + (index == 0 ? '' : ',') + val.deptName
                      } else if (v1s.type === 'DEPT_MULTIPLE') {
                        let val = JSON.parse(JSON.stringify(vss[v1s.id]))
                        // vss[v1s.id] = JSON.stringify(val)
                        item = item + (index == 0 ? '' : ',') + val.map((v, index1) => {
                          return (index1 == 0 ? '' : ',') + (v.deptName ? v.deptName : '无名称')
                        })
                      } else {
                        item = item + (index == 0 ? '' : ',') + vss[v1s.id]
                      }

                    })
                    let ass = vss.id
                    a.push({ label: item, value: ass, data: vss })
                    // a.map(v1 => {
                    //   console.log(v1.value == v.props.value)
                    //   console.log(v1.value)
                    //   console.log(v.props.value)
                    // })

                  })
                  v.props.options = a
                } else {
                  res.map(vss => {
                    v.props.fieldList.map((v1s) => {
                      if (v1s.type === 'RADIO' || v1s.type === 'SELECT' || v1s.type === 'SWITCH') {
                        let val = JSON.parse(JSON.stringify(vss[v1s.id]))
                        vss[v1s.id] = val.label
                      } else if (v1s.type === 'CHECKBOX' || v1s.type === 'SELECT_MULTIPLE') {
                        let val = JSON.parse(JSON.stringify(vss[v1s.id]))
                        vss[v1s.id] = val.map(v => {
                          return v.label
                        })

                      } else if (v1s.type === 'PICTURE' || v1s.type === 'ATTACH') {
                        let val = JSON.parse(JSON.stringify(vss[v1s.id]))
                        vss[v1s.id] = JSON.stringify(val)
                      }

                    })
                  })
                  v.props.value = res
                }
              })
            }, 200)
          }
        })
      }

      if ((v.type === 'SELECT' || v.type === 'SELECT_MULTIPLE') && isOtherFormDataSource(v.props) && v.props.conditionList?.length) {
        const shouldRefresh = v.props.conditionList.some(
          (c: any) => c.field === value.id,
        )
        if (shouldRefresh) {
          applySelectFormOptions([v], form, id, value.id, withTempProps)
        }
      }

      if (v.children && Array.isArray(v.children)) {
        getQuery(v.children, form, value, id, withTempProps)
      }
      if (v.list && Array.isArray(v.list)) {
        v.list.map(v1 => {
          getQuery(v1, form, value, id, withTempProps)
        })

      }
    })
  }
}
export function setExpressionValue(formList: any, form: any, value: any, id: any, withTempProps = false, triggerLinkage = true, appId?: string | number) {
  if (formList && Array.isArray(formList)) {
    formList.map(async v => {
      if (v.type !== 'SUBFORM' && v.type !== 'TITLE' && v.type !== 'COL' && v.type !== 'ROW' && v.type !== 'SPLIT_LINE' && v.type !== 'BUTTON_CONNECTOR') {
        if (v.props.label == '函数' || v.props.expressionLabel == '函数') {
          if (shouldSkipExpressionRecalculate(v)) {
            // console.log('计算函数', v.props.label, v.props.expressionLabel, v.id)
            // v.props.defaultValue = await calculateExpressionOnce(id, v);
            setTimeout(async () => {
              v.props.value = await calculateExpressionOnce(id, v);
              // console.log(v.props)
              form[v.id] = v.props.value
            })
          }

        }
      }
      if (v.type === 'RELATION_QUERY' || v.type === 'RELATION_DATA') {
        const from = {}
        v.props.conditionList.map(vvs => {
          if (form[vvs.field]) {
            from[vvs.field] = form[vvs.field] ? form[vvs.field] : ''
          }

          if (vvs.field == value.id) {
            setTimeout(() => {
              const params = {
                field: v.id,
                formId: id,
                relationFormId: v.props.formId,
                data: from
              }
              if (Object.keys(from).length > 0) {
                relationComponentData(params).then(res => {
                  if (v.type === 'RELATION_DATA') {
                    const a = []
                    res.map(vss => {
                      let item = ''
                      v.props.fieldList.map((v1s, index) => {
                        if (v1s.type === 'RADIO' || v1s.type === 'SELECT' || v1s.type === 'SWITCH') {
                          let val = JSON.parse(JSON.stringify(vss[v1s.id]))
                          // vss[v1s.id] = val.value
                          item = item + (index == 0 ? '' : ',') + val.label
                        } else if (v1s.type === 'DATE_INTERVAL' || v1s.type === 'TIME_INTERVAL') {
                          let val = JSON.parse(JSON.stringify(vss[v1s.id]))
                          // vss[v1s.id] = val.map(v => {
                          //   return v.value
                          // })
                          item = item + (index == 0 ? '' : ',') + val.start + '-' + val.end
                        } else if (v1s.type === 'ADDRESS' || v1s.type === 'LOCATION') {
                          let val = JSON.parse(JSON.stringify(vss[v1s.id]))
                          // vss[v1s.id] = val.map(v => {
                          //   return v.value
                          // })
                          item = item + (index == 0 ? '' : ',') + val.prov + '/' + val.city + '/' + val.dist + '/' + val.det
                        } else if (v1s.type === 'CHECKBOX' || v1s.type === 'SELECT_MULTIPLE') {
                          let val = JSON.parse(JSON.stringify(vss[v1s.id]))
                          // vss[v1s.id] = val.map(v => {
                          //   return v.value
                          // })
                          item = item + (index == 0 ? '' : ',') + val.map((v, index1) => {
                            return (index1 == 0 ? '' : ',') + v.label
                          })
                        } else if (v1s.type === 'PICTURE' || v1s.type === 'ATTACH') {
                          let val = JSON.parse(JSON.stringify(vss[v1s.id]))
                          // vss[v1s.id] = JSON.stringify(val)
                          item = item + (index == 0 ? '' : ',') + val.map((v, index1) => {
                            return (index1 == 0 ? '' : ',') + (v.fileName ? v.fileName : '无名称')
                          })
                        } else if (v1s.type === 'USER') {
                          let val = JSON.parse(JSON.stringify(vss[v1s.id]))
                          // vss[v1s.id] = JSON.stringify(val)
                          item = item + (index == 0 ? '' : ',') + val.nickname
                        } else if (v1s.type === 'USER_MULTIPLE') {
                          let val = JSON.parse(JSON.stringify(vss[v1s.id]))
                          // vss[v1s.id] = JSON.stringify(val)
                          item = item + (index == 0 ? '' : ',') + val.map((v, index1) => {
                            return (index1 == 0 ? '' : ',') + (v.nickname ? v.nickname : '无名称')
                          })
                        } else if (v1s.type === 'DEPT') {
                          let val = JSON.parse(JSON.stringify(vss[v1s.id]))
                          // vss[v1s.id] = JSON.stringify(val)
                          item = item + (index == 0 ? '' : ',') + val.deptName
                        } else if (v1s.type === 'DEPT_MULTIPLE') {
                          let val = JSON.parse(JSON.stringify(vss[v1s.id]))
                          // vss[v1s.id] = JSON.stringify(val)
                          item = item + (index == 0 ? '' : ',') + val.map((v, index1) => {
                            return (index1 == 0 ? '' : ',') + (v.deptName ? v.deptName : '无名称')
                          })
                        } else {
                          item = item + (index == 0 ? '' : ',') + vss[v1s.id]
                        }

                      })
                      let ass = vss.id
                      a.push({ label: item, value: ass, data: vss })

                    })
                    v.props.options = a
                  } else {
                    res.map(vss => {
                      v.props.fieldList.map((v1s) => {
                        if (v1s.type === 'PICTURE' || v1s.type === 'ATTACH') {
                          let val = JSON.parse(JSON.stringify(vss[v1s.id]))
                          vss[v1s.id] = JSON.stringify(val)
                        }

                      })
                    })
                    v.props.value = res
                  }
                })
              } else {
                if (v.type === 'RELATION_DATA') {
                  v.props.value = ''
                  v.props.options = []
                } else {
                  v.props.value = []
                }

              }
            }, 200)
          }
        })
      }

      if (v.type === 'SELECT' || v.type === 'SELECT_MULTIPLE') {
        if (isOtherFormDataSource(v.props) && value?.id) {
          applySelectFormOptions([v], form, id, value.id, withTempProps)
        }
      }

      if (v.children && Array.isArray(v.children)) {
        setExpressionValue(v.children, form, value, id, withTempProps, false, appId)
      }
      if (v.list && Array.isArray(v.list)) {
        v.list.map(v1 => {
          setExpressionValue(v1, form, value, id, withTempProps, false, appId)
        })

      }
    })
  }
  if (triggerLinkage) {
    applyFormLinkage(formList, form, String(id), value?.id, withTempProps, appId)
  }
}
