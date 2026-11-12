import { formatSubmitTime } from './dateFormats'
import { getValueFormat } from './dateFormats'
import { formatSubmitTimeInterval } from './dateFormats'
import { walkFormFields } from '../formTree'


function isEmptyFormValue(value: any) {
  return value === '' || value === null || value === undefined || (Array.isArray(value) && value.length === 0)
}

export function submitFormData(params: any, formList: any) {
  walkFormFields(formList, (v1: any) => {
    if (v1.showItem === true && isEmptyFormValue(v1.props?.value)) {
      delete params.formData[v1.id]
    } else if (v1.type == 'BUTTON_CONNECTOR' || v1.type == 'SPLIT_LINE' || v1.props.value === '' || v1.props.value === undefined) {
      delete params.formData[v1.id]
    } else {
      if (v1.type == 'SUBFORM') {
        let values = []
        v1.list.map((v: any[]) => {
          let params1 = {}
          v.map((v1s: {
            showItem?: boolean; type: string; field: string | number; props: { value: any; format?: string };
          }) => {

            if (v1s.showItem === true && isEmptyFormValue(v1s.props.value)) return

            if ((v1s.type === 'DEPT' || v1s.type === 'USER') && Array.isArray(v1s.props.value)) {
              params1[v1s.field] = v1s.props.value[0]?.id ?? ''
            } else if ((v1s.type === 'DEPT_MULTIPLE' || v1s.type === 'USER_MULTIPLE') && Array.isArray(v1s.props.value)) {
              params1[v1s.field] = v1s.props.value.map(v1s1 => {
                return v1s1.id
              })
            } else if (v1s.type === 'TIME') {
              params1[v1s.field] = formatSubmitTime(v1s.props.value, getValueFormat(v1s.props, 'HH:mm:ss'))
            } else if (v1s.type === 'TIME_INTERVAL') {
              params1[v1s.field] = formatSubmitTimeInterval(v1s.props.value, getValueFormat(v1s.props, 'HH:mm:ss'))
            } else {
              params1[v1s.field] = v1s.props.value
            }

          })
          values.push(params1)
        })
        params.formData[v1.id] = values
      }
      if (v1.type == 'RELATION_DATA' && v1.props.value) {
        if (v1.props.selectType == 'single') {
          v1.props.options.map(v => {
            if (v1.props.value == v.value) {
              params.formData[v1.id] = JSON.parse(JSON.stringify(v.data))
            }

          })
          v1.props.fieldList.map((v1s) => {
            const value = params.formData[v1.id][v1s.id]
            if (value === null || value === undefined || value === '') return
            if (v1s.type === 'RADIO' || v1s.type === 'SELECT' || v1s.type === 'SWITCH') {
              let val = JSON.parse(JSON.stringify(params.formData[v1.id][v1s.id]))
              params.formData[v1.id][v1s.id] = val.value
            } else if (v1s.type === 'CHECKBOX' || v1s.type === 'SELECT_MULTIPLE') {
              let val = JSON.parse(JSON.stringify(params.formData[v1.id][v1s.id]))
              params.formData[v1.id][v1s.id] = val.map(v => {
                return v.value
              })
            } else if (v1s.type === 'USER' || v1s.type === 'DEPT') {
              let val = JSON.parse(JSON.stringify(params.formData[v1.id][v1s.id]))
              params.formData[v1.id][v1s.id] = val.id
            } else if (v1s.type === 'USER_MULTIPLE' || v1s.type === 'DEPT_MULTIPLE') {
              let val = JSON.parse(JSON.stringify(params.formData[v1.id][v1s.id]))
              if (Array.isArray(val)) {
                params.formData[v1.id][v1s.id] = val.map(v => {
                  return v.id
                })
              }

            } else if (v1s.type === 'PICTURE' || v1s.type === 'ATTACH') {
              let val = JSON.parse(JSON.stringify(params.formData[v1.id][v1s.id]))
              params.formData[v1.id][v1s.id] = val
            }
          })
          params.formData[v1.id] = [params.formData[v1.id]]

        } else if (Array.isArray(v1.props.value)) {
          let valueS = Array.isArray(v1.props.value) ? JSON.parse(JSON.stringify(v1.props.value)) : []
          let datasa = []
          valueS.map(v => {
            if (v) {
              v1.props.options.map(v1 => {
                if (v == v1.value) {
                  v = JSON.parse(JSON.stringify(v1.data))
                }

              })

              v1.props.fieldList.map((v1s) => {
                const value = v[v1s.id]
                if (value === null || value === undefined || value === '') return
                if (v1s.type === 'RADIO' || v1s.type === 'SELECT' || v1s.type === 'SWITCH') {
                  let val = JSON.parse(JSON.stringify(v[v1s.id]))
                  v[v1s.id] = val.value
                } else if (v1s.type === 'CHECKBOX' || v1s.type === 'SELECT_MULTIPLE') {
                  let val = JSON.parse(JSON.stringify(v[v1s.id]))
                  v[v1s.id] = val.map(vad => {
                    return vad.value
                  })
                } else if (v1s.type === 'USER' || v1s.type === 'DEPT') {
                  let val = JSON.parse(JSON.stringify(v[v1s.id]))
                  v[v1s.id] = val.id
                } else if (v1s.type === 'USER_MULTIPLE' || v1s.type === 'DEPT_MULTIPLE') {
                  let val = JSON.parse(JSON.stringify(v[v1s.id]))
                  v[v1s.id] = val.map(v => {
                    return v.id
                  })
                } else if (v1s.type === 'PICTURE' || v1s.type === 'ATTACH') {
                  let val = JSON.parse(JSON.stringify(v[v1s.id]))
                  v[v1s.id] = val
                }
              })

              datasa.push(v)
            }
            params.formData[v1.id] = datasa
          })
        }
      }
      if (v1.type == 'RELATION_QUERY' && v1.props.value) {
        let valueS = Array.isArray(v1.props.value) ? JSON.parse(JSON.stringify(v1.props.value)) : []
        // console.log(valueS)
        params.formData[v1.id] = valueS.map(v => {
          v1.props.fieldList.map((v1s) => {
            const value = v[v1s.id]
            if (value === null || value === undefined || value === '') return
            if (v1s.type === 'RADIO' || v1s.type === 'SELECT' || v1s.type === 'SWITCH') {
              let val = JSON.parse(JSON.stringify(v[v1s.id]))
              v[v1s.id] = val.value
            } else if (v1s.type === 'CHECKBOX' || v1s.type === 'SELECT_MULTIPLE') {
              let val = JSON.parse(JSON.stringify(v[v1s.id]))
              v[v1s.id] = val.map(vad => {
                return vad.value
              })
            } else if (v1s.type === 'USER' || v1s.type === 'DEPT') {
              let val = JSON.parse(JSON.stringify(v[v1s.id]))
              v[v1s.id] = val.id
            } else if (v1s.type === 'USER_MULTIPLE' || v1s.type === 'DEPT_MULTIPLE') {
              let val = JSON.parse(JSON.stringify(v[v1s.id]))
              v[v1s.id] = val.map(v => {
                return v.id
              })
            } else if (v1s.type === 'PICTURE' || v1s.type === 'ATTACH') {
              let val = JSON.parse(JSON.stringify(v[v1s.id]))
              v[v1s.id] = val
            }
          })

          return v
        })
      }
      if (v1.type === 'TIME') {
        params.formData[v1.id] = formatSubmitTime(v1.props.value, getValueFormat(v1.props, 'HH:mm:ss'))
      } else if (v1.type === 'TIME_INTERVAL') {
        params.formData[v1.id] = formatSubmitTimeInterval(v1.props.value, getValueFormat(v1.props, 'HH:mm:ss'))
      } else if ((v1.type === 'DEPT' || v1.type === 'USER') && Array.isArray(v1.props.value)) {
        params.formData[v1.id] = v1.props.value[0]?.id ?? ''
        // console.log(v1.props.value[0].id)
      } else if ((v1.type === 'DEPT_MULTIPLE' || v1.type === 'USER_MULTIPLE') && Array.isArray(v1.props.value)) {
        params.formData[v1.id] = v1.props.value.map(v => v.id)
      }
    }
  })
}
