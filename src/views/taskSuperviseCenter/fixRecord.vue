<template>
    <div class="app">
        <base-modal ref="modalRef" :showBtn="false" @handle-cancel="handleCancel" body-style="overflow: visible;">
            <div class="fix-record-container">
                <!-- 顶部标签页和搜索区 -->
                <div class="header-section">
                    <div class="tabs">
                        <button :class="['tab-btn', { active: activeTab === 'pending' }]" @click="setActiveTab('pending')">
                            待处理
                        </button>
                        <button :class="['tab-btn', { active: activeTab === 'processed' }]"
                            @click="setActiveTab('processed')">
                            已处理
                        </button>
                    </div>
                    <div class="search-box">
                        <a-input v-model="searchForm.corrector" placeholder="纠错人" allow-clear
                            style="width: 150px; margin-right: 10px;" />
                        <a-date-picker v-model="searchForm.applyDate" placeholder="提交日期"
                            style="width: 150px;margin-right: 10px;" />
                        <a-date-picker v-model="searchForm.fixDate" placeholder="纠错日期" v-if="activeTab === 'processed'"
                            style="width: 150px;margin-right: 10px;" />
                        <a-select placeholder="请选择所属纬度" allow-clear v-if="activeTab === 'processed'"
                            v-model="searchForm.formCode" style="width: 150px;" :options="District"></a-select>
                    </div>
                </div>

                <!-- 表格区域 -->
                <div class="table-section">
                    <a-table :columns="columns" :data="tableData" :pagination="pagination" :loading="loading"
                        row-key="id" @page-change="onPageChange" @page-size-change="onPageSizeChange">
                        <template #index="{ rowIndex }">
                            {{ rowIndex + 1 }}
                        </template>
                        <template #corrector="{ record }">
                            {{ record.username }}
                        </template>
                        <template #submitTime="{ record }">
                            {{ record.applyTime }}
                        </template>
                        <template #action="{ record }">
                            <a-button type="text" size="mini" @click="handleView(record)">
                                查看
                            </a-button>
                        </template>
                        <template #states="{ record }">
                            <div :class="record.states == 1 ? 'green' : record.states == 2 ? 'red' : 'yellow'">{{
                                record.states == 1 ? '采用' : record.states == 2 ? '不采用' : '处理中' }}</div>
                        </template>
                    </a-table>
                </div>
            </div>
        </base-modal>

        <!-- 纠错处理抽屉 -->
        <fixHandleDrawer v-model:visible="drawerVisible" :data="drawerData" @adopt="handleAdopt"
            @reject="handleReject" />
    </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue";
import { fixRecordPage, fixAudit } from '@/api/taskFillManager/index'
import fixHandleDrawer from './fixHandleDrawer.vue'
import { getFormById } from "@/utils/form.ts";
import { Message } from "@arco-design/web-vue";

const modalRef = ref();
const loading = ref(false);
const District = ref([])
const activeTab = ref<'pending' | 'processed'>('pending');

// 抽屉相关
const drawerVisible = ref(false);
const drawerData = ref<any[]>([]);

// 搜索表单
const searchForm = reactive({
    corrector: '',
    fixDate: '',
    formCode: '',
    applyDate: '',
});
const setActiveTab = (val: any) => {
    activeTab.value = val
    searchForm.corrector = '';
    searchForm.fixDate = '';
    searchForm.formCode = '';
    searchForm.applyDate = '';
}
// 表格列配置
const columns = ref([
    { title: '序号', slotName: 'index', width: 80 },
    { title: '纠错人', slotName: 'corrector', dataIndex: 'corrector', width: 120 },
    { title: '提交时间', slotName: 'submitTimes', dataIndex: 'applyTime' },
    {
        title: '管理',
        slotName: 'action',
        align: 'center',
        width: 100
    },
])

// 表格数据
const tableData = ref<any[]>([]);

// 分页配置
const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    batchId: '',
    appId: '',
    showTotal: true,
    showPageSize: true,
});
const formConfig = ref<any>({})
const emits = defineEmits(["init"]);

const showItem = (activeBatch: any) => {
    console.log(activeBatch)
    pagination.batchId = activeBatch.batchId;
    pagination.appId = activeBatch.appId;
    modalRef.value.handleClick({
        title: "纠错记录",
        showBtn: false,
        width: "900px",
    });
    formConfig.value = getFormById(activeBatch.appId)
    console.log(formConfig.value)
    District.value = [{ value: formConfig.value.id, label: formConfig.value.name }]

    getList()
};

// 获取列表数据
const getList = async () => {
    loading.value = true;
    try {
        const params = {
            page: pagination.current,
            pageSize: pagination.pageSize,
            batchId: pagination.batchId,
            status: activeTab.value === 'pending' ? 0 : 1,
            fixDate: searchForm.fixDate,
        };

        const res = await fixRecordPage(params);
        tableData.value = res.records || [];
        pagination.total = res?.total || 0;
    } catch (error) {
        console.error('获取纠错记录失败:', error);
    } finally {
        loading.value = false;
    }
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
const activeRecord = ref({})
// 查看详情
const handleView = (record: any) => {
    let datas = record.fixDataList
    activeRecord.value = record
    
    // 为每个字段添加 label，并根据字段类型格式化显示值
    datas.map(v => {
        if (formConfig.value && formConfig.value.formList) {
            formConfig.value.formList.map(v1 => {
                if (v1.id == v.fieldCode) {
                    v.label = v1.title
                    
                    // 根据字段类型格式化 oldValue 和 newValue
                    v.oldValue = formatFieldValue(v.oldValue, v1)
                    v.newValue = formatFieldValue(v.newValue, v1)
                }
            })
        }
    })
    
    console.log('查看详情:', record);
    // 打开抽屉，传入记录数据
    drawerData.value = datas || [];
    drawerVisible.value = true;
};

// 格式化字段值，参考 form.ts 中的 setUpDateData 方法
const formatFieldValue = (value: any, fieldConfig: any) => {
    if (value === null || value === undefined || value === '') {
        return '-'
    }
    
    const fieldType = fieldConfig.type
    const component = fieldConfig.component
    
    // 用户选择
    if (fieldType == 'USER' && value) {
        if (Array.isArray(value)) {
            return value.map(v => v.nickname || v.name || v).join('、')
        }
        return value.nickname || value.name || value
    }
    
    // 部门选择
    if (fieldType == 'DEPT' && value) {
        if (Array.isArray(value)) {
            return value.map(v => v.deptName || v.label || v).join('、')
        }
        return value.deptName || value.label || value
    }
    
    // 多选用户
    if (fieldType == 'USER_MULTIPLE' && Array.isArray(value) && value.length > 0) {
        return value.map(v => v.nickname || v.name || v).join('、')
    }
    
    // 多选部门
    if (fieldType == 'DEPT_MULTIPLE' && Array.isArray(value) && value.length > 0) {
        return value.map(v => v.deptName || v.label || v).join('、')
    }
    
    // 日期
    if (fieldType == 'DATE' && value) {
        return value
    }
    
    // 日期区间
    if (fieldType == 'DATE_INTERVAL' && value) {
        if (typeof value === 'object' && value.start && value.end) {
            return `${value.start} ~ ${value.end}`
        }
        return value
    }
    
    // 时间
    if (fieldType == 'TIME' && value) {
        return value
    }
    
    // 时间区间
    if (fieldType == 'TIME_INTERVAL' && value) {
        if (typeof value === 'object' && value.start && value.end) {
            return `${value.start} ~ ${value.end}`
        }
        return value
    }
    
    // 复选框/多选下拉
    if ((fieldType == 'CHECKBOX' || fieldType == 'SELECT_MULTIPLE') && value) {
        if (Array.isArray(value)) {
            // 从 options 中查找对应的 label
            const options = fieldConfig.props?.options || []
            return value.map(v => {
                const opt = options.find(o => o.value === v)
                return opt ? opt.label : v
            }).join('、')
        }
        return value
    }
      // 单选框/下拉
    if ((fieldType == 'RADIO' || fieldType == 'SELECT') && value) {
        // 从 options 中查找对应的 label
        const options = fieldConfig.props?.options || []
        const opt = options.find(o => o.value === value)
        return opt ? opt.label : value
    }
    // 关联数据
    if (fieldType == 'RELATION_DATA' && value) {
        if (Array.isArray(value)) {
            return value.map(v => v.name || v.title || v.label || v).join('、')
        }
        return value.name || value.title || value.label || value
    }
    
    // 数字
    if (component == 'qInputNumber' && value) {
        return Number(value)
    }
    
    // 默认返回
    return value
}

// 采用
const handleAdopt = (data: any[]) => {
    fixAuditData(1)
};

// 不采用
const handleReject = (data: any[]) => {
    fixAuditData(2)
    // TODO: 调用不采用接口

};
const fixAuditData = (states: any) => {
    let params = {
        id: activeRecord.value.id,
        states: states,
    }
    fixAudit(params).then(res => {
        if (states == 1) {
            Message.success('采用成功');
        } else {
            Message.success('不采用成功');
        }
        getList();
    })
}

// 监听标签页变化
watch(() => activeTab.value, () => {
    if (activeTab.value === 'pending') {
        columns.value = [
            { title: '序号', slotName: 'index', width: 80 },
            { title: '纠错人', slotName: 'corrector', dataIndex: 'corrector', width: 120 },
            { title: '提交时间', slotName: 'submitTimes', dataIndex: 'applyTime' },
            {
                title: '管理',
                slotName: 'action',
                align: 'center',
                width: 100
            },
        ]
    } else {
        columns.value = [
            { title: '序号', slotName: 'index', width: 80 },
            { title: '纠错人', slotName: 'corrector', dataIndex: 'corrector', width: 120 },
            { title: '提交时间', slotName: 'submitTimes', dataIndex: 'applyTime' },
            { title: '纠错时间', dataIndex: 'fixTime' },
            {
                title: '处理结果',
                slotName: 'states',
                width: 100
            },
        ]
    }
    pagination.current = 1;
    getList();
});

const handleCancel = () => {
    setActiveTab('pending')
};

defineExpose({
    showItem,
});
</script>
<style lang="scss" scoped>
.app {
    display: inline-block;
    position: relative;
}

.fix-record-container {
    padding: 10px;
}

.header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .tabs {
        display: flex;
        gap: 0;

        .tab-btn {
            padding: 8px 20px;
            border: 1px solid #e5e6eb;
            background: #fff;
            cursor: pointer;
            font-size: 14px;
            color: #4e5969;
            transition: all 0.3s;

            &:first-child {
                border-radius: 4px 0 0 4px;
            }

            &:last-child {
                border-radius: 0 4px 4px 0;
            }

            &:hover {
                color: #165dff;
            }

            &.active {
                background: #165dff;
                color: #fff;
                border-color: #165dff;
            }
        }
    }

    .search-box {
        display: flex;
        align-items: center;
    }
}

.table-section {
    :deep(.arco-table) {
        font-size: 14px;

        .arco-table-th {
            background-color: #f7f8fa;
            color: #1d2129;
            font-weight: 600;
        }


    }
}

.green {
    color: #00B42A;
}

.red {
    color: #F53F3F;
}

.yellow {
    color: #FF7D00;
}
</style>
