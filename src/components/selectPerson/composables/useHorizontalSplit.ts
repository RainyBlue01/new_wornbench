import { onBeforeUnmount, shallowRef, type Ref } from 'vue'

interface HorizontalSplitOptions {
    initialWidth?: number
    minWidth?: number
    minRightWidth?: number
}

export function useHorizontalSplit(
    containerRef: Readonly<Ref<HTMLElement | null>>,
    options: HorizontalSplitOptions = {},
) {
    const {
        initialWidth = 180,
        minWidth = 120,
        minRightWidth = 220,
    } = options

    const leftPanelWidth = shallowRef(initialWidth)
    const isResizing = shallowRef(false)
    let stopDragging: (() => void) | undefined

    const startResize = (event: PointerEvent) => {
        const container = containerRef.value
        if (!container) return

        event.preventDefault()
        const startX = event.clientX
        const startWidth = leftPanelWidth.value
        isResizing.value = true
        document.body.style.cursor = 'col-resize'
        document.body.style.userSelect = 'none'

        const handlePointerMove = (moveEvent: PointerEvent) => {
            const maxWidth = Math.max(minWidth, container.clientWidth - minRightWidth)
            leftPanelWidth.value = Math.min(
                maxWidth,
                Math.max(minWidth, startWidth + moveEvent.clientX - startX),
            )
        }

        const handlePointerUp = () => {
            stopDragging?.()
        }

        stopDragging = () => {
            window.removeEventListener('pointermove', handlePointerMove)
            window.removeEventListener('pointerup', handlePointerUp)
            window.removeEventListener('pointercancel', handlePointerUp)
            document.body.style.cursor = ''
            document.body.style.userSelect = ''
            isResizing.value = false
            stopDragging = undefined
        }

        window.addEventListener('pointermove', handlePointerMove)
        window.addEventListener('pointerup', handlePointerUp)
        window.addEventListener('pointercancel', handlePointerUp)
    }

    onBeforeUnmount(() => stopDragging?.())

    return {
        leftPanelWidth,
        isResizing,
        startResize,
    }
}
