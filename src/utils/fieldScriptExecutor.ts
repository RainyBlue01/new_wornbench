export interface FieldScriptProvideState {
  getPropsItem?: (...args: any[]) => unknown
  setPropsItem?: (...args: any[]) => unknown
  filterData?: (...args: any[]) => unknown
}

export interface FieldScriptContext {
  field: any
  formConfs: any
  value: unknown
  oldValue: unknown
  provideState: FieldScriptProvideState | null
}

type FieldScriptRunner = (
  provideState: FieldScriptProvideState | null,
  props: { comDes: any; formConfs: any },
  context: Readonly<FieldScriptContext>,
) => Promise<unknown>

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as new (
  ...args: string[]
) => FieldScriptRunner
const runnerCache = new Map<string, FieldScriptRunner>()
const MAX_CACHE_SIZE = 100

function compileFieldScript(source: string): FieldScriptRunner {
  const cached = runnerCache.get(source)
  if (cached) return cached

  const runner = new AsyncFunction(
    'provideState',
    'props',
    'context',
    `"use strict";\n${source}\n//# sourceURL=form-field-input-script.js`,
  )

  if (runnerCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = runnerCache.keys().next().value
    if (oldestKey !== undefined) runnerCache.delete(oldestKey)
  }
  runnerCache.set(source, runner)
  return runner
}

export async function executeFieldScript(
  source: unknown,
  context: FieldScriptContext,
): Promise<unknown> {
  if (typeof source !== 'string' || !source.trim()) return undefined

  try {
    const runner = compileFieldScript(source)
    const readonlyContext = Object.freeze({ ...context })
    return await runner(
      context.provideState,
      {
        comDes: context.field,
        formConfs: context.formConfs,
      },
      readonlyContext,
    )
  } catch (error) {
    console.error('[表单字段脚本] 执行失败', {
      fieldId: context.field?.id,
      fieldTitle: context.field?.title,
      error,
    })
    throw error
  }
}
