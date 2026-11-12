<template>
    <div class="timeLine">
        <div class="timeline-container">
            <div v-for="(item, index) in commentList" :key="index" class="timeline-item">
                <!-- 时间线圆点 -->
                <div class="timeline-dot" :class="getDotClass(item, index)">
                    <icon-check v-if="isPlugin(item) && getPluginStatus(item) === 1" />
                    <icon-close v-else-if="isPlugin(item) && getPluginStatus(item) === 2" />
                    <!-- <icon-check v-if="isCompleted(item)" /> -->
                    <icon-clock-circle v-else-if="isProcessing(item, index)" />
                    <icon-share-alt v-else-if="isTransfer(item)" />
                    <icon-edit v-else-if="isInputting(item)" />
                    <icon-send v-else-if="isNotice(item)" />
                    <icon-close v-else-if="isClose(item)" />
                    <icon-check v-else />
                </div>

                <!-- 内容卡片 -->
                <div class="timeline-card" :class="getCardClass(item, index)">
                    <!-- 卡片头部 -->
                    <div class="card-header">
                        <div class="header-left">
                            <div
                                :class="item.classify == 'INPUTTING' || item.classify == 'APPROVING' ? 'card-title green' : item.classify == 'BACK' ? 'card-title red' : 'card-title'">
                                {{ getItemTitle(item) }}
                            </div>
                            <span v-if="isPlugin(item)" class="plugin-tag">插件</span>
                            <span v-if="item.comment.extra && item.comment.extra.approveType" class="approve-type-tag">
                                {{ item.comment.extra.approveType }}
                            </span>
                            <span v-if="item.classify == 'NOTICE'" class="notice-tag">
                                <icon-notification />
                                知会
                            </span>
                        </div>
                        <div v-if="isPlugin(item)" class="plugin-header-meta">
                            <span class="plugin-status" :class="getPluginStatus(item) === 1 ? 'is-success' : 'is-failed'">
                                {{ getPluginStatus(item) === 1 ? '执行成功' : '执行失败' }}
                            </span>
                        </div>
                        <span v-else-if="item.classify == 'INPUTTED' || item.classify == 'APPROVED'" class="card-status"
                            :class="getStatusClass(item, index)">{{
                                getStatusText(item, index) }}</span>
                        <span v-else class="text-status">
                            {{ item.recordTime }}
                        </span>
                    </div>

                    <!-- 卡片内容 -->
                    <div class="card-content">
                        <div v-if="isPlugin(item)" class="plugin-node-content">
                            <div class="plugin-summary-row">
                                <div class="plugin-symbol" :class="getPluginStatus(item) === 1 ? 'is-success' : 'is-failed'">
                                    <icon-thunderbolt />
                                </div>
                                <div class="plugin-identity">
                                    <div class="plugin-name-row">
                                        <strong>{{ getPluginData(item).pluginName || '插件任务' }}</strong>
                                        <span v-if="getPluginData(item).pluginVersion" class="plugin-version">v{{ getPluginData(item).pluginVersion }}</span>
                                    </div>
                                    <span>函数：{{ getPluginData(item).extensionCode || '--' }} · {{ getPluginData(item).executionType || '--' }}</span>
                                </div>
                                <span class="plugin-summary-time">{{ item.recordTime }}</span>
                            </div>
                            <div class="plugin-detail-grid">
                                <section class="plugin-detail-panel">
                                    <h4 class="plugin-panel-title"><span>→</span> 请求参数</h4>
                                    <div v-if="getPluginParams(item).length" class="plugin-param-list">
                                        <p v-for="(param, paramIndex) in getPluginParams(item)" :key="paramIndex">
                                            <span class="plugin-param-label">{{ param.label || param.name || `参数${paramIndex + 1}` }}</span>
                                            <i>→</i>
                                            <b>{{ param.value ?? '--' }}</b>
                                            <em v-if="param.sourceType">（{{ param.sourceType }}）</em>
                                        </p>
                                    </div>
                                    <p v-else class="plugin-empty">暂无请求参数</p>
                                </section>
                                <section class="plugin-detail-panel">
                                    <h4>{{ getPluginStatus(item) === 1 ? '返回结果' : '错误信息' }}</h4>
                                    <p class="plugin-result" :class="getPluginStatus(item) === 1 ? 'is-success' : 'is-failed'">
                                        <icon-check-circle v-if="getPluginStatus(item) === 1" />
                                        <icon-exclamation-circle v-else />
                                        {{ getPluginResult(item).summary || (getPluginStatus(item) === 1 ? '执行成功' : '执行失败') }}
                                    </p>
                                    <p v-if="getPluginData(item).failureAction" class="plugin-extra">失败策略：{{ getPluginData(item).failureAction }}</p>
                                </section>
                            </div>
                            <div class="plugin-footer">
                                <span>执行耗时：{{ getPluginData(item).executionTime || '--' }}</span>
                                <span v-if="getPluginData(item).canRetry" class="plugin-retry">支持重试</span>
                            </div>
                        </div>

                        <!-- dataType 为 'multi' 的平铺展示 -->
                        <div v-if="item.dataType === 'multi' && item.comments && Array.isArray(item.comments)"
                            class="multi-operators-list">
                            <div v-for="(comment, cIndex) in item.comments" :key="cIndex" class="multi-operator-item">
                                <!-- 解析 comment 字段（JSON字符串） -->
                                <template v-if="typeof comment.comment === 'string'">
                                    <div v-for="(operator, opIndex) in parseCommentOperators(comment.comment)"
                                        :key="opIndex" class="operator-item"
                                        :class="operator.operator == 0 ? 'rejected' : 'approved'">
                                        <div class="operator-header">
                                            <div class="operator-icon">
                                                <icon-check v-if="operator.operator != 0" />
                                                <icon-close v-else />
                                            </div>
                                            <div class="operator-main">
                                                <div class="operator-info-row">
                                                    <span class="operator-name">{{ operator.nickname }}</span>
                                                    <span class="operator-role"
                                                        v-if="operator.role || operator.delegator">
                                                        （{{ operator.role || operator.delegator }}）
                                                    </span>
                                                    <span class="operator-time">{{ formatTime(comment.recordTime)
                                                        }}</span>
                                                </div>
                                                <div class="operator-action-text"
                                                    v-if="operator.operator !== undefined">
                                                    审批意见：{{ getOperatorComment(operator) }}
                                                </div>
                                                <div class="signature-area" v-show="operator.signature">
                                                    <span class="label">电子签名：</span>
                                                    <a-image
                                                        :src="operator.signature ? (win.api.dowUrl + operator.signature + '&token=' + token) : ''"
                                                        alt="签名" width="auto" height="20" :preview="true" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </div>
                        </div>

                        <!-- 多审批人情况（非 multi 类型） -->
                        <div v-else-if="Array.isArray(item.comment.operators) && item.comment.operators.length > 0"
                            class="operator-list">
                            <div v-for="(operator, opIndex) in getVisibleOperators(item)" :key="opIndex"
                                class="operator-item" :class="operator.operator == 0 ? 'rejected' : 'approved'">
                                <div class="operator-header">
                                    <div class="operator-avatar"
                                        :class="operator.operator == 0 ? 'avatar-rejected' : 'avatar-approved'">
                                        <icon-check v-if="operator.operator != 0" />
                                        <icon-close v-else />
                                    </div>
                                    <span class="operator-name">{{ operator.nickname }}</span>
                                    <span class="operator-role" v-if="operator.role">（{{ operator.role }}）</span>
                                    <span class="operator-time">{{ formatTime(item.recordTime) }}</span>
                                </div>
                                <div class="operator-body">
                                    <p class="operator-action">
                                        操作：【{{ getOperatorAction(operator) }}】
                                    </p>
                                    <p class="auto-option" v-if="operator.autoOption === 0 || operator.autoOption">
                                        {{ getAutoOptionText(operator.autoOption) }}
                                    </p>
                                    <div class="reason-text" v-if="operator.reason">
                                        <span class="label">处理意见：</span>{{ operator.reason }}
                                    </div>
                                    <div class="signature-area" v-show="operator.signature">
                                        <span class="label">电子签名：</span>
                                        <a-image
                                            :src="operator.signature ? (win.api.dowUrl + operator.signature + '&token=' + token) : ''"
                                            alt="签名" width="auto" height="20" :preview="true" />
                                    </div>
                                </div>
                            </div>

                            <!-- 展开/收起按钮 -->
                            <div v-if="Array.isArray(item.comment.operators) && item.comment.operators.length > 1"
                                class="expand-btn">
                                <div class="expand-btn-inner" @click="toggleExpand(item)">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2">
                                        <polyline
                                            :points="expandedItems.has(getItemKey(item)) ? '18 15 12 9 6 15' : '6 9 12 15 18 9'">
                                        </polyline>
                                    </svg>
                                    {{ expandedItems.has(getItemKey(item)) ? '收起' : '+' + (item.comment.operators.length
                                        - 1) + ' 更多审批人' }}
                                </div>
                            </div>
                        </div>

                        <!-- 空审批节点 -->
                        <div v-if="item.classify == 'APPROVE_EMPTY' && item.comment.assignees && item.comment.assignees.length > 0"
                            class="simple-info">
                            {{ item.option == 0 ? '流转下一个节点' : '转交给' + item.comment.assignees.join('、') }}
                        </div>

                        <div v-if="item.classify == 'INPUTTING' || item.comment?.extra?.approved == 'APPROVING'"
                            class="simple-info">
                            {{ item.classify == 'INPUTTING' ? '填写中' : '审批中' }}
                        </div>
                        <!-- 抄送节点 -->
                        <div v-if="item.classify == 'NOTICE'" class="notice-card">
                            <!-- 抄送人列表 -->
                            <div class="notice-assignees">
                                <div v-for="(assignee, idx) in item.comment.assigneeStatuses" :key="idx"
                                    class="notice-assignee-item">
                                    <div class="assignee-avatar">
                                        <icon-user />
                                    </div>
                                    <div class="assignee-info">
                                        <div class="assignee-name">{{ assignee.nickname }}</div>
                                        <div class="assignee-status">{{ assignee.states == 1 ? '未读' : '已读' }} {{assignee.noticeTime }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 查看详情按钮（已移除，改为平铺展示） -->

                        <!-- 简单信息展示 -->
                        <div v-if="!isPlugin(item) && (!item.comment.operators || item.comment.operators.length === 0)"
                            class="simple-info-section">
                            <p class="info-text" v-if="item.comment.nickname">
                                {{ item.comment.nickname }} 提交了{{ flowInfo?.titleName || '' }}
                            </p>
                            <p class="info-text action-text" v-show="item.classify == 'REVOKE'">
                                操作：【撤回】
                            </p>
                            <p class="info-text action-text" v-if="item.classify == 'BACK'">
                                操作：【{{ item.comment.operation }}】
                            </p>
                            <p class="info-text reason-text" v-if="item.comment.reason">
                                <span class="label">处理意见：</span>{{ item.comment.reason }}
                            </p>
                            <p class="info-text reason-text" v-if="item.comment.comment">
                                <span class="label">处理意见：</span>{{ item.comment.comment }}
                            </p>

                            <div class="signature-area" v-show="item.comment.signature">
                                <span class="label">电子签名：</span>
                                <a-image
                                    :src="item.comment.signature ? (win.api.dowUrl + item.comment.signature + '&token=' + token) : ''"
                                    alt="签名" width="auto" height="20" :preview="true" />
                            </div>
                        </div>
                        <p class="infos-text" v-if="item.classify == 'FINISH'">
                            审批流程结束
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <emptyBox v-if="!commentList || commentList.length === 0" />
    </div>
</template>
<script setup lang="ts">
import { ref, shallowRef } from "vue";
import { IconNotification } from '@arco-design/web-vue/es/icon';
const props = defineProps<{
    commentList?: any[];
    flowInfo?: any;
}>();
const win = window as any
let token = localStorage.getItem("wornbench_token");
const expandedItems = shallowRef(new Set<string>())

const safeParseJson = (value: any): any => {
    let parsed = value
    for (let index = 0; index < 3 && typeof parsed === 'string'; index += 1) {
        try {
            parsed = JSON.parse(parsed)
        } catch {
            break
        }
    }
    return parsed
}

const isPlugin = (item: any): boolean => item?.classify === 'PLUGIN'

const getPluginData = (item: any): any => {
    const comment = safeParseJson(item?.comment)
    return comment && typeof comment === 'object' ? comment : {}
}

const getPluginStatus = (item: any): number => Number(getPluginData(item).status)

const getPluginParams = (item: any): any[] => {
    const params = safeParseJson(getPluginData(item).requestParams)
    return Array.isArray(params) ? params : []
}

const getPluginResult = (item: any): any => {
    const result = safeParseJson(getPluginData(item).result)
    return result && typeof result === 'object' ? result : {}
}

const getItemTitle = (item: any): string => {
    if (isPlugin(item)) return getPluginData(item).title || '插件节点'
    return item?.comment?.title || ''
}

const getItemKey = (item: any): string => {
    return `${item.recordTime}_${item.comment.executionId || ''}`
}

const toggleExpand = (item: any) => {
    const key = getItemKey(item)
    const newSet = new Set(expandedItems.value)
    if (newSet.has(key)) {
        newSet.delete(key)
    } else {
        newSet.add(key)
    }
    expandedItems.value = newSet
}

const getVisibleOperators = (item: any): any[] => {
    if (!Array.isArray(item.comment.operators)) {
        return []
    }
    const key = getItemKey(item)
    if (expandedItems.value.has(key)) {
        return item.comment.operators
    }
    return item.comment.operators.slice(0, 1)
}



// 判断节点类型
const isCompleted = (item: any): boolean => {
    return ['INPUTTED', 'APPROVED', 'PASSED'].includes(item.classify)
}

const isProcessing = (item: any, index?: number): boolean => {
    if (isPlugin(item)) return false
    // 如果是最后一个节点，也视为进行中
    if (index !== undefined && index === (props.commentList?.length || 0) - 1 && !(item.classify == 'APPROVED' || item.comment?.extra?.approved == 'REJECTS') && item.classify !== 'START' && item.classify !== 'FINISH') {
        return true
    }
    return ['INPUTTING', 'APPROVING', 'APPROVE_EMPTY'].includes(item.classify)
}
const isClose = (item: any): boolean => {
    if (item.classify == 'APPROVED' && item.comment?.extra?.approved == 'REJECTS') {
        return true
    }
}
const isTransfer = (item: any): boolean => {
    return item.classify === 'TRANSFER'
}

const isInputting = (item: any): boolean => {
    return ['INPUTTING', 'INPUTTED'].includes(item.classify)
}

const isNotice = (item: any): boolean => {
    return item.classify === 'NOTICE'
}

// 获取圆点样式类
const getDotClass = (item: any, index?: number): string => {
    if (isPlugin(item)) return getPluginStatus(item) === 1 ? 'dot-plugin-success' : 'dot-plugin-failed'
    if (isProcessing(item, index)) return 'dot-processing'
    if (isTransfer(item)) return 'dot-transfer'
    if (isInputting(item)) return 'dot-inputting'
    if (isNotice(item)) return 'dot-notice'
    if (isClose(item)) return 'dot-close'
    if (isCompleted(item)) return 'dot-completed'
    return 'dot-completed'
}

// 获取卡片样式类
const getCardClass = (item: any, index?: number): string => {
    if (isPlugin(item)) return getPluginStatus(item) === 1 ? 'card-plugin-success' : 'card-plugin-failed'
    if (isCompleted(item)) return 'card-completed'
    if (isProcessing(item, index)) return 'card-processing'
    if (isTransfer(item)) return 'card-transfer'
    if (isInputting(item)) return 'card-inputting'
    if (isNotice(item)) return 'card-notice'
    if (item.classify === 'BACK' || item.classify === 'REJECTED') return 'card-rejected'
    return 'card-default'
}

// 获取状态文本
const getStatusText = (item: any, index: number): string => {
    // 如果是最后一个节点，状态为进行中
    if (index === (props.commentList?.length || 0) - 1 && item.classify !== 'START' && item.classify !== 'FINISH') {
        return '进行中'
    }
    if (isClose(item)) return '已拒绝'
    if (isCompleted(item)) return '已完成'

    if (isProcessing(item)) return '进行中'
    if (item.classify === 'BACK') return '已退回'
    if (item.classify === 'REVOKE') return '已撤回'
    if (isNotice(item)) return '已抄送'
    return '待处理'
}

// 获取状态样式类
const getStatusClass = (item: any, index: number): string => {
    // 如果是最后一个节点，使用进行中的样式
    if (index === (props.commentList?.length || 0) - 1 && item.classify !== 'START' && item.classify !== 'FINISH') {
        return 'status-processing'
    }
    if (isCompleted(item)) return 'status-completed'
    if (isProcessing(item)) return 'status-processing'
    if (item.classify === 'BACK' || item.classify === 'REJECTED') return 'status-rejected'
    if (isNotice(item)) return 'status-notice'
    return 'status-pending'
}

// 格式化时间
const formatTime = (time: string): string => {
    if (!time) return ''
    // 如果已经是完整时间格式，直接返回
    return time
}

// 获取操作文本
const getOperatorAction = (operator: any): string => {
    if (operator.operator === 2) {
        return `转交 => ${operator.delegator || ''}`
    }
    if (operator.operator === 0) return '拒绝'
    if (operator.operator === 1) return '通过'
    return '退回'
}

// 获取自动审批文本
const getAutoOptionText = (autoOption: number): string => {
    const texts: Record<number, string> = {
        0: '自动审批,与流程发起人一致',
        1: '自动审批,审批人处理过该流程',
        2: '自动审批,与上一节点审批人一致'
    }
    return texts[autoOption] || '自动审批'
}

// 解析 JSON 字符串中的 operators
const parseCommentOperators = (commentStr: string): any[] => {
    try {
        const parsed = JSON.parse(commentStr)
        return parsed?.operators || []
    } catch (e) {
        console.error('解析 comment 失败:', e)
        return []
    }
}

// 获取审批意见文本
const getOperatorComment = (operator: any): string => {
    if (operator.reason) return operator.reason
    if (operator.operator === 0) return '拒绝'
    if (operator.operator === 1) return '通过'
    if (operator.operator === 2) return `转交 => ${operator.delegator || ''}`
    return '退回'
}
</script>
<style lang="scss" scoped>
@use "../../styles/textColor.scss" as textColor;

.timeLine {
    // padding: 20px 24px;
}

.timeline-container {
    position: relative;
    padding-left: 32px;
}

.timeline-item {
    position: relative;
    padding-bottom: 24px;

    // 每个节点之间的连接线
    &::before {
        content: '';
        position: absolute;
        left: -21px;
        top: 22px;
        bottom: -14px;
        width: 2px;
        background: #e2e8f0;
    }

    &:first-child::before {
        top: 22px;
    }

    &:last-child {
        padding-bottom: 0;

        // 最后一个节点不显示连接线
        &::before {
            display: none;
        }
    }
}

.timeline-dot {
    position: absolute;
    left: -30px;
    top: 2px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    line-height: 20px;
    z-index: 2;
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.8);
    transition: all 0.3s;

    &.dot-completed {
        background: #22c55e;
        color: white;
        // box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
    }

    &.dot-processing {
        background: rgb(var(--primary-6));
        color: white;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        animation: pulse-dot 2s infinite;
    }

    &.dot-close {
        background: #dc2626;
        color: white;
    }

    &.dot-plugin-success {
        background: #10b981;
        color: white;
    }

    &.dot-plugin-failed {
        background: #ef4444;
        color: white;
    }

    &.dot-transfer {
        background: #a855f7;
        color: white;
        // box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.2);
    }

    &.dot-inputting {
        background: #6366f1;
        color: white;
        // box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }

    &.dot-notice {
        background: #22c55e;
        color: white;
        width: 20px;
        height: 20px;

        .arco-icon {
            font-size: 12px;
            transform: rotate(-45deg);
        }
    }

    &.dot-default {
        background: #f1f5f9;
        color: #94a3b8;
        box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.8);
    }
}

@keyframes pulse-dot {

    0%,
    100% {
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    }

    50% {
        box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.1);
    }
}

.timeline-card {
    border-radius: 12px;
    padding: 12px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        transform: translateX(2px);
    }

    &.card-completed {
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
    }

    &.card-processing {
        background: #eff6ff;
        border: 1px solid #bfdbfe;
    }

    &.card-transfer {
        background: #faf5ff;
        border: 1px solid #e9d5ff;
    }

    &.card-inputting {
        background: #eef2ff;
        border: 1px solid #c7d2fe;
    }

    &.card-notice {
        background: #f0fdfa;
        border: 1px solid #ccfbf1;
    }

    &.card-rejected {
        background: #fef2f2;
        border: 1px solid #fecaca;
    }

    &.card-default {
        background: #f8fafc;
        border: 1px solid #f8fafc;
    }

    &.card-plugin-success {
        background: #ecfeff;
        border: 1px solid #a5f3fc;
    }

    &.card-plugin-failed {
        background: #fff1f2;
        border: 1px solid #fecdd3;
    }
}

.card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 0 8px;
    border: 0 !important;

    .header-left {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .card-title {
        font-size: 14px;
        font-weight: 600;
        color: #1e293b;
    }

    .approve-type-tag {
        padding: 2px 8px;
        background: rgba(168, 85, 247, 0.1);
        color: #a855f7;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 500;
    }

    .plugin-tag {
        padding: 2px 8px;
        border-radius: 4px;
        background: #cffafe;
        color: #0891b2;
        font-size: 11px;
        font-weight: 600;
    }

    .plugin-header-meta {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .plugin-status {
        font-size: 12px;
        font-weight: 600;

        &.is-success { color: #059669; }
        &.is-failed { color: #dc2626; }
    }

    .notice-tag {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        background: rgba(20, 184, 166, 0.1);
        color: #14b8a6;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 500;

        .arco-icon {
            font-size: 12px;
        }
    }

    .card-status {
        font-size: 12px;
        font-weight: 500;

        &.status-completed {
            color: #22c55e;
        }

        &.status-processing {
            color: rgb(var(--primary-6));
        }

        &.status-rejected {
            color: #dc2626;
        }

        &.status-notice {
            color: #14b8a6;
        }

        &.status-pending {
            color: #94a3b8;
        }
    }
}

.card-content {
    .plugin-node-content {
        padding: 12px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.9);
    }

    .plugin-summary-row {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
    }

    .plugin-symbol {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        color: #fff;
        flex: none;

        &.is-success { background: #06b6d4; }
        &.is-failed { background: #ef4444; }
    }

    .plugin-identity {
        display: flex;
        flex-direction: column;
        gap: 3px;
        color: #64748b;
        font-size: 12px;
    }

    .plugin-summary-time {
        margin-left: auto;
        align-self: flex-start;
        padding-top: 2px;
        color: #94a3b8;
        font-size: 12px;
        white-space: nowrap;
    }

    .plugin-name-row {
        display: flex;
        align-items: center;
        gap: 8px;

        strong { color: #1e293b; font-size: 13px; }
    }

    .plugin-version {
        padding: 2px 6px;
        border-radius: 4px;
        background: #ecfeff;
        color: #0891b2;
        font-size: 10px;
    }

    .plugin-detail-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
    }

    .plugin-detail-panel {
        padding: 12px;
        border-radius: 8px;
        background: #f8fafc;

        h4 { margin: 0 0 8px; color: #94a3b8; font-size: 12px; font-weight: 600; }
    }

    .plugin-panel-title span {
        display: inline-block;
        margin-right: 2px;
        color: #94a3b8;
        font-weight: 700;
    }

    .plugin-param-list p {
        display: flex;
        align-items: baseline;
        gap: 6px;
        margin: 6px 0;
        font-size: 12px;
        line-height: 1.45;

        .plugin-param-label { color: #334155; }
        i { color: #94a3b8; font-style: normal; }
        b { color: #2563eb; font-weight: 600; }
        em { color: #94a3b8; font-style: normal; white-space: nowrap; }
    }

    .plugin-result {
        display: flex;
        align-items: center;
        gap: 5px;
        margin: 0 0 6px;
        font-size: 12px;
        font-weight: 600;

        &.is-success { color: #059669; }
        &.is-failed { color: #dc2626; }
    }

    .plugin-extra, .plugin-empty {
        margin: 4px 0 0;
        color: #64748b;
        font-size: 12px;
    }

    .plugin-footer {
        display: flex;
        gap: 12px;
        margin-top: 10px;
        padding-top: 9px;
        border-top: 1px solid #e2e8f0;
        color: #94a3b8;
        font-size: 11px;
    }

    .plugin-retry { color: #dc2626; }

    @media (max-width: 768px) {
        .plugin-detail-grid { grid-template-columns: 1fr; }
        .plugin-summary-row { flex-wrap: wrap; }
        .plugin-summary-time { width: 100%; margin-left: 38px; }
    }

    .multi-operators-list {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .multi-operator-item {
            .operator-item {
                padding: 16px;
                background: white;
                border-radius: 8px;
                margin-bottom: 0;

                .operator-header {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;

                    .operator-icon {
                        width: 24px;
                        height: 24px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 12px;
                        color: white;
                        flex-shrink: 0;
                        background: #22c55e;

                        &.rejected {
                            background: #dc2626;
                        }

                        .arco-icon {
                            font-size: 12px;
                        }
                    }

                    .operator-main {
                        flex: 1;
                        min-width: 0;

                        .operator-info-row {
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            margin-bottom: 8px;
                            flex-wrap: wrap;

                            .operator-name {
                                font-size: 14px;
                                font-weight: 600;
                                color: #1e293b;
                            }

                            .operator-role {
                                font-size: 12px;
                                color: #94a3b8;
                            }

                            .operator-time {
                                margin-left: auto;
                                font-size: 12px;
                                color: #94a3b8;
                            }
                        }

                        .operator-action-text {
                            font-size: 13px;
                            color: #64748b;
                            line-height: 20px;
                            margin-bottom: 6px;
                        }

                        .signature-inline {
                            display: flex;
                            align-items: center;
                            gap: 4px;
                            font-size: 12px;

                            .label {
                                color: #94a3b8;
                            }

                            .signature-text {
                                color: #334155;
                                font-weight: 500;
                            }
                        }
                    }
                }
            }
        }
    }

    .operator-list {
        .operator-item {
            padding: 12px;
            background: white;
            border-radius: 8px;
            margin-bottom: 8px;

            &:last-child {
                margin-bottom: 0;
            }

            // &.approved {
            //     border-left: 3px solid #22c55e;
            // }

            // &.rejected {
            //     border-left: 3px solid #dc2626;
            // }

            .operator-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 8px;

                .operator-avatar {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    color: white;

                    &.avatar-approved {
                        background: #22c55e;
                    }

                    &.avatar-rejected {
                        background: #dc2626;
                    }
                }

                .operator-name {
                    font-size: 13px;
                    font-weight: 500;
                    color: #334155;
                }

                .operator-role {
                    font-size: 12px;
                    color: #94a3b8;
                }

                .operator-time {
                    margin-left: auto;
                    font-size: 12px;
                    color: #94a3b8;
                }
            }

            .operator-body {
                padding-left: 32px;

                .operator-action {
                    font-size: 12px;
                    color: #64748b;
                    line-height: 16px;
                    margin: 0 0 4px 0;
                }

                .auto-option {
                    display: inline-block;
                    padding: 3px 9px;
                    background: rgba(59, 130, 246, 0.1);
                    color: rgb(var(--primary-6));
                    border-radius: 4px;
                    line-height: 16px;
                    font-size: 11px;
                    margin: 4px 0;
                }

                .reason-text {
                    font-size: 12px;
                    color: #64748b;
                    margin: 4px 0;
                    line-height: 16px;

                    .label {
                        color: #94a3b8;
                    }
                }

                .signature-area {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 8px;

                    .label {
                        font-size: 12px;
                        color: #94a3b8;
                    }

                    img {
                        max-height: 20px;
                    }
                }
            }
        }
    }

    .simple-info {
        font-size: 13px;
        color: #64748b;
        padding: 8px 0;
    }

    .notice-card {
        .notice-assignees {
            display: flex;
            flex-direction: column;
            gap: 6px;

            .notice-assignee-item {
                display: flex;
                align-items:center;
                gap: 12px;
                padding: 6px;
                background: rgba(255, 255, 255, 0.7);
                border-radius: 8px;

                .assignee-avatar {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: rgba(20, 184, 166, 0.1);
                    color: #14b8a6;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    flex-shrink: 0;

                    .arco-icon {
                        font-size: 10px;
                    }
                }

                .assignee-info {
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    .assignee-name {
                        font-size: 13px;
                        font-weight: 500;
                        color: #334155;
                        margin-bottom: 4px;
                    }

                    .assignee-status {
                        font-size: 12px;
                        color: #14b8a6;
                        font-weight: 500;
                    }
                }
            }
        }
    }

    .simple-info-section {
        .info-text {
            font-size: 13px;
            color: #64748b;
            margin: 4px 0;
            line-height: 16px;

            &.action-text {
                color: #64748b;
            }

            &.reason-text {
                .label {
                    color: #94a3b8;
                }
            }
        }

        .signature-area {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 8px;

            .label {
                font-size: 12px;
                color: #94a3b8;
            }

            img {
                max-height: 20px;
            }
        }
    }
}

.see-more-wrapper {
    margin: 8px 0 6px;

    .see-more-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px 9px 2px;
        background: rgba(59, 130, 246, 0.12);
        border-radius: 4px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid transparent;
        color: rgb(var(--primary-6));

        &:hover {
            background: rgba(59, 130, 246, 0.2);
            border-color: rgba(59, 130, 246, 0.4);
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
        }

        &:active {
            transform: translateY(0);
        }
    }
}

.expand-btn {
    margin: 8px 0 0;

    .expand-btn-inner {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        background: rgba(250, 173, 20, 0.1);
        color: rgb(250, 173, 20);
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid transparent;

        &:hover {
            background: rgba(250, 173, 20, 0.18);
            border-color: rgba(250, 173, 20, 0.4);
            transform: translateY(-1px);
        }

        &:active {
            transform: translateY(0);
        }
    }
}

.text-status {
    color: rgb(156, 163, 175);
    font-size: 12px;
}

.infos-text {
    color: rgb(107, 114, 128);
    padding: 0;
    margin: 0;
    font-size: 12px;
}

.green {
    color: rgb(250, 173, 20);
}

.red {
    color: #F26161;
}
</style>
