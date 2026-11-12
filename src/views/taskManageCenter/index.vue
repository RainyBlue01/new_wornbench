<template>
    <div class="ops-page task-page">
        <UserBanner url="/homepage" title="任务管理" active="3" />

        <div class="ops-main task-page-main">
            <div class="ops-stat-grid">
                <div class="ops-stat-card ops-stat-card--blue">
                    <div class="ops-stat-card__body">
                        <div class="stat-label">进行中的填报任务总数</div>
                        <div class="stat-number">{{ taskInfo.ongoingTotal }}</div>
                    </div>
                    <div class="stat-icon" style="background:#eff6ff;color:rgb(var(--primary-6));"><i
                            class="fas fa-tasks"></i></div>
                </div>
                <div class="ops-stat-card ops-stat-card--green">
                    <div class="ops-stat-card__body">
                        <div class="stat-label">进行中的填报任务总批次</div>
                        <div class="stat-number">{{ taskBatch.ongoingTotal }}</div>
                    </div>
                    <div class="stat-icon" style="background:#f0fdf4;color:#22c55e;"><i class="fas fa-play"></i></div>
                </div>
                <div class="ops-stat-card ops-stat-card--gray">
                    <div class="ops-stat-card__body">
                        <div class="stat-label">已结束的填报任务总数</div>
                        <div class="stat-number">{{ taskInfo.finishTotal }}</div>
                    </div>
                    <div class="stat-icon" style="background:#f1f5f9;color:#94a3b8;"><i class="fas fa-check-circle"></i>
                    </div>
                </div>
                <div class="ops-stat-card ops-stat-card--gray">
                    <div class="ops-stat-card__body">
                        <div class="stat-label">已结束的填报任务总批次</div>
                        <div class="stat-number">{{ taskBatch.finishTotal }}</div>
                    </div>
                    <div class="stat-icon" style="background:#f1f5f9;color:#94a3b8;"><i class="fas fa-archive"></i>
                    </div>
                </div>
            </div>

            <p class="ops-hint task-hint">
                <icon-info-circle />
                填报任务下的全部批次结束，该任务才算结束。
            </p>

            <div class="ops-card task-card">
                <div class="ops-card-header task-card__header">
                    <div class="ops-card-header-left task-card__header-left">
                        <h3 class="ops-card-title task-card__title">填报任务列表</h3>
                        <div class="task-tab-nav">
                            <button type="button"
                                :class="['ops-nav-btn', { 'ops-nav-btn--active': fillTaskStateVal === 'tab1' }]"
                                @click="switchTaskTab('tab1')">
                                进行中的填报任务
                            </button>
                            <button type="button"
                                :class="['ops-nav-btn', { 'ops-nav-btn--active': fillTaskStateVal === 'tab3' }]"
                                @click="switchTaskTab('tab3')">
                                已结束的填报任务
                            </button>
                        </div>
                    </div>
                    <div class="ops-card-header-right task-card__header-right">
                        <a-input v-model="searchTaskName" class="rounded-input"
                            :style="{ width: '200px', borderRadius: '12px' }" placeholder="搜索填报任务..." allow-clear
                            @press-enter="refreshTaskList" @clear="refreshTaskList">
                            <template #prefix><icon-search /></template>
                        </a-input>
                        <!-- <button type="button" class="ops-btn-ghost-sm btn-ghost-sm" @click="goToTaskChartCenter">
                            <icon-bar-chart />
                            填报任务统计
                        </button> -->
                    </div>
                </div>

                <div class="ops-card-body task-card__body">
                    <div class="ops-table-wrap table-wrap">
                        <a-table :data="tableData" :loading="tableLoading" :pagination="false" :bordered="false"
                            row-key="id" :scroll="scroll" class="ops-data-table task-data-table">
                            <template #columns>
                                <a-table-column title="序号" align="center" :width="64">
                                    <template #cell="{ rowIndex }">
                                        {{ rowIndex + 1 }}
                                    </template>
                                </a-table-column>
                                <a-table-column title="任务名称" data-index="taskName" :min-width="160">
                                    <template #cell="{ record }">
                                        <span class="task-name">{{ record.taskName }}</span>
                                    </template>
                                </a-table-column>
                                <a-table-column title="发布部门" :width="140">
                                    <template #cell="{ record }">
                                        <span class="cell-muted">{{ formatPublisher(record) }}</span>
                                    </template>
                                </a-table-column>
                                <a-table-column title="监督人员" :width="140">
                                    <template #cell="{ record }">
                                        <span class="cell-muted">{{ formatSupervisor(record) }}</span>
                                    </template>
                                </a-table-column>
                                <a-table-column title="任务状态" align="center" :width="90">
                                    <template #cell="{ record }">
                                        <span :class="['ops-status-tag', getTaskStatusClass(record.taskStatus)]">
                                            {{ taskStatusDict[record.taskStatus] }}
                                        </span>
                                    </template>
                                </a-table-column>
                                <a-table-column title="任务频次" data-index="cycle" align="center" :width="100">
                                    <template #cell="{ record }">
                                        <span class="ops-cycle-badge">{{ record.cycle }}</span>
                                    </template>
                                </a-table-column>
                                <a-table-column title="任务周期" :width="210">
                                    <template #cell="{ record }">
                                        <span class="cell-muted">{{ record.startDate }} ~ {{ record.stopDate }}</span>
                                    </template>
                                </a-table-column>
                                <a-table-column title="任务生成时间" :width="110">
                                    <template #cell="{ record }">
                                        <span class="cell-muted">{{ record.publishTime }}</span>
                                    </template>
                                </a-table-column>
                                <a-table-column title="操作" align="center"
                                    :width="fillTaskStateVal === 'tab1' ? 240 : 120">
                                    <template #cell="{ record }">
                                        <div class="action-group" v-if="fillTaskStateVal === 'tab1'">
                                            <button type="button" class="ops-action-btn ops-action-btn--warn"
                                                @click="handleModifyCommand('5', record)">
                                                {{ record.taskStatus === 1 ? '暂停' : '恢复' }}
                                            </button>
                                            <button type="button" class="ops-action-btn ops-action-btn--danger"
                                                @click="handleModifyCommand('6', record)">
                                                结束
                                            </button>
                                            <button type="button" class="ops-action-btn ops-action-btn--primary"
                                                @click="openTaskManage(record)">
                                                管理
                                            </button>
                                            <button type="button" class="ops-action-btn"
                                                @click="openTaskDetail(record)">
                                                批次
                                            </button>
                                        </div>
                                        <div class="action-group" v-else>
                                            <button type="button" class="ops-action-btn"
                                                @click="openTaskDetail(record)">
                                                批次
                                            </button>
                                            <button type="button" class="ops-action-btn ops-action-btn--danger"
                                                @click="handleModifyCommand('7', record)">
                                                注销
                                            </button>
                                        </div>

                                    </template>
                                </a-table-column>
                            </template>
                        </a-table>
                    </div>
                    <div class="ops-pagination person-page">
                        <PersonPagination :total="pagination.total" :current="pagination.current"
                            :page-size="pagination.pageSize" :showJump="false" :showPageSize="false"
                            @change="onPageChange" @page-size-change="onPageSizeChange" />
                    </div>
                    <!-- <p class="task-publish-hint">任务发布，请在应用中发布</p> -->
                </div>
            </div>
        </div>

        <ModifyModal ref="modifyModalRef" @refresh="getTaskList" />
        <TaskDetailModal ref="taskDetailModalRef" @detail="handleDetailCommand" />
        <BatchDetailModal ref="batchDetailModalRef" @view="handleViewData" />
        <upDateData ref="upDateDataRef" />
    </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Message, Modal } from '@arco-design/web-vue';
import dayjs from 'dayjs';
import {
    continueTask,
    getFillTaskList,
    modifyTaskStatus,
    revokeTask,
} from '@/api/taskFillManager/index.js';
import { statisticTaskBatch, statisticTaskInfo } from '@/api/taskChartCenter';
import UserBanner from '@/components/banner/userBanner.vue';
import ModifyModal from '@/views/taskManageCenter/modifyModal.vue';
import TaskDetailModal from '@/views/taskManageCenter/taskDetailModal.vue';
import BatchDetailModal from '@/views/taskManageCenter/batchDetailModal.vue';
import upDateData from '../application/original/upDateData.vue';
import PersonPagination from '@/views/user/components/PersonPagination.vue';

const router = useRouter();
const scroll = { x: '100%', maxHeight: 'calc(100vh - 402px)' };

const fillTaskStateVal = ref('tab1');
const tableData = ref([]);
const searchTaskName = ref('');
const tableLoading = ref(false);

const taskInfo = ref({
    ongoingTotal: 0,
    finishTotal: 0,
});
const taskBatch = ref({
    ongoingTotal: 0,
    finishTotal: 0,
});

const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
});

const taskStatusDict = {
    1: '进行中',
    2: '暂停中',
    3: '已结束',
};

const modifyModalRef = ref();
const taskDetailModalRef = ref();
const batchDetailModalRef = ref();
const upDateDataRef = ref();

const formatPublisher = (record) =>
    (record?.publisher || []).map((item) => item.deptName).join('、') || '--';

const formatSupervisor = (record) =>
    (record?.supervisor || []).map((item) => item.nickname).join('、') || '--';

const getTaskStatusClass = (status) => {
    if (status === 1) return 'ops-status-tag--success';
    if (status === 2) return 'ops-status-tag--warn';
    return 'ops-status-tag--ended';
};

const loadStats = () => {
    statisticTaskInfo().then((res) => {
        taskInfo.value = {
            ongoingTotal: res?.ongoingTotal ?? 0,
            finishTotal: res?.finishTotal ?? 0,
        };
    });
    statisticTaskBatch().then((res) => {
        taskBatch.value = {
            ongoingTotal: res?.ongoingTotal ?? 0,
            finishTotal: res?.finishTotal ?? 0,
        };
    });
};

const goToTaskChartCenter = () => {
    router.push({ path: 'taskChartCenter' });
};

const handleViewData = (data, batch) => {
    upDateDataRef.value.showItems({ dataValue: data.formData }, data.formId, true, batch.appId);
};

const switchTaskTab = (tab) => {
    if (fillTaskStateVal.value === tab) return;
    fillTaskStateVal.value = tab;
    pagination.current = 1;
    getTaskList();
};

const getTaskList = () => {
    tableLoading.value = true;
    const params = {
        current: pagination.current,
        size: pagination.pageSize,
        status: fillTaskStateVal.value === 'tab1' ? 1 : 3,
        keyword: searchTaskName.value,
        type: 2,
    };
    getFillTaskList(params)
        .then((res) => {
            tableData.value = res?.records || [];
            pagination.total = res?.total ?? 0;
        })
        .finally(() => {
            tableLoading.value = false;
        });
};

const refreshTaskList = () => {
    pagination.current = 1;
    getTaskList();
    loadStats();
};

const onPageChange = (page) => {
    pagination.current = page;
    getTaskList();
};

const onPageSizeChange = (size) => {
    pagination.pageSize = size;
    pagination.current = 1;
    getTaskList();
};

const openTaskDetail = (record) => {
    taskDetailModalRef.value?.showModal(record);
};

const handleModifyCommand = (val, item) => {
    if (val === '5') {
        Modal.confirm({
            title: '提示',
            simple: true,
            renderToBody: false,
            titleAlign: 'start',
            hideCancel: false,
            okText: '确认',
            content: item.taskStatus === 1 ? '是否暂停任务?' : '是否恢复任务?',
            onOk: async () => {
                if (item.taskStatus === 1) {
                    await modifyTaskStatus({ id: item.id, taskStatus: 2 });
                    Message.success('暂停成功');
                } else {
                    await continueTask(item.id);
                    Message.success('恢复成功');
                }
                refreshTaskList();
            },
        });
    } else if (val === '6') {
        Modal.confirm({
            title: '提示',
            content: '是否结束任务?',
            simple: true,
            renderToBody: false,
            titleAlign: 'start',
            hideCancel: false,
            okText: '确认',
            onOk: async () => {
                await modifyTaskStatus({ id: item.id, taskStatus: 3 });
                Message.success('结束成功');
                refreshTaskList();
            },
        });
    } else if (val === '7') {
        Modal.confirm({
            title: '注销任务',
            content: `确定要注销任务「${item.taskName}」吗？注销后将移除该任务下的所有数据，此操作不可恢复。`,
            simple: true,
            renderToBody: false,
            titleAlign: 'start',
            hideCancel: false,
            okText: '确认注销',
            onOk: async () => {
                await revokeTask(item.id);
                Message.success('注销成功');
                refreshTaskList();
            },
        });
    }
};

const openTaskManage = (item) => {
    const form = { ...item };
    if (form.startDate && form.stopDate) {
        form.dates = [
            new Date(dayjs(form.startDate).format('YYYY-MM-DD')),
            new Date(dayjs(form.stopDate).format('YYYY-MM-DD')),
        ];
    }
    form.publisher = (form.publisher || []).map((v) => ({
        ...v,
        id: v.deptId ?? v.id,
        label: v.deptName ?? v.label,
    }));
    form.supervisor = (form.supervisor || []).map((v) => ({
        ...v,
        id: v.userId ?? v.id,
        nickname: v.nickname,
    }));
    modifyModalRef.value?.showModal(form);
};

const handleDetailCommand = (item) => {
    batchDetailModalRef.value.showModal(item);
};

onMounted(() => {
    loadStats();
    getTaskList();
});
</script>

<style lang="scss">
@use '@/styles/operations-center.scss';
</style>

<style lang="scss" scoped>
.task-name {
    font-weight: 600;
    color: #1e293b;
}

.cell-muted {
    color: #64748b;
}

.action-group {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
}
</style>
