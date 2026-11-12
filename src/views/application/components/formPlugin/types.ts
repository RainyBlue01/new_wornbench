export type FormPluginIcon = 'bolt' | 'calculator' | 'check-circle' | 'plug'

export interface FormPluginFunction {
  name: string
  description: string
  functionType?: 'frontend' | 'backend'
  params: string[]
  returns: string
}

export interface FormPluginItem {
  id: string
  name: string
  description?: string
  version: string
  packageName: string
  enabled: boolean
  bindField: string
  installedAt: string
  icon: FormPluginIcon
  manifest: string
  packagePath?: string
  functions?: FormPluginFunction[]
}

export type FormPluginInstallPayload = Omit<FormPluginItem, 'manifest'>
