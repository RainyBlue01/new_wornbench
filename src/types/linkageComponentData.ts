/** 数据联动组件查询 - 请求参数 */
export interface LinkageComponentDataParams {
  /** 当前表的 id */
  appId?: string | number
  formId: string | number
  /** 配置数据联动字段的 id */
  field: string
  /** 当前表的字段值 */
  data?: Record<string, any>
}

export interface FormLinkageConfig {
  enable?: boolean
  logicConditions?: Array<{
    field?: string
    relationField?: string
    symbol?: string
    inputType?: string
  }>
  mode?: 'and' | 'or'
  sourceFormCode?: string
  relationTrigger?: {
    fieldCode?: string
    sourceFieldCode?: string
  }
}
