import { afterEach, describe, expect, it, vi } from 'vitest'
import { applyBrowserCompatibility, needsLegacyTableTextFallback } from './browserCompatibility'

describe('旧 Chromium 表头字体兼容范围', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('仅在旧内核且显式指定参数时启用正文同字体对比', () => {
    const toggle = vi.fn()
    vi.stubGlobal('document', { documentElement: { classList: { toggle } } })
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 Chrome/83.0.4103.116' })
    vi.stubGlobal('location', { search: '?id=report&tableText=body' })
    applyBrowserCompatibility()
    expect(toggle).toHaveBeenCalledWith('legacy-table-text-body-font', true)
    vi.stubGlobal('location', { search: '?id=report' })
    applyBrowserCompatibility()
    expect(toggle).toHaveBeenCalledWith('legacy-table-text-body-font', false)
    vi.stubGlobal('location', { search: '?tableText=body' })
    vi.stubGlobal('navigator', { userAgent: 'Chrome/130.0.0.0' })
    toggle.mockClear()
    applyBrowserCompatibility()
    expect(toggle).toHaveBeenCalledWith('legacy-table-text-body-font', false)
  })

  it('在应用初始化时启用 83 内核表头样式，并清理非旧内核的标记', () => {
    const toggle = vi.fn()
    vi.stubGlobal('document', { documentElement: { classList: { toggle } } })
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 Chrome/83.0.4103.116 Safari/537.36' })
    applyBrowserCompatibility()
    expect(toggle).toHaveBeenLastCalledWith('legacy-chromium-table-text', true)
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 Chrome/130.0.0.0' })
    applyBrowserCompatibility()
    expect(toggle).toHaveBeenLastCalledWith('legacy-chromium-table-text', false)
  })
  it('覆盖截图中的 83 内核及现有最低兼容版本', () => {
    expect(needsLegacyTableTextFallback('Mozilla/5.0 (X11; Linux x86_64) Chrome/83.0.4103.116 Safari/537.36')).toBe(true)
    expect(needsLegacyTableTextFallback('Mozilla/5.0 Chrome/79.0.3945.130 Safari/537.36')).toBe(true)
    expect(needsLegacyTableTextFallback('Mozilla/5.0 Chromium/89.0.4389.90')).toBe(true)
  })

  it('不将新内核、其他引擎和未识别的浏览器误判为旧 Chromium', () => {
    for (const ua of ['Chrome/90.0.4430.72', 'Chrome/130.0.0.0 Edg/130.0', 'Firefox/128.0', 'Version/17.0 Safari/605.1.15', '', 'Chrome/7.0.0.0']) {
      expect(needsLegacyTableTextFallback(ua)).toBe(false)
    }
  })
})
