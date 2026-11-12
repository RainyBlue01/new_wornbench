<template>
    <div class="node-time-limit">
        <div class="top-time" v-if="activeFlew?.extendConfig?.timeoutPlan && activeFlew.extendConfig.timeoutPlan.length > 0">
            <div class="top-item" v-for="(item, index) in activeFlew?.extendConfig.timeoutPlan" :key="index">
                <div class="flow-title">
                    <div class="left-title">
                        到达节点{{ item.time }}{{ item.timeOption == 0 ? '分钟' : item.timeOption == 1 ? '小时' : '天' }}
                    </div>
                    <div class="right-title">
                        <div class="edit" @click="updatePlan(item, index)"><icon-edit /></div>
                        <div class="delete" @click="deletePlan(index)"><icon-delete /></div>
                    </div>
                </div>
                <div class="aoto" v-show="item.autoOption === 1">
                    自动退回:{{ item.autoBack == 0 ? '退回至流程发起人' : '退回至上一节点' }}
                </div>
                <div class="aoto" v-show="item.autoOption === 0">
                    自动提交:{{ item.autoCommit === 0 ? '提交至下一节点' : '完成审批' }}
                </div>
                <div class="aoto" v-show="item.autoRemind == true">
                    自动提醒: <span v-for="(items, index1) in item.candidate.deptIds" :key="index1 + 'i'">{{ items.label }}
                        {{ index == item.candidate.deptIds.length - 1 ? '' : ',' }}</span>
                    <span v-for="(items, index1) in item.candidate.roleIds" :key="index1 + 'i'">{{ items.roleName }}
                        {{ index == item.candidate.roleIds.length - 1 ? '' : ',' }}</span>
                    <span v-for="(items, index1) in item.candidate.userIds" :key="index1 + 'i'">{{ items.nickname }}
                        {{ index == item.candidate.userIds.length - 1 ? '' : ',' }}</span>
                    <span v-for="(items, index1) in item.candidate.postIds" :key="index1 + 'i'">{{ items.postName }}
                        {{ index == item.candidate.postIds.length - 1 ? '' : ',' }}</span>
                </div>
            </div>
        </div>
        <div class="top-time" v-else>
            <empty-box desc="暂无方案" />
        </div>

        <!-- 新增方案按钮 -->
        <div class="add-plan-button">
            <a-button @click="handleAddPlanClick" class="submit" type="primary" >
                新增方案
            </a-button>
        </div>
        <!-- 新增方案弹窗 - 使用 addPlan 组件 -->
        <addPlan ref="addPlanRef" :role-list="roleList" :dept-list="deptList" :post-list="postList"
            @updata="handleAddPlan" @upItem="handleEditPlan" />
    </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import addPlan from './addPlan.vue'

const props = defineProps<{
    activeFlew: any,
    deptList: any,
    roleList: any,
    postList: any
}>()

const emits = defineEmits(['update:activeFlew'])



// 时间配置 - 使用本地 ref 用于编辑
const timeValue = ref<number | undefined>()
const timeUnit = ref<'minute' | 'hour' | 'day'>('minute')
const timeCommitValue = ref(false) // 自动提交开关
const timeAutoCommitValue = ref() // 自动提交选项
const editingIndex = ref(-1) // 当前编辑的方案索引


const addPlanRef = ref()

const timeUnitOptions = [
    { label: '分钟', value: 'minute' },
    { label: '小时', value: 'hour' },
    { label: '天', value: 'day' }
]


// 打开新增方案弹窗
const handleAddPlanClick = () => {
    editingIndex.value = -1
    // 重置时间配置的值
    timeValue.value = undefined
    timeUnit.value = 'minute'
    timeCommitValue.value = false
    timeAutoCommitValue.value = undefined
    addPlanRef.value?.showItem(null, -1)
}
const updatePlan = (val, index) => {
    addPlanRef.value?.showItem(val, index)
}
const deletePlan = (val) => {
    if (props.activeFlew?.extendConfig.timeoutPlan) {
        props.activeFlew.extendConfig.timeoutPlan.splice(val, 1)
    }
}
// 处理新增方案
const handleAddPlan = (params: any, index: any) => {
    if (props.activeFlew?.extendConfig.timeoutPlan) {
        props.activeFlew.extendConfig.timeoutPlan.push(params)
    } else {
        props.activeFlew.extendConfig.timeoutPlan = [params]
    }

}

// 处理编辑方案
const handleEditPlan = (params: any, index: number) => {
    // 更新对应索引的方案
    if (props.activeFlew?.extendConfig.timeoutPlan && index >= 0) {
        props.activeFlew.extendConfig.timeoutPlan[index] = params
    }
}




// 监听数据变化并同步到父组件（已移除，直接使用 computed）
</script>

<style lang="scss" scoped>
@use "@/styles/textColor.scss" as textColor;

.node-time-limit {
    .top-time {
       height: 500px;
       overflow: auto;
        .flow-title {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .right-title {
                display: flex;

                .edit {
                    cursor: pointer;
                    margin-right: 10px;
                }

                .delete {
                    cursor: pointer;
                    margin-right: 10px;
                }
            }

        }

        .aoto {
            border: 1px solid rgba(187, 187, 187, 0.8);
            border-radius: 5px;
            padding: 14px;
            margin: 10px   0;
        }

    }

    .add-plan-button {
        display: flex;
        justify-content: center;
        padding: 16px 0 0;
         .submit {
            padding: 8px 32px;
            font-size: 14px;
            font-weight: 500;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            line-height: 1;
            position: relative;
            overflow: hidden;

            &::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
                transition: left 0.5s ease;
            }

            &:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(var(--primary-6), 0.45);

                &::before {
                    left: 100%;
                }
            }

            &:active {
                transform: translateY(0);
                box-shadow: 0 2px 8px rgba(var(--primary-6), 0.3);
            }
        }
    }
}
</style>
