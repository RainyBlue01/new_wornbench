import { describe, expect, it } from 'vitest'
import { GRID_ITEM_DRAG_ALLOW_FROM, findAvailableGridPosition, resolveLayoutCollisions } from './gridLayout'
import type { LayoutItem } from '../types'

const item = (id: string, x: number, y: number, w = 6): LayoutItem => ({ i: id, id, type: 'table', x, y, w, h: 2, props: {} })

describe('report grid layout', () => {
  it('places adjacent items without treating touching edges as collisions', () => {
    expect(findAvailableGridPosition([item('a', 0, 0)], 6, 2)).toEqual({ x: 6, y: 0 })
  })
  it('moves overlapping items and preserves in-place layout updates', () => {
    const items = [item('a', 0, 0), item('b', 0, 0), item('c', 0, 0)]
    expect(resolveLayoutCollisions(items)).toBe(items)
    expect(items.map(({ x, y }) => ({ x, y }))).toEqual([{ x: 0, y: 0 }, { x: 6, y: 0 }, { x: 0, y: 2 }])
    expect(items[1].props.position).toEqual({ x: 6, y: 0 })
    expect(items[0].dragAllowFrom).toBe(GRID_ITEM_DRAG_ALLOW_FROM)
  })
  it('normalizes negative coordinates and widths exceeding the 12-column boundary', () => {
    const items = [item('a', -2, -3, 20)]
    resolveLayoutCollisions(items)
    expect(items[0]).toMatchObject({ x: 0, y: 0, w: 12, h: 2 })
  })
})
