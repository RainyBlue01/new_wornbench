<!--
 * @Date: 2022-09-21 14:41:53
 * @LastEditors: StavinLi 495727881@qq.com
 * @LastEditTime: 2023-05-24 15:20:24
 * @FilePath: /Workflow-Vue3/src/components/nodeWrap.vue
-->
<template>
    <div class="node-wrap" v-if="nodeConfig.type !== 7">
        <!-- 开始节点 -->
        <div v-if="nodeConfig.type === 'START'" class="flow-node-wrap flow-node-wrap--terminal">
            <div class="flow-start-end start" :class="{ active: isActive }" @click="clickEvent()">
                <i class="fas fa-play" aria-hidden="true" />
            </div>
            <div class="flow-start-label">开始</div>
        </div>

        <!-- 结束节点 -->
        <div v-else-if="nodeConfig.type === 'END'" class="flow-node-wrap flow-node-wrap--terminal">
            <div class="flow-start-end end" :class="{ active: isActive }" @click="clickEvent()">
                <i class="fas fa-flag-checkered" aria-hidden="true" />
            </div>
            <div class="flow-start-label">结束</div>
        </div>

        <!-- 业务节点 -->
        <div v-else class="flow-node-wrap">
            <div class="node-wrap-box flow-node" :class="{ active: isActive }" @click="clickEvent()">
                <div class="node-icon" :class="nodeIconClass">
                    <i :class="nodeIconFa" aria-hidden="true" />
                </div>
                <div class="node-body">
                    <div class="node-name">{{ nodeConfig.name }}</div>
                    <div v-if="nodeDesc" class="node-desc">{{ nodeDesc }}</div>
                </div>
                <div v-if="!readonly" class="node-delete" @click.stop="delNode">×</div>
            </div>
        </div>

        <addNode v-if="nodeConfig.type !== 'END'" :roleList="roleList" :readonly="readonly" :deptList="deptList"
            :postList="postList" v-model:childNodeP="nodeConfig.childNode" />
    </div>
    <div class="branch-wrap" v-if="nodeConfig.type === 7">
        <div class="branch-box-wrap">
            <div class="branch-box">
                <button v-if="!readonly" class="add-branch" @click="addTerm">添加条件</button>
                <div class="col-box" v-for="(item, index) in nodeConfig.conditionNodes" :key="index">
                    <div class="condition-node">
                        <div class="condition-node-box">
                            <div class="auto-judge" :class="{ active: isConditionActive(item) }"
                                @click="clickConditionNodes(item)">
                                <div class="title-wrapper">
                                    <span class="editable-title">{{ item.name }}</span>
                                    <i v-if="!readonly" class="anticon close" @click.stop="delTerm(index)">
                                        <icon-close />
                                    </i>
                                </div>
                                <div class="content" v-if="conditionStr(item)">{{ conditionStr(item) }}</div>
                            </div>
                            <addNode :readonly="readonly" :roleList="roleList" :deptList="deptList" :postList="postList"
                                v-model:childNodeP="item.childNode" />
                        </div>
                    </div>
                    <nodeWrap :roleList="roleList" :deptList="deptList" :postList="postList" :formList="formList"
                        :readonly="readonly" v-if="item.childNode" v-model:nodeConfig="item.childNode" />
                    <template v-if="index == 0">
                        <div class="top-left-cover-line"></div>
                        <div class="bottom-left-cover-line"></div>
                    </template>
                    <template v-if="index == nodeConfig.conditionNodes.length - 1">
                        <div class="top-right-cover-line"></div>
                        <div class="bottom-right-cover-line"></div>
                    </template>
                </div>
            </div>
            <addNode :readonly="readonly" :roleList="roleList" :deptList="deptList" :postList="postList"
                v-model:childNodeP="nodeConfig.childNode" />
        </div>
    </div>
    <nodeWrap :roleList="roleList" :deptList="deptList" :postList="postList" :formList="formList" :readonly="readonly"
        v-if="nodeConfig.childNode" v-model:nodeConfig="nodeConfig.childNode" />
</template>
<script setup>
import { onMounted, ref, computed, inject } from "vue";
import { useRoute } from "vue-router";

import { flowId } from '@/utils/id.ts';
import { placeholderList } from '@/data/const'
import { userVariable } from '@/components/expression/formula/userFormula'
import { commonFunc } from '@/components/expression/formula/commonFormula'
import { dateFunc } from '@/components/expression/formula/dateFormula'
import { randomFunc } from '@/components/expression/formula/randomFormula'
import { stringFunc } from '@/components/expression/formula/stringFormula'
import { arrayFunc } from '@/components/expression/formula/arrayFormula'
import { moneyFunc } from '@/components/expression/formula/moneyFormula'
import { businessFunc } from '@/components/expression/formula/businessFormula'
import { formatFlowConditionValue } from '@/utils/flowConditionDisplay'

const props = defineProps({
    roleList: {
        type: Object,
        default: () => ({}),
    },
    deptList: {
        type: Object,
        default: () => ({}),
    },
    postList: {
        type: Object,
        default: () => ({}),
    },
    nodeConfig: {
        type: Object,
        default: () => ({}),
    },
    flowPermission: {
        type: Object,
        default: () => [],
    },
    formList: {
        type: Object,
        default: () => [],
    },
    readonly: {
        type: Boolean,
        default: false,
    },
});
const route = useRoute()
const expressionAppId = computed(() => String(route.query?.id || localStorage.getItem('taskFillCenterAppId') || ''))

const DELIMITED_NEW = /@#([\s\S]*?)#@/g
const DELIMITED_LEGACY = /@#([\s\S]*?)@#/g
const BARE_VARIABLE =
    /(getFormValue\('[^']+','[^']+'\)|getSubFormValue\('[^']+','[^']+','[^']+'\)|getCurrentUser\("[^"]+"\)|getUser\w+\("[^"]+"\))/g

let defaultText = computed(() => {
    return placeholderList[props.nodeConfig.type]
});

let isInputList = ref([]);
let isInput = ref(false);
const provideState = inject("provideDesigner")

const isActive = computed(() => {
    const activeId = provideState?.activeNodeId?.value ?? provideState?.activeNodeId ?? ''
    return props.nodeConfig.id === activeId
})

const isConditionActive = (item) => {
    const activeId = provideState?.activeNodeId?.value ?? provideState?.activeNodeId ?? ''
    return item.id === activeId
}

const nodeIconClass = computed(() => {
    const map = {
        APPROVE: 'approve',
        INPUT: 'fill',
        NOTICE: 'cc',
        CONNECTOR: 'link',
        PLUGIN: 'plugin',
        BRANCH: 'branch',
    }
    return map[props.nodeConfig.type] || 'link'
})

const nodeIconFa = computed(() => {
    const map = {
        APPROVE: 'fas fa-user-check',
        INPUT: 'fas fa-edit',
        NOTICE: 'fas fa-paper-plane',
        CONNECTOR: 'fas fa-link',
        PLUGIN: 'fas fa-plug',
        BRANCH: 'fas fa-code-branch',
    }
    return map[props.nodeConfig.type] || 'fas fa-link'
})

onMounted(() => {

});
let emits = defineEmits(["update:flowPermission", "update:nodeConfig"]);

const clickEvent = (index) => {
    if (props.readonly) return;
    if (index || index === 0) {
        provideState.handleClick(props.nodeConfig)
    } else {
        provideState.handleClick(props.nodeConfig)
    }
};
const clickConditionNodes = (item) => {
    if (props.readonly) return;
    provideState.handleClick(item)
};

const delNode = () => {
    if (props.readonly) return;
    emits("update:nodeConfig", props.nodeConfig.childNode);
};
const gcOptions = [
    { label: '直接部门负责人', value: 1 }, { label: '上级部门负责人', value: 2 }, { label: '二级部门负责人', value: 3 }, { label: '三级部门负责人', value: 4 }, { label: '四级部门负责人', value: 5 }
]
const setUser = (nodeConfig) => {
    let str = ''
    if (nodeConfig.type == 'APPROVE' && nodeConfig.approveOption == 1) {
        gcOptions.map(v => {
            if (v.value == nodeConfig.graduallyCandidate.level) {
                str = v.label
            }
        })
    } else {
        if (nodeConfig.candidate) {
            nodeConfig.candidate.deptIds.map(v => {
                str = str + (str ? ',' : '') + v.label
            })
            nodeConfig.candidate.postIds.map(v => {
                str = str + (str ? ',' : '') + v.postName
            })
            nodeConfig.candidate.roleIds.map(v => {
                str = str + (str ? ',' : '') + v.roleName
            })
            nodeConfig.candidate.userIds.map(v => {
                str = str + (str ? ',' : '') + v.nickname
            })
            nodeConfig.candidate.dynamic.deptFields.map(v => {
                str = str + (str ? ',' : '') + v.title
            })
            nodeConfig.candidate.dynamic.userFields.map(v => {
                str = str + (str ? ',' : '') + v.title
            })
            nodeConfig.candidate.dynamic.deptLeader.level.map(v => {
                str = str + (str ? ',' : '') + v.label
            })
            if (nodeConfig.candidate.dynamic.chargeLeader && Array.isArray(nodeConfig.candidate.dynamic.chargeLeader.level)) {
                nodeConfig.candidate.dynamic.chargeLeader.level.map(v => {
                    str = str + (str ? ',' : '') + v.label
                })
            }

            if (nodeConfig.candidate.dynamic.applyUser) {
                str = str + (str ? ',' : '') + '流程发起人'
            }

        }
    }

    return str
}

const nodeDesc = computed(() => {
    if (props.nodeConfig.type === 'PLUGIN') {
        return props.nodeConfig.pluginName
            ? `${props.nodeConfig.pluginName}${props.nodeConfig.extensionName || props.nodeConfig.functionName ? ` · ${props.nodeConfig.extensionName || props.nodeConfig.functionName}` : ''}`
            : '点击配置插件调用'
    }
    const user = setUser(props.nodeConfig)
    if (!user && props.nodeConfig.type !== 'APPROVE' && props.nodeConfig.type !== 'INPUT' && props.nodeConfig.type !== 'NOTICE') {
        return ''
    }
    const prefixMap = {
        APPROVE: '指定审批人：',
        INPUT: '填写人：',
        NOTICE: '抄送人：',
        CONNECTOR: '业务连接：',
    }
    const prefix = prefixMap[props.nodeConfig.type] || ''
    return user ? `${prefix}${user}` : prefix.replace('：', '')
})

const buildExpressionVariableMap = (formList = []) => {
    const variableMap = new Map()

    const traverseVariableTree = (nodes = []) => {
        nodes.forEach((node) => {
            if (node?.value) {
                variableMap.set(node.value, node.showLabel || node.label)
            }
            if (Array.isArray(node?.children) && node.children.length > 0) {
                traverseVariableTree(node.children)
            }
        })
    }

    const buildFormVariables = (list = []) => {
        list.forEach((item) => {
            if (!item?.id) {
                return
            }

            variableMap.set(`getFormValue('${expressionAppId.value}','${item.id}')`, item.title)

            if (item.type === 'SUBFORM' && Array.isArray(item.children)) {
                item.children.forEach((child) => {
                    if (!child?.id) {
                        return
                    }
                    variableMap.set(
                        `getSubFormValue('${expressionAppId.value}','${item.id}','${child.id}')`,
                        `${item.title} / ${child.title}`,
                    )
                })
                return
            }

            if (Array.isArray(item.children) && item.children.length > 0) {
                buildFormVariables(item.children)
            }
        })
    }

    traverseVariableTree([userVariable])
    buildFormVariables(Array.isArray(formList) ? formList : [])

    return variableMap
}

const expressionVariableMap = computed(() => buildExpressionVariableMap(props.formList))

const buildExpressionFunctionMap = () => {
    const functionMap = new Map()

    const traverseFunctionTree = (nodes = []) => {
        nodes.forEach((node) => {
            if (node?.type === 'func' && node?.value) {
                const match = String(node.value).match(/^([a-zA-Z_]\w*)\s*\(/)
                if (match?.[1]) {
                    functionMap.set(match[1], node.label)
                }
            }
            if (Array.isArray(node?.children) && node.children.length > 0) {
                traverseFunctionTree(node.children)
            }
        })
    }

    traverseFunctionTree([
        commonFunc,
        dateFunc,
        moneyFunc,
        stringFunc,
        arrayFunc,
        randomFunc,
        businessFunc,
    ])

    return functionMap
}

const expressionFunctionMap = computed(() => buildExpressionFunctionMap())

const collectVariableTokens = (formula = '') => {
    const tokens = []
    const occupied = new Set()
    const addToken = (start, end, value) => {
        for (let i = start; i < end; i += 1) {
            if (occupied.has(i)) {
                return
            }
        }
        for (let i = start; i < end; i += 1) {
            occupied.add(i)
        }
        tokens.push({ start, end, value: value.trim() })
    }

    let match = null

    DELIMITED_NEW.lastIndex = 0
    while ((match = DELIMITED_NEW.exec(formula)) !== null) {
        addToken(match.index, match.index + match[0].length, match[1])
    }

    DELIMITED_LEGACY.lastIndex = 0
    while ((match = DELIMITED_LEGACY.exec(formula)) !== null) {
        addToken(match.index, match.index + match[0].length, match[1])
    }

    BARE_VARIABLE.lastIndex = 0
    while ((match = BARE_VARIABLE.exec(formula)) !== null) {
        addToken(match.index, match.index + match[0].length, match[1])
    }

    return tokens.sort((a, b) => a.start - b.start)
}

const translateExpression = (expression = '') => {
    if (!expression) {
        return ''
    }

    const rawExpression = String(expression)
    const tokens = collectVariableTokens(rawExpression)
    if (!tokens.length) {
        return rawExpression.replace(/@#|#@/g, '')
    }

    let translated = rawExpression
    tokens.slice().reverse().forEach((token) => {
        const label = expressionVariableMap.value.get(token.value) || token.value
        translated = `${translated.slice(0, token.start)}${label}${translated.slice(token.end)}`
    })

    return translated
        .replace(/@#|#@/g, '')
        .replace(/\b([a-zA-Z_]\w*)\s*\(/g, (match, functionName) => {
            const label = expressionFunctionMap.value.get(functionName)
            return label ? `${label}(` : match
        })
}

const conditionStr = (nodeConfig) => {
    if (!Array.isArray(nodeConfig.rules)) return ''

    const separator = nodeConfig.option == 1 ? '且' : '或'
    const parts = nodeConfig.rules.map((rule) => {
        if (rule.fieldCode === 'expression') {
            return `表达式:${translateExpression(rule.expression)}`
        }

        const ruleOption = Array.isArray(rule.rulesOption)
            ? rule.rulesOption.find((option) => option.value == rule.condition)
            : null
        if (!ruleOption) return ''

        const ruleText = `${rule.inputName || ''}${ruleOption.name || ruleOption.label || ''}`
        if (rule.condition == 'IS_NULL' || rule.condition == 'NOT_NULL') return ruleText

        return `${ruleText}${formatFlowConditionValue(rule)}`
    }).filter(Boolean)

    return parts.join(separator)
}
const addTerm = () => {
    if (props.readonly) return;
    let len = props.nodeConfig.conditionNodes.length + 1;
    props.nodeConfig.conditionNodes.push({
        name: props.nodeConfig.name,
        "@class": "com.joyou.workflow.engine.api.model.definition.impl.BranchNode",
        "type": 'BRANCH',
        id: flowId(),
        code: flowId(),
        "childNode": null,
        branch: {},
    });
    emits("update:nodeConfig", props.nodeConfig);
};
const delTerm = (index) => {
    if (props.readonly) return;
    props.nodeConfig.conditionNodes.splice(index, 1);
    props.nodeConfig.conditionNodes.map((item, index) => {
        item.priorityLevel = index + 1;
        item.name = `条件${index + 1}`;
    });
    emits("update:nodeConfig", props.nodeConfig);
    if (props.nodeConfig.conditionNodes.length == 1) {
        if (props.nodeConfig.childNode) {
            if (props.nodeConfig.conditionNodes[0].childNode) {
                reData(props.nodeConfig.conditionNodes[0].childNode, props.nodeConfig.childNode);
            } else {
                props.nodeConfig.conditionNodes[0].childNode = props.nodeConfig.childNode;
            }
        }
        emits("update:nodeConfig", props.nodeConfig.conditionNodes[0].childNode);
    }
};
const reData = (data, addData) => {
    if (!data.childNode) {
        data.childNode = addData;
    } else {
        reData(data.childNode, addData);
    }
};
</script>
<style>
.error_tip {
    position: absolute;
    top: 0px;
    right: 0px;
    transform: translate(150%, 0px);
    font-size: 24px;
}

.promoter_person .el-dialog__body {
    padding: 10px 20px 14px 20px;
}

.selected_list {
    margin-bottom: 20px;
    line-height: 30px;
}

.selected_list span {
    margin-right: 10px;
    padding: 3px 6px 3px 9px;
    line-height: 12px;
    white-space: nowrap;
    border-radius: 2px;
    border: 1px solid rgba(220, 220, 220, 1);
}

.selected_list img {
    margin-left: 5px;
    width: 7px;
    height: 7px;
    cursor: pointer;
}
</style>
