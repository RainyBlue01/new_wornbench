import { readFileSync } from 'node:fs'
import ts from 'typescript'
import { describe, expect, it, vi } from 'vitest'

// Execute the actual SFC request handler with controlled responses, without mounting UI.
const source = readFileSync(new URL('./table_cup.vue', import.meta.url), 'utf8')
const handler = source.match(/let latestListRequestId = 0[\s\S]*?const getList = async \(\) => \{[\s\S]*?\n\}/)![0]
const code = ts.transpileModule(handler, {
  compilerOptions: { target: ts.ScriptTarget.ES2022 },
}).outputText

function setup() {
  const pending: Array<{ resolve: (value: any) => void; reject: (error: Error) => void }> = []
  const props = { option: { data: { selectFields: [{ id: 'f' }] }, fun: { pageable: true } } }
  const tableData = { value: [] as any[] }
  const tableLoading = { value: false }
  const page = { total: 0, pageSize: 10, pageNum: 1 }
  const conditionRequest = { value: [] }
  const queryReportData = vi.fn(() => new Promise((resolve, reject) => pending.push({ resolve, reject })))
  const getList = new Function(
    'props', 'tableData', 'tableLoading', 'page', 'conditionRequest', 'queryReportData',
    code + '; return getList',
  )(props, tableData, tableLoading, page, conditionRequest, queryReportData) as () => Promise<void>
  return { props, tableData, tableLoading, page, pending, getList }
}

describe('report table request ordering', () => {
  it('does not let an old response overwrite the latest rows and total', async () => {
    const state = setup()
    const first = state.getList()
    const second = state.getList()
    state.pending[1].resolve({ records: ['new'], total: 2 })
    await second
    state.pending[0].resolve({ records: ['old'], total: 1 })
    await first
    expect(state.tableData.value).toEqual(['new'])
    expect(state.page.total).toBe(2)
  })

  it('keeps loading while the latest request is pending', async () => {
    const state = setup()
    const first = state.getList()
    const second = state.getList()
    state.pending[0].resolve({ records: ['old'], total: 1 })
    await first
    expect(state.tableLoading.value).toBe(true)
    state.pending[1].resolve({ records: ['new'], total: 2 })
    await second
    expect(state.tableLoading.value).toBe(false)
  })

  it('does not clear new rows when an old request fails', async () => {
    const state = setup()
    const first = state.getList()
    const second = state.getList()
    state.pending[1].resolve({ records: ['new'], total: 2 })
    await second
    state.pending[0].reject(new Error('old request failed'))
    await first
    expect(state.tableData.value).toEqual(['new'])
    expect(state.page.total).toBe(2)
  })

  it('invalidates pending results when fields are cleared', async () => {
    const state = setup()
    const first = state.getList()
    state.props.option.data.selectFields = []
    await state.getList()
    state.pending[0].resolve({ records: ['old'], total: 1 })
    await first
    expect(state.tableData.value).toEqual([])
    expect(state.page.total).toBe(0)
    expect(state.tableLoading.value).toBe(false)
  })
})
