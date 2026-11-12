import { afterEach, describe, expect, it, vi } from 'vitest'
import { clearFormById, getFormById, setFormById } from './storage'

afterEach(() => vi.unstubAllGlobals())

describe('form storage compatibility', () => {
  it('keeps the formList key, normalizes nested date formats and isolates returned objects', () => {
    const entries = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => entries.get(key) ?? null,
      setItem: (key: string, value: string) => entries.set(key, value),
    })
    const source = { formList: [{ type: 'ROW', children: [{ type: 'DATE', props: { format: 'yyyy-MM-dd' } }] }] }
    setFormById(source, 'a')
    setFormById({ formList: [] }, 'b')
    expect(entries.has('formList')).toBe(true)
    const result = getFormById('a')
    expect(result.formList[0].children[0].props.format).toBe('YYYY-MM-DD')
    expect(source.formList[0].children[0].props.format).toBe('yyyy-MM-dd')
    result.formList.length = 0
    expect(getFormById('a').formList).toHaveLength(1)
    clearFormById('a')
    expect(getFormById('a')).toEqual({})
    expect(getFormById('b')).toEqual({ formList: [] })
  })

  it('adds disabled URL preview configuration to legacy fields without duplicating it', () => {
    const entries = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => entries.get(key) ?? null,
      setItem: (key: string, value: string) => entries.set(key, value),
    })
    const source = {
      formList: [{
        type: 'URL',
        props: { required: true, showWordLimit: true, maxLength: 20 },
        attribute: [
          { field: 'required', label: '必填验证', type: 'switch' },
          { field: 'showWordLimit', label: '字数限制', type: 'numSwitch' },
        ],
      }],
    }

    setFormById(source, 'url-form')
    const firstRead = getFormById('url-form').formList[0]
    const secondRead = getFormById('url-form').formList[0]

    expect(firstRead.props.previewEnabled).toBe(false)
    expect(firstRead.props.previewText).toBe('预览')
    expect(firstRead.attribute.map((item: any) => item.field)).toEqual(['required', 'previewEnabled', 'previewText'])
    expect(firstRead.props).not.toHaveProperty('showWordLimit')
    expect(firstRead.props).not.toHaveProperty('maxLength')
    expect(secondRead.attribute.filter((item: any) => item.field === 'previewEnabled')).toHaveLength(1)
    expect(secondRead.attribute.filter((item: any) => item.field === 'previewText')).toHaveLength(1)
    expect(source.formList[0].props).not.toHaveProperty('previewEnabled')
    expect(source.formList[0].props).not.toHaveProperty('previewText')
  })

  it('keeps legacy URL component names and normalizes string switch values', () => {
    const entries = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => entries.get(key) ?? null,
      setItem: (key: string, value: string) => entries.set(key, value),
    })
    const legacyUrl = {
      formList: [{
        type: 'url',
        component: 'qInput',
        props: { previewEnabled: '1' },
        attribute: [],
      }],
    }

    setFormById(legacyUrl, 'legacy-url')
    const result = getFormById('legacy-url').formList[0]

    expect(result.type).toBe('url')
    expect(result.component).toBe('qInput')
    expect(result.props.previewEnabled).toBe(true)
    expect(result.props.previewText).toBe('预览')
    expect(result.attribute).toContainEqual({ field: 'previewEnabled', label: '开启预览', type: 'switch' })
    expect(result.attribute).toContainEqual({
      field: 'previewText',
      label: '预览按钮文案',
      type: 'input',
      hideLabel: true,
      showWhen: { field: 'previewEnabled', value: true },
    })
  })
})
