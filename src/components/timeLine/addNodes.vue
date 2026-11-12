<template>
    <div class="add-node-btn-box">
        <div class="add-node-btn">

        </div>
    </div>
</template>
<script setup>
import { ref } from 'vue'
import { HashCode, flowId } from '@/utils/id.ts';
import { Components } from '@/data/const.js'
import { setProps } from '@/utils/flowPath.ts'
import { useRoute } from 'vue-router'
import { getFormById } from '@/utils/form'
const route = useRoute()
const formConfs = getFormById(route.query.id)
const createRef = ref()
let props = defineProps({
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
const addType = (item) => {
    visible.value = false;
    createRef.value.showItem(item)
}
const upDateChildNode = (val) => {
    if (val.type !== 'BRANCH') {
        let data = val
        data.childNode = props.childNodeP
        data.id = flowId()
        data.code = flowId()
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
    display: -webkit-inline-box;
    display: -ms-inline-flexbox;
    display: inline-flex;
    -ms-flex-negative: 0;
    flex-shrink: 0;
    -webkit-box-flex: 1;
    -ms-flex-positive: 1;
    position: relative;

    &:before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: -1;
        margin: auto;
        width: 2px;
        height: 100%;
        background-color: #cacaca
    }

    .add-node-btn {
        user-select: none;
        width: 240px;
        padding: 20px 0 32px;
        display: flex;
        -webkit-box-pack: center;
        justify-content: center;
        flex-shrink: 0;
        -webkit-box-flex: 1;
        flex-grow: 1;

        .btn {
            outline: none;
            box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .1);
            width: 30px;
            height: 30px;
            background: #3296fa;
            border-radius: 50%;
            position: relative;
            border: none;
            line-height: 30px;
            -webkit-transition: all .3s cubic-bezier(.645, .045, .355, 1);
            transition: all .3s cubic-bezier(.645, .045, .355, 1);

            .iconfont {
                color: #fff;
                font-size: 16px
            }

            &:hover {
                transform: scale(1.3);
                box-shadow: 0 13px 27px 0 rgba(0, 0, 0, .1)
            }

            &:active {
                transform: none;
                box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .1)
            }
        }
    }
}
</style>
<style lang="scss">
.arco-popover-popup-content {
    padding: 8px 10px;
    border-radius: 4px;
    box-shadow: 0 2px 8px #00000026;
    font-size: 12px;
}

.add-node-popover-body {
    display: flex;

    .add-node-popover-item {
        margin-right: 10px;
        cursor: pointer;
        text-align: center;
        flex: 1;
        color: #191f25 !important;
        display: flex;
        flex-direction: column;
        align-items: center;

        p {
            text-align: center;
            min-width: 56px;
            margin-top: 5px;
            margin-bottom: 0;
        }

        .item-wrapper {
            display: inline-block;
            width: 40px;
            height: 40px;
            background: #fff;
            border: 1px solid #e2e2e2;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;

            .iconfont {
                font-size: 22px;
                line-height: 22px;
            }
        }

        &.people {
            .item-wrapper {
                color: orange;
            }
        }

        &.approver {
            .item-wrapper {
                color: #deb887;
            }
        }

        &.notifier {
            .item-wrapper {
                color: green
            }
        }

        &.condition {

            .item-wrapper {
                color: #15bc83
            }
        }

        &.link {
            margin-right: 0;

            .item-wrapper {
                color: #3296fa
            }
        }

        &:hover {
            .item-wrapper {
                color: #3296fa;
                box-shadow: 0 10px 20px 0 rgba(50, 150, 250, .4)
            }

            p {
                color: #366F36;
            }

        }

        &:active {
            .item-wrapper {
                box-shadow: none;
                background: #eaeaea
            }

            .iconfont {
                color: inherit
            }
        }
    }
}
</style>