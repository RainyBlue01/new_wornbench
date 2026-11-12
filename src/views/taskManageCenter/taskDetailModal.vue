<template>
    <a-modal
        v-model:visible="visible"
        title="任务详情"
        :width="760"
        :footer="false"
        title-align="start"
        unmount-on-close
        class="task-detail-modal"
        @cancel="handleClose"
    >
        <div class="task-detail-modal__info">
            <div class="info-grid">
                <div class="info-row">
                    <span class="info-label">任务名称：</span>
                    <span class="info-value info-value--bold">{{ taskRecord?.taskName || '--' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">关联表单：</span>
                    <span class="info-value">{{ taskRecord?.appName || categoryLabel(taskRecord?.category) || '--' }}</span>
                </div>
                    <div class="info-row">
                    <span class="info-label">状态：</span>
                    <span :class="['task-status-tag', getTaskStatusClass(taskRecord?.taskStatus)]">
                        {{ taskStatusLabel(taskRecord?.taskStatus) }}
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">执行周期：</span>
                    <span class="cron-badge"><icon-sync />{{ taskRecord?.cycle || '--' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">任务周期：</span>
                    <span class="info-value">{{ formatTaskPeriod(taskRecord) }}</span>
                </div>
                 <div class="info-row">
                    <span class="info-label">任务生成时间：</span>
                    <span class="info-value">{{ taskRecord.publishTime }}</span>
                </div>
            
                <div class="info-row">
                    <span class="info-label">发起人：</span>
                    <span class="info-value">{{ taskRecord?.startUser || taskRecord?.creator || '--' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">发布部门：</span>
                    <span class="info-value">{{ formatPublisher(taskRecord) }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">监督人：</span>
                    <span class="info-value">{{ formatSupervisor(taskRecord) }}</span>
                </div>
            </div>

            <!-- 推送范围 -->
            <div class="push-range-section" v-if="hasPushRange">
                <div class="section-label">推送范围</div>
                <div class="push-tags">
                    <span
                        v-for="(tag, index) in pushRangeTags"
                        :key="`${tag.type}-${tag.name}-${index}`"
                        class="push-tag"
                    >
                        {{ tag.name }}
                    </span>
                    <span v-if="pushRangeTotal != null" class="push-tag push-tag--count">
                        {{ pushRangeTotal.toLocaleString() }}人
                    </span>
                </div>
            </div>
        </div>

        <div class="task-detail-modal__section">
            <div class="section-title">批次列表</div>
            <div class="table-wrap">
                <a-table
                    :data="batchList"
                    :loading="batchLoading"
                    :pagination="false"
                    :bordered="false"
                    row-key="batchId"
                    class="task-batch-table"
                    size="small"
                >
                    <template #columns>
                        <a-table-column title="序号" align="center" :width="60">
                            <template #cell="{ rowIndex }">
                                <span class="cell-index">{{ rowIndex + 1 }}</span>
                            </template>
                        </a-table-column>
                        <a-table-column title="批次" :width="90">
                            <template #cell="{ record }">
                                <span class="batch-id">#{{ record.batchDate || record.batchId }}</span>
                            </template>
                        </a-table-column>
                        <a-table-column title="填报时间" >
                            <template #cell="{ record }">
                                <span class="cell-muted">{{ record.fillStartTime }} ~ {{ record.fillStopTime }}</span>
                            </template>
                        </a-table-column>
                        <a-table-column title="应填报人数" align="center" :width="110">
                            <template #cell="{ record }">
                                <span class="cell-text">{{ record.fillTotal }}人</span>
                            </template>
                        </a-table-column>
                        <a-table-column title="填报状态" align="center" :width="90">
                            <template #cell="{ record }">
                                <span
                                    :class="[
                                        'task-status-tag',
                                        record.batchState === 1 ? 'task-status-tag--running' : 'task-status-tag--ended',
                                    ]"
                                >
                                    {{ record.batchState === 1 ? '进行中' : '已结束' }}
                                </span>
                            </template>
                        </a-table-column>
                        <a-table-column title="填报进度" :width="160">
                            <template #cell="{ record }">
                                <div class="progress-cell">
                                    <div class="progress-bar">
                                        <div
                                            class="progress-bar__fill"
                                            :class="record.batchState === 1 ? 'progress-bar__fill--active' : ''"
                                            :style="{ width: getProgressPercent(record) + '%' }"
                                        />
                                    </div>
                                    <span
                                        class="progress-text"
                                        :class="record.batchState === 1 ? 'progress-text--active' : ''"
                                    >
                                        {{ getProgressPercent(record) }}%
                                    </span>
                                </div>
                            </template>
                        </a-table-column>
                        <a-table-column title="操作" align="center" :width="100">
                            <template #cell="{ record }">
                                <button type="button" class="action-btn action-btn--primary" @click="emitDetail(record)">
                                    填报详情
                                </button>
                            </template>
                        </a-table-column>
                    </template>
                </a-table>
            </div>
        </div>

        <!-- <div class="task-detail-modal__footer">
            <button type="button" class="btn-ghost-sm" @click="handleClose">关闭</button>
        </div> -->
    </a-modal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import { getFillTaskDetail, getTaskBatchList } from '@/api/taskFillManager/index';

const router = useRouter();
const emit = defineEmits<{ (e: 'detail', record: any): void }>();

const visible = ref(false);
const batchLoading = ref(false);
const taskRecord = ref<any>(null);
const batchList = ref<any[]>([]);

interface PushRangeItem {
    id?: string | number;
    name?: string;
    label?: string;
    deptName?: string;
    postName?: string;
    roleName?: string;
    nickname?: string;
}

interface PushRangeTag {
    type: 'dept' | 'post' | 'role' | 'user' | 'all';
    name: string;
}

const getRangeItemName = (item: PushRangeItem) =>
    item?.name ||
    item?.label ||
    item?.deptName ||
    item?.postName ||
    item?.roleName ||
    item?.nickname ||
    '--';

const collectRangeTags = (
    list: PushRangeItem[] | null | undefined,
    type: PushRangeTag['type'],
): PushRangeTag[] =>
    (list || []).map((item) => ({
        type,
        name: getRangeItemName(item),
    }));

const pushRangeTags = computed<PushRangeTag[]>(() => {
    const range = taskRecord.value?.objectRange;
    if (!range) return [];

    return [
        ...collectRangeTags(range.deptList, 'dept'),
        ...collectRangeTags(range.postList, 'post'),
        ...collectRangeTags(range.roleList, 'role'),
        ...collectRangeTags(range.userList, 'user'),
        ...collectRangeTags(range.allList, 'all'),
        ...collectRangeTags(taskRecord.value?.allList, 'all'),
    ];
});

const pushRangeTotal = computed<number | null>(() => {
    const total = taskRecord.value?.objectTotal ?? taskRecord.value?.fillObjectTotal;
    if (total == null || total === '') return null;
    const num = Number(total);
    return Number.isNaN(num) ? null : num;
});

const hasPushRange = computed(
    () => pushRangeTags.value.length > 0 || pushRangeTotal.value != null,
);

const taskStatusDict: Record<string, string> = {
    '1': '进行中',
    '2': '暂停中',
    '3': '已结束',
};

const categoryDict: Record<number, string> = {
    1: '表单',
    2: '流程表单',
    3: '报表',
};

const categoryLabel = (category?: number) =>
    category != null ? categoryDict[category] || '--' : '--';

const formatTaskPeriod = (record: any) => {
    if (record?.startDate && record?.stopDate) {
        return `${record.startDate} ~ ${record.stopDate}`;
    }
    return '--';
};

const formatPublisher = (record: any) =>
    (record?.publisher || []).map((item: any) => item.deptName || item.label).join('、') || '--';

const formatSupervisor = (record: any) =>
    (record?.supervisor || []).map((item: any) => item.nickname).join('、') || '--';

const taskStatusLabel = (status: string | number) => taskStatusDict[String(status)] || '--';

const getTaskStatusClass = (status: string | number) => {
    const key = String(status);
    if (key === '1') return 'task-status-tag--running';
    if (key === '2') return 'task-status-tag--warn';
    return 'task-status-tag--ended';
};

const getProgressPercent = (record: any) => {
    if (record?.fillRate != null && record.fillRate !== '') {
        const rate = Number(record.fillRate);
        if (!Number.isNaN(rate)) {
            return rate <= 1 ? Number((rate * 100).toFixed(1)) : Number(rate.toFixed(1));
        }
    }
    const total = Number(record?.fillTotal) || 0;
    const finish = Number(record?.finishTotal) || 0;
    if (!total) return 0;
    return Number(((finish / total) * 100).toFixed(1));
};

const normalizeTaskDetail = (detail: any, fallback: any) => ({
    ...fallback,
    ...detail,
    id: detail?.taskId ?? fallback?.id,
    taskName: detail?.taskName ?? fallback?.taskName,
    taskStatus: detail?.taskStatus ?? fallback?.taskStatus,
    startUser: detail?.startUser ?? fallback?.startUser ?? fallback?.creator,
    publisher: detail?.publisher ?? fallback?.publisher,
    supervisor: detail?.supervisor ?? fallback?.supervisor,
    category: detail?.category ?? fallback?.category,
    appId: detail?.appId ?? fallback?.appId,
    appName: fallback?.appName,
    cycle: fallback?.cycle,
    startDate: fallback?.startDate,
    stopDate: fallback?.stopDate,
});

const resolveTaskDetail = (res: any, fallback: any) => {
    const data = res?.data ?? res;
    if (Array.isArray(data)) {
        return data.length ? normalizeTaskDetail(data[0], fallback) : fallback;
    }
    if (data && typeof data === 'object') {
        return normalizeTaskDetail(data, fallback);
    }
    return fallback;
};

const showModal = (record: any) => {
    visible.value = true;
    batchLoading.value = true;
    taskRecord.value = { ...record };
    batchList.value = [];

    Promise.all([
        getFillTaskDetail(record.id),
        getTaskBatchList(record.id, {}),
    ])
        .then(([detailRes, batchRes]) => {
            taskRecord.value = resolveTaskDetail(detailRes, record);
            batchList.value = batchRes || [];
        })
        .catch(() => {
            Message.error('获取任务详情失败');
        })
        .finally(() => {
            batchLoading.value = false;
        });
};

const emitDetail = (batch: any) => {
    router.push({
        path: '/taskManageCenter/fillDetail',
        query: {
            from: 'taskManage',
            batchId: batch.batchId,
            taskId: taskRecord.value?.id || batch.taskId,
            taskName: taskRecord.value?.taskName || batch.taskName,
            batchDate: batch.batchDate,
            batchState: batch.batchState,
            fillStartTime: batch.fillStartTime,
            fillStopTime: batch.fillStopTime,
            fillTotal: batch.fillTotal,
            finishTotal: batch.finishTotal,
            appId: batch.appId || taskRecord.value?.appId,
            category: batch.category || taskRecord.value?.category,
        },
    });
};

const handleClose = () => {
    visible.value = false;
};

defineExpose({ showModal });
</script>

<style scoped lang="scss">
.task-detail-modal {
    :deep(.arco-modal-header) {
        padding: 20px 28px 16px;
        border-bottom: 1px solid #f1f5f9;
    }

    :deep(.arco-modal-body) {
        padding: 20px 28px;
    }

    &__info {
        margin-bottom: 20px;
    }

    &__section {
        margin-bottom: 8px;
    }

    &__footer {
        display: flex;
        justify-content: flex-end;
        margin-top: 24px;
        padding-top: 16px;
    }
}

// 信息网格布局
.info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px 24px;
    font-size: 13px;
    margin-bottom: 16px;
}

.info-row {
    display: flex;
    align-items: center;
    gap: 8px;
    line-height: 1.6;
}

.info-label {
    color: #94a3b8;
    font-size: 13px;
    flex-shrink: 0;
}

.info-value {
    color: #334155;
    font-size: 13px;

    &--bold {
        font-weight: 600;
        color: #1e293b;
    }
}

// Cron 徽章样式
.cron-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    background: #f3e8ff;
    color: #7c3aed;
}

// 推送范围区域
.push-range-section {
  //  margin-top: 16px;
}

.section-label {
    font-size: 13px;
    font-weight: 500;
    color: #475569;
    margin-bottom: 8px;
}

.push-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.push-tag {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    border-radius: 6px;
    font-size: 12px;
    color: #475569;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;

    &--count {
        color: #64748b;
        background: #fff;
    }
}

// 区块标题
.section-title {
    font-size: 13px;
    font-weight: 600;
    color: #475569;
    margin-bottom: 12px;
}

// 表格容器


// 表格样式优化
.task-batch-table {
    :deep(.arco-table-th) {
        background: #f8fafc !important;
        color: #475569;
        font-size: 12px;
        font-weight: 600;
    }

    :deep(.arco-table-td) {
        font-size: 12px;
        color: #334155;
        border-bottom: 1px solid #f1f5f9;
    }

    :deep(.arco-table-tr:hover .arco-table-td) {
        background: #f8fafc;
    }
}

// 序号样式
.cell-index {
    color: #94a3b8;
    font-size: 12px;
}

// 批次ID样式
.batch-id {
    font-family: ui-monospace, 'Consolas', monospace;
    font-size: 12px;
    color: #64748b;
}

// 普通文本样式
.cell-muted {
    color: #64748b;
    font-size: 12px;
}

.cell-text {
    color: #334155;
    font-size: 12px;
}

// 状态标签样式
.task-status-tag {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;

    &--running {
        background: #dcfce7;
        color: #16a34a;
    }

    &--warn {
        background: #fff7ed;
        color: #ea580c;
    }

    &--ended {
        background: #f1f5f9;
        color: #64748b;
    }
}

// 进度条样式
.progress-cell {
    display: flex;
    align-items: center;
    gap: 8px;
}

.progress-bar {
    width: 60px;
    height: 6px;
    background: #f1f5f9;
    border-radius: 3px;
    overflow: hidden;
    flex-shrink: 0;

    &__fill {
        height: 100%;
        border-radius: 3px;
        background: #94a3b8;
        transition: width 0.3s ease;

        &--active {
            background: #22c55e;
        }
    }
}

.progress-text {
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    white-space: nowrap;

    &--active {
        color: #16a34a;
    }
}

// 操作按钮样式
.action-btn {
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    background: transparent;
    transition: all 0.15s;
    font-family: inherit;
    white-space: nowrap;

    &--primary {
        color: #2563eb;

        &:hover {
            background: #eff6ff;
        }

        &:active {
            background: #dbeafe;
        }
    }
}

// 底部关闭按钮
.btn-ghost-sm {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 9px 18px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    color: #64748b;
    font-family: inherit;
    transition: all 0.15s;

    &:hover {
        background: #f1f5f9;
        color: #334155;
        border-color: #cbd5e1;
    }

    &:active {
        background: #e2e8f0;
    }
}
</style>
