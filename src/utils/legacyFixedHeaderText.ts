import { needsLegacyTableTextFallback } from './browserCompatibility'

export function getHeaderScrollOffsets(scrollLeft: number, scrollWidth: number, clientWidth: number) {
  const max = Math.max(0, scrollWidth - clientWidth)
  const left = Math.min(max, Math.max(0, scrollLeft))
  return { left, right: max - left }
}

/**
 * Chromium 79–89 的独立表头中，仅固定列改为相对定位并跟随滚动补偿。
 * 不使用 transform，也不改变正文 sticky、列宽和排序/拖动的 DOM。
 */
export function installLegacyFixedHeaderText(): () => void {
  if (!needsLegacyTableTextFallback(navigator.userAgent)) return () => {}
  const headers = new Set<HTMLElement>()
  let frame = 0

  const sync = (header: HTMLElement, scrollLeft = header.scrollLeft) => {
    if (getComputedStyle(header).direction === 'rtl') return
    const offsets = getHeaderScrollOffsets(scrollLeft, header.scrollWidth, header.clientWidth)
    header.style.setProperty('--legacy-header-scroll-left', offsets.left + 'px')
    header.style.setProperty('--legacy-header-scroll-right', offsets.right + 'px')
    header.classList.add('legacy-fixed-header-text')
  }
  const resizeObserver = typeof ResizeObserver === 'undefined' ? null
    : new ResizeObserver(entries => entries.forEach(entry => {
      const header = entry.target.closest<HTMLElement>('.arco-table-header')
      if (header) sync(header)
    }))
  const scan = () => {
    frame = 0
    headers.forEach(header => {
      if (!header.isConnected) {
        resizeObserver?.unobserve(header)
        const table = header.querySelector('table')
        if (table) resizeObserver?.unobserve(table)
        headers.delete(header)
      }
    })
    document.querySelectorAll<HTMLElement>('.arco-table-header').forEach(header => {
      if (!headers.has(header)) {
        headers.add(header)
        resizeObserver?.observe(header)
      }
      const table = header.querySelector('table')
      if (table) resizeObserver?.observe(table)
      sync(header)
    })
  }
  const scheduleScan = () => {
    if (!frame) frame = requestAnimationFrame(scan)
  }
  const onScroll = (event: Event) => {
    const target = event.target
    if (!(target instanceof HTMLElement)) return
    if (target.matches('.arco-table-header')) {
      sync(target)
    } else if (target.matches('.arco-table-body')) {
      const header = target.closest('.arco-table')?.querySelector<HTMLElement>('.arco-table-header')
      if (header) sync(header, target.scrollLeft)
    }
  }
  const observer = new MutationObserver(scheduleScan)
  observer.observe(document.documentElement, { childList: true, subtree: true })
  document.addEventListener('scroll', onScroll, { capture: true, passive: true })
  window.addEventListener('resize', scheduleScan)
  scan()

  return () => {
    observer.disconnect()
    resizeObserver?.disconnect()
    document.removeEventListener('scroll', onScroll, true)
    window.removeEventListener('resize', scheduleScan)
    if (frame) cancelAnimationFrame(frame)
    headers.forEach(header => {
      header.classList.remove('legacy-fixed-header-text')
      header.style.removeProperty('--legacy-header-scroll-left')
      header.style.removeProperty('--legacy-header-scroll-right')
    })
    headers.clear()
  }
}
