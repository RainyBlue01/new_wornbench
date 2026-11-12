<template>
    <div class="create">
        <a-modal :title="title" v-model:visible="dialogVisible" width="520px" :before-ok="handleClose"
            :close-on-click-modal="false" :ok-text="indexs == -1 ? '确认新增' : '确认修改'">
            <div class="dia">
                <div class="dia-top">
                    到达节点
                    <a-input-number v-model="timeoutPlan.time" placeholder="请输入时间"
                        style="width: 120px; margin: 0 10px" />
                    <a-select v-model="timeoutPlan.timeOption" placeholder="请选择单位"
                        style="width: 120px; margin-right: 10px">
                        <a-option v-for="item in timeOptions" :key="item.value" :value="item.value">{{ item.label
                        }}</a-option>
                    </a-select>
                    后，触发以下操作：
                </div>
                <div class="aotuSend">
                    <a-checkbox v-model="timeoutPlan.commit" :disabled="timeoutPlan.back"
                        @change="changeCommit">自动提交</a-checkbox>
                    <a-select v-model="timeoutPlan.autoCommit" placeholder="请选择自动提交方案"
                        style="width: 200px;margin-left: 6px;" :disabled="timeoutPlan.back">
                        <a-option v-for="item in optionsCommit" :key="item.value" :value="item.value">{{ item.label
                        }}</a-option>
                    </a-select>
                </div>
                <div class="aotuSend">
                    <a-checkbox v-model="timeoutPlan.back" :disabled="timeoutPlan.commit"
                        @change="changeCommit">自动返回</a-checkbox>
                    <a-select v-model="timeoutPlan.autoBack" placeholder="请选择自动返回方案"
                        style="width: 200px;margin-left: 6px;" :disabled="timeoutPlan.commit">
                        <a-option v-for="item in optionsBack" :key="item.value" :value="item.value">{{ item.label
                        }}</a-option>
                    </a-select>
                </div>
                <div class="aotuRead">
                    <div class="read-top">
                        <a-checkbox v-model="timeoutPlan.autoRemind">自动提醒</a-checkbox>
                        <div class="info">
                            <span>有待办未完成，请及时处理<a-link>更改</a-link></span>
                        </div>
                    </div>
                    <formUser :roleList="roleList" :deptList="deptList" :postList="postList"
                        v-model="timeoutPlan.candidate" title="选择提醒人员" :multiple="true" :showDynamic="false" />
                    <div class="bar">默认会提醒流程发起人</div>
                </div>
            </div>
            <template #footer>
                <a-button @click="next(0)" v-if="indexs == -1">确认并继续新增</a-button>
                <a-button type="primary" @click="next(1)">{{ indexs == -1 ? '确认新增' : '确认修改' }}</a-button>
            </template>
        </a-modal>


    </div>
</template>
<script lang="ts" setup>
import { ref, computed } from 'vue'
import formUser from '@/components/selectPerson/formUser.vue'

interface TimeoutPlan {
    time?: number
    timeOption?: number
    commit: boolean
    back: boolean
    autoCommit?: string
    autoBack?: string
    autoRemind: boolean
    candidate: any
}

const emit = defineEmits(['updata', 'upItem'])

const dialogVisible = ref(false)
const timeoutPlan = ref<TimeoutPlan>({
    candidate: {
        deptIds: [],
        roleIds: [],
        userIds: [],
        postIds: [],
    },
    back: false,
    commit: false,
    autoRemind: false,
    time: undefined,
    timeOption: undefined,
    autoBack: undefined,
    autoCommit: undefined
})
const indexs = ref(-1)
const title = ref('新增')

const timeOptions = [
    { label: '分钟', value: 0 },
    { label: '小时', value: 1 },
    { label: '天', value: 2 },
]

const optionsCommit = [
    { label: '提交至下一节点', value: 0 },
    { label: '完成审批', value: 1 },
]

const optionsBack = [
    { label: '退回至流程发起人', value: 0 },
    { label: '退回至上一节点', value: 1 },
]

// 从父组件获取人员列表（需要通过 props 传入）
const props = defineProps<{
    roleList?: any[]
    deptList?: any[]
    postList?: any[]
}>()

const roleList = computed(() => props.roleList || [])
const deptList = computed(() => props.deptList || [])
const postList = computed(() => props.postList || [])

const showItem = (val: any, index: number = -1) => {
    if (val) {
        title.value = "修改方案"
        dialogVisible.value = true
        timeoutPlan.value = JSON.parse(JSON.stringify(val))
        indexs.value = index
        timeoutPlan.value.commit = val.autoOption === 0 ? true : false
        timeoutPlan.value.back = val.autoOption === 1 ? true : false
    } else {
        title.value = "新增方案"
        dialogVisible.value = true
    }
}

const changeCommit = () => {
    // 强制更新
}

const handleClose = () => {
    indexs.value = -1
    dialogVisible.value = false
   
        timeoutPlan.value = {
            candidate: {
                deptIds: [],
                roleIds: [],
                userIds: [],
                postIds: [],
            },
            back: false,
            commit: false,
            autoRemind: false,
            time: undefined,
            timeOption: undefined,
            autoBack: undefined,
            autoCommit: undefined
        }

        return true // 允许关闭
    }

    const resetForm = () => {
        timeoutPlan.value = {
            candidate: [],
            back: false,
            commit: false,
            autoRemind: false,
            time: undefined,
            timeOption: undefined,
            autoBack: undefined,
            autoCommit: undefined
        }
    }

    const next = (val: number) => {
        const params = {
            time: timeoutPlan.value.time,
            timeOption: timeoutPlan.value.timeOption,
            autoOption: timeoutPlan.value.commit ? 0 : (timeoutPlan.value.back ? 1 : ''),
            autoCommit: timeoutPlan.value.autoCommit,
            autoBack: timeoutPlan.value.autoBack,
            autoRemind: timeoutPlan.value.autoRemind,
            candidate: timeoutPlan.value.candidate
        }

        if (indexs.value !== -1) {
            emit('upItem', params, indexs.value)
        } else {
            // 新增模式，不需要传递 index
            emit('updata', params, null)
        }

        if (val === 0) {
            resetForm()
        } else {
            indexs.value = -1
            resetForm()
            dialogVisible.value = false
        }
    }

    // 暴露方法给父组件
    defineExpose({
        showItem
    })
</script>
<style lang="scss" scoped>
.create {
    .dia {
        padding: 10px 0;

        .dia-body {
            display: flex;
            justify-content: space-between;

            &-item {
                width: calc(25% - 5px);
                padding: 20px 0px;
                background-color: #f2f6ff;
                border-radius: 10px;
                cursor: pointer;
                border: 1px solid #fff;

                .img {
                    display: flex;
                    justify-content: center;

                    img {
                        width: 44px;
                    }
                }

                .title {
                    margin-top: 8px;
                    text-align: center;
                    color: #616266;
                }
            }

            .form {
                width: 100%;
            }

            .line {
                border: 1px solid #396fff;
            }
        }
    }

    .form {
        margin-top: 18px;
    }
}

.dia-top {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.aotuSend {
    margin-bottom: 16px;
    display: flex;
    align-items: center;

    .select {
        margin-right: 12px;
        min-width: 100px;
    }

    .a-select {
        flex: 1;
        max-width: 240px;
    }
}

.aotuRead {
    // margin-top: 20px;
    // padding-top: 16px;
    // border-top: 1px solid rgba(0, 0, 0, 0.06);

    .read-top {
        display: flex;
        align-items: center;
        margin-bottom: 12px;

        .info {
            display: flex;
            align-items: center;
            margin-left: 12px;
            font-size: 13px;
            color: rgba(0, 0, 0, 0.65);

            span {
                margin-right: 8px;
            }

            a {
                flex-shrink: 0;
            }
        }
    }

    .bar {
        margin-top: 8px;
        margin-left: 0;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.45);
    }
}
</style>
