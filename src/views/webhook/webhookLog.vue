<template>
    <div class="webhook-log-container">
        <div class="ops-table-wrap log-table">
            <a-table :columns="columns" :bordered="false" :data="tableData" :scroll="scroll" :pagination="false"
                class="ops-data-table">
                <template #serial="{ rowIndex }">
                    <span class="cell-index">{{ rowIndex + 1 }}</span>
                </template>
                <template #appName="{ record }">
                    <span class="ops-cell-app-name">{{ getAppName(record) }}</span>
                </template>
                <template #triggerEvent="{ record }">
                    <span class="ops-event-badge">{{ getTriggerEventText(record.pushEvent) }}</span>
                </template>
                <template #developer="{ record }">
                    <span>{{ record.developer || '--' }}</span>
                </template>
                <template #targetUrl="{ record }">
                    <span class="ops-cell-url">{{ getTargetUrl(record) }}</span>
                </template>
                <template #pushTime="{ record }">
                    <span class="cell-muted">{{ record.pushTime || '--' }}</span>
                </template>
                <template #responseStatus="{ record }">
                    <span :class="['ops-status-tag', getResponseStatusClass(record)]">
                        {{ getResponseStatusText(record) }}
                    </span>
                </template>
                <template #duration="{ record }">
                    <span :class="['ops-cell-duration', getDurationClass(record)]">
                        {{ formatDuration(record) }}
                    </span>
                </template>
                <template #retryCount="{ record }">
                    <span :class="getRetryCountClass(record)">{{ formatRetryCount(record) }}</span>
                </template>
                <template #action="{ record }">
                    <div class="ops-action-group">
                        <button type="button" class="ops-action-btn ops-action-btn--primary"
                            @click="handleViewDetail(record)">
                            查看详情
                        </button>
                        <button v-if="canManualRetry(record)" type="button" class="ops-action-btn ops-action-btn--warn"
                            @click="handleRePush(record)">
                            手动重试
                        </button>
                        <button v-if="isRetrying(record)" type="button" class="ops-action-btn"
                            @click="handleCancel(record)">
                            取消
                        </button>
                    </div>
                </template>
            </a-table>
        </div>

        <div class="ops-pagination person-page">
            <PersonPagination :total="pagination.total" :current="pagination.current" :page-size="pagination.pageSize"
                :showJump="false" :showPageSize="false" @change="handlePageChange"
                @page-size-change="onPageSizeChange" />
        </div>

        <a-modal v-model:visible="detailVisible" title="Webhook推送详情" :width="600" :footer="false" unmount-on-close
            class="ops-detail-modal" @cancel="detailVisible = false">
            <template v-if="currentDetail">
                <div class="ops-detail-summary">
                    <div>
                        <span class="label">应用：</span>
                        <span class="value">{{ getAppName(currentDetail) }}</span>
                    </div>
                    <div>
                        <span class="label">开发者：</span>
                        <span class="value">{{ currentDetail.developer || '--' }}</span>
                    </div>
                    <div>
                        <span class="label">事件：</span>
                        <span class="value">{{ getTriggerEventText(currentDetail.pushEvent) }}</span>
                    </div>
                    <div>
                        <span class="label">推送时间：</span>
                        <span class="value-normal">{{ currentDetail.pushTime || '--' }}</span>
                    </div>
                    <div>
                        <span class="label">响应状态：</span>
                        <span :class="['ops-status-tag', getResponseStatusClass(currentDetail)]">
                            {{ getResponseStatusText(currentDetail) }}
                        </span>
                    </div>
                    <div>
                        <span class="label">耗时：</span>
                        <span :class="getDurationClass(currentDetail)">{{ formatDuration(currentDetail) }}</span>
                    </div>
                    <div>
                        <span class="label">重试次数：</span>
                        <span class="value-normal">{{ formatRetryCount(currentDetail) }}</span>
                    </div>
                </div>

                <div class="ops-detail-block">
                    <label class="ops-detail-section-title">请求 Payload</label>
                    <div class="ops-log-panel" style="max-height: 150px">
                        <pre>{{ formatRequestPayload(currentDetail) }}</pre>
                    </div>
                </div>

                <div class="ops-detail-block" style="margin-top: 16px">
                    <label class="ops-detail-section-title">响应 Body</label>
                    <div class="ops-log-panel" style="max-height: 120px">
                        <pre>{{ formatResponseBody(currentDetail) }}</pre>
                    </div>
                </div>
            </template>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { webhooklogPageRecord, webhooklogDes, rePushWebhook } from '@/api/webHook/index';
import { Message, Modal } from '@arco-design/web-vue';
import PersonPagination from '@/views/user/components/PersonPagination.vue';

const scroll = { maxHeight: 'calc(100vh - 374px)' };

const props = defineProps<{
    filterData?: Record<string, any>;
    selectedAppId?: string | number;
    appNameMap?: Record<string, string>;
}>();

const emit = defineEmits<{
    loaded: [payload: { total: number; records: any[] }];
}>();

const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
});

const columns = [
    { slotName: 'serial', title: '序号', width: 60 },
    { slotName: 'appName', title: '应用名称', dataIndex: 'appName', width: 120 },
    { slotName: 'triggerEvent', title: '事件类型', dataIndex: 'pushEvent', width: 110 },
    { slotName: 'developer', title: '开发者', dataIndex: 'developer', width: 90 },
    { slotName: 'targetUrl', title: '目标URL', dataIndex: 'targetUrl', width: 140, ellipsis: true, tooltip: true },
    { slotName: 'pushTime', title: '推送时间', dataIndex: 'pushTime', width: 170 },
    { slotName: 'responseStatus', title: '响应状态', dataIndex: 'pushStatus', width: 150 },
    { slotName: 'duration', title: '耗时', dataIndex: 'responseTime', width: 100 },
    { slotName: 'retryCount', title: '重试次数', dataIndex: 'retryCount', width: 90 },
    { slotName: 'action', title: '操作', dataIndex: 'action', width: 160, align: 'left' as const },
];

const tableData = ref<any[]>([]);
const detailVisible = ref(false);
const currentDetail = ref<any>(null);

const EVENT_MAP: Record<string, string> = {
    '1': '数据新增',
    '2': '数据修改',
    '3': '数据删除',
    '4': '流程发起',
    '5': '流程完结',
    '6': '节点审批',
    '7': '节点填写',
    '8': '节点抄送',
};

const getTriggerEventText = (event: string | number) => {
    const key = String(event ?? '');
    return EVENT_MAP[key] || key || '--';
};

const getAppName = (record: any) => {
    if (record?.appName) return record.appName;
    const appId = record?.appId ?? record?.appIds;
    if (appId != null && props.appNameMap) {
        return props.appNameMap[String(appId)] || String(appId);
    }
    return '--';
};

const getTargetUrl = (record: any) =>
    record?.targetUrl || record?.pushUrl || record?.webhookUrl || record?.url || '--';

const getDurationMs = (record: any) => {
    const n = Number(record?.responseTime ?? 0);
    return Number.isNaN(n) ? null : n;
};

const isRetrying = (record: any) =>
    record?.pushStatus === 2 || record?.retrying === true || record?.pushStatus === 'retrying';

const isSuccess = (record: any) => record?.pushStatus === 1;

const isFail = (record: any) => !isSuccess(record) && !isRetrying(record);

const getResponseStatusText = (record: any) => {
    if (isRetrying(record)) return '重试中';
    if (record?.responseStatus) return String(record.responseStatus);
    if (record?.httpStatus) return String(record.httpStatus);
    if (isSuccess(record)) return record?.statusCode ? `${record.statusCode} OK` : '200 OK';
    if (record?.failMsg) {
        const match = String(record.failMsg).match(/\b\d{3}\b/);
        if (match) return `${match[0]} Bad Gateway`;
    }
    return '502 Bad Gateway';
};

const getResponseStatusClass = (record: any) => {
    if (isRetrying(record)) return 'ops-status-tag--running';
    if (isSuccess(record)) return 'ops-status-tag--success';
    return 'ops-status-tag--fail';
};

const formatDuration = (record: any) => {
    if (isRetrying(record)) return '--';
    const ms = getDurationMs(record);
    if (ms == null) return '--';
    return `${ms}ms`;
};

const getDurationClass = (record: any) => {
    if (isRetrying(record)) return 'ops-cell-duration--pending';
    if (isSuccess(record)) return 'ops-cell-duration--success';
    if (isFail(record)) return 'ops-cell-duration--fail';
    return '';
};

const getRetryTimes = (record: any) => {
    const count = record?.retryCount ?? record?.retryTimes ?? record?.retryNum;
    if (count == null || count === '') return 0;
    return Number(count) || 0;
};

const getRetryMax = (record: any) => {
    const max = record?.retryMax ?? record?.maxRetry ?? 3;
    return Number(max) || 3;
};

const formatRetryCount = (record: any) => {
    const current = getRetryTimes(record);
    const max = getRetryMax(record);
    if (isRetrying(record) || (isFail(record) && current > 0)) {
        return `${current}/${max}`;
    }
    return String(current);
};

const getRetryCountClass = (record: any) => {
    const current = getRetryTimes(record);
    if (isRetrying(record)) return 'ops-cell-retry--warn';
    if (isFail(record) && current > 0) return 'ops-cell-retry--fail';
    return 'ops-cell-retry';
};

const canManualRetry = (record: any) => isFail(record) && !isRetrying(record);

const parseJsonSafe = (value: any) => {
    if (value == null || value === '') return null;
    if (typeof value === 'object') return value;
    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
};

const formatRequestPayload = (record: any) => {
    const url = getTargetUrl(record);
    const parsed = parseJsonSafe(record?.pushContext);
    const method = record?.httpMethod || 'POST';
    const path = record?.requestPath || (url !== '--' ? url : '/webhook');
    let body = '';
    if (parsed != null) {
        body =
            typeof parsed === 'string'
                ? parsed
                : JSON.stringify(parsed, null, 2);
    }
    return body ? `${method} ${path}\n${body}` : `${method} ${path}`;
};

const formatResponseBody = (record: any) => {
    if (record?.responseBody) {
        const parsed = parseJsonSafe(record.responseBody);
        const body =
            typeof parsed === 'string'
                ? parsed
                : JSON.stringify(parsed, null, 2);
        const status = isSuccess(record) ? 'HTTP 200' : 'HTTP Error';
        return `${status}\n${body}`;
    }
    if (isSuccess(record)) {
        return 'HTTP 200\n{ "code": 0, "message": "success" }';
    }
    if (record?.failMsg) {
        return `HTTP Error\n${record.failMsg}`;
    }
    return 'HTTP Error\n--';
};

const loadLogList = () => {
    const params: any = {
        current: pagination.current,
        size: pagination.pageSize,
    };
    if (props.selectedAppId) {
        params.appIds = props.selectedAppId;
    }
    if (props.filterData?.developerId) {
        params.developerId = props.filterData.developerId;
    }
    if (props.filterData?.pushEvent) {
        params.pushEvent = props.filterData.pushEvent;
    }
    if (props.filterData?.pushStatus !== undefined && props.filterData?.pushStatus !== '') {
        params.pushStatus = props.filterData.pushStatus;
    }

    webhooklogPageRecord(params)
        .then((res: any) => {
            const records = res.records || res.data || [];
            tableData.value = records;
            pagination.total = res.total || 0;
            emit('loaded', { total: pagination.total, records });
        })
        .catch((error) => {
            console.error('加载日志列表失败:', error);
        });
};

const handleSearch = () => {
    pagination.current = 1;
    loadLogList();
};

const handlePageChange = (page: number) => {
    pagination.current = page;
    loadLogList();
};

const onPageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.current = 1;
    loadLogList();
};

const handleRePush = async (record: any) => {
    Modal.confirm({
        title: '提示',
        simple: true,
        renderToBody: false,
        titleAlign: 'start',
        content: '确定要手动重试这条推送吗？',
        hideCancel: false,
        okText: '确认',
        onOk: async () => {
            try {
                await rePushWebhook(record.id);
                Message.success('已发起手动重试');
                loadLogList();
            } catch (error) {
                console.error('操作失败:', error);
            }
        },
    });
};

const handleCancel = (record: any) => {
    Modal.confirm({
        title: '提示',
        simple: true,
        renderToBody: false,
        titleAlign: 'start',
        content: '确定要取消当前推送吗？',
        hideCancel: false,
        okText: '确认',
        onOk: () => {
            Message.info('已取消推送');
            loadLogList();
        },
    });
};

const handleViewDetail = async (record: any) => {
    try {
        const res = await webhooklogDes(record.id);
        currentDetail.value = res.data || res;
        currentDetail.value.developer = record?.developer || '--';
        detailVisible.value = true;
    } catch (error) {
        console.error('获取详情失败:', error);
    }
};

onMounted(() => {
    // 由父组件 index 触发首次查询
});

defineExpose({ handleSearch });
</script>

<style lang="scss" scoped>
.cell-index {
    color: #94a3b8;
}

.cell-muted {
    color: #64748b;
}

.ops-detail-block {
    margin-bottom: 0;
}

.ops-detail-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 24px;
}
</style>
