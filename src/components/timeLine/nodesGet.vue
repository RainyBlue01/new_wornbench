<!--
 * @Date: 2022-09-21 14:41:53
 * @LastEditors: StavinLi 495727881@qq.com
 * @LastEditTime: 2023-05-24 15:20:24
 * @FilePath: /wornbench-Vue3/src/components/nodeWrap.vue
-->
<template>
    <div class="node-wrap" v-if="nodeConfig.type !== 7">
        <div class="node-wrap-box" :class="nodeConfig.type == 'START' ? 'start-node ' : ''" @click="clickEvent()">
            <div class="title"
                :style="`background: ${nodeConfig.state ? bgColorsFlow[nodeConfig.state] : bgColors[nodeConfig.type]};`">
                <span v-if="nodeConfig.type == 'START'">开始节点</span>
                <template v-else>
                    <span class="editable-title">{{ nodeConfig.type === 'END' ? '结束节点' : nodeConfig.type === 'INPUT' ?
                        '填写节点' :
                        nodeConfig.type === 'APPROVE' ? '审批节点' :
                            nodeConfig.type === 'NOTICE' ? '抄送节点' :
                                '业务连接' }}</span>

                    <!-- <i class="anticon close" v-show="nodeConfig.type !== 1" @click="delNode">
                        <icon-close />
                    </i> -->
                </template>
            </div>
            <div class="content">
                <div class="text">
                    {{ nodeConfig.name }}
                </div>
                <div class="userS" v-if="setUser(nodeConfig)">
                    <icon-user />
                    {{ setUser(nodeConfig) }}
                </div>
                <!-- <i class="anticon anticon-right arrow"></i> -->
            </div>
        </div>
        <addNodes v-show="nodeConfig.type !== 'END'" />
    </div>
    <div class="branch-wrap" v-if="nodeConfig.type === 7">
        <div class="branch-box-wrap">
            <div class="branch-box">
                <!-- <button class="add-branch" @click="addTerm">添加条件</button> -->
                <div class="col-box" v-for="(item, index) in nodeConfig.conditionNodes" :key="index">
                    <div class="condition-node">
                        <div class="condition-node-box">
                            <div class="auto-judge" @click="clickConditionNodes(item)">
                                <div class="title-wrapper">
                                    <span class="editable-title">{{ item.name
                                    }}</span>

                                </div>
                                <div class="content" v-if="conditionStr(item)">{{
                                    conditionStr(item) }}</div>
                            </div>
                            <addNodes />
                        </div>
                    </div>
                    <nodeWraps :formList="formList" v-if="item.childNode" v-model:nodeConfig="item.childNode" />
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
            <addNodes />
        </div>
    </div>
    <nodeGet :formList="formList" v-if="nodeConfig.childNode" v-model:nodeConfig="nodeConfig.childNode" />
</template>
<script setup>
import { onMounted, ref, watch, getCurrentInstance, computed, inject } from "vue";
import addNodes from "./addNodes.vue";
import { flowId } from '@/utils/id.ts';
import { typeFlter, getDataForm, optionsTimes } from '@/data/data_form.js'
import { bgColorsFlow, bgColors, placeholderList } from '@/data/const'
let _uid = getCurrentInstance().uid;

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
});

let defaultText = computed(() => {
    return placeholderList[props.nodeConfig.type]
});

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
const gcOptions = [
    { label: '直接部门负责人', value: 1 }, { label: '上级部门负责人', value: 2 }, { label: '三级部门负责人', value: 3 }, { label: '四级部门负责人', value: 4 }, { label: '五级部门负责人', value: 5 }

]
const setUser = (nodeConfig) => {
    let str = ''
    if (nodeConfig.type == 'APPROVE' && nodeConfig.approveOption == 1) {
        gcOptions.map(v => {
            if (v.value == nodeConfig.graduallyCandidate?.level) {
                str = v.label
            }
        })
    } else {
        if (nodeConfig.candidate) {
            if (nodeConfig.candidate.deptIds && Array.isArray(nodeConfig.candidate.deptIds)) {
                nodeConfig.candidate.deptIds.map(v => {
                    str = str + (str ? ',' : '') + v.label
                })
            }
            if (nodeConfig.candidate.postIds && Array.isArray(nodeConfig.candidate.postIds)) {
                nodeConfig.candidate.postIds.map(v => {
                    str = str + (str ? ',' : '') + v.postName
                })
            }
            if (nodeConfig.candidate.roleIds && Array.isArray(nodeConfig.candidate.roleIds)) {
                nodeConfig.candidate.roleIds.map(v => {
                    str = str + (str ? ',' : '') + v.roleName
                })
            }
            if (nodeConfig.candidate.userIds && Array.isArray(nodeConfig.candidate.userIds)) {
                nodeConfig.candidate.userIds.map(v => {
                    str = str + (str ? ',' : '') + v.nickname
                })
            }
            // 瀹夊叏璁块棶 dynamic 瀵硅薄
            if (nodeConfig.candidate.dynamic) {
                if (nodeConfig.candidate.dynamic.deptLeader?.level && Array.isArray(nodeConfig.candidate.dynamic.deptLeader.level)) {
                    nodeConfig.candidate.dynamic.deptLeader.level.map(v => {
                        str = str + (str ? ',' : '') + v.label
                    })
                }

                if (nodeConfig.candidate.dynamic.chargeLeader?.level && Array.isArray(nodeConfig.candidate.dynamic.chargeLeader.level)) {
                    nodeConfig.candidate.dynamic.chargeLeader.level.map(v => {
                        str = str + (str ? ',' : '') + v.label
                    })
                }

                if (nodeConfig.candidate.dynamic.applyUser) {
                    str = str + (str ? ',' : '') + '流程发起人'
                }
            }
        }
    }

    return str
}
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
            v1.rulesOption.map(v2 => {
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
<style lang="scss" scoped></style>
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
