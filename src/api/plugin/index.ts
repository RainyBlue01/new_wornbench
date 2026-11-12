import { Request } from '@/utils/request'
import type { PluginDetailResponse, PluginFunctionResponse } from '@/views/pluginCenter/types'
import type {
  PluginPageResponse,
  PluginConfigPayload,
  PluginNodeConfigPayload,
  PluginNodeConfigResponse,
  PluginUploadResponse,
} from '@/views/pluginCenter/types'

const request = new Request({})
const baseUrl = '/internal/business/plugin/v1/'
const managementBaseUrl = '/internal/business/plugin/v1'

export interface PluginPageParams {
  pageNum?: number
  pageSize?: number
  pluginType?: string
  keyword?: string
  status?: number
}

/** 插件中心：分页查询插件列表。 */
export function getPluginPage(params: PluginPageParams) {
  return request.get<PluginPageResponse>(`${managementBaseUrl}/page`, { params })
}

/** 插件中心：获取插件与扩展详情。 */
export function getManagementPluginDetail(pluginId: string) {
  return request.get<PluginDetailResponse>(
    `${managementBaseUrl}/detail/${encodeURIComponent(pluginId)}`,
  )
}

/** 插件中心：显式更新启停状态（1 启用，0 停用）。 */
export function updatePluginStatus(pluginId: string, status: number) {
  return request.put<null>(
    `${managementBaseUrl}/status/${encodeURIComponent(pluginId)}`,
    undefined,
    { params: { status } },
  )
}

/** 插件中心：删除插件。 */
export function removeManagementPlugin(pluginId: string) {
  return request.delete<null>(`${managementBaseUrl}/${encodeURIComponent(pluginId)}`)
}

/** 插件中心：上传并解析插件 ZIP 包。 */
export async function uploadPluginPackage(
  file: File,
  pluginType: 'system' | 'app',
): Promise<PluginUploadResponse> {
  const formData = new FormData()
  formData.append('file', file)
  return await request.post<PluginUploadResponse>(`${managementBaseUrl}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    params: { pluginType },
    timeout: 120000,
  }) as unknown as PluginUploadResponse
}

/** 保存插件实例配置。 */
export function savePluginConfig(data: PluginConfigPayload) {
  return request.post<null>(`${managementBaseUrl}/config`, data)
}

/** 保存流程节点使用的插件、扩展及参数映射。 */
export function savePluginNodeConfig(data: PluginNodeConfigPayload) {
  return request.post<null>(`${managementBaseUrl}/node/config`, data)
}

/** 获取流程节点插件配置。 */
export function getPluginNodeConfig(nodeId: string, appId: string) {
  return request.get<PluginNodeConfigResponse>(
    `${managementBaseUrl}/node/config/${encodeURIComponent(nodeId)}`,
    { params: { appId } },
  )
}

/** 删除流程节点插件配置。 */
export function deletePluginNodeConfig(nodeId: string, appId: string) {
  return request.delete<null>(
    `${managementBaseUrl}/node/config/${encodeURIComponent(nodeId)}`,
    { params: { appId } },
  )
}

/** 获取已启用插件，供流程设计/表单配置使用。 */
export function getEnabledPluginList(pluginType?: string) {
  return request.get<PluginDetailResponse[]>(`${managementBaseUrl}/enabled`, {
    params: pluginType ? { pluginType } : undefined,
  })
}

/** 获取插件声明的扩展列表。 */
export function getPluginExtensionList(pluginId: string) {
  return request.get<PluginFunctionResponse[]>(
    `${managementBaseUrl}/extension/${encodeURIComponent(pluginId)}`,
  )
}

export interface CreatePluginPayload {
  pluginName: string
  pluginCategory: string
  description?: string
  icon?: string
}

export interface UpdatePluginPayload {
  pluginId: string
  pluginName?: string
  description?: string
  version?: string
  status?: number
}

export interface PublishPluginPayload {
  pluginId: string
  pluginName: string
  description?: string
  version: string
}

export interface AddPluginFunctionPayload {
  pluginId: string
  functionName: string
  functionType: 'frontend' | 'backend'
  description?: string
  implMode?: 'code' | 'package'
  language?: string
  entryFunc?: string
  packageFile?: string
  timeout?: number
}

export interface UpdatePluginFunctionPayload {
  id: string
  functionName?: string
  description?: string
  functionType?: 'frontend' | 'backend'
  implMode?: 'code' | 'package'
  language?: string
  entryFunc?: string
  packageFile?: string
  timeout?: number
  inputParams?: string
  outputParams?: string
}

export interface UpdatePluginFunctionCodePayload {
  id: string
  code: string
  language?: string
}

export interface ExecutePluginFunctionPayload {
  functionId: string
  inputParams: string
}

export interface ExecutePluginFunctionResult {
  success: boolean
  data: unknown
  executionTime?: number
  message?: string
}

export function getPluginList() {
  return request.get<PluginDetailResponse[]>(`${baseUrl}/system/list`)
}

/**
 * 获取已发布且已启用的插件，供表单事件等运行态配置选择。
 */
export function getPublishedPluginList() {
  return request.get<PluginDetailResponse[]>(`${baseUrl}/system/published/list`)
}

export function getPluginDetail(pluginId: string) {
  return request.get<PluginDetailResponse>(`${baseUrl}/system/detail/${encodeURIComponent(pluginId)}`)
}

export function createPlugin(data: CreatePluginPayload) {
  return request.post<null>(`${baseUrl}/system/create`, data)
}

export function updatePlugin(data: UpdatePluginPayload) {
  return request.put<boolean>(`${baseUrl}/system/update`, data)
}

export function togglePlugin(pluginId: string) {
  return request.put<boolean>(`${baseUrl}/system/toggle/${encodeURIComponent(pluginId)}`)
}

export function deletePlugin(pluginId: string) {
  return request.delete<boolean>(`${baseUrl}/system/delete/${encodeURIComponent(pluginId)}`)
}

export function publishPlugin(data: PublishPluginPayload) {
  return request.post<boolean>(`${baseUrl}/system/publish`, data)
}

export function getPluginFunctionList(pluginId: string) {
  return request.get<PluginFunctionResponse[]>(`${baseUrl}/function/list/${encodeURIComponent(pluginId)}`)
}

/**
 * 获取指定已发布插件的函数及其入参、出参配置。
 */
export function getPublishedPluginFunctionList(pluginId: string) {
  return request.get<PluginFunctionResponse[]>(
    `${baseUrl}/published/functions/${encodeURIComponent(pluginId)}`,
  )
}

export function getPluginFunctionDetail(functionId: string) {
  return request.get<PluginFunctionResponse>(`${baseUrl}/function/detail/${encodeURIComponent(functionId)}`)
}

export function addPluginFunction(data: AddPluginFunctionPayload) {
  return request.post<PluginFunctionResponse>(`${baseUrl}/function/add`, data)
}

export function updatePluginFunction(data: UpdatePluginFunctionPayload) {
  return request.put<boolean>(`${baseUrl}/function/update`, data)
}

export function updatePluginFunctionCode(data: UpdatePluginFunctionCodePayload) {
  return request.put<boolean>(`${baseUrl}/function/code`, data)
}

export function deletePluginFunction(functionId: string) {
  return request.delete<boolean>(`${baseUrl}/function/delete/${encodeURIComponent(functionId)}`)
}

export function executePluginFunction(data: ExecutePluginFunctionPayload) {
  return request.post<ExecutePluginFunctionResult>(`${baseUrl}/function/execute`, data)
}
