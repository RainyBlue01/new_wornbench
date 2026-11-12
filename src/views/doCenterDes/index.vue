<template>
    <div class="toDoCenterDes">
        <HomeBanner variant="subpage" :breadcrumb-parent="detailBackBreadcrumbParent"
            :breadcrumb-current="flowInfo.flowTitle || '审批办理'" :back-label="detailBackLabel" :back-to="detailBackTo"
            :external-back-url="returnUrl" :show-subpage-hero="false">
            <template #extra-actions>
                <a-space class="navbar-actions">
                    <div v-show="flowInfo.download" class="action-item">
                        <a-dropdown>
                            <a-button class="nav-btn" :loading="downloadLoading">
                                <icon-download class="btn-icon" />
                                导出
                                <icon-down class="dropdown-icon" />
                            </a-button>
                            <template #content>
                                <a-doption @click="downLoad(2)">
                                    <template #icon>
                                        <icon-file-pdf class="option-icon pdf" />
                                    </template>
                                    导出为 PDF
                                </a-doption>
                                <a-doption @click="downLoad(1)">
                                    <template #icon>
                                        <icon-file class="option-icon word" />
                                    </template>
                                    导出为 Word
                                </a-doption>
                            </template>
                        </a-dropdown>
                    </div>
                    <a-button class="nav-btn action-item" @click="downUp" :loading="downloadLoading"
                        v-show="flowInfo.print">
                        <icon-printer class="btn-icon" />
                        打印
                    </a-button>
                    <span class="action-divider" aria-hidden="true"></span>
                </a-space>
            </template>
        </HomeBanner>
        <div class="conten-body" :style="$route.query.classify === 'notice' ? '    height: calc(100vh - 65px);' : ''">
            <ApprovalHeader :flowInfo="flowInfo" :commentList="commentList" :candidateList="candidateList" />

            <!-- 单栏布局 -->
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
                                审批记录
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
                        <span class="card-title">{{ flowInfo.flowTitle || '审批申请' }}</span>
                    </div>

                    <div>
                        <!-- 表单信息 -->
                        <FormViewer ref="formViewerRef" v-show="currentTab === 'form'" :formConfs="formConfs"
                            :form="form" :rules="rules" :deptList="deptList" :data-loading="isDataLoading" />

                        <!-- 变更记录 -->
                        <ChangeRecordsPanel v-show="currentTab === 'changes'" :change-records="changeRecords"
                            :form-confs="formConfs" :user-name-map="userNameMap" :dept-name-map="deptNameMap"
                            :get-change-icon-class="getChangeIconClass" :get-change-description="getChangeDescription" />

                        <!-- 流程图 -->
                        <FlowChart v-show="currentTab === 'flow'" :form-list="formConfs.formList"
                            :active-node-ids="activeNodeIds" v-model:node-config="nodeConfig"
                            v-model:flow-permission="flowPermission"
                            :canvas-height="$route.query.classify === 'notice' ? 'calc(100vh - 328px)' : undefined" />

                        <!-- 审批记录 -->
                        <ApprovalTimeline v-show="currentTab === 'record'" :flowInfo="flowInfo"
                            :commentList="commentList" />
                    </div>
                </div>
            </div>
        </div>
        <!-- 顶部申请人信息条 -->

        <!-- 底部固定操作栏 -->
        <ActionBar v-if="flowInfo.classify !== 'notice' && !taskAlreadyHandled" :flowInfo="flowInfo" :passLoading="passLoading"
            :refuseLoading="refuseLoading" :delegateLoading="delegateLoading" :backLoading="backLoading"
            :submitBtnLoading="submitBtnLoading" :returnLoading="renturnLoading" :urgentLoading="urgentLoading"
            :endFlowLoading="endFlowLoading" @submit-form="submitForm" @submit="submit" @revoke="onRevoke"
            @reapply="() => handleReApply(defaultFormData)" @urgent="handleUrgent" @terminate="onTerminate" />
        <selectRadioModel :comDes="{ props: { rangeType: '' } }" :deptList="deptList" @setData="setData"
            ref="selectRadioModelRef" />
        <commentDialog @approve="pendingData" @cancel="handleDialogCancel" ref="commentDialogRef" />
        <a-modal v-model:visible="templateModalVisible" title="选择模板" width="600px" @ok="handleTemplateConfirm"
            :confirm-loading="downloadLoading">
            <a-radio-group v-model="selectedTemplateId" direction="vertical"
                style="max-height: 400px; overflow-y: auto;">
                <a-radio :value="item.id" v-for="item in templateList" :key="item.id">
                    {{ item.fileName }}
                </a-radio>
            </a-radio-group>
        </a-modal>
        <upDateData ref="upDateDataRef" :deptLists="deptList" />
    </div>
</template>
<script setup lang="ts">
import { useDetailFormRuntime } from "./composables/useDetailFormRuntime"
import { getCurrentNodeName, buildNodeTree } from "./utils/processTree"
import { useDetailExport } from "./composables/useDetailExport"
import ChangeRecordsPanel from "./components/ChangeRecordsPanel.vue"
import commentDialog from './commentDialog.vue';
import selectRadioModel from '@/components/selectPerson/components/selectRadioModel.vue'
import upDateData from '../application/original/upDateData.vue'
import HomeBanner from '@/components/banner/homeBanner.vue'
import { ref, provide, computed } from "vue";
import {
    IconPrinter, IconDownload, IconFile, IconDown, IconFilePdf,
} from '@arco-design/web-vue/es/icon';
import FlowChart from '@/components/timeLine/FlowChart.vue'
import { getDeptTree } from '@/api/common/index'
import { pendingWorkbench, applyWorkbench, handlerWorkbench, noticeWorkbench, processInstanceIdLog, approveBack, approveReject, approvePass, inputComplete, delegate, getProcessId, processCandidates, getFinishStatus } from '@/api/workbench/index'
import {
    approveBack as processCenterApproveBack,
    approveRefuse as processCenterApproveRefuse,
    approvePass as processCenterApprovePass,
    input as processCenterInput,
    approveAssign as processCenterApproveAssign,
    inputAssign as processCenterInputAssign,
} from '@/api/processCenter/index'
import type { Appdes, FormConfs, FlowInfo } from '@/types/form'
import { useRoute, useRouter } from "vue-router";

import { setFormById, setRules, setForm, setUpDateData, submitFormData } from '@/utils/form'
import { applySelectFormOptions } from '@/utils/formSelectOptions'
import { applyFormLinkage } from '@/utils/formLinkage'
import { Message } from '@arco-design/web-vue';
import { isTaskAlreadyHandledError } from '@/utils/taskOperationError'


// 引入子组件
import ApprovalHeader from './components/ApprovalHeader.vue'
import FormViewer from './components/FormViewer.vue'
import ActionBar from './components/ActionBar.vue'
import ApprovalTimeline from './components/ApprovalTimeline.vue'

// 引入 Composables
import { useApprovalFlow } from '@/composables/useApprovalFlow'
import { useChangeRecords } from '@/composables/useChangeRecords'
import { useFormEvents } from '@/composables/useFormEvents'
const route = useRoute()
const router = useRouter()

const isFromProcessCenter = computed(() => route.query.from === 'processCenter')

const getQueryValue = (value: any) => Array.isArray(value) ? value[0] : value
const returnUrl = computed(() => {
    const value = getQueryValue(route.query.returnUrl)
    return typeof value === 'string' && value ? value : undefined
})

const normalizedTaskType = computed(() => String(getQueryValue(route.query.taskType) || '').toLowerCase())

const getProcessCenterActionParams = () => ({
    instanceId: getQueryValue(route.query.processInstanceId) || getQueryValue(route.query.id),
    executionId: getQueryValue(route.query.executionId),
    reason: paramsData.value.reason,
    signature: paramsData.value.signature,
})

const detailBackTo = computed(() => {
    if (isFromProcessCenter.value) {
        return {
            name: 'processCenter',
            query: {
                menuCode: (route.query.menuCode as string) || 'operationsCenter',
            },
        }
    }
    return { name: 'toDoCenter' }
})

const detailBackLabel = computed(() =>
    isFromProcessCenter.value ? '返回流程中心' : '返回工作台',
)

const detailBackBreadcrumbParent = computed(() =>
    isFromProcessCenter.value ? '流程中心' : '工作台',
)

const flowInfo = ref<FlowInfo>({
    type: 3,
    processFinish: true,
    flowTitle: '',
    nodeName: '',
    processStatus: '',
    applyUser: {},
    candidateName: '',
    download: false,
    print: false
})

const appdes = ref<Appdes>({ showPart: false })
const formConfs = ref<FormConfs>({ formList: [] })

// 流程结束状态配置映射
// 使用 Composables
const {
    passLoading, refuseLoading, delegateLoading, backLoading,
    submitBtnLoading, returnLoading: renturnLoading, urgentLoading, endFlowLoading,
    handleRevoke: handleReturn, handleReApply, handleUrgent, handleTerminate: handleEndFlow
} = useApprovalFlow(flowInfo, route, router)

// 适配 ActionBar 零参数事件的包装函数
const onRevoke = (reason: string) => handleReturn(getData, reason)
const onTerminate = () => handleEndFlow(getData)

const {
    changeRecords, changePagination, userNameMap, deptNameMap,
    fetchChangeRecords: getChangeRecords,
    getChangeIconClass, getChangeDescription
} = useChangeRecords()






const loading = ref(false)
const flowPermission = ref([])
const form = ref({})
const rules = ref({})
const isDataLoading = ref(false)
const { executeFormEvents } = useFormEvents(form, formConfs, { isDataLoading, rules })
const nodeConfig = ref({})
const activeNodeIds = ref<string[]>([])
const fullProcessConfig = ref<any>(null) // 保存完整流程配置
const commentList = ref([])
const candidateList = ref<any[]>([])
const commentDialogRef = ref()
const selectRadioModelRef = ref()

// 当前选中的 Tab 状态
const currentTab = ref<'form' | 'changes' | 'flow' | 'record'>('form')


const formViewerRef = ref()
const fieldControl = ref([])
const deptList = ref([])
const paramsData = ref({ reason: '', signature: '' })
const taskAlreadyHandled = ref(false)

const showHandledTaskDetail = async (error: unknown, loadingState: { value: boolean }) => {
    loadingState.value = false
    if (!isTaskAlreadyHandledError(error)) return

    taskAlreadyHandled.value = true
    try {
        const res = await handlerWorkbench(route.query.taskId)
        await setFormItem(res)
        flowInfo.value.classify = 'handler'
        filterData(undefined)
        getNodeData()
    } catch {
        // 请求层已展示错误提示；操作栏保持隐藏，避免重复处理同一任务。
    }
}
const getDept = () => {
    getDeptTree().then(res => {
        const tabId =
            route.query.classify == 'pending'
                ? '0'
                : route.query.classify == 'apply'
                    ? '1'
                    : route.query.classify == 'handler'
                        ? '2'
                        : '3'
        localStorage.setItem('activeTab', tabId)

        deptList.value = res
    })
}
getDept()
const submitForm = async (val: any) => {
    // 检查是否有其他操作正在进行
    if (passLoading.value || refuseLoading.value || delegateLoading.value || backLoading.value ||
        submitBtnLoading.value || renturnLoading.value || urgentLoading.value || endFlowLoading.value || downloadLoading.value) {
        Message.warning('正在进行其他操作，请稍后再试')
        return
    }
    if (val == 1) {
        try {
            await executeFormEvents('submit')
        } catch (eventError) {
            // Message.error(`表单事件执行失败：${eventError instanceof Error ? eventError.message : String(eventError)}`)
            return
        }
    }
    formViewerRef.value?.refChangeForm?.validate((error: any) => {
        if (!error) {
            let params = {
                taskId: route.query.taskId,
                processInstanceId: route.query.id,
                formData: form.value,
            }
            submitFormData(params, formConfs.value.formList)
            paramsData.value = params as any

            // 根据操作类型设置对应的loading
            if (val == 1) {
                passLoading.value = true
            } else if (val == 2) {
                refuseLoading.value = true
            } else if (val == 3) {
                delegateLoading.value = true
            } else if (val == 4) {
                backLoading.value = true
            }

            if ((val == 1 && flowInfo.value.pass && flowInfo.value.pass.config && (flowInfo.value.pass.comment || flowInfo.value.pass.signature)) || (val == 2 && flowInfo.value.refuse && flowInfo.value.refuse.config && (flowInfo.value.refuse.comment || flowInfo.value.refuse.signature)) || (val == 3 && flowInfo.value.delegate && flowInfo.value.delegate.config && (flowInfo.value.delegate.comment || flowInfo.value.delegate.signature)) || (val == 4 && flowInfo.value.back && flowInfo.value.back.config && (flowInfo.value.back.comment || flowInfo.value.back.signature))) {
                commentDialogRef.value.showItem(val, flowInfo.value.pass)
            } else {
                pendingData(val, { signature: '', reason: '' })
            }


        } else {
            if (val == 1) {
                passLoading.value = false
            } else if (val == 2) {
                refuseLoading.value = false
            } else if (val == 3) {
                delegateLoading.value = false
            } else if (val == 4) {
                backLoading.value = false
            }
        }
    });
    // refChangeForm.value.validate().then(() => {


    // })
}
const pendingData = (val: any, data: any) => {
    paramsData.value.signature = data.signatureImage
    paramsData.value.reason = data.approvalOpinion
    if (isFromProcessCenter.value) {
        const actionParams = getProcessCenterActionParams()

        if (!actionParams.instanceId || !actionParams.executionId) {
            Message.error('缺少流程处理参数')
            passLoading.value = false
            refuseLoading.value = false
            backLoading.value = false
            return
        }

        if (val == 1 && normalizedTaskType.value == 'approve') {
            processCenterApprovePass(actionParams).then(() => {
                Message.success('通过成功')
                router.go(-1)
            }).catch(() => {
                passLoading.value = false
            })
        } else if (val == 1 && (normalizedTaskType.value == 'input' || normalizedTaskType.value == 'start')) {
            processCenterInput(actionParams).then(() => {
                Message.success('通过成功')
                router.go(-1)
            }).catch(() => {
                passLoading.value = false
            })
        } else if (val == 2) {
            processCenterApproveRefuse(actionParams).then(() => {
                Message.success('拒绝成功')
                router.go(-1)
            }).catch(() => {
                refuseLoading.value = false
            })
        } else if (val == 3) {
            delegateLoading.value = false
            selectRadioModelRef.value.showItem([])
        } else if (val == 4) {
            processCenterApproveBack(actionParams).then(() => {
                Message.success('退回成功')
                router.go(-1)
            }).catch(() => {
                backLoading.value = false
            })
        } else {
            passLoading.value = false
            Message.error('未知的流程操作类型')
        }
        return
    }
    if (val == 1 && normalizedTaskType.value == 'approve') {
        approvePass(paramsData.value).then(() => {
            Message.success('通过成功')
            router.go(-1)
        }).catch(error => void showHandledTaskDetail(error, passLoading))
    } else if (val == 1 && (normalizedTaskType.value == 'input' || normalizedTaskType.value == 'start')) {
        inputComplete(paramsData.value).then(() => {
            Message.success('通过成功')
            router.go(-1)
        }).catch(error => void showHandledTaskDetail(error, passLoading))
    } else if (val == 2) {
        approveReject(paramsData.value).then(() => {
            Message.success('拒绝成功')
            router.go(-1)
        }).catch(error => void showHandledTaskDetail(error, refuseLoading))
    } else if (val == 3) {
        delegateLoading.value = false
        selectRadioModelRef.value.showItem([])
    } else if (val == 4) {
        approveBack(paramsData.value).then(() => {
            Message.success('退回成功')
            router.go(-1)
        }).catch(() => {
            backLoading.value = false
        })
    }

}

// 关闭弹窗时重置所有 loading 状态
const handleDialogCancel = () => {
    passLoading.value = false
    refuseLoading.value = false
    delegateLoading.value = false
    backLoading.value = false
}

const setData = (val) => {
    if (isFromProcessCenter.value) {
        const params = {
            ...getProcessCenterActionParams(),
            userId: val.id,
            nickname: val.nickname,
        }
        const api = normalizedTaskType.value == 'approve'
            ? processCenterApproveAssign
            : processCenterInputAssign

        api(params).then(() => {
            Message.success('转交成功')
            delegateLoading.value = false
            router.go(-1)
        }).catch(() => {
            delegateLoading.value = false
        })
        return
    }

    let params = {
        taskId: route.query.taskId,
        userId: val.id,
        nickname: val.nickname,
    }
    delegate(params).then(() => {
        Message.success('转交成功')
        delegateLoading.value = false
        router.go(-1)
    }).catch(() => {
        delegateLoading.value = false
    })
}


// 提交流程
const submit = async () => {
    // 检查是否有其他操作正在进行
    if (passLoading.value || refuseLoading.value || delegateLoading.value || backLoading.value ||
        renturnLoading.value || urgentLoading.value || endFlowLoading.value || downloadLoading.value) {
        Message.warning('正在进行其他操作，请稍后再试')
        return
    }

    submitBtnLoading.value = true
    try {
        await executeFormEvents('submit')
    } catch (eventError) {
        submitBtnLoading.value = false
        // Message.error(`表单事件执行失败：${eventError instanceof Error ? eventError.message : String(eventError)}`)
        return
    }
    formViewerRef.value?.refChangeForm?.validate((error: any) => {
        if (!error) {
            // TODO: 实现提交流程逻辑
            // 这里应该调用 API 提交表单数据
            loading.value = false
        } else {
            loading.value = false
        }
    })
}





// 流程图查看（流程图 Tab）

const getData = () => {
    if (isFromProcessCenter.value) {
        applyWorkbench(route.query.id).then(res => {
            return setFormItem(res)
        }).then(() => {
            filterData(undefined)
            getNodeData()
        })
    } else if (route.query.classify == 'pending') {
        pendingWorkbench(route.query.taskId).then(res => {
            return setFormItem(res)
        }).then(() => {
            getNodeData()
            filterData(undefined)
        })
    } else if (route.query.classify == 'apply') {
        applyWorkbench(route.query.id).then(res => {
            return setFormItem(res)
        }).then(() => {
            filterData(undefined)
            getNodeData()
        })
    } else if (route.query.classify == 'handler') {
        handlerWorkbench(route.query.taskId).then(res => {
            return setFormItem(res)
        }).then(() => {
            filterData(undefined)
            getNodeData()
        })
    } else if (route.query.classify == 'notice') {
        noticeWorkbench(route.query.id).then(res => {
            return setFormItem(res)
        }).then(() => {
            filterData(undefined)
            getNodeData()
        })
    }

}
const setStart = ref(false)
const defaultFormData = ref<any>({})
const setFormItem = async (res: any) => {
    formConfs.value = res.formConfig ? JSON.parse(res.formConfig) : { id: '' }
    formConfs.value.id = formConfs.value.id ? formConfs.value.id : res.formId
    fieldControl.value = res.nodeConfig.fieldControl
    formConfs.value.name = appdes.value.appName
    let processConfig = res.processConfig ? JSON.parse(res.processConfig) : { sequenceFlows: [], nodes: [] }
    // console.log(processConfig)

    // 保存完整流程配置
    fullProcessConfig.value = processConfig

    // 先设置一个基础的nodeConfig，避免异步问题导致页面空白
    const startNodeFromAll = processConfig.nodes.find((node: any) => node.type === 'START' || node.type === 1);
    // console.log('从所有节点中查找START节点:', startNodeFromAll)

    if (startNodeFromAll) {
        nodeConfig.value = JSON.parse(JSON.stringify(startNodeFromAll));
        // console.log('预先设置START节点:', JSON.parse(JSON.stringify(nodeConfig.value)))
    } else {
        // console.error('初始化时未找到START节点！')
    }

    // 根据接口返回的节点ID过滤节点
    let { classify, id, processInstanceId } = route.query
    getProcessId(classify == 'notice' ? processInstanceId : id).then(res => {
        // console.log('活跃节点IDs:', res)

        // 按 getProcessId 返回的节点顺序显示节点：
        // - 第一个节点必须为 START
        // - 后续节点按接口返回顺序，基于 sequenceFlows 查找从上一个节点到该节点的路径（必要时补入中间节点）
        const apiList: any[] = Array.isArray(res) ? res : []
        const apiActiveIds: string[] = apiList.map((x: any) => x?.activityId).filter(Boolean)
        // 状态映射：1已执行、2执行中（其余/缺省视为未执行）
        const statusById = new Map<string, number>()
        apiList.forEach((x: any) => {
            if (x?.activityId) statusById.set(String(x.activityId), Number(x.executeStatus))
        })
        const flows = processConfig.sequenceFlows || []
        const nodes = processConfig.nodes || []

        const startNodeFromAll = nodes.find((node: any) => node.type === 'START' || node.type === 1)
        const startId = startNodeFromAll?.id
        if (!startId) {
            // console.error('未找到START节点，无法按顺序回显')
        }

        // 建图：source -> targets
        const childrenBySource = new Map<string, string[]>()
        flows.forEach((f: any) => {
            if (!f?.sourceRef || !f?.targetRef) return
            const arr = childrenBySource.get(f.sourceRef) || []
            arr.push(f.targetRef)
            childrenBySource.set(f.sourceRef, arr)
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
                // path: [cursor, ..., target]
                for (let i = 1; i < path.length; i++) {
                    const from = path[i - 1]
                    const to = path[i]
                    pushNode(to)
                    edgeSet.add(edgeKey(from, to))
                }
            } else {
                // 找不到路径，仍然保证节点能回显（但不保证连线）
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
                // 找不到路径也确保 END 可见
                pushNode(endId)
            }
        } else if (endId) {
            pushNode(endId)
        }

        activeNodeIds.value = orderedNodeIds
        // console.log('activeNodeIds(按接口顺序+按flow补全路径):', activeNodeIds.value)

        // 重置 setStart 标志位
        setStart.value = false;

        // 只保留“按接口顺序补全路径”得到的边（同时两端可见）
        const visibleFlows = flows.filter((f: any) => {
            if (!f?.sourceRef || !f?.targetRef) return false
            if (!visibleSet.has(f.sourceRef) || !visibleSet.has(f.targetRef)) return false
            // 如果 edgeSet 为空（如接口只返回 START），则不强行过滤
            if (edgeSet.size === 0) return true
            return edgeSet.has(edgeKey(f.sourceRef, f.targetRef))
        })

        // 根据筛选后的 sequenceFlows 构建节点关联关系
        processConfig.nodes.forEach((node: any) => {
            const flow = visibleFlows.find((f: any) => f.targetRef === node.id);
            if (flow) {
                node.pid = flow.sourceRef;
            }
        });

        // 只用“按接口顺序补全后”的可见集合构建树
        const allNodesForTree = nodes.filter((n: any) => n?.id && visibleSet.has(n.id));
        // console.log('使用所有节点构建树:', allNodesForTree.length, '个节点')
        // console.log('所有节点的type:', allNodesForTree.map(n => ({ id: n.id, type: n.type, name: n.name })))

        // 如果还没有设置nodeConfig，重新查找START节点
        const currentNodeConfig = nodeConfig.value as any;
        if (!currentNodeConfig || !currentNodeConfig.id) {
            // console.log('nodeConfig未设置，重新查找START节点')
            const startNode = allNodesForTree.find((node: any) => node.type === 'START' || node.type === 1);
            // console.log('重新查找startNode:', startNode)

            if (startNode) {
                nodeConfig.value = JSON.parse(JSON.stringify(startNode));
            } else {
                // console.error('仍然未找到START节点，使用第一个节点')
                // 如果找不到START节点，使用第一个节点作为根节点
                if (allNodesForTree.length > 0) {
                    nodeConfig.value = JSON.parse(JSON.stringify(allNodesForTree[0]));
                }
            }
        }

        // console.log('开始构建节点树，nodeConfig.value:', JSON.parse(JSON.stringify(nodeConfig.value)))  
        // 递归构建子节点关系
        const finalNodeConfig = nodeConfig.value as any;
        if (finalNodeConfig && finalNodeConfig.id && allNodesForTree.length > 0) {
            buildNodeTree(nodeConfig.value, allNodesForTree, visibleFlows);
            // console.log('构建完成后的nodeConfig.value:', JSON.parse(JSON.stringify(nodeConfig.value)))
        } else {
            // console.error('无法构建节点树，nodeConfig:', finalNodeConfig, 'allNodesForTree:', allNodesForTree.length)
        }

        // 标记节点状态：1已执行、2执行中、3未执行
        const setNodeState = (cfg: any) => {
            if (!cfg || !cfg.id) return
            const s = statusById.get(cfg.id)

            // 开始节点（type === 1）的状态只能是 1（已执行）或 2（执行中）
            if (cfg.type === 1 || cfg.type === 'START') {
                // 如果接口返回了状态，使用接口返回的状态
                if (typeof s === 'number' && (s === 1 || s === 2)) {
                    cfg.state = s
                } else {
                    // 默认设置为已执行（1）
                    cfg.state = 1
                }
            } else if (typeof s === 'number' && (s === 1 || s === 2)) {
                // 其他节点：如果接口返回了状态，使用接口返回的状态
                cfg.state = s
            } else {
                // 其他节点：默认为未执行（3）
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
    }).catch(() => {
        // console.error('getProcessId调用失败:', err)
        // 即使API调用失败，也要确保流程图能显示
        if (!nodeConfig.value || !(nodeConfig.value as any).id) {
            const startNode = processConfig.nodes.find((node: any) => node.type === 'START' || node.type === 1);
            if (startNode) {
                nodeConfig.value = JSON.parse(JSON.stringify(startNode));
                buildNodeTree(nodeConfig.value, processConfig.nodes, processConfig.sequenceFlows);
            }
        }
    })

    // console.log(nodeConfig.value)
    // }

    formConfs.value.category = 2
    setForm(formConfs.value.formList)
    if (Array.isArray(formConfs.value.formList)) {
        setRules(formConfs.value.formList, rules.value)
    }

    flowInfo.value = {
        ...res.nodeConfig,
        dataId: res.dataId,
        formId: res.formId,
        appId: res.appId,
        backCount: res.backCount,
        applyUser: res.applyUser,
        classify: route.query.classify,
        processFinish: res.processFinish,
        currentNodesIds: res.currentNodesIds,
        flowTitle: res.titleName || res.flowTitle,
        nodeName: getCurrentNodeName(res.currentNodesIds, res.processConfig)
    }

    // 如果流程已结束，获取结束状态详情
    if (flowInfo.value.processFinish) {
        const processInstanceId = route.query.processInstanceId || route.query.id
        if (processInstanceId) {
            getFinishStatus(processInstanceId).then(statusRes => {
                flowInfo.value.finishType = statusRes.finishType
                flowInfo.value.finishState = statusRes.finishState
            }).catch(err => {
                console.error('获取流程结束状态失败:', err)
            })
        }
    }

    // 初始化变更记录数据
    changePagination.formId = res.formId
    changePagination.dataId = res.dataId
    changePagination.appId = res.appId
    getChangeRecords()
    getCandidateData(route.query.id)
    setFormById(formConfs.value, res.appId)
    defaultFormData.value = res.formData
    isDataLoading.value = true
    try {
        await setUpDateData(res.formData, formConfs.value.formList, form.value, false, res.formId)
        await applySelectFormOptions(formConfs.value.formList, form.value, String(res.formId))
        await applyFormLinkage(formConfs.value.formList, form.value, String(res.formId), undefined, false, res.appId)
    } finally {
        isDataLoading.value = false
    }
    setTimeout(() => {
        if (flowInfo.value.processFinish) {
            setDisableData(formConfs.value.formList)
        } else {
            filterData(undefined)
        }
    }, 400)

    // setFormData(res.formData, formConfs.value.formList, form.value, false)
}

function setDisableData(list: any) {
    if (list && list.length > 0) {
        list.forEach((item: any) => {
            item.props.disabled = true
            if (item.children && item.children.length > 0) {
                setDisableData(item.children)
            }
            if (item.list && item.list.length > 0) {
                item.list.map(v1 => {
                    setDisableData(v1)
                })

            }
        })
    }
}

const { getPropsItem, setPropsItem, setRulesItem, filterData } = useDetailFormRuntime({ form, formConfs, flowInfo, rules, fieldControl, isDataLoading, formViewerRef })
getData()
// 获取流程节点执行候选人
const getCandidateData = (processInstanceId: any) => {
    processCandidates(processInstanceId).then(res => {
        candidateList.value = res
    }).catch(() => {
        candidateList.value = []
    })
}
const getNodeData = () => {
    let { classify, id, processInstanceId } = route.query
    processInstanceIdLog(classify == 'notice' ? processInstanceId : id).then(res => {
        res.comments.map(v => {
            if (v.dataType === 'multi') {
                if (v.comments) {
                    v.comment = JSON.parse(v.comments[0].comment)
                } else {
                    v.comment = {}
                }

                v.comment.title = v.title
            } else {
                v.comment = JSON.parse(v.comment)
            }
        })
        commentList.value = res.comments
    })
}









provide("provideDesigner", { setPropsItem, getPropsItem, filterData, setRulesItem });
provide('formModel', form);

const { downloadLoading, templateModalVisible, selectedTemplateId, templateList, downUp, downLoad, handleTemplateConfirm } = useDetailExport({ flowInfo })
</script>
<style lang="scss" scoped>
@use "../../styles/textColor.scss" as textColor;

.conten-body {
    height: calc(100vh - 120px);
    overflow-y: auto;
}

// 页面容器
.toDoCenterDes {
    height: calc(100vh - 80px);
    overflow: hidden;
    background: #f1f5f9;
    padding-bottom: 80px; // 为底部固定栏留空间
}

// 顶部导航栏
.top-navbar {
    background: white;
    border-bottom: 1px solid #e2e8f0;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .navbar-left {
        display: flex;
        align-items: center;
        gap: 12px;

        .out {
            background-color: rgb(243 244 246);
            width: 36px;
            height: 36px;
            border-radius: 12px;
            font-size: 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .breadcrumb {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;

            .breadcrumb-item {
                color: #64748b;
                cursor: pointer;
                transition: color 0.2s;

                &:hover {
                    color: rgb(var(--primary-6));
                }

                &.active {
                    color: #1e293b;
                    font-weight: 600;
                    cursor: default;

                    &:hover {
                        color: #1e293b;
                    }
                }
            }

            .breadcrumb-separator {
                color: #cbd5e1;
                font-size: 12px;
            }
        }
    }

    .navbar-right {
        display: flex;
        gap: 12px;

        .nav-btn {
            border-radius: 8px;
            padding: 8px 16px;
            font-size: 13px;
            color: #64748b;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 6px;

            .btn-icon {
                font-size: 14px;
            }

            .dropdown-icon {
                font-size: 12px;
                margin-left: 2px;
            }

            &:hover {
                background: #eff6ff;
                color: rgb(var(--primary-6));
                border-color: #bfdbfe;
            }
        }

        :deep(.arco-dropdown-option) {
            display: flex;
            align-items: center;
            gap: 8px;

            .option-icon {
                font-size: 16px;

                &.pdf {
                    color: #ef4444;
                }

                &.word {
                    color: rgb(var(--primary-6));
                }

                &.image {
                    color: #22c55e;
                }
            }
        }
    }
}

// 顶部信息条
.approval-header {
    background: white;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    padding: 20px;
    width: 1158px;
    margin: 16px auto;
    display: flex;
    align-items: center;
    gap: 16px;

    .header-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: linear-gradient(135deg, rgb(var(--primary-6)), #6366f1);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 20px;
        font-weight: bold;
        flex-shrink: 0;
    }

    .header-info {
        flex: 1;

        .header-title {
            display: flex;
            align-items: center;
            gap: 8px;
            line-height: 24px;
            margin-bottom: 8px;

            .applicant-name {
                font-size: 16px;
                font-weight: 600;
                color: #1e293b;
            }

            .applicant-dept {
                font-size: 12px;
                color: #64748b;
            }

            .header-divider {
                color: #cbd5e1;
            }

            .apply-time {
                font-size: 12px;
                color: #94a3b8;
            }
        }

        .header-status {
            display: flex;
            align-items: center;
            gap: 16px;

            .status-tag {
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;

                &.processing {
                    background: #eff6ff;
                    color: rgb(var(--primary-6));
                }

                &.completed {
                    background: #f0fdf4;
                    color: #22c55e;
                }

                &.rejected {
                    background: #fef2f2;
                    color: #dc2626;
                }
            }

            .status-text {
                font-size: 13px;
                color: #64748b;

                .current-node {
                    color: rgb(var(--primary-6));
                    // font-weight: 600;
                }

                .candidate {
                    color: #1e293b;
                    font-weight: 500;
                }
            }
        }
    }
}

// 单栏布局
.approval-content {
    width: 1200px;
    margin: 16px auto;

    &.single-column {
        .modern-card {
            .unified-body {
                padding: 0 20px 20px;
                min-height: calc(100vh - 380px);
                overflow-y: auto;
            }

            .change-list-wrapper {}
        }
    }
}

// 现代卡片
.modern-card {
    background: white;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    transition: all 0.3s;

    &:hover {
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    }

    .card-headers {
        padding: 20px 20px 16px;
        // border-bottom: 1px solid #f1f5f9;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .card-title {
            font-size: 13px;
            color: #94a3b8;
        }

        .card-title-with-icon {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 0;

            .title-icon {
                color: rgb(var(--primary-6));
            }
        }

        .tab-group {
            display: flex;
            gap: 4px;

            .tab-btn {
                padding: 8px 16px;
                border-radius: 10px;
                font-size: 13px;
                font-weight: 500;
                color: #64748b;
                cursor: pointer;
                transition: all 0.2s;
                border: none;
                background: transparent;

                &:hover {
                    color: #334155;
                }

                &.active {
                    background: #eff6ff;
                    color: rgb(var(--primary-6));
                }
            }
        }
    }

    .card-body {
        padding: 0 20px;
        margin-bottom: 20px;

        // max-height: calc(100vh - 347px);
        // overflow-y: auto;
        // handler 模式下的高度适配（无底部操作栏）
        &.handler-mode {
            // max-height: calc(100vh - 293px); // 减少底部预留空间，使顶部和底部高度一致
        }
    }

}

.card-body::v-deep {
    .box {
        padding: 12px 0;
        border-bottom: 0;
    }
}

// 表单样式
.card-body {

    :deep(.arco-form-item) {
        // margin-bottom: 12px !important;
    }

    :deep(.arco-form-item-label) {
        font-size: 13px;
        color: #64748b;
    }
}

// 变更记录

// 流程容器
.flow-container {
    position: relative;

    &.full-flow {
        width: 100%;
        min-height: 400px;
        background: #f8fafc;
        border-radius: 8px;
        overflow: hidden;
    }
}



// 底部固定操作栏
.bottom-action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    min-height: 32px;
    border-top: 1px solid #e2e8f0;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
    z-index: 100;
    padding: 12px 24px;

    .action-bar-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        min-height: 32px;
        justify-content: space-between;

        :deep(.arco-space) {
            display: flex;
            gap: 8px;
        }

        .action-btn {
            border-radius: 12px;
            font-weight: 600;
            padding: 8px 16px;
            font-size: 14px;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 2px;

            .btn-icon {
                font-size: 14px;
            }

            &:hover {
                transform: translateY(-1px);
            }

            &:active {
                transform: translateY(0);
            }

            &.ghost {
                background: transparent;
                color: #64748b;
                border: 1px solid #e2e8f0;

                &:hover {
                    background: #f1f5f9;
                    color: #334155;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
                }
            }

            &.success {
                background: linear-gradient(135deg, #22c55e, #16a34a);
                color: white;
                border: none;
                box-shadow: 0 4px 15px rgba(34, 197, 94, 0.25);

                &:hover {
                    box-shadow: 0 6px 20px rgba(34, 197, 94, 0.35);
                }
            }

            &.danger {
                background: linear-gradient(135deg, #ef4444, #dc2626);
                color: white;
                border: none;
                box-shadow: 0 4px 15px rgba(239, 68, 68, 0.25);

                &:hover {
                    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.35);
                }
            }

            &.warning {
                background: linear-gradient(135deg, #f59e0b, #d97706);
                color: white;
                border: none;
                box-shadow: 0 4px 15px rgba(245, 158, 11, 0.25);

                &:hover {
                    box-shadow: 0 6px 20px rgba(245, 158, 11, 0.35);
                }
            }

            &.ghost-with-icon {
                background: white;
                color: #64748b;
                border: 1px solid #e2e8f0;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

                &:hover {
                    background: #f8fafc;
                    color: #334155;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                }

                .btn-icon {
                    color: #64748b;
                }
            }

            &.primary {
                background: linear-gradient(135deg, rgb(var(--primary-6)), #6366f1);
                color: white;
                border: none;
                box-shadow: 0 4px 15px rgba(59, 130, 246, 0.25);

                &:hover {
                    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
                }
            }

            &.disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        }

        // 流程状态条
        .flow-status-bar {
            display: flex;
            align-items: center;
            gap: 12px;

            .status-badge {
                display: inline-flex;
                align-items: center;
                padding: 4px 12px;
                height: 20px;
                background: #eff6ff;
                color: rgb(var(--primary-6));
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;

                &.failed {
                    background: #fef2f2;
                    color: #ef4444;
                }
            }

            .status-tip {
                font-size: 14px;
                color: rgb(107, 114, 128);
            }
        }

        // 按钮组
        .action-buttons-group {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        // 流程状态徽章
        .flow-status-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            // padding: 8px 16px;
            // background: linear-gradient(135deg, #f0fdf4, #dcfce7);
            // border: 1px solid #86efac;
            // border-radius: 12px;

            .status-icon {
                font-size: 18px;
                color: #22c55e;
            }

            .status-text {
                font-size: 14px;
                color: rgb(156, 163, 175);
            }
        }
    }
}

// 响应式
@media (max-width: 1024px) {
    .approval-content {
        flex-direction: column;
    }

    .bottom-action-bar {
        .action-bar-content {
            justify-content: center;

            :deep(.arco-space) {
                flex-wrap: wrap;
            }
        }
    }
}

.flow-legend {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;

    .legend-item {
        // padding: 4px 8px;
        // border-radius: 8px;
        // border: 1px solid;
        font-size: 12px;
    }
}

.action-item {
    border-radius: 12px;
    gap: 4px;

    .nav-btn {
        gap: 4px;
        border-radius: 12px;

        &:hover {
            background: #EFF6FF;
            color: rgb(var(--primary-6));
        }
    }

    &:hover {
        background: #EFF6FF;
        color: rgb(var(--primary-6));
    }
}

// 完整流程弹窗样式
.full-flow-modal {
    position: relative;

    .full-flow-canvas {
        height: 600px;
        overflow: auto;
        // border-radius: 8px;
    }
}

.dingflow-design {
    // height: 500px;
    // overflow-y: auto;
    // overflow-x: auto;
    background: #eaeaef;

    // border-radius: 12px;
    .flow-scale-container {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        min-height: 100%;
        padding: 20px;

        .flow-scale {
            transform-origin: center top;
            transition: transform 0.3s ease;
        }
    }
}

.zoom-controls {
    position: absolute;
    right: 24px;
    top: 69px;
    display: flex;
    align-items: center;
    gap: 8px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 6px;
    z-index: 10;

    .zoom-btn {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
        color: #4e5969;
        font-size: 14px;

        &:hover:not(.disabled) {
            background: #eff6ff;
            color: rgb(var(--primary-6));
        }

        &:active:not(.disabled) {
            transform: scale(0.95);
        }

        &.disabled {
            opacity: 0.4;
            cursor: not-allowed;
            pointer-events: none;
        }
    }

    .zoom-value {
        min-width: 50px;
        text-align: center;
        font-size: 13px;
        font-weight: 500;
        color: #1d2129;
        user-select: none;
    }
}

.flow-tip {
    margin-top: 12px;
    padding: 10px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    font-size: 14px;
    transition: all 0.3s ease;

    // 默认：审批中
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    color: #166534;

    .flow-tip-left {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;

        .tip-icon {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            color: #ffffff;

            svg {
                width: 16px !important;
                height: 16px !important;
                display: block;
            }
        }

        .flow-tip-content {
            display: flex;
            flex-direction: column;
            gap: 4px;

            .flow-tip-title {
                font-size: 14px;
                font-weight: 600;
                color: inherit;
            }

            .flow-tip-desc {
                font-size: 12px;
                color: inherit;
                opacity: 0.85;
            }
        }
    }

    .flow-tip-status {
        flex-shrink: 0;

        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 16px;
            font-size: 12px;
            font-weight: 500;
        }
    }

    // 主题样式映射
    &.flow-tip-success {
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        color: #166534;

        .tip-icon {
            background: #22c55e;
        }

        .status-badge {
            background: rgba(34, 197, 94, 0.15);
            color: #166534;
        }
    }

    &.flow-tip-warning {
        background: #fff7ed;
        border: 1px solid #fed7aa;
        color: #c2410c;

        .tip-icon {
            background: #f97316;
        }

        .status-badge {
            background: rgba(249, 115, 22, 0.15);
            color: #c2410c;
        }
    }

    &.flow-tip-danger {
        background: #fef2f2;
        border: 1px solid #fecaca;
        color: #991b1b;

        .tip-icon {
            background: #ef4444;
        }

        .status-badge {
            background: rgba(239, 68, 68, 0.15);
            color: #991b1b;
        }
    }

    &.flow-tip-warning-orange {
        background: #fefce8;
        border: 1px solid #fef08a;
        color: #854d0e;

        .tip-icon {
            background: #eab308;
        }

        .status-badge {
            background: rgba(234, 179, 8, 0.15);
            color: #854d0e;
        }
    }

    &.flow-tip-gray {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        color: #475569;

        .tip-icon {
            background: #94a3b8;
        }

        .status-badge {
            background: rgba(148, 163, 184, 0.15);
            color: #475569;
        }
    }

    &.flow-tip-purple {
        background: #f5f3ff;
        border: 1px solid #ddd6fe;
        color: #5b21b6;

        .tip-icon {
            background: #8b5cf6;
        }

        .status-badge {
            background: rgba(139, 92, 246, 0.15);
            color: #5b21b6;
        }
    }

    &.flow-tip-progress {
        background: #eff6ff;
        border: 1px solid #bfdbfe;
        color: #1e40af;

        .tip-icon {
            background: rgb(var(--primary-6));
        }

        .status-badge {
            background: rgba(59, 130, 246, 0.15);
            color: #1e40af;
        }
    }
}

// 脉冲动画（进行中节点）
@keyframes pulse-border {

    0%,
    100% {
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
    }

    50% {
        box-shadow: 0 4px 16px rgba(59, 130, 246, 0.45), 0 0 0 4px rgba(59, 130, 246, 0.1);
    }
}
</style>
