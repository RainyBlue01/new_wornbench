import { describe, expect, it } from 'vitest'
import { Parser } from 'expr-eval'
import { register } from './dateFormula'

const parser = new Parser()
register(parser)

describe('getDayCalculate', () => {
  it.each([
    ['2026-09-07 09:00', '2026-09-07 12:00', 0.5],
    ['2026-09-07 09:00', '2026-09-07 12:00:01', 1],
    ['2026-09-07 13:00', '2026-09-07 23:59', 0.5],
    ['2026-09-07 09:00', '2026-09-08 00:00', 1],
    ['2026-09-07 09:00', '2026-09-08 07:59', 1],
    ['2026-09-07 09:00', '2026-09-08 08:00', 1],
    ['2026-09-08 00:00', '2026-09-08 08:00', 0],
    ['2026-09-08 07:59', '2026-09-08 08:01', 0.5],
    ['2026-09-08 07:59', '2026-09-08 08:02', 0.5],
    ['2026-09-07 09:00', '2026-09-08 12:00', 1.5],
    ['2026-09-07 09:00', '2026-09-08 13:00', 2],
    ['2026-09-07 13:00', '2026-09-07 13:01', 0],
    ['2026-09-07 13:00', '2026-09-07 12:00', 0],
  ])('%s to %s returns %s', async (start, end, expected) => {
    expect(await parser.functions.getDayCalculate(start, end, '08:00')).toBe(expected)
  })

  it.each([
    ['2026-09-08 00:00:00', 1],
    ['2026-09-08 08:30:00', 1],
    ['2026-09-08 08:30:01', 1.5],
    ['2026-09-08 08:31:00', 1.5],
  ])('counts the next morning at %s as %s days', async (end, expected) => {
    for (const start of ['2026-09-07 08:30:00', '2026-09-07 09:29:25']) {
      expect(await parser.functions.getDayCalculate(start, end, '08:30')).toBe(expected)
      expect(await parser.functions.getIntervalDayCalculate({ start, end }, '08:30')).toBe(expected)
    }
  })

  it('uses the configured start time', async () => {
    expect(await parser.functions.getDayCalculate('2026-09-07 00:00', '2026-09-07 09:30', '09:30')).toBe(0)
  })

  it('supports interval objects and JSON intervals', async () => {
    const interval = { start: '2026-09-07 09:00', end: '2026-09-08 07:59' }
    expect(await parser.functions.getIntervalDayCalculate(interval, '08:00')).toBe(1)
    expect(await parser.functions.getIntervalDayCalculate(JSON.stringify(interval), '08:00')).toBe(1)
  })

  it('returns empty for invalid dates and start times', async () => {
    expect(await parser.functions.getDayCalculate('invalid', '2026-09-07 18:00', '08:00')).toBe('')
    expect(await parser.functions.getDayCalculate('2026-09-07 09:00', '2026-09-07 18:00', '25:00')).toBe('')
  })
})
