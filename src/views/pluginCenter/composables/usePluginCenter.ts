import { onMounted, reactive, shallowRef } from 'vue'
import {
  getManagementPluginDetail,
  getPluginPage,
  removeManagementPlugin,
  updatePluginStatus,
} from '@/api/plugin'
import type {
  PluginDetailResponse,
  PluginFunctionItem,
  PluginFunctionResponse,
  PluginItem,
  PluginParameterItem,
} from '../types'

const palette = ['#8247f5', '#ec2f83', '#0ba7c1', '#f5650b', '#65bd00', '#506580']

function parseParameters(value?: string): PluginParameterItem[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    const parameters = Array.isArray(parsed) ? parsed : [parsed]
    return parameters.map((parameter: Record<string, unknown>, index) => ({
      name: String(parameter.name ?? parameter.paramName ?? parameter.key ?? `param${index + 1}`),
      type: String(parameter.type ?? parameter.paramType ?? parameter.dataType ?? 'Object'),
      description: parameter.description ? String(parameter.description) : undefined,
      required: Boolean(parameter.required),
    }))
  } catch {
    return []
  }
}

function mapFunction(item: PluginFunctionResponse): PluginFunctionItem {
  return {
    id: String(item.id ?? item.extensionCode ?? item.functionId ?? ''),
    functionId: item.extensionCode ?? item.functionId ?? '',
    functionName: item.extensionName ?? item.functionName ?? item.extensionCode ?? '',
    functionType: item.functionType ?? 'backend',
    description: item.extensionDescription ?? item.description ?? '',
    language: item.language ?? '',
    implMode: item.implMode ?? 'package',
    entryFunc: item.entryFunc ?? '',
    packageFile: item.packageFile ?? '',
    timeout: item.timeout ?? 0,
    inputParams: parseParameters(item.inputParams),
    outputParams: parseParameters(item.outputParams),
    sortOrder: item.sortOrder ?? 0,
    createTime: item.createTime ?? '',
    updateTime: item.updateTime ?? '',
    code: item.code ?? item.functionCode ?? '',
  }
}

function mapPlugin(item: PluginDetailResponse, index = 0): PluginItem {
  const functions = (item.extensions ?? item.functions ?? []).map(mapFunction)
  return {
    id: String(item.pluginId ?? item.id ?? ''),
    name: item.pluginName ?? '',
    description: item.pluginDescription ?? item.description ?? '',
    version: item.version ?? '1.0.0',
    pluginType: item.pluginType ?? item.pluginLanguage ?? '',
    functionCount: item.extensionCount ?? item.functionCount ?? functions.length,
    enabled: item.status === undefined ? true : item.status === 1,
    icon: item.icon ?? '',
    color: palette[index % palette.length],
    createdAt: item.createTime ?? '',
    updatedAt: item.updateTime ?? '',
    createUser: item.createUser,
    updateUser: item.updateUser,
    functions,
  }
}

export function usePluginCenter() {
  const plugins = shallowRef<PluginItem[]>([])
  const loading = shallowRef(false)
  const uploadVisible = shallowRef(false)
  const detailVisible = shallowRef(false)
  const detailLoading = shallowRef(false)
  const selectedPlugin = shallowRef<PluginItem | null>(null)
  const pagination = reactive({ current: 1, pageSize: 10, total: 0 })

  async function fetchPlugins(page = pagination.current) {
    loading.value = true
    try {
      const data = await getPluginPage({ pageNum: page, pageSize: pagination.pageSize })
      pagination.current = data?.current || page
      pagination.pageSize = data?.size || pagination.pageSize
      pagination.total = data?.total || 0
      plugins.value = (data?.records ?? []).map((item, index) => mapPlugin(item, index))
    } finally {
      loading.value = false
    }
  }

  async function showDetail(plugin: PluginItem) {
    selectedPlugin.value = plugin
    detailVisible.value = true
    detailLoading.value = true
    try {
      const data = await getManagementPluginDetail(plugin.id)
      const listIndex = plugins.value.findIndex(item => item.id === plugin.id)
      selectedPlugin.value = mapPlugin(data, Math.max(listIndex, 0))
    } finally {
      detailLoading.value = false
    }
  }

  async function togglePlugin(id: string, enabled: boolean) {
    try {
      await updatePluginStatus(id, enabled ? 1 : 0)
      plugins.value = plugins.value.map(item => item.id === id ? { ...item, enabled } : item)
      return true
    } catch {
      return false
    }
  }

  async function removePlugin(id: string) {
    try {
      await removeManagementPlugin(id)
      await fetchPlugins(plugins.value.length === 1 && pagination.current > 1 ? pagination.current - 1 : pagination.current)
      return true
    } catch {
      return false
    }
  }

  onMounted(() => fetchPlugins())

  return {
    plugins,
    loading,
    uploadVisible,
    detailVisible,
    detailLoading,
    selectedPlugin,
    pagination,
    fetchPlugins,
    showDetail,
    togglePlugin,
    removePlugin,
  }
}
