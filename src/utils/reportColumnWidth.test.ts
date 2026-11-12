import { describe, expect, it } from 'vitest'
import { applyReportColumnWidths } from './reportColumnWidth'

describe('applyReportColumnWidths', () => {
  it('persists top-level, child and node column widths without mutating source fields', () => {
    const fields = [
      { column: 'name', width: 200 },
      {
        column: 'detail',
        extra: { children: [{ id: 'address', width: 150 }] },
      },
      {
        column: 'node',
        nodeInfo: true,
        extra: { operator: { showLabel: '操作人' } },
      },
    ]

    const result = applyReportColumnWidths(fields, {
      name: 268.4,
      'detail.address': 186.6,
      'node.operator': 132,
    })

    expect(result[0].width).toBe(268)
    expect(result[1].extra.children[0].width).toBe(187)
    expect(result[2].extra.operator.width).toBe(132)
    expect(fields[0].width).toBe(200)
    expect(fields[1].extra.children[0].width).toBe(150)
    expect(fields[2].extra.operator.width).toBeUndefined()
  })

  it('ignores invalid widths and applies the table minimum width', () => {
    const fields = [{ column: 'name', width: 200 }, { column: 'code', width: 100 }]
    const result = applyReportColumnWidths(fields, { name: Number.NaN, code: 12 })

    expect(result[0].width).toBe(200)
    expect(result[1].width).toBe(40)
  })
})
