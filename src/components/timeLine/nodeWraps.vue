<!--
 * @Date: 2022-09-21 14:41:53
 * @LastEditors: StavinLi 495727881@qq.com
 * @LastEditTime: 2023-05-24 15:20:24
 * @FilePath: /wornbench-Vue3/src/components/nodeWrap.vue
-->
<template>
    <div class="node-wrap">
        <!-- 开始节点 -->
        <div v-if="nodeConfig.type === 'START'" class="flow-node-wrap flow-node-wrap--terminal">
            <div class="flow-start-end start" @click="clickEvent()">
                <i class="fas fa-play" aria-hidden="true" />
            </div>
            <div class="flow-start-label">开始</div>
        </div>

        <!-- 结束节点 -->
        <div v-else-if="nodeConfig.type === 'END'" class="flow-node-wrap flow-node-wrap--terminal">
            <div class="flow-start-end end" @click="clickEvent()">
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
                <div class="node-state-block" :class="nodeStateClass" :title="nodeStateLabel" />
            </div>
        </div>

        <addNodes v-show="nodeConfig.type !== 'END'" />
    </div>
    <nodeWraps :formList="formList" :activeNodeIds="activeNodeIds" v-if="nodeConfig.childNode"
        v-model:nodeConfig="nodeConfig.childNode" />
</template>
<script setup>
import { onMounted, ref, computed, inject } from "vue";
import addNodes from "./addNodes.vue";
import { flowId } from '@/utils/id.ts';
import { placeholderList } from '@/data/const'
import { buildNodeCandidateText } from '@/utils/formatNodeCandidate'

let props = defineProps({
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
    activeNodeIds: {
        type: Array,
        default: () => [],
    },
});

let defaultText = computed(() => {
    return placeholderList[props.nodeConfig.type]
});

// 节点图标样式类（与 designer nodeWrap 一致）
const nodeIconClass = computed(() => {
    const map = {
        APPROVE: 'approve',
        INPUT: 'fill',
        NOTICE: 'cc',
        CONNECTOR: 'link',
        BRANCH: 'branch',
        7: 'branch',
    }
    return map[props.nodeConfig.type] || 'link'
})

const nodeIconFa = computed(() => {
    const map = {
        APPROVE: 'fas fa-user-check',
        INPUT: 'fas fa-edit',
        NOTICE: 'fas fa-paper-plane',
        CONNECTOR: 'fas fa-link',
        BRANCH: 'fas fa-code-branch',
        7: 'fas fa-code-branch',
    }
    return map[props.nodeConfig.type] || 'fas fa-link'
})

const isActive = computed(() => {
    return props.activeNodeIds.includes(props.nodeConfig.id)
})

// 节点状态标签
const nodeStateLabel = computed(() => {
    const state = Number(props.nodeConfig.state) || 3
    const map = { 1: '已完成', 2: '进行中', 3: '待处理' }
    return map[state] || '待处理'
})

const nodeStateClass = computed(() => {
    const state = Number(props.nodeConfig.state) || 3
    return `state-${state}`
})

const candidateResolver = inject('flowChartCandidateResolver', null)
const isBranchNode = computed(() => props.nodeConfig.type === 'BRANCH' || props.nodeConfig.type === 7 || props.nodeConfig.type === '7')

const nodeDesc = computed(() => {
    candidateResolver?.tick?.value

    if (isBranchNode.value && isActive.value) {
        return conditionStr(props.nodeConfig)
    }

    const formList = Array.isArray(props.formList) ? props.formList : []
    const user = buildNodeCandidateText(props.nodeConfig, formList, {
        getUser: candidateResolver?.getUser,
        getDept: candidateResolver?.getDept,
        getPost: candidateResolver?.getPost,
    })

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

let isInputList = ref([]);
let isInput = ref(false);
const provideState = inject("provideDesigner", { handleClick: () => { } })
onMounted(() => {

});
let emits = defineEmits(["update:flowPermission", "update:nodeConfig"]);

const clickEvent = (index) => {
    if (provideState?.handleClick) {
        provideState.handleClick(props.nodeConfig)
    }
};
const clickConditionNodes = (item) => {
    if (provideState?.handleClick) {
        provideState.handleClick(item)
    }
};

const delNode = () => {
    emits("update:nodeConfig", props.nodeConfig.childNode);
};

const conditionStr = (nodeConfig) => {
    let str = ""
    let strType = nodeConfig.option == 1 ? '且' : '或'
    if (nodeConfig.rules && Array.isArray(nodeConfig.rules)) {
        nodeConfig.rules.map((v1, indexs) => {
            if (v1.fieldCode === 'expression') {
                let item = v1.expression ? JSON.parse(JSON.stringify(v1.expression)) : ''
                props.formList.map(v2 => {
                    item = item.replaceAll(v2.id, v2.title)
                })
                str = str + (indexs != 0 ? strType : '') + '表达式:' + item
            }
            const rulesOption = Array.isArray(v1.rulesOption) ? v1.rulesOption : []
            rulesOption.map(v2 => {
                if (v2.value == v1.condition) {
                    if (v1.condition == 'IS_NULL' || v1.condition == 'NOT_NULL') {
                        str = str + (indexs != 0 ? strType : '') + v1.inputName + v2.name
                    } else if (v1.inputType == 'SELECT_MULTIPLE' || v1.inputType == 'CHECKBOX' || (v1.inputType == 'SELECT' || v1.inputType == 'RADIO') && (v1.condition == 'IN' || v1.condition == 'NOT_IN')) {
                        str = str + (indexs != 0 ? strType : '') + v1.inputName + v2.name
                        v1.default.map((v3) => {
                            if (Array.isArray(v1.value)) {
                                v1.value.map((val, indes) => {
                                    if (v3.value == val) {
                                        str = str + (indes == 0 ? '' : ',') + v3.label
                                    }
                                })
                            }
                        })
                    } else if (v1.inputType == 'INPUT' && (v1.condition == 'IN' || v1.condition == 'NOT_IN')) {
                        str = str + (indexs != 0 ? strType : '') + v1.inputName + v2.name
                        if (Array.isArray(v1.value)) {
                            v1.value.map((val, indes) => {
                                str = str + (indes == 0 ? '' : ',') + val
                            })
                        }
                    } else if (v1.inputType == 'RADIO' || v1.inputType == 'SELECT') {

                        v1.default.map((v3) => {
                            if (v3.value == v1.value) {
                                str = str + (indexs != 0 ? strType : '') + v1.inputName + v2.name + v3.label
                            }
                        })
                    } else if (v1.inputType == 'DEPT' || v1.inputType == 'USER') {
                        str = str + (indexs != 0 ? strType : '') + v1.inputName + v2.name
                        if (Array.isArray(v1.default)) {
                            v1.default.map((v3, index) => {
                                str = str + (index == 0 ? '' : ',') + (v1.inputType == 'DEPT' ? v3.label : v3.nickname)
                            })
                        }
                    } else if (v1.inputType == 'DEPT_MULTIPLE' || v1.inputType == 'USER_MULTIPLE') {
                        str = str + (indexs != 0 ? strType : '') + v1.inputName + v2.name
                        v1.default.map((v3, index) => {
                            str = str + (index == 0 ? '' : ',') + (v1.inputType == 'DEPT_MULTIPLE' ? v3.label : v3.nickname)
                        })
                    } else {
                        str = str + (indexs != 0 ? strType : '') + v1.inputName + v2.name + v1.value
                    }

                }
            })

        })
    }
    return str ? str : ''

}
const addTerm = () => {
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

.userS {
    font-size: 14px;
    color: #191f25;
    text-align: left;
    padding-top: 10px;
}
</style>
