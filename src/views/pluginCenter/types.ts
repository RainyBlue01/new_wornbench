export interface PluginParameterItem {
  key?: string
  name: string
  type: string
  label?: string
  map?: string
  description?: string
  required?: boolean
}

export interface PluginFunctionItem {
  id: string
  functionId: string
  functionName: string
  functionType: string
  description: string
  language: string
  implMode: string
  entryFunc: string
  packageFile: string
  timeout: number
  inputParams: PluginParameterItem[]
  outputParams: PluginParameterItem[]
  sortOrder: number
  createTime: string
  updateTime: string
  code: string
}

export interface PluginItem {
  id: string
  name: string
  description: string
  version: string
  pluginType: string
  functionCount: number
  enabled: boolean
  icon: string
  color: string
  createdAt: string
  updatedAt: string
  createUser?: string
  updateUser?: string
  functions?: PluginFunctionItem[]
}

export interface PluginFunctionResponse {
  id?: string | number
  functionId?: string
  functionName?: string
  functionType?: string
  description?: string
  language?: string
  implMode?: string
  entryFunc?: string
  packageFile?: string
  timeout?: number
  inputParams?: string
  outputParams?: string
  sortOrder?: number
  createTime?: string
  updateTime?: string
  code?: string
  functionCode?: string
  extensionCode?: string
  extensionName?: string
  extensionDescription?: string
}

export interface PluginDetailResponse {
  id?: number
  pluginId?: string
  pluginName?: string
  description?: string
  version?: string
  pluginType?: string
  pluginLanguage?: string
  pluginDescription?: string
  status?: number
  publishStatus?: number
  icon?: string
  functionCount?: number
  functions?: PluginFunctionResponse[]
  extensions?: PluginFunctionResponse[]
  apiDoc?: string
  extensionCount?: number
  createUser?: string
  createTime?: string
  updateUser?: string
  updateTime?: string
}

export interface PluginPageResponse {
  records?: PluginDetailResponse[]
  total?: number
  size?: number
  current?: number
  pages?: number
}

export interface PluginConfigItem {
  key: string
  label: string
  type: string
  required?: boolean
  value?: unknown
}

export interface PluginUploadResponse {
  pluginId: string
  pluginName: string
  version: string
  pluginDescription?: string
  pluginType?: 'system' | 'app'
  configItems?: PluginConfigItem[]
  extensions?: PluginFunctionResponse[]
}

export interface PluginConfigPayload {
  pluginId: string
  configMap: Record<string, unknown>
}

export interface PluginParamMapping {
  name: string
  type: string
  map: string
  required?: boolean
}

export interface PluginNodeConfigPayload {
  appId: string
  nodeId: string
  pluginId: string
  extensionCode: string
  failureAction: string
  inputParams: PluginParamMapping[]
  outputParams: PluginParamMapping[]
}

export interface PluginNodeConfigResponse extends PluginNodeConfigPayload {
  pluginName?: string
  extensionName?: string
  createTime?: string
}

export interface PluginFormValue {
  id: string
  name: string
  pluginCategory: string
  description: string
  version: string
  icon: string
}
