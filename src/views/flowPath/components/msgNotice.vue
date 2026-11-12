<template>
    <div class="msg-notice">
        <!-- 消息推送列表 -->
        <div class="top-time"
            v-if="activeFlew?.extendConfig?.messageExtendPlan && activeFlew.extendConfig?.messageExtendPlan.length > 0">
            <div class="top-item" v-for="(item, index) in activeFlew.extendConfig.messageExtendPlan" :key="index">
                <div class="flow-title">
                    <div class="left-title">
                        <span class="platform-icon">
                            <icon-wechat v-if="item.channel === 1" />
                            <icon-message v-if="item.channel === 0" />
                        </span>
                        {{ getPlatformName(item.channel) }}
                    </div>
                    <div class="right-title">
                        <div class="edit" @click="editNotice(item, index as number)">
                            <icon-edit />
                        </div>
                        <div class="delete" @click="deleteNotice(index as number)">
                            <icon-delete />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="top-time" v-else>
            <empty-box desc="暂无推送配置" />
        </div>

        <!-- 新增推送按钮 -->
        <div class="add-plan-button">
            <a-button @click="handleAddNoticeClick" class="submit" type="primary">
                新增推送
            </a-button>
        </div>

        <!-- 新增推送弹窗 -->
        <a-modal v-model:visible="modalVisible" title="配置消息推送" :width="520" @before-ok="handleConfirm"
            :cancel-text="'取消'" :ok-text="'确定'">
            <div class="notice-form">
                <a-form ref="refChangeForm" :rules="rules" :model="formData" layout="vertical"
                    label-align="left">
                    <!-- 消息通道 -->
                    <a-form-item label="消息通道" field="channel" required>
                        <a-select v-model="formData.channel" placeholder="请选择消息通道">
                            <a-option :value="0">
                                <div class="platform-option">
                                    服务中台
                                </div>
                            </a-option>
                            <a-option :value="1">
                                <div class="platform-option">
                                    微信平台
                                </div>
                            </a-option>
                        </a-select>
                    </a-form-item>

                    <!-- 触发条件 -->
                    <a-form-item label="触发条件" field="events" required>
                        <a-checkbox-group v-model="formData.events">
                            <a-checkbox :value="0" v-if="activeFlew.type == 'INPUT'">填写开始</a-checkbox>
                            <a-checkbox :value="1" v-if="activeFlew.type == 'INPUT'">填写结束</a-checkbox>
                            <a-checkbox :value="2" v-if="activeFlew.type == 'APPROVE'">审批开始</a-checkbox>
                            <a-checkbox :value="3" v-if="activeFlew.type == 'APPROVE'">审批结束</a-checkbox>
                            <a-checkbox :value="4" v-if="activeFlew.type == 'NOTICE'">通知开始</a-checkbox>
                            <a-checkbox :value="5" v-if="activeFlew.type == 'END'">流程结束</a-checkbox>
                        </a-checkbox-group>
                    </a-form-item>

                    <!-- 通知待办人 -->
                    <a-form-item label="通知待办人"
                        v-if="(activeFlew.type === 'INPUT' || activeFlew.type === 'APPROVE') && (formData.events.includes(0) || formData.events.includes(2))"
                        required>
                        <a-switch v-model="formData.sendHandler" />
                    </a-form-item>
                    <!-- 通知申请人 -->
                    <a-form-item label="通知申请人"
                        v-if="(activeFlew.type == 'INPUT' || activeFlew.type == 'APPROVE' || activeFlew.type == 'END') && (formData.events.includes(1) || formData.events.includes(3) || formData.events.includes(5))"
                        required>
                        <a-switch v-model="formData.sendApplier" />
                    </a-form-item>
                    <!-- 通知抄送人 -->
                    <a-form-item label="通知抄送人" v-if="activeFlew.type == 'NOTICE'" required>
                        <a-switch v-model="formData.sendNoticer" />
                    </a-form-item>
                </a-form>
            </div>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { Message } from '@arco-design/web-vue'

const props = defineProps<{
    activeFlew: any,
    deptList?: any,
    roleList?: any,
    postList?: any
}>()

// 弹窗控制
const modalVisible = ref(false)
const editingIndex = ref(-1)
const refChangeForm = ref()
const rules = ref({
    channel: [
        {
            required: true,
            message: "请选择消息通道",
        },
    ],
    events: [
        {
            required: true,
            type: "array",
            message: "请选择触发条件",
        },
    ],
});
// 表单数据
const formData = ref({
    channel: undefined as number | undefined,
    events: [] as any[],
    sendHandler: true,
    sendApplier: true,
    sendNoticer: true
})

// 辅助字段，用于 checkbox 绑定
const notifyTypes = ref<string[]>(['handler', 'applier', 'noticer'])


// 获取平台图标
const getPlatformComponent = (channel: number) => {
    const components: any = {
        0: 'icon-service',
        1: 'icon-wechat'
    }
    return components[channel] || 'icon-service'
}

// 获取平台样式类
const getPlatformIcon = (channel: number) => {
    const icons: any = {
        0: 'service',
        1: 'wechat'
    }
    return icons[channel] || ''
}

// 获取平台名称
const getPlatformName = (channel: number) => {
    const names: any = {
        0: '服务中台',
        1: '微信平台'
    }
    return names[channel] || '未知平台'
}

// 获取事件名称
const getEventName = (eventId: number) => {
    const eventMap: any = {
        0: '填写开始',
        1: '填写结束',
        2: '审批开始',
        3: '审批结束',
        4: '通知开始',
        5: '流程结束'
    }
    return eventMap[eventId] || eventId
}

// 打开新增推送弹窗
const handleAddNoticeClick = () => {
    editingIndex.value = -1
    formData.value = {
        channel: undefined,
        events: [],
        sendHandler: true,
        sendApplier: true,
        sendNoticer: true
    }
    notifyTypes.value = ['handler', 'applier', 'noticer']
    modalVisible.value = true
}

// 编辑推送配置
const editNotice = (item: any, index: number) => {
    editingIndex.value = index
    formData.value = {
        channel: item.channel,
        events: item.events || [],
        sendHandler: item.sendHandler ?? true,
        sendApplier: item.sendApplier ?? true,
        sendNoticer: item.sendNoticer ?? true
    }

    // 同步到 notifyTypes
    notifyTypes.value = []
    if (formData.value.sendHandler) notifyTypes.value.push('handler')
    if (formData.value.sendApplier) notifyTypes.value.push('applier')
    if (formData.value.sendNoticer) notifyTypes.value.push('noticer')

    modalVisible.value = true
}

// 删除推送配置
const deleteNotice = (index: number) => {
    if (!props.activeFlew?.extendConfig.messageExtendPlan) return

    props.activeFlew.extendConfig.messageExtendPlan.splice(index, 1)
    Message.success('删除成功')
}

// 监听 checkbox 变化，同步到 formData
watch(notifyTypes, (newVal) => {
    formData.value.sendHandler = newVal.includes('handler')
    formData.value.sendApplier = newVal.includes('applier')
    formData.value.sendNoticer = newVal.includes('noticer')
}, { deep: true })

// 确认保存
const handleConfirm = () => {

    refChangeForm.value.validate((error: any) => {
        if (!error) {
            // 构建推送配置对象
            const noticeConfig = {
                channel: formData.value.channel,
                events: formData.value.events,
                sendHandler: formData.value.sendHandler,
                sendApplier: formData.value.sendApplier,
                sendNoticer: formData.value.sendNoticer
            }

            // 初始化数组
            if (!props.activeFlew.extendConfig) {
                props.activeFlew.extendConfig = {
                    messageExtendPlan: []
                }
            }

            // 新增或编辑
            if (editingIndex.value === -1) {
                props.activeFlew.extendConfig.messageExtendPlan.push(noticeConfig)
            } else {
                props.activeFlew.extendConfig.messageExtendPlan[editingIndex.value] = noticeConfig
            }

            modalVisible.value = false
            Message.success('保存成功')
        }
    });
    return false
}
</script>

<style lang="scss" scoped>
@use "@/styles/textColor.scss" as textColor;

.msg-notice {
    .top-time {
        height: 500px;
        overflow-y: auto;

        .top-item {
            margin-bottom: 16px;

            .flow-title {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
                padding: 7px 10px;
                border-radius: 5px;
                background-color: rgba(255, 255, 255, 1);
                border: 1px solid rgba(187, 187, 187, 1);

                .left-title {
                    display: flex;
                    align-items: center;
                    font-size: 14px;
                    font-weight: 500;

                    .platform-icon {
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        width: 24px;
                        height: 24px;
                        color: #67C23A;
                        border-radius: 4px;
                        margin-right: 8px;
                        font-size: 16px;

                        &.wechat {
                            background-color: #07c160;
                            color: #fff;
                        }

                        &.dingtalk {
                            background-color: #0089ff;
                            color: #fff;
                        }

                        &.feishu {
                            background-color: #3370ff;
                            color: #fff;
                        }

                        &.email {
                            background-color: #f53f2f;
                            color: #fff;
                        }

                        &.sms {
                            background-color: #165dff;
                            color: #fff;
                        }

                        &.webhook {
                            background-color: #8c4ec4;
                            color: #fff;
                        }
                    }

                    .event-tags {
                        margin-left: 8px;
                        display: flex;
                        gap: 4px;
                    }
                }

                .right-title {
                    display: flex;
                    align-items: center;

                    .edit,
                    .delete {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 28px;
                        height: 28px;
                        border-radius: 4px;
                        cursor: pointer;
                        margin-left: 8px;
                        transition: all 0.3s;

                        &:hover {
                            background-color: #f5f5f5;
                        }

                        .edit {
                            color: #165dff;
                        }

                        .delete {
                            color: #f53f2f;
                        }
                    }
                }
            }

            .notice-content {
                background-color: #f5f5f5;
                border-radius: 8px;
                padding: 12px 16px;

                .notice-item {
                    font-size: 13px;
                    line-height: 1.6;
                    color: rgba(0, 0, 0, 0.65);

                    .label {
                        color: rgba(0, 0, 0, 0.45);
                        margin-right: 4px;
                    }
                }
            }
        }
    }

    .add-plan-button {
        display: flex;
        justify-content: center;
        padding: 16px 0;

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

    .notice-form {
        padding: 8px 0;

        :deep(.arco-form-item) {
            margin-bottom: 20px;
        }

        :deep(.arco-form-item-label-col) {
            margin-bottom: 8px;
        }

        :deep(.arco-form-item-wrapper-col) {
            width: 100%;
        }

        :deep(.arco-select-view) {
            width: 100%;
        }

        .platform-option {
            display: flex;
            align-items: center;
            gap: 8px;
        }
    }
}
</style>
