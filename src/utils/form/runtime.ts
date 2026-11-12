import { calculate } from '@/components/expression/formula'

export function setForm(formList: any) {
  if (Array.isArray(formList)) {
    formList.map((v: any) => {
      if (v.children) {
        setForm(v.children)
      }
      if (v.type == 'SUBFORM') {
        let children = JSON.parse(JSON.stringify(v.children))
        children.map((v: { id: any; field: any; }) => {
          let id = JSON.parse(JSON.stringify(v.id))
          v.field = id
        })
        v.list = [children]
      }
      if (v.component == 'qUpload') {
        let exampleFiles = JSON.parse(JSON.stringify(v.props.exampleFiles))
        exampleFiles.map((v2: { example: boolean; }) => {
          v2.example = true
        })
        v.props.value = [...exampleFiles]
      }
    })
  }
}

export function resetFormRuntimeData(formList: any) {
  if (!Array.isArray(formList)) return

  formList.forEach((item: any) => {
    const componentProps = item?.props
    if (componentProps && Object.prototype.hasOwnProperty.call(componentProps, 'value')) {
      if (componentProps.defaultValue !== undefined) {
        componentProps.value = JSON.parse(JSON.stringify(componentProps.defaultValue))
      } else if (Array.isArray(componentProps.value)) {
        componentProps.value = []
      } else if (componentProps.value && typeof componentProps.value === 'object') {
        componentProps.value = {}
      } else {
        componentProps.value = ''
      }
    }

    if (item.type === 'ADDRESS' && componentProps) {
      const defaultAddress = componentProps.defaultValue
      componentProps.value = defaultAddress && typeof defaultAddress === 'object' && !Array.isArray(defaultAddress)
        ? { prov: '', city: '', dist: '', det: '', ...JSON.parse(JSON.stringify(defaultAddress)) }
        : { prov: '', city: '', dist: '', det: '' }
      componentProps.prov = ''
      componentProps.city = ''
      componentProps.dist = ''
      componentProps.cityList = []
      componentProps.District = []
    }

    if (item.type === 'SUBFORM') {
      item.list = []
    }

    resetFormRuntimeData(item.children)
  })
}
export function setDefaultValue(formList: any, form: any) {
  if (formList && Array.isArray(formList)) {
    formList.map(async v => {
      if (v.type !== 'SUBFORM' || v.type !== 'TITLE' || v.type !== 'COL' || v.type !== 'ROW' || v.type !== 'SPLIT_LINE' || v.type !== 'BUTTON_CONNECTOR') {

        v.props.value = ''
        if (v.props.label == '函数' || v.props.expressionLabel == '函数') {
          // console.log(v.props)
          // v.props.defaultValue = await calculate(v.props.expressionValue);
          setTimeout(async () => {
            // console.log(v.props)
            v.props.value = await calculate(v.props.expressionValue)
            form[v.id] = v.props.value
          })

        } else if (v.props.defaultValue) {
          if (v.type == 'DATE_INTERVAL' || v.type == 'TIME_INTERVAL') {
            if (v.props.defaultValue.end && v.props.defaultValue.start) {
              v.props.value = JSON.parse(JSON.stringify(v.props.defaultValue))
              form[v.id] = v.props.value
            }

          } else {
            v.props.value = JSON.parse(JSON.stringify(v.props.defaultValue))
            form[v.id] = v.props.value
          }

        }
      }

      if (v.children && Array.isArray(v.children)) {
        setDefaultValue(v.children, form)
      }
      if (v.list && Array.isArray(v.list)) {
        v.list.map(v => {
          setDefaultValue(v, form)
        })

      }
    })
  }
}
