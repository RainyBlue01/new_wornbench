import { describe, expect, it } from 'vitest'
import { buildNodeTree, getCurrentNodeName } from './processTree'

describe('approval process tree', () => {
  it('supports JSON and object configurations and the end-node fallback', () => {
    const config = { nodes: [{ id: 'a', name: '审批' }] }
    expect(getCurrentNodeName(['a'], config)).toBe('审批')
    expect(getCurrentNodeName(['a'], JSON.stringify(config))).toBe('审批')
    expect(getCurrentNodeName([], config)).toBe('结束节点')
    expect(getCurrentNodeName(['a'], '{')).toBe('结束节点')
  })
  it('builds copied branch children without modifying the source nodes', () => {
    const root = { id: 'root', type: 'BRANCH' }
    const nodes = [{ id: 'a', type: 'BRANCH' }, { id: 'b', type: 'END' }]
    buildNodeTree(root, nodes, [{ sourceRef: 'root', targetRef: 'a' }, { sourceRef: 'root', targetRef: 'b' }])
    expect(root).toMatchObject({ conditionNodes: [{ id: 'a', type: 7 }, { id: 'b', type: 'END' }] })
    expect(nodes[0].type).toBe('BRANCH')
  })
})
