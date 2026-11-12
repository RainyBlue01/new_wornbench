import { describe, expect, it } from 'vitest'

import { createFormEventApi, executeCodeFormEvent } from './useFormEvents'

describe('form event runtime', () => {
  it('controls nested field visibility by field id', () => {
    const field = { id: 'name', title: '姓名', props: { required: false } }
    const fields = [{ id: 'layout', children: [field] }]
    const formApi = createFormEventApi(fields)

    expect(formApi.hideField('name')).toBe(true)
    expect(field.showItem).toBe(true)

    expect(formApi.showField('name')).toBe(true)
    expect(field.showItem).toBe(false)
    expect(formApi.hideField('missing')).toBe(false)
  })

  it('updates field rules and required state', () => {
    const field = { id: 'phone', title: '手机号', props: { required: false } }
    const rules: Record<string, any[]> = {}
    const formApi = createFormEventApi([field], rules)

    formApi.setFieldRules('phone', { match: /^1\d{10}$/, message: '格式错误' })
    formApi.setFieldRequired('phone', true, '手机号必填')

    expect(field.props.required).toBe(true)
    expect(rules.phone).toHaveLength(2)
    expect(rules.phone[0]).toMatchObject({ required: true, message: '手机号必填' })

    formApi.setFieldRequired('phone', false)
    expect(field.props.required).toBe(false)
    expect(rules.phone).toHaveLength(2)
    expect(rules.phone[0].required).toBe(false)

    formApi.clearFieldRules('phone')
    expect(rules.phone).toBeUndefined()
  })

  it('exposes rules and formApi to event scripts', async () => {
    const field = { id: 'result', title: '结果', props: { value: '', required: false } }
    const formData = { result: '' }
    const rules: Record<string, any[]> = {}

    await executeCodeFormEvent(
      {
        id: 'event-1',
        name: '控制字段',
        trigger: 'submit',
        enabled: true,
        code: `
          formData.result = '已执行';
          formApi.hideField('result');
          formApi.setFieldRequired('result', true, '结果必填');
          rules.result.push({ minLength: 2, message: '至少两个字符' });
        `,
      },
      formData,
      [field],
      rules,
    )

    expect(formData.result).toBe('已执行')
    expect(field.props.value).toBe('已执行')
    expect(field.showItem).toBe(true)
    expect(rules.result).toHaveLength(2)
  })
})
