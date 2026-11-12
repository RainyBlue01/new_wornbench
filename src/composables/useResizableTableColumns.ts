import {
  computed,
  onBeforeUnmount,
  shallowRef,
  toValue,
  watch,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'

interface ResizableTableColumnOptions {
  columns: Ref<any[]>
  containerRef: Ref<HTMLElement | null>
  selectionEnabled?: MaybeRefOrGetter<boolean>
  defaultWidth?: number
  minWidth?: number
  selectionColumnWidth?: number
}

export const useResizableTableColumns = ({
  columns,
  containerRef,
  selectionEnabled = false,
  defaultWidth = 200,
  minWidth = 40,
  selectionColumnWidth = 48,
}: ResizableTableColumnOptions) => {
  const containerWidth = shallowRef(0)
  const columnWidthOverrides = shallowRef<Record<string, number>>({})
  let resizeObserver: ResizeObserver | null = null
  let activeResizeKey = ''
  let resizeColumnKeys: string[] = []
  let resizeInitialWidths: Record<string, number> = {}
  let pendingColumnWidths: Record<string, number> = {}

  const getColumnKey = (column: any) => column.dataIndex || column.key

  const getColumnWidth = (column: any): number => {
    if (column.children?.length) {
      return column.children.reduce((sum: number, child: any) => sum + getColumnWidth(child), 0)
    }

    const key = getColumnKey(column)
    const overrideWidth = key ? columnWidthOverrides.value[key] : undefined
    const width = overrideWidth ?? column.width ?? column.minWidth ?? defaultWidth
    return Math.max(Number(width) || defaultWidth, Number(column.minWidth) || minWidth)
  }

  const contentWidth = computed(() => columns.value.reduce(
    (sum, column) => sum + getColumnWidth(column),
    toValue(selectionEnabled) ? selectionColumnWidth : 0,
  ))

  const isAutoFillColumn = (column: any) =>
    !column.children?.length
    && Boolean(getColumnKey(column))
    && column.fixed !== 'right'

  const getAutoFillColumnCount = (source: any[]): number => source.reduce((count, column) => {
    if (column.children?.length) return count + getAutoFillColumnCount(column.children)
    return count + (isAutoFillColumn(column) ? 1 : 0)
  }, 0)

  const applyAutoFillWidth = (source: any[], extraWidth: number, fillCount: number): any[] => {
    const extraWidthPerColumn = fillCount > 0 ? extraWidth / fillCount : 0

    return source.map((column) => {
      if (column.children?.length) {
        return {
          ...column,
          children: applyAutoFillWidth(column.children, extraWidth, fillCount),
        }
      }
      if (!isAutoFillColumn(column)) return column

      return {
        ...column,
        width: Math.max(getColumnWidth(column) + extraWidthPerColumn, minWidth),
        minWidth: Math.max(Number(column.minWidth) || minWidth, minWidth),
      }
    })
  }

  const applyResolvedWidths = (source: any[]): any[] => source.map((column) => {
    if (column.children?.length) {
      return { ...column, children: applyResolvedWidths(column.children) }
    }

    const key = getColumnKey(column)
    const overrideWidth = key ? columnWidthOverrides.value[key] : undefined
    if (overrideWidth === undefined) return column
    return { ...column, width: overrideWidth }
  })

  const collectLeafWidths = (
    source: any[],
    widths: Record<string, number> = {},
    keys: string[] = [],
  ) => {
    source.forEach((column) => {
      if (column.children?.length) {
        collectLeafWidths(column.children, widths, keys)
        return
      }
      const key = getColumnKey(column)
      if (!key) return
      widths[key] = Math.max(minWidth, Math.round(Number(column.width) || getColumnWidth(column)))
      keys.push(key)
    })
    return { widths, keys }
  }

  const displayColumns = computed(() => {
    const resolvedColumns = applyResolvedWidths(columns.value)
    if (Object.keys(columnWidthOverrides.value).length > 0) return resolvedColumns

    const extraWidth = Math.max(containerWidth.value - contentWidth.value, 0)
    const fillCount = getAutoFillColumnCount(columns.value)
    if (extraWidth <= 0 || fillCount === 0) return resolvedColumns
    return applyAutoFillWidth(resolvedColumns, extraWidth, fillCount)
  })

  const scrollX = computed(() => Math.max(contentWidth.value, containerWidth.value))

  const removeResizeEndListeners = () => {
    window.removeEventListener('mouseup', commitColumnResize)
    window.removeEventListener('contextmenu', commitColumnResize)
  }

  const commitColumnResize = () => {
    if (!activeResizeKey) return

    const initialWidth = resizeInitialWidths[activeResizeKey]
    const finalWidth = pendingColumnWidths[activeResizeKey]
    if (Number.isFinite(initialWidth) && Number.isFinite(finalWidth) && finalWidth < initialWidth) {
      const currentIndex = resizeColumnKeys.indexOf(activeResizeKey)
      const adjacentKey = resizeColumnKeys[currentIndex + 1] || resizeColumnKeys[currentIndex - 1]
      if (adjacentKey) {
        pendingColumnWidths[adjacentKey] = Math.max(
          minWidth,
          (pendingColumnWidths[adjacentKey] || resizeInitialWidths[adjacentKey] || minWidth)
            + initialWidth - finalWidth,
        )
      }
    }

    columnWidthOverrides.value = { ...pendingColumnWidths }
    activeResizeKey = ''
    resizeColumnKeys = []
    resizeInitialWidths = {}
    pendingColumnWidths = {}
    removeResizeEndListeners()
  }

  const handleColumnResize = (dataIndex: string, width: number) => {
    if (!dataIndex || !Number.isFinite(width)) return

    if (activeResizeKey !== dataIndex) {
      removeResizeEndListeners()
      const captured = collectLeafWidths(displayColumns.value)
      activeResizeKey = dataIndex
      resizeColumnKeys = captured.keys
      resizeInitialWidths = captured.widths
      pendingColumnWidths = {
        ...columnWidthOverrides.value,
        ...captured.widths,
      }
      window.addEventListener('mouseup', commitColumnResize)
      window.addEventListener('contextmenu', commitColumnResize)
    }

    pendingColumnWidths[dataIndex] = Math.max(minWidth, Math.round(width))
  }

  const resetColumnWidths = () => {
    activeResizeKey = ''
    resizeColumnKeys = []
    resizeInitialWidths = {}
    pendingColumnWidths = {}
    removeResizeEndListeners()
    columnWidthOverrides.value = {}
  }

  const observeContainer = (element: HTMLElement | null) => {
    resizeObserver?.disconnect()
    resizeObserver = null
    containerWidth.value = element ? Math.ceil(element.getBoundingClientRect().width) : 0

    if (!element || typeof ResizeObserver === 'undefined') return
    resizeObserver = new ResizeObserver(([entry]) => {
      if (entry) containerWidth.value = Math.ceil(entry.contentRect.width)
    })
    resizeObserver.observe(element)
  }

  watch(containerRef, observeContainer, { immediate: true, flush: 'post' })

  onBeforeUnmount(() => {
    removeResizeEndListeners()
    resizeObserver?.disconnect()
    resizeObserver = null
  })

  return {
    columnWidthOverrides,
    displayColumns,
    scrollX,
    handleColumnResize,
    resetColumnWidths,
  }
}
