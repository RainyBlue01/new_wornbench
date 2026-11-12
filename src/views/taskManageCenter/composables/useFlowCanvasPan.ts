import { computed, onBeforeUnmount, ref, type Ref } from 'vue'

const PAN_THRESHOLD = 5
const CLICK_SUPPRESS_DURATION = 200
const PAN_BLOCK_SELECTOR =
    'button, input, textarea, select, a, .arco-btn, .arco-select, .arco-input, .anticon, .add-node-btn, .node-delete, .flow-add-menu-item'

export function useFlowCanvasPan(canvasRef: Ref<HTMLElement | null>) {
    const offset = ref({ x: 0, y: 0 })
    const isPanPending = ref(false)
    const panActivated = ref(false)
    const panStart = { x: 0, y: 0, offsetX: 0, offsetY: 0 }
    let suppressNodeClickUntil = 0

    const getInnerCanvas = () =>
        canvasRef.value?.querySelector('.flow-canvas-inner') as HTMLElement | null

    const activatePanning = () => {
        if (panActivated.value) return
        panActivated.value = true
        if (canvasRef.value) canvasRef.value.style.cursor = 'grabbing'
        const inner = getInnerCanvas()
        if (inner) inner.style.transition = 'none'
    }

    const onMouseMove = (event: MouseEvent) => {
        if (!isPanPending.value) return
        const dx = event.clientX - panStart.x
        const dy = event.clientY - panStart.y
        if (!panActivated.value) {
            if (Math.abs(dx) < PAN_THRESHOLD && Math.abs(dy) < PAN_THRESHOLD) return
            activatePanning()
        }
        offset.value.x = panStart.offsetX + dx
        offset.value.y = panStart.offsetY + dy
        event.preventDefault()
    }

    const stopPanning = () => {
        if (!isPanPending.value && !panActivated.value) return
        if (panActivated.value) suppressNodeClickUntil = Date.now() + CLICK_SUPPRESS_DURATION
        isPanPending.value = false
        panActivated.value = false
        if (canvasRef.value) canvasRef.value.style.cursor = 'grab'
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseup', stopPanning)
        const inner = getInnerCanvas()
        if (inner) inner.style.transition = 'transform 0.15s ease-out'
    }

    const onCanvasMouseDown = (event: MouseEvent) => {
        if (event.button !== 0) return
        const target = event.target as HTMLElement
        if (target.closest(PAN_BLOCK_SELECTOR) || !canvasRef.value) return
        isPanPending.value = true
        panActivated.value = false
        panStart.x = event.clientX
        panStart.y = event.clientY
        panStart.offsetX = offset.value.x
        panStart.offsetY = offset.value.y
        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', stopPanning)
    }

    const onCanvasClickCapture = (event: MouseEvent) => {
        if (Date.now() < suppressNodeClickUntil) event.stopPropagation()
    }

    const canvasStyle = computed(() => ({
        transform: `translate(${offset.value.x}px, ${offset.value.y}px)`,
    }))

    onBeforeUnmount(stopPanning)

    return { canvasStyle, onCanvasMouseDown, onCanvasClickCapture, stopPanning }
}
