import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { createChangeRecordFormatter } from './changeRecordFormat'
import type { FormConfs } from '@/types/form'

describe('change record formatter', () => {
  it('reads refreshed field configuration and reference maps after initialization', () => {
    const formConfs = ref<FormConfs>({ formList: [] })
    const userNameMap = ref(new Map<string, string>())
    const deptNameMap = ref(new Map<string, string>())
    const formatter = createChangeRecordFormatter({ formConfs, userNameMap, deptNameMap })
    expect(formatter.getFieldName('user')).toBe('user')
    formConfs.value = { formList: [{ id: 'user', title: '经办人', type: 'USER' }] }
    userNameMap.value = new Map([['u1', '张三']])
    expect(formatter.getFieldName('user')).toBe('经办人')
    expect(formatter.formatFieldValue('u1', 'user')).toBe('张三')
    userNameMap.value = new Map([['u1', '李四']])
    expect(formatter.formatFieldValue('u1', 'user')).toBe('李四')
    expect(formatter.formatFieldValue(null, 'user')).toBe('-')
  })
})
