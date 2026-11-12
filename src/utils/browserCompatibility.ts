/** 现场统信浏览器等仍使用 Chromium 79–89，按内核版本启用兼容样式。 */
export function needsLegacyTableTextFallback(userAgent: string): boolean {
  const match = /\bChrom(?:e|ium)\/(\d+)\./i.exec(userAgent)
  return Boolean(match && Number(match[1]) >= 79 && Number(match[1]) < 90)
}

export function applyBrowserCompatibility(): void {
  const legacy = needsLegacyTableTextFallback(navigator.userAgent)
  // 现场对比入口：只影响表头，移除参数即恢复默认，不写入本地缓存。
  const search = typeof location === 'undefined' ? '' : location.search
  document.documentElement.classList.toggle(
    'legacy-table-text-body-font',
    legacy && new URLSearchParams(search).get('tableText') === 'body',
  )
  document.documentElement.classList.toggle(
    'legacy-chromium-table-text',
    legacy,
  )
}
