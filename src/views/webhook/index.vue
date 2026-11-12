<template>
    <div class="ops-page webhook-page">
        <userBanner url="/homepage" title="运维中心" active="webHook" />

        <div class="ops-main webhook-main">
            <div class="ops-stat-grid">
                <div class="ops-stat-card ops-stat-card--blue">
                    <div class="ops-stat-card__body">
                        <div class="stat-label">今日推送总量</div>
                        <div class="stat-number">{{ formatStatNumber(statSummary.total) }}</div>
                    </div>
                    <div class="stat-icon" style="background:#eff6ff;color:rgb(var(--primary-6));"><i
                            class="fas fa-paper-plane"></i></div>
                </div>
                <div class="ops-stat-card ops-stat-card--green">
                    <div class="ops-stat-card__body">
                        <div class="stat-label">成功率</div>
                        <div class="stat-number">{{ statSummary.successRate }}</div>
                    </div>
                    <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
                </div>
                <div class="ops-stat-card ops-stat-card--red">
                    <div class="ops-stat-card__body">
                        <div class="stat-label">失败待重试</div>
                        <div class="stat-number">{{ statSummary.failRetry }}</div>
                    </div>
                    <div class="stat-icon"><i class="fas fa-redo-alt"></i></div>
                </div>
                <div class="ops-stat-card ops-stat-card--purple">
                    <div class="ops-stat-card__body">
                        <div class="stat-label">平均响应时间</div>
                        <div class="stat-number">{{ statSummary.avgTime }}</div>
                    </div>
                    <div class="stat-icon"><i class="fas fa-tachometer-alt"></i></div>
                </div>
            </div>

            <div class="ops-card webhook-card">
                <div class="ops-card-header webhook-card__header">
                    <h3 class="ops-card-title webhook-card__title">
                        Webhook推送日志
                        <span class="ops-card-hint webhook-card__hint">仅保留30天的推送日志</span>
                    </h3>
                    <div class="ops-card-header-right ops-filter-bar filter-bar">
                        <a-select v-model="selectedAppId" class="rounded-input"
                            :style="{ width: '140px', borderRadius: '12px' }" placeholder="按应用名称" allow-clear
                            @change="handleSearch">
                            <a-option v-for="item in filteredAppList" :key="item.id" :value="item.id"
                                :label="item.appName" />
                        </a-select>
                        <a-select v-model="filterData.developerId" class="rounded-input"
                            :style="{ width: '120px', borderRadius: '12px' }" placeholder="开发者" allow-clear
                            :options="developeroptions" @change="handleSearch" />
                        <a-select v-model="filterData.pushEvent" class="rounded-input"
                            :style="{ width: '120px', borderRadius: '12px' }" placeholder="事件类型" allow-clear
                            :options="eventOptions" @change="handleSearch" />
                        <a-select v-model="filterData.pushStatus" class="rounded-input"
                            :style="{ width: '120px', borderRadius: '12px' }" placeholder="全部状态" allow-clear
                            @change="handleSearch">
                            <a-option :value="1">成功</a-option>
                            <a-option :value="0">失败</a-option>
                            <a-option :value="2">重试中</a-option>
                        </a-select>
                        <button type="button" class="ops-btn-primary-sm btn-primary-sm" @click="handleRefresh">
                            <icon-refresh />
                            刷新
                        </button>
                    </div>
                </div>

                <div class="ops-card-body webhook-card__body">
                    <webhookLog ref="webhookLogRef" :filter-data="filterData" :selected-app-id="selectedAppId"
                        :app-name-map="appNameMap" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import webhookLog from './webhookLog.vue';
import {
    webhooklogApplist,
    developerSelect,
    webhooklogStatistics,
} from '@/api/webHook/index';
import {
    IconSearch,
    IconRefresh,
    IconSend,
    IconBarChart,
    IconClockCircle,
} from '@arco-design/web-vue/es/icon';

const filterData = reactive<{
    developerId?: string | number;
    pushEvent?: number;
    pushStatus?: number;
}>({
    developerId: undefined,
    pushEvent: undefined,
    pushStatus: undefined,
});


const webhookLogRef = ref<InstanceType<typeof webhookLog>>();
const developeroptions = ref<{ label: string; value: string | number }[]>([]);

const eventOptions = [
    { label: '数据新增', value: 1 },
    { label: '数据修改', value: 2 },
    { label: '数据删除', value: 3 },
    { label: '流程发起', value: 4 },
    { label: '流程完结', value: 5 },
    { label: '节点审批', value: 6 },
    { label: '节点填写', value: 7 },
    { label: '节点抄送', value: 8 },
];

const searchKeyword = ref('');
const selectedAppId = ref<string | number | undefined>();
const appList = ref<any[]>([]);

const statSummary = reactive({
    total: 0,
    successRate: '--',
    failRetry: 0,
    avgTime: '--',
});

const formatStatNumber = (n: number) => n.toLocaleString('zh-CN');

const formatSuccessRate = (rate?: number | null) => {
    if (rate == null || Number.isNaN(Number(rate))) return '--';
    const n = Number(rate);
    const pct = n <= 1 ? n * 100 : n;
    return `${pct.toFixed(1)}%`;
};

const formatAvgResponseTime = (ms?: number | null) => {
    if (ms == null || Number.isNaN(Number(ms))) return '--';
    return `${Math.round(Number(ms))}ms`;
};

const buildStatParams = () => {
    const params: Record<string, any> = {};
    if (selectedAppId.value != null && selectedAppId.value !== '') {
        params.appIds = selectedAppId.value;
    }
    if (filterData.developerId != null && filterData.developerId !== '') {
        params.developerId = filterData.developerId;
    }
    if (filterData.pushEvent != null && filterData.pushEvent !== '') {
        params.pushEvent = filterData.pushEvent;
    }
    if (filterData.pushStatus !== undefined && filterData.pushStatus !== '') {
        params.pushStatus = filterData.pushStatus;
    }
    return params;
};

const loadStatistics = async () => {
    try {
        const data = await webhooklogStatistics(buildStatParams());
        statSummary.total = data?.todayPushTotal ?? 0;
        statSummary.successRate = formatSuccessRate(data?.successRate);
        statSummary.failRetry = data?.waitRetryCount ?? 0;
        statSummary.avgTime = formatAvgResponseTime(data?.avgResponseTime);
    } catch {
        statSummary.total = 0;
        statSummary.successRate = '--';
        statSummary.failRetry = 0;
        statSummary.avgTime = '--';
    }
};

const filteredAppList = computed(() => {
    if (!searchKeyword.value.trim()) return appList.value;
    const kw = searchKeyword.value.trim().toLowerCase();
    return appList.value.filter((item) =>
        (item.appName || '').toLowerCase().includes(kw),
    );
});

const appNameMap = computed(() => {
    const map: Record<string, string> = {};
    appList.value.forEach((item) => {
        map[String(item.id)] = item.appName;
    });
    return map;
});

const handleSearch = () => {
    loadStatistics();
    setTimeout(() => webhookLogRef.value?.handleSearch(), 0);
};

const handleRefresh = () => {
    loadAppList();
    loadStatistics();
    setTimeout(() => webhookLogRef.value?.handleSearch(), 0);
};

const handleAppSearch = () => {
    if (
        selectedAppId.value &&
        !filteredAppList.value.some((item) => item.id === selectedAppId.value)
    ) {
        selectedAppId.value = undefined;
    }
    handleSearch();
};

const loadAppList = () => {
    webhooklogApplist({}).then((res) => {
        appList.value = res || [];
    });
};

const loadDevelopers = () => {
    developerSelect().then((res: any) => {
        developeroptions.value = (res || []).map((record: any) => ({
            label: record.developer,
            value: record.id,
        }));
    });
};

onMounted(() => {
    loadAppList();
    loadDevelopers();
    loadStatistics();
    setTimeout(() => webhookLogRef.value?.handleSearch(), 0);
});
</script>

<style lang="scss">
@use '@/styles/operations-center.scss';
</style>
