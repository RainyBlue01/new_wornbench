import { onMounted, shallowRef } from 'vue'
import {
  getManagementPluginDetail,
  getPluginPage,
  removeManagementPlugin,
  updatePluginStatus,
} from '@/api/plugin'
import type { PluginDetailResponse, PluginFunctionResponse } from '@/views/pluginCenter/types'
import type { FormPluginFunction, FormPluginItem } from './types'

function parseParams(value?: string): string[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    const list = Array.isArray(parsed) ? parsed : [parsed]
    return list.map((item: Record<string, unknown>) =>
      `${String(item.name ?? item.key ?? '')}: ${String(item.type ?? 'Object')}`,
    )
  } catch {
    return []
  }
}

function mapFunction(item: PluginFunctionResponse): FormPluginFunction {
  const output = parseParams(item.outputParams)
  return {
    name: item.extensionName ?? item.functionName ?? item.extensionCode ?? '',
    description: item.extensionDescription ?? item.description ?? '',
    functionType: item.functionType === 'frontend' ? 'frontend' : 'backend',
    params: parseParams(item.inputParams),
    returns: output.join(', ') || 'Object',
  }
}

function mapPlugin(item: PluginDetailResponse): FormPluginItem {
  const extensions = item.extensions ?? item.functions ?? []
  return {
    id: String(item.pluginId ?? item.id ?? ''),
    name: item.pluginName ?? '',
    description: item.pluginDescription ?? item.description ?? '',
    version: item.version ? `v${item.version.replace(/^v/, '')}` : 'v1.0',
    packageName: item.pluginId ?? '',
    enabled: item.status === undefined ? true : item.status === 1,
    bindField: `${item.extensionCount ?? item.functionCount ?? extensions.length} 个函数`,
    installedAt: item.createTime ?? '',
    icon: 'plug',
    manifest: item.apiDoc ?? '',
    functions: extensions.map(mapFunction),
  }
}

export function useFormPlugins() {
  const plugins = shallowRef<FormPluginItem[]>([])
  const loading = shallowRef(false)

  async function load() {
    loading.value = true
    try {
      const data = await getPluginPage({ pageNum: 1, pageSize: 100, pluginType: 'app' })
      plugins.value = (data?.records ?? []).map(mapPlugin)
    } finally {
      loading.value = false
    }
  }

  async function toggle(id: string, enabled: boolean) {
    await updatePluginStatus(id, enabled ? 1 : 0)
    plugins.value = plugins.value.map(plugin => plugin.id === id ? { ...plugin, enabled } : plugin)
  }

  async function uninstall(id: string) {
    await removeManagementPlugin(id)
    plugins.value = plugins.value.filter(plugin => plugin.id !== id)
  }

  async function getDetail(id: string) {
    return mapPlugin(await getManagementPluginDetail(id))
  }

  onMounted(load)
  return { plugins, loading, load, toggle, uninstall, getDetail }
}
