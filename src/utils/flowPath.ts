import { toBackendDateFormat } from './form'
import { flowId } from '@/utils/id.ts';
import { buildSwitchDisplayOptions } from './flowConditionDisplay'

const DISABLED_FIELD_TYPES = new Set(['TITLE', 'SPLIT_LINE', 'RICH_TEXT_EDITOR', 'BUTTON_CONNECTOR'])
const OPTION_FIELD_TYPES = new Set(['RADIO', 'CHECKBOX', 'SELECT', 'SELECT_MULTIPLE'])
const SWITCH_FIELD_TYPE = 'SWITCH'
const DATE_FIELD_TYPES = new Set(['TIME', 'DATE', 'DATE_INTERVAL'])
const REGION_FIELD_TYPES = new Set(['ADDRESS', 'LOCATION'])

function flattenFormFields(formList: any[] = [], result: any[] = [], isChild = false) {
    formList.forEach((item) => {
        result.push({ field: item, isChild })
        if (Array.isArray(item?.children) && item.children.length > 0) {
            flattenFormFields(item.children, result, true)
        }
    })
    return result
}

function buildFieldControlItem(fieldEntry: any, controlMap: Map<any, any>) {
    const { field, isChild } = fieldEntry
    const matchedControl = controlMap.get(field.id)
    const isDisabled = DISABLED_FIELD_TYPES.has(field.type)

    return {
        title: !isDisabled || (field.type !== 'SPLIT_LINE' && field.type !== 'BUTTON_CONNECTOR') ? field.title : '分割线',
        fieldCode: field.id,
        edit: isDisabled ? false : matchedControl?.edit ?? true,
        push: matchedControl?.push ?? false,
        view: matchedControl?.view ?? true,
        ...(isDisabled ? { disabled: true } : {}),
    }
}

function rebuildFieldControl(fieldControl: any[] = [], formList: any[] = []) {
    const controlMap = new Map((Array.isArray(fieldControl) ? fieldControl : []).map((item) => [item.fieldCode, item]))
    return flattenFormFields(formList).map((fieldEntry) => buildFieldControlItem(fieldEntry, controlMap))
}

function applyRuleFieldMeta(rule: any, field: any) {
    rule.inputName = field.title

    if (field.type === SWITCH_FIELD_TYPE) {
        rule.default = buildSwitchDisplayOptions(field.props)
    } else if (OPTION_FIELD_TYPES.has(field.type)) {
        rule.default = field.props?.options
    }
    if (DATE_FIELD_TYPES.has(field.type)) {
        rule.format = toBackendDateFormat(field.props?.format)
    }
    if (REGION_FIELD_TYPES.has(field.type)) {
        rule.default = field.props?.level
    }
}

export function setProps(nodeConfig: any, formList: any,) {
    const flatFormList = Array.isArray(formList) ? flattenFormFields(formList) : []
    const fieldMap = new Map(flatFormList.map(({ field }) => [field.id, field]))

    if (nodeConfig.type !== 7) {
        if (Array.isArray(nodeConfig.fieldControl) && Array.isArray(formList)) {
            nodeConfig.fieldControl = rebuildFieldControl(nodeConfig.fieldControl, formList)
        }
        if (nodeConfig.childNode && nodeConfig.childNode.id) {
            setProps(nodeConfig.childNode, formList)
        }
    } else {
        if (nodeConfig.conditionNodes) {
            nodeConfig.conditionNodes.map((v1: any) => {
                if (v1.rules && Array.isArray(v1.rules)) {
                    v1.rules.map((v2: any) => {
                        const matchedField = fieldMap.get(v2.fieldCode)
                        if (matchedField) {
                            applyRuleFieldMeta(v2, matchedField)
                        }
                    })
                }
                if (v1.childNode && v1.childNode.id) {
                    setProps(v1.childNode, formList)
                } else {

                }
            })

        } if (nodeConfig.childNode) {
            setProps(nodeConfig.childNode, formList)
        }
    }
}
export function setCildProps(nodeConfig: any, formList: any, fild: any) {
    if (!Array.isArray(nodeConfig.fieldControl) || !Array.isArray(formList) || !Array.isArray(fild)) {
        return
    }

    rebuildFieldControl(nodeConfig.fieldControl, formList).forEach((item) => {
        fild.push(item)
    })
    nodeConfig.fieldControl = fild
}
export function setFlow(flow: any, nodes: any) {
    if (flow.type !== 7) {
        if (flow.type !== 'START') {
            let params = JSON.parse(JSON.stringify(flow))
            delete params.childNode
            delete params.attribute
            if (params.candidate && Array.isArray(params.candidate.userIds)) {
                let userIds = []
                userIds = params.candidate.userIds.map((v: any) => {
                    return v.id
                })
                params.candidate.userIds = userIds
            }
            if (params.candidate && Array.isArray(params.candidate.roleIds)) {
                let roleIds = []
                roleIds = params.candidate.roleIds.map((v: any) => {
                    return v.id
                })
                params.candidate.roleIds = roleIds
            }
            if (params.candidate && Array.isArray(params.candidate.postIds)) {
                let postIds = []
                postIds = params.candidate.postIds.map((v: any) => {
                    return v.id
                })
                params.candidate.postIds = postIds
            }
            if (params.candidate && Array.isArray(params.candidate.deptIds)) {
                let deptIds = []
                deptIds = params.candidate.deptIds.map((v: any) => {
                    return v.id
                })
                params.candidate.deptIds = deptIds
            }
            if (params.candidate && Array.isArray(params.candidate.dynamic.deptFields)) {
                let deptIds = []
                deptIds = params.candidate.dynamic.deptFields.map((v: any) => {
                    return v.id
                })
                params.candidate.dynamic.deptFields = deptIds
            }
            if (params.candidate && Array.isArray(params.candidate.dynamic.userFields)) {
                let deptIds = []
                deptIds = params.candidate.dynamic.userFields.map((v: any) => {
                    return v.id
                })
                params.candidate.dynamic.userFields = deptIds
            }
            if (params.candidate && Array.isArray(params.candidate.dynamic.chargeLeader.level)) {
                let level = []
                level = params.candidate.dynamic.chargeLeader.level.map((v: any) => {
                    return v.value
                })
                params.candidate.dynamic.chargeLeader.level = level
            }
            if (params.candidate && Array.isArray(params.candidate.dynamic.deptLeader.level)) {
                let level = []
                level = params.candidate.dynamic.deptLeader.level.map((v: any) => {
                    return v.value
                })
                params.candidate.dynamic.deptLeader.level = level
            }
            if (params.approveBlankOption && Array.isArray(params.approveBlankOption.userIds)) {
                let userIds = []
                userIds = params.approveBlankOption.userIds.map((v: any) => {
                    return v.id
                })
                params.approveBlankOption.userIds = userIds
            }

            if (params?.extendConfig?.timeoutPlan && Array.isArray(params.extendConfig.timeoutPlan)) {
                params.extendConfig.timeoutPlan.map(v1 => {
                    if (v1.candidate && Array.isArray(v1.candidate.userIds)) {
                        let userIds = []
                        userIds = v1.candidate.userIds.map((v: any) => {
                            return v.id
                        })
                        v1.candidate.userIds = userIds
                    }
                    if (v1.candidate && Array.isArray(v1.candidate.roleIds)) {
                        let roleIds = []
                        roleIds = v1.candidate.roleIds.map((v: any) => {
                            return v.id
                        })
                        v1.candidate.roleIds = roleIds
                    }
                    if (v1.candidate && Array.isArray(v1.candidate.postIds)) {
                        let postIds = []
                        postIds = v1.candidate.postIds.map((v: any) => {
                            return v.id
                        })
                        v1.candidate.postIds = postIds
                    }
                    if (v1.candidate && Array.isArray(v1.candidate.deptIds)) {
                        let deptIds = []
                        deptIds = v1.candidate.deptIds.map((v: any) => {
                            return v.id
                        })
                        v1.candidate.deptIds = deptIds
                    }
                })
            }
            nodes.push(params)

        } else {
            let params = JSON.parse(JSON.stringify(flow))
            // delete params.childNode
            delete params.attribute
            nodes.push(params)
        }
        if (flow.childNode && flow.childNode.id) {
            flow.childNode.pid = []
            getFlowPid(flow, flow.childNode.pid, false)
            setFlow(flow.childNode, nodes)
        }
    } else {
        if (flow.childNode && flow.childNode.id) {
            flow.childNode.pid = []
            console.log(flow, flow.childNode.pid)
            getFlowPid(flow, flow.childNode.pid, true)
            setFlow(flow.childNode, nodes)
        }
        if (flow.conditionNodes) {
            flow.conditionNodes.map((v1: any) => {
                v1.pid = flow.pid
                let params = JSON.parse(JSON.stringify(v1))
                delete params.childNode
                nodes.push(params)
                if (v1.childNode && v1.childNode.id) {
                    v1.childNode.pid = []
                    getFlowPid(v1, v1.childNode.pid, false)
                    setFlow(v1.childNode, nodes)
                } else {

                }
            })

        }
        // nodes.push(flow)
    }
}

export function getFlowPid(flow: any, pid: any, isLast: boolean) {
    if (flow.type == 7) {
        getLastId(flow, pid, isLast)
    } else {
        if (isLast && flow.childNode && flow.childNode.id) {
            getFlowPid(flow.childNode, pid, isLast)
        } else {
            pid.push(flow.id)
        }

    }
}
export function getLastId(flow: any, id: any, isLast) {
    if (Array.isArray(flow.conditionNodes)) {
        flow.conditionNodes.map((v: any) => {
            if (v.childNode && v.childNode.id) {
                getFlowPid(v.childNode, id, isLast)
            } else {
                id.push(v.id)
            }
        })
    }
}

export function setFlowById(flowData: any, id: any) {
    const list = safeJsonRecord(localStorage.getItem('flowList'))
    list[id] = flowData
    localStorage.setItem('flowList', JSON.stringify(list))
}
export function getFlowById(id: any) {
    const list = safeJsonRecord(localStorage.getItem('flowList'))
    return list[id] || {}

}
export function clearFlowById(id: any) {
    const list = safeJsonRecord(localStorage.getItem('flowList'))
    delete list[id]
    localStorage.setItem('flowList', JSON.stringify(list))
}

export function flowsToTree(processConfig: any, id: any) {
    let flowData = {}
    processConfig.nodes.map((v: { type: string }) => {
        if (v.type == 'START') {
            flowData = {
                ...v, attribute: [
                    {
                        field: 'name',
                        label: '节点名称',
                        type: 'input',
                    },
                    {
                        field: 'download',
                        label: '可下载（pdf,word）',
                        type: 'checkbox',
                    },
                    {
                        field: 'print',
                        label: '可打印',
                        type: 'checkbox',
                    },
                    {
                        field: 'processLog',
                        label: '查看审批日志及流程',
                        type: 'checkbox',
                    },
                    {
                        field: 'revoke',
                        label: '可撤回',
                        type: 'checkbox',
                    },
                    {
                        field: 'fieldControl',
                        label: '当前节点可见内容',
                        type: 'fieldControl',
                    },
                ]
            }
        }
    })
    setFlowById(flowData, id)
}
import { safeJsonRecord } from '@/utils/safeJson'
