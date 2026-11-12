<template>
    <div class="add-node-btn-box">
        <div class="add-node-btn">
            <a-popover position="rt" v-model:popup-visible="visible" trigger="click" v-if="!readonly">
                <button type="button" class="btn line-add-btn" aria-label="添加节点">
                    <icon-plus />
                </button>
                <template #content>
                    <div class="flow-add-menu">
                        <a v-for="(item, index) in Components" :key="index" href="javascript:void(0)"
                            class="flow-add-menu-item" @click="addType(item)">
                            <i :class="menuIconClass(item.type)" :style="{ color: menuIconColor(item.type) }"
                                aria-hidden="true" />
                            {{ item.name }}
                        </a>
                    </div>
                </template>
            </a-popover>
        </div>
        <create :roleList="roleList" :deptList="deptList" :postList="postList" @upDateChildNode="upDateChildNode"
            ref="createRef" />
    </div>
</template>
<script setup>
import create from './create.vue'
import { ref } from 'vue'
import { flowId } from '@/utils/id.ts';
import { Components } from '@/data/const.js'
import { setProps } from '@/utils/flowPath.ts'
import { useRoute } from 'vue-router'
import { getFormById } from '@/utils/form'

const route = useRoute()
const formConfs = getFormById(route.query.id)
const createRef = ref()

let props = defineProps({
    readonly: {
        type: Boolean,
        default: false,
    },
    childNodeP: {
        type: Object,
        default: () => ({})
    },
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
})

let emits = defineEmits(['update:childNodeP'])
let visible = ref(false)

const menuIconClass = (type) => {
    const map = {
        INPUT: 'fas fa-edit',
        APPROVE: 'fas fa-user-check',
        NOTICE: 'fas fa-paper-plane',
        BRANCH: 'fas fa-code-branch',
        CONNECTOR: 'fas fa-link',
        PLUGIN: 'fas fa-plug',
    }
    return map[type] || 'fas fa-circle'
}

const menuIconColor = (type) => {
    const map = {
        INPUT: '#7c3aed',
        APPROVE: 'rgb(var(--primary-6))',
        NOTICE: '#d97706',
        BRANCH: '#ef4444',
        CONNECTOR: '#64748b',
        PLUGIN: '#16a34a',
    }
    return map[type] || '#64748b'
}

const addType = (item) => {
    visible.value = false;
    createRef.value.showItem(item)
}

const messageEventsByNodeType = {
    INPUT: [0, 1],
    APPROVE: [2, 3],
    NOTICE: [4],
}

const setDefaultMessageExtendPlan = (node) => {
    const messageExtendPlan = node?.extendConfig?.messageExtendPlan
    const events = messageEventsByNodeType[node?.type]

    if (!Array.isArray(messageExtendPlan) || !events) {
        return
    }

    node.extendConfig.messageExtendPlan = [{
        channel: 0,
        events: [...events],
        sendHandler: node.type === 'INPUT' || node.type === 'APPROVE',
        sendApplier: node.type === 'INPUT' || node.type === 'APPROVE',
        sendNoticer: node.type === 'NOTICE',
    }]
}

const upDateChildNode = (val) => {
    if (val.type !== 'BRANCH') {
        let data = val
        data.childNode = props.childNodeP
        data.id = flowId()
        data.code = flowId()
        setDefaultMessageExtendPlan(data)
        setProps(data, formConfs.formList)
        emits("update:childNodeP", data)
    } else {
        emits("update:childNodeP", {
            "name": val.name,
            "type": 7,
            id: flowId(),
            code: flowId(),
            "childNode": props.childNodeP,
            "conditionNodes": [{
                "name": val.name,
                "@class": "com.joyou.workflow.engine.api.model.definition.impl.BranchNode",
                "type": 'BRANCH',
                id: flowId(),
                code: flowId(),
                "childNode": null,
                branch: {},
            }, {
                "name": val.name,
                "type": 'BRANCH',
                "@class": "com.joyou.workflow.engine.api.model.definition.impl.BranchNode",
                id: flowId(),
                code: flowId(),
                "childNode": null,
                branch: {},
            }]
        })
    }
}
</script>
<style scoped lang="scss">
.add-node-btn-box {
    display: inline-flex;
    flex-shrink: 0;
    position: relative;
    width: 100%;
    max-width: 320px;
    justify-content: center;

    &:before {
        content: "";
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 2px;
        height: 100%;
        background-color: #cbd5e1;
        z-index: 0;
    }

    &:after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-top: 5px solid #cbd5e1;
        z-index: 0;
    }

    .add-node-btn {
        user-select: none;
        width: 100%;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        padding: 0;

        .btn {
            outline: none;
            width: 22px;
            height: 22px;
            background: rgb(var(--primary-6));
            border-radius: 50%;
            border: 2px solid #fff;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 1px 6px rgba(59, 130, 246, 0.4);
            transition: all 0.2s;
            z-index: 10;
            color: #fff;
            padding: 0;

            :deep(.arco-icon),
            :deep(svg) {
                color: #fff;
                font-size: 10px;
            }

            &:hover {
                transform: scale(1.15);
                background: #2563eb;
            }
        }
    }
}
</style>
