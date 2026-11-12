



interface GridRect {
    x: number
    y: number
    w: number
    h: number
}
// 组件定义
interface ComponentDefinition {
    type: string
    name: string
    icon: any
    classify: string
    props: {
        color?: string
        position: { x: number; y: number }
        size: { width: number; height: number }
        data?: any
        style?: any
        fun?: any
        filter?: any
        fxFields?: any[]
        formId?: string
    }
}
// 布局项定义 - 扩展 grid-layout-plus 的 LayoutItem
interface LayoutItem {
    i: string
    x: number
    y: number
    w: number
    h: number
    id: string
    type: string
    classify?: string
    color?: string
    icon?: any
    value?: number
    label?: string
    name?: string
    minW?: number
    minH?: number
    props?: any
    dragAllowFrom?: string
    dragIgnoreFrom?: string
    resizeIgnoreFrom?: string
}
export type { ComponentDefinition, LayoutItem, GridRect }
