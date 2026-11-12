import { describe, expect, it } from 'vitest'
import { submitFormData } from './serialize'

describe('submitFormData after module extraction', () => {
  it.each(['single', 'multiple'])('keeps %s relation options unchanged across retries', (selectType) => {
    const data = {
      choice: { value: 'A', label: 'Option A' },
      switch: { value: false, label: 'Off' },
      person: { id: 'u1', nickname: 'Person' },
      people: [{ id: 'u2' }],
      choices: [{ value: 'B', label: 'Option B' }],
    }
    const fields = [{
      id: 'relation', type: 'RELATION_DATA', props: {
        selectType, value: selectType === 'single' ? 'record1' : ['record1'],
        options: [{ value: 'record1', data }],
        fieldList: [
          { id: 'choice', type: 'SELECT' }, { id: 'switch', type: 'SWITCH' },
          { id: 'person', type: 'USER' }, { id: 'people', type: 'USER_MULTIPLE' },
          { id: 'choices', type: 'CHECKBOX' },
        ],
      },
    }]
    const before = structuredClone(fields)
    for (let attempt = 0; attempt < 2; attempt++) {
      const params = { formData: { relation: fields[0].props.value } }
      submitFormData(params, fields)
      expect(params.formData.relation).toEqual([{
        choice: 'A', switch: false, person: 'u1', people: ['u2'], choices: ['B'],
      }])
      expect(fields).toEqual(before)
    }
  })

  it.each(['single', 'multiple', 'query'])('preserves empty related fields for %s', (mode) => {
    const data = { person: null, department: '', people: null }
    const fields = [{
      id: 'relation', type: mode === 'query' ? 'RELATION_QUERY' : 'RELATION_DATA',
      props: {
        selectType: mode, value: mode === 'query' ? [data] : mode === 'single' ? 'r1' : ['r1'],
        options: [{ value: 'r1', data }],
        fieldList: [
          { id: 'person', type: 'USER' }, { id: 'department', type: 'DEPT' },
          { id: 'people', type: 'USER_MULTIPLE' }, { id: 'missing', type: 'USER' },
        ],
      },
    }]
    const before = structuredClone(fields)
    const params = { formData: { relation: fields[0].props.value } }
    expect(() => submitFormData(params, fields)).not.toThrow()
    expect(params.formData.relation).toEqual([data])
    expect(fields).toEqual(before)
  })

  it('serializes cleared single-person and department selections in forms and subforms', () => {
    const fields = [
      { id: 'person', type: 'USER', props: { value: [] } },
      { id: 'department', type: 'DEPT', props: { value: [] } },
      { id: 'rows', type: 'SUBFORM', props: { value: [] }, list: [[
        { field: 'person', type: 'USER', props: { value: [] } },
        { field: 'department', type: 'DEPT', props: { value: [] } },
      ]] },
    ]
    const before = structuredClone(fields)
    const params = { formData: { person: [], department: [], rows: [] } }

    expect(() => submitFormData(params, fields)).not.toThrow()
    expect(params.formData).toEqual({
      person: '',
      department: '',
      rows: [{ person: '', department: '' }],
    })
    expect(fields).toEqual(before)
  })

  it('serializes nested grid selections and time without changing the input fields', () => {
    const fields = [{ id: 'row', type: 'ROW', props: {}, children: [
      { id: 'col', type: 'COL', props: {}, children: [
        { id: 'person', type: 'USER', props: { value: [{ id: 'u1', nickname: '甲' }] } },
        { id: 'departments', type: 'DEPT_MULTIPLE', props: { value: [{ id: 'd1' }, { id: 'd2' }] } },
        { id: 'time', type: 'TIME', props: { value: '08:30', format: 'HH:mm' } },
      ] },
    ] }]
    const before = structuredClone(fields)
    const params = { formData: { person: [], departments: [], time: '08:30' } }
    const target = params.formData
    submitFormData(params, fields)
    expect(params.formData).toBe(target)
    expect(params.formData).toEqual({ person: 'u1', departments: ['d1', 'd2'], time: '08:30:00' })
    expect(fields).toEqual(before)
  })

  it('keeps subform row conversion and hidden-empty field removal', () => {
    const params = { formData: { hidden: 'old', rows: [] } }
    submitFormData(params, [
      { id: 'hidden', type: 'USER', showItem: true, props: { value: [] } },
      { id: 'rows', type: 'SUBFORM', props: { value: [] }, list: [[
        { field: 'person', type: 'USER', props: { value: [{ id: 'u1' }] } },
        { field: 'time', type: 'TIME_INTERVAL', props: { value: { start: '08:30', end: '12:00' }, format: 'HH:mm' } },
      ]] },
    ])
    expect(params.formData).toEqual({ rows: [{ person: 'u1', time: { start: '08:30:00', end: '12:00:00' } }] })
  })
})
