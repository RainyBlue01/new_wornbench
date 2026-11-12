import type { LayoutItem, GridRect } from '../types'



const GRID_COL_NUM = 12


const layoutItemsCollide = (a: GridRect, b: GridRect) => {
    if (a.x + a.w <= b.x || b.x + b.w <= a.x) return false
    if (a.y + a.h <= b.y || b.y + b.h <= a.y) return false
    return true
}

const normalizeLayoutItem = (item: LayoutItem) => {
    const minW = item.minW || 1
    const minH = item.minH || 1
    item.w = Math.min(Math.max(item.w || minW, minW), GRID_COL_NUM)
    item.h = Math.max(item.h || minH, minH)
    item.x = Math.max(0, item.x || 0)
    item.y = Math.max(0, item.y || 0)
    if (item.x + item.w > GRID_COL_NUM) {
        item.x = Math.max(0, GRID_COL_NUM - item.w)
    }
    item.dragAllowFrom = GRID_ITEM_DRAG_ALLOW_FROM
    item.dragIgnoreFrom = GRID_ITEM_DRAG_IGNORE_FROM
    item.resizeIgnoreFrom = 'a, button'
}

const findAvailableGridPosition = (
    placed: LayoutItem[],
    w: number,
    h: number,
    preferred?: { x: number; y: number },
) => {
    const maxY = placed.reduce((max, item) => Math.max(max, item.y + item.h), 0)
    const startY = Math.max(0, preferred?.y ?? 0)

    for (let y = startY; y <= maxY + h + 12; y++) {
        for (let x = 0; x <= GRID_COL_NUM - w; x++) {
            const candidate = { x, y, w, h }
            if (!placed.some((item) => layoutItemsCollide(candidate, item))) {
                return { x, y }
            }
        }
    }

    return { x: 0, y: maxY }
}

const resolveLayoutCollisions = (items: LayoutItem[]) => {
    const sorted = [...items].sort((a, b) => a.y - b.y || a.x - b.x)
    const placed: LayoutItem[] = []

    sorted.forEach((item) => {
        normalizeLayoutItem(item)
        if (placed.some((existing) => layoutItemsCollide(item, existing))) {
            const position = findAvailableGridPosition(placed, item.w, item.h, {
                x: item.x,
                y: item.y,
            })
            item.x = position.x
            item.y = position.y
            if (item.props) {
                item.props.position = { x: item.x, y: item.y }
            }
        }
        placed.push(item)
    })

    return items
}

const GRID_ITEM_DRAG_ALLOW_FROM = '.report-designer-widget-header'
const GRID_ITEM_DRAG_IGNORE_FROM = 'a, button, input, textarea, select, .arco-select, .arco-input, .arco-picker'
export { GRID_COL_NUM, GRID_ITEM_DRAG_ALLOW_FROM, GRID_ITEM_DRAG_IGNORE_FROM, findAvailableGridPosition, resolveLayoutCollisions }
