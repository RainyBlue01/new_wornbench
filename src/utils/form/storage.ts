import { toFrontendDateFormat } from './dateFormats'


const URL_PREVIEW_ATTRIBUTE = {
  field: 'previewEnabled',
  label: '开启预览',
  type: 'switch',
}

const URL_PREVIEW_TEXT_ATTRIBUTE = {
  field: 'previewText',
  label: '预览按钮文案',
  type: 'input',
  hideLabel: true,
  showWhen: {
    field: 'previewEnabled',
    value: true,
  },
}

const isUrlField = (field: any) =>
  String(field?.type ?? field?.inputType ?? '').trim().toUpperCase() === 'URL'

const normalizeSwitchValue = (value: any) =>
  value === true || value === 1 || value === '1' || value === 'true'

function normalizeFrontendFormConfig(formData: any) {
  const normalized = JSON.parse(JSON.stringify(formData || {}))
  const walk = (fields: any[]) => {
    if (!Array.isArray(fields)) return
    fields.forEach((field) => {
      if ((field?.type === 'DATE' || field?.type === 'DATE_INTERVAL') && field.props?.format) {
        field.props.format = toFrontendDateFormat(field.props.format)
      }
      if (isUrlField(field)) {
        field.props = field.props || {}
        delete field.props.showWordLimit
        delete field.props.maxLength
        field.props.previewEnabled = normalizeSwitchValue(field.props.previewEnabled)
        field.props.previewText = String(field.props.previewText ?? '').trim() || '预览'
        field.attribute = Array.isArray(field.attribute) ? field.attribute : []
        field.attribute = field.attribute.filter((item: any) => item?.field !== 'showWordLimit')
        if (!field.attribute.some((item: any) => item?.field === URL_PREVIEW_ATTRIBUTE.field)) {
          const requiredIndex = field.attribute.findIndex((item: any) => item?.field === 'required')
          field.attribute.splice(requiredIndex + 1, 0, { ...URL_PREVIEW_ATTRIBUTE })
        }
        const previewTextAttribute = field.attribute.find((item: any) => item?.field === URL_PREVIEW_TEXT_ATTRIBUTE.field)
        if (previewTextAttribute) {
          Object.assign(previewTextAttribute, URL_PREVIEW_TEXT_ATTRIBUTE)
        } else {
          const previewIndex = field.attribute.findIndex((item: any) => item?.field === URL_PREVIEW_ATTRIBUTE.field)
          field.attribute.splice(previewIndex + 1, 0, { ...URL_PREVIEW_TEXT_ATTRIBUTE })
        }
      }
      walk(field?.children)
      if (Array.isArray(field?.list)) field.list.forEach((row: any[]) => walk(row))
    })
  }
  walk(normalized.formList)
  return normalized
}

export function setFormById(formData: any, id: any) {
  let list = JSON.parse(localStorage.getItem("formList") || "{}");
  list[id] = normalizeFrontendFormConfig(formData);
  localStorage.setItem("formList", JSON.stringify(list));
}
export function clearFormById(id: any) {
  let list = JSON.parse(localStorage.getItem("formList") || "{}");
  delete list[id];
  localStorage.setItem("formList", JSON.stringify(list));
}
export function getFormById(id: any) {
  let list = JSON.parse(localStorage.getItem("formList") || "{}");
  return normalizeFrontendFormConfig(list[id]);
}
