/** 下拉组件查询其他表单数据源 - 请求参数 */
export interface SelectComponentDataParams {
  /** 当前表单 id */
  formId: string
  /** 下拉组件字段 id */
  field: string
  /** 关联数据，用于条件过滤（与关联组件查询一致） */
  data?: Record<string, any>
  /** 组件属性（临时未保存，表单设计/预览时使用） */
  tempProps?: Record<string, any>
}

/** 下拉选项记录：id 为数据行 id，其余 key 为展示字段值 */
export interface SelectComponentDataItem {
  id: string
  [fieldKey: string]: string | undefined
}
