import { getFormById } from './storage'

export function getFormList(id: any, type: boolean) {
  let formList = []
  let form = getFormById(id)
  if (type) {
    deepGetForm(form.formList, formList)
  } else {
    deepGetSubForm(form.formList, formList)
  }

  return formList
}
export function deepGetSubForm(form: any, formList: any) {
  if (Array.isArray(form)) {
    form.map(v => {
      if (v.type == 'SUBFORM') {
        const params: any = {
          label: v.title,
          value: v.id,
          children: v.children
        }

        formList.push(params)
      }
      if (v.children && v.type !== 'SUBFORM') {
        deepGetForm(v.children, formList)
      }
    })
  }
}
export function deepGetForm(form: any, formList: any) {
  if (Array.isArray(form)) {
    form.map(v => {
      if (v.type !== 'TITLE' && v.type !== 'COL' && v.type !== 'ROW' && v.type !== 'SPLIT_LINE' && v.type !== 'BUTTON_CONNECTOR') {
        const params: any = {
          label: v.title,
          value: v.id,
        }
        if (v.type == 'SUBFORM') {
          params.children = v.children.map(v => {
            return { label: v.title, value: v.id }
          })
        }
        if (v.type == 'RELATION_DATA' || v.type == 'RELATION_QUERY') {
          params.children = v.props.fieldList.map(v => {
            return { label: v.title, value: v.id }
          })
        }
        formList.push(params)
      }
      if (v.children && v.type !== 'SUBFORM') {
        deepGetForm(v.children, formList)
      }
    })
  }
}

export function setProps(id: string, List: any, propsItem: string, data: any) {
  if (Array.isArray(List) && List.length > 0) {
    List.map((v) => {
      if (v.id == id) {
        v.props[propsItem] = data;
      }
      if (Array.isArray(v.children) && v.children.length > 0) {
        setProps(id, v.children, propsItem, data);
      }
    });
  }
}
let ids = "";
export function getProps(id: string, List: any, propsItem: string) {
  if (Array.isArray(List) && List.length > 0) {
    List.map((v) => {
      if (v.id == id) {
        ids = v.props[propsItem];
      }
      if (Array.isArray(v.children) && v.children.length > 0) {
        getProps(id, v.children, propsItem);
      }
    });
  }
  if (ids) {
    return ids;
  }
}
