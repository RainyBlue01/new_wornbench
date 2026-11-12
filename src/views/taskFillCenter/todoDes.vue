<template>
    <a-drawer :visible="showDrawer" @cancel="closeDrawer" body-style="padding:0 !important;" :render-to-body="false"
        @close="closeDrawer" :header="false" :width="800" :footer="false">
        <div class="todo-des-content">
            <a-tabs default-active-key="1">
                <a-tab-pane key="1" title="节点信息">
                    <div class="right-body-box">
                        <timeLine :commentList="commentList" />
                    </div>

                </a-tab-pane>
                <a-tab-pane key="2" title="流程图">
                    <div class="tabPane">
                        <FlowChart
                            :formList="formConfs.formList"
                            :activeNodeIds="activeNodeIds"
                            v-model:nodeConfig="nodeConfig"
                            v-model:flowPermission="flowPermission"
                            canvas-height="calc(100vh - 120px)"
                        />
                    </div>
                </a-tab-pane>
                <a-tab-pane key="3" title="待办人员" v-if="candidateList.length > 0">
                    <div class="executor-panel">
                        <a-table :columns="columns" :data="candidateList" :scroll="{ y: 'calc(100vh - 84px)' }"
                            :pagination="false">
                        </a-table>
                    </div>
                </a-tab-pane>
            </a-tabs>
        </div>
    </a-drawer>

</template>

<script setup lang="ts">
import { ref, h } from "vue";
import FlowChart from '@/components/timeLine/FlowChart.vue';
import { processInstanceIdLog, getProcessId, processCandidates } from '@/api/workbench/index'
import { bgColorsFlow } from '@/data/const'

const showDrawer = ref(false)
const nodeConfig = ref<any>({})
const activeNodeIds = ref<string[]>([])
const flowPermission = ref([])
const formConfs = ref<any>({})
const commentList = ref<any[]>([])
const candidateList = ref<any[]>([])
const activeTask = ref<any>({})
const flowInfo = ref<any>({})
const columns = ref<any[]>([
    {
        title: '姓名',
        dataIndex: 'nickname',
    },
    {
        title: '部门',
        dataIndex: 'department',
        render: ({ record }) => {
            let paths = record.primaryDeptList
            const attaches = Array.isArray(paths) ? paths : []
            return h(
                'div',
                attaches.map(
                    (item: any, index: any) => {
                        return h(
                            'div',
                            {
                                style: 'display:inline-block'
                            },
                            (item.deptName ? (index == 0 ? '' : ',') + item.deptName : '无名称')
                        )
                    }
                )
            )

        }
    },
    {
        title: '电话号码',
        width: 130,
        dataIndex: 'phone',
    },
])

const openDrawer = (args: any) => {
    activeTask.value = args.activeTask
    showDrawer.value = true
    console.log(args)
    // 设置流程信息
    flowInfo.value = {
        processFinish: args.activeTask?.processFinish || false
    }

    // 设置表单配置
    if (args.formConfs) {
        formConfs.value = args.formConfs
    }

    // 处理节点配置


    // 如果有完整的流程配置，构建节点树
    if (args.processConfig) {
        buildFlowChart(args.processConfig)
    }

    getNodeData()
    getCandidateData(args.activeTask?.processInstanceId)
}

const closeDrawer = () => {
    showDrawer.value = false
}


// 构建流程图
const buildFlowChart = (processConfig: any) => {
    console.log('buildFlowChart: 开始构建流程图', processConfig)

    const flows = processConfig.sequenceFlows || []
    const nodes = processConfig.nodes || []

    // 查找START节点
    const startNodeFromAll = nodes.find((node: any) => node.type === 'START' || node.type === 1)
    const startId = startNodeFromAll?.id

    if (!startId) {
        console.error('未找到START节点')
        return
    }

    // 建图：source -> targets
    const childrenBySource = new Map<string, string[]>()
    flows.forEach((f: any) => {
        if (!f?.sourceRef || !f?.targetRef) return
        const arr = childrenBySource.get(f.sourceRef) || []
        arr.push(f.targetRef)
        childrenBySource.set(f.sourceRef, arr)
    })

    // 获取活跃节点IDs（新格式：[{ activityId, executeStatus }...]）
    getProcessId(activeTask.value.processInstanceId).then(res => {
        console.log('活跃节点IDs:', res)

        const apiList: any[] = Array.isArray(res) ? res : []
        const apiActiveIds: string[] = apiList.map((x: any) => x?.activityId).filter(Boolean)
        const statusById = new Map<string, number>()
        apiList.forEach((x: any) => {
            if (x?.activityId) statusById.set(String(x.activityId), Number(x.executeStatus))
        })

        const orderedNodeIds: string[] = []
        const visibleSet = new Set<string>()
        const edgeKey = (s: string, t: string) => `${s}-->${t}`
        const edgeSet = new Set<string>()

        const pushNode = (id: string) => {
            if (!id) return
            if (!visibleSet.has(id)) orderedNodeIds.push(id)
            visibleSet.add(id)
        }

        // BFS 找路径（最短路径）
        const findPath = (fromId: string, toId: string): string[] | null => {
            if (!fromId || !toId) return null
            if (fromId === toId) return [fromId]
            const q: string[] = [fromId]
            const prev = new Map<string, string | null>()
            prev.set(fromId, null)
            while (q.length) {
                const cur = q.shift() as string
                const nexts = childrenBySource.get(cur) || []
                for (const nxt of nexts) {
                    if (!nxt || prev.has(nxt)) continue
                    prev.set(nxt, cur)
                    if (nxt === toId) {
                        const path: string[] = []
                        let p: string | null = nxt
                        while (p) {
                            path.push(p)
                            p = prev.get(p) || null
                        }
                        path.push(fromId)
                        path.reverse()
                        return path
                    }
                    q.push(nxt)
                }
            }
            return null
        }

        // 1) 第一个节点必须为 START
        if (startId) pushNode(startId)

        // 2) 后续按接口顺序补全路径
        const targetsInOrder = apiActiveIds.filter((id) => id && id !== startId)
        let cursorId = startId
        targetsInOrder.forEach((targetId) => {
            if (!cursorId) {
                pushNode(targetId)
                cursorId = targetId
                return
            }
            const path = findPath(cursorId, targetId)
            if (path && path.length >= 2) {
                for (let i = 1; i < path.length; i++) {
                    const from = path[i - 1]
                    const to = path[i]
                    pushNode(to)
                    edgeSet.add(edgeKey(from, to))
                }
            } else {
                pushNode(targetId)
            }
            cursorId = targetId
        })

        // 3) 再从最后一个节点补全到 END（保证流程能完整回显）
        const endNodeFromAll = nodes.find((node: any) => node.type === 'END' || node.type === 0)
        const endId = endNodeFromAll?.id
        if (cursorId && endId && cursorId !== endId) {
            const pathToEnd = findPath(cursorId, endId)
            if (pathToEnd && pathToEnd.length >= 2) {
                for (let i = 1; i < pathToEnd.length; i++) {
                    const from = pathToEnd[i - 1]
                    const to = pathToEnd[i]
                    pushNode(to)
                    edgeSet.add(edgeKey(from, to))
                }
            } else {
                pushNode(endId)
            }
        } else if (endId) {
            pushNode(endId)
        }

        activeNodeIds.value = orderedNodeIds
        console.log('activeNodeIds:', activeNodeIds.value)

        // 筛选可见的flows
        const visibleFlows = flows.filter((f: any) => {
            if (!f?.sourceRef || !f?.targetRef) return false
            if (!visibleSet.has(f.sourceRef) || !visibleSet.has(f.targetRef)) return false
            if (edgeSet.size === 0) return true
            return edgeSet.has(edgeKey(f.sourceRef, f.targetRef))
        })

        // 根据筛选后的 sequenceFlows 构建节点关联关系
        nodes.forEach((node: any) => {
            const flow = visibleFlows.find((f: any) => f.targetRef === node.id);
            if (flow) {
                node.pid = flow.sourceRef;
            }
        });

        // 构建树
        const allNodesForTree = nodes.filter((n: any) => n?.id && visibleSet.has(n.id));

        // 重新设置nodeConfig为START节点
        const startNode = allNodesForTree.find((node: any) => node.type === 'START' || node.type === 1);
        if (startNode) {
            nodeConfig.value = JSON.parse(JSON.stringify(startNode));
            buildNodeTree(nodeConfig.value, allNodesForTree, visibleFlows);

            // 标记节点状态：1已执行、2执行中、3未执行（START 强制已执行）
            const setNodeState = (cfg: any) => {
                if (!cfg || !cfg.id) return
                const s = statusById.get(cfg.id)
                if (cfg.type === 'START' || cfg.type === 1) {
                    cfg.state = 1
                } else if (typeof s === 'number' && (s === 1 || s === 2)) {
                    cfg.state = s
                } else {
                    cfg.state = 3
                }
                if (cfg.type === 7 || cfg.type === '7' || cfg.type === 'BRANCH') {
                    if (Array.isArray(cfg.conditionNodes)) {
                        cfg.conditionNodes.forEach((c: any) => {
                            setNodeState(c)
                            if (c?.childNode) setNodeState(c.childNode)
                        })
                    }
                }
                if (cfg.childNode) setNodeState(cfg.childNode)
            }
            setNodeState(nodeConfig.value)
        }
    }).catch(err => {
        console.error('getProcessId调用失败:', err)
    })
}

// 根据sequenceFlows构建节点树
function buildNodeTree(currentNode: any, allNodes: any[], sequenceFlows: any[]) {
    console.log('buildNodeTree: 开始构建节点', currentNode.id, currentNode.type, 'name:', currentNode.name)

    // 查找当前节点的输出连接线
    const outgoingFlows = sequenceFlows.filter(flow => flow.sourceRef === currentNode.id);
    console.log('buildNodeTree: 节点', currentNode.id, '的输出连接数:', outgoingFlows.length, outgoingFlows)

    if (outgoingFlows.length === 0) {
        // 没有输出连接，说明是结束节点
        console.log('buildNodeTree: 节点', currentNode.id, '没有输出连接，结束')
        return;
    }

    if (outgoingFlows.length === 1) {
        // 只有一个输出，设置childNode
        const nextNode = allNodes.find(node => node.id === outgoingFlows[0].targetRef);
        console.log('buildNodeTree: 单个输出，下一个节点:', nextNode?.id, nextNode?.name)
        if (nextNode) {
            // 深拷贝并添加childNode
            currentNode.childNode = JSON.parse(JSON.stringify(nextNode));
            buildNodeTree(currentNode.childNode, allNodes, sequenceFlows);
        }
    } else {
        // 多个输出，说明是分支节点
        const isBranchType = currentNode.type === 'BRANCH' || currentNode.type === 7 || currentNode.type === '7';
        console.log('buildNodeTree: 多个输出，当前节点类型:', currentNode.type, 'isBranchType:', isBranchType)

        if (isBranchType) {
            // 如果是条件分支，需要设置conditionNodes
            if (!currentNode.conditionNodes) {
                currentNode.conditionNodes = [];
            }

            outgoingFlows.forEach((flow, index) => {
                const nextNode = allNodes.find(node => node.id === flow.targetRef);
                console.log(`buildNodeTree: 分支输出[${index}]，下一个节点:`, nextNode?.id, nextNode?.name)
                if (nextNode) {
                    // 深拷贝下一个节点作为条件节点
                    const conditionNode = JSON.parse(JSON.stringify(nextNode));
                    // 确保条件节点的类型标记为7或BRANCH
                    if (conditionNode.type === 'BRANCH') {
                        conditionNode.type = 7;
                    }
                    currentNode.conditionNodes.push(conditionNode);
                    buildNodeTree(conditionNode, allNodes, sequenceFlows);
                }
            });
        } else {
            // 不是分支节点但有多个输出，设置为普通childNode（第一个）
            const nextNode = allNodes.find(node => node.id === outgoingFlows[0].targetRef);
            console.log('buildNodeTree: 非BRANCH节点多个输出，取第一个:', nextNode?.id, nextNode?.name)
            if (nextNode) {
                currentNode.childNode = JSON.parse(JSON.stringify(nextNode));
                buildNodeTree(currentNode.childNode, allNodes, sequenceFlows);
            }
        }
    }
}

// 设置节点状态
function setFlowDatas(nodeConfig: any, id: any, val: any) {
    if (nodeConfig.type !== 7) {
        if (nodeConfig.id == id) {
            nodeConfig.state = val ? 1 : 3
        }
        if (nodeConfig.type == 'END' && !val) {
            nodeConfig.state = 1
        }
        if (nodeConfig.type == 'START') {
            nodeConfig.state = 1
        }

        if (nodeConfig.childNode && nodeConfig.childNode.id) {
            setFlowDatas(nodeConfig.childNode, id, val)
        }
    } else {
        if (nodeConfig.conditionNodes) {
            nodeConfig.conditionNodes.map((v1: any) => {
                if (nodeConfig.id == id) {
                    nodeConfig.state = val ? 1 : 3
                }

                if (v1.childNode && v1.childNode.id) {
                    setFlowDatas(v1.childNode, id, val)
                }
            })
        }
        if (nodeConfig.childNode && nodeConfig.childNode.id) {
            setFlowDatas(nodeConfig.childNode, id, val)
        }
    }
}

// 获取流程节点执行候选人
const getCandidateData = (processInstanceId: any) => {
    if (!processInstanceId) {
        candidateList.value = []
        return
    }
    processCandidates(processInstanceId).then(res => {
        console.log(res)
        candidateList.value = res
    }).catch(() => {
        candidateList.value = []
    })
}

const getNodeData = () => {
    if (!activeTask.value?.processInstanceId) {
        return
    }
    processInstanceIdLog(activeTask.value.processInstanceId).then(res => {
        res.comments.map(v => {
            if (v.dataType === 'multi') {
                if (v.comments && v.comments.length > 0 && v.comments[0].comment) {
                    try {
                        v.comment = JSON.parse(v.comments[0].comment)
                    } catch (e) {
                        console.error('解析多任务评论失败:', e, v.comments[0].comment)
                        v.comment = {}
                    }
                } else {
                    v.comment = {}
                }

                v.comment.title = v.title
            } else {
                if (v.comment) {
                    try {
                        v.comment = JSON.parse(v.comment)
                    } catch (e) {
                        console.error('解析评论失败:', e, v.comment)
                        v.comment = {}
                    }
                } else {
                    v.comment = {}
                }
            }
        })
        commentList.value = res.comments
    })
}

defineExpose({
    openDrawer
})
</script>


<style>
/* 全局样式覆盖，确保抽屉主体无内边距 */
.todo-des-drawer .arco-drawer-body {
    padding: 0 !important;
}
</style>

<style scoped lang="scss">
.tabPane {
    position: relative;
    padding: 0;
    height: calc(100vh - 75px);
}

.box {
    display: flex;
    position: absolute;
    z-index: 10;
    left: 10px;
    top: 10px;

    .box-item {
        border-radius: 6px;
        border: 1px solid;
        padding: 3px 7px;
    }

    .box-item+.box-item {
        margin-left: 14px;

    }
}
</style>
<style scoped>
.right-body-box {
    height: calc(100vh - 100px);
    overflow-y: auto;
    padding: 0 20px 20px;
    /* 添加内边距 */
}
</style>
