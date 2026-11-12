<script setup lang="ts">
import { computed, onMounted, provide, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import { IconArrowRight, IconDelete, IconEdit, IconPlus } from '@arco-design/web-vue/es/icon'
import HomeBanner from '@/components/banner/homeBanner.vue'
import emptyBox from '@/components/emptyBox/emptyBox.vue'
import selectRadioModel from '@/components/selectPerson/components/selectRadioModel.vue'
import FlowChart from '@/components/timeLine/FlowChart.vue'
import ApprovalHeader from '@/views/doCenterDes/components/ApprovalHeader.vue'
import { useChangeRecords } from '@/composables/useChangeRecords'
import { getDeptTree } from '@/api/common/index'
import { applyWorkbench, getProcessId, processCandidates, processInstanceIdLog } from '@/api/workbench/index'
import {
    approveAssign,
    approveBack,
    approvePass,
    approveRefuse,
    input,
    inputAssign,
    stopProcessCenter,
    urgent,
} from '@/api/processCenter/index'
import {
    getProps,
    setExpressionValue,
    setForm,
    setFormById,
    setProps,
    setRules,
    setUpDateData,
} from '@/utils/form'

const route = useRoute()
const router = useRouter()

const deptLists = ref<any[]>([])
const form = ref<Record<string, any>>({})
const rules = ref<Record<string, any>>({})
const nodeConfig = ref<any>({})
const activeNodeIds = ref<string[]>([])
const flowPermission = ref()
const commentList = ref<any[]>([])
const candidateList = ref<any[]>([])
const refChangeForm = ref()
const selectRadioModelRef = ref()
const formConfs = ref<any>({ titleStyle: 'vertical', formList: [] })
const flowInfo = ref<any>({})
const record = ref<any>({})
const activeLeftTab = ref('ongoing')
const currentTab = ref<'form' | 'record' | 'flow' | 'changes'>('form')
const activeRecord = ref<any>({})

const queryValue = (value: any) => Array.isArray(value) ? value[0] : value

const {
    changeRecords,
    changePagination,
    fetchChangeRecords: getChangeRecords,
    getChangeIconClass,
    getChangeDescription,
} = useChangeRecords()

const flowTitle = computed(() =>
    String(queryValue(route.query.appName) || flowInfo.value.flowTitle || flowInfo.value.nodeName || '流程处理'),
)

const currentNodeName = computed(() => {
    const runtime = record.value?.currentRuntimes?.[0]
    return runtime?.executionName ? `当前节点：${runtime.executionName}` : '当前节点：--'
})

const flowStatusInfo = computed(() => {
    const finishState = String(queryValue(route.query.finishState) || '')

    if (flowInfo.value?.processFinish && finishState === '2') {
        return {
            text: '流程失败',
            tip: '流程已终止，可重新发起',
            failed: true,
        }
    }

    if (flowInfo.value?.processFinish || activeLeftTab.value !== 'ongoing') {
        return {
            text: '流程已结束',
            tip: currentNodeName.value,
            failed: false,
        }
    }

    return {
        text: '审批中',
        tip: '流程进行中，可执行以下操作',
        failed: false,
    }
})

const createRecordFromRoute = () => {
    const processInstanceId = queryValue(route.query.processInstanceId) || queryValue(route.query.id)
    const nodeType = String(queryValue(route.query.nodeType) || queryValue(route.query.taskType) || '').toUpperCase()
    const executionId = queryValue(route.query.executionId)
    const executionName = queryValue(route.query.executionName)

    return {
        processInstanceId,
        currentRuntimes: [
            {
                executionId,
                executionName,
                nodeType,
            },
        ],
    }
}

const loadDept = async () => {
    deptLists.value = await getDeptTree()
}

const loadDetail = async (data = createRecordFromRoute(), activeTab = queryValue(route.query.activeLeftTab) || 'ongoing') => {
    record.value = data
    activeLeftTab.value = activeTab

    if (!data?.processInstanceId) {
        Message.error('缺少流程实例参数')
        return
    }

    const res = await applyWorkbench(data.processInstanceId)
    formConfs.value = res.formConfig ? JSON.parse(res.formConfig) : { id: '', formList: [] }
    formConfs.value.category = 2

    const processConfig = res.processConfig ? JSON.parse(res.processConfig) : { sequenceFlows: [], nodes: [] }
    const nodes = processConfig.nodes || []
    const flows = processConfig.sequenceFlows || []
    const startNode = nodes.find((node: any) => node.type === 'START' || node.type === 1)

    if (startNode) {
        nodeConfig.value = JSON.parse(JSON.stringify(startNode))
    }

    rebuildFlow(processConfig)

    setForm(formConfs.value.formList || [])
    if (Array.isArray(formConfs.value.formList)) {
        setRules(formConfs.value.formList, rules.value)
    }

    flowInfo.value = {
        ...res.nodeConfig,
        dataId: res.dataId,
        formId: res.formId,
        classify: 'pending',
        processFinish: res.processFinish,
        flowTitle: res.flowTitle || res.appName || queryValue(route.query.appName) || res.nodeConfig?.flowTitle,
        nodeName: res.nodeConfig?.nodeName || data.currentRuntimes?.[0]?.executionName,
        applyUser: res.applyUser || res.createUser || res.user || {},
    }

    changePagination.formId = res.formId
    changePagination.dataId = res.dataId
    changePagination.appId = res.appId
    getChangeRecords()

    setFormById(formConfs.value, data.processInstanceId)
    setUpDateData(res.formData, formConfs.value.formList || [], form.value, true, res.formId)
    getNodeData(data.processInstanceId)
    getCandidateData(data.processInstanceId)

    if (!nodeConfig.value?.id && nodes.length > 0) {
        nodeConfig.value = JSON.parse(JSON.stringify(nodes[0]))
        buildNodeTree(nodeConfig.value, nodes, flows)
    }
}

const rebuildFlow = async (processConfig: any) => {
    try {
        const res = await getProcessId(record.value.processInstanceId)
        const apiList: any[] = Array.isArray(res) ? res : []
        const apiActiveIds = apiList.map((item: any) => item?.activityId).filter(Boolean)
        const statusById = new Map<string, number>()
        apiList.forEach((item: any) => {
            if (item?.activityId) statusById.set(String(item.activityId), Number(item.executeStatus))
        })

        const flows = processConfig.sequenceFlows || []
        const nodes = processConfig.nodes || []
        const startNode = nodes.find((node: any) => node.type === 'START' || node.type === 1)
        const endNode = nodes.find((node: any) => node.type === 'END' || node.type === 0)
        const startId = startNode?.id
        const endId = endNode?.id
        const childrenBySource = new Map<string, string[]>()

        flows.forEach((flow: any) => {
            if (!flow?.sourceRef || !flow?.targetRef) return
            const children = childrenBySource.get(flow.sourceRef) || []
            children.push(flow.targetRef)
            childrenBySource.set(flow.sourceRef, children)
        })

        const orderedNodeIds: string[] = []
        const visibleSet = new Set<string>()
        const edgeKey = (source: string, target: string) => `${source}-->${target}`
        const edgeSet = new Set<string>()
        const pushNode = (id: string) => {
            if (!id) return
            if (!visibleSet.has(id)) orderedNodeIds.push(id)
            visibleSet.add(id)
        }

        const findPath = (fromId: string, toId: string): string[] | null => {
            if (!fromId || !toId) return null
            if (fromId === toId) return [fromId]
            const queue = [fromId]
            const prev = new Map<string, string | null>()
            prev.set(fromId, null)

            while (queue.length) {
                const current = queue.shift() as string
                for (const next of childrenBySource.get(current) || []) {
                    if (!next || prev.has(next)) continue
                    prev.set(next, current)
                    if (next === toId) {
                        const path: string[] = []
                        let pointer: string | null = next
                        while (pointer) {
                            path.push(pointer)
                            pointer = prev.get(pointer) || null
                        }
                        path.reverse()
                        return path
                    }
                    queue.push(next)
                }
            }
            return null
        }

        if (startId) pushNode(startId)
        let cursorId = startId

        apiActiveIds.filter((id: string) => id && id !== startId).forEach((targetId: string) => {
            if (!cursorId) {
                pushNode(targetId)
                cursorId = targetId
                return
            }
            const path = findPath(cursorId, targetId)
            if (path && path.length >= 2) {
                for (let index = 1; index < path.length; index++) {
                    const source = path[index - 1]
                    const target = path[index]
                    pushNode(target)
                    edgeSet.add(edgeKey(source, target))
                }
            } else {
                pushNode(targetId)
            }
            cursorId = targetId
        })

        if (cursorId && endId && cursorId !== endId) {
            const pathToEnd = findPath(cursorId, endId)
            if (pathToEnd && pathToEnd.length >= 2) {
                for (let index = 1; index < pathToEnd.length; index++) {
                    const source = pathToEnd[index - 1]
                    const target = pathToEnd[index]
                    pushNode(target)
                    edgeSet.add(edgeKey(source, target))
                }
            } else {
                pushNode(endId)
            }
        } else if (endId) {
            pushNode(endId)
        }

        activeNodeIds.value = orderedNodeIds
        const visibleFlows = flows.filter((flow: any) => {
            if (!flow?.sourceRef || !flow?.targetRef) return false
            if (!visibleSet.has(flow.sourceRef) || !visibleSet.has(flow.targetRef)) return false
            return edgeSet.size === 0 || edgeSet.has(edgeKey(flow.sourceRef, flow.targetRef))
        })
        const allNodesForTree = nodes.filter((node: any) => node?.id && visibleSet.has(node.id))

        if (!nodeConfig.value?.id && allNodesForTree.length > 0) {
            nodeConfig.value = JSON.parse(JSON.stringify(startNode || allNodesForTree[0]))
        }

        if (nodeConfig.value?.id && allNodesForTree.length > 0) {
            buildNodeTree(nodeConfig.value, allNodesForTree, visibleFlows)
        }

        setNodeState(nodeConfig.value, statusById)
    } catch {
        const startNode = processConfig.nodes?.find((node: any) => node.type === 'START' || node.type === 1)
        if (startNode) {
            nodeConfig.value = JSON.parse(JSON.stringify(startNode))
            buildNodeTree(nodeConfig.value, processConfig.nodes || [], processConfig.sequenceFlows || [])
        }
    }
}

function buildNodeTree(currentNode: any, allNodes: any[], sequenceFlows: any[]) {
    const outgoingFlows = sequenceFlows.filter((flow: any) => flow.sourceRef === currentNode.id)
    if (outgoingFlows.length === 0) return

    if (outgoingFlows.length === 1) {
        const nextNode = allNodes.find((node: any) => node.id === outgoingFlows[0].targetRef)
        if (nextNode) {
            currentNode.childNode = JSON.parse(JSON.stringify(nextNode))
            buildNodeTree(currentNode.childNode, allNodes, sequenceFlows)
        }
        return
    }

    const isBranchType = currentNode.type === 'BRANCH' || currentNode.type === 7 || currentNode.type === '7'
    if (isBranchType) {
        currentNode.conditionNodes = currentNode.conditionNodes || []
        outgoingFlows.forEach((flow: any) => {
            const nextNode = allNodes.find((node: any) => node.id === flow.targetRef)
            if (!nextNode) return
            const conditionNode = JSON.parse(JSON.stringify(nextNode))
            if (conditionNode.type === 'BRANCH') conditionNode.type = 7
            currentNode.conditionNodes.push(conditionNode)
            buildNodeTree(conditionNode, allNodes, sequenceFlows)
        })
        return
    }

    const nextNode = allNodes.find((node: any) => node.id === outgoingFlows[0].targetRef)
    if (nextNode) {
        currentNode.childNode = JSON.parse(JSON.stringify(nextNode))
        buildNodeTree(currentNode.childNode, allNodes, sequenceFlows)
    }
}

const setNodeState = (cfg: any, statusById: Map<string, number>) => {
    if (!cfg?.id) return
    const status = statusById.get(cfg.id)
    if (cfg.type === 'START' || cfg.type === 1) {
        cfg.state = 1
    } else if (typeof status === 'number' && (status === 1 || status === 2)) {
        cfg.state = status
    } else {
        cfg.state = 3
    }

    if (cfg.type === 7 || cfg.type === '7' || cfg.type === 'BRANCH') {
        cfg.conditionNodes?.forEach((condition: any) => {
            setNodeState(condition, statusById)
            if (condition?.childNode) setNodeState(condition.childNode, statusById)
        })
    }
    if (cfg.childNode) setNodeState(cfg.childNode, statusById)
}

const getCandidateData = (processInstanceId: string) => {
    processCandidates(processInstanceId).then((res) => {
        candidateList.value = res || []
    }).catch(() => {
        candidateList.value = []
    })
}

const getNodeData = (processInstanceId: string) => {
    processInstanceIdLog(processInstanceId).then((res) => {
        const comments = Array.isArray(res?.comments) ? res.comments : []
        comments.forEach((item: any) => {
            try {
                if (item.dataType === 'multi') {
                    item.comment = item.comments ? JSON.parse(item.comments[0].comment) : {}
                    item.comment.title = item.title
                } else {
                    item.comment = JSON.parse(item.comment)
                }
            } catch {
                item.comment = {}
            }
        })
        commentList.value = comments
    })
}

const actionParams = () => ({
    instanceId: record.value.processInstanceId,
    executionId: record.value.currentRuntimes?.[0]?.executionId,
})

const handleWrite = () => {
    Modal.confirm({
        title: '提示',
        simple: true,
        renderToBody: false,
        titleAlign: 'start',
        content: '确定要填写吗？',
        okText: '确认',
        onOk: async () => {
            await input(actionParams())
            Message.success('填写成功')
            router.go(-1)
        },
    })
}

const handleTransfer = () => {
    activeRecord.value = record.value
    selectRadioModelRef.value?.showItem(record.value)
}

const handleApprove = (val: number) => {
    if (val === 3) {
        handleTransfer()
        return
    }

    const actionMap: Record<number, { content: string; api: (params: any) => Promise<any>; success: string }> = {
        1: { content: '确定要通过该审批吗？', api: approvePass, success: '通过成功' },
        2: { content: '确定要拒绝该审批吗？', api: approveRefuse, success: '拒绝成功' },
        4: { content: '确定要退回该审批吗？', api: approveBack, success: '退回成功' },
    }
    const action = actionMap[val]
    if (!action) {
        Message.error('未知的操作类型')
        return
    }

    Modal.confirm({
        title: '提示',
        simple: true,
        renderToBody: false,
        titleAlign: 'start',
        content: action.content,
        okText: '确认',
        onOk: async () => {
            await action.api(actionParams())
            Message.success(action.success)
            router.go(-1)
        },
    })
}

const handleUrge = () => {
    Modal.confirm({
        title: '提示',
        simple: true,
        renderToBody: false,
        titleAlign: 'start',
        content: '确定要催办流程吗？',
        okText: '确认',
        onOk: async () => {
            await urgent(record.value.processInstanceId)
            Message.success('催办成功')
        },
    })
}

const handleEndProcess = () => {
    Modal.confirm({
        title: '提示',
        simple: true,
        renderToBody: false,
        titleAlign: 'start',
        content: '确定要终止流程吗？',
        okText: '确认',
        onOk: async () => {
            await stopProcessCenter(record.value.processInstanceId)
            Message.success('终止成功')
            router.go(-1)
        },
    })
}

const setData = (val: any) => {
    const runtime = activeRecord.value?.currentRuntimes?.[0] || record.value?.currentRuntimes?.[0]
    const params = {
        instanceId: activeRecord.value?.processInstanceId || record.value.processInstanceId,
        userId: val.id,
        executionId: runtime?.executionId,
        nickname: val.nickname,
    }
    const api = runtime?.nodeType === 'APPROVE' ? approveAssign : inputAssign
    api(params).then(() => {
        Message.success('转交成功')
        router.go(-1)
    })
}

const getPropsItem = (id: string, propsItem: any) => {
    return getProps(id, formConfs.value.formList, propsItem)
}

const getFieldName = (fieldCode: string): string => {
    if (!fieldCode || !Array.isArray(formConfs.value.formList)) {
        return fieldCode || '数据'
    }

    const findField = (list: any[]): string => {
        for (const item of list) {
            if (fieldCode.includes('.')) {
                const [parentId, childId] = fieldCode.split('.')
                if (item.id === parentId) {
                    const childField = (item.children || []).find((child: any) => child.id === fieldCode || child.id === childId)
                    if (childField) {
                        return `${item.title || parentId} - ${childField.title || childId}`
                    }
                }
            } else if (item.id === fieldCode) {
                return item.title || fieldCode
            }

            if (Array.isArray(item.children)) {
                const found = findField(item.children)
                if (found !== fieldCode) return found
            }

            if (Array.isArray(item.list)) {
                for (const row of item.list) {
                    const found = findField(row)
                    if (found !== fieldCode) return found
                }
            }
        }
        return fieldCode
    }

    return findField(formConfs.value.formList)
}

const formatFieldValue = (value: any, fieldCode?: string): string => {
    if (value === null || value === undefined || value === '') {
        return '-'
    }

    if (Array.isArray(value)) {
        return value.map((item) => formatFieldValue(item, fieldCode)).join('、')
    }

    if (typeof value === 'object') {
        const label = value.label || value.name || value.nickname || value.deptName || value.title || value.value
        if (label !== undefined && label !== null && label !== '') {
            return String(label)
        }

        return Object.entries(value)
            .map(([key, itemValue]) => `${getFieldName(fieldCode ? `${fieldCode}.${key}` : key)}: ${formatFieldValue(itemValue, key)}`)
            .join('；')
    }

    return String(value)
}

const setPropsItem = (id: string, propsItem: any, data: any) => {
    setProps(id, formConfs.value.formList, propsItem, data)
}

const filterData = (value: { title: string; type: string; id: string | number; props: { value: any } } | undefined) => {
    if (!value) return
    form.value[value.id] = value.props.value
    setFormById(formConfs.value, record.value.processInstanceId)
    setExpressionValue(formConfs.value.formList, form.value, value, formConfs.value.id, false, true, changePagination.appId)

    if (['USER_MULTIPLE', 'DEPT_MULTIPLE', 'USER', 'DEPT'].includes(value.type)) {
        const id = String(value.id).split('.')
        if (id.length > 1) {
            rules.value[value.id] = value.props.value
                ? []
                : [{ type: 'object', required: true, message: `${value.title}不能为空` }]
            refChangeForm.value?.clearValidate()
        } else {
            refChangeForm.value?.validateField(value.id)
        }
    }
}

const setRulesItem = (data: any) => {
    setRules(data, rules.value)
}

const showItems = (data: any, activeLeftTabs: any) => {
    loadDetail(data, activeLeftTabs)
}

provide('provideDesigner', { setPropsItem, getPropsItem, filterData, setRulesItem })
provide('hideDisabledFieldPrompt', true)

defineExpose({
    showItems,
})

onMounted(() => {
    loadDept()
    loadDetail()
})
</script>

<template>
    <div class="process-detail-page">
        <HomeBanner variant="subpage" breadcrumb-parent="流程中心" :breadcrumb-current="flowTitle" back-label="返回流程中心"
            :back-to="{ name: 'processCenter', query: { menuCode: 'operationsCenter' } }" :show-subpage-hero="false" />

        <div class="process-detail-body">
            <div class="process-detail-content">
                <ApprovalHeader :flowInfo="flowInfo" :commentList="commentList" :candidateList="candidateList" />
                <div class="approval-content single-column">
                    <div class="modern-card">
                        <div class="card-headers">
                            <div class="tab-group">
                                <button class="tab-btn" :class="{ active: currentTab === 'form' }"
                                    @click="currentTab = 'form'">
                                    表单信息
                                </button>
                                <button class="tab-btn" :class="{ active: currentTab === 'record' }"
                                    @click="currentTab = 'record'">
                                    节点信息
                                </button>
                                <button class="tab-btn" :class="{ active: currentTab === 'flow' }"
                                    @click="currentTab = 'flow'">
                                    流程图
                                </button>
                                <button class="tab-btn" :class="{ active: currentTab === 'changes' }"
                                    @click="currentTab = 'changes'">
                                    变更记录({{ changeRecords.length }})
                                </button>
                            </div>
                            <span class="card-title">{{ flowTitle }}</span>
                        </div>

                        <div class="card-body">
                            <a-form v-show="currentTab === 'form'" :model="form" ref="refChangeForm" :rules="rules"
                                :layout="formConfs.titleStyle !== 'hide' ? formConfs.titleStyle : 'vertical'"
                                class="forms" v-bind="formConfs" :scroll-to-first-error="false">
                                <div v-for="(item, index) in formConfs.formList" :key="index">
                                    <showItem :activeForm="{ id: '' }" :deptList="deptLists" :newIndex="index"
                                        :showEdit="false" :list="formConfs.formList" :comDes="item"
                                        :formConfs="formConfs" />
                                </div>
                            </a-form>

                            <div v-show="currentTab === 'record'" class="tab-panel">
                                <timeLine :commentList="commentList" />
                            </div>

                            <div v-show="currentTab === 'flow'" class="tab-panel flow-panel">
                                <FlowChart :formList="formConfs.formList" :activeNodeIds="activeNodeIds"
                                    v-model:nodeConfig="nodeConfig" v-model:flowPermission="flowPermission"
                                    canvas-height="calc(100vh - 300px)" />
                            </div>

                            <div v-show="currentTab === 'changes'" class="tab-panel change-list-wrapper">
                                <div class="change-list">
                                    <div v-if="!changeRecords || changeRecords.length === 0" class="empty-state">
                                        <emptyBox />
                                    </div>
                                    <div v-else class="change-items">
                                        <div v-for="(recordItem, index) in changeRecords" :key="recordItem.id || index"
                                            class="change-item">
                                            <div class="change-item-header">
                                                <div class="change-icon" :class="getChangeIconClass(recordItem)">
                                                    <icon-edit v-if="recordItem.classify == 2" />
                                                    <icon-plus v-else-if="recordItem.classify == 1" />
                                                    <icon-delete v-else />
                                                </div>
                                                <div class="change-info">
                                                    <div class="change-user-time">
                                                        <span class="change-user">{{ recordItem.createUser ||
                                                            recordItem.nickname || '未知用户' }}</span>
                                                        <span class="change-time">{{ recordItem.createTime ||
                                                            recordItem.recordTime || '' }}</span>
                                                    </div>
                                                    <div class="change-desc">
                                                        {{ getChangeDescription(recordItem, getFieldName) }}
                                                    </div>
                                                </div>
                                            </div>

                                            <div v-if="recordItem.compareFields && recordItem.compareFields.length > 0"
                                                class="change-content-list">
                                                <div v-for="(field, idx) in recordItem.compareFields" :key="idx"
                                                    class="change-field-item">
                                                    <div class="change-field-name">
                                                        {{ getFieldName(field.field) }}
                                                    </div>
                                                    <div class="change-field-values">
                                                        <span class="old-value">{{ formatFieldValue(field.oldValue,
                                                            field.field) }}</span>
                                                        <icon-arrow-right class="change-arrow" />
                                                        <span class="new-value">{{ formatFieldValue(field.newValue,
                                                            field.field) }}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div v-else-if="recordItem.oldValue || recordItem.newValue"
                                                class="change-content">
                                                <div class="change-value old-value">
                                                    {{ formatFieldValue(recordItem.oldValue, recordItem.field) }}
                                                </div>
                                                <icon-arrow-right class="change-arrow" />
                                                <div class="change-value new-value">
                                                    {{ formatFieldValue(recordItem.newValue, recordItem.field) }}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="bottom-action-bar">
            <div class="action-bar-content">
                <div class="flow-status-bar">
                    <span class="status-badge" :class="{ failed: flowStatusInfo.failed }">
                        {{ flowStatusInfo.text }}
                    </span>
                    <span class="status-tip">{{ flowStatusInfo.tip }}</span>
                </div>
                <a-space>
                    <a-button class="action-btn success" @click="handleWrite"
                        v-if="Array.isArray(record.currentRuntimes) && record.currentRuntimes[0].nodeType == 'INPUT'">填写</a-button>
                    <a-button class="action-btn ghost" @click="handleTransfer"
                        v-if="Array.isArray(record.currentRuntimes) && record.currentRuntimes[0].nodeType == 'INPUT'">转交</a-button>
                    <a-button class="action-btn success" @click="handleApprove(1)"
                        v-if="Array.isArray(record.currentRuntimes) && record.currentRuntimes[0].nodeType == 'APPROVE'">通过</a-button>
                    <a-button class="action-btn danger" @click="handleApprove(2)"
                        v-if="Array.isArray(record.currentRuntimes) && record.currentRuntimes[0].nodeType == 'APPROVE'">拒绝</a-button>
                    <a-button class="action-btn ghost" @click="handleApprove(3)"
                        v-if="Array.isArray(record.currentRuntimes) && record.currentRuntimes[0].nodeType == 'APPROVE'">转交</a-button>
                    <a-button class="action-btn ghost" @click="handleApprove(4)"
                        v-if="Array.isArray(record.currentRuntimes) && record.currentRuntimes[0].nodeType == 'APPROVE'">退回</a-button>
                    <a-button class="action-btn ghost-with-icon" @click="handleUrge"
                        v-if="activeLeftTab === 'ongoing'">催办</a-button>
                    <a-button class="action-btn ghost" @click="handleEndProcess"
                        v-if="activeLeftTab === 'ongoing'">终止流程</a-button>
                </a-space>
            </div>
        </div>

        <selectRadioModel :deptList="deptLists" :comDes="{ props: {} }" @setData="setData" ref="selectRadioModelRef" />
    </div>
</template>

<style lang="scss" scoped>
.process-detail-page {
    background: #f6f8fb;
    // padding-bottom: 84px;
}

.process-detail-body {
    height: calc(100vh - 160px);
    overflow-y: auto;
    padding: 20px;
}

.process-detail-content {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
}

.process-detail-content :deep(.approval-header) {
    margin-bottom: 16px;
    border-radius: 16px;
    padding: 20px;
}

.approval-content {
    width: 100%;
}

.modern-card {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
    overflow: hidden;
}

.card-headers {
    //height: 56px;
    padding: 20px 20px 16px;
    // border-bottom: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;

    .tab-group {
        display: flex;
        gap: 4px;
        min-width: 0;
    }

    .tab-btn {
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 500;
        color: #64748b;
        cursor: pointer;
        border: none;
        background: transparent;
        white-space: nowrap;
        transition: all 0.2s;

        &:hover {
            color: #334155;
            background: #f8fafc;
        }

        &.active {
            background: #eff6ff;
            color: rgb(var(--primary-6));
        }
    }

    .card-title {
        max-width: 360px;
        font-size: 13px;
        color: #94a3b8;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

.card-body {
    padding: 20px;
    min-height: calc(100vh - 260px);
}

.forms,
.tab-panel {
    min-height: calc(100vh - 260px);
}

.flow-panel {
    position: relative;
    background: #f8fafc;
    border-radius: 8px;
    overflow: auto;
}

.bottom-action-bar {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1000;
    min-height: 32px;
    padding: 16px 24px;
    background: #fff;
    border-top: 1px solid #e2e8f0;
    box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.04);

    .action-bar-content {
        max-width: 1200px;
        min-height: 32px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
    }

    .flow-status-bar {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        min-width: 0;
    }

    .status-badge {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        color: rgb(var(--arcoblue-6));
        background-color: rgb(var(--arcoblue-1));
        white-space: nowrap;

        &.failed {
            background-color: #fef2f2;
            color: #dc2626;
        }
    }

    .status-tip {
        color: #64748b;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .action-btn {
        border-radius: 8px;
        padding: 8px 16px;
        font-weight: 500;
        transition: all 0.2s;

        &:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        &.success {
            background: #16a34a;
            color: #fff;
            border: none;
        }

        &.danger {
            background: #dc2626;
            color: #fff;
            border: none;
        }

        &.warning {
            background: #ea580c;
            color: #fff;
            border: none;
        }

        &.ghost,
        &.ghost-with-icon {
            background: transparent;
            border: 1px solid #e2e8f0;
            color: #64748b;
        }
    }
}

.change-list {
    padding: 16px;

    .empty-state {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 280px;
        padding: 60px 20px;
    }

    .change-items {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .change-item {
        background: #f8fafc;
        border-radius: 12px;
        padding: 16px;
        transition: all 0.3s;

        &:hover {
            background: #f1f5f9;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }
    }

    .change-item-header {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 12px;
    }

    .change-icon {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        flex-shrink: 0;

        &.icon-edit {
            background: #fef3c7;
            color: #f59e0b;
        }

        &.icon-plus {
            background: #dcfce7;
            color: #22c55e;
        }

        &.icon-delete {
            background: #fee2e2;
            color: #ef4444;
        }
    }

    .change-info {
        flex: 1;
        min-width: 0;
    }

    .change-user-time {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
        flex-wrap: wrap;
    }

    .change-user {
        font-size: 14px;
        font-weight: 500;
        color: #1e293b;
    }

    .change-time {
        font-size: 12px;
        color: #94a3b8;
    }

    .change-desc {
        font-size: 13px;
        color: #64748b;
    }

    .change-content {
        display: flex;
        align-items: center;
        gap: 8px;
        padding-left: 44px;
    }

    .change-value {
        padding: 4px 12px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        word-break: break-word;

        &.old-value {
            background: #fee2e2;
            color: #dc2626;
            text-decoration: line-through;
        }

        &.new-value {
            background: #dcfce7;
            color: #16a34a;
        }
    }

    .change-content-list {
        padding-left: 44px;
        margin-top: 8px;
    }

    .change-field-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 8px;
        padding: 8px 12px;
        background: #f8fafc;
        border-radius: 6px;
        transition: all 0.2s;

        &:hover {
            background: #f1f5f9;
        }
    }

    .change-field-name {
        min-width: 100px;
        font-size: 13px;
        font-weight: 500;
        color: #475569;
        flex-shrink: 0;
    }

    .change-field-values {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        flex: 1;
        min-width: 0;

        .old-value,
        .new-value {
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 13px;
            flex: 1;
            word-break: break-word;
            white-space: pre-wrap;
            line-height: 1.6;
        }

        .old-value {
            background: #fee2e2;
            color: #dc2626;
            text-decoration: line-through;
        }

        .new-value {
            background: #dcfce7;
            color: #16a34a;
            font-weight: 500;
        }
    }

    .change-arrow {
        font-size: 14px;
        color: #94a3b8;
        flex-shrink: 0;
        margin-top: 4px;
    }
}

:deep(.card-body) {
    padding-top: 0;

    .box {
        padding: 12px 0;
        border-bottom: 0;
    }

    .flow-chart-wrapper {
        margin: 0;
    }
}

@media (max-width: 1024px) {
    .process-detail-body {
        padding: 16px;
    }

    .card-headers,
    .bottom-action-bar .action-bar-content {
        align-items: flex-start;
        flex-direction: column;
    }

    .card-headers {
        height: auto;
        padding: 12px 16px;
    }

    .bottom-action-bar :deep(.arco-space) {
        flex-wrap: wrap;
    }
}
</style>
