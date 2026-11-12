import { describe, expect, it } from 'vitest'

import { walkFormFields } from './formTree'

describe('walkFormFields', () => {
  it('visits fields nested in row and column layouts', () => {
    const visited: string[] = []
    const fields = [
      {
        id: 'row',
        type: 'ROW',
        children: [
          {
            id: 'column',
            type: 'COL',
            children: [
              { id: 'user', type: 'USER_MULTIPLE' },
              { id: 'date', type: 'DATE' },
            ],
          },
        ],
      },
    ]

    walkFormFields(fields, field => visited.push(String(field.id)))

    expect(visited).toEqual(['row', 'column', 'user', 'date'])
  })

  it('does not traverse subform definitions as ordinary form fields', () => {
    const visited: string[] = []
    const fields = [
      {
        id: 'subform',
        type: 'SUBFORM',
        children: [{ id: 'subform-field', type: 'INPUT' }],
      },
    ]

    walkFormFields(fields, field => visited.push(String(field.id)))

    expect(visited).toEqual(['subform'])
  })
})
