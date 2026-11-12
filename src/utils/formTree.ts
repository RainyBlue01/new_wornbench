export type FormTreeField = {
  type?: string
  children?: FormTreeField[]
  [key: string]: unknown
}

export const walkFormFields = (
  formList: unknown,
  visit: (field: FormTreeField) => void,
) => {
  if (!Array.isArray(formList)) return

  formList.forEach((field: FormTreeField) => {
    visit(field)

    // 子表单数据由其行数据单独序列化；ROW、COL 等布局容器需要继续向下遍历。
    if (field.type !== 'SUBFORM' && Array.isArray(field.children)) {
      walkFormFields(field.children, visit)
    }
  })
}
