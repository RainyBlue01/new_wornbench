<template>

  <div class="flow-designer-page flowPath" :class="{ 'flow-designer-page--no-right': !activeFlew.id }">

    <banner :active="2" breadcrumb-current="流程设计" />

    <div class="flow-designer-body flowPath-body">

      <aside class="flow-designer-sidebar-left left">

        <leftPannel :pannelList="pannelList" />

      </aside>



      <main class="flow-designer-canvas flow">

        <div class="flow-designer-canvas-outer flow-canvas-outer" ref="flowCanvasRef" @mousedown="onCanvasMouseDown"
          @click.capture="onCanvasClickCapture">

          <div class="flow-designer-canvas-inner flow-canvas-inner" :style="canvasStyle">

            <section class="dingflow-design">

              <div class="box-scale-container">

                <div class="box-scale">

                  <nodeWrap :roleList="roleList" :deptList="deptList" :postList="postList"
                    v-model:nodeConfig="nodeConfig" :formList="formConfs.formList"
                    v-model:flowPermission="flowPermission" />

                </div>

              </div>

            </section>

          </div>

        </div>

      </main>



      <rightPannel v-if="activeFlew.id" :roleList="roleList" :deptList="deptList" :postList="postList"
        :activeFlew="activeFlew" :form-list="formConfs.formList" />

    </div>



    <div class="flow-designer-bottom-bar">

      <div class="flow-designer-status-info">

        <span>

          <i class="fas fa-project-diagram" aria-hidden="true" />

          已配置 <strong class="status-count">{{ nodeCount }}</strong> 个节点

        </span>

        <span>

          <i class="fas fa-clock" aria-hidden="true" />

          上次保存：<strong class="status-save">{{ lastSaveLabel }}</strong>

        </span>

        <span>

          <i class="fas fa-check-circle" aria-hidden="true" />

          状态：<strong class="status-editing">编辑中</strong>

        </span>

      </div>

      <div class="flow-designer-status-actions">

        <!-- <button type="button" class="btn-bar btn-bar--ghost" disabled title="撤销">

          <i class="fas fa-undo" aria-hidden="true" />撤销

        </button> -->

        <button type="button" class="btn-bar btn-bar--ghost" title="重做" @click="handleRedo">

          <i class="fas fa-redo" aria-hidden="true" />重做

        </button>

        <button type="button" class="btn-bar btn-bar--ghost" :disabled="saving" @click="handleSave">

          <i class="fas fa-save" aria-hidden="true" />保存

        </button>

        <button type="button" class="btn-bar btn-bar--ghost" @click="on">

          <i class="fas fa-arrow-left" aria-hidden="true" />上一步

        </button>

        <button type="button" class="btn-bar btn-bar--primary" :disabled="saving" @click="up">

          下一步：发布应用

        </button>

      </div>

    </div>



    <setBranch ref="setBranchRef" :deptList="deptList" :formList="formConfs.formList" @init="setData"
      :nowNode="nowNode" />

    <a-modal v-model:visible="showSaveModal" title="提示" title-align="start" hide-footer class="save-confirm-modal"
      :mask-closable="true" :unmount-on-close="true">
      <div class="modal-content">
        <div class="modal-icon">
          <svg viewBox="0 0 24 24" width="48" height="48">
            <circle cx="12" cy="12" r="10" fill="rgba(var(--primary-6), 0.1)" />
            <path
              d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-4v2h2v-2h-2zm0-8v6h2V8h-2z"
              fill="rgb(var(--primary-6))" />
          </svg>
        </div>
        <div class="modal-text">确定要保存流程设计吗？</div>
      </div>
      <template #footer>
        <div class="modal-footer">
          <a-button class="btn-next" :disabled="saving" @click="handleModalCancel">
            下一步
          </a-button>
          <a-button class="btn-save" type="primary" :loading="saving" @click="handleModalOk">
            保存
          </a-button>
        </div>
      </template>
    </a-modal>
  </div>

</template>

<script lang="ts" setup>

import { ref, provide, onBeforeUnmount, computed } from 'vue';

import setBranch from './components/setBranch.vue'

import { flowId } from '@/utils/id.ts';

import { designApp, processHistory } from '@/api/form/index'
import { connectProcess } from '@/api/connector'
import { getCreatorDes } from '@/api/homePage/index'
import { savePluginNodeConfig } from '@/api/plugin'
import type { PluginNodeConfigPayload, PluginParameterItem } from '@/views/pluginCenter/types'

import { setProps, setFlow, setFlowById, getFlowById } from '@/utils/flowPath.ts'

import leftPannel from './components/leftPannel.vue';

import rightPannel from './components/rightPannel.vue';

import { nodeData } from '@/data/const'

import { getDeptTree, getRoleList, getPostList } from '@/api/common/index'

import { useRoute, useRouter } from 'vue-router'

import { getFormById, toBackendFormDateFormats } from '@/utils/form'

import { getAppReturnRoute } from '@/views/application/composables/useAppFormNav'

import { Message, Modal } from '@arco-design/web-vue'



const nowNode = ref({})

const setBranchRef = ref()

const route = useRoute()

const router = useRouter()

const pannelList = ref<any[]>([])

const formConfs = getFormById(route.query.id)

const normalizePluginNodeData = (node: any) => {
  if (!node || typeof node !== 'object') return
  if (node.type === 'PLUGIN') {
    node['@class'] = 'com.joyou.module.plugin.behavior.PluginNode'
    node.extensionCode = node.extensionCode || node.extensioncode || node.functionId || ''
    node.extensionName = node.extensionName || node.functionName || ''
    node.extensionDescription = node.extensionDescription || node.functionDesc || ''
    node.executionMode ||= 'sync'
    node.failureAction ||= 'block'
    node.inputMappingEnabled ??= true
    node.outputMappingEnabled ??= true
    delete node.extensioncode
    delete node.functionId
    delete node.functionName
    delete node.functionDesc
    delete node.functionLanguage
    delete node.functionType
  }
  if (node.childNode?.id) normalizePluginNodeData(node.childNode)
  if (Array.isArray(node.conditionNodes)) {
    node.conditionNodes.forEach((branch: any) => normalizePluginNodeData(branch))
  }
}

let flowData = getFlowById(route.query.id)
const nodeConfig = ref(flowData && flowData.id ? flowData : JSON.parse(JSON.stringify(nodeData)))
normalizePluginNodeData(nodeConfig.value)
const initialHadFlowData = Boolean(flowData && flowData.id)
const hasSavedInSession = ref(false)
const lastSavedSnapshot = ref(JSON.parse(JSON.stringify(nodeConfig.value)))

if (!nodeConfig.value.id) {

  nodeConfig.value.id = flowId()

  nodeConfig.value.code = flowId()

  nodeConfig.value.childNode.id = flowId()

  nodeConfig.value.childNode.code = flowId()

}

setProps(nodeConfig.value, formConfs.formList)

const roleList = ref([])

const deptList = ref([])

const postList = ref([])

const flowPermission = ref([])

const activeFlew = ref<{ id: string }>({ id: '' })

const saving = ref(false)
const showSaveModal = ref(false)

const saveStorageKey = computed(() => `flow_save_${route.query.id}`)

const lastSaveLabel = ref('未保存')



const loadLastSaveLabel = () => {

  const saved = localStorage.getItem(saveStorageKey.value)

  lastSaveLabel.value = saved || '未保存'

}

loadLastSaveLabel()



const countFlowNodes = (node: any): number => {

  if (!node?.id) return 0

  let count = 1

  if (node.type === 7 && Array.isArray(node.conditionNodes)) {

    node.conditionNodes.forEach((branch: any) => {

      if (branch.childNode?.id) {

        count += countFlowNodes(branch.childNode)

      }

    })

  }

  if (node.childNode?.id) {

    count += countFlowNodes(node.childNode)

  }

  return count

}



const nodeCount = computed(() => countFlowNodes(nodeConfig.value))



const activeNodeId = computed(() => activeFlew.value?.id || '')



const flowCanvasRef = ref<HTMLElement | null>(null)

const canvasOffset = ref({ x: 0, y: 0 })

const isPanPending = ref(false)

const panActivated = ref(false)

const panStart = { x: 0, y: 0, offsetX: 0, offsetY: 0 }

const PAN_THRESHOLD = 5

let suppressNodeClickUntil = 0



const canvasStyle = computed(() => ({

  transform: `translate(${canvasOffset.value.x}px, ${canvasOffset.value.y}px)`,

}))



const PAN_BLOCK_SELECTOR =

  'button, input, textarea, select, a, .arco-btn, .arco-select, .arco-input, .anticon, .add-node-btn, .node-delete, .flow-add-menu-item'



const activatePanning = () => {

  if (panActivated.value) return

  panActivated.value = true

  const container = flowCanvasRef.value

  if (container) {

    container.style.cursor = 'grabbing'

  }

  const inner = container?.querySelector('.flow-canvas-inner') as HTMLElement

  if (inner) {

    inner.style.transition = 'none'

  }

}



const onCanvasMouseMove = (e: MouseEvent) => {

  if (!isPanPending.value) return



  const dx = e.clientX - panStart.x

  const dy = e.clientY - panStart.y



  if (!panActivated.value) {

    if (Math.abs(dx) < PAN_THRESHOLD && Math.abs(dy) < PAN_THRESHOLD) {

      return

    }

    activatePanning()

  }



  canvasOffset.value.x = panStart.offsetX + dx

  canvasOffset.value.y = panStart.offsetY + dy

  e.preventDefault()

}



const stopPanning = () => {

  if (!isPanPending.value && !panActivated.value) return



  if (panActivated.value) {

    suppressNodeClickUntil = Date.now() + 200

  }



  isPanPending.value = false

  panActivated.value = false



  const container = flowCanvasRef.value

  if (container) {

    container.style.cursor = 'grab'

  }

  window.removeEventListener('mousemove', onCanvasMouseMove)

  window.removeEventListener('mouseup', stopPanning)



  const inner = container?.querySelector('.flow-canvas-inner') as HTMLElement

  if (inner) {

    inner.style.transition = 'transform 0.15s ease-out'

  }

}



const onCanvasMouseDown = (e: MouseEvent) => {

  if (e.button !== 0) return

  const target = e.target as HTMLElement

  if (target.closest(PAN_BLOCK_SELECTOR)) return



  const container = flowCanvasRef.value

  if (!container) return



  isPanPending.value = true

  panActivated.value = false

  panStart.x = e.clientX

  panStart.y = e.clientY

  panStart.offsetX = canvasOffset.value.x

  panStart.offsetY = canvasOffset.value.y



  window.addEventListener('mousemove', onCanvasMouseMove)

  window.addEventListener('mouseup', stopPanning)

}



const onCanvasClickCapture = (e: MouseEvent) => {

  if (Date.now() < suppressNodeClickUntil) {

    e.stopPropagation()

  }

}



onBeforeUnmount(() => {

  stopPanning()

})



const buildDesignParams = () => {
  // Normalize again at the serialization boundary so nodes restored from old
  // drafts never send the legacy PluginNode class or function* field names.
  normalizePluginNodeData(nodeConfig.value)
  const processConfig = {
    sequenceFlows: [] as Array<{ sourceRef: any; targetRef: any }>,
    nodes: [] as any[],
  }
  setFlow(nodeConfig.value, processConfig.nodes)
  processConfig.nodes.forEach((v1: any) => {
    if (v1.pid?.length) {
      v1.pid.forEach((v2: any) => {
        processConfig.sequenceFlows.push({
          sourceRef: v2,
          targetRef: v1.id,
        })
      })
    }

  })

  const formConfig = toBackendFormDateFormats(formConfs)

  return {
    processConfig: JSON.stringify(processConfig),
    formConfig: JSON.stringify(formConfig),
  }
}

const markFlowSaved = () => {
  const label = new Date().toLocaleString('zh-CN')
  localStorage.setItem(saveStorageKey.value, label)
  lastSaveLabel.value = label
  lastSavedSnapshot.value = JSON.parse(JSON.stringify(nodeConfig.value))
  hasSavedInSession.value = true
}

const pluginParameterKey = (item: PluginParameterItem, index: number) =>
  item.key || item.name || `param_${index}`

const buildPluginMappings = (
  parameters: PluginParameterItem[] = [],
  mappings: Record<string, string> = {},
) => parameters.map((item, index) => {
  const name = pluginParameterKey(item, index)
  return {
    name,
    type: item.type || 'string',
    map: mappings[name] || '',
    required: item.required,
  }
})

const collectPluginNodePayloads = (node: any, appId: string, result: PluginNodeConfigPayload[] = []) => {
  if (!node || typeof node !== 'object') return result
  if (node.type === 'PLUGIN' && node.pluginId && node.extensionCode) {
    result.push({
      appId,
      nodeId: String(node.id || node.nodeId || ''),
      pluginId: String(node.pluginId),
      extensionCode: String(node.extensionCode),
      failureAction: node.failureAction || 'block',
      inputParams: node.inputMappingEnabled === false
        ? []
        : buildPluginMappings(node.inputParams, node.inputMappings),
      outputParams: node.outputMappingEnabled === false
        ? []
        : buildPluginMappings(node.outputParams, node.outputMappings),
    })
  }
  if (node.childNode?.id) collectPluginNodePayloads(node.childNode, appId, result)
  if (Array.isArray(node.conditionNodes)) {
    node.conditionNodes.forEach((branch: any) => {
      collectPluginNodePayloads(branch, appId, result)
    })
  }
  return result
}

const persistPluginNodeConfigs = async () => {
  const appId = String(route.query.id || '')
  const configuredPluginNodes = collectPluginNodePayloads(nodeConfig.value, appId)
  if (!configuredPluginNodes.length) return
  await Promise.all(configuredPluginNodes.map(savePluginNodeConfig))
}

const collectConnectorNodes = (
  node: any,
  result = new Map<string, { nodeId: string, sceneId: string }>(),
) => {
  if (!node || typeof node !== 'object') return result
  if (
    node.type === 'CONNECTOR'
    && node.id != null
    && node.id !== ''
    && node.sceneId != null
    && node.sceneId !== ''
  ) {
    const nodeId = String(node.id)
    result.set(nodeId, { nodeId, sceneId: String(node.sceneId) })
  }
  if (node.childNode?.id) collectConnectorNodes(node.childNode, result)
  if (Array.isArray(node.conditionNodes)) {
    node.conditionNodes.forEach((branch: any) => collectConnectorNodes(branch, result))
  }
  return result
}

const persistConnectorProcessLinks = async (
  processId: string | number,
  oldProcessId: string | number,
) => {
  const connectorNodes = [...collectConnectorNodes(nodeConfig.value).values()]
  if (!connectorNodes.length) return

  if (processId == null || processId === '') {
    throw new Error('保存流程后未获取到流程 ID，无法关联业务连接节点')
  }

  await Promise.all(connectorNodes.map(({ nodeId, sceneId }) => connectProcess({
    nodeId,
    sceneId,
    processId,
    oldProcessId,
  })))
  formConfs.processId = processId
}

const persistFlowDesign = async () => {
  if (!route.query.id) {
    Message.warning('缺少应用 ID，无法保存')
    return false
  }
  setFlowById(nodeConfig.value, route.query.id)
  saving.value = true
  try {
    const oldProcessId = formConfs.processId ?? -1
    await designApp(buildDesignParams(), route.query.id)
    const latestFormInfo = await getCreatorDes(route.query.id)
    const processId = latestFormInfo?.processId
    await persistConnectorProcessLinks(processId, oldProcessId)
    if (processId != null && processId !== '') {
      formConfs.processId = processId
    }
    await persistPluginNodeConfigs()
    markFlowSaved()
    return true
  } catch (error) {
    console.error(error)
    Message.error('保存失败，请稍后重试')
    return false
  } finally {
    saving.value = false
  }
}

const handleSave = () => {
  if (!route.query.id) {
    Message.warning('缺少应用 ID，无法保存')
    return
  }
  handleModalOk()
  // showSaveModal.value = true
}

const handleModalOk = async () => {
  const ok = await persistFlowDesign()
  if (!ok) return
  showSaveModal.value = false
  Message.success('流程已保存')
  // router.push(getAppReturnRoute(route))
}

const handleModalCancel = async () => {
  const ok = await persistFlowDesign()
  if (!ok) return
  showSaveModal.value = false
  const publishQuery: Record<string, string> = {
    id: route.query.id as string,
    type: route.query.type as string,
  }
  if (route.query.from) {
    publishQuery.from = route.query.from as string
  }
  router.push({ path: '/publishApp', query: publishQuery })
}

const applyNodeConfig = (config: any) => {
  nodeConfig.value = JSON.parse(JSON.stringify(config))
  setFlowById(nodeConfig.value, route.query.id)
  activeFlew.value = { id: '' }
}

const handleRedo = () => {
  if (!hasSavedInSession.value && !initialHadFlowData) {
    Message.info('请先保存流程后再重做')
    return
  }
  Modal.confirm({
    title: '确认重做',
    titleAlign: 'start',
    content: '确定要恢复至上次保存的状态吗？重做后当前未保存的流程调整将被移除。',
    okText: '确定重做',
    cancelText: '取消',
    onOk: () => {
      applyNodeConfig(lastSavedSnapshot.value)
      Message.success('重做成功')
    },
  })
}



const on = () => {

  setFlowById(nodeConfig.value, route.query.id)

  const formQuery: Record<string, string> = {

    id: route.query.id as string,

    type: route.query.type as string,

  }

  if (route.query.from) {

    formQuery.from = route.query.from as string

  }

  router.push({ path: '/form', query: formQuery })

}



const getData = async () => {

  const [res, res1, res3, res4] = await Promise.all([getDeptTree(), getRoleList(), getPostList(), processHistory(route.query.id)]);

  roleList.value = res1

  deptList.value = res

  postList.value = res3

  pannelList.value = res4

}



getData()



const setData = (val: any) => {

  nowNode.value.rules = val.logicConditions

  nowNode.value.option = val.mode == 'all' ? 1 : 2;

}



const up = async () => {
  const ok = await persistFlowDesign()
  if (!ok) return
  const publishQuery: Record<string, string> = {
    id: route.query.id as string,
    type: route.query.type as string,
  }
  if (route.query.from) {
    publishQuery.from = route.query.from as string
  }
  router.push({ path: '/publishApp', query: publishQuery })
}



const setProcess = (item: any) => {

  nodeConfig.value = item

}



const handleClick = (val: any) => {

  if (Date.now() < suppressNodeClickUntil) {

    return

  }

  if (val.type == 'BRANCH') {

    activeFlew.value = { id: '' }

    nowNode.value = val

    setBranchRef.value.showItem(val)

  } else {

    if (val && val.id == activeFlew?.value.id) {

      return

    }

    // 直接切换节点，保持右侧面板持续挂载，避免先清空再延迟赋值
    // 导致面板卸载/重建和画布宽度重复计算产生闪烁。
    activeFlew.value = val || { id: '' }

  }

}



const filterData = () => { }



provide("provideDesigner", { handleClick, setProcess, filterData, activeNodeId });

</script>



<style lang="scss" scoped>
@use "@/styles/form-designer.scss";
</style>

<style lang="scss">
@use "@/styles/flow-designer.scss";

.save-confirm-modal {
  .arco-modal-body {
    padding: 32px 24px 24px;
  }

  .modal-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;

    .modal-icon {
      margin-bottom: 16px;

      svg {
        filter: drop-shadow(0 4px 8px rgba(var(--primary-6), 0.2));
      }
    }

    .modal-text {
      font-size: 16px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.85);
      line-height: 1.5;
    }
  }

  .modal-footer {
    display: flex;
    justify-content: center;
    gap: 12px;
    padding-top: 8px;

    .btn-next,
    .btn-save {
      padding: 10px 28px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
    }

    .btn-next {
      background: #f5f5f5;
      border: 1px solid #e8e8e8;
      color: rgba(0, 0, 0, 0.65);

      &:hover {
        background: rgb(var(--primary-1));
        border-color: rgb(var(--primary-3));
        color: rgb(var(--primary-6));
      }
    }

    .btn-save {
      background: linear-gradient(135deg, rgb(var(--primary-6)) 0%, rgb(var(--primary-5)) 100%);
      border: none;
    }
  }
}

.save-confirm-modal.arco-modal-mask {
  backdrop-filter: blur(4px);
}
</style>

<style>
@import "../../styles/workflow.css";
</style>
