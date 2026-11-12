export interface Appdes {
    showPart?: boolean
    showIcon?: string
    icon?: string | null
    id?: string
    appName?: string
    category?: any
    formId?: string
    [key: string]: any
}

export interface FormConfs {
    id?: string
    name?: string
    category?: any
    formList?: any[]
    formLogics?: any[]
    formEvents?: any[]
    widthType?: string
    width?: number | string
    titleStyle?: string
    draftBox?: boolean
    subText?: string
    /** 表单设计/预览时，下拉组件请求携带 tempProps */
    useTempProps?: boolean
    [key: string]: any
}

export interface FlowInfo {
    pass?: {
        label?: string
        [key: string]: any
    }
    refuse?: {
        label?: string
        [key: string]: any
    }
    delegate?: {
        label?: string
        [key: string]: any
    }
    back?: {
        label?: string
        [key: string]: any
    }
    [key: string]: any
}
