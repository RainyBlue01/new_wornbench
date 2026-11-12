import Ajv from 'ajv'

const ajv = new Ajv({
  allErrors: true,
  strict: false,
  allowUnionTypes: true,
})

const validatorCache = new Map<string, ReturnType<Ajv['compile']>>()

const getSchemaKey = (schema: any) => {
  try {
    return JSON.stringify(schema || {})
  } catch {
    return ''
  }
}

const getCompiledValidator = (schema: any) => {
  const key = getSchemaKey(schema)
  if (!key) return null
  const cached = validatorCache.get(key)
  if (cached) return cached
  const validator = ajv.compile(schema)
  validatorCache.set(key, validator)
  return validator
}

const getFieldTitle = (schema: any, fieldKey?: string) => {
  if (!fieldKey) return schema?.title || '字段'
  return schema?.properties?.[fieldKey]?.title || fieldKey
}

const normalizeAjvError = (schema: any, error: any) => {
  const params = error?.params || {}
  const instancePath = String(error?.instancePath || '').replace(/^\//, '')
  const fieldKey = params.missingProperty || instancePath.split('/')[0] || ''
  const fieldTitle = getFieldTitle(schema, fieldKey)

  switch (error?.keyword) {
    case 'required':
      return { fieldKey, message: `${fieldTitle}不能为空` }
    case 'type':
      return { fieldKey, message: `${fieldTitle}类型不符合Schema要求` }
    case 'minLength':
      return { fieldKey, message: `${fieldTitle}长度不能小于${params.limit}` }
    case 'maxLength':
      return { fieldKey, message: `${fieldTitle}长度不能大于${params.limit}` }
    case 'minimum':
      return { fieldKey, message: `${fieldTitle}不能小于${params.limit}` }
    case 'maximum':
      return { fieldKey, message: `${fieldTitle}不能大于${params.limit}` }
    case 'pattern':
      return { fieldKey, message: `${fieldTitle}格式不正确` }
    case 'enum':
      return { fieldKey, message: `${fieldTitle}不在允许范围内` }
    default:
      return { fieldKey, message: `${fieldTitle}${error?.message || '校验不通过'}` }
  }
}

export const validateJsonSchemaModel = (schema: any, value: any) => {
  if (!schema || typeof schema !== 'object') {
    return {
      valid: true,
      firstError: '',
      fieldErrors: {} as Record<string, string>,
    }
  }

  try {
    const validate = getCompiledValidator(schema)
    if (!validate) {
      return {
        valid: true,
        firstError: '',
        fieldErrors: {} as Record<string, string>,
      }
    }

    const valid = validate(value)
    if (valid) {
      return {
        valid: true,
        firstError: '',
        fieldErrors: {} as Record<string, string>,
      }
    }

    const fieldErrors: Record<string, string> = {}
    let firstError = ''

    ;(validate.errors || []).forEach((error) => {
      const normalized = normalizeAjvError(schema, error)
      if (normalized.fieldKey && !fieldErrors[normalized.fieldKey]) {
        fieldErrors[normalized.fieldKey] = normalized.message
      }
      if (!firstError) {
        firstError = normalized.message
      }
    })

    return {
      valid: false,
      firstError,
      fieldErrors,
    }
  } catch (error) {
    console.error('JSON Schema校验初始化失败:', error)
    return {
      valid: true,
      firstError: '',
      fieldErrors: {} as Record<string, string>,
    }
  }
}
