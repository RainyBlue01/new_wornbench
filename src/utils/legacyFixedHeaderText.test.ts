import { afterEach, describe, expect, it, vi } from 'vitest'
import { getHeaderScrollOffsets, installLegacyFixedHeaderText } from './legacyFixedHeaderText'

describe('legacy fixed header text positioning', () => {
  afterEach(() => vi.unstubAllGlobals())

  it.each([
    [0, 1600, 900, { left: 0, right: 700 }],
    [450, 1600, 900, { left: 450, right: 250 }],
    [900, 1600, 900, { left: 700, right: 0 }],
    [-2, 1600, 900, { left: 0, right: 700 }],
    [0, 800, 900, { left: 0, right: 0 }],
  ])('keeps pinned offsets for scroll %s', (left, width, viewport, expected) => {
    expect(getHeaderScrollOffsets(left as number, width as number, viewport as number)).toEqual(expected)
  })

  it('does not install DOM observers on modern browsers', () => {
    vi.stubGlobal('navigator', { userAgent: 'Chrome/130.0.0.0' })
    expect(() => installLegacyFixedHeaderText()()).not.toThrow()
  })
})
