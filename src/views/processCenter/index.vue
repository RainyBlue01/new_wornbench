<template>
    <div class="ops-page flowCenter">
        <userBanner url="/homepage" title="流程中心" active="operationsCenter" />
        <div class="ops-main flowCenter-main">
            <div class="ops-stat-grid">
                <div class="ops-stat-card ops-stat-card--blue">
                    <div class="ops-stat-card__body">
                        <div class="stat-label">流程中</div>
                        <div class="stat-number">{{ ongoingCount }}</div>
                    </div>
                    <div class="stat-icon"><i class="fas fa-play-circle"></i></div>
                </div>
                <div class="ops-stat-card ops-stat-card--green">
                    <div class="ops-stat-card__body">
                        <div class="stat-label">已通过</div>
                        <div class="stat-number">{{ completedCount }}</div>
                    </div>
                    <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                </div>
                <div class="ops-stat-card ops-stat-card--red">
                    <div class="ops-stat-card__body">
                        <div class="stat-label">流程失败</div>
                        <div class="stat-number">{{ failedCount }}</div>
                    </div>
                    <div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div>
                </div>
                <div class="ops-stat-card ops-stat-card--purple">
                    <div class="ops-stat-card__body">
                        <div class="stat-label">平均耗时</div>
                        <div class="stat-number" :style="{ fontSize: '20px' }">{{ avgDuration }}</div>
                    </div>
                    <div class="stat-icon"><i class="fas fa-clock"></i></div>
                </div>
            </div>

            <div class="ops-card flow-card">
                <div class="ops-card-header flow-card__header">
                    <h3 class="ops-card-title flow-card__title">流程中心</h3>
                    流程实例监控
                </div>

                <div class="ops-card-body flow-card__body">
                    <div class="ops-filter-bar filter-bar">
                        <a-input v-model="tableKeyword" class="rounded-input"
                            :style="{ width: '200px', borderRadius: '12px' }" placeholder="搜索流程名称/实例ID..." allow-clear
                            @change="handleTableSearch">
                            <template #prefix><icon-search /></template>
                        </a-input>
                        <a-select v-model="activeLeftTab" class="rounded-input"
                            :style="{ width: '120px', borderRadius: '12px' }" placeholder="按状态筛选"
                            @change="onStatusChange">
                            <a-option value="ongoing" label="流程中" />
                            <a-option value="completed" label="已通过" />
                            <a-option value="failed" label="流程失败" />
                        </a-select>
                        <a-select v-model="selectedAppId" class="rounded-input" allow-search
                            :style="{ width: '140px', borderRadius: '12px' }" placeholder="按应用搜索" allow-clear
                            @change="onAppSelectChange">
                            <a-option v-for="item in appListData" :key="item.appId" :value="item.appId"
                                :label="item.appName" />
                        </a-select>

                    </div>

                    <div class="ops-table-wrap table-wrap">
                        <a-table :columns="columns" :scroll="scroll" :data="tableData" :pagination="false"
                            :loading="loading" row-key="id" :bordered="false" class="ops-data-table">
                            <template #index="{ rowIndex }">
                                {{ rowIndex + 1 }}
                            </template>
                            <template #status="{ record }">
                                <span v-if="record.instanceState == 1"
                                    class="ops-status-tag ops-status-tag--pending">流程中</span>
                                <span v-else-if="record.instanceState == 0 && activeLeftTab !== 'failed'"
                                    class="ops-status-tag ops-status-tag--success">已通过</span>
                                <span v-else-if="activeLeftTab === 'failed'"
                                    class="ops-status-tag ops-status-tag--fail">流程失败</span>
                                <span v-else class="ops-status-tag ops-status-tag--ended">--</span>
                            </template>
                            <template #processName="{ record }">
                                <div style="font-weight: 600; color: #1e293b;">{{ record.processName || '--' }}</div>
                            </template>
                            <template #processInstanceId="{ record }">
                                <span style="font-family: monospace; font-size: 12px; color: #64748b;">{{
                                    record.processInstanceId }}</span>
                            </template>
                            <template #createUser="{ record }">
                                <div style="display: flex; align-items: center; gap: 6px;">
                                    <div class="user-avatar" :style="getUserAvatarStyle(record.createUser)">
                                        {{ getUserInitial(record.createUser) }}
                                    </div>
                                    <span style="font-size: 13px;">{{ record.createUser || '--' }}</span>
                                </div>
                            </template>
                            <template #currentRuntimes="{ record }">
                                <a-space>
                                    <div class="item" v-for="items in record.currentRuntimes" :key="items.executionId">
                                        <a-tooltip v-if="items.executionName" background-color="#fff">
                                            <div class="cuurent" @mouseover="handleMouseOver(record, items)">

                                                {{ items.executionName }}
                                            </div>
                                            <template #content>
                                                <a-table :columns="columnsTable" :data="currentData" :pagination="false"
                                                    size="small" />
                                            </template>
                                        </a-tooltip>
                                    </div>
                                </a-space>

                                <!-- <a-tag color="arcoblue" size="small">流程中</a-tag> -->
                            </template>
                            <template #nodeType="{ record }">
                                <span style="font-size: 13px; color: #334155;">{{ getNodeTypeName(record) }}</span>
                            </template>
                            <template #action="{ record }">
                                <button type="button" v-if="record.instanceState == 1"
                                    class="ops-action-btn ops-action-btn--primary" @click="handleProcessFlow(record)">
                                    处理流程
                                </button>
                            </template>
                        </a-table>
                    </div>
                    <div class="ops-pagination person-page">
                        <PersonPagination :total="pagination.total" :current="pagination.current"
                            :page-size="pagination.pageSize" :showJump="false" :showPageSize="false"
                            @change="onPageChange" @page-size-change="onPageSizeChange" />
                    </div>
                </div>

            </div>
        </div>
        <selectRadioModel :deptList="deptList" @setData="setData" ref="selectRadioModelRef" />
        <condition :deptLists="deptList" ref="conditionRef" @filter="conditionFilter" />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import condition from '@/views/application/original/condition.vue';
import PersonPagination from '@/views/user/components/PersonPagination.vue';
import { executionCandidates } from "@/api/workbench/index";
import { getDesignApp } from '@/api/form/index'
import selectRadioModel from '@/components/selectPerson/components/selectRadioModel.vue'
import { processTotal, appList as getAppList, recordList, urgent, input, inputAssign, approvePass, approveRefuse, approveAssign, approveBack, stopProcessCenter } from '@/api/processCenter/index'
import { getDeptTree } from '@/api/common/index'
import {
    IconDown,
    IconFilter,
    IconRefresh,
    IconEdit,
    IconNotification,
    IconSwap,
    IconSearch,
    IconPlayCircle,
    IconCheckCircle,
    IconCloseCircle,
    IconClockCircle,
    IconPoweroff,
} from '@arco-design/web-vue/es/icon';
const deptList = ref([])
import { Message, Modal } from '@arco-design/web-vue';
const columnsTable = ref([
    {
        title: '节点用户名',
        dataIndex: 'username',
        key: 'username',
    },
    {
        title: '节点用户昵称',
        dataIndex: 'nickname',
        key: 'nickname',
    }
]);
const searchText = ref('');
const tableKeyword = ref('');
const selectedAppId = ref<string | number | undefined>();
const activeLeftTab = ref('ongoing');
const scroll = { maxHeight: 'calc(100vh - 406px)', x: 'max-content' };
const selectRadioModelRef = ref();
const currentData = ref([])
// 处理鼠标移入事件
const handleMouseOver = async (record: any, item: any) => {
    currentData.value = [];
    try {
        if (!record.processInstanceId || !item.executionId) {
            return;
        }
        const res = await executionCandidates(record.processInstanceId, item.executionId);
        if (res) {
            currentData.value = res;
        }
    } catch (error) {
        console.error('获取流程节点执行候选人失败:', error);

    }
};
// 右侧相关
const currentFlowName = ref('');
const ongoingCount = ref(0);
const completedCount = ref(0);
const failedCount = ref(0);
const avgDuration = ref('--');

const changeActive = (tab: string) => {
    activeLeftTab.value = tab;
    currentApp.value = {};
    selectedAppId.value = undefined;
    pagination.current = 1;
    loadAppList();
};

const onStatusChange = (status: string | undefined) => {
    if (status == null || status === '') {
        return;
    }
    activeLeftTab.value = status;
    currentApp.value = {};
    selectedAppId.value = undefined;
    pagination.current = 1;
    loadAppList();
};

// 获取节点类型名称
const getNodeTypeName = (record: any) => {
    if (!record.currentRuntimes || !Array.isArray(record.currentRuntimes) || record.currentRuntimes.length === 0) {
        return '--';
    }
    const nodeType = record.currentRuntimes[0].nodeType;
    const typeMap: Record<string, string> = {
        'APPROVE': '审批节点',
        'INPUT': '填写节点',
        'CC': '抄送节点',
        'START': '开始节点',
        'END': '结束节点',
    };
    return typeMap[nodeType] || nodeType || '--';
};

// 获取用户名称首字母
const getUserInitial = (userName: string) => {
    if (!userName || userName === '--') {
        return '?';
    }
    // 如果是中文，取第一个字符
    return userName.charAt(0);
};

// 获取用户头像样式（渐变色）
const getUserAvatarStyle = (userName: string) => {
    if (!userName || userName === '--') {
        return {
            background: '#94a3b8',
        };
    }

    // 根据用户名称生成固定的渐变色
    const gradients = [
        'linear-gradient(135deg, #60a5fa, #6366f1)', // blue-400 to indigo-500
        'linear-gradient(135deg, #4ade80, #10b981)', // green-400 to emerald-500
        'linear-gradient(135deg, #f472b6, #ec4899)', // pink-400 to pink-500
        'linear-gradient(135deg, #fb923c, #f97316)', // orange-400 to orange-500
        'linear-gradient(135deg, #a78bfa, #8b5cf6)', // violet-400 to violet-500
        'linear-gradient(135deg, #38bdf8, #0ea5e9)', // sky-400 to sky-500
        'linear-gradient(135deg, #fbbf24, #f59e0b)', // amber-400 to amber-500
        'linear-gradient(135deg, #f87171, #ef4444)', // red-400 to red-500
    ];

    // 使用用户名称的字符代码和来确定使用哪个渐变色
    const charCodeSum = userName.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const gradientIndex = charCodeSum % gradients.length;

    return {
        background: gradients[gradientIndex],
    };
};

// 初始化 router
const router = useRouter();

// 处理流程 - 跳转到待办中心详情页
const handleProcessFlow = (record: any) => {
    // 根据流程状态判断跳转参数
    const isOngoing = activeLeftTab.value === 'ongoing';
    const currentRuntime = record.currentRuntimes?.[0] || {};
    const taskTypeMap: Record<string, string> = {
        APPROVE: 'approve',
        INPUT: 'input',
        START: 'start',
    };

    router.push({
        name: "processCenterDetail",
        query: {
            id: record.processInstanceId,
            processInstanceId: record.processInstanceId,
            executionId: currentRuntime.executionId || '',
            executionName: currentRuntime.executionName || '',
            nodeType: currentRuntime.nodeType || '',
            taskId: record.taskId || '',
            taskType: taskTypeMap[currentRuntime.nodeType] || String(currentRuntime.nodeType || '').toLowerCase(),
            priority: record.priority || 0,
            classify: isOngoing ? 'pending' : 'apply',
            activeLeftTab: activeLeftTab.value,
            finishState: 1,
            from: 'processCenter',
            menuCode: 'operationsCenter',
            appName: currentApp.value.appName || '',
        }
    });
};

const handleSearch = () => {
    currentApp.value = {};
    selectedAppId.value = undefined;
    loadAppList();
};

const onAppSelectChange = (appId: string | number | undefined) => {
    if (appId == null || appId === '') {
        currentApp.value = {};
        pagination.current = 1;
        getList();
        return;
    }
    const app = appListData.value.find((item: any) => item.appId === appId);
    if (app) handleSelectApp(app);
};

const handleTableSearch = () => {
    pagination.current = 1;
    getList();
};
const getData = async () => {
    const res = await getDeptTree();
    deptList.value = res
}
getData()
// 表格列配置
const columns = [
    { title: '序号', slotName: 'index', align: 'center', width: 60 },
    { title: '流程名称', slotName: 'processName', align: 'left', width: 200 },
    { title: '实例ID', dataIndex: 'processInstanceId', align: 'left', width: 170 },
    { title: '发起人', slotName: 'createUser', align: 'left', width: 100 },
    { title: '当前节点', slotName: 'currentRuntimes', align: 'left', width: 80 },
    { title: '发起时间', dataIndex: 'createTime', align: 'left', width: 160 },
    { title: '耗时', dataIndex: 'duration', align: 'center', width: 160 },
    { title: '节点类型', slotName: 'nodeType', align: 'center', width: 80 },
    { title: '状态', slotName: 'status', align: 'center', width: 80 },
    {
        title: '操作',
        slotName: 'action',
        align: 'center',
        width: 100
    },
];

// 分页配置
const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
});

const loading = ref(false);
const conditionRef = ref();
const matchValue = ref(false);
const conditions = ref([]);

// 表格数据
const tableData = ref<any[]>([]);
const currentApp = ref({})
const appListData = ref([]);

const handleSelectApp = (app: any) => {
    currentApp.value = app;
    selectedAppId.value = app?.appId;
    pagination.current = 1;
    getList();
};

// 获取应用列表
const loadAppList = async () => {
    try {
        const params: any = { processFinish: activeLeftTab.value === 'ongoing' ? 0 : 1 };
        if (activeLeftTab.value === 'failed') {
            params.finishState = 2;
        }
        if (searchText.value) {
            params.appName = searchText.value;
        }
        const res = await getAppList(params);
        appListData.value = res || [];

        const matched = selectedAppId.value != null
            ? appListData.value.find((item: any) => item.appId === selectedAppId.value)
            : undefined;
        if (matched) {
            handleSelectApp(matched);
            return;
        }

        currentApp.value = {};
        selectedAppId.value = undefined;
        pagination.current = 1;
        getList();
    } catch (error) {
        console.error('获取应用列表失败:', error);
    }
};

// 获取流程统计
const loadProcessTotal = async () => {
    try {
        const res = await processTotal();
        ongoingCount.value = res?.processing ?? 0;
        completedCount.value = res?.finished ?? 0;
        failedCount.value = res?.failed ?? res?.fail ?? 0;
        avgDuration.value = res?.duration ?? res?.duration ?? '--';
    } catch (error) {
        console.error('获取流程统计失败:', error);
    }
};

// 获取列表数据
const getList = async () => {
    loading.value = true;
    try {
        const params: Record<string, any> = {
            current: pagination.current,
            size: pagination.pageSize,
            processFinish: activeLeftTab.value === 'ongoing' ? 0 : 1,
            match: matchValue.value,
            conditions: conditions.value,
        };
        if (currentApp.value.appId != null) {
            params.appId = currentApp.value.appId;
            if (currentApp.value.formId != null) {
                params.formId = currentApp.value.formId;
            }
        }
        if (activeLeftTab.value === 'failed') {
            params.finishState = 2;
        }
        if (activeLeftTab.value === 'failed') {

        }
        const kw = tableKeyword.value.trim();
        if (kw) params.keyword = kw;

        const res: any = await recordList(params);
        tableData.value = res?.records || [];
        pagination.total = res?.total || 0;
    } catch (error) {
        console.error('获取流程数据失败:', error);
    } finally {
        loading.value = false;
    }
};

// 添加筛选条件
const handleFilter = () => {
    getDesignApp(currentApp.value.appId).then(res => {
        let formConfig = res.formConfig ? JSON.parse(res.formConfig) : { id: '' }
        conditionRef.value?.show(formConfig?.formList || [], currentApp.value.processId);
    })


};

const conditionFilter = (filter: any) => {
    matchValue.value = filter.match;
    conditions.value = filter.conditions;
    pagination.current = 1;
    getList();
};

// 刷新
const handleRefresh = () => {
    getList();
};

// 页码变化
const onPageChange = (page: number) => {
    pagination.current = page;
    getList();
};

// 每页条数变化
const onPageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.current = 1;
    getList();
};

// 催办
const handleUrge = async (record: any) => {
    Modal.confirm({
        title: "提示",
        simple: true,
        renderToBody: false,
        titleAlign: "start",
        content: `确定要催办流程吗？`,
        hideCancel: false,
        okText: "确认",
        onOk: async () => {
            try {
                await urgent(record.processInstanceId);
                Message.success('催办成功');
            } catch (error) {
                console.error('催办失败:', error);
            }
        },
    });

};

// 填写
const handleWrite = async (record: any) => {
    Modal.confirm({
        title: "提示",
        simple: true,
        renderToBody: false,
        titleAlign: "start",
        content: `确定要填写吗？`,
        hideCancel: false,
        okText: "确认",
        onOk: async () => {
            try {
                const params = {
                    instanceId: record.processInstanceId,
                    executionId: record.currentRuntimes[0].executionId,
                };
                await input(params);
                loadAppList();
                Message.success('填写成功');
                getList();
            } catch (error) {
                console.error('填写失败:', error);
            }
        },
    });
};
const activeRecord = ref({});
// 转交
const handleTransfer = async (record: any) => {


    Modal.confirm({
        title: "提示",
        simple: true,
        renderToBody: false,
        titleAlign: "start",
        content: `确定要转交任务吗？`,
        hideCancel: false,
        okText: "确认",
        onOk: async () => {
            activeRecord.value = record
            selectRadioModelRef.value.showItem(record);
        },
    });
};
const handleApprove = async (record: any, val: number) => {
    const actionMap = {
        1: { title: '通过', content: '确定要通过该审批吗？', api: 'approvePass' },
        2: { title: '拒绝', content: '确定要拒绝该审批吗？', api: 'approveRefuse' },
        3: { title: '转交', content: '确定要转交该审批吗？', api: 'approveAssign' },
        4: { title: '退回', content: '确定要退回该审批吗？', api: 'approveBack' }
    }
    const action = actionMap[val]

    if (!action) {
        Message.error('未知的操作类型')
        return
    }

    if (val === 3) {
        // 转交需要选择人员
        Modal.confirm({
            title: "提示",
            simple: true,
            renderToBody: false,
            titleAlign: "start",
            content: `确定要转交该审批吗？`,
            hideCancel: false,
            okText: "确认",
            onOk: async () => {
                activeRecord.value = record
                selectRadioModelRef.value.showItem(record);
            },
        });
        return
    }

    if (val === 2 || val === 4) {
        // 拒绝和退回需要填写审批意见
        Modal.confirm({
            title: "提示",
            simple: true,
            renderToBody: false,
            titleAlign: "start",
            content: `${action.content}`,
            hideCancel: false,
            okText: "确认",
            onOk: async () => {
                const params = {
                    instanceId: record.processInstanceId,
                    executionId: record.currentRuntimes[0].executionId,
                }
                try {
                    if (val === 2) {
                        await approveRefuse(params);
                        Message.success('拒绝成功');
                    } else if (val === 4) {
                        await approveBack(params);
                        Message.success('退回成功');
                    }
                    getList();
                    loadAppList();
                } catch (error) {
                    console.error('操作失败:', error);
                }
            },
        });
        return
    }

    // 通过操作
    Modal.confirm({
        title: "提示",
        simple: true,
        renderToBody: false,
        titleAlign: "start",
        content: action.content,
        hideCancel: false,
        okText: "确认",
        onOk: async () => {
            const params = {
                instanceId: record.processInstanceId,
                executionId: record.currentRuntimes[0].executionId,
            }
            try {
                await approvePass(params);
                Message.success('通过成功');
                getList();
                loadAppList();
            } catch (error) {
                console.error('操作失败:', error);
            }
        },
    });
}
const setData = (val) => {
    if (activeRecord.value.currentRuntimes[0].nodeType == 'APPROVE') {
        let params = {
            instanceId: activeRecord.value.processInstanceId,
            userId: val.id,
            executionId: activeRecord.value.currentRuntimes[0].executionId,
            nickname: val.nickname,
        }
        approveAssign(params).then(res => {
            Message.success('转交成功');
            getList();
            loadAppList();
        })
    } else {
        let params = {
            instanceId: activeRecord.value.processInstanceId,
            userId: val.id,
            executionId: activeRecord.value.currentRuntimes[0].executionId,
            nickname: val.nickname,
        }
        inputAssign(params).then(res => {
            Message.success('转交成功');
            getList();
            loadAppList();
        })
    }

}

// 结束流程
const handleEndProcess = (record: any) => {
    Modal.confirm({
        title: "提示",
        simple: true,
        renderToBody: false,
        titleAlign: "start",
        content: `确定要结束任务吗？`,
        hideCancel: false,
        okText: "确认",
        onOk: async () => {
            try {
                await stopProcessCenter(record.processInstanceId);
                Message.success('结束成功');
                getList();
                loadAppList();
            } catch (error) {
                console.error('结束失败:', error);
            }
        },
    });
};

// 查看流程图
const handleViewFlow = (record: any) => {
    // TODO: 打开流程图查看弹窗
    // console.log('查看流程图:', record);
    handleProcessFlow(record)

};

onMounted(() => {
    loadProcessTotal();
    loadAppList();
});
</script>

<style lang="scss">
@use '@/styles/operations-center.scss';
</style>

<style lang="scss" scoped>
.user-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 12px;
    font-weight: 600;
    flex-shrink: 0;
}



.action-divider {
    margin: 4px 0 !important;
}

.action-group-title {
    padding: 8px 16px 4px;
    font-size: 12px;
    color: #86909c;
    font-weight: 500;
}

.item {
    display: flex;

    .cuurent+.cuurent {
        margin-left: 10px;
    }

    .cuurent {
        cursor: pointer;
        display: flex;
        align-items: center;

        .img {
            height: 16px;
            width: 16px;
            margin-right: 4px;

            img {
                height: 16px;
                width: 16px;
            }
        }
    }
}

.icon {
    margin-left: 4px;
}
</style>
