<template>
    <div class="ops-page fill-detail-page">
        <HomeBanner variant="subpage" :show-desc="true" :show-subpage-hero="false"
            :breadcrumb-parent="navConfig.breadcrumbParent" breadcrumb-current="填报详情" :back-label="navConfig.backLabel"
            :back-to="navConfig.backTo" />
        <div class="body-wrap">
            <div class="ops-main fill-detail-main">
                <!-- 任务信息卡片 -->
                <div class="ops-card fill-task-card">
                    <div class="ops-card-header fill-task-card__header">
                        <div class="fill-task-card__info">
                            <div class="fill-task-card__icon">
                                <img v-if="batchInfo?.showIcon" :src="batchInfo?.showIcon" alt="icon" />
                                <img v-else-if="route.query?.appIcon"
                                    :src="win.api.dowUrl + route.query.appIcon + '&token=' + token" alt="icon" />
                                <img v-else :src="placeholderIcon" alt="icon" />
                            </div>
                            <div class="fill-task-card__content">
                                <div class="fill-task-card__title-row">
                                    <h3 class="fill-task-card__title">{{ batchInfo?.taskName || '--' }}</h3>
                                    <span :class="['fill-status-tag', getBatchStatusClass(batchInfo?.batchState)]">
                                        {{ batchInfo?.batchState === 1 ? '进行中' : '已结束' }}
                                    </span>
                                </div>
                                <p class="fill-task-card__meta">
                                    批次 #{{ batchInfo?.batchDate || batchInfo?.batchId }}
                                    · {{ batchInfo?.fillStartTime }} ~ {{ batchInfo?.fillStopTime }}
                                    · 发起人：{{ formatInitiator(activeTask) }}
                                    · 发布部门：{{ formatDept(activeTask) }}
                                    · 监督人：{{ formatSupervisor(activeTask) }}
                                </p>
                                <a-space>
                                    <p class="fill-task-card__source">任务来源：{{ activeTask?.appName }}</p>
                                    <p class="fill-task-card__source" v-if="batchInfo?.category === 2">审批流程：<a
                                            class="approval-link" @click="viewApprovalFlow">需要审批</a> </p>
                                </a-space>

                            </div>
                        </div>
                        <button type="button" class="ops-btn-ghost-sm" @click="copyLink">
                            <icon-link />
                            复制填报链接
                        </button>
                    </div>
                </div>

                <!-- 统计卡片 -->
                <div class="ops-stat-grid">
                    <div class="ops-stat-card ops-stat-card--red">
                        <div class="ops-stat-card__body">
                            <div class="stat-label">待填报人数</div>
                            <div class="stat-number">{{ formatCount(stats.pendingCount) }}</div>
                        </div>
                        <div class="stat-icon"><i class="fas fa-hourglass-half" aria-hidden="true"></i></div>
                    </div>
                    <div class="ops-stat-card ops-stat-card--green">
                        <div class="ops-stat-card__body">
                            <div class="stat-label">已填报人数</div>
                            <div class="stat-number">{{ formatCount(stats.filledCount) }}</div>
                        </div>
                        <div class="stat-icon"><i class="fas fa-check-circle" aria-hidden="true"></i></div>
                    </div>
                    <div class="ops-stat-card ops-stat-card--blue">
                        <div class="ops-stat-card__body">
                            <div class="stat-label">应填报总人数</div>
                            <div class="stat-number">{{ formatCount(stats.totalCount) }}</div>
                        </div>
                        <div class="stat-icon"><i class="fas fa-users" aria-hidden="true"></i></div>
                    </div>
                    <div class="ops-stat-card ops-stat-card--purple">
                        <div class="ops-stat-card__body">
                            <div class="stat-label">填报率</div>
                            <div class="stat-number">{{ stats.fillRate }}%</div>
                        </div>
                        <div class="stat-icon"><i class="fas fa-chart-line" aria-hidden="true"></i></div>
                    </div>
                </div>

                <!-- 列表区域 -->
                <div class="ops-card fill-table-card">
                    <div class="ops-card-header fill-table-card__header">
                        <div class="fill-tab-nav">
                            <button type="button"
                                :class="['ops-nav-btn', { 'ops-nav-btn--active': fillStateVal === '0' }]"
                                @click="switchTab('0')">
                                待填报 ({{ formatCount(stats.pendingCount) }})
                            </button>
                            <button type="button"
                                :class="['ops-nav-btn', { 'ops-nav-btn--active': fillStateVal === '1' }]"
                                @click="switchTab('1')">
                                已填报 ({{ formatCount(stats.filledCount) }})
                            </button>
                        </div>
                        <div class="ops-filter-bar ops-card-header-right ops-filter-bar">
                            <div class="ops-filter-input ops-filter-input--200">
                                <a-input v-model="searchName" placeholder="搜索填报人姓名..." allow-clear
                                    @change="handleFilter">
                                    <template #prefix><icon-search /></template>
                                </a-input>
                            </div>
                            <div class="ops-filter-input ops-filter-input--140">
                                <a-cascader v-model="searchDeptIds" :options="deptOptions" placeholder="全部部门"
                                    :field-names="{ value: 'id', label: 'label' }" allow-clear @change="handleFilter" />
                            </div>
                            <div class="ops-filter-input ops-filter-input--140">
                                <a-select v-model="dataState" placeholder="数据状态" allow-clear @change="handleFilter">
                                    <a-option :value="0">填报失败</a-option>
                                    <a-option :value="1">填报完成</a-option>
                                    <a-option :value="2">审批中</a-option>
                                </a-select>
                            </div>

                        </div>
                    </div>

                    <div class="ops-card-body">
                        <!-- 待填报操作 -->
                        <div v-if="fillStateVal === '0' && batchInfo?.batchState === 1 && selectedKeys.length > 0"
                            class="fill-action-bar">
                            <button v-if="selectedKeys.length > 0" type="button" class="ops-btn-primary-sm"
                                @click="batchUrge(true)">
                                <i class="fas fa-bullhorn"></i>
                                催选中({{ selectedKeys.length }})
                            </button>
                            <button v-if="selectedKeys.length > 0" type="button" class="fill-btn-warn-sm"
                                @click="batchUrge(false)">
                                <i class="fas fa-bullhorn"></i>
                                催全部
                            </button>
                        </div>

                        <!-- 已填报操作 -->
                        <div v-if="fillStateVal === '1'" class="fill-action-bar">
                            <a-dropdown trigger="click" position="bl" class="fill-cascade-dropdown"
                                @select="(key: string) => handleDownloadCommand(key)">
                                <button type="button" class="ops-btn-ghost-sm" :disabled="downloadLoading">
                                    <icon-download />
                                    {{ downloadLoading ? '处理中...' : '下载' }}
                                    <icon-down class="fill-cascade-dropdown__arrow" />
                                </button>
                                <template #content>
                                    <!-- <a-dsubmenu trigger="hover" value="download-selected">
                                        <template #default>下载选中</template>
            <template #content>
                                            <a-doption value="word-selected">WORD（按表单模板）</a-doption>
                                            <a-doption value="pdf-selected">PDF（按表单模板）</a-doption>
                                            <a-doption value="excel-selected">EXCEL（按单行）</a-doption>
                                        </template>
            </a-dsubmenu>
            <a-divider class="fill-dropdown-divider" /> -->
                                    <!-- <a-dsubmenu trigger="hover" value="download-all">
                                        <template #default>下载全部</template>
                                        <template #content> -->
                                    <a-doption value="word-all">WORD（按表单模板）</a-doption>
                                    <a-doption value="pdf-all">PDF（按表单模板）</a-doption>
                                    <a-doption value="excel-all">EXCEL（按单行）</a-doption>
                                    <!-- </template>
                                    </a-dsubmenu> -->
                                </template>
                            </a-dropdown>

                            <a-dropdown trigger="click" position="bl" class="fill-cascade-dropdown"
                                @select="(key: string) => handlePrintCommand(key)">
                                <button type="button" class="ops-btn-ghost-sm" :disabled="downloadLoading">
                                    <icon-printer />
                                    {{ downloadLoading ? '处理中...' : '打印' }}
                                    <icon-down class="fill-cascade-dropdown__arrow" />
                                </button>
                                <template #content>
                                    <!-- <a-dsubmenu trigger="hover" value="print-selected">
                                        <template #default>打印选中</template>
            <template #content>
                                            <a-doption value="form-selected">按表单模板打印</a-doption>
                                            <a-doption value="row-selected">按行打印</a-doption>
                                        </template>
            </a-dsubmenu>
            <a-divider class="fill-dropdown-divider" />
            <a-dsubmenu trigger="hover" value="print-all">
                <template #default>打印全部</template>
                <template #content> -->
                                    <a-doption value="form-all">按表单模板打印</a-doption>
                                    <a-doption value="row-all">按行打印</a-doption>
                                    <!-- </template>
            </a-dsubmenu> -->
                                </template>
                            </a-dropdown>

                            <a-dropdown trigger="click" position="bl" :hide-on-select="false"
                                class="fill-cascade-dropdown">
                                <button type="button" class="ops-btn-ghost-sm">
                                    <icon-eye />
                                    显示字段
                                    <icon-down class="fill-cascade-dropdown__arrow" />
                                </button>
                                <template #content>
                                    <div class="column-checkbox-list" @click.stop>
                                        <div v-for="col in visibleColumns" :key="col.key" class="column-checkbox-item">
                                            <a-checkbox v-model="col.visible"
                                                @change="toggleColumn(col.key, col.visible)">
                                                {{ col.title }}
                                            </a-checkbox>
                                        </div>
                                    </div>
                                </template>
                            </a-dropdown>
                            <button v-if="batchInfo?.batchState === 1 && selectedKeys.length > 0" type="button"
                                class="ops-btn-ghost-sm fill-btn-batch-reject" @click="openBatchRejectModal">
                                <icon-undo />
                                一键打回
                            </button>
                        </div>

                        <div class="ops-table-wrap fill-table-wrap">
                            <a-table :data="tableData" :columns="displayColumns" :pagination="false"
                                :bordered="{ cell: true }" :loading="tableLoading" :scroll="{ x: 'max-content' }"
                                row-key="id" v-model:selectedKeys="selectedKeys" :row-selection="rowSelection"
                                class="fill-detail-table">
                                <template #index="{ rowIndex }">
                                    <span class="fill-cell-index">
                                        {{ (pagination.current - 1) * pagination.pageSize + rowIndex + 1 }}
                                    </span>
                                </template>
                                <template #nickname="{ record }">
                                    <div class="fill-cell-name">{{ record.nickname || '--' }}</div>
                                </template>
                                <template #deptName="{ record }">
                                    <span class="fill-cell-dept">{{ record.deptName || '--' }}</span>
                                </template>
                                <template #dataState="{ record }">
                                    <span :class="['data-state-tag', getDataStateClass(record.dataState)]">
                                        {{ getDataStateText(record.dataState) }}
                                    </span>
                                </template>
                                <template #operation="{ record }">
                                    <div v-if="fillStateVal === '0' && batchInfo?.batchState === 1"
                                        class="fill-operation-btns">
                                        <button v-if="urgedUserIds.has(record.userId)" type="button"
                                            class="fill-action-btn fill-action-btn--success" disabled>
                                            <icon-check />
                                            已催办
                                        </button>
                                        <button v-else type="button" class="fill-action-btn fill-action-btn--warn"
                                            @click="urgeOne(record)">
                                            <icon-notification />
                                            催一下
                                        </button>
                                    </div>
                                    <div v-if="fillStateVal === '1'" class="fill-operation-btns">
                                        <button v-if="batchInfo?.batchState === 1" :disabled="record.dataState == 2"
                                            type="button" class="fill-action-btn fill-action-btn--danger"
                                            @click="openRejectModal(record)">
                                            <icon-undo />
                                            打回重填
                                        </button>
                                        <button type="button" class="fill-action-btn fill-action-btn--primary"
                                            @click="openViewModal(record)">
                                            查看
                                        </button>
                                    </div>
                                </template>
                            </a-table>
                        </div>

                        <div class="ops-pagination fill-pagination">
                            <PersonPagination :total="pagination.total" :current="pagination.current"
                                :page-size="pagination.pageSize" @change="handlePageChange" :show-page-size="false"
                                :show-jump="false" @page-size-change="handlePageSizeChange" />
                        </div>
                    </div>
                </div>
            </div>
        </div>


        <!-- 打回重填弹窗 -->
        <a-modal v-model:visible="rejectModalVisible" title="打回重填" :width="420" unmount-on-close @ok="confirmReject"
            @cancel="closeRejectModal">
            <div class="reject-modal-content">
                <p>确定要将 <strong>{{ rejectTarget?.nickname }}</strong> 的填报记录打回重填吗？</p>
                <p class="reject-hint">打回后，该填报人需重新填写并提交。</p>
                <div class="form-group">
                    <label class="form-label">打回原因（选填）</label>
                    <a-textarea v-model="rejectReason" placeholder="请输入打回原因..."
                        :auto-size="{ minRows: 2, maxRows: 4 }" />
                </div>
            </div>
        </a-modal>

        <!-- 批量打回弹窗 -->
        <a-modal v-model:visible="batchRejectModalVisible" title="一键打回" :width="420" unmount-on-close
            @ok="confirmBatchReject" @cancel="closeBatchRejectModal">
            <div class="reject-modal-content">
                <p>确定要将选中的 <strong>{{ selectedKeys.length }}</strong> 条数据一键打回重填吗？</p>
                <p class="reject-hint">打回后，选中的填报人需重新填写并提交。</p>
                <div class="form-group">
                    <label class="form-label">打回原因（选填）</label>
                    <a-textarea v-model="batchRejectReason" placeholder="请输入打回原因..."
                        :auto-size="{ minRows: 2, maxRows: 4 }" />
                </div>
            </div>
        </a-modal>

        <FillRecordDetailDialog v-model:visible="viewModalVisible" :loading="viewModalLoading" :data="viewData"
            :rows="viewDetailRows" @close="closeViewModal" @download="handleViewDownloadCommand"
            @print="handleViewPrintCommand" />

        <a-modal v-model:visible="templateModalVisible" title="选择模板" width="600px" :confirm-loading="downloadLoading"
            @ok="handleTemplateConfirm">
            <a-radio-group v-model="selectedTemplateId" direction="vertical"
                style="max-height: 400px; overflow-y: auto;">
                <a-radio v-for="item in templateList" :key="item.id" :value="item.id">
                    {{ item.fileName }}
                </a-radio>
            </a-radio-group>
        </a-modal>

        <!-- 查看审批流程弹窗 -->
        <a-modal v-model:visible="flowModalVisible" title="审批流程" title-align="start" :width="1000" :footer="false"
            :render-to-body="false" unmount-on-close class="flow-view-modal">
            <div class="flow-designer-page">
                <main class="flow-designer-canvas flow">
                    <div class="flow-designer-canvas-outer flow-canvas-outer" ref="flowCanvasRef"
                        @mousedown="onCanvasMouseDown" @click.capture="onCanvasClickCapture">
                        <div class="flow-designer-canvas-inner flow-canvas-inner" :style="canvasStyle">
                            <section class="dingflow-design">
                                <div class="box-scale-container">
                                    <div class="box-scale">
                                        <nodeWrap :roleList="flowRoleList" :deptList="flowDeptList"
                                            :postList="flowPostList" v-model:nodeConfig="flowNodeConfig"
                                            :formList="flowFormList" :readonly="true"
                                            v-model:flowPermission="flowPermissionData" />
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </main>
            </div>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { useFillDetailExport } from "./composables/useFillDetailExport"
import { useFlowCanvasPan } from './composables/useFlowCanvasPan'
import { createFillDetailFormatter } from "./utils/fillDetailFormat"
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { Message, Modal } from '@arco-design/web-vue';
import HomeBanner from '@/components/banner/homeBanner.vue';
import PersonPagination from '@/views/user/components/PersonPagination.vue';
import FillRecordDetailDialog from './components/FillRecordDetailDialog.vue';
import {
    getTaskBatchObjectList,
    fillObjectUrge,
    fillObjectLaunchReset,
    fillBatchLaunchReset,
    getFillBatchTask,
    getTaskBatchList,
    getFillTaskList,
    getFillBatchDetail,
} from '@/api/taskFillManager/index.js';
import { getDeptTree } from '@/api/common';
import {
    convertToColumns,
    getFormById,
    setFormById,
    setUpDateData,
    setForm,
    setRules,
} from '@/utils/form.ts';
import { getCreatorApp } from '@/api/form';
import { flowsToTree, getFlowById } from '@/utils/flowPath';
import placeholderIcon from '@/assets/icon_zhanwei.svg';
const token = localStorage.getItem('wornbench_token')
const win = window as any;


const route = useRoute();

const batchInfo = ref<any>(null);
const activeTask = ref<any>(null);
const tableLoading = ref(false);
const flowCanvasRef = ref<HTMLElement | null>(null)
const { canvasStyle, onCanvasMouseDown, onCanvasClickCapture } = useFlowCanvasPan(flowCanvasRef)
const urgedUserIds = ref(new Set<string | number>());

const stats = reactive({
    pendingCount: 0,
    filledCount: 0,
    totalCount: 0,
    fillRate: 0,
});
const fillStateVal = ref('0');
const searchName = ref('');
const searchDeptIds = ref<any[]>([]);
const dataState = ref<number | undefined>(undefined);
const deptOptions = ref<any[]>([]);

const tableData = ref<any[]>([]);
const selectedKeys = ref<(string | number)[]>([]);
const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
});

const tableColumns = ref<any[]>([]);
const visibleColumns = ref([
    { key: 'index', title: '序号', visible: true },
    { key: 'nickname', title: '填报人', visible: true },
    { key: 'deptName', title: '所在部门', visible: true },
    { key: 'dataState', title: '数据状态', visible: true },
]);

const rejectModalVisible = ref(false);
const rejectTarget = ref<any>(null);
const rejectReason = ref('');
const batchRejectModalVisible = ref(false);
const batchRejectReason = ref('');
const viewModalVisible = ref(false);
const viewModalLoading = ref(false);
const viewData = ref<any>(null);
const viewFormConfs = ref<any>({ titleStyle: 'vertical', formList: [] });
const viewForm = ref<Record<string, any>>({});
const viewFormRules = ref<Record<string, any>>({});
const viewDetailRows = ref<{
    id: string;
    title: string;
    text: string;
    tagClass: string;
    lines?: string[];
}[]>([]);
const formFieldMap = ref<Record<string, any>>({});


// 审批流程弹窗
const flowModalVisible = ref(false);
const flowNodeConfig = ref<any>({});
const flowFormList = ref<any[]>([]);
const flowRoleList = ref<any[]>([]);
const flowDeptList = ref<any[]>([]);
const flowPostList = ref<any[]>([]);
const flowPermissionData = ref<any[]>([]);


const navConfig = computed(() => {
    if (route.query.from === 'home') {
        return {
            backLabel: '返回工作台',
            breadcrumbParent: '工作台',
            backTo: { path: '/homePage' },
        };
    }
    return {
        backLabel: '返回任务管理',
        breadcrumbParent: '任务管理',
        backTo: { path: '/taskManageCenter', query: { menuCode: 'operationsCenter' } },
    };
});

const rowSelection = computed(() => ({
    type: 'checkbox' as const,
    showCheckedAll: true,
}));

const displayColumns = computed(() =>
    tableColumns.value.filter((col) => {
        const columnKey = col.key || col.dataIndex;
        if (!columnKey) return true;
        const visibleCol = visibleColumns.value.find((item) => item.key === columnKey);
        return visibleCol ? visibleCol.visible : true;
    }),
);

const fixColumns = [
    {
        title: '序号',
        dataIndex: 'index',
        width: 60,
        align: 'center',
        slotName: 'index',
    },
    {
        title: '填报人',
        dataIndex: 'nickname',
        minWidth: 120,
        slotName: 'nickname',
    },
    {
        title: '所在部门',
        dataIndex: 'deptName',
        minWidth: 180,
        slotName: 'deptName',
    },

];

const formatCount = (value: number) => {
    const num = Number(value) || 0;
    return num.toLocaleString('zh-CN');
};

const resolveAppId = () =>
    batchInfo.value?.appId || activeTask.value?.appId || '';

const buildFormFieldMap = (formList: any[]) => {
    const map: Record<string, any> = {};
    const walk = (list: any[]) => {
        list?.forEach((item) => {
            if (item?.id) {
                map[String(item.id)] = item;
                const baseId = String(item.id).split('.')[0];
                if (!map[baseId]) map[baseId] = item;
            }
            if (item?.type === 'COL' && item.children) {
                walk(item.children);
            } else if (item?.children && item.type !== 'SUBFORM') {
                walk(item.children);
            }
        });
    };
    walk(formList || []);
    formFieldMap.value = map;
};

























const { buildViewDetailRows, flattenLayoutColumns, getColumnDisplayTitle, mergeCompositeColumns } = createFillDetailFormatter({ formFieldMap })
const ensureAppId = async () => {
    let appId = resolveAppId();
    if (appId) {
        if (!batchInfo.value?.appId) {
            batchInfo.value = { ...batchInfo.value, appId };
        }
        return appId;
    }

    if (fillStateVal.value === '1' && tableData.value.length > 0) {
        try {
            const detail = await getFillBatchTask(tableData.value[0].id);
            appId = detail?.designInfo?.appId || '';
            if (appId) {
                batchInfo.value = { ...batchInfo.value, appId };
            }
        } catch (error) {
            console.error('解析 appId 失败:', error);
        }
    }

    return appId;
};

const loadDeptTree = async () => {
    try {
        const res = await getDeptTree();
        deptOptions.value = res;
    } catch (error) {
        console.error('加载部门树失败:', error);
    }
};

const loadTaskInfo = async (taskId: string | number) => {
    try {
        const res = await getFillTaskList({ current: 1, size: 200, type: 2 });
        const task = (res?.records || []).find((item: any) => String(item.id) === String(taskId));
        if (task) {
            // 处理应用图标，与首页保持一致
            task.showIcon =
                task.appIcon && task.appIcon != null
                    ? win.api.dowUrl +
                    task.appIcon +
                    "&token=" +
                    localStorage.getItem("wornbench_token")
                    : "";
            activeTask.value = task;
            if (!batchInfo.value?.taskName) {
                batchInfo.value = {
                    ...batchInfo.value,
                    taskName: task.taskName,
                };
            }
            if (task.appId && !batchInfo.value?.appId) {
                batchInfo.value = {
                    ...batchInfo.value,
                    appId: task.appId,
                };
            }
        }
    } catch (error) {
        console.error('加载任务信息失败:', error);
    }
};

const fetchFilledCount = async () => {
    if (!batchInfo.value?.batchId) return;
    try {
        const [filledRes, pendingRes] = await Promise.all([
            getTaskBatchObjectList({
                current: 1,
                size: 1,
                state: '1',
                batchId: batchInfo.value.batchId,
            }),
            getTaskBatchObjectList({
                current: 1,
                size: 1,
                state: '0',
                batchId: batchInfo.value.batchId,
            }),
        ])
        stats.filledCount = filledRes.total || 0
        stats.pendingCount = pendingRes.total || 0
        stats.totalCount = stats.pendingCount + stats.filledCount
        stats.fillRate = stats.totalCount > 0
            ? Number(((stats.filledCount / stats.totalCount) * 100).toFixed(1))
            : 0
    } catch (error) {
        console.error('获取填报数量失败:', error)
    }
}

const loadBatchData = async () => {
    const batchId = route.query.batchId as string;
    const taskId = route.query.taskId as string;
    const isFromHome = route.query.from === 'home' || route.query.from === 'taskManage';

    if (!batchId) {
        Message.error('缺少批次ID参数');
        return;
    }

    // 从首页进入时，调用 getFillBatchDetail 接口获取批次详情
    if (isFromHome) {
        try {
            const detail = await getFillBatchDetail(batchId);
            batchInfo.value = {
                batchId,
                showIcon: detail.appIcon ? win.api.dowUrl + detail.appIcon + "&token=" + token : '',
                taskId: detail.taskId || taskId,
                taskName: detail.taskName || (route.query.taskName as string) || '',
                batchDate: detail.batchDate || batchId,
                batchState: detail.batchState ?? (Number(route.query.batchState) || 1),
                fillStartTime: detail.fillStartTime || (route.query.fillStartTime as string) || '--',
                fillStopTime: detail.fillStopTime || (route.query.fillStopTime as string) || '--',
                fillTotal: detail.fillTotal ?? 0,
                finishTotal: detail.finishTotal ?? 0,
                appId: detail.appId || '',
                category: detail.category || '',
            };
            if (detail.taskId) {
                await loadTaskInfo(detail.taskId);
            } else if (taskId) {
                await loadTaskInfo(taskId);
            }
            console.log('batchInfo.value', batchInfo.value);
        } catch (error) {
            console.error('获取批次详情失败:', error);
            Message.error('获取批次详情失败');
            return;
        }
    } else {
        batchInfo.value = {
            batchId,
            taskId,
            taskName: route.query.taskName as string || '',
            batchDate: route.query.batchDate as string || batchId,
            batchState: Number(route.query.batchState) || 1,
            fillStartTime: route.query.fillStartTime as string || '--',
            fillStopTime: route.query.fillStopTime as string || '--',
            fillTotal: Number(route.query.fillTotal) || 0,
            finishTotal: Number(route.query.finishTotal) || 0,
            appId: route.query.appId as string || '',
            category: route.query.category as string || '',
        };

        if (taskId) {
            try {
                const batches = await getTaskBatchList(Number(taskId), {});
                const batch = (batches || []).find((item: any) => String(item.batchId) === String(batchId));
                if (batch) {
                    batchInfo.value = {
                        ...batchInfo.value,
                        ...batch,
                        taskId,
                        taskName: batchInfo.value.taskName || batch.taskName,
                        appId: batch.appId || batchInfo.value.appId,
                    };
                }
                await loadTaskInfo(taskId);
            } catch (error) {
                console.error('加载批次信息失败:', error);
            }
        }
    }

    updateStats();
    await refreshTableData();
    // 初始化时额外查询已填报接口获取准确数量
    fetchFilledCount();
};

const refreshTableData = async () => {
    tableLoading.value = true;
    try {
        const params = {
            current: pagination.current,
            size: pagination.pageSize,
            state: fillStateVal.value,
            batchId: batchInfo.value?.batchId,
            nickname: searchName.value,
            depts: searchDeptIds.value.map((v: any) => v[v.length - 1]).join(','),
            dataState: dataState.value,
        };

        const res = await getTaskBatchObjectList(params);
        tableData.value = (res.records || []).map((item: any, index: number) => ({
            ...item,
            ...item.formData,
            rowIndex: index,
        }));
        pagination.total = res.total || 0;
        updateStats();
        await buildColumns();
    } catch (error) {
        console.error('加载数据失败:', error);
        Message.error('加载数据失败');
    } finally {
        tableLoading.value = false;
    }
};

const updateStats = () => {
    const fillTotal = 0;
    const finishTotal = 0;

    if (fillTotal > 0) {
        stats.totalCount = fillTotal;
        stats.filledCount = finishTotal;
        stats.pendingCount = Math.max(fillTotal - finishTotal, 0);
    } else {
        if (fillStateVal.value === '0') {
            stats.pendingCount = pagination.total;
            stats.filledCount = stats.filledCount;
        } else {
            stats.filledCount = pagination.total;
            stats.pendingCount = stats.pendingCount;
        }
        stats.totalCount = stats.pendingCount + stats.filledCount;
    }

    stats.fillRate = stats.totalCount > 0
        ? Number(((stats.filledCount / stats.totalCount) * 100).toFixed(1))
        : 0;
};

const buildColumns = async () => {
    tableColumns.value = [...fixColumns];

    if (fillStateVal.value === '1') {
        const appId = await ensureAppId();
        if (appId) {
            let formConfig = getFormById(appId);
            if (!formConfig?.formList?.length) {
                try {
                    const res = await getCreatorApp(appId);
                    formConfig = res.formConfig ? JSON.parse(res.formConfig) : {};
                    setFormById(formConfig, appId);
                } catch (error) {
                    console.error('加载表单配置失败:', error);
                }
            }

            const formFields = formConfig?.formList || [];
            buildFormFieldMap(formFields);
            const formColumn = mergeCompositeColumns(flattenLayoutColumns(convertToColumns(formFields, true)));

            formColumn.forEach((column: any) => {
                const dataIndex = column.key || column.dataIndex;
                tableColumns.value.push(column);

                if (dataIndex && !visibleColumns.value.find((col) => col.key === dataIndex)) {
                    visibleColumns.value.push({
                        key: dataIndex,
                        title: getColumnDisplayTitle(column),
                        visible: true,
                    });
                }
            });
        }
    } else {
        formFieldMap.value = {};
    }
    if (fillStateVal.value === '1') {
        tableColumns.value.push({
            title: '数据状态',
            dataIndex: 'dataState',
            width: 120,
            align: 'center',
            slotName: 'dataState',
        });
    }


    tableColumns.value.push({
        title: '操作',
        width: fillStateVal.value === '1' ? 180 : 110,
        slotName: 'operation',
        align: 'center',
        fixed: 'right',
    });
};

const switchTab = (val: string) => {
    fillStateVal.value = val;
    searchName.value = '';
    searchDeptIds.value = [];
    dataState.value = undefined;
    pagination.current = 1;
    selectedKeys.value = [];
    if (val === '0') {
        visibleColumns.value = visibleColumns.value.filter(
            (col) => ['index', 'nickname', 'deptName'].includes(col.key),
        );
    }
    refreshTableData();
};

const handleFilter = () => {
    pagination.current = 1;
    refreshTableData();
};

const handlePageChange = (page: number) => {
    pagination.current = page;
    refreshTableData();
};

const handlePageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.current = 1;
    refreshTableData();
};

const batchUrge = (selectedOnly: boolean) => {
    if (selectedOnly && selectedKeys.value.length === 0) {
        Message.warning('请先选择要催办的填报人');
        return;
    }

    Modal.confirm({
        title: '提示',
        titleAlign: 'start',
        content: selectedOnly
            ? `确定要催办选中的 ${selectedKeys.value.length} 人吗？`
            : '确定要催办全部待填报对象吗？',
        onOk: async () => {
            try {
                const params: any = {
                    batchId: batchInfo.value?.batchId,
                    urgingType: selectedOnly ? 2 : 1,
                };
                if (selectedOnly) {
                    const userIds = tableData.value
                        .filter((row) => selectedKeys.value.includes(row.id))
                        .map((row) => row.userId);
                    params.userIds = userIds;
                }
                await fillObjectUrge(params);
                Message.success('催办成功');
                if (selectedOnly) {
                    tableData.value
                        .filter((row) => selectedKeys.value.includes(row.id))
                        .forEach((row) => urgedUserIds.value.add(row.userId));
                    selectedKeys.value = [];
                } else {
                    tableData.value.forEach((row) => urgedUserIds.value.add(row.userId));
                }
            } catch {
                Message.error('催办失败');
            }
        },
    });
};

const urgeOne = (record: any) => {
    Modal.confirm({
        title: '提示',
        titleAlign: 'start',
        content: `确定要催办 ${record.nickname} 吗？`,
        onOk: async () => {
            try {
                await fillObjectUrge({
                    batchId: batchInfo.value?.batchId,
                    urgingType: 2,
                    userIds: [record.userId],
                });
                urgedUserIds.value.add(record.userId);
                Message.success(`已向 ${record.nickname} 发送催办提醒`);
            } catch {
                Message.error('催办失败');
            }
        },
    });
};

const openRejectModal = (record: any) => {
    rejectTarget.value = record;
    rejectReason.value = '';
    rejectModalVisible.value = true;
};

const confirmReject = async () => {
    try {
        await fillObjectLaunchReset({
            batchId: batchInfo.value?.batchId,
            objectId: rejectTarget.value.id,
            reason: rejectReason.value,
        });
        Message.success('打回成功');
        closeRejectModal();
        refreshTableData();
    } catch {
        Message.error('打回失败');
    }
};

const closeRejectModal = () => {
    rejectModalVisible.value = false;
    rejectTarget.value = null;
    rejectReason.value = '';
};

const openBatchRejectModal = () => {
    batchRejectReason.value = '';
    batchRejectModalVisible.value = true;
};

const confirmBatchReject = async () => {
    try {
        const objectIds = tableData.value
            .filter((row) => selectedKeys.value.includes(row.id))
            .map((row) => row.id);
        await fillBatchLaunchReset({
            batchId: batchInfo.value?.batchId,
            objectIds,
            reason: batchRejectReason.value,
        });
        Message.success('批量打回成功');
        closeBatchRejectModal();
        selectedKeys.value = [];
        await refreshTableData();
        await fetchFilledCount();
    } catch {
        Message.error('批量打回失败');
    }
};

const closeBatchRejectModal = () => {
    batchRejectModalVisible.value = false;
    batchRejectReason.value = '';
};

const openViewModal = async (record: any) => {
    viewModalLoading.value = true;
    viewModalVisible.value = true;
    try {
        const res = await getFillBatchTask(record.id);
        const displayFormData = {
            ...(res.formData || {}),
            ...(record.formData || {}),
            ...record,
        };
        viewData.value = {
            ...res,
            nickname: record.nickname,
            deptName: record.deptName,
            submitTime: record.submitTime || record.applyTime || record.createTime || record.updateTime || record.finishTime,
        };

        const formConfig = res.designInfo?.formConfig
            ? JSON.parse(res.designInfo.formConfig)
            : getFormById(resolveAppId()) || { formList: [] };
        viewFormConfs.value = formConfig;
        setForm(viewFormConfs.value.formList);
        setFormById(viewFormConfs.value, res.designInfo?.appId || resolveAppId());
        viewFormRules.value = {};
        setRules(viewFormConfs.value.formList, viewFormRules.value, true);
        viewForm.value = {};
        await setUpDateData(
            res.formData,
            viewFormConfs.value.formList,
            viewForm.value,
            true,
            res.formId,
        );
        viewDetailRows.value = buildViewDetailRows(viewFormConfs.value.formList, displayFormData);
    } catch {
        Message.error('获取详情失败');
        viewModalVisible.value = false;
    } finally {
        viewModalLoading.value = false;
    }
};

const closeViewModal = () => {
    viewModalVisible.value = false;
    viewData.value = null;
    viewFormConfs.value = { titleStyle: 'vertical', formList: [] };
    viewForm.value = {};
    viewFormRules.value = {};
    viewDetailRows.value = [];
};

const toggleColumn = (key: string, visible: boolean) => {
    const column = visibleColumns.value.find((col) => col.key === key);
    if (column) {
        column.visible = visible;
    }
};











const formatInitiator = (task: any) => {
    const publisher = task?.publisher || [];
    const names = publisher.map((item: any) => item.nickname || item.deptName).filter(Boolean);
    return names.join('、') || '--';
};

const formatDept = (task: any) =>
    (task?.publisher || []).map((item: any) => item.deptName).join('、') || '--';

const formatSupervisor = (task: any) =>
    (task?.supervisor || []).map((item: any) => item.nickname).join('、') || '--';

const getBatchStatusClass = (status: number) =>
    status === 1 ? 'fill-status-tag--running' : 'fill-status-tag--ended';

// 获取数据状态文本
const getDataStateText = (state: number | undefined) => {
    if (state === undefined || state === null) return '--';
    const stateMap: Record<number, string> = {
        0: '填报失败',
        1: '填报完成',
        2: '审批中',
    };
    return stateMap[state] ?? '--';
};

// 获取数据状态样式类
const getDataStateClass = (state: number | undefined) => {
    if (state === undefined || state === null) return '';
    const classMap: Record<number, string> = {
        0: 'data-state-tag--failed',
        1: 'data-state-tag--success',
        2: 'data-state-tag--processing',
    };
    return classMap[state] ?? '';
};

const copyLink = () => {
    const params = new URLSearchParams({
        batchId: String(batchInfo.value?.batchId ?? ''),
        taskId: String(batchInfo.value?.taskId ?? activeTask.value?.id ?? ''),
        taskName: String(batchInfo.value?.taskName ?? activeTask.value?.taskName ?? ''),
    });
    const url = `${window.location.origin}/wornbench/taskFillCenter?${params.toString()}`;

    // 尝试使用现代 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
            Message.success('填报链接已复制');
        }).catch(() => {
            fallbackCopyToClipboard(url);
        });
    } else {
        // 降级方案：使用 execCommand
        fallbackCopyToClipboard(url);
    }
};

// 降级复制方法（兼容旧版浏览器）
const fallbackCopyToClipboard = (text: string) => {
    try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);

        if (successful) {
            Message.success('填报链接已复制');
        } else {
            Message.error('复制失败，请手动复制');
        }
    } catch (err) {
        console.error('复制失败:', err);
        Message.error('复制失败，请手动复制');
    }
};

const viewApprovalFlow = async () => {
    const appId = batchInfo.value?.appId || activeTask.value?.appId;
    if (!appId) {
        Message.error('无法获取应用信息');
        return;
    }
    try {
        const res = await getCreatorApp(appId);
        if (!res?.processConfig) {
            Message.error('该应用未配置审批流程');
            return;
        }
        // 存储表单配置
        if (res.formConfig) {
            const formConfig = typeof res.formConfig === 'string' ? JSON.parse(res.formConfig) : res.formConfig;
            setFormById(formConfig, appId);
        }
        // 转换并存储流程数据
        const processConfig = typeof res.processConfig === 'string' ? JSON.parse(res.processConfig) : res.processConfig;
        flowsToTree(processConfig, appId);
        // 从缓存读取数据用于弹窗展示
        const flowData: any = getFlowById(appId);
        flowNodeConfig.value = flowData?.id ? flowData : {};
        const formConfs = getFormById(appId);
        flowFormList.value = formConfs?.formList || [];
        // 打开弹窗
        flowModalVisible.value = true;
    } catch (error) {
        console.error('加载审批流程失败:', error);
        Message.error('加载审批流程失败');
    }
};

onMounted(() => {
    loadDeptTree();
    loadBatchData();
});

const { downloadLoading, templateModalVisible, selectedTemplateId, templateList, handleDownloadCommand, handlePrintCommand, handleTemplateConfirm, handleViewDownloadCommand, handleViewPrintCommand } = useFillDetailExport({ batchInfo, fillStateVal, selectedKeys, stats, pagination, tableData, viewData, resolveAppId })
</script>

<style scoped lang="scss">
@use '@/styles/operations-center.scss';

.body-wrap {
    max-height: calc(100vh - 65px);
    overflow: auto;
}

.fill-detail-main {
    padding: 0 24px 40px;

}

.fill-task-card {
    margin-bottom: 20px;

    &__header {
        border-bottom: none;
    }

    &__source {
        font-size: 12px;
        color: #64748b;
        margin-top: 8px;
        margin-bottom: 0;

        span,
        a {
            color: rgb(var(--primary-6));
            cursor: pointer;
        }
    }

    &__info {
        display: flex;
        align-items: center;
        gap: 16px;
        min-width: 0;
    }

    &__icon {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
    }

    &__content {
        min-width: 0;
    }

    &__title-row {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
    }

    &__title {
        margin: 0;
        font-size: 15px;
        font-weight: 700;
        color: #1e293b;
    }

    &__meta {
        margin: 4px 0 0;
        font-size: 12px;
        color: #94a3b8;
        line-height: 1.5;
    }
}

.fill-status-tag {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;

    &--running {
        background: #dcfce7;
        color: #16a34a;
    }

    &--ended {
        background: #f1f5f9;
        color: #64748b;
    }
}

.fill-table-card {
    &__header {
        gap: 12px;
    }
}

.fill-tab-nav {
    display: flex;
    align-items: center;
    gap: 8px;
}

.fill-action-bar {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    flex-wrap: wrap;

    .ops-btn-ghost-sm:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
}

.fill-btn-warn-sm {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 7px 14px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid #fed7aa;
    background: #fff7ed;
    color: #d97706;
    transition: all 0.2s;
    font-family: inherit;

    &:hover {
        background: #ffedd5;
    }
}

.fill-btn-batch-reject {
    background: #fef2f2 !important;
    color: #dc2626 !important;
    border: 1px solid #fecaca !important;

    &:hover {
        background: #fee2e2 !important;
    }
}



.fill-detail-table {
    :deep(.arco-table-th) {
        background: #f8fafc !important;
        color: #475569;
        font-size: 12px;
        font-weight: 600;
    }

    :deep(.arco-table-td) {
        font-size: 13px;
        border-bottom: 1px solid #f1f5f9;
    }

    :deep(.arco-table-tr:hover .arco-table-td) {
        background: #f8fafc;
    }

    :deep(.fill-multi-value-cell) {
        display: inline-flex;
        align-items: stretch;
        max-width: 100%;
        min-width: 0;
        overflow: hidden;
        vertical-align: middle;
        // background: #fff;

        // border: 1px solid #e2e8f0;
        border-radius: 6px;
    }

    :deep(.fill-multi-value-cell__item) {
        // display: block;
        // min-width: 0;
        // max-width: 160px;
        // padding: 2px 8px;
        //color: #334155;
        //line-height: 20px;
        // overflow: hidden;
        // text-overflow: ellipsis;
        // white-space: nowrap;
        // border-right: 1px solid #e2e8f0;
    }

    :deep(.fill-multi-value-cell__item:last-child) {
        border-right: 0;
    }

    :deep(.arco-table-cell:has(.arco-table-td-content > div + div)) {
        height: 100%;
        padding: 0;
    }

    :deep(.arco-table-td-content:has(> div + div)) {
        display: flex;
        min-height: 100%;
        flex-direction: column;
        justify-content: center;
    }

    :deep(.arco-table-td-content:has(> div + div) > div) {
        margin-bottom: 0 !important;
        padding: 7px 16px;
        border-bottom: 1px solid #e2e8f0;
    }

    :deep(.arco-table-td-content:has(> div + div) > div:first-child) {
        padding-top: 7px;
    }

    :deep(.arco-table-td-content:has(> div + div) > div:last-child) {
        padding-bottom: 7px;
        border-bottom: 0;
    }
}

.fill-cell-index {
    color: #94a3b8;
}

.fill-cell-name {
    font-weight: 600;
    color: #1e293b;
}

.fill-cell-dept {
    color: #64748b;
}

.data-state-tag {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.4;

    &--success {
        background: #dcfce7;
        color: #16a34a;
    }

    &--failed {
        background: #fee2e2;
        color: #dc2626;
    }

    &--processing {
        background: #fef3c7;
        color: #d97706;
    }
}

.fill-operation-btns {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    flex-wrap: wrap;
}

.fill-action-btn {
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    background: transparent;
    transition: all 0.15s;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: inherit;

    &--primary {
        color: #2563eb;

        &:hover {
            background: #fee2e2;
        }
    }

    &--danger {
        color: #dc2626;

        &:hover {
            background: #fee2e2;
        }
    }

    &--warn {
        color: #d97706;

        &:hover {
            background: #fee2e2;
        }
    }

    &--success {
        color: #16a34a;
        cursor: default;
    }

    &:disabled {
        opacity: 1;
        color: #94a3b8;
        cursor: not-allowed;
    }
}

.fill-pagination {
    margin-top: 16px;
}

.reject-modal-content {
    p {
        font-size: 13px;
        color: #475569;
        line-height: 1.6;
        margin-bottom: 8px;

        strong {
            color: #dc2626;
        }
    }

    .reject-hint {
        color: #94a3b8;
        margin-top: 4px;
    }
}

.form-group {
    margin-top: 16px;
}

.form-label {
    display: block;
    font-size: 12px;
    color: #64748b;
    margin-bottom: 8px;
}

.fill-cascade-dropdown {
    &__arrow {
        margin-left: 4px;
        font-size: 10px;
    }

    :deep(.arco-dropdown-list-wrapper) {
        padding: 0;
    }

    :deep(.arco-dropdown-list) {
        padding: 6px;
        border-radius: 10px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        min-width: 140px;
    }

    :deep(.arco-dropdown-option) {
        padding: 8px 14px;
        border-radius: 8px;
        font-size: 13px;
        color: #475569;
        line-height: 1.4;

        &:hover {
            background: #f8fafc;
            color: #2563eb;
        }
    }

    :deep(.arco-dropdown-option-suffix) {
        font-size: 10px;
        color: #94a3b8;
        margin-left: 8px;
    }

    :deep(.arco-dropdown-submenu) {
        .arco-dropdown-list {
            padding: 0;
            overflow: hidden;
        }
    }
}

.fill-dropdown-divider {
    margin: 4px 0;
    border-color: #f1f5f9;
}

.column-checkbox-list {
    display: flex;
    flex-direction: column;
    min-width: 160px;
    padding: 6px;
}

.column-checkbox-item {
    padding: 6px 14px;
    cursor: default;

    :deep(.arco-checkbox) {
        font-size: 13px;
        color: #475569;
    }

    &:hover {
        background: transparent;
    }
}

@media (max-width: 768px) {
    .fill-detail-main {
        padding: 0 16px 40px;
    }

    .fill-table-card__header {
        flex-direction: column;
        align-items: flex-start;
    }
}

.flow-view-modal {
    .flow-view-modal__body {
        display: flex;
        overflow: hidden;
        background: #f8fafc;
    }

    .flow-designer-canvas {
        padding-bottom: 0;
        height: calc(100vh - 300px) !important;
    }

}

.flow-designer-page {
    min-height: auto;
}
</style>
<style lang="scss">
@use "@/styles/flow-designer.scss";
</style>
<style>
@import "../../styles/workflow.css";
</style>
